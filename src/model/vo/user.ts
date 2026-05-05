export interface UserVO {
  user_id: number;
  username: string;
  email: string;
  status: number;
  created_at: string;
}

export function toUserVO(user: {
  id: number;
  username: string;
  email: string;
  status: number;
  createdAt: string;
}): UserVO {
  return {
    user_id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
    created_at: user.createdAt,
  };
}
