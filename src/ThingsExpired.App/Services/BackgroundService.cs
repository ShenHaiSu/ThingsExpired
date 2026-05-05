using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ThingsExpired.Core.Interfaces;
using ThingsExpired.Core.Models;

namespace ThingsExpired.App.Services;

/// <summary>
/// 后台任务服务
/// 定时检查即将过期的物品并发送通知
/// </summary>
public class BackgroundService : IDisposable, IBackgroundService
{
    private Timer? _checkTimer;
    private readonly NotificationService _notificationService;
    private readonly HttpClient _httpClient;
    private readonly string _apiBaseUrl;
    private bool _isRunning = false;

    /// <summary>
    /// 检查间隔(小时)
    /// </summary>
    public int CheckIntervalHours { get; set; } = 1;

    /// <summary>
    /// 构造函数
    /// </summary>
    public BackgroundService(NotificationService notificationService)
    {
        _notificationService = notificationService;
        _httpClient = new HttpClient();
        _apiBaseUrl = "https://thingsexpired.com"; // 可根据实际情况修改
    }

    /// <summary>
    /// 启动后台服务
    /// </summary>
    public void Start()
    {
        if (_isRunning)
        {
            return;
        }

        _isRunning = true;

        // 立即执行一次检查，然后按间隔定时执行
        _checkTimer = new Timer(
            CheckExpiringItems,
            null,
            TimeSpan.Zero,
            TimeSpan.FromHours(CheckIntervalHours)
        );
    }

    /// <summary>
    /// 停止后台服务
    /// </summary>
    public void Stop()
    {
        if (!_isRunning)
        {
            return;
        }

        _isRunning = false;
        _checkTimer?.Change(Timeout.Infinite, Timeout.Infinite);
    }

    /// <summary>
    /// 检查即将过期的物品
    /// </summary>
    private async void CheckExpiringItems(object? state)
    {
        try
        {
            // 获取存储的Token
            var token = GetStoredToken();
            if (string.IsNullOrEmpty(token))
            {
                System.Diagnostics.Debug.WriteLine("未找到用户Token，跳过检查");
                return;
            }

            // 调用API获取即将过期的物品
            var items = await FetchExpiringItems(token);

            // 发送通知
            foreach (var item in items)
            {
                _notificationService.ShowNotification(
                    "物品即将过期",
                    $"{item.Name} 将在 {item.RemainingDays} 天后过期"
                );
            }

            System.Diagnostics.Debug.WriteLine($"检查完成，发现 {items.Count} 个即将过期的物品");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"检查过期物品失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 从API获取即将过期的物品列表
    /// </summary>
    /// <param name="token">认证Token</param>
    /// <returns>即将过期的物品列表</returns>
    private async Task<List<ExpiringItem>> FetchExpiringItems(string token)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_apiBaseUrl}/api/items/expiring");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var items = JsonSerializer.Deserialize<List<ExpiringItem>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return items ?? new List<ExpiringItem>();
            }

            System.Diagnostics.Debug.WriteLine($"API请求失败: {response.StatusCode}");
            return new List<ExpiringItem>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"获取过期物品失败: {ex.Message}");
            return new List<ExpiringItem>();
        }
    }

    /// <summary>
    /// 获取存储的Token
    /// 从本地配置文件或WebView的localStorage获取
    /// </summary>
    /// <returns>Token字符串</returns>
    private string? GetStoredToken()
    {
        try
        {
            // 从应用数据目录读取Token
            var dataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "ThingsExpired"
            );

            var tokenFile = Path.Combine(dataDir, "token.txt");

            if (File.Exists(tokenFile))
            {
                return File.ReadAllText(tokenFile).Trim();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"读取Token失败: {ex.Message}");
        }

        return null;
    }

    /// <summary>
    /// 保存Token到本地
    /// </summary>
    /// <param name="token">Token字符串</param>
    public void SaveToken(string token)
    {
        try
        {
            var dataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "ThingsExpired"
            );

            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }

            var tokenFile = Path.Combine(dataDir, "token.txt");
            File.WriteAllText(tokenFile, token);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"保存Token失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 清除存储的Token
    /// </summary>
    public void ClearToken()
    {
        try
        {
            var dataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "ThingsExpired"
            );

            var tokenFile = Path.Combine(dataDir, "token.txt");

            if (File.Exists(tokenFile))
            {
                File.Delete(tokenFile);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"清除Token失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 手动触发检查
    /// </summary>
    public async Task ManualCheck()
    {
        await Task.Run(() => CheckExpiringItems(null));
    }

    /// <summary>
    /// 释放资源
    /// </summary>
    public void Dispose()
    {
        Stop();
        _checkTimer?.Dispose();
        _httpClient?.Dispose();
    }
}