export interface ItemVO {
  item_id: number;
  user_id: number;
  category_id: number;
  name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  expired_at: string;
  remind_days: number;
  status: number;
  created_at: string;
}

export function toItemVO(item: {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  expiredAt: string;
  remindDays: number;
  status: number;
  createdAt: string;
}): ItemVO {
  return {
    item_id: item.id,
    user_id: item.userId,
    category_id: item.categoryId,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    expired_at: item.expiredAt,
    remind_days: item.remindDays,
    status: item.status,
    created_at: item.createdAt,
  };
}

export interface ExpiringItemVO extends ItemVO {
  days_until_expired: number;
}

export function toExpiringItemVO(
  item: {
    id: number;
    userId: number;
    categoryId: number;
    name: string;
    description: string | null;
    quantity: number;
    unit: string | null;
    expiredAt: string;
    remindDays: number;
    status: number;
    createdAt: string;
  },
  daysUntilExpired: number,
): ExpiringItemVO {
  return {
    ...toItemVO(item),
    days_until_expired: daysUntilExpired,
  };
}

export interface ItemStatsVO {
  total: number;
  expiring_soon: number;
  expired: number;
  used: number;
}

export function toItemStatsVO(stats: {
  total: number;
  expiringSoon: number;
  expired: number;
  used: number;
}): ItemStatsVO {
  return {
    total: stats.total,
    expiring_soon: stats.expiringSoon,
    expired: stats.expired,
    used: stats.used,
  };
}
