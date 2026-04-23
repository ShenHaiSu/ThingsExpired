package service

import (
	"context"
	stdErrors "errors"
	"testing"

	"things-expired/config"
	"things-expired/internal/model"
	"things-expired/internal/model/dto"
	appErrors "things-expired/pkg/errors"
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

// MockUserSessionRepository 是 UserSessionRepository 的 Mock 实现
type MockUserSessionRepository struct {
	mock.Mock
}

func (m *MockUserSessionRepository) Create(ctx context.Context, session *model.UserSession) error {
	args := m.Called(ctx, session)
	return args.Error(0)
}

func (m *MockUserSessionRepository) GetByID(ctx context.Context, id uint) (*model.UserSession, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.UserSession), args.Error(1)
}

func (m *MockUserSessionRepository) GetByJTI(ctx context.Context, jti string) (*model.UserSession, error) {
	args := m.Called(ctx, jti)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.UserSession), args.Error(1)
}

func (m *MockUserSessionRepository) GetActiveSessionsByUserID(ctx context.Context, userID uint) ([]*model.UserSession, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.UserSession), args.Error(1)
}

func (m *MockUserSessionRepository) GetAllSessionsByUserID(ctx context.Context, userID uint) ([]*model.UserSession, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.UserSession), args.Error(1)
}

func (m *MockUserSessionRepository) RevokeByUserID(ctx context.Context, userID uint) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *MockUserSessionRepository) RevokeByID(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserSessionRepository) RevokeByJTI(ctx context.Context, jti string) error {
	args := m.Called(ctx, jti)
	return args.Error(0)
}

func (m *MockUserSessionRepository) DeleteExpired(ctx context.Context) (int64, error) {
	args := m.Called(ctx)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockUserSessionRepository) DeleteByUserID(ctx context.Context, userID uint) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

// testFixture 测试夹具，提供测试所需的公共资源
type testFixture struct {
	mockRepo        *MockUserRepository
	mockSessionRepo *MockUserSessionRepository
	service         IUserService
	ctx             context.Context
}

// setupTest 创建测试夹具
func setupTest(t *testing.T) *testFixture {
	mockRepo := new(MockUserRepository)
	mockSessionRepo := new(MockUserSessionRepository)
	cfg := &config.JWTConfig{
		Secret:      "test-secret",
		ExpireHours: 24,
	}
	jwtUtil := utils.NewJWTUtil(cfg)
	svc := NewUserService(mockRepo, mockSessionRepo, jwtUtil, true, 5)

	return &testFixture{
		mockRepo:        mockRepo,
		mockSessionRepo: mockSessionRepo,
		service:         svc,
		ctx:             context.Background(),
	}
}

// TestUserService_Register_Success 测试用户注册成功场景
func TestUserService_Register_Success(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	req := &dto.RegisterRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
	}

	// 设置 Mock 行为 - 使用 MatchedBy 来模拟数据库创建后自动填充 ID
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(nil, nil)
	f.mockRepo.On("GetByUsername", f.ctx, req.Username).Return(nil, nil)
	f.mockRepo.On("Create", f.ctx, mock.AnythingOfType("*model.User")).Run(func(args mock.Arguments) {
		user := args.Get(1).(*model.User)
		user.ID = 1 // 模拟 GORM 在 Create 后自动填充 ID
	}).Return(nil)

	// 执行测试
	result, err := f.service.Register(f.ctx, req)

	// 断言
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, req.Username, result.Username)
	assert.Equal(t, req.Email, result.Email)
	assert.NotZero(t, result.UserID)
	assert.NotEmpty(t, result.CreatedAt)

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_Register_EmailExists 测试用户注册时邮箱已存在
func TestUserService_Register_EmailExists(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	req := &dto.RegisterRequest{
		Username: "testuser",
		Email:    "existing@example.com",
		Password: "password123",
	}

	// 设置 Mock 行为 - 邮箱已存在
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(&model.User{
		ID:       1,
		Username: "existing",
		Email:    req.Email,
	}, nil)

	// 执行测试
	result, err := f.service.Register(f.ctx, req)

	// 断言 - 验证错误码
	assert.Error(t, err)
	assert.Nil(t, result)
	var appErr *appErrors.AppError
	if stdErrors.As(err, &appErr) {
		assert.Equal(t, appErrors.CodeUserExists, appErr.Code)
		assert.Equal(t, "用户已存在", appErr.Message)
	}

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_Register_UsernameExists 测试用户注册时用户名已存在
func TestUserService_Register_UsernameExists(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	req := &dto.RegisterRequest{
		Username: "existinguser",
		Email:    "new@example.com",
		Password: "password123",
	}

	// 设置 Mock 行为 - 邮箱不存在但用户名已存在
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(nil, nil)
	f.mockRepo.On("GetByUsername", f.ctx, req.Username).Return(&model.User{
		ID:       1,
		Username: req.Username,
		Email:    req.Email,
	}, nil)

	// 执行测试
	result, err := f.service.Register(f.ctx, req)

	// 断言 - 验证错误码
	assert.Error(t, err)
	assert.Nil(t, result)
	var appErr *appErrors.AppError
	if stdErrors.As(err, &appErr) {
		assert.Equal(t, appErrors.CodeUserExists, appErr.Code)
		assert.Equal(t, "用户名已存在", appErr.Message)
	}

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_Register_DatabaseError 测试用户注册时数据库错误
func TestUserService_Register_DatabaseError(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	req := &dto.RegisterRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
	}

	dbErr := stdErrors.New("database connection failed")

	// 设置 Mock 行为 - 数据库错误
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(nil, nil)
	f.mockRepo.On("GetByUsername", f.ctx, req.Username).Return(nil, nil)
	f.mockRepo.On("Create", f.ctx, mock.AnythingOfType("*model.User")).Return(dbErr)

	// 执行测试
	result, err := f.service.Register(f.ctx, req)

	// 断言
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, dbErr, err)

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_Login_Success 测试用户登录成功场景
func TestUserService_Login_Success(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	req := &dto.LoginRequest{
		Email:    "test@example.com",
		Password: password,
	}

	// 设置 Mock 行为
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(&model.User{
		ID:       1,
		Username: "testuser",
		Email:    req.Email,
		Password: string(hashedPassword),
		Status:   1,
	}, nil)
	f.mockSessionRepo.On("Create", f.ctx, mock.AnythingOfType("*model.UserSession")).Return(nil)
	f.mockSessionRepo.On("GetActiveSessionsByUserID", f.ctx, uint(1)).Return([]*model.UserSession{}, nil)

	// 执行测试
	result, err := f.service.Login(f.ctx, req, "test-device", "127.0.0.1")

	// 断言
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, uint(1), result.UserID)
	assert.NotEmpty(t, result.Token)
	assert.NotEmpty(t, result.Expired)

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
	f.mockSessionRepo.AssertExpectations(t)
}

