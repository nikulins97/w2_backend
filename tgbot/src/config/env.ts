import dotenv from 'dotenv';

dotenv.config();

export type Env = {
  botToken: string;
  apiBaseUrl: string;
  businessBaseUrl: string;
  logLevel: string;
  healthPort: number;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function optionalUrl(name: string, fallback: string): string {
  const value = process.env[name] || fallback;
  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

function optionalPort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be a TCP port`);
  }

  return port;
}

export function loadEnv(): Env {
  return {
    botToken: required('BOT_TOKEN'),
    apiBaseUrl: optionalUrl('API_BASE_URL', 'http://localhost:3000'),
    businessBaseUrl: optionalUrl('BUSINESS_BASE_URL', 'http://localhost:4000'),
    logLevel: process.env.LOG_LEVEL || 'info',
    healthPort: optionalPort('HEALTH_PORT', 4100),
  };
}
