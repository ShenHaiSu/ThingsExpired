using System;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows;
using Hardcodet.Wpf.TaskbarNotification;
using Microsoft.Web.WebView2.Core;
using ThingsExpired.App.Helpers;
using ThingsExpired.App.Services;

namespace ThingsExpired.App;

/// <summary>
/// 主窗口类
/// 包含WebView2控件和系统托盘功能
/// </summary>
public partial class MainWindow : Window
{
    private readonly WebAssetLoader _assetLoader;
    private readonly BridgeService _bridgeService;
    private readonly ApiProxyService _apiProxyService;
    private bool _isExiting = false;

    /// <summary>
    /// 构造函数
    /// </summary>
    public MainWindow()
    {
        InitializeComponent();

        // 通过文件路径动态设置图标（避免 XAML pack URI 资源解析问题）
        var iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets", "icon.ico");
        if (File.Exists(iconPath))
        {
            // 设置窗口图标
            Icon = new System.Windows.Media.Imaging.BitmapImage(new Uri(iconPath));
            // Hardcodet NotifyIcon 的 IconSource 属性内部依赖 pack URI，
            // 改用 Icon 属性（System.Drawing.Icon），从文件直接加载
            trayIcon.Icon = new Icon(iconPath);
        }

        // 初始化服务
        _assetLoader = new WebAssetLoader();
        _bridgeService = new BridgeService();
        _apiProxyService = new ApiProxyService();

        // 初始化WebView
        InitializeWebView();
    }

    /// <summary>
    /// 初始化WebView2控件
    /// </summary>
    private async void InitializeWebView()
    {
        try
        {
            // 确保WebView2环境已初始化
            await webView.EnsureCoreWebView2Async();

            // 注册桥接对象供JavaScript调用
            webView.CoreWebView2.AddHostObjectToScript("nativeBridge", _bridgeService);

            // 配置WebView2设置
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
            webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
            webView.CoreWebView2.Settings.IsScriptEnabled = true;
            webView.CoreWebView2.Settings.IsWebMessageEnabled = true;

            // 处理新窗口请求(外部链接用系统浏览器打开)
            webView.CoreWebView2.NewWindowRequested += OnNewWindowRequested;

            // 处理导航完成事件
            webView.CoreWebView2.NavigationCompleted += OnNavigationCompleted;

            if (_assetLoader.HasLocalAssets())
            {
                var basePath = _assetLoader.GetBasePath();
                // 设置虚拟域名映射，以HTTPS协议加载本地资源，规避file://协议的CORS限制
                // 将 app.things.local 域名映射到 webapp 文件夹
                webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "app.things.local", basePath,
                    CoreWebView2HostResourceAccessKind.DenyCors);

                // 本地资源模式：拦截 https://app.things.local/api/* 请求
                // 前端 Axios baseURL="/api"，在 https://app.things.local 下发出同源请求
                webView.CoreWebView2.AddWebResourceRequestedFilter(
                    "https://app.things.local/api/*",
                    CoreWebView2WebResourceContext.All);
            }
            else
            {
                // 回退模式：拦截 http://localhost:8080/api/* 请求
                // 前端 Axios baseURL="/api"，在 http://localhost:8080 下发出同源请求
                webView.CoreWebView2.AddWebResourceRequestedFilter(
                    "http://localhost:8080/api/*",
                    CoreWebView2WebResourceContext.All);
            }

            // 注册WebResourceRequested事件处理（始终生效，无论哪种模式）
            webView.CoreWebView2.WebResourceRequested += OnWebResourceRequested;

            // 加载Web应用
            LoadWebApp();

#if DEBUG
            // 调试模式下打开开发者工具
            webView.CoreWebView2.OpenDevToolsWindow();
#endif
        }
        catch (Exception ex)
        {
            MessageBox.Show($"初始化WebView失败: {ex.Message}", "错误", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    /// <summary>
    /// 加载Web应用
    /// </summary>
    private void LoadWebApp()
    {
        // 优先使用本地打包资源
        if (_assetLoader.HasLocalAssets())
        {
            // 使用虚拟域名加载，在HTTPS协议上下文加载本地资源，规避file://协议的CORS限制
            // API请求通过WebResourceRequested拦截并转发到本地后端
            webView.Source = new Uri("https://app.things.local/index.html");
        }
        else
        {
            // 回退到本地开发服务器(可根据实际情况修改)
            // 注意：前端 Axios baseURL="/api" 为相对路径，请求会发到同源 localhost:8080/api/...
            // 这些请求同样被 WebResourceRequested 拦截并转发，避免虚拟域名无API服务的问题
            webView.Source = new Uri("http://localhost:8080");
        }
    }

    /// <summary>
    /// 处理新窗口请求(外部链接)
    /// </summary>
    private void OnNewWindowRequested(object? sender, CoreWebView2NewWindowRequestedEventArgs e)
    {
        // 使用系统浏览器打开外部链接
        if (e.Uri.StartsWith("http://") || e.Uri.StartsWith("https://"))
        {
            // 检查是否为应用内部链接
            if (!e.Uri.Contains("thingsexpired.com") && !_assetLoader.HasLocalAssets())
            {
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = e.Uri,
                    UseShellExecute = true
                });
                e.Handled = true;
            }
        }
    }

