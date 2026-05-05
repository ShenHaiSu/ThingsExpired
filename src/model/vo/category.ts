export interface CategoryVO {
  category_id: number;
  user_id: number;
  name: string;
  color: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export function toCategoryVO(cat: {
  id: number;
  userId: number;
  name: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
}): CategoryVO {
  return {
    category_id: cat.id,
    user_id: cat.userId,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    sort_order: cat.sortOrder,
    created_at: cat.createdAt,
  };
}
