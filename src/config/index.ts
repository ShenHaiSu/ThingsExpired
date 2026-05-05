export interface AppConfig {
  name: string;
  host: string;
  port: number;
  mode: "debug" | "release";
}

export interface DatabaseConfig {
  path: string;
  mode: "debug" | "release";
}

export interface JWTConfig {
  secret: string;
  expireHours: number;
}

export interface SessionConfig {
  maxSessions: number;
}

export interface ExpirationConfig {
  enabled: boolean;
  intervalSec: number;
  batchSize: number;
}

export interface LogConfig {
  path: string;
  level: "debug" | "info" | "warn" | "error";
  maxFiles: number;
}

export interface SPAConfig {
  enabled: boolean;
  distPath: string;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JWTConfig;
  session: SessionConfig;
  expiration: ExpirationConfig;
  log: LogConfig;
  spa: SPAConfig;
}

export function loadConfig(): Config {
  return {
    app: {
      name: process.env.APP_NAME || "ThingsExpired",
      host: process.env.APP_HOST || "0.0.0.0",
      port: parseInt(process.env.APP_PORT || "8080", 10),
      mode: (process.env.APP_MODE || "debug") as "debug" | "release",
    },
    database: {
      path: process.env.DB_PATH || "./data/app.db",
      mode: (process.env.APP_MODE || "debug") as "debug" | "release",
    },
    jwt: {
      secret: process.env.JWT_SECRET || "things-expired-secret-key-2024",
      expireHours: parseInt(process.env.JWT_EXPIRE_HOURS || "24", 10),
    },
    session: {
      maxSessions: parseInt(process.env.SESSION_MAX_SESSIONS || "3", 10),
    },
    expiration: {
      enabled: process.env.EXPIRATION_ENABLED !== "false",
      intervalSec: parseInt(process.env.EXPIRATION_INTERVAL_SEC || "3600", 10),
      batchSize: parseInt(process.env.EXPIRATION_BATCH_SIZE || "100", 10),
    },
    log: {
      path: process.env.LOG_PATH || "./logs",
      level: (process.env.LOG_LEVEL || "info") as "debug" | "info" | "warn" | "error",
      maxFiles: parseInt(process.env.LOG_MAX_FILES || "7", 10),
    },
    spa: {
      enabled: process.env.SPA_ENABLED !== "false",
      distPath: process.env.SPA_DIST_PATH || "./frontend-dist",
    },
  };
}
