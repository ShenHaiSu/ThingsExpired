# ThingsExpired API 交接文档

> 本文档为前端开发人员提供完整的后端API接口说明，前端人员无需查阅后端代码即可完成接口对接。

---

## 目录

1. [项目概述](#1-项目概述)
2. [基础信息](#2-基础信息)
3. [统一响应格式](#3-统一响应格式)
4. [错误码说明](#4-错误码说明)
5. [认证方式](#5-认证方式)
6. [用户相关接口](#6-用户相关接口)
7. [分类相关接口](#7-分类相关接口)
8. [物品相关接口](#8-物品相关接口)
9. [数据模型参考](#9-数据模型参考)

---

## 1. 项目概述

### 1.1 项目简介

ThingsExpired 是一个物品过期管理后端服务，用于帮助用户管理物品的过期时间，支持分类管理、物品管理、过期提醒等功能。

### 1.2 技术栈

- **后端框架**: Gin (Go语言)
- **数据库**: SQLite
- **认证方式**: JWT Token
- **API风格**: RESTful (JSON)

---

## 2. 基础信息

### 2.1 服务器地址

```
开发环境: http://localhost:8080
生产环境: 请根据部署配置确定
```

### 2.2 API前缀

所有API接口统一使用 `/api` 前缀，完整URL格式为：

```
{服务器地址}/api/{模块}/{操作}
```

### 2.3 请求方式

所有接口均使用 **POST** 方法提交数据（JSON格式）。

### 2.4 请求头

| 请求头名称    | 必填       | 说明                             |
| ------------- | ---------- | -------------------------------- |
| Content-Type  | 是         | 固定值: `application/json`       |
| Authorization | 需认证接口 | 格式: `Bearer {token}`           |
| User-Agent    | 建议       | 客户端标识，用于记录登录设备信息 |

---

## 3. 统一响应格式

### 3.1 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 3.2 失败响应

```json
{
  "code": 1001,
  "message": "参数错误提示信息",
  "data": null
}
```

### 3.3 响应字段说明

| 字段    | 类型        | 说明                                   |
| ------- | ----------- | -------------------------------------- |
| code    | int         | 状态码，0表示成功，非0表示失败         |
| message | string      | 提示信息                               |
| data    | object/null | 响应数据，成功时返回数据，失败时为null |

---

## 4. 错误码说明

### 4.1 通用错误码

| 错误码 | 说明                        |
| ------ | --------------------------- |
| 0      | 成功                        |
| 1001   | 参数无效                    |
| 1002   | 未授权（未登录或token无效） |
| 1003   | 禁止访问                    |

### 4.2 用户相关错误码

| 错误码 | 说明                                 |
| ------ | ------------------------------------ |
| 2001   | 用户不存在                           |
| 2002   | 用户已存在（注册时邮箱或用户名重复） |
| 2003   | 密码错误                             |

### 4.3 系统相关错误码

| 错误码 | 说明       |
| ------ | ---------- |
| 5001   | 内部错误   |
| 5002   | 数据库错误 |

---

## 5. 认证方式

### 5.1 认证流程

1. 用户通过登录接口获取JWT Token
2. 后续需要认证的接口在请求头中携带Token
3. Token格式: `Authorization: Bearer {token}`

### 5.2 Token说明

- Token有效期: 24小时（可在配置中修改）
- Token包含用户身份信息，用于识别请求用户
- 支持多端登录（默认最多3个会话，可在配置中修改）

### 5.3 需要认证的接口

以下模块的接口需要携带Token：

- 用户模块: 获取用户信息、更新用户信息、登出、获取会话列表、撤销会话、强制下线
- 分类模块: 所有接口
- 物品模块: 所有接口

---

## 6. 用户相关接口

### 6.1 用户注册

**接口地址**: `/api/user/register`

**请求参数**:

| 参数名   | 类型   | 必填 | 说明   | 验证规则       |
| -------- | ------ | ---- | ------ | -------------- |
| username | string | 是   | 用户名 | 3-50个字符     |
| email    | string | 是   | 邮箱   | 有效的邮箱格式 |
| password | string | 是   | 密码   | 6-20个字符     |

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
    "created_at": "2024-01-01 12:00:00"
  }
}
```

**响应字段说明**:

| 字段       | 类型   | 说明                |
| ---------- | ------ | ------------------- |
| user_id    | uint   | 用户ID              |
| username   | string | 用户名              |
| email      | string | 邮箱                |
| status     | int8   | 账户状态（1: 正常） |
| created_at | string | 创建时间            |

---

### 6.2 用户登录

**接口地址**: `/api/user/login`

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
    "expired": "2024-01-02 12:00:00"
  }
}
```

**响应字段说明**:

| 字段    | 类型   | 说明                        |
| ------- | ------ | --------------------------- |
| user_id | uint   | 用户ID                      |
| token   | string | JWT Token，用于后续请求认证 |
| expired | string | Token过期时间               |

**注意事项**:

- 登录成功后会创建会话记录，记录设备信息和IP地址
- 返回的token需要在后续请求的Authorization头中使用

---

### 6.3 获取用户信息

**接口地址**: `/api/user/info`

**认证要求**: 需要携带Token

**请求参数**: 无（用户ID从Token中获取）

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
    "created_at": "2024-01-01 12:00:00"
  }
}
```

---

### 6.4 更新用户信息

**接口地址**: `/api/user/update`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名   | 类型   | 必填 | 说明   | 验证规则                 |
| -------- | ------ | ---- | ------ | ------------------------ |
| username | string | 否   | 用户名 | 3-50个字符，不传则不修改 |

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
    "created_at": "2024-01-01 12:00:00"
  }
}
```

---

### 6.5 用户登出

**接口地址**: `/api/user/logout`

**认证要求**: 需要携带Token

**请求参数**: 无（用户ID和会话ID从Token中获取）

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**注意事项**:

- 登出会撤销当前会话，之后该token将失效

---

### 6.6 获取用户所有会话

**接口地址**: `/api/user/sessions`

**认证要求**: 需要携带Token

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
        "created_at": "2024-01-01 12:00:00",
        "expires_at": "2024-01-02 12:00:00",
        "is_revoked": false
      }
    ],
    "total": 1
  }
}
```

**响应字段说明**:

| 字段        | 类型   | 说明         |
| ----------- | ------ | ------------ |
| session_id  | uint   | 会话ID       |
| user_id     | uint   | 用户ID       |
| device_info | string | 登录设备信息 |
| ip_address  | string | 登录IP地址   |
| created_at  | string | 会话创建时间 |
| expires_at  | string | 会话过期时间 |
| is_revoked  | bool   | 是否已撤销   |

---

### 6.7 撤销指定会话

**接口地址**: `/api/user/revoke_session`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名     | 类型 | 必填 | 说明           |
| ---------- | ---- | ---- | -------------- |
| session_id | uint | 是   | 要撤销的会话ID |

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

### 6.8 强制下线（撤销所有会话）

**接口地址**: `/api/user/force_logout`

**认证要求**: 需要携带Token

**请求参数**: 无

**响应数据**:

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**注意事项**:

- 执行后会撤销当前用户的所有会话，包括当前会话
- 执行后需要重新登录

---

## 7. 分类相关接口

### 7.1 创建分类

**接口地址**: `/api/category/create`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名     | 类型   | 必填 | 说明     | 验证规则                    |
| ---------- | ------ | ---- | -------- | --------------------------- |
| name       | string | 是   | 分类名称 | 1-100个字符                 |
| color      | string | 否   | 分类颜色 | 最多20个字符，如: "#FF0000" |
| icon       | string | 否   | 分类图标 | 最多50个字符                |
| sort_order | int    | 否   | 排序顺序 | 数字，默认为0               |

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
    "created_at": "2024-01-01 12:00:00"
  }
}
```

**响应字段说明**:

| 字段        | 类型   | 说明       |
| ----------- | ------ | ---------- |
| category_id | uint   | 分类ID     |
| user_id     | uint   | 所属用户ID |
| name        | string | 分类名称   |
| color       | string | 分类颜色   |
| icon        | string | 分类图标   |
| sort_order  | int    | 排序顺序   |
| created_at  | string | 创建时间   |

---

### 7.2 获取分类列表

**接口地址**: `/api/category/list`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名    | 类型   | 必填 | 说明         | 验证规则                      |
| | -------- | ------ | ---- | ------------ | ----------------------------- |
| page      | int    | 否   | 页码         | 最小值为1，默认为1            |
| page_size | int    | 否   | 每页数量     | 1-100，默认为10               |
| keyword   | string | 否   | 搜索关键词   | 模糊匹配分类名称，最多100字符 |

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

**响应字段说明**:

| 字段  | 类型  | 说明     |
| | ----- | ----- | -------- |
| list  | array | 分类列表 |
| total | int64 | 总数量   |
| page  | int   | 当前页码 |

---

### 7.3 更新分类

**接口地址**: `/api/category/update`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名      | 类型   | 必填 | 说明     | 验证规则     |
| ----------- | ------ | ---- | -------- | ------------ |
| category_id | uint   | 是   | 分类ID   | 最小值为1    |
| name        | string | 否   | 分类名称 | 1-100个字符  |
| color       | string | 否   | 分类颜色 | 最多20个字符 |
| icon        | string | 否   | 分类图标 | 最多50个字符 |
| sort_order  | int    | 否   | 排序顺序 | 数字         |

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
    "created_at": "2024-01-01 12:00:00"
  }
}
```

---

### 7.4 删除分类

**接口地址**: `/api/category/delete`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名      | 类型 | 必填 | 说明   |
| ----------- | ---- | ---- | ------ |
| category_id | uint | 是   | 分类ID |

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

## 8. 物品相关接口

### 8.1 创建物品

**接口地址**: `/api/item/create`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名      | 类型   | 必填 | 说明         | 验证规则                                 |
| ----------- | ------ | ---- | ------------ | ---------------------------------------- |
| category_id | uint   | 是   | 分类ID       | 最小值为1                                |
| name        | string | 是   | 物品名称     | 1-200个字符                              |
| description | string | 否   | 物品描述     | 最多500个字符                            |
| quantity    | int    | 否   | 数量         | 最小值为1，默认为1                       |
| unit        | string | 否   | 单位         | 最多20个字符，如: "个", "箱"             |
| expired_at  | string | 是   | 过期时间     | ISO 8601格式，如: "2024-12-31T23:59:59Z" |
| remind_days | int    | 否   | 提前提醒天数 | 0-365，默认为3                           |

**请求示例**:

```json
{
  "category_id": 1,
  "name": "牛奶",
  "description": "新鲜牛奶",
  "quantity": 1,
  "unit": "盒",
  "expired_at": "2024-12-31T23:59:59Z",
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
    "expired_at": "2024-12-31T23:59:59Z",
    "remind_days": 7,
    "status": 1,
    "created_at": "2024-01-01 12:00:00"
  }
}
```

**响应字段说明**:

| 字段        | 类型   | 说明                                      |
| ----------- | ------ | ----------------------------------------- |
| item_id     | uint   | 物品ID                                    |
| user_id     | uint   | 所属用户ID                                |
| category_id | uint   | 分类ID                                    |
| name        | string | 物品名称                                  |
| description | string | 物品描述                                  |
| quantity    | int    | 数量                                      |
| unit        | string | 单位                                      |
| expired_at  | string | 过期时间                                  |
| remind_days | int    | 提前提醒天数                              |
| status      | int8   | 物品状态（1: 正常, 2: 已过期, 3: 已消耗） |
| created_at  | string | 创建时间                                  |

---

### 8.2 获取物品列表

**接口地址**: `/api/item/list`

**认证要求**: 需要携带Token

**请求参数** (支持复合搜索和分页):

| 参数名          | 类型   | 必填 | 说明         | 验证规则                                                   |
| --------------- | ------ | ---- | ------------ | ---------------------------------------------------------- |
| page            | int    | 否   | 页码         | 最小值为1，默认为1                                         |
| page_size       | int    | 否   | 每页数量     | 1-100，默认为10                                            |
| category_id     | uint   | 否   | 分类ID筛选   | 最小值为1                                                  |
| name            | string | 否   | 物品名称筛选 | 模糊搜索，最多200个字符                                    |
| description     | string | 否   | 物品描述筛选 | 模糊搜索，最多500个字符                                    |
| unit            | string | 否   | 单位筛选     | 最多20个字符                                               |
| status          | int8   | 否   | 状态筛选     | 0: 全部, 1: 正常, 2: 已过期, 3: 已消耗                     |
| quantity_min    | int    | 否   | 最小数量     | 最小值为0                                                  |
| quantity_max    | int    | 否   | 最大数量     | 最小值为0                                                  |
| remind_days_min | int    | 否   | 最小提醒天数 | 最小值为0                                                  |
| remind_days_max | int    | 否   | 最大提醒天数 | 最小值为0                                                  |
| expired_at_from | string | 否   | 过期时间起始 | 格式: "2006-01-02"                                         |
| expired_at_to   | string | 否   | 过期时间结束 | 格式: "2006-01-02"                                         |
| created_at_from | string | 否   | 创建时间起始 | 格式: "2006-01-02"                                         |
| created_at_to   | string | 否   | 创建时间结束 | 格式: "2006-01-02"                                         |
| order_by        | string | 否   | 排序字段     | 可选值: created_at, updated_at, expired_at, name, quantity |
| order           | string | 否   | 排序方向     | 可选值: asc, desc，默认asc                                 |

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
        "expired_at": "2024-12-31T23:59:59Z",
        "remind_days": 7,
        "status": 1,
        "created_at": "2024-01-01 12:00:00"
      }
    ],
    "total": 1,
    "page": 1
  }
}
```

