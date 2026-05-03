package service

import (
	"context"

	"things-expired/internal/model"
	"things-expired/internal/model/dto"
	"things-expired/internal/model/vo"
	"things-expired/internal/repository"
	"things-expired/pkg/errors"
	"things-expired/pkg/utils"

	"golang.org/x/crypto/bcrypt"
)

// IUserService 用户服务接口
type IUserService interface {
	Register(ctx context.Context, req *dto.RegisterRequest) (*vo.UserVO, error)
	Login(ctx context.Context, req *dto.LoginRequest, deviceInfo, ipAddress string) (*vo.LoginVO, error)
	Logout(ctx context.Context, userID uint, sessionJTI string) error
	GetUserInfo(ctx context.Context, userID uint) (*vo.UserVO, error)
	UpdateUser(ctx context.Context, userID uint, req *dto.UpdateUserRequest) (*vo.UserVO, error)
	ForceLogout(ctx context.Context, userID uint) error
	GetSessions(ctx context.Context, userID uint) (*vo.SessionListVO, error)
	RevokeSession(ctx context.Context, userID uint, sessionID uint) error
}

// UserService 用户服务实现
type UserService struct {
	userRepo        repository.IUserRepository
	sessionRepo     repository.IUserSessionRepository
	jwtUtil         *utils.JWTUtil
	allowMultiLogin bool
	maxSessions     int
}

// NewUserService 创建用户服务
func NewUserService(
	userRepo repository.IUserRepository,
	sessionRepo repository.IUserSessionRepository,
	jwtUtil *utils.JWTUtil,
	allowMultiLogin bool,
	maxSessions int,
) IUserService {
	return &UserService{
		userRepo:        userRepo,
		sessionRepo:     sessionRepo,
		jwtUtil:         jwtUtil,
		allowMultiLogin: allowMultiLogin,
		maxSessions:     maxSessions,
	}
}

func (s *UserService) Register(ctx context.Context, req *dto.RegisterRequest) (*vo.UserVO, error) {
	// 检查邮箱是否已存在
	existUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if existUser != nil {
		return nil, errors.ErrUserExists
	}

	// 检查用户名是否已存在
	existUser, err = s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		return nil, err
	}
	if existUser != nil {
		return nil, errors.New(errors.CodeUserExists, "用户名已存在")
	}

	// 密码加密
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 创建用户
	user := &model.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		Status:   1,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return s.toVO(user), nil
}

func (s *UserService) Login(ctx context.Context, req *dto.LoginRequest, deviceInfo, ipAddress string) (*vo.LoginVO, error) {
	// 获取用户
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.ErrUserNotFound
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.ErrPasswordWrong
	}

	// 生成带 JTI 的 JWT Token
	token, expireTime, err := s.jwtUtil.GenerateTokenWithJTI(user.ID, user.Username, user.Email, "")
	if err != nil {
		return nil, errors.NewWithCause(errors.CodeInternalError, "生成Token失败", err)
	}

	// 从 Token 中获取 JTI
	claims, err := s.jwtUtil.ValidateToken(token)
	if err != nil {
		return nil, errors.NewWithCause(errors.CodeInternalError, "解析Token失败", err)
	}

	// 如果不允许多端登录，撤销该用户的所有旧会话
	if !s.allowMultiLogin {
		if err := s.sessionRepo.RevokeByUserID(ctx, user.ID); err != nil {
			return nil, err
		}
	}

	// 保存会话记录
	session := &model.UserSession{
		UserID:     user.ID,
		TokenJTI:   claims.JTI,
		DeviceInfo: deviceInfo,
		IPAddress:  ipAddress,
		ExpiresAt:  expireTime,
		IsRevoked:  false,
	}
	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return nil, err
	}

	// 如果设置了最大会话数限制，删除多余的旧会话
	if s.maxSessions > 0 {
		s.cleanupOldSessions(ctx, user.ID)
	}

	return &vo.LoginVO{
		UserID:  user.ID,
		Token:   token,
		Expired: utils.FormatTimeUTC(expireTime),
	}, nil
}

// cleanupOldSessions 清理多余的旧会话
// 保留最新的 maxSessions 个会话，删除最旧的会话
func (s *UserService) cleanupOldSessions(ctx context.Context, userID uint) {
	sessions, err := s.sessionRepo.GetActiveSessionsByUserID(ctx, userID)
	if err != nil || len(sessions) <= s.maxSessions {
		return
	}

	// 保留最新的 maxSessions 个会话，删除最旧的会话
	// sessions 已按 created_at DESC 排序，所以前面的都是最新的
	// 需要删除的是后面的（索引 >= maxSessions 的）
	toDelete := len(sessions) - s.maxSessions
	for i := 0; i < toDelete; i++ {
		_ = s.sessionRepo.RevokeByID(ctx, sessions[i].ID)
	}
}

// Logout 用户登出
func (s *UserService) Logout(ctx context.Context, userID uint, sessionJTI string) error {
	if sessionJTI == "" {
		return nil
	}
	return s.sessionRepo.RevokeByJTI(ctx, sessionJTI)
}

func (s *UserService) GetUserInfo(ctx context.Context, userID uint) (*vo.UserVO, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.ErrUserNotFound
	}

	return s.toVO(user), nil
}

func (s *UserService) UpdateUser(ctx context.Context, userID uint, req *dto.UpdateUserRequest) (*vo.UserVO, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.ErrUserNotFound
	}

	if req.Username != "" {
		user.Username = req.Username
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return s.toVO(user), nil
}

func (s *UserService) toVO(user *model.User) *vo.UserVO {
	return &vo.UserVO{
		UserID:    user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Status:    user.Status,
		CreatedAt: utils.FormatTimeUTC(user.CreatedAt),
	}
}

// ForceLogout 强制下线用户（撤销所有会话）
func (s *UserService) ForceLogout(ctx context.Context, userID uint) error {
	return s.sessionRepo.RevokeByUserID(ctx, userID)
}

// GetSessions 获取用户所有会话
func (s *UserService) GetSessions(ctx context.Context, userID uint) (*vo.SessionListVO, error) {
	sessions, err := s.sessionRepo.GetAllSessionsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := &vo.SessionListVO{
		Sessions: make([]vo.SessionVO, 0, len(sessions)),
		Total:    len(sessions),
	}

	for _, session := range sessions {
		result.Sessions = append(result.Sessions, vo.SessionVO{
			SessionID:  session.ID,
			UserID:     session.UserID,
			DeviceInfo: session.DeviceInfo,
			IPAddress:  session.IPAddress,
			CreatedAt:  utils.FormatTimeUTC(session.CreatedAt),
			ExpiresAt:  utils.FormatTimeUTC(session.ExpiresAt),
			IsRevoked:  session.IsRevoked,
		})
	}

	return result, nil
}

// RevokeSession 撤销指定会话
func (s *UserService) RevokeSession(ctx context.Context, userID uint, sessionID uint) error {
	// 验证会话属于该用户
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return err
	}
	if session == nil {
		return errors.New(2001, "会话不存在")
	}
	if session.UserID != userID {
		return errors.New(1003, "无权限操作该会话")
	}

	return s.sessionRepo.RevokeByID(ctx, sessionID)
}
