package repository

import (
	"context"

	"things-expired/internal/model"
	"things-expired/internal/model/dto"
	"things-expired/pkg/utils"

	"gorm.io/gorm"
)

// IItemRepository 物品仓储接口
type IItemRepository interface {
	Create(ctx context.Context, item *model.Item) error
	GetByID(ctx context.Context, id uint) (*model.Item, error)
	List(ctx context.Context, userID uint, req *dto.ItemListRequest) ([]*model.Item, int64, error)
	GetExpiring(ctx context.Context, userID uint, days int) ([]*model.Item, error)
	GetStats(ctx context.Context, userID uint) (total, expiringSoon, expired, used int64, err error)
	Update(ctx context.Context, item *model.Item) error
	Delete(ctx context.Context, id uint) error
	MarkUsed(ctx context.Context, id uint) error // 标记物品已消耗

	// 过期检查相关方法
	GetExpiredItems(ctx context.Context, limit int) ([]*model.Item, error)  // 获取已过期但状态仍为正常的物品
	BatchUpdateStatus(ctx context.Context, ids []uint, status int8) error   // 批量更新状态
}

// ItemRepository 物品仓储实现
type ItemRepository struct {
	db *gorm.DB
}

// NewItemRepository 创建物品仓储
func NewItemRepository(db *gorm.DB) IItemRepository {
	return &ItemRepository{db: db}
}

func (r *ItemRepository) Create(ctx context.Context, item *model.Item) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *ItemRepository) GetByID(ctx context.Context, id uint) (*model.Item, error) {
	var item model.Item
	if err := r.db.WithContext(ctx).First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *ItemRepository) List(ctx context.Context, userID uint, req *dto.ItemListRequest) ([]*model.Item, int64, error) {
	builder := NewItemQueryBuilder(r.db, userID, req)
	return builder.Build()
}

func (r *ItemRepository) GetExpiring(ctx context.Context, userID uint, days int) ([]*model.Item, error) {
	var items []*model.Item
	now := utils.NowUTC()
	expirationThreshold := now.AddDate(0, 0, days)

	query := r.db.WithContext(ctx).Model(&model.Item{}).
		Where("user_id = ?", userID).
		Where("status = ?", 1). // 只查询正常的物品
		Where("expired_at <= ?", expirationThreshold).
		Where("expired_at >= ?", now) // 已过期的物品不包含在内

	if err := query.Order("expired_at ASC").Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (r *ItemRepository) Update(ctx context.Context, item *model.Item) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *ItemRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&model.Item{}, id).Error
}

// GetStats 获取物品统计数据
// 统计逻辑：
// - total: 所有物品（status = 1, 2, 3）
// - expiring_soon: expired_at <= 当前时间 + 7天 且 status = 1（正常）
// - expired: expired_at < 当前时间 且 status = 2（已过期）
// - used: status = 3（已消耗）
func (r *ItemRepository) GetStats(ctx context.Context, userID uint) (total, expiringSoon, expired, used int64, err error) {
	now := utils.NowUTC()
	sevenDaysLater := now.AddDate(0, 0, 7)

	db := r.db.WithContext(ctx).Model(&model.Item{}).Where("user_id = ?", userID)

	// total: 所有物品
	if err := db.Count(&total).Error; err != nil {
		return 0, 0, 0, 0, err
	}

	// expiring_soon: 距离过期≤7天且状态为正常
	if err := r.db.WithContext(ctx).Model(&model.Item{}).
		Where("user_id = ?", userID).
		Where("status = ?", 1).
		Where("expired_at <= ?", sevenDaysLater).
		Where("expired_at >= ?", now).
		Count(&expiringSoon).Error; err != nil {
		return 0, 0, 0, 0, err
	}

	// expired: 已过期（expired_at < 当前时间 且 status = 2）
	if err := r.db.WithContext(ctx).Model(&model.Item{}).
		Where("user_id = ?", userID).
		Where("status = ?", 2).
		Where("expired_at < ?", now).
		Count(&expired).Error; err != nil {
		return 0, 0, 0, 0, err
	}

	// used: 已消耗（status = 3）
	if err := r.db.WithContext(ctx).Model(&model.Item{}).
		Where("user_id = ?", userID).
		Where("status = ?", 3).
		Count(&used).Error; err != nil {
		return 0, 0, 0, 0, err
	}

	return total, expiringSoon, expired, used, nil
}

// GetExpiredItems 获取已过期但状态仍为正常的物品
// 用于后台定时任务检查
func (r *ItemRepository) GetExpiredItems(ctx context.Context, limit int) ([]*model.Item, error) {
	var items []*model.Item
	now := utils.NowUTC()

	err := r.db.WithContext(ctx).
		Model(&model.Item{}).
		Where("status = ?", 1).       // 状态为正常
		Where("expired_at < ?", now).  // 已过期
		Limit(limit).                  // 限制数量，防止一次性处理过多
		Find(&items).Error

	if err != nil {
		return nil, err
	}

	return items, nil
}

// BatchUpdateStatus 批量更新物品状态
func (r *ItemRepository) BatchUpdateStatus(ctx context.Context, ids []uint, status int8) error {
	if len(ids) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).
		Model(&model.Item{}).
		Where("id IN ?", ids).
		Update("status", status).Error
}

// MarkUsed 标记物品已消耗（状态更新为3）
func (r *ItemRepository) MarkUsed(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&model.Item{}).
		Where("id = ?", id).
		Update("status", 3).Error
}