**响应字段说明**:

| 字段  | 类型  | 说明     |
| ----- | ----- | -------- |
| list  | array | 物品列表 |
| total | int64 | 总数量   |
| page  | int   | 当前页码 |

---

### 8.3 获取物品详情

**接口地址**: `/api/item/detail`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名  | 类型 | 必填 | 说明   |
| ------- | ---- | ---- | ------ |
| item_id | uint | 是   | 物品ID |

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
    "expired_at": "2024-12-31T23:59:59Z",
    "remind_days": 7,
    "status": 1,
    "created_at": "2024-01-01 12:00:00"
  }
}
```

---

### 8.4 更新物品

**接口地址**: `/api/item/update`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名      | 类型   | 必填 | 说明         | 验证规则      |
| ----------- | ------ | ---- | ------------ | ------------- |
| item_id     | uint   | 是   | 物品ID       | 最小值为1     |
| category_id | uint   | 否   | 分类ID       | 最小值为1     |
| name        | string | 否   | 物品名称     | 1-200个字符   |
| description | string | 否   | 物品描述     | 最多500个字符 |
| quantity    | int    | 否   | 数量         | 最小值为1     |
| unit        | string | 否   | 单位         | 最多20个字符  |
| expired_at  | string | 否   | 过期时间     | ISO 8601格式  |
| remind_days | int    | 否   | 提前提醒天数 | 0-365         |

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
    "expired_at": "2024-12-31T23:59:59Z",
    "remind_days": 7,
    "status": 1,
    "created_at": "2024-01-01 12:00:00"
  }
}
```