    /// <summary>
    /// 处理导航完成事件
    /// </summary>
    private void OnNavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            // 导航成功，可以注入额外的JavaScript
            InjectPlatformScript();
        }
    }

    /// <summary>
    /// 注入平台标识脚本
    /// </summary>
    private void InjectPlatformScript()
    {
        var script = @"
            window.__PLATFORM__ = 'windows';
            window.__APP_VERSION__ = '" + GetAppVersion() + @"';
        ";
        webView.CoreWebView2.ExecuteScriptAsync(script);
    }

    /// <summary>
    /// 获取应用版本
    /// </summary>
    private string GetAppVersion()
    {
        return Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0";
    }

    /// <summary>
    /// 窗口关闭事件处理
    /// </summary>
    private void OnWindowClosing(object sender, CancelEventArgs e)
    {
        if (!_isExiting)
        {
            // 最小化到托盘而不是关闭
            e.Cancel = true;
            Hide();
            trayIcon.ShowBalloonTip("ThingsExpired", "应用已最小化到系统托盘", BalloonIcon.Info);
        }
    }

    /// <summary>
    /// 双击托盘图标显示窗口
    /// </summary>
    private void OnTrayIconDoubleClick(object sender, RoutedEventArgs e)
    {
        ShowWindow();
    }

    /// <summary>
    /// 点击菜单"打开主窗口"
    /// </summary>
    private void OnShowWindowClick(object sender, RoutedEventArgs e)
    {
        ShowWindow();
    }

    /// <summary>
    /// 显示主窗口
    /// </summary>
    private void ShowWindow()
    {
        Show();
        Activate();
        Focus();
    }

    /// <summary>
    /// 点击菜单"检查过期物品"
    /// </summary>
    private void OnCheckExpiryClick(object sender, RoutedEventArgs e)
    {
        // 触发前端检查过期物品
        webView.CoreWebView2.ExecuteScriptAsync("window.dispatchEvent(new CustomEvent('checkExpiryItems'));");
    }

    /// <summary>
    /// 点击菜单"退出"
    /// </summary>
    private void OnExitClick(object sender, RoutedEventArgs e)
    {
        ExitApplication();
    }

    /// <summary>
    /// 处理WebResourceRequested事件
    /// 拦截API请求并转发到真实后端服务器
    /// </summary>
    private async void OnWebResourceRequested(object? sender, CoreWebView2WebResourceRequestedEventArgs e)
    {
        await _apiProxyService.HandleWebResourceRequestedAsync(webView.CoreWebView2.Environment, e);
    }

    /// <summary>
    /// 退出应用程序
    /// </summary>
    public void ExitApplication()
    {
        _isExiting = true;
        
        // 释放API代理服务资源
        _apiProxyService?.Dispose();
        
        trayIcon.Dispose();
        Application.Current.Shutdown();
    }

    /// <summary>
    /// 获取WebView2实例(供外部调用)
    /// </summary>
    public CoreWebView2? GetWebView()
    {
        return webView.CoreWebView2;
    }
}