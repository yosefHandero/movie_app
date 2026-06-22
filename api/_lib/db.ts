import { neon } from '@neondatabase/serverless';

export function getSql() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('POSTGRES_URL is not configured');
  }
  return neon(url);
}
