# ThingsExpired 部署指南

## 目录结构

```
things-expired/
├── cmd/server/           # 应用入口
├── config/               # 配置文件
├── data/                 # 数据目录（SQLite 数据库）
├── uploads/              # 上传文件目录
├── deploy/               # 部署相关配置
│   ├── nginx.conf       # Nginx 配置
│   ├── things-expired.service  # systemd 服务配置
│   └── README.md        # 本文件
├── Dockerfile
├── docker-compose.yml
└── ...
```

## 部署方式

### 方式一：Docker 部署（推荐）

1. 构建并启动容器：
```bash
docker-compose up -d
```

2. 查看日志：
```bash
docker-compose logs -f
```

3. 停止服务：
```bash
docker-compose down
```

### 方式二：直接部署

1. 编译二进制文件：
```bash
go build -o server ./cmd/server
```

2. 创建部署目录：
```bash
sudo mkdir -p /opt/things-expired/{data,uploads,config}
```

3. 复制文件：
```bash
sudo cp server /opt/things-expired/
sudo cp config/config.yaml /opt/things-expired/config/
sudo chown -R www-data:www-data /opt/things-expired
```

4. 配置 systemd 服务：
```bash
sudo cp deploy/things-expired.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable things-expired
sudo systemctl start things-expired
```

5. 配置 Nginx：
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/things-expired
sudo ln -s /etc/nginx/sites-available/things-expired /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 环境变量

可以通过环境变量覆盖配置文件中的某些设置：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| TZ | 时区 | Asia/Shanghai |
| CONFIG_PATH | 配置文件路径 | config/config.yaml |

## 健康检查

- 容器内：`docker exec things-expired wget --spider http://localhost:8080/api/user/login`
- 直接部署：`curl http://localhost:8080/api/user/login`

## 日志查看

### Docker 部署
```bash
docker-compose logs -f app
```

### 直接部署
```bash
# journald 日志
journalctl -u things-expired -f

# Nginx 日志
tail -f /var/log/nginx/things_expired_access.log
```

## 常见问题

### 1. 容器无法启动
检查配置文件是否正确挂载，以及数据目录权限。

### 2. 数据库连接失败
确认 SQLite 数据库文件路径是否正确，以及有读写权限。

### 3. 上传文件失败
确认 uploads 目录存在且有写权限。

## 生产环境注意事项

1. 修改 `config.yaml` 中的 JWT Secret 和其他敏感配置
2. 配置 HTTPS（参考 nginx.conf 中的注释）
3. 配置防火墙规则
4. 定期备份数据库
5. 监控服务状态
