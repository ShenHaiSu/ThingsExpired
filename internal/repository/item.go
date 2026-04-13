package repository

import (
	"context"
	"time"

	"things-expired/internal/model"
	"gorm.io/gorm"
)

// IItemRepository 物品仓储接口
type IItemRepository interface {
	Create(ctx context.Context, item *model.Item) error
	GetByID(ctx context.Context, id uint) (*model.Item, error)
	List(ctx context.Context, userID uint, categoryID uint, page, pageSize int) ([]*model.Item, int64, error)
	GetExpiring(ctx context.Context, userID uint, days int) ([]*model.Item, error)
	Update(ctx context.Context, item *model.Item) error
	Delete(ctx context.Context, id uint) error
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

func (r *ItemRepository) List(ctx context.Context, userID uint, categoryID uint, page, pageSize int) ([]*model.Item, int64, error) {
	var items []*model.Item
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Item{}).Where("user_id = ?", userID)

	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("expired_at ASC, created_at DESC").Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *ItemRepository) GetExpiring(ctx context.Context, userID uint, days int) ([]*model.Item, error) {
	var items []*model.Item
	now := time.Now()
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
