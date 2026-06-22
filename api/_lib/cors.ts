import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
  'https://movie.vercel.app',
  'https://movie-app.vercel.app',
  'https://yosefhandero.github.io',
];

// Local development can run on any port (Expo picks 8081, 8082, 19006, etc.),
// so allow any localhost / 127.0.0.1 origin regardless of port.
const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin: string): boolean {
  if (LOCALHOST_ORIGIN.test(origin)) return true;
  return ALLOWED_ORIGINS.some((o) => origin === o);
}

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).json(body);
}
