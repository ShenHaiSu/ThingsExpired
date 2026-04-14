package repository

import (
	"context"
	"time"

	"things-expired/internal/model"
	"gorm.io/gorm"
)

// IUserSessionRepository 用户会话仓储接口
type IUserSessionRepository interface {
	Create(ctx context.Context, session *model.UserSession) error
	GetByID(ctx context.Context, id uint) (*model.UserSession, error)
	GetByJTI(ctx context.Context, jti string) (*model.UserSession, error)
	GetActiveSessionsByUserID(ctx context.Context, userID uint) ([]*model.UserSession, error)
	GetAllSessionsByUserID(ctx context.Context, userID uint) ([]*model.UserSession, error)
	RevokeByUserID(ctx context.Context, userID uint) error
	RevokeByID(ctx context.Context, id uint) error
	RevokeByJTI(ctx context.Context, jti string) error
	DeleteExpired(ctx context.Context) (int64, error)
	DeleteByUserID(ctx context.Context, userID uint) error
}

// UserSessionRepository 用户会话仓储实现
type UserSessionRepository struct {
	db *gorm.DB
}

// NewUserSessionRepository 创建用户会话仓储
func NewUserSessionRepository(db *gorm.DB) IUserSessionRepository {
	return &UserSessionRepository{db: db}
}

// Create 创建会话
func (r *UserSessionRepository) Create(ctx context.Context, session *model.UserSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

// GetByID 根据ID获取会话
func (r *UserSessionRepository) GetByID(ctx context.Context, id uint) (*model.UserSession, error) {
	var session model.UserSession
	if err := r.db.WithContext(ctx).First(&session, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

// GetByJTI 根据JTI获取会话
func (r *UserSessionRepository) GetByJTI(ctx context.Context, jti string) (*model.UserSession, error) {
	var session model.UserSession
	if err := r.db.WithContext(ctx).Where("token_jti = ?", jti).First(&session).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

// GetActiveSessionsByUserID 获取用户所有未撤销的会话
func (r *UserSessionRepository) GetActiveSessionsByUserID(ctx context.Context, userID uint) ([]*model.UserSession, error) {
	var sessions []*model.UserSession
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND is_revoked = 0 AND expires_at > ?", userID, time.Now()).
		Order("created_at DESC").
		Find(&sessions).Error
	return sessions, err
}

// GetAllSessionsByUserID 获取用户所有会话（包括已撤销的）
func (r *UserSessionRepository) GetAllSessionsByUserID(ctx context.Context, userID uint) ([]*model.UserSession, error) {
	var sessions []*model.UserSession
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&sessions).Error
	return sessions, err
}

// RevokeByUserID 撤销用户所有会话
func (r *UserSessionRepository) RevokeByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).
		Model(&model.UserSession{}).
		Where("user_id = ? AND is_revoked = 0", userID).
		Update("is_revoked", true).Error
}

// RevokeByID 撤销指定会话
func (r *UserSessionRepository) RevokeByID(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&model.UserSession{}).
		Where("id = ?", id).
		Update("is_revoked", true).Error
}

// RevokeByJTI 撤销指定JTI的会话
func (r *UserSessionRepository) RevokeByJTI(ctx context.Context, jti string) error {
	return r.db.WithContext(ctx).
		Model(&model.UserSession{}).
		Where("token_jti = ?", jti).
		Update("is_revoked", true).Error
}

// DeleteExpired 删除已过期的会话
func (r *UserSessionRepository) DeleteExpired(ctx context.Context) (int64, error) {
	result := r.db.WithContext(ctx).
		Where("expires_at < ?", time.Now()).
		Delete(&model.UserSession{})
	return result.RowsAffected, result.Error
}

// DeleteByUserID 删除用户所有会话
func (r *UserSessionRepository) DeleteByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Delete(&model.UserSession{}).Error
}