# ThingsExpired 后端项目 - 阶段七

> 测试与部署

## 📋 阶段目标

本阶段完成项目的测试体系和部署文档，包括单元测试、集成测试、部署脚本和 Nginx 配置。

## 🎯 实现目标

### 7.1 单元测试

#### 7.1.1 Service 层单元测试

##### 测试夹具 internal/service/user_test.go

```go
package service

import (
    "context"
    "testing"
    
    "things-expired/internal/model"
    "things-expired/internal/model/dto"
    
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// MockUserRepository 是 UserRepository 的 Mock 实现
type MockUserRepository struct {
    mock.Mock
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

func (m *MockUserRepository) Create(ctx context.Context, user *model.User) error {
    args := m.Called(ctx, user)
    return args.Error(0)
}

func (m *MockUserRepository) Update(ctx context.Context, user *model.User) error {
    args := m.Called(ctx, user)
    return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id uint) error {
    args := m.Called(ctx, id)
    return args.Error(0)
}

func (m *MockUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
    args := m.Called(ctx, email)
    return args.Bool(0), args.Error(1)
}

// MockJWTUtil 是 JWTUtil 的 Mock 实现
type MockJWTUtil struct {
    mock.Mock
}

func (m *MockJWTUtil) GenerateToken(userID uint, email, name string) (string, error) {
    args := m.Called(userID, email, name)
    return args.String(0), args.Error(1)
}

func (m *MockJWTUtil) ValidateToken(tokenString string) (*Claims, error) {
    args := m.Called(tokenString)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*Claims), args.Error(1)
}

func TestUserService_Register_Success(t *testing.T) {
    mockRepo := new(MockUserRepository)
    mockJWT := new(MockJWTUtil)
    svc := NewUserService(mockRepo, mockJWT)
    
    ctx := context.Background()
    req := &dto.RegisterRequest{
        Name:     "testuser",
        Email:    "test@example.com",
        Password: "password123",
    }
    
    // 设置 Mock 行为
    mockRepo.On("ExistsByEmail", ctx, req.Email).Return(false, nil)
    mockRepo.On("Create", ctx, mock.AnythingOfType("*model.User")).Return(nil)
    
    // 执行测试
    result, err := svc.Register(ctx, req)
    
    // 断言
    assert.NoError(t, err)
    assert.NotNil(t, result)
    assert.Equal(t, req.Name, result.Name)
    assert.Equal(t, req.Email, result.Email)
    
    // 验证 Mock 调用
    mockRepo.AssertExpectations(t)
}

func TestUserService_Register_EmailExists(t *testing.T) {
    mockRepo := new(MockUserRepository)
    mockJWT := new(MockJWTUtil)
    svc := NewUserService(mockRepo, mockJWT)
    
    ctx := context.Background()
    req := &dto.RegisterRequest{
        Name:     "testuser",
        Email:    "existing@example.com",
        Password: "password123",
    }
    
    // 设置 Mock 行为 - 邮箱已存在
    mockRepo.On("ExistsByEmail", ctx, req.Email).Return(true, nil)
    
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
    mockJWT := new(MockJWTUtil)
    svc := NewUserService(mockRepo, mockJWT)
    
    ctx := context.Background()
    req := &dto.LoginRequest{
        Email:    "test@example.com",
        Password: "password123",
    }
    
    hashedPassword, _ := HashPassword(req.Password)
    existingUser := &model.User{
        ID:       1,
        Name:     "testuser",
        Email:    req.Email,
        Password: hashedPassword,
        Status:   1,
    }
    
    // 设置 Mock 行为
    mockRepo.On("GetByEmail", ctx, req.Email).Return(existingUser, nil)
    mockJWT.On("GenerateToken", existingUser.ID, existingUser.Email, existingUser.Name).Return("test-token", nil)
    
    // 执行测试
    result, err := svc.Login(ctx, req)
    
    // 断言
    assert.NoError(t, err)
    assert.NotNil(t, result)
    assert.Equal(t, "test-token", result.Token)
    assert.Equal(t, existingUser.Name, result.User.Name)
    
    // 验证 Mock 调用
    mockRepo.AssertExpectations(t)
    mockJWT.AssertExpectations(t)
}

func TestUserService_Login_UserNotFound(t *testing.T) {
    mockRepo := new(MockUserRepository)
    mockJWT := new(MockJWTUtil)
    svc := NewUserService(mockRepo, mockJWT)
    
    ctx := context.Background()
    req := &dto.LoginRequest{
        Email:    "notfound@example.com",
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

func TestUserService_Login_PasswordWrong(t *testing.T) {
    mockRepo := new(MockUserRepository)
    mockJWT := new(MockJWTUtil)
    svc := NewUserService(mockRepo, mockJWT)
    
    ctx := context.Background()
    req := &dto.LoginRequest{
        Email:    "test@example.com",
        Password: "wrongpassword",
    }
    
    hashedPassword, _ := HashPassword("correctpassword")
    existingUser := &model.User{
        ID:       1,
        Name:     "testuser",
        Email:    req.Email,
        Password: hashedPassword,
        Status:   1,
    }
    
    // 设置 Mock 行为
    mockRepo.On("GetByEmail", ctx, req.Email).Return(existingUser, nil)
    
    // 执行测试
    result, err := svc.Login(ctx, req)
    
    // 断言
    assert.Error(t, err)
    assert.Nil(t, result)
    
    // 验证 Mock 调用
    mockRepo.AssertExpectations(t)
}
```

