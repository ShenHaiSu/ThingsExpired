package service

import (
	"context"

	"things-expired/internal/model"
	"things-expired/internal/model/dto"
	"things-expired/internal/model/vo"
	"things-expired/internal/repository"
	"things-expired/pkg/errors"
	"things-expired/pkg/utils"
)

// ICategoryService 分类服务接口
type ICategoryService interface {
	Create(ctx context.Context, userID uint, req *dto.CreateCategoryRequest) (*vo.CategoryVO, error)
	List(ctx context.Context, userID uint, page, pageSize int) (*vo.CategoryListVO, error)
	Update(ctx context.Context, userID uint, req *dto.UpdateCategoryRequest) (*vo.CategoryVO, error)
	Delete(ctx context.Context, userID uint, categoryID uint) error
}

// CategoryService 分类服务实现
type CategoryService struct {
	categoryRepo repository.ICategoryRepository
}

// NewCategoryService 创建分类服务
func NewCategoryService(categoryRepo repository.ICategoryRepository) ICategoryService {
	return &CategoryService{categoryRepo: categoryRepo}
}

func (s *CategoryService) Create(ctx context.Context, userID uint, req *dto.CreateCategoryRequest) (*vo.CategoryVO, error) {
	category := &model.Category{
		UserID:    userID,
		Name:      req.Name,
		Color:     req.Color,
		Icon:      req.Icon,
		SortOrder: req.SortOrder,
	}

	if category.Color == "" {
		category.Color = "#000000"
	}

	if err := s.categoryRepo.Create(ctx, category); err != nil {
		return nil, err
	}

	return s.toVO(category), nil
}

func (s *CategoryService) List(ctx context.Context, userID uint, page, pageSize int) (*vo.CategoryListVO, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	categories, total, err := s.categoryRepo.List(ctx, userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	list := make([]vo.CategoryVO, 0, len(categories))
	for _, c := range categories {
		list = append(list, *s.toVO(c))
	}

	return &vo.CategoryListVO{
		List:  list,
		Total: total,
	}, nil
}

func (s *CategoryService) Update(ctx context.Context, userID uint, req *dto.UpdateCategoryRequest) (*vo.CategoryVO, error) {
	category, err := s.categoryRepo.GetByID(ctx, req.CategoryID)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, errors.New(errors.CodeParamInvalid, "分类不存在")
	}

	// 检查权限
	if category.UserID != userID {
		return nil, errors.New(errors.CodeForbidden, "无权限操作此分类")
	}

	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Color != "" {
		category.Color = req.Color
	}
	if req.Icon != "" {
		category.Icon = req.Icon
	}
	category.SortOrder = req.SortOrder

	if err := s.categoryRepo.Update(ctx, category); err != nil {
		return nil, err
	}

	return s.toVO(category), nil
}

func (s *CategoryService) Delete(ctx context.Context, userID uint, categoryID uint) error {
	category, err := s.categoryRepo.GetByID(ctx, categoryID)
	if err != nil {
		return err
	}
	if category == nil {
		return errors.New(errors.CodeParamInvalid, "分类不存在")
	}

	// 检查权限
	if category.UserID != userID {
		return errors.New(errors.CodeForbidden, "无权限操作此分类")
	}

	return s.categoryRepo.Delete(ctx, categoryID)
}

func (s *CategoryService) toVO(category *model.Category) *vo.CategoryVO {
	return &vo.CategoryVO{
		CategoryID: category.ID,
		UserID:     category.UserID,
		Name:       category.Name,
		Color:      category.Color,
		Icon:       category.Icon,
		SortOrder:  category.SortOrder,
		CreatedAt:  utils.FormatTimeUTC(category.CreatedAt),
	}
}
