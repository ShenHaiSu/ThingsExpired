namespace ThingsExpired.Core.Models;

/// <summary>
/// 物品信息
/// </summary>
public class Item
{
    /// <summary>
    /// 物品ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 物品名称
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 物品分类ID
    /// </summary>
    public int CategoryId { get; set; }

    /// <summary>
    /// 物品分类名称
    /// </summary>
    public string? CategoryName { get; set; }

    /// <summary>
    /// 过期时间
    /// </summary>
    public DateTime ExpiredAt { get; set; }

    /// <summary>
    /// 提前提醒天数
    /// </summary>
    public int RemindDays { get; set; }

    /// <summary>
    /// 物品状态 (1: 正常, 2: 已过期, 3: 已消耗)
    /// </summary>
    public int Status { get; set; }

    /// <summary>
    /// 剩余天数
    /// </summary>
    public int RemainingDays { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 更新时间
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// 通知数据模型
/// </summary>
public class NotificationPayload
{
    /// <summary>
    /// 通知标题
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// 通知内容
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// 物品ID
    /// </summary>
    public int ItemId { get; set; }

    /// <summary>
    /// 预定时间
    /// </summary>
    public DateTime? ScheduledTime { get; set; }

    /// <summary>
    /// 图标路径
    /// </summary>
    public string? IconPath { get; set; }
}

/// <summary>
/// 即将过期物品信息
/// </summary>
public class ExpiringItem
{
    /// <summary>
    /// 物品ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 物品名称
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 剩余天数
    /// </summary>
    public int RemainingDays { get; set; }

    /// <summary>
    /// 过期时间
    /// </summary>
    public DateTime ExpiredAt { get; set; }
}