---

### 8.5 删除物品

**接口地址**: `/api/item/delete`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名  | 类型 | 必填 | 说明   |
| ------- | ---- | ---- | ------ |
| item_id | uint | 是   | 物品ID |

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

### 8.6 获取即将过期物品

**接口地址**: `/api/item/expiring`

**认证要求**: 需要携带Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明     | 验证规则       |
| ------ | ---- | ---- | -------- | -------------- |
| days   | int  | 否   | 未来天数 | 1-365，默认为7 |

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
      "expired_at": "2024-12-31T23:59:59Z",
      "remind_days": 7,
      "status": 1,
      "created_at": "2024-01-01 12:00:00",
      "days_until_expired": 5
    }
  ]
}
```

**响应字段说明**:

| 字段               | 类型 | 说明                           |
| ------------------ | ---- | ------------------------------ |
| days_until_expired | int  | 距离过期的天数，负数表示已过期 |

---

### 8.7 获取物品统计信息

**接口地址**: `/api/item/stats`

**认证要求**: 需要携带Token

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

**响应字段说明**:

| 字段          | 类型 | 说明                                                         |
| ------------- | ---- | ------------------------------------------------------------ |
| total         | int  | 物品总数（所有状态的物品数量）                               |
| expiring_soon | int  | 即将过期数量（距离过期≤7天且状态为正常的物品）              |
| expired       | int  | 已过期数量（已超过过期时间且状态为已过期的物品）            |
| used          | int  | 已消耗数量（状态为已消耗的物品）                            |

**统计逻辑说明**:

| 统计项 | 统计条件 | 对应前端显示 |
| ------ | -------- | ------------ |
| total | 所有物品（status = 1, 2, 3） | 物品总数 |
| expiring_soon | expired_at ≤ 当前时间 + 7天 且 status = 1（正常） | 即将过期 |
| expired | expired_at < 当前时间 且 status = 2（已过期） | 已过期 |
| used | status = 3（已消耗） | 已使用 |

---

### 8.8 标记物品已使用

**接口地址**: `/api/item/mark_used`

**认证要求**: 需要携带Token

**功能说明**: 将物品状态标记为"已消耗"（status = 3），用于记录物品已被使用完毕。

**请求参数**:

| 参数名  | 类型 | 必填 | 说明   | 验证规则 |
| ------- | ---- | ---- | ------ | -------- |
| item_id | uint | 是   | 物品ID | 最小值为1 |

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
    "expired_at": "2024-12-31T23:59:59Z",
    "remind_days": 7,
    "status": 3,
    "created_at": "2024-01-01 12:00:00"
  }
}
```

