package repository

import (
	"context"

	"things-expired/internal/model"
	"gorm.io/gorm"
)

// ICategoryRepository 分类仓储接口
type ICategoryRepository interface {
	Create(ctx context.Context, category *model.Category) error
	GetByID(ctx context.Context, id uint) (*model.Category, error)
	GetByUserIDAndName(ctx context.Context, userID uint, name string) (*model.Category, error)
	List(ctx context.Context, userID uint, page, pageSize int) ([]*model.Category, int64, error)
	Update(ctx context.Context, category *model.Category) error
	Delete(ctx context.Context, id uint) error
}

// CategoryRepository 分类仓储实现
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository 创建分类仓储
func NewCategoryRepository(db *gorm.DB) ICategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, category *model.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *CategoryRepository) GetByID(ctx context.Context, id uint) (*model.Category, error) {
	var category model.Category
	if err := r.db.WithContext(ctx).First(&category, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) GetByUserIDAndName(ctx context.Context, userID uint, name string) (*model.Category, error) {
	var category model.Category
	if err := r.db.WithContext(ctx).Where("user_id = ? AND name = ?", userID, name).First(&category).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) List(ctx context.Context, userID uint, page, pageSize int) ([]*model.Category, int64, error) {
	var categories []*model.Category
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Category{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("sort_order ASC, created_at DESC").Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

func (r *CategoryRepository) Update(ctx context.Context, category *model.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *CategoryRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&model.Category{}, id).Error
}
