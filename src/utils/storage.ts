/**
 * 存储工具函数
 * 封装 localStorage 和 sessionStorage，提供类型安全的存储方法
 */

const PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'app_'

/**
 * 存储管理器类
 */
class StorageManager {
  private storage: globalThis.Storage

  constructor(storage: globalThis.Storage) {
    this.storage = storage
  }

  /**
   * 设置值
   */
  set<T>(key: string, value: T): void {
    const data = JSON.stringify(value)
    this.storage.setItem(PREFIX + key, data)
  }

  /**
   * 获取值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    const item = this.storage.getItem(PREFIX + key)
    if (!item) return defaultValue
    try {
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  }

  /**
   * 移除值
   */
  remove(key: string): void {
    this.storage.removeItem(PREFIX + key)
  }

  /**
   * 清空所有值
   */
  clear(): void {
    this.storage.clear()
  }

  /**
   * 判断是否存在
   */
  has(key: string): boolean {
    return this.storage.getItem(PREFIX + key) !== null
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Object.keys(this.storage).filter((key) => key.startsWith(PREFIX))
  }
}

// 创建 localStorage 和 sessionStorage 实例
export const localCache = new StorageManager(globalThis.localStorage)
export const sessionCache = new StorageManager(globalThis.sessionStorage)

// 兼容旧写法 - 使用别名避免覆盖全局变量
export const storage = {
  local: {
    set: <T>(key: string, value: T) => localCache.set(key, value),
    get: <T>(key: string, defaultValue?: T) => localCache.get(key, defaultValue),
    remove: (key: string) => localCache.remove(key),
    clear: () => localCache.clear(),
    has: (key: string) => localCache.has(key),
    keys: () => localCache.keys(),
  },
  session: {
    set: <T>(key: string, value: T) => sessionCache.set(key, value),
    get: <T>(key: string, defaultValue?: T) => sessionCache.get(key, defaultValue),
    remove: (key: string) => sessionCache.remove(key),
    clear: () => sessionCache.clear(),
    has: (key: string) => sessionCache.has(key),
    keys: () => sessionCache.keys(),
  },
}
