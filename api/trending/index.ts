import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, json } from '../_lib/cors';
import { getSql } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT search_term, movie_id, title, count, poster_url
      FROM search_queries
      ORDER BY count DESC
      LIMIT 5
    `;

    const trending = rows.map((item) => ({
      searchTerm: item.search_term as string,
      movie_id: item.movie_id as number,
      title: item.title as string,
      count: item.count as number,
      poster_url: item.poster_url as string | null,
    }));

    return json(res, 200, { trending });
  } catch (err) {
    console.error('trending GET error:', err);
    return json(res, 500, { error: 'Failed to fetch trending' });
  }
}
