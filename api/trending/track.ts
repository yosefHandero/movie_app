import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, json } from '../_lib/cors';
import { getSql } from '../_lib/db';
import { isValidMovieId } from '../_lib/validate';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const query = req.body?.query;
  const movie = req.body?.movie;

  if (typeof query !== 'string' || !query.trim() || typeof movie !== 'object' || !movie) {
    return json(res, 400, { error: 'Invalid request' });
  }

  const searchTerm = query.trim().slice(0, 200);
  const movieId = movie.id;
  const title = movie.title;
  const posterPath = movie.poster_path;

  if (!isValidMovieId(movieId) || typeof title !== 'string' || typeof posterPath !== 'string') {
    return json(res, 400, { error: 'Invalid movie data' });
  }

  const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

  try {
    const sql = getSql();
    const existing = await sql`
      SELECT id, count FROM search_queries
      WHERE search_term = ${searchTerm}
      LIMIT 1
    `;

    if (existing[0]) {
      const row = existing[0] as { id: number; count: number };
      await sql`
        UPDATE search_queries
        SET count = ${row.count + 1}, updated_at = NOW()
        WHERE id = ${row.id}
      `;
    } else {
      await sql`
        INSERT INTO search_queries (search_term, movie_id, title, count, poster_url)
        VALUES (${searchTerm}, ${movieId}, ${title}, 1, ${posterUrl})
      `;
    }

    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('trending track error:', err);
    return json(res, 500, { error: 'Failed to track search' });
  }
}
