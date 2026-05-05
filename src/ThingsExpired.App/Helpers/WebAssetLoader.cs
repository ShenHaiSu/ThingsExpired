using System;
using System.IO;

namespace ThingsExpired.App.Helpers;

/// <summary>
/// Web资源加载器
/// 用于加载本地打包的Web应用资源
/// </summary>
public class WebAssetLoader
{
    private readonly string _basePath;

    /// <summary>
    /// 构造函数
    /// </summary>
    public WebAssetLoader()
    {
        _basePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "webapp");
    }

    /// <summary>
    /// 检查是否存在本地Web资源
    /// </summary>
    /// <returns>是否存在本地资源</returns>
    public bool HasLocalAssets()
    {
        return File.Exists(GetIndexPath());
    }

    /// <summary>
    /// 获取index.html文件路径
    /// </summary>
    /// <returns>index.html完整路径</returns>
    public string GetIndexPath()
    {
        return Path.Combine(_basePath, "index.html");
    }

    /// <summary>
    /// 获取指定资源的路径
    /// </summary>
    /// <param name="relativePath">相对路径</param>
    /// <returns>资源完整路径</returns>
    public string GetAssetPath(string relativePath)
    {
        return Path.Combine(_basePath, relativePath);
    }

    /// <summary>
    /// 获取Web应用基础路径
    /// </summary>
    /// <returns>基础路径</returns>
    public string GetBasePath()
    {
        return _basePath;
    }

    /// <summary>
    /// 检查指定资源是否存在
    /// </summary>
    /// <param name="relativePath">相对路径</param>
    /// <returns>是否存在</returns>
    public bool AssetExists(string relativePath)
    {
        return File.Exists(GetAssetPath(relativePath));
    }

    /// <summary>
    /// 获取所有资源文件列表
    /// </summary>
    /// <returns>资源文件列表</returns>
    public string[] GetAllAssets()
    {
        if (!Directory.Exists(_basePath))
        {
            return Array.Empty<string>();
        }

        return Directory.GetFiles(_basePath, "*", SearchOption.AllDirectories);
    }
}