**响应字段说明**:

| 字段        | 类型   | 说明                                      |
| ----------- | ------ | ----------------------------------------- |
| item_id     | uint   | 物品ID                                    |
| user_id     | uint   | 所属用户ID                                |
| category_id | uint   | 分类ID                                    |
| name        | string | 物品名称                                  |
| description | string | 物品描述                                  |
| quantity    | int    | 数量                                      |
| unit        | string | 单位                                      |
| expired_at  | string | 过期时间                                  |
| remind_days | int    | 提前提醒天数                              |
| status      | int8   | 物品状态（标记后为3: 已消耗）             |
| created_at  | string | 创建时间                                  |

**业务逻辑说明**:

1. 接口会验证物品是否存在
2. 验证物品是否属于当前登录用户（防止越权操作）
3. 将物品状态更新为"已消耗"（status = 3）
4. 返回更新后的物品信息

**注意事项**:

- 只有物品所属用户才能标记物品为已使用
- 标记后物品状态变为 3（已消耗）
- 已消耗的物品不会再出现在"即将过期"统计中
- 此操作不可逆，无法将已消耗状态改回其他状态

---

## 9. 数据模型参考

### 9.1 用户 (User)

| 字段       | 类型   | 说明                |
| ---------- | ------ | ------------------- |
| user_id    | uint   | 用户ID（主键）      |
| username   | string | 用户名（唯一）      |
| email      | string | 邮箱（唯一）        |
| password   | string | 密码（加密存储）    |
| status     | int8   | 账户状态（1: 正常） |
| created_at | string | 创建时间            |
| updated_at | string | 更新时间            |

