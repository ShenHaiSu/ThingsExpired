package service

import (
	"context"
	"testing"

	"things-expired/internal/model"
	"things-expired/internal/model/dto"
	"things-expired/config"
	"things-expired/pkg/utils"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

// MockUserRepository 是 UserRepository 的 Mock 实现
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, user *model.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) GetByID(ctx context.Context, id uint) (*model.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) Update(ctx context.Context, user *model.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func TestUserService_Register_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := &config.JWTConfig{
		Secret:      "test-secret",
		ExpireHours: 24,
	}
	jwtUtil := utils.NewJWTUtil(cfg)
	svc := NewUserService(mockRepo, jwtUtil)

	ctx := context.Background()
	req := &dto.RegisterRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
	}

	// 设置 Mock 行为
	mockRepo.On("GetByEmail", ctx, req.Email).Return(nil, nil)
	mockRepo.On("GetByUsername", ctx, req.Username).Return(nil, nil)
	mockRepo.On("Create", ctx, mock.AnythingOfType("*model.User")).Return(nil)

	// 执行测试
	result, err := svc.Register(ctx, req)

	// 断言
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, req.Username, result.Username)
	assert.Equal(t, req.Email, result.Email)

	// 验证 Mock 调用
	mockRepo.AssertExpectations(t)
}

func TestUserService_Register_EmailExists(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := &config.JWTConfig{
		Secret:      "test-secret",
		ExpireHours: 24,
	}
	jwtUtil := utils.NewJWTUtil(cfg)
	svc := NewUserService(mockRepo, jwtUtil)

	ctx := context.Background()
	req := &dto.RegisterRequest{
		Username: "testuser",
		Email:    "existing@example.com",
		Password: "password123",
	}

	// 设置 Mock 行为 - 邮箱已存在
	mockRepo.On("GetByEmail", ctx, req.Email).Return(&model.User{
		ID:       1,
		Username: "existing",
		Email:    req.Email,
	}, nil)

	// 执行测试
	result, err := svc.Register(ctx, req)

	// 断言
	assert.Error(t, err)
	assert.Nil(t, result)

	// 验证 Mock 调用
	mockRepo.AssertExpectations(t)
}

func TestUserService_Login_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := &config.JWTConfig{
		Secret:      "test-secret",
		ExpireHours: 24,
	}
	jwtUtil := utils.NewJWTUtil(cfg)
	svc := NewUserService(mockRepo, jwtUtil)

	ctx := context.Background()
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	req := &dto.LoginRequest{
		Email:    "test@example.com",
		Password: password,
	}

	// 设置 Mock 行为
	mockRepo.On("GetByEmail", ctx, req.Email).Return(&model.User{
		ID:       1,
		Username: "testuser",
		Email:    req.Email,
		Password: string(hashedPassword),
	}, nil)

	// 执行测试
	result, err := svc.Login(ctx, req)

	// 断言
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, uint(1), result.UserID)
	assert.NotEmpty(t, result.Token)
	assert.NotEmpty(t, result.Expired)

	// 验证 Mock 调用
	mockRepo.AssertExpectations(t)
}

func TestUserService_Login_UserNotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := &config.JWTConfig{
		Secret:      "test-secret",
		ExpireHours: 24,
	}
	jwtUtil := utils.NewJWTUtil(cfg)
	svc := NewUserService(mockRepo, jwtUtil)

	ctx := context.Background()
	req := &dto.LoginRequest{
		Email:    "nonexistent@example.com",
		Password: "password123",
	}

	// 设置 Mock 行为 - 用户不存在
	mockRepo.On("GetByEmail", ctx, req.Email).Return(nil, nil)

	// 执行测试
	result, err := svc.Login(ctx, req)

	// 断言
	assert.Error(t, err)
	assert.Nil(t, result)

	// 验证 Mock 调用
	mockRepo.AssertExpectations(t)
}

func TestUserService_GetUserInfo_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := &config.JWTConfig{
		Secret:      "test-secret",
		ExpireHours: 24,
	}
	jwtUtil := utils.NewJWTUtil(cfg)
	svc := NewUserService(mockRepo, jwtUtil)

	ctx := context.Background()
	userID := uint(1)

	// 设置 Mock 行为
	mockRepo.On("GetByID", ctx, userID).Return(&model.User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
		Status:   1,
	}, nil)

	// 执行测试
	result, err := svc.GetUserInfo(ctx, userID)

	// 断言
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, userID, result.UserID)
	assert.Equal(t, "testuser", result.Username)

	// 验证 Mock 调用
	mockRepo.AssertExpectations(t)
}

func TestUserService_GetUserInfo_NotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := &config.JWTConfig{
		Secret:      "test-secret",
		ExpireHours: 24,
	}
	jwtUtil := utils.NewJWTUtil(cfg)
	svc := NewUserService(mockRepo, jwtUtil)

	ctx := context.Background()
	userID := uint(999)

	// 设置 Mock 行为 - 用户不存在
	mockRepo.On("GetByID", ctx, userID).Return(nil, nil)

	// 执行测试
	result, err := svc.GetUserInfo(ctx, userID)

	// 断言
	assert.Error(t, err)
	assert.Nil(t, result)

	// 验证 Mock 调用
	mockRepo.AssertExpectations(t)
}
