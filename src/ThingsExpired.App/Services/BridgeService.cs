using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using ThingsExpired.Core.Models;

namespace ThingsExpired.App.Services;

/// <summary>
/// JS桥接服务
/// 提供JavaScript与原生代码通信的接口
/// </summary>
[ClassInterface(ClassInterfaceType.AutoDual)]
[ComVisible(true)]
public class BridgeService
{
    private readonly NotificationService _notificationService;

    /// <summary>
    /// 构造函数
    /// </summary>
    public BridgeService()
    {
        _notificationService = new NotificationService();
    }

    /// <summary>
    /// 获取运行平台标识
    /// </summary>
    /// <returns>平台标识字符串</returns>
    public string GetPlatform()
    {
        return "windows-desktop";
    }

    /// <summary>
    /// 显示原生通知
    /// </summary>
    /// <param name="title">通知标题</param>
    /// <param name="message">通知内容</param>
    public void ShowNotification(string title, string message)
    {
        _notificationService.ShowNotification(title, message);
    }

    /// <summary>
    /// 调度物品过期提醒
    /// </summary>
    /// <param name="itemId">物品ID</param>
    /// <param name="itemName">物品名称</param>
    /// <param name="expiredAt">过期时间(ISO格式字符串)</param>
    /// <param name="remindDays">提前提醒天数</param>
    public void ScheduleReminder(int itemId, string itemName, string expiredAt, int remindDays)
    {
        try
        {
            var expiredDate = DateTime.Parse(expiredAt);
            var remindTime = expiredDate.AddDays(-remindDays);

            // 如果提醒时间已过，则立即通知
            if (remindTime <= DateTime.Now)
            {
                _notificationService.ShowNotification(
                    "物品过期提醒",
                    $"{itemName} 即将过期或已过期"
                );
            }
            else
            {
                _notificationService.ScheduleNotification(
                    "物品过期提醒",
                    $"{itemName} 即将过期",
                    remindTime,
                    itemId
                );
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"调度提醒失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 取消物品提醒
    /// </summary>
    /// <param name="itemId">物品ID</param>
    public void CancelReminder(int itemId)
    {
        _notificationService.CancelScheduledNotification(itemId);
    }

    /// <summary>
    /// 获取应用版本
    /// </summary>
    /// <returns>版本字符串</returns>
    public string GetAppVersion()
    {
        return Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0";
    }

    /// <summary>
    /// 获取设备唯一标识
    /// </summary>
    /// <returns>设备标识</returns>
    public string GetDeviceId()
    {
        return Environment.MachineName;
    }

    /// <summary>
    /// 获取应用数据目录
    /// </summary>
    /// <returns>数据目录路径</returns>
    public string GetDataDirectory()
    {
        var dataDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "ThingsExpired"
        );

        // 确保目录存在
        if (!Directory.Exists(dataDir))
        {
            Directory.CreateDirectory(dataDir);
        }

        return dataDir;
    }

    /// <summary>
    /// 打开外部链接
    /// </summary>
    /// <param name="url">链接地址</param>
    public void OpenExternalLink(string url)
    {
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"打开链接失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 检查是否支持原生通知
    /// </summary>
    /// <returns>是否支持</returns>
    public bool SupportsNativeNotification()
    {
        return true;
    }

    /// <summary>
    /// 获取系统语言
    /// </summary>
    /// <returns>语言代码</returns>
    public string GetSystemLanguage()
    {
        return System.Globalization.CultureInfo.CurrentUICulture.Name;
    }

    /// <summary>
    /// 获取系统主题模式
    /// </summary>
    /// <returns>主题模式(light/dark)</returns>
    public string GetSystemTheme()
    {
        // Windows 10+ 可以通过注册表获取系统主题
        try
        {
            using var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(
                "Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize");
            
            if (key != null)
            {
                var value = key.GetValue("AppsUseLightTheme");
                if (value != null && (int)value == 0)
                {
                    return "dark";
                }
            }
        }
        catch
        {
            // 获取失败时返回默认值
        }

        return "light";
    }

    /// <summary>
    /// 写入日志
    /// </summary>
    /// <param name="level">日志级别</param>
    /// <param name="message">日志消息</param>
    public void Log(string level, string message)
    {
        System.Diagnostics.Debug.WriteLine($"[{level}] {message}");
    }
}