// TestUserService_Login_UserNotFound 测试用户登录时用户不存在
func TestUserService_Login_UserNotFound(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	req := &dto.LoginRequest{
		Email:    "nonexistent@example.com",
		Password: "password123",
	}

	// 设置 Mock 行为 - 用户不存在
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(nil, nil)

	// 执行测试
	result, err := f.service.Login(f.ctx, req, "test-device", "127.0.0.1")

	// 断言 - 验证错误码
	assert.Error(t, err)
	assert.Nil(t, result)
	var appErr *appErrors.AppError
	if stdErrors.As(err, &appErr) {
		assert.Equal(t, appErrors.CodeUserNotFound, appErr.Code)
		assert.Equal(t, "用户不存在", appErr.Message)
	}

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_Login_WrongPassword 测试用户登录时密码错误
func TestUserService_Login_WrongPassword(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	req := &dto.LoginRequest{
		Email:    "test@example.com",
		Password: "wrongpassword",
	}

	// 设置 Mock 行为
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(&model.User{
		ID:       1,
		Username: "testuser",
		Email:    req.Email,
		Password: string(hashedPassword),
		Status:   1,
	}, nil)

	// 执行测试
	result, err := f.service.Login(f.ctx, req, "test-device", "127.0.0.1")

	// 断言 - 验证错误码
	assert.Error(t, err)
	assert.Nil(t, result)
	var appErr *appErrors.AppError
	if stdErrors.As(err, &appErr) {
		assert.Equal(t, appErrors.CodePasswordWrong, appErr.Code)
		assert.Equal(t, "密码错误", appErr.Message)
	}

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_Login_DatabaseError 测试用户登录时数据库错误
func TestUserService_Login_DatabaseError(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	req := &dto.LoginRequest{
		Email:    "test@example.com",
		Password: "password123",
	}

	dbErr := stdErrors.New("database connection failed")

	// 设置 Mock 行为 - 数据库错误
	f.mockRepo.On("GetByEmail", f.ctx, req.Email).Return(nil, dbErr)

	// 执行测试
	result, err := f.service.Login(f.ctx, req, "test-device", "127.0.0.1")

	// 断言
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, dbErr, err)

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_GetUserInfo_Success 测试获取用户信息成功场景
func TestUserService_GetUserInfo_Success(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	userID := uint(1)

	// 设置 Mock 行为
	f.mockRepo.On("GetByID", f.ctx, userID).Return(&model.User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
		Status:   1,
	}, nil)

	// 执行测试
	result, err := f.service.GetUserInfo(f.ctx, userID)

	// 断言
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, userID, result.UserID)
	assert.Equal(t, "testuser", result.Username)
	assert.Equal(t, "test@example.com", result.Email)
	assert.Equal(t, int8(1), result.Status)
	assert.NotEmpty(t, result.CreatedAt)

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_GetUserInfo_NotFound 测试获取用户信息时用户不存在
func TestUserService_GetUserInfo_NotFound(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	userID := uint(999)

	// 设置 Mock 行为 - 用户不存在
	f.mockRepo.On("GetByID", f.ctx, userID).Return(nil, nil)

	// 执行测试
	result, err := f.service.GetUserInfo(f.ctx, userID)

	// 断言 - 验证错误码
	assert.Error(t, err)
	assert.Nil(t, result)
	var appErr *appErrors.AppError
	if stdErrors.As(err, &appErr) {
		assert.Equal(t, appErrors.CodeUserNotFound, appErr.Code)
		assert.Equal(t, "用户不存在", appErr.Message)
	}

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}

// TestUserService_GetUserInfo_DatabaseError 测试获取用户信息时数据库错误
func TestUserService_GetUserInfo_DatabaseError(t *testing.T) {
	// 准备测试夹具
	f := setupTest(t)

	userID := uint(1)
	dbErr := stdErrors.New("database connection failed")

	// 设置 Mock 行为 - 数据库错误
	f.mockRepo.On("GetByID", f.ctx, userID).Return(nil, dbErr)

	// 执行测试
	result, err := f.service.GetUserInfo(f.ctx, userID)

	// 断言
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, dbErr, err)

	// 验证 Mock 调用
	f.mockRepo.AssertExpectations(t)
}
