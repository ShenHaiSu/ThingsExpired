package service

import (
	"context"
	"sync"
	"time"

	"things-expired/config"
	"things-expired/internal/repository"
	"things-expired/pkg/utils"

	"go.uber.org/zap"
)

// 物品状态常量
const (
	StatusNormal  int8 = 1 // 正常
	StatusExpired int8 = 2 // 已过期
	StatusUsed    int8 = 3 // 已消耗
)

// IItemExpirationService 物品过期检查服务接口
type IItemExpirationService interface {
	// Start 启动过期检查任务
	// 在应用启动时调用，启动后台 goroutine
	Start(ctx context.Context) error

	// Stop 停止过期检查任务
	// 在应用关闭时调用，优雅停止
	Stop() error

	// CheckExpiredItems 执行一次过期检查
	// 可用于手动触发或测试
	CheckExpiredItems(ctx context.Context) (int, error)
}

// ItemExpirationService 物品过期检查服务实现
type ItemExpirationService struct {
	itemRepo repository.IItemRepository
	config   *config.ExpirationConfig
	logger   *utils.Logger
	ticker   *time.Ticker
	stopChan chan struct{}
	running  bool
	mu       sync.Mutex
}

// NewItemExpirationService 创建过期检查服务
func NewItemExpirationService(
	itemRepo repository.IItemRepository,
	cfg *config.ExpirationConfig,
	logger *utils.Logger,
) IItemExpirationService {
	// 设置默认值
	if cfg.IntervalSec <= 0 {
		cfg.IntervalSec = 3600 // 默认1小时
	}
	if cfg.BatchSize <= 0 {
		cfg.BatchSize = 100 // 默认每次处理100条
	}

	return &ItemExpirationService{
		itemRepo: itemRepo,
		config:   cfg,
		logger:   logger,
		stopChan: make(chan struct{}),
		running:  false,
	}
}

// Start 启动过期检查任务
func (s *ItemExpirationService) Start(ctx context.Context) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.running {
		return nil // 已经在运行
	}

	if !s.config.Enabled {
		s.logger.Info("过期检查任务已禁用")
		return nil
	}

	// 创建定时器
	interval := time.Duration(s.config.IntervalSec) * time.Second
	s.ticker = time.NewTicker(interval)
	s.running = true

	// 启动后台 goroutine
	go s.run(ctx)

	s.logger.Info("过期检查任务已启动",
		zap.Int("interval_sec", s.config.IntervalSec),
		zap.Int("batch_size", s.config.BatchSize),
	)

	return nil
}

// run 后台任务主循环
func (s *ItemExpirationService) run(ctx context.Context) {
	// 启动时先执行一次
	s.checkOnce(ctx)

	for {
		select {
		case <-s.ticker.C:
			// 定时触发
			s.checkOnce(ctx)
		case <-s.stopChan:
			// 收到停止信号
			s.logger.Info("过期检查任务收到停止信号")
			return
		case <-ctx.Done():
			// 上下文取消（应用关闭）
			s.logger.Info("过期检查任务上下文已取消")
			return
		}
	}
}

// checkOnce 执行一次检查
func (s *ItemExpirationService) checkOnce(ctx context.Context) {
	count, err := s.CheckExpiredItems(ctx)
	if err != nil {
		s.logger.Error("过期检查失败", zap.Error(err))
		return
	}

	if count > 0 {
		s.logger.Info("过期检查完成",
			zap.Int("updated_count", count),
		)
	}
}

// CheckExpiredItems 执行一次过期检查
// 返回更新的物品数量
func (s *ItemExpirationService) CheckExpiredItems(ctx context.Context) (int, error) {
	// 1. 获取已过期但状态仍为正常的物品
	items, err := s.itemRepo.GetExpiredItems(ctx, s.config.BatchSize)
	if err != nil {
		return 0, err
	}

	if len(items) == 0 {
		return 0, nil
	}

	// 2. 收集需要更新的 ID
	ids := make([]uint, 0, len(items))
	for _, item := range items {
		ids = append(ids, item.ID)
	}

	// 3. 批量更新状态
	if err := s.itemRepo.BatchUpdateStatus(ctx, ids, StatusExpired); err != nil {
		return 0, err
	}

	return len(items), nil
}

// Stop 停止过期检查任务
func (s *ItemExpirationService) Stop() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.running {
		return nil
	}

	// 停止定时器
	if s.ticker != nil {
		s.ticker.Stop()
	}

	// 发送停止信号
	close(s.stopChan)
	s.running = false

	s.logger.Info("过期检查任务已停止")

	return nil
}