### 9.2 分类 (Category)

| 字段        | 类型   | 说明                 |
| ----------- | ------ | -------------------- |
| category_id | uint   | 分类ID（主键）       |
| user_id     | uint   | 所属用户ID           |
| name        | string | 分类名称             |
| color       | string | 分类颜色（十六进制） |
| icon        | string | 分类图标             |
| sort_order  | int    | 排序顺序             |
| created_at  | string | 创建时间             |
| updated_at  | string | 更新时间             |

### 9.3 物品 (Item)

| 字段        | 类型   | 说明                                  |
| ----------- | ------ | ------------------------------------- |
| item_id     | uint   | 物品ID（主键）                        |
| user_id     | uint   | 所属用户ID                            |
| category_id | uint   | 所属分类ID                            |
| name        | string | 物品名称                              |
| description | string | 物品描述                              |
| quantity    | int    | 数量                                  |
| unit        | string | 单位                                  |
| expired_at  | string | 过期时间                              |
| remind_days | int    | 提前提醒天数                          |
| status      | int8   | 状态（1: 正常, 2: 已过期, 3: 已消耗） |
| created_at  | string | 创建时间                              |
| updated_at  | string | 更新时间                              |

### 9.4 会话 (Session)

| 字段        | 类型   | 说明            |
| ----------- | ------ | --------------- |
| session_id  | uint   | 会话ID（主键）  |
| user_id     | uint   | 所属用户ID      |
| jti         | string | JWT Token标识符 |
| device_info | string | 登录设备信息    |
| ip_address  | string | 登录IP地址      |
| created_at  | string | 会话创建时间    |
| expires_at  | string | 会话过期时间    |
| is_revoked  | bool   | 是否已撤销      |

