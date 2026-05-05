using System;
using System.IO;
using CommunityToolkit.WinUI.Notifications;
using Windows.UI.Notifications;
using ThingsExpired.Core.Interfaces;

namespace ThingsExpired.App.Services;

/// <summary>
/// Windows原生通知服务
/// 使用Windows Toast Notification实现系统通知
/// 基于CommunityToolkit.WinUI.Notifications的桌面兼容API
/// </summary>
public class NotificationService : INotificationService
{
    private readonly string _defaultIconPath;

    /// <summary>
    /// 构造函数
    /// </summary>
    public NotificationService()
    {
        _defaultIconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets", "icon.ico");
    }

    /// <summary>
    /// 显示即时通知
    /// </summary>
    /// <param name="title">通知标题</param>
    /// <param name="message">通知内容</param>
    /// <param name="iconPath">图标路径(可选)</param>
    public void ShowNotification(string title, string message, string? iconPath = null)
    {
        try
        {
            var iconUri = iconPath ?? _defaultIconPath;
            
            // 使用ToastContentBuilder直接构建,通过GetXml()获取XML
            var xml = new ToastContentBuilder()
                .AddText(title)
                .AddText(message)
                .AddAppLogoOverride(new Uri(iconUri))
                .AddButton(new ToastButton()
                    .SetContent("查看详情")
                    .AddArgument("action", "viewItem"))
                .GetXml();

            // 通过ToastNotificationManagerCompat创建Toast通知(新版桌面兼容API)
            var toast = new ToastNotification(xml);
            ToastNotificationManagerCompat.CreateToastNotifier().Show(toast);
        }
        catch (Exception ex)
        {
            // 通知失败时记录日志但不抛出异常
            System.Diagnostics.Debug.WriteLine($"显示通知失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 调度定时通知
    /// </summary>
    /// <param name="title">通知标题</param>
    /// <param name="message">通知内容</param>
    /// <param name="scheduledTime">预定时间</param>
    /// <param name="notificationId">通知ID</param>
    public void ScheduleNotification(string title, string message, DateTime scheduledTime, int notificationId)
    {
        try
        {
            var xml = new ToastContentBuilder()
                .AddText(title)
                .AddText(message)
                .AddAppLogoOverride(new Uri(_defaultIconPath))
                .AddArgument("notificationId", notificationId)
                .GetXml();

            // 创建预定Toast通知
            var scheduledToast = new ScheduledToastNotification(xml, scheduledTime)
            {
                Id = notificationId.ToString()
            };

            ToastNotificationManagerCompat.CreateToastNotifier().AddToSchedule(scheduledToast);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"调度通知失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 取消预定的通知
    /// </summary>
    /// <param name="notificationId">通知ID</param>
    public void CancelScheduledNotification(int notificationId)
    {
        try
        {
            var notifier = ToastNotificationManagerCompat.CreateToastNotifier();
            var scheduledNotifications = notifier.GetScheduledToastNotifications();
            
            foreach (var notification in scheduledNotifications)
            {
                if (notification.Id == notificationId.ToString())
                {
                    notifier.RemoveFromSchedule(notification);
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"取消通知失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 清除所有预定的通知
    /// </summary>
    public void ClearAllScheduledNotifications()
    {
        try
        {
            var notifier = ToastNotificationManagerCompat.CreateToastNotifier();
            var scheduledNotifications = notifier.GetScheduledToastNotifications();
            
            foreach (var notification in scheduledNotifications)
            {
                notifier.RemoveFromSchedule(notification);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"清除所有通知失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 清除所有通知历史
    /// </summary>
    public void ClearHistory()
    {
        try
        {
            ToastNotificationManagerCompat.History.Clear();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"清除通知历史失败: {ex.Message}");
        }
    }
}