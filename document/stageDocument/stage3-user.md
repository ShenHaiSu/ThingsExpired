# ThingsExpired 后端项目 - 阶段三

> 用户模块完整实现

## 📋 阶段目标

本阶段完成用户模块的完整实现，包括用户注册、登录、信息获取、信息更新等功能，以及 JWT 认证中间件的实现。

## 🎯 实现目标

### 3.1 DTO 和 VO 定义

#### 3.1.1 用户 DTO internal/model/dto/user.go

```go
package dto

type RegisterRequest struct {
    Name     string `json:"name" binding:"required,min=2,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6,max=20"`
}

type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6,max=20"`
}

type UpdateUserRequest struct {
    Name  string `json:"name" binding:"omitempty,min=2,max=50"`
    Email string `json:"email" binding:"omitempty,email"`
}

type GetUserInfoRequest struct {
    // 用户ID从JWT token中获取，无需请求参数
}

type ChangePasswordRequest struct {
    OldPassword string `json:"old_password" binding:"required,min=6,max=20"`
    NewPassword string `json:"new_password" binding:"required,min=6,max=20"`
}
```

#### 3.1.2 用户 VO internal/model/vo/user.go

```go
package vo

type UserVO struct {
    UserID    uint   `json:"user_id"`
    Name      string `json:"name"`
    Email     string `json:"email"`
    Status    int8   `json:"status"`
    CreatedAt string `json:"created_at"`
}

type LoginVO struct {
    Token string  `json:"token"`
    User  *UserVO `json:"user"`
}
```

### 3.2 JWT 工具实现

#### 3.2.1 JWT 服务 pkg/utils/jwt.go

```go
package utils

import (
    "errors"
    "time"
    
    "github.com/golang-jwt/jwt/v5"
    "things-expired/config"
)

type Claims struct {
    UserID   uint   `json:"user_id"`
    Email    string `json:"email"`
    Name     string `json:"name"`
    jwt.RegisteredClaims
}

type JWTUtil struct {
    secret      []byte
    expireHours int
}

func NewJWTUtil(cfg *config.JWTConfig) *JWTUtil {
    return &JWTUtil{
        secret:      []byte(cfg.Secret),
        expireHours: cfg.ExpireHours,
    }
}

func (j *JWTUtil) GenerateToken(userID uint, email, name string) (string, error) {
    claims := Claims{
        UserID: userID,
        Email:  email,
        Name:   name,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(j.expireHours) * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(j.secret)
}

func (j *JWTUtil) ValidateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return j.secret, nil
    })
    
    if err != nil {
        return nil, err
    }
    
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    
    return nil, errors.New("invalid token")
}
```

### 3.3 密码加密工具

#### 3.3.1 密码工具 pkg/utils/crypto.go

```go
package utils

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

### 3.4 认证中间件

#### 3.4.1 认证中间件 pkg/middleware/auth.go

```go
package middleware

import (
    "strings"
    
    "things-expired/internal/handler"
    "things-expired/pkg/errors"
    "things-expired/pkg/utils"
    
    "github.com/gin-gonic/gin"
)

type AuthMiddleware struct {
    jwtUtil *utils.JWTUtil
}

func NewAuthMiddleware(jwtUtil *utils.JWTUtil) *AuthMiddleware {
    return &AuthMiddleware{jwtUtil: jwtUtil}
}

func (m *AuthMiddleware) Handle(c *gin.Context) {
    // 获取 Authorization header
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        handler.FailWithCode(c, errors.CodeUnauthorized, "missing authorization")
        c.Abort()
        return
    }
    
    // 解析 Bearer token
    token := strings.TrimPrefix(authHeader, "Bearer ")
    if token == authHeader { // 没有 Bearer 前缀
        handler.FailWithCode(c, errors.CodeUnauthorized, "invalid token format")
        c.Abort()
        return
    }
    
    // 验证 token
    claims, err := m.jwtUtil.ValidateToken(token)
    if err != nil {
        handler.FailWithCode(c, errors.CodeUnauthorized, "invalid token")
        c.Abort()
        return
    }
    
    // 将用户信息存入 context
    c.Set("user_id", claims.UserID)
    c.Set("email", claims.Email)
    c.Set("name", claims.Name)
    
    c.Next()
}
```

### 3.5 Service 层实现

#### 3.5.1 用户 Service 实现 internal/service/user.go

