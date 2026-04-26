package service

import (
	"context"
	"time"

	"things-expired/internal/model"
	"things-expired/internal/model/dto"
	"things-expired/internal/model/vo"
	"things-expired/internal/repository"
	"things-expired/pkg/errors"
)

// IItemService 物品服务接口
type IItemService interface {
	Create(ctx context.Context, userID uint, req *dto.CreateItemRequest) (*vo.ItemVO, error)
	List(ctx context.Context, userID uint, req *dto.ItemListRequest) (*vo.ItemListVO, error)
	Detail(ctx context.Context, userID uint, itemID uint) (*vo.ItemVO, error)
	Update(ctx context.Context, userID uint, req *dto.UpdateItemRequest) (*vo.ItemVO, error)
	Delete(ctx context.Context, userID uint, itemID uint) error
	GetExpiringItems(ctx context.Context, userID uint, days int) ([]vo.ExpiringItemVO, error)
	GetStats(ctx context.Context, userID uint) (*vo.ItemStatsVO, error)
}

// ItemService 物品服务实现
type ItemService struct {
	itemRepo  repository.IItemRepository
	validator *ItemRequestValidator
}

// NewItemService 创建物品服务
func NewItemService(itemRepo repository.IItemRepository) IItemService {
	return &ItemService{
		itemRepo:  itemRepo,
		validator: NewItemRequestValidator(),
	}
}

func (s *ItemService) Create(ctx context.Context, userID uint, req *dto.CreateItemRequest) (*vo.ItemVO, error) {
	item := &model.Item{
		UserID:      userID,
		CategoryID:  req.CategoryID,
		Name:        req.Name,
		Description: req.Desc,
		Quantity:    req.Quantity,
		Unit:        req.Unit,
		ExpiredAt:   req.ExpiredAt,
		RemindDays:  req.RemindDays,
		Status:      1,
	}

	if item.Quantity <= 0 {
		item.Quantity = 1
	}
	if item.RemindDays <= 0 {
		item.RemindDays = 3
	}

	if err := s.itemRepo.Create(ctx, item); err != nil {
		return nil, err
	}

	return s.toVO(item), nil
}

func (s *ItemService) List(ctx context.Context, userID uint, req *dto.ItemListRequest) (*vo.ItemListVO, error) {
	// 验证可选条件
	if err := s.validator.ValidateItemListRequest(req); err != nil {
		return nil, err
	}

	items, total, err := s.itemRepo.List(ctx, userID, req)
	if err != nil {
		return nil, err
	}

	list := make([]vo.ItemVO, 0, len(items))
	for _, item := range items {
		list = append(list, *s.toVO(item))
	}

	return &vo.ItemListVO{
		List:  list,
		Total: total,
		Page:  req.GetPage(),
	}, nil
}

func (s *ItemService) Detail(ctx context.Context, userID uint, itemID uint) (*vo.ItemVO, error) {
	item, err := s.itemRepo.GetByID(ctx, itemID)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New(errors.CodeParamInvalid, "物品不存在")
	}

	// 检查权限
	if item.UserID != userID {
		return nil, errors.New(errors.CodeForbidden, "无权限查看此物品")
	}

	return s.toVO(item), nil
}

func (s *ItemService) Update(ctx context.Context, userID uint, req *dto.UpdateItemRequest) (*vo.ItemVO, error) {
	item, err := s.itemRepo.GetByID(ctx, req.ItemID)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New(errors.CodeParamInvalid, "物品不存在")
	}

	// 检查权限
	if item.UserID != userID {
		return nil, errors.New(errors.CodeForbidden, "无权限操作此物品")
	}

	if req.CategoryID > 0 {
		item.CategoryID = req.CategoryID
	}
	if req.Name != "" {
		item.Name = req.Name
	}
	if req.Desc != "" {
		item.Description = req.Desc
	}
	if req.Quantity > 0 {
		item.Quantity = req.Quantity
	}
	if req.Unit != "" {
		item.Unit = req.Unit
	}
	if !req.ExpiredAt.IsZero() {
		item.ExpiredAt = req.ExpiredAt
	}
	if req.RemindDays > 0 {
		item.RemindDays = req.RemindDays
	}

	if err := s.itemRepo.Update(ctx, item); err != nil {
		return nil, err
	}

	return s.toVO(item), nil
}

func (s *ItemService) Delete(ctx context.Context, userID uint, itemID uint) error {
	item, err := s.itemRepo.GetByID(ctx, itemID)
	if err != nil {
		return err
	}
	if item == nil {
		return errors.New(errors.CodeParamInvalid, "物品不存在")
	}

	// 检查权限
	if item.UserID != userID {
		return errors.New(errors.CodeForbidden, "无权限操作此物品")
	}

	return s.itemRepo.Delete(ctx, itemID)
}

func (s *ItemService) GetExpiringItems(ctx context.Context, userID uint, days int) ([]vo.ExpiringItemVO, error) {
	if days <= 0 {
		days = 7 // 默认7天
	}

	items, err := s.itemRepo.GetExpiring(ctx, userID, days)
	if err != nil {
		return nil, err
	}

	result := make([]vo.ExpiringItemVO, 0, len(items))

	for _, item := range items {
		daysUntil := int(time.Until(item.ExpiredAt).Hours() / 24)
		result = append(result, vo.ExpiringItemVO{
			ItemVO:           *s.toVO(item),
			DaysUntilExpired: daysUntil,
		})
	}

	return result, nil
}

// GetStats 获取物品统计数据
func (s *ItemService) GetStats(ctx context.Context, userID uint) (*vo.ItemStatsVO, error) {
	total, expiringSoon, expired, used, err := s.itemRepo.GetStats(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &vo.ItemStatsVO{
		Total:        int(total),
		ExpiringSoon: int(expiringSoon),
		Expired:      int(expired),
		Used:         int(used),
	}, nil
}

func (s *ItemService) toVO(item *model.Item) *vo.ItemVO {
	return &vo.ItemVO{
		ItemID:     item.ID,
		UserID:     item.UserID,
		CategoryID: item.CategoryID,
		Name:       item.Name,
		Desc:       item.Description,
		Quantity:   item.Quantity,
		Unit:       item.Unit,
		ExpiredAt:  item.ExpiredAt.Format("2006-01-02 15:04:05"),
		RemindDays: item.RemindDays,
		Status:     item.Status,
		CreatedAt:  item.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}
