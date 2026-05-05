import { eq, and, sql } from "drizzle-orm";
import type { DBInstance } from "./db";
import { sessions } from "../model/session";
import type { ISessionRepository } from "./interfaces";
import type { InsertSession, Session } from "../model/session";

export class SessionRepository implements ISessionRepository {
  constructor(private db: DBInstance) {}

  async findById(id: number): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByJTI(jti: string): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.jti, jti))
      .limit(1);
    return result[0] || null;
  }

  async create(data: InsertSession): Promise<Session> {
    const result = await this.db
      .insert(sessions)
      .values(data)
      .returning();
    return result[0] as Session;
  }

  async revoke(id: number): Promise<void> {
    await this.db
      .update(sessions)
      .set({ isRevoked: 1 })
      .where(eq(sessions.id, id))
      .run();
  }

  async revokeAllByUserId(userId: number): Promise<void> {
    await this.db
      .update(sessions)
      .set({ isRevoked: 1 })
      .where(eq(sessions.userId, userId))
      .run();
  }

  async listByUserId(userId: number): Promise<Session[]> {
    return await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(sql`${sessions.createdAt} DESC`)
      .all();
  }

  async countActiveByUserId(userId: number): Promise<number> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isRevoked, 0),
        ),
      );
    return countResult[0]?.count ?? 0;
  }
}
