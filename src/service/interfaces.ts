import type { UserVO } from "../model/vo/user";
import type { CategoryVO } from "../model/vo/category";
import type { ItemVO, ExpiringItemVO, ItemStatsVO } from "../model/vo/item";
import type {
  RegisterRequest,
  LoginRequest,
  UpdateUserRequest,
} from "../model/dto/user";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../model/dto/category";
import type {
  CreateItemRequest,
  UpdateItemRequest,
} from "../model/dto/item";

// 物品列表查询参数
export interface ItemListParams {
  page: number;
  pageSize: number;
  categoryId?: number;
  name?: string;
  description?: string;
  unit?: string;
  status?: number;
  quantityMin?: number;
  quantityMax?: number;
  remindDaysMin?: number;
  remindDaysMax?: number;
  expiredAtFrom?: string;
  expiredAtTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  orderBy?: string;
  order?: string;
}

// ===== 用户 Service 接口 =====
export interface IUserService {
  register(req: RegisterRequest, deviceInfo?: string, ipAddress?: string): Promise<{
    user_id: number;
    username: string;
    email: string;
    status: number;
    created_at: string;
  }>;
  login(req: LoginRequest, deviceInfo?: string, ipAddress?: string): Promise<{
    user_id: number;
    token: string;
    expired: string;
  }>;
  getInfo(userId: number): Promise<UserVO>;
  update(userId: number, req: UpdateUserRequest): Promise<UserVO>;
  logout(userId: number, sessionId: number): Promise<void>;
  getSessions(userId: number): Promise<{
    sessions: Array<{
      session_id: number;
      user_id: number;
      device_info: string | null;
      ip_address: string | null;
      created_at: string;
      expires_at: string;
      is_revoked: boolean;
    }>;
    total: number;
  }>;
  revokeSession(userId: number, sessionId: number): Promise<void>;
  forceLogout(userId: number): Promise<void>;
}

// ===== 分类 Service 接口 =====
export interface ICategoryService {
  create(userId: number, req: CreateCategoryRequest): Promise<CategoryVO>;
  list(
    userId: number,
    params: { page: number; pageSize: number; keyword?: string },
  ): Promise<{ list: CategoryVO[]; total: number; page: number }>;
  update(userId: number, req: UpdateCategoryRequest): Promise<CategoryVO>;
  delete(userId: number, categoryId: number): Promise<void>;
}

// ===== 物品 Service 接口 =====
export interface IItemService {
  create(userId: number, req: CreateItemRequest): Promise<ItemVO>;
  list(
    userId: number,
    params: ItemListParams,
  ): Promise<{ list: ItemVO[]; total: number; page: number }>;
  detail(userId: number, itemId: number): Promise<ItemVO>;
  update(userId: number, req: UpdateItemRequest): Promise<ItemVO>;
  delete(userId: number, itemId: number): Promise<void>;
  getExpiring(userId: number, days: number): Promise<ExpiringItemVO[]>;
  getStats(userId: number): Promise<ItemStatsVO>;
  markUsed(userId: number, itemId: number): Promise<ItemVO>;
}

// ===== 过期检查 Service 接口 =====
export interface IItemExpirationService {
  /** 启动过期检查任务 */
  start(): void;
  /** 停止过期检查任务 */
  stop(): void;
  /** 执行一次过期检查，返回更新的物品数量 */
  checkExpiredItems(): Promise<number>;
}