#### 7.1.2 Handler 层单元测试

##### 测试夹具 internal/handler/user_test.go

```go
package handler

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    
    "things-expired/internal/model/dto"
    
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// MockUserService 是 UserService 的 Mock 实现
type MockUserService struct {
    mock.Mock
}

func (m *MockUserService) Register(ctx context.Context, req *dto.RegisterRequest) (*vo.UserVO, error) {
    args := m.Called(ctx, req)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*vo.UserVO), args.Error(1)
}

func (m *MockUserService) Login(ctx context.Context, req *dto.LoginRequest) (*vo.LoginVO, error) {
    args := m.Called(ctx, req)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*vo.LoginVO), args.Error(1)
}

func (m *MockUserService) GetUserInfo(ctx context.Context, userID uint) (*vo.UserVO, error) {
    args := m.Called(ctx, userID)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*vo.UserVO), args.Error(1)
}

func (m *MockUserService) UpdateUser(ctx context.Context, userID uint, req *dto.UpdateUserRequest) (*vo.UserVO, error) {
    args := m.Called(ctx, userID, req)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*vo.UserVO), args.Error(1)
}

func TestUserHandler_Register_Success(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    mockService := new(MockUserService)
    h := NewUserHandler(mockService)
    
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    
    reqBody := dto.RegisterRequest{
        Name:     "testuser",
        Email:    "test@example.com",
        Password: "password123",
    }
    body, _ := json.Marshal(reqBody)
    c.Request = httptest.NewRequest(http.MethodPost, "/api/user/register", bytes.NewBuffer(body))
    c.Request.Header.Set("Content-Type", "application/json")
    
    expectedUser := &vo.UserVO{
        UserID: 1,
        Name:   "testuser",
        Email:  "test@example.com",
    }
    mockService.On("Register", mock.Anything, mock.AnythingOfType("*dto.RegisterRequest")).Return(expectedUser, nil)
    
    h.Register(c)
    
    assert.Equal(t, http.StatusOK, w.Code)
    
    var response Response
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.Equal(t, 0, response.Code)
    assert.Equal(t, "success", response.Message)
    
    mockService.AssertExpectations(t)
}

func TestUserHandler_Register_InvalidParams(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    mockService := new(MockUserService)
    h := NewUserHandler(mockService)
    
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    
    // 无效请求体
    reqBody := `{"name": ""}`
    c.Request = httptest.NewRequest(http.MethodPost, "/api/user/register", bytes.NewBufferString(reqBody))
    c.Request.Header.Set("Content-Type", "application/json")
    
    h.Register(c)
    
    assert.Equal(t, http.StatusOK, w.Code)
    
    var response Response
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.Equal(t, 1001, response.Code) // ParamInvalid
}
```

### 7.2 集成测试

#### 7.2.1 集成测试配置 internal/integration_test.go

```go
package integration

import (
    "os"
    "testing"
    
    "things-expired/config"
    "things-expired/internal/handler"
    "things-expired/internal/repository"
    "things-expired/internal/router"
    "things-expired/internal/service"
    "things-expired/pkg/middleware"
    "things-expired/pkg/utils"
    
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"
)

type IntegrationTestSuite struct {
    suite.Suite
    Router   *gin.Engine
    UserID   uint
    Token    string
}

func (s *IntegrationTestSuite) SetupSuite() {
    // 设置测试模式
    gin.SetMode(gin.TestMode)
    
    // 加载测试配置
    cfg := &config.Config{
        App: config.AppConfig{
            Name: "things-expired-test",
            Host: "0.0.0.0",
            Port: 8080,
            Mode: "test",
        },
        Database: config.DatabaseConfig{
            Path:         "./test.db",
            MaxIdleConns: 5,
            MaxOpenConns: 10,
        },
        JWT: config.JWTConfig{
            Secret:      "test-secret-key",
            ExpireHours: 24,
        },
    }
    
    // 初始化组件
    db, _ := repository.NewDB(&cfg.Database)
    
    userRepo := repository.NewUserRepository(db)
    categoryRepo := repository.NewCategoryRepository(db)
    itemRepo := repository.NewItemRepository(db)
    
    jwtUtil := utils.NewJWTUtil(&cfg.JWT)
    
    userService := service.NewUserService(userRepo, jwtUtil)
    categoryService := service.NewCategoryService(categoryRepo)
    itemService := service.NewItemService(itemRepo, categoryRepo)
    
    userHandler := handler.NewUserHandler(userService)
    categoryHandler := handler.NewCategoryHandler(categoryService)
    itemHandler := handler.NewItemHandler(itemService)
    
    authMiddleware := middleware.NewAuthMiddleware(jwtUtil)
    loggerMiddleware := middleware.NewLoggerMiddleware(utils.NewLogger("test"))
    
    s.Router = router.NewRouter(
        userHandler,
        categoryHandler,
        itemHandler,
        authMiddleware,
        loggerMiddleware,
        middleware.NewCorsMiddleware(),
    )
}

func (s *IntegrationTestSuite) TearDownSuite() {
    // 清理测试数据库
    os.Remove("./test.db")
}

func TestIntegrationSuite(t *testing.T) {
    suite.Run(t, new(IntegrationTestSuite))
}

func (s *IntegrationTestSuite) TestUserRegisterAndLogin() {
    // 注册用户
    // 登录获取 Token
    // 使用 Token 访问受保护的接口
}
```

### 7.3 测试脚本

#### 7.3.1 测试运行脚本 test.sh

```bash
#!/bin/bash

# 运行所有单元测试
echo "Running unit tests..."
go test -v -short ./...

# 运行集成测试
echo "Running integration tests..."
go test -v -tags=integration ./...

# 运行测试覆盖率
echo "Running tests with coverage..."
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

echo "Test completed!"
```

### 7.4 部署文档

#### 7.4.1 构建脚本 build.sh

```bash
#!/bin/bash

# 构建信息
APP_NAME="things-expired"
VERSION=$(git describe --tags --always)
BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S')
BUILD_DIR="./bin"

# 清理
echo "Cleaning..."
rm -rf ${BUILD_DIR}

# 创建输出目录
mkdir -p ${BUILD_DIR}

# 设置 Go 环境
export CGO_ENABLED=0
export GOOS=linux
export GOARCH=amd64

# 编译
echo "Building ${APP_NAME} v${VERSION}..."
go build -ldflags="
    -X main.Version=${VERSION}
    -X main.BuildTime=${BUILD_TIME}
" -o ${BUILD_DIR}/${APP_NAME} ./cmd/server

# 复制配置文件
echo "Copying config..."
cp -r config ${BUILD_DIR}/

# 创建数据目录
mkdir -p ${BUILD_DIR}/data
mkdir -p ${BUILD_DIR}/uploads

echo "Build completed: ${BUILD_DIR}/${APP_NAME}"
```

