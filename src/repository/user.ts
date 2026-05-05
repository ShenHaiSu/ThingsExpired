import { eq } from "drizzle-orm";
import type { DBInstance } from "./db";
import { users } from "../model/user";
import type { IUserRepository } from "./interfaces";
import type { InsertUser, User } from "../model/user";

export class UserRepository implements IUserRepository {
  constructor(private db: DBInstance) {}

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] || null;
  }

  async create(data: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(data).returning();
    return result[0] as User;
  }

  async update(
    id: number,
    data: Partial<InsertUser>,
  ): Promise<User | null> {
    const result = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }
}
