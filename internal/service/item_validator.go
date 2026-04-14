package service

import (
	"time"

	"things-expired/internal/model/dto"
	"things-expired/pkg/errors"
)

// ItemRequestValidator 物品请求验证器
type ItemRequestValidator struct{}

// NewItemRequestValidator 创建验证器
func NewItemRequestValidator() *ItemRequestValidator {
	return &ItemRequestValidator{}
}

// ValidateItemListRequest 验证物品列表请求的可选条件
func (v *ItemRequestValidator) ValidateItemListRequest(req *dto.ItemListRequest) error {
	// 验证数量范围
	if req.QuantityMin > 0 && req.QuantityMax > 0 && req.QuantityMin > req.QuantityMax {
		return errors.New(errors.CodeParamInvalid, "quantity_min cannot be greater than quantity_max")
	}

	// 验证提醒天数范围
	if req.RemindDaysMin > 0 && req.RemindDaysMax > 0 && req.RemindDaysMin > req.RemindDaysMax {
		return errors.New(errors.CodeParamInvalid, "remind_days_min cannot be greater than remind_days_max")
	}

	// 验证过期时间范围
	if req.ExpiredAtFrom != "" && req.ExpiredAtTo != "" {
		from, err1 := time.Parse("2006-01-02", req.ExpiredAtFrom)
		to, err2 := time.Parse("2006-01-02", req.ExpiredAtTo)
		if err1 != nil || err2 != nil {
			return errors.New(errors.CodeParamInvalid, "invalid expired_at date format, use YYYY-MM-DD")
		}
		if from.After(to) {
			return errors.New(errors.CodeParamInvalid, "expired_at_from cannot be after expired_at_to")
		}
	}

	// 验证创建时间范围
	if req.CreatedAtFrom != "" && req.CreatedAtTo != "" {
		from, err1 := time.Parse("2006-01-02", req.CreatedAtFrom)
		to, err2 := time.Parse("2006-01-02", req.CreatedAtTo)
		if err1 != nil || err2 != nil {
			return errors.New(errors.CodeParamInvalid, "invalid created_at date format, use YYYY-MM-DD")
		}
		if from.After(to) {
			return errors.New(errors.CodeParamInvalid, "created_at_from cannot be after created_at_to")
		}
	}

	// 验证排序方向
	if req.Order != "" && req.Order != "asc" && req.Order != "desc" {
		return errors.New(errors.CodeParamInvalid, "order must be asc or desc")
	}

	return nil
}

// ValidateCreateItemRequest 验证创建物品请求
func (v *ItemRequestValidator) ValidateCreateItemRequest(req *dto.CreateItemRequest) error {
	// 业务校验逻辑
	if req.Quantity <= 0 {
		req.Quantity = 1
	}
	if req.RemindDays <= 0 {
		req.RemindDays = 3
	}
	return nil
}

// ValidateUpdateItemRequest 验证更新物品请求
func (v *ItemRequestValidator) ValidateUpdateItemRequest(req *dto.UpdateItemRequest) error {
	// 业务校验逻辑
	return nil
}