```go
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

type UserService struct {
    userRepo repository.IUserRepository
    jwtUtil  *utils.JWTUtil
}

func NewUserService(userRepo repository.IUserRepository, jwtUtil *utils.JWTUtil) *UserService {
    return &UserService{
        userRepo: userRepo,
        jwtUtil:  jwtUtil,
    }
}

// Register 用户注册
func (s *UserService) Register(ctx context.Context, req *dto.RegisterRequest) (*vo.UserVO, error) {
    // 检查邮箱是否已存在
    exists, err := s.userRepo.ExistsByEmail(ctx, req.Email)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "数据库查询失败", err)
    }
    if exists {
        return nil, errors.ErrUserExists
    }
    
    // 密码加密
    hashedPassword, err := utils.HashPassword(req.Password)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeInternalError, "密码加密失败", err)
    }
    
    // 创建用户
    user := &model.User{
        Name:     req.Name,
        Email:    req.Email,
        Password: hashedPassword,
        Status:   1,
    }
    
    if err := s.userRepo.Create(ctx, user); err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "创建用户失败", err)
    }
    
    return s.toUserVO(user), nil
}

// Login 用户登录
func (s *UserService) Login(ctx context.Context, req *dto.LoginRequest) (*vo.LoginVO, error) {
    // 查询用户
    user, err := s.userRepo.GetByEmail(ctx, req.Email)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "数据库查询失败", err)
    }
    if user == nil {
        return nil, errors.ErrUserNotFound
    }
    
    // 验证密码
    if !utils.CheckPasswordHash(req.Password, user.Password) {
        return nil, errors.ErrPasswordWrong
    }
    
    // 生成 Token
    token, err := s.jwtUtil.GenerateToken(user.ID, user.Email, user.Name)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeInternalError, "生成Token失败", err)
    }
    
    return &vo.LoginVO{
        Token: token,
        User:  s.toUserVO(user),
    }, nil
}

// GetUserInfo 获取用户信息
func (s *UserService) GetUserInfo(ctx context.Context, userID uint) (*vo.UserVO, error) {
    user, err := s.userRepo.GetByID(ctx, userID)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "数据库查询失败", err)
    }
    if user == nil {
        return nil, errors.ErrUserNotFound
    }
    
    return s.toUserVO(user), nil
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(ctx context.Context, userID uint, req *dto.UpdateUserRequest) (*vo.UserVO, error) {
    user, err := s.userRepo.GetByID(ctx, userID)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "数据库查询失败", err)
    }
    if user == nil {
        return nil, errors.ErrUserNotFound
    }
    
    // 检查邮箱是否被其他用户使用
    if req.Email != "" && req.Email != user.Email {
        exists, err := s.userRepo.ExistsByEmail(ctx, req.Email)
        if err != nil {
            return nil, errors.NewWithCause(errors.CodeDatabaseError, "数据库查询失败", err)
        }
        if exists {
            return nil, errors.ErrUserExists
        }
        user.Email = req.Email
    }
    
    // 更新名称
    if req.Name != "" {
        user.Name = req.Name
    }
    
    if err := s.userRepo.Update(ctx, user); err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "更新用户失败", err)
    }
    
    return s.toUserVO(user), nil
}

// toUserVO 转换为用户VO
func (s *UserService) toUserVO(user *model.User) *vo.UserVO {
    return &vo.UserVO{
        UserID:    user.ID,
        Name:      user.Name,
        Email:     user.Email,
        Status:    user.Status,
        CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
    }
}
```

### 3.6 Handler 层实现

#### 3.6.1 用户 Handler 实现 internal/handler/user.go

```go
package handler

import (
    "net/http"
    
    "things-expired/internal/model/dto"
    "things-expired/internal/service"
    "things-expired/pkg/errors"
    
    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    userService service.IUserService
}

func NewUserHandler(userService service.IUserService) *UserHandler {
    return &UserHandler{userService: userService}
}

// Register 用户注册
func (h *UserHandler) Register(c *gin.Context) {
    var req dto.RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    user, err := h.userService.Register(c.Request.Context(), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, user)
}

// Login 用户登录
func (h *UserHandler) Login(c *gin.Context) {
    var req dto.LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    result, err := h.userService.Login(c.Request.Context(), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, result)
}

// GetUserInfo 获取用户信息
func (h *UserHandler) GetUserInfo(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    user, err := h.userService.GetUserInfo(c.Request.Context(), userID.(uint))
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, user)
}

// UpdateUser 更新用户信息
func (h *UserHandler) UpdateUser(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.UpdateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    user, err := h.userService.UpdateUser(c.Request.Context(), userID.(uint), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, user)
}
```

### 3.7 路由更新

#### 3.7.1 路由定义 internal/router/router.go

```go
package router

import (
    "things-expired/internal/handler"
    "things-expired/pkg/middleware"
    
    "github.com/gin-gonic/gin"
)

func NewRouter(
    userHandler *handler.UserHandler,
    authMiddleware *middleware.AuthMiddleware,
    loggerMiddleware gin.HandlerFunc,
    corsMiddleware gin.HandlerFunc,
) *gin.Engine {
    r := gin.New()
    
    // 注册全局中间件
    r.Use(loggerMiddleware)
    r.Use(corsMiddleware)
    
    // API 路由组
    api := r.Group("/api")
    {
        // 用户公开路由
        user := api.Group("/user")
        {
            user.POST("/register", userHandler.Register)
            user.POST("/login", userHandler.Login)
        }
        
        // 用户认证路由
        userAuth := api.Group("/user")
        userAuth.Use(authMiddleware.Handle)
        {
            userAuth.POST("/info", userHandler.GetUserInfo)
            userAuth.POST("/update", userHandler.UpdateUser)
        }
    }
    
    return r
}
```

## ✅ 阶段验收标准

1. ✅ 用户注册功能正常
2. ✅ 用户登录功能正常，返回 JWT Token
3. ✅ 获取用户信息需要认证
4. ✅ 更新用户信息需要认证
5. ✅ 密码使用 bcrypt 加密存储
6. ✅ 认证中间件正确验证 Token
7. ✅ 错误处理统一

## 📝 注意事项

- 密码禁止明文存储
- Token 禁止暴露敏感信息
- 用户获取自己信息必须认证
- 邮箱唯一性校验

## ➡️ 下一步

完成本阶段后，进入 [阶段四：分类模块实现](./stage4-category.md)
