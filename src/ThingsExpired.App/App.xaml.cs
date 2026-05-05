using System.Windows;
using ThingsExpired.App.Services;

namespace ThingsExpired.App;

/// <summary>
/// 应用入口类
/// </summary>
public partial class App : Application
{
    private BackgroundService? _backgroundService;
    private NotificationService? _notificationService;

    /// <summary>
    /// 应用启动时初始化服务
    /// </summary>
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // 初始化通知服务
        // ToastNotificationManagerCompat 自动初始化，无需显式注册
        _notificationService = new NotificationService();

        // 初始化并启动后台服务
        _backgroundService = new BackgroundService(_notificationService);
        _backgroundService.Start();
    }

    /// <summary>
    /// 应用退出时清理资源
    /// </summary>
    protected override void OnExit(ExitEventArgs e)
    {
        // 停止后台服务
        _backgroundService?.Stop();
        _backgroundService?.Dispose();

        base.OnExit(e);
    }

    /// <summary>
    /// 获取通知服务实例
    /// </summary>
    public NotificationService? GetNotificationService()
    {
        return _notificationService;
    }
}