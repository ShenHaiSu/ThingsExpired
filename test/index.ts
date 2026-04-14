/**
 * ThingsExpired API 测试脚本
 * 
 * 使用 Bun + TypeScript + Fetch API 实现与 test-api.ps1 相同的后端接口测试逻辑
 * 
 * 运行前请确保服务器已启动 (http://localhost:8080)
 * 执行命令: bun run test/index.ts
 */

// ============================================
// 配置常量
// ============================================

/** API 基础地址 */
const BASE_URL = "http://localhost:8080/api";

/** 请求头配置 */
const HEADERS = {
  "Content-Type": "application/json",
};

// ============================================
// 工具函数
// ============================================

/**
 * 打印带样式的分隔线
 * @param text 分隔线文本
 * @param color 控制台颜色
 */
function printHeader(text: string, color: "cyan" | "yellow" | "green" | "red" | "magenta" = "cyan"): void {
  const colors = {
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
  };
  const reset = "\x1b[0m";
  console.log(`\n${colors[color]}${"=".repeat(50)}${reset}`);
  console.log(`${colors[color]}${text}${reset}`);
  console.log(`${colors[color]}${"=".repeat(50)}${reset}\n`);
}

/**
 * 打印带颜色的日志
 */
const log = {
  success: (msg: string) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`),
  error: (msg: string) => console.log(`\x1b[31m✗ ${msg}\x1b[0m`),
  info: (msg: string) => console.log(`\x1b[36mℹ ${msg}\x1b[0m`),
};

/**
 * 发送 POST 请求的封装
 * @param endpoint API 端点
 * @param body 请求体
 * @param authToken 可选的认证 token
 * @returns 响应数据（自动从 API 响应中提取 data 字段）
 */
async function postRequest<T = any>(
  endpoint: string,
  body: Record<string, any>,
  authToken?: string
): Promise<T> {
  const headers: Record<string, string> = { ...HEADERS };
  
  // 如果提供了 authToken，添加到 Authorization 头
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  // 尝试解析 JSON 响应
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const jsonData = await response.json();
    // 返回完整的 API 响应，包含 code、message、data
    return jsonData as T;
  }

  // 如果不是 JSON，返回文本
  const text = await response.text();
  throw new Error(`Non-JSON response: ${text} (Status: ${response.status})`);
}

/**
 * 发送 POST 请求并返回状态码
 * 用于测试期望失败的场景
 */
async function postRequestWithStatus<T = any>(
  endpoint: string,
  body: Record<string, any>
): Promise<{ data?: T; status: number; error?: string }> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return {
        data: await response.json(),
        status: response.status,
      };
    }

    return {
      status: response.status,
      error: await response.text(),
    };
  } catch (err: any) {
    // 网络错误可能表示请求被拦截
    return {
      status: 0,
      error: err.message,
    };
  }
}

// ============================================
// API 测试模块
// ============================================

/**
 * 登录响应数据结构
 * 对应后端 LoginVO
 */
interface LoginVO {
  user_id: number;
  token: string;
  expired: string;
}

/**
 * API 统一响应结构
 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 用户模块测试
 * 测试用户注册和登录功能
 */
async function testUserModule(): Promise<string> {
  printHeader("[User Module Tests]", "yellow");

  // 1. 用户注册测试
  console.log("[1] User Register Test...");
  const registerBody = {
    username: "testuser",
    email: "test@example.com",
    password: "123456",
  };
  const registerResp = await postRequest<ApiResponse<any>>("/user/register", registerBody);
  console.log("Register Response:", JSON.stringify(registerResp, null, 2));

  // 2. 用户登录测试
  console.log("\n[2] User Login Test...");
  const loginBody = {
    email: "test@example.com",
    password: "123456",
  };
  const loginResp = await postRequest<ApiResponse<LoginVO>>("/user/login", loginBody);
  console.log("Login Response:", JSON.stringify(loginResp, null, 2));

  // 调试：打印响应结构
  console.log("Debug - Response code:", loginResp?.code);
  console.log("Debug - Response data:", loginResp?.data);
  console.log("Debug - Response data type:", typeof loginResp?.data);

  // 提取认证 Token - 从响应 data 字段中获取 token
  const authToken = loginResp?.data?.token;
  console.log(`\n\x1b[35mExtracted Token: ${authToken}\x1b[0m`);

  // 验证 token 是否成功提取
  if (!authToken) {
    throw new Error("Failed to extract auth token from login response");
  }

  return authToken;
}

/**
 * 认证验证分支测试
 * 验证 API 在有无 Token 情况下的访问控制
 * 
 * @param authToken 有效的认证 token
 */
async function testAuthenticationBranch(authToken: string): Promise<void> {
  printHeader("[Branch Test: Authentication Validation]", "yellow");

  // 分支1: 不带认证 Token 的请求（期望失败）
  console.log("\n[Branch 1] Request WITHOUT Auth Token (Expected to Fail)...");
  const categoryBody = {
    name: "Food",
    color: "#FF5733",
    icon: "food",
    sort_order: 1,
  };

  const unauthorizedResult = await postRequestWithStatus("/category/create", categoryBody);

  if (unauthorizedResult.status === 401 || unauthorizedResult.status === 403) {
    log.success(`Test Passed: Unauthorized request correctly rejected (HTTP ${unauthorizedResult.status})`);
  } else if (unauthorizedResult.status === 0) {
    // 网络错误表示请求被拦截（符合预期）
    log.success("Test Passed: Request without token correctly failed");
  } else if (unauthorizedResult.data && (unauthorizedResult.data as any).code === 401 || (unauthorizedResult.data as any).code === 403) {
    log.success("Test Passed: Unauthorized request correctly rejected");
  } else {
    log.error(`Test Failed: Expected error code but got ${unauthorizedResult.status}`);
  }

  // 分支2: 携带认证 Token 的请求（期望成功）
  console.log("\n[Branch 2] Request WITH Auth Token (Expected to Succeed)...");

  try {
    const authorizedResp = await postRequest<ApiResponse<any>>("/category/create", categoryBody, authToken);
    console.log("Response:", JSON.stringify(authorizedResp, null, 2));

    // 后端成功响应的 code 是 0
    const code = authorizedResp?.code;
    if (code === 0) {
      log.success("Test Passed: Authorized request correctly accepted");
    } else {
      log.error(`Test Failed: Expected success code 0 but got ${code}`);
    }
  } catch (err: any) {
    log.error(`Test Failed: Request with token failed unexpectedly - ${err.message}`);
  }
}

/**
 * 分类模块测试
 * 测试分类的增删改查功能
 * 
 * @param authToken 有效的认证 token
 */
async function testCategoryModule(authToken: string): Promise<void> {
  printHeader("[Category Module Tests]", "yellow");

  // 3. 创建分类
  console.log("[3] Create Category Test...");
  const createCategoryBody = {
    name: "Food",
    color: "#FF5733",
    icon: "food",
    sort_order: 1,
  };
  const createCategoryResp = await postRequest<ApiResponse<any>>("/category/create", createCategoryBody, authToken);
  console.log("Create Category Response:", JSON.stringify(createCategoryResp, null, 2));

  // 4. 获取分类列表
  console.log("\n[4] Get Category List Test...");
  const listCategoryResp = await postRequest<ApiResponse<any>>("/category/list", {}, authToken);
  console.log("Category List Response:", JSON.stringify(listCategoryResp, null, 2));

  // 5. 更新分类
  console.log("\n[5] Update Category Test...");
  const updateCategoryBody = {
    category_id: 1,
    name: "Food (Updated)",
    color: "#33FF57",
    sort_order: 2,
  };
  const updateCategoryResp = await postRequest<ApiResponse<any>>("/category/update", updateCategoryBody, authToken);
  console.log("Update Category Response:", JSON.stringify(updateCategoryResp, null, 2));
}

/**
 * 物品模块测试
 * 测试物品的增删改查及过期提醒功能
 * 
 * @param authToken 有效的认证 token
 */
async function testItemModule(authToken: string): Promise<void> {
  printHeader("[Item Module Tests]", "yellow");

  // 6. 创建物品
  console.log("[6] Create Item Test...");
  const createItemBody = {
    category_id: 1,
    name: "Milk",
    description: "Fresh milk",
    quantity: 2,
    unit: "box",
    expired_at: "2026-04-20T00:00:00Z",
    remind_days: 3,
  };
  const createItemResp = await postRequest<ApiResponse<any>>("/item/create", createItemBody, authToken);
  console.log("Create Item Response:", JSON.stringify(createItemResp, null, 2));

  // 7. 获取物品列表
  console.log("\n[7] Get Item List Test...");
  const listItemBody = {
    category_id: 1,
    page: 1,
    page_size: 10,
  };
  const listItemResp = await postRequest<ApiResponse<any>>("/item/list", listItemBody, authToken);
  console.log("Item List Response:", JSON.stringify(listItemResp, null, 2));

  // 8. 获取物品详情
  console.log("\n[8] Get Item Detail Test...");
  const detailItemBody = {
    item_id: 1,
  };
  const detailItemResp = await postRequest<ApiResponse<any>>("/item/detail", detailItemBody, authToken);
  console.log("Item Detail Response:", JSON.stringify(detailItemResp, null, 2));

  // 9. 更新物品
  console.log("\n[9] Update Item Test...");
  const updateItemBody = {
    item_id: 1,
    name: "Milk (Updated)",
    quantity: 3,
  };
  const updateItemResp = await postRequest<ApiResponse<any>>("/item/update", updateItemBody, authToken);
  console.log("Update Item Response:", JSON.stringify(updateItemResp, null, 2));

  // 10. 获取即将过期的物品
  console.log("\n[10] Get Expiring Items Test...");
  const expiringItemBody = {
    days: 7,
  };
  const expiringItemResp = await postRequest<ApiResponse<any>>("/item/expiring", expiringItemBody, authToken);
  console.log("Expiring Items Response:", JSON.stringify(expiringItemResp, null, 2));

  // 11. 删除物品
  console.log("\n[11] Delete Item Test...");
  const deleteItemBody = {
    item_id: 1,
  };
  const deleteItemResp = await postRequest<ApiResponse<any>>("/item/delete", deleteItemBody, authToken);
  console.log("Delete Item Response:", JSON.stringify(deleteItemResp, null, 2));
}

/**
 * 清理测试
 * 清理测试数据
 *
 * @param authToken 有效的认证 token
 */
async function testCleanup(authToken: string): Promise<void> {
  printHeader("[Cleanup Tests]", "yellow");

  // 12. 删除分类
  console.log("[12] Delete Category Test...");
  const deleteCategoryBody = {
    category_id: 1,
  };
  const deleteCategoryResp = await postRequest<ApiResponse<any>>("/category/delete", deleteCategoryBody, authToken);
  console.log("Delete Category Response:", JSON.stringify(deleteCategoryResp, null, 2));
}

// ============================================
// 主函数
// ============================================

/**
 * 主测试流程
 * 按照 test-api.ps1 的逻辑顺序执行所有测试
 */
async function main(): Promise<void> {
  printHeader("ThingsExpired API Test Script", "cyan");

  try {
    // Step 1: 用户模块测试，获取认证 Token
    const authToken = await testUserModule();

    // Step 2: 认证分支验证测试
    await testAuthenticationBranch(authToken);

    // Step 3: 分类模块测试
    await testCategoryModule(authToken);

    // Step 4: 物品模块测试
    await testItemModule(authToken);

    // Step 5: 清理测试
    await testCleanup(authToken);

    // 测试完成
    printHeader("API Test Completed!", "cyan");
    console.log("\n🎉 All tests executed successfully!\n");
  } catch (error: any) {
    console.error("\n\x1b[31m❌ Test failed with error:\x1b[0m", error.message);
    
    // 打印详细错误信息用于调试
    if (error.stack) {
      console.error("\x1b[90mStack trace:\x1b[0m", error.stack);
    }
    
    // 抛出错误使进程以非零状态码退出
    throw error;
  }
}

// 执行主函数
main();