---

## 附录

### 附录A: 状态码参考

**物品状态 (status)**:

- `1` - 正常：物品未过期
- `2` - 已过期：物品已超过过期时间
- `3` - 已消耗：物品已被使用/消耗

### 附录B: 时间格式规范（重要）

> **强制要求**: 所有时间数据的存储和传输必须使用 UTC 时间格式，以避免时区导致的错位问题。

#### 时间格式标准

| 场景 | 格式 | 示例 |
|------|------|------|
| 后端返回时间 | UTC 时间（ISO 8601） | `2026-05-02T00:00:00.000Z` |
| 前端传入时间 | UTC 时间（ISO 8601） | `2026-05-02T00:00:00.000Z` |
| 日期筛选格式 | `YYYY-MM-DD` | `2026-05-02` |

#### 前端处理说明

**接收时间数据**:
- 后端返回的所有时间字段均为 UTC 格式（如 `created_at`, `expired_at` 等）
- 前端需要根据用户所在时区进行转换后显示

**发送时间数据**:
- 前端向后端发送时间数据时，必须转换为 UTC 格式
- 例如创建物品时的 `expired_at` 字段必须使用 UTC 格式

**JavaScript 转换示例**:

```javascript
// 接收后端 UTC 时间，转换为本地时间显示
const utcTime = "2026-05-02T00:00:00.000Z";
const localTime = new Date(utcTime).toLocaleString();
// 中国时区显示: "2026/5/2 08:00:00"

// 发送时间到后端，将本地时间转换为 UTC
const localDate = new Date(2026, 4, 2, 8, 0, 0);  // 2026年5月2日 08:00:00 本地时间
const utcString = localDate.toISOString();
// 输出: "2026-05-02T00:00:00.000Z"（UTC时间）

// 注意：toISOString() 总是返回 UTC 时间
```

#### 注意事项

1. **禁止使用本地时间格式**: 不要向后端发送如 `"2026-05-02 08:00:00"` 这样的本地时间格式
2. **时区显示由前端负责**: 后端只提供 UTC 时间，前端根据用户设备或设置决定显示时区
3. **跨时区兼容**: 使用 UTC 时间可以确保不同时区的用户看到正确的时间信息

### 附录C: 错误处理建议

1. **code = 0**: 请求成功，处理data中的数据
2. **code = 1001**: 参数错误，检查请求参数是否符合验证规则
3. **code = 1002**: 未授权，重新登录获取token
4. **code = 1003**: 禁止访问，检查用户权限
5. **code = 2001**: 用户不存在
6. **code = 2002**: 用户已存在（注册时）
7. **code = 2003**: 密码错误
8. **code = 5001/5002**: 服务器错误，联系后端开发人员

---

**文档版本**: 1.0  
**最后更新**: 2024年  
**维护者**: 后端开发团队
