package repository

import (
	"fmt"
	"strings"
	"time"

	"things-expired/internal/model"
	"things-expired/internal/model/dto"

	"gorm.io/gorm"
)

// ItemQueryBuilder 物品查询构建器 - 实现高内聚低耦合的查询条件拼接
type ItemQueryBuilder struct {
	db       *gorm.DB
	userID   uint
	req      *dto.ItemListRequest
	buildErr error
}

// NewItemQueryBuilder 创建查询构建器
func NewItemQueryBuilder(db *gorm.DB, userID uint, req *dto.ItemListRequest) *ItemQueryBuilder {
	return &ItemQueryBuilder{
		db:     db,
		userID: userID,
		req:    req,
	}
}

// Build 构建查询并返回结果
func (b *ItemQueryBuilder) Build() ([]*model.Item, int64, error) {
	if b.buildErr != nil {
		return nil, 0, b.buildErr
	}

	query := b.db.WithContext(b.db.Statement.Context).Model(&model.Item{})

	// 基础条件：用户ID（必选）
	query = query.Where("user_id = ?", b.userID)

	// 构建可选筛选条件
	query = b.buildConditions(query)

	// 统计总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页
	offset := (b.req.GetPage() - 1) * b.req.GetPageSize()
	query = query.Offset(offset).Limit(b.req.GetPageSize())

	// 排序
	orderClause := b.buildOrderClause()
	if orderClause != "" {
		query = query.Order(orderClause)
	} else {
		query = query.Order("expired_at ASC, created_at DESC")
	}

	// 执行查询
	var items []*model.Item
	if err := query.Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

// buildConditions 构建筛选条件
func (b *ItemQueryBuilder) buildConditions(query *gorm.DB) *gorm.DB {
	// 分类ID筛选
	if b.req.CategoryID > 0 {
		query = query.Where("category_id = ?", b.req.CategoryID)
	}

	// 名称模糊搜索
	if b.req.Name != "" {
		query = query.Where("name LIKE ?", "%"+b.req.Name+"%")
	}

	// 描述模糊搜索
	if b.req.Desc != "" {
		query = query.Where("description LIKE ?", "%"+b.req.Desc+"%")
	}

	// 单位精确匹配
	if b.req.Unit != "" {
		query = query.Where("unit = ?", b.req.Unit)
	}

	// 状态筛选 (0 表示全部，不筛选)
	if b.req.Status > 0 {
		query = query.Where("status = ?", b.req.Status)
	}

	// 数量范围筛选
	query = b.buildQuantityCondition(query)

	// 提醒天数范围筛选
	query = b.buildRemindDaysCondition(query)

	// 过期时间范围筛选
	query = b.buildExpiredAtCondition(query)

	// 创建时间范围筛选
	query = b.buildCreatedAtCondition(query)

	return query
}

// buildQuantityCondition 构建数量范围条件
func (b *ItemQueryBuilder) buildQuantityCondition(query *gorm.DB) *gorm.DB {
	hasMin := b.req.QuantityMin > 0
	hasMax := b.req.QuantityMax > 0

	if hasMin && hasMax {
		query = query.Where("quantity BETWEEN ? AND ?", b.req.QuantityMin, b.req.QuantityMax)
	} else if hasMin {
		query = query.Where("quantity >= ?", b.req.QuantityMin)
	} else if hasMax {
		query = query.Where("quantity <= ?", b.req.QuantityMax)
	}

	return query
}

// buildRemindDaysCondition 构建提醒天数范围条件
func (b *ItemQueryBuilder) buildRemindDaysCondition(query *gorm.DB) *gorm.DB {
	hasMin := b.req.RemindDaysMin > 0
	hasMax := b.req.RemindDaysMax > 0

	if hasMin && hasMax {
		query = query.Where("remind_days BETWEEN ? AND ?", b.req.RemindDaysMin, b.req.RemindDaysMax)
	} else if hasMin {
		query = query.Where("remind_days >= ?", b.req.RemindDaysMin)
	} else if hasMax {
		query = query.Where("remind_days <= ?", b.req.RemindDaysMax)
	}

	return query
}

// buildExpiredAtCondition 构建过期时间范围条件
func (b *ItemQueryBuilder) buildExpiredAtCondition(query *gorm.DB) *gorm.DB {
	if b.req.ExpiredAtFrom != "" {
		from, err := time.Parse("2006-01-02", b.req.ExpiredAtFrom)
		if err != nil {
			b.buildErr = fmt.Errorf("invalid expired_at_from format: %w", err)
			return query
		}
		// 从当天开始（包含当天）
		query = query.Where("expired_at >= ?", from)
	}

	if b.req.ExpiredAtTo != "" {
		to, err := time.Parse("2006-01-02", b.req.ExpiredAtTo)
		if err != nil {
			b.buildErr = fmt.Errorf("invalid expired_at_to format: %w", err)
			return query
		}
		// 到当天结束（包含当天）
		to = to.Add(24*time.Hour - time.Second)
		query = query.Where("expired_at <= ?", to)
	}

	return query
}

// buildCreatedAtCondition 构建创建时间范围条件
func (b *ItemQueryBuilder) buildCreatedAtCondition(query *gorm.DB) *gorm.DB {
	if b.req.CreatedAtFrom != "" {
		from, err := time.Parse("2006-01-02", b.req.CreatedAtFrom)
		if err != nil {
			b.buildErr = fmt.Errorf("invalid created_at_from format: %w", err)
			return query
		}
		// 从当天开始（包含当天）
		query = query.Where("created_at >= ?", from)
	}

	if b.req.CreatedAtTo != "" {
		to, err := time.Parse("2006-01-02", b.req.CreatedAtTo)
		if err != nil {
			b.buildErr = fmt.Errorf("invalid created_at_to format: %w", err)
			return query
		}
		// 到当天结束（包含当天）
		to = to.Add(24*time.Hour - time.Second)
		query = query.Where("created_at <= ?", to)
	}

	return query
}

// buildOrderClause 构建排序子句
func (b *ItemQueryBuilder) buildOrderClause() string {
	orderBy := b.req.GetOrderBy()
	order := b.req.GetOrder()

	// 安全处理：只允许特定的排序字段
	allowedOrderBy := map[string]bool{
		"created_at": true,
		"updated_at": true,
		"expired_at": true,
		"name":       true,
		"quantity":   true,
	}

	if !allowedOrderBy[orderBy] {
		return ""
	}

	// 安全处理：只允许特定的排序方向
	order = strings.ToUpper(order)
	if order != "ASC" && order != "DESC" {
		order = "ASC"
	}

	return fmt.Sprintf("%s %s", orderBy, order)
}