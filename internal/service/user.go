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
	Login(ctx context.Context, req *dto.LoginRequest) (*vo.LoginVO, error)
	GetUserInfo(ctx context.Context, userID uint) (*vo.UserVO, error)
	UpdateUser(ctx context.Context, userID uint, req *dto.UpdateUserRequest) (*vo.UserVO, error)
}

// UserService 用户服务实现
type UserService struct {
	userRepo repository.IUserRepository
	jwtUtil  *utils.JWTUtil
}

// NewUserService 创建用户服务
func NewUserService(userRepo repository.IUserRepository, jwtUtil *utils.JWTUtil) IUserService {
	return &UserService{
		userRepo: userRepo,
		jwtUtil:  jwtUtil,
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

func (s *UserService) Login(ctx context.Context, req *dto.LoginRequest) (*vo.LoginVO, error) {
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

	// 生成 JWT Token
	token, expireTime, err := s.jwtUtil.GenerateToken(user.ID, user.Username, user.Email)
	if err != nil {
		return nil, errors.NewWithCause(errors.CodeInternalError, "生成Token失败", err)
	}

	return &vo.LoginVO{
		UserID:  user.ID,
		Token:   token,
		Expired: expireTime.Format("2006-01-02 15:04:05"),
	}, nil
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
		CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}
