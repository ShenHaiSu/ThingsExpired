namespace ThingsExpired.Core.Interfaces;

/// <summary>
/// 通知服务接口
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// 显示即时通知
    /// </summary>
    /// <param name="title">通知标题</param>
    /// <param name="message">通知内容</param>
    /// <param name="iconPath">图标路径(可选)</param>
    void ShowNotification(string title, string message, string? iconPath = null);

    /// <summary>
    /// 调度定时通知
    /// </summary>
    /// <param name="title">通知标题</param>
    /// <param name="message">通知内容</param>
    /// <param name="scheduledTime">预定时间</param>
    /// <param name="notificationId">通知ID</param>
    void ScheduleNotification(string title, string message, DateTime scheduledTime, int notificationId);

    /// <summary>
    /// 取消预定的通知
    /// </summary>
    /// <param name="notificationId">通知ID</param>
    void CancelScheduledNotification(int notificationId);
}

/// <summary>
/// 后台服务接口
/// </summary>
public interface IBackgroundService
{
    /// <summary>
    /// 启动后台服务
    /// </summary>
    void Start();

    /// <summary>
    /// 停止后台服务
    /// </summary>
    void Stop();
}