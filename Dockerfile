# 构建阶段
FROM golang:1.21-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache gcc musl-dev

# 设置工作目录
WORKDIR /app

# 复制源代码
COPY . .

# 下载依赖
RUN go mod download

# 构建二进制文件
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o server ./cmd/server

# 运行阶段
FROM alpine:latest

# 安装运行时依赖
RUN apk add --no-cache ca-certificates tzdata

# 设置时区
ENV TZ=Asia/Shanghai

# 创建应用目录
RUN mkdir -p /app/data /app/uploads

# 从构建阶段复制二进制文件
COPY --from=builder /app/server .
COPY --from=builder /app/config ./config

# 复制配置文件（如果存在）
COPY config/config.yaml /app/config/config.yaml

# 设置工作目录
WORKDIR /app

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/user/login || exit 1

# 启动命令
CMD ["./server", "/app/config/config.yaml"]