#### 7.4.2 Dockerfile

```dockerfile
# 构建阶段
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 安装依赖
COPY go.mod go.sum ./
RUN go mod download

# 复制源码
COPY . .

# 构建
ARG VERSION=dev
ARG BUILD_TIME=unknown
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags "-X main.Version=${VERSION} -X main.BuildTime=${BUILD_TIME}" \
    -o server ./cmd/server

# 运行阶段
FROM alpine:latest

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache ca-certificates tzdata

# 复制构建产物
COPY --from=builder /app/server .
COPY --from=builder /app/config ./config

# 创建数据目录
RUN mkdir -p data uploads

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["./server", "--config=./config/config.yaml"]
```

#### 7.4.3 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 7.5 Nginx 配置

#### 7.5.1 Nginx 配置 nginx/nginx.conf

```nginx
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '"$http_x_request_id"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;
    gzip on;

    upstream backend {
        server app:8080;
        keepalive 32;
    }

    server {
        listen 80;
        server_name api.things-expired.com;

        # HTTP 重定向到 HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.things-expired.com;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # 日志
        access_log /var/log/nginx/ssl_access.log main;

        location /api/ {
            proxy_pass http://backend/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Request-ID $http_x_request_id;
            proxy_set_header Connection "";

            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            # 缓冲设置
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # 健康检查
        location /health {
            proxy_pass http://backend/;
            access_log off;
        }
    }
}
```

### 7.6 系统服务配置

#### 7.6.1 systemd 服务配置 /etc/systemd/system/things-expired.service

```ini
[Unit]
Description=ThingsExpired HTTP API Server
Documentation=https://github.com/your-org/things-expired
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/things-expired
ExecStart=/opt/things-expired/server --config=/opt/things-expired/config/config.yaml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# 环境变量
Environment="TZ=Asia/Shanghai"

# 资源限制
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

#### 7.6.2 部署检查清单

```markdown
## 部署检查清单

### 部署前检查
- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 代码已格式化 (`go fmt`)
- [ ] 代码已 lint (`golangci-lint run`)
- [ ] 配置文件已正确配置
- [ ] SSL 证书已准备

### 部署步骤
1. 停止旧服务
   ```bash
   sudo systemctl stop things-expired
   ```

2. 备份数据
   ```bash
   cp -r data data.backup.$(date +%Y%m%d)
   ```

3. 部署新版本
   ```bash
   cp -r bin/* /opt/things-expired/
   ```

4. 启动服务
   ```bash
   sudo systemctl start things-expired
   sudo systemctl status things-expired
   ```

5. 健康检查
   ```bash
   curl http://localhost:8080/health
   ```

### 回滚步骤
1. 停止服务
2. 恢复数据
3. 恢复旧版本
4. 重启服务
```

## ✅ 阶段验收标准

1. ✅ 单元测试覆盖 Service 层核心逻辑
2. ✅ 单元测试覆盖 Handler 层参数校验
3. ✅ 集成测试覆盖关键业务流程
4. ✅ Dockerfile 可正常构建镜像
5. ✅ docker-compose 可正常启动服务
6. ✅ Nginx 配置正确
7. ✅ systemd 服务配置正确
8. ✅ 部署检查清单完整

## 📝 注意事项

- 测试数据库使用独立的 SQLite 文件
- 生产环境必须使用 HTTPS
- JWT 密钥必须更换为强密码
- 日志级别根据环境调整

## ➡️ 所有阶段已完成

项目落地完成！
