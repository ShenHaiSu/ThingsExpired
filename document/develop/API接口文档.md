# ThingsExpired API 接口文档

> 本文档为后端 API 接口的完整定义说明，所有接口必须严格遵循本文档的规范实现。本文档适用于 TypeScript + Bun + Hono 技术栈。

---

## 目录

1. [基础信息](#1-基础信息)
2. [统一响应格式](#2-统一响应格式)
3. [错误码说明](#3-错误码说明)
4. [认证方式](#4-认证方式)
5. [用户模块](#5-用户模块)
6. [分类模块](#6-分类模块)
7. [物品模块](#7-物品模块)
8. [数据模型](#8-数据模型)
9. [时间格式规范](#9-时间格式规范)

---

## 1. 基础信息

### 1.1 服务器地址

```
开发环境: http://localhost:8080
生产环境: 请根据部署配置确定
```

### 1.2 API 前缀

所有 API 统一使用 `/api` 前缀，完整 URL 格式为：

```
{服务器地址}/api/{模块}/{操作}
```

### 1.3 请求方式

所有接口均使用 **POST** 方法提交数据（JSON 格式）。

### 1.4 请求头

| 请求头名称    | 必填       | 说明                             |
| ------------- | ---------- | -------------------------------- |
| Content-Type  | 是         | 固定值: `application/json`       |
| Authorization | 需认证接口 | 格式: `Bearer {token}`           |
| User-Agent    | 建议       | 客户端标识，用于记录登录设备信息 |

---

## 2. 统一响应格式

### 2.1 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 2.2 失败响应

```json
{
  "code": 1001,
  "message": "参数错误提示信息",
  "data": null
}
```

### 2.3 响应字段说明

| 字段    | 类型          | 说明                                    |
| ------- | ------------- | --------------------------------------- |
| code    | number        | 状态码，0 表示成功，非 0 表示失败       |
| message | string        | 提示信息                                |
| data    | object / null | 响应数据，成功时返回数据，失败时为 null |

---

## 3. 错误码说明

### 3.1 通用错误码

| 错误码 | 说明                          |
| ------ | ----------------------------- |
| 0      | 成功                          |
| 1001   | 参数无效                      |
| 1002   | 未授权（未登录或 token 无效） |
| 1003   | 禁止访问                      |

### 3.2 用户相关错误码

| 错误码 | 说明                                 |
| ------ | ------------------------------------ |
| 2001   | 用户不存在                           |
| 2002   | 用户已存在（注册时邮箱或用户名重复） |
| 2003   | 密码错误                             |

### 3.3 系统相关错误码

| 错误码 | 说明       |
| ------ | ---------- |
| 5001   | 内部错误   |
| 5002   | 数据库错误 |

---

## 4. 认证方式

### 4.1 认证流程

1. 用户通过登录接口获取 JWT Token
2. 后续需要认证的接口在请求头中携带 Token
3. Token 格式: `Authorization: Bearer {token}`

### 4.2 Token 说明

- Token 有效期: 24 小时（可在配置中修改）
- Token 包含用户身份信息，用于识别请求用户
- 支持多端登录（默认最多 3 个会话，可在配置中修改）

### 4.3 需要认证的接口

| 模块     | 接口列表                                                   |
| -------- | ---------------------------------------------------------- |
| 用户模块 | 获取信息、更新信息、登出、获取会话列表、撤销会话、强制下线 |
| 分类模块 | 所有接口                                                   |
| 物品模块 | 所有接口                                                   |

---

## 5. 用户模块

### 5.1 用户注册

**接口地址**: `POST /api/user/register`

**认证要求**: 无需认证

**请求参数**:

| 参数名   | 类型   | 必填 | 说明   | 验证规则       |
| -------- | ------ | ---- | ------ | -------------- |
| username | string | 是   | 用户名 | 3-50 个字符    |
| email    | string | 是   | 邮箱   | 有效的邮箱格式 |
| password | string | 是   | 密码   | 6-20 个字符    |

**请求示例**:

```json
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "status": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 5.2 用户登录

**接口地址**: `POST /api/user/login`

**认证要求**: 无需认证

**请求参数**:

| 参数名   | 类型   | 必填 | 说明 |
| -------- | ------ | ---- | ---- |
| email    | string | 是   | 邮箱 |
| password | string | 是   | 密码 |

**请求示例**:

```json
{
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expired": "2024-01-02T12:00:00.000Z"
  }
}
```

**注意事项**:

- 登录成功后会创建会话记录，记录设备信息和 IP 地址
- 返回的 token 需要在后续请求的 Authorization 头中使用

---

### 5.3 获取用户信息

**接口地址**: `POST /api/user/info`

**认证要求**: 需要携带 Token

**请求参数**: 无（用户 ID 从 Token 中获取）

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "status": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 5.4 更新用户信息

**接口地址**: `POST /api/user/update`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名   | 类型   | 必填 | 说明   | 验证规则                  |
| -------- | ------ | ---- | ------ | ------------------------- |
| username | string | 否   | 用户名 | 3-50 个字符，不传则不修改 |

**请求示例**:

```json
{
  "username": "zhangsan_new"
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": 1,
    "username": "zhangsan_new",
    "email": "zhangsan@example.com",
    "status": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 5.5 用户登出

**接口地址**: `POST /api/user/logout`

**认证要求**: 需要携带 Token

**请求参数**: 无（用户 ID 和会话 ID 从 Token 中获取）

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**注意事项**: 登出会撤销当前会话，之后该 token 将失效

---

### 5.6 获取会话列表

**接口地址**: `POST /api/user/sessions`

**认证要求**: 需要携带 Token

**请求参数**: 无

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessions": [
      {
        "session_id": 1,
        "user_id": 1,
        "device_info": "Mozilla/5.0...",
        "ip_address": "192.168.1.1",
        "created_at": "2024-01-01T12:00:00.000Z",
        "expires_at": "2024-01-02T12:00:00.000Z",
        "is_revoked": false
      }
    ],
    "total": 1
  }
}
```

---

### 5.7 撤销指定会话

**接口地址**: `POST /api/user/revoke_session`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名     | 类型   | 必填 | 说明            |
| ---------- | ------ | ---- | --------------- |
| session_id | number | 是   | 要撤销的会话 ID |

**请求示例**:

```json
{
  "session_id": 2
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 5.8 强制下线（撤销所有会话）

**接口地址**: `POST /api/user/force_logout`

**认证要求**: 需要携带 Token

**请求参数**: 无

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**注意事项**: 执行后会撤销当前用户的所有会话，包括当前会话，需要重新登录

---

## 6. 分类模块

### 6.1 创建分类

**接口地址**: `POST /api/category/create`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名     | 类型   | 必填 | 说明     | 验证规则                      |
| ---------- | ------ | ---- | -------- | ----------------------------- |
| name       | string | 是   | 分类名称 | 1-100 个字符                  |
| color      | string | 否   | 分类颜色 | 最多 20 个字符，如: "#FF0000" |
| icon       | string | 否   | 分类图标 | 最多 50 个字符                |
| sort_order | number | 否   | 排序顺序 | 数字，默认为 0                |

**请求示例**:

```json
{
  "name": "食品",
  "color": "#FF5733",
  "icon": "food",
  "sort_order": 1
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "category_id": 1,
    "user_id": 1,
    "name": "食品",
    "color": "#FF5733",
    "icon": "food",
    "sort_order": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 6.2 获取分类列表

**接口地址**: `POST /api/category/list`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名    | 类型   | 必填 | 说明       | 验证规则                        |
| --------- | ------ | ---- | ---------- | ------------------------------- |
| page      | number | 否   | 页码       | 最小值为 1，默认为 1            |
| page_size | number | 否   | 每页数量   | 1-100，默认为 10                |
| keyword   | string | 否   | 搜索关键词 | 模糊匹配分类名称，最多 100 字符 |

**请求示例**:

```json
{
  "page": 1,
  "page_size": 10,
  "keyword": "食品"
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "category_id": 1,
        "user_id": 1,
        "name": "食品",
        "color": "#FF5733",
        "icon": "food",
        "sort_order": 1,
        "created_at": "2024-01-01T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1
  }
}
```

---

### 6.3 更新分类

**接口地址**: `POST /api/category/update`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名      | 类型   | 必填 | 说明     | 验证规则       |
| ----------- | ------ | ---- | -------- | -------------- |
| category_id | number | 是   | 分类 ID  | 最小值为 1     |
| name        | string | 否   | 分类名称 | 1-100 个字符   |
| color       | string | 否   | 分类颜色 | 最多 20 个字符 |
| icon        | string | 否   | 分类图标 | 最多 50 个字符 |
| sort_order  | number | 否   | 排序顺序 | 数字           |

**请求示例**:

```json
{
  "category_id": 1,
  "name": "食品更新",
  "color": "#00FF00"
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "category_id": 1,
    "user_id": 1,
    "name": "食品更新",
    "color": "#00FF00",
    "icon": "food",
    "sort_order": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 6.4 删除分类

**接口地址**: `POST /api/category/delete`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名      | 类型   | 必填 | 说明    |
| ----------- | ------ | ---- | ------- |
| category_id | number | 是   | 分类 ID |

**请求示例**:

```json
{
  "category_id": 1
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**注意事项**:

- 删除分类会同时删除该分类下的所有物品
- 删除后无法恢复

---

## 7. 物品模块

### 7.1 创建物品

**接口地址**: `POST /api/item/create`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名      | 类型   | 必填 | 说明         | 验证规则                                  |
| ----------- | ------ | ---- | ------------ | ----------------------------------------- |
| category_id | number | 是   | 分类 ID      | 最小值为 1                                |
| name        | string | 是   | 物品名称     | 1-200 个字符                              |
| description | string | 否   | 物品描述     | 最多 500 个字符                           |
| quantity    | number | 否   | 数量         | 最小值为 1，默认为 1                      |
| unit        | string | 否   | 单位         | 最多 20 个字符，如: "个", "箱"            |
| expired_at  | string | 是   | 过期时间     | ISO 8601 格式，如: "2024-12-31T23:59:59Z" |
| remind_days | number | 否   | 提前提醒天数 | 0-365，默认为 3                           |

**请求示例**:

```json
{
  "category_id": 1,
  "name": "牛奶",
  "description": "新鲜牛奶",
  "quantity": 1,
  "unit": "盒",
  "expired_at": "2024-12-31T23:59:59.000Z",
  "remind_days": 7
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "item_id": 1,
    "user_id": 1,
    "category_id": 1,
    "name": "牛奶",
    "description": "新鲜牛奶",
    "quantity": 1,
    "unit": "盒",
    "expired_at": "2024-12-31T23:59:59.000Z",
    "remind_days": 7,
    "status": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 7.2 获取物品列表

**接口地址**: `POST /api/item/list`

**认证要求**: 需要携带 Token

**请求参数**（支持复合搜索和分页）:

| 参数名          | 类型   | 必填 | 说明         | 验证规则                                                   |
| --------------- | ------ | ---- | ------------ | ---------------------------------------------------------- |
| page            | number | 否   | 页码         | 最小值为 1，默认为 1                                       |
| page_size       | number | 否   | 每页数量     | 1-100，默认为 10                                           |
| category_id     | number | 否   | 分类 ID 筛选 | 最小值为 1                                                 |
| name            | string | 否   | 物品名称筛选 | 模糊搜索，最多 200 个字符                                  |
| description     | string | 否   | 物品描述筛选 | 模糊搜索，最多 500 个字符                                  |
| unit            | string | 否   | 单位筛选     | 最多 20 个字符                                             |
| status          | number | 否   | 状态筛选     | 0: 全部, 1: 正常, 2: 已过期, 3: 已消耗                     |
| quantity_min    | number | 否   | 最小数量     | 最小值为 0                                                 |
| quantity_max    | number | 否   | 最大数量     | 最小值为 0                                                 |
| remind_days_min | number | 否   | 最小提醒天数 | 最小值为 0                                                 |
| remind_days_max | number | 否   | 最大提醒天数 | 最小值为 0                                                 |
| expired_at_from | string | 否   | 过期时间起始 | 格式: "2006-01-02"                                         |
| expired_at_to   | string | 否   | 过期时间结束 | 格式: "2006-01-02"                                         |
| created_at_from | string | 否   | 创建时间起始 | 格式: "2006-01-02"                                         |
| created_at_to   | string | 否   | 创建时间结束 | 格式: "2006-01-02"                                         |
| order_by        | string | 否   | 排序字段     | 可选值: created_at, updated_at, expired_at, name, quantity |
| order           | string | 否   | 排序方向     | 可选值: asc, desc，默认 asc                                |

**请求示例**:

```json
{
  "page": 1,
  "page_size": 10,
  "category_id": 1,
  "status": 1,
  "order_by": "expired_at",
  "order": "asc"
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "item_id": 1,
        "user_id": 1,
        "category_id": 1,
        "name": "牛奶",
        "description": "新鲜牛奶",
        "quantity": 1,
        "unit": "盒",
        "expired_at": "2024-12-31T23:59:59.000Z",
        "remind_days": 7,
        "status": 1,
        "created_at": "2024-01-01T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1
  }
}
```

---

### 7.3 获取物品详情

**接口地址**: `POST /api/item/detail`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名  | 类型   | 必填 | 说明    |
| ------- | ------ | ---- | ------- |
| item_id | number | 是   | 物品 ID |

**请求示例**:

```json
{
  "item_id": 1
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "item_id": 1,
    "user_id": 1,
    "category_id": 1,
    "name": "牛奶",
    "description": "新鲜牛奶",
    "quantity": 1,
    "unit": "盒",
    "expired_at": "2024-12-31T23:59:59.000Z",
    "remind_days": 7,
    "status": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 7.4 更新物品

**接口地址**: `POST /api/item/update`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名      | 类型   | 必填 | 说明         | 验证规则        |
| ----------- | ------ | ---- | ------------ | --------------- |
| item_id     | number | 是   | 物品 ID      | 最小值为 1      |
| category_id | number | 否   | 分类 ID      | 最小值为 1      |
| name        | string | 否   | 物品名称     | 1-200 个字符    |
| description | string | 否   | 物品描述     | 最多 500 个字符 |
| quantity    | number | 否   | 数量         | 最小值为 1      |
| unit        | string | 否   | 单位         | 最多 20 个字符  |
| expired_at  | string | 否   | 过期时间     | ISO 8601 格式   |
| remind_days | number | 否   | 提前提醒天数 | 0-365           |

**请求示例**:

```json
{
  "item_id": 1,
  "name": "牛奶更新",
  "quantity": 2
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "item_id": 1,
    "user_id": 1,
    "category_id": 1,
    "name": "牛奶更新",
    "description": "新鲜牛奶",
    "quantity": 2,
    "unit": "盒",
    "expired_at": "2024-12-31T23:59:59.000Z",
    "remind_days": 7,
    "status": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 7.5 删除物品

**接口地址**: `POST /api/item/delete`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名  | 类型   | 必填 | 说明    |
| ------- | ------ | ---- | ------- |
| item_id | number | 是   | 物品 ID |

**请求示例**:

```json
{
  "item_id": 1
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 7.6 获取即将过期物品

**接口地址**: `POST /api/item/expiring`

**认证要求**: 需要携带 Token

**请求参数**:

| 参数名 | 类型   | 必填 | 说明     | 验证规则        |
| ------ | ------ | ---- | -------- | --------------- |
| days   | number | 否   | 未来天数 | 1-365，默认为 7 |

**请求示例**:

```json
{
  "days": 7
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "item_id": 1,
      "user_id": 1,
      "category_id": 1,
      "name": "牛奶",
      "description": "新鲜牛奶",
      "quantity": 1,
      "unit": "盒",
      "expired_at": "2024-12-31T23:59:59.000Z",
      "remind_days": 7,
      "status": 1,
      "created_at": "2024-01-01T12:00:00.000Z",
      "days_until_expired": 5
    }
  ]
}
```

---

### 7.7 获取物品统计信息

**接口地址**: `POST /api/item/stats`

**认证要求**: 需要携带 Token

**请求参数**: 无

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 10,
    "expiring_soon": 3,
    "expired": 2,
    "used": 5
  }
}
```

**统计逻辑说明**:

| 统计项        | 统计条件                                           | 对应前端显示 |
| ------------- | -------------------------------------------------- | ------------ |
| total         | 所有物品（status = 1, 2, 3）                       | 物品总数     |
| expiring_soon | expired_at ≤ 当前时间 + 7 天 且 status = 1（正常） | 即将过期     |
| expired       | expired_at < 当前时间 且 status = 2（已过期）      | 已过期       |
| used          | status = 3（已消耗）                               | 已使用       |

---

### 7.8 标记物品已使用

**接口地址**: `POST /api/item/mark_used`

**认证要求**: 需要携带 Token

**功能说明**: 将物品状态标记为"已消耗"（status = 3），用于记录物品已被使用完毕。

**请求参数**:

| 参数名  | 类型   | 必填 | 说明    | 验证规则   |
| ------- | ------ | ---- | ------- | ---------- |
| item_id | number | 是   | 物品 ID | 最小值为 1 |

**请求示例**:

```json
{
  "item_id": 1
}
```

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "item_id": 1,
    "user_id": 1,
    "category_id": 1,
    "name": "牛奶",
    "description": "新鲜牛奶",
    "quantity": 1,
    "unit": "盒",
    "expired_at": "2024-12-31T23:59:59.000Z",
    "remind_days": 7,
    "status": 3,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**业务逻辑说明**:

1. 接口会验证物品是否存在
2. 验证物品是否属于当前登录用户（防止越权操作）
3. 将物品状态更新为"已消耗"（status = 3）
4. 返回更新后的物品信息

**注意事项**:

- 只有物品所属用户才能标记物品为已使用
- 标记后物品状态变为 3（已消耗）
- 已消耗的物品不会再出现在"即将过期"统计中
- 此操作不可逆

---

## 8. 数据模型

### 8.1 用户 (User)

| 字段       | 类型   | 说明                |
| ---------- | ------ | ------------------- |
| user_id    | number | 用户 ID（主键）     |
| username   | string | 用户名（唯一）      |
| email      | string | 邮箱（唯一）        |
| password   | string | 密码（加密存储）    |
| status     | number | 账户状态（1: 正常） |
| created_at | string | 创建时间            |
| updated_at | string | 更新时间            |

### 8.2 分类 (Category)

| 字段        | 类型   | 说明                 |
| ----------- | ------ | -------------------- |
| category_id | number | 分类 ID（主键）      |
| user_id     | number | 所属用户 ID          |
| name        | string | 分类名称             |
| color       | string | 分类颜色（十六进制） |
| icon        | string | 分类图标             |
| sort_order  | number | 排序顺序             |
| created_at  | string | 创建时间             |
| updated_at  | string | 更新时间             |

### 8.3 物品 (Item)

| 字段        | 类型   | 说明                                  |
| ----------- | ------ | ------------------------------------- |
| item_id     | number | 物品 ID（主键）                       |
| user_id     | number | 所属用户 ID                           |
| category_id | number | 所属分类 ID                           |
| name        | string | 物品名称                              |
| description | string | 物品描述                              |
| quantity    | number | 数量                                  |
| unit        | string | 单位                                  |
| expired_at  | string | 过期时间                              |
| remind_days | number | 提前提醒天数                          |
| status      | number | 状态（1: 正常, 2: 已过期, 3: 已消耗） |
| created_at  | string | 创建时间                              |
| updated_at  | string | 更新时间                              |

### 8.4 会话 (Session)

| 字段        | 类型    | 说明             |
| ----------- | ------- | ---------------- |
| session_id  | number  | 会话 ID（主键）  |
| user_id     | number  | 所属用户 ID      |
| jti         | string  | JWT Token 标识符 |
| device_info | string  | 登录设备信息     |
| ip_address  | string  | 登录 IP 地址     |
| created_at  | string  | 会话创建时间     |
| expires_at  | string  | 会话过期时间     |
| is_revoked  | boolean | 是否已撤销       |

### 8.5 物品状态枚举

| 值  | 常量名        | 说明   |
| --- | ------------- | ------ |
| 1   | StatusNormal  | 正常   |
| 2   | StatusExpired | 已过期 |
| 3   | StatusUsed    | 已消耗 |

---

## 9. 时间格式规范

> **强制要求**: 所有时间数据的存储和传输必须使用 UTC 时间格式，以避免时区导致的错位问题。

### 9.1 时间格式标准

| 场景         | 格式                 | 示例                         |
| ------------ | -------------------- | ---------------------------- |
| 后端返回时间 | UTC 时间（ISO 8601） | `"2026-05-02T00:00:00.000Z"` |
| 前端传入时间 | UTC 时间（ISO 8601） | `"2026-05-02T00:00:00.000Z"` |
| 日期筛选格式 | YYYY-MM-DD           | `"2026-05-02"`               |

### 9.2 实现要求

```typescript
// ✅ 正确：使用 UTC 时间
const utcTime = new Date().toISOString(); // "2026-05-02T00:00:00.000Z"

// ✅ 正确：时间格式化
function formatTime(date: Date): string {
  return date.toISOString();
}

// ❌ 错误：禁止使用本地时间格式
// "2026-05-02 08:00:00" // 错误！
```

---

> **本文档为强制性规范，所有 API 接口必须严格按照本文档定义实现。**
> 后端开发人员需确保接口行为与文档完全一致。
> 前端开发人员可依据本文档直接进行接口对接。
