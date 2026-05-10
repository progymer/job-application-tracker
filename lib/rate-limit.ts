const requests = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 24 * 1000; // 24 hours

export function rateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const record = requests.get(userId);

  if (!record || now > record.resetAt) {
    requests.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (record.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: LIMIT - record.count };
}
