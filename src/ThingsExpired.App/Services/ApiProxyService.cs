using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Web.WebView2.Core;

namespace ThingsExpired.App.Services;

/// <summary>
/// API代理服务
/// 用于拦截WebView2中的API请求并转发到真实后端服务器
/// </summary>
public class ApiProxyService : IDisposable
{
    private readonly HttpClient _httpClient;
    
    /// <summary>
    /// 真实后端API基础地址
    /// 可根据实际部署环境配置
    /// </summary>
    public string RealApiBaseUrl { get; set; } = "http://localhost:8080";

    /// <summary>
    /// 构造函数
    /// </summary>
    public ApiProxyService()
    {
        _httpClient = new HttpClient(new HttpClientHandler
        {
            // 生产环境应配置正确证书验证
        });
        
        // 设置默认请求头
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    /// <summary>
    /// 判断是否需要转发该请求
    /// 规则：
    /// 1. 所有 /api 径的请求需要转发
    /// 2. 所有非GET请求需要转发（POST、PUT、DELETE等）
    /// </summary>
    /// <param name="uri">请求URI</param>
    /// <param name="method">请求方法</param>
    /// <returns>是否需要转发</returns>
    public bool ShouldProxyRequest(Uri uri, string method)
    {
        // 检查是否为API路径
        if (uri.AbsolutePath.StartsWith("/api", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // 检查是否为非GET请求（真实数据操作）
        if (!string.Equals(method, "GET", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    /// <summary>
    /// 处理WebResourceRequested事件，转发API请求
    /// </summary>
    /// <param name="environment">WebView2环境</param>
    /// <param name="e">事件参数</param>
    public async Task HandleWebResourceRequestedAsync(CoreWebView2Environment environment, CoreWebView2WebResourceRequestedEventArgs e)
    {
        try
        {
            var request = e.Request;
            var uri = new Uri(request.Uri);
            var method = request.Method;

            // 检查是否需要转发
            if (!ShouldProxyRequest(uri, method))
            {
                // 不需要转发，让WebView2正常处理
                return;
            }

            // 构建真实API请求URL
            var realApiUrl = BuildRealApiUrl(uri);
            
            // 创建转发请求
            var proxyRequest = await CreateProxyRequestAsync(realApiUrl, method, request);
            
            // 发送请求并获取响应
            var response = await _httpClient.SendAsync(proxyRequest);
            
            // 创建WebView2响应
            var webViewResponse = await CreateWebViewResponseAsync(environment, response);
            
            // 设置响应给WebView2
            e.Response = webViewResponse;
        }
        catch (Exception ex)
        {
            // 发生错误时返回错误响应
            e.Response = await CreateErrorResponseAsync(environment, ex);
        }
    }

    /// <summary>
    /// 构建真实API URL
    /// </summary>
    /// <param name="originalUri">原始请求URI</param>
    /// <returns>真实API URL</returns>
    private string BuildRealApiUrl(Uri originalUri)
    {
        // 替换虚拟域名为真实API地址
        var pathAndQuery = originalUri.PathAndQuery;
        return $"{RealApiBaseUrl}{pathAndQuery}";
    }

    /// <summary>
    /// 创建转发请求
    /// </summary>
    /// <param name="url">目标URL</param>
    /// <param name="method">请求方法</param>
    /// <param name="originalRequest">原始WebView2请求</param>
    /// <returns>HttpRequestMessage</returns>
    private async Task<HttpRequestMessage> CreateProxyRequestAsync(string url, string method, CoreWebView2WebResourceRequest originalRequest)
    {
        var httpMethod = new HttpMethod(method);
        var request = new HttpRequestMessage(httpMethod, url);

        // 复制请求头
        if (originalRequest.Headers != null)
        {
            foreach (var header in originalRequest.Headers)
            {
                // 跳过某些由HttpClient自动处理的头
                if (!ShouldSkipHeader(header.Key))
                {
                    request.Headers.TryAddWithoutValidation(header.Key, header.Value);
                }
            }
        }

        // 复制请求体（POST、PUT等请求）
        if (originalRequest.Content != null && httpMethod != HttpMethod.Get)
        {
            // 读取请求体内容
            var contentBytes = await ReadRequestContentAsync(originalRequest.Content);
            
            // 根据Content-Type创建合适的HttpContent
            var contentType = GetContentType(originalRequest);
            request.Content = CreateHttpContent(contentBytes, contentType);
        }

        return request;
    }

    /// <summary>
    /// 读取WebView2请求体内容
    /// </summary>
    /// <param name="content">WebView2请求内容</param>
    /// <returns>字节数组</returns>
    private async Task<byte[]> ReadRequestContentAsync(object content)
    {
        try
        {
            // CoreWebView2WebResourceRequest的Content属性是IInputStream类型
            // 使用动态类型来处理
            if (content == null) return Array.Empty<byte>();
            
            // 尝试获取AsStream方法
            var streamMethod = content.GetType().GetMethod("AsStream");
            if (streamMethod != null)
            {
                var stream = streamMethod.Invoke(content, null) as Stream;
                if (stream != null)
                {
                    using var memoryStream = new MemoryStream();
                    await stream.CopyToAsync(memoryStream);
                    return memoryStream.ToArray();
                }
            }
            
            return Array.Empty<byte>();
        }
        catch
        {
            return Array.Empty<byte>();
        }
    }

    /// <summary>
    /// 创建WebView2响应对象
    /// </summary>
    /// <param name="environment">WebView2环境</param>
    /// <param name="response">HTTP响应</param>
    /// <returns>CoreWebView2WebResourceResponse</returns>
    private async Task<CoreWebView2WebResourceResponse> CreateWebViewResponseAsync(CoreWebView2Environment environment, HttpResponseMessage response)
    {
        // 获取响应内容
        var contentBytes = await response.Content.ReadAsByteArrayAsync();
        var contentStream = new MemoryStream(contentBytes);
        
        // 构建响应头字符串
        var headers = BuildResponseHeaders(response);

        // 通过CoreWebView2Environment创建响应对象
        return environment.CreateWebResourceResponse(
            contentStream,
            (int)response.StatusCode,
            GetStatusDescription(response.StatusCode),
            headers
        );
    }

    /// <summary>
    /// 创建错误响应
    /// </summary>
    /// <param name="environment">WebView2环境</param>
    /// <param name="ex">异常</param>
    /// <returns>CoreWebView2WebResourceResponse</returns>
    private Task<CoreWebView2WebResourceResponse> CreateErrorResponseAsync(CoreWebView2Environment environment, Exception ex)
    {
        var errorContent = $"{{\"error\": \"{ex.Message}\"}}";
        var errorBytes = Encoding.UTF8.GetBytes(errorContent);
        var errorStream = new MemoryStream(errorBytes);
        
        var response = environment.CreateWebResourceResponse(
            errorStream,
            500,
            "Internal Server Error",
            "Content-Type: application/json\r\n"
        );
        
        return Task.FromResult(response);
    }

    /// <summary>
    /// 判断是否跳过某个请求头
    /// </summary>
    /// <param name="headerName">请求头名称</param>
    /// <returns>是否跳过</returns>
    private bool ShouldSkipHeader(string headerName)
    {
        // 这些头由HttpClient自动处理
        var skipHeaders = new[] { "Host", "Content-Length", "Transfer-Encoding", "Connection" };
        return skipHeaders.Contains(headerName, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// 获取请求的Content-Type
    /// </summary>
    /// <param name="request">WebView2请求</param>
    /// <returns>Content-Type字符串</returns>
    private string GetContentType(CoreWebView2WebResourceRequest request)
    {
        if (request.Headers != null)
        {
            foreach (var header in request.Headers)
            {
                if (string.Equals(header.Key, "Content-Type", StringComparison.OrdinalIgnoreCase))
                {
                    return header.Value;
                }
            }
        }
        return "application/json";
    }

    /// <summary>
    /// 创建HttpContent
    /// </summary>
    /// <param name="content">内容字节</param>
    /// <param name="contentType">Content-Type</param>
    /// <returns>HttpContent</returns>
    private HttpContent CreateHttpContent(byte[] content, string contentType)
    {
        var httpContent = new ByteArrayContent(content);
        httpContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return httpContent;
    }

    /// <summary>
    /// 构建响应头字符串
    /// </summary>
    /// <param name="response">HTTP响应</param>
    /// <returns>响应头字符串</returns>
    private string BuildResponseHeaders(HttpResponseMessage response)
    {
        var headersBuilder = new StringBuilder();
        
        // 添加Content-Type
        if (response.Content.Headers.ContentType != null)
        {
            headersBuilder.AppendLine($"Content-Type: {response.Content.Headers.ContentType}");
        }
        
        // 添加Content-Length
        if (response.Content.Headers.ContentLength != null)
        {
            headersBuilder.AppendLine($"Content-Length: {response.Content.Headers.ContentLength}");
        }
        
        // 添加CORS相关响应头
        headersBuilder.AppendLine("Access-Control-Allow-Origin: *");
        headersBuilder.AppendLine("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        headersBuilder.AppendLine("Access-Control-Allow-Headers: Content-Type, Authorization");
        
        // 添加其他响应头
        foreach (var header in response.Headers)
        {
            headersBuilder.AppendLine($"{header.Key}: {string.Join(", ", header.Value)}");
        }
        
        foreach (var header in response.Content.Headers)
        {
            if (header.Key != "Content-Type" && header.Key != "Content-Length")
            {
                headersBuilder.AppendLine($"{header.Key}: {string.Join(", ", header.Value)}");
            }
        }
        
        return headersBuilder.ToString();
    }

    /// <summary>
    /// 获取HTTP状态码描述
    /// </summary>
    /// <param name="statusCode">状态码</param>
    /// <returns>状态描述</returns>
    private string GetStatusDescription(System.Net.HttpStatusCode statusCode)
    {
        return statusCode switch
        {
            System.Net.HttpStatusCode.OK => "OK",
            System.Net.HttpStatusCode.Created => "Created",
            System.Net.HttpStatusCode.NoContent => "No Content",
            System.Net.HttpStatusCode.BadRequest => "Bad Request",
            System.Net.HttpStatusCode.Unauthorized => "Unauthorized",
            System.Net.HttpStatusCode.Forbidden => "Forbidden",
            System.Net.HttpStatusCode.NotFound => "Not Found",
            System.Net.HttpStatusCode.InternalServerError => "Internal Server Error",
            _ => statusCode.ToString()
        };
    }

    /// <summary>
    /// 释放资源
    /// </summary>
    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}