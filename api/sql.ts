import { sql } from '@vercel/postgres';
import { neon } from '@neondatabase/serverless';

const deterministicReplacer = (_, v) =>
  typeof v !== 'object' || v === null || Array.isArray(v) ? v :
    Object.fromEntries(Object.entries(v).sort(([ka], [kb]) =>
      ka < kb ? -1 : ka > kb ? 1 : 0));

export default async (req: Request, ctx: any) => {
  const postId = parseInt(new URL(req.url).searchParams.get('postId')!, 10);
  if (isNaN(postId)) return new Response('Bad request', { status: 400 });

  let vresult, nresult;

  {
    // Vercel Postgres/sql
    const result = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    if (!result) return new Response('Not found (Vercel)', { status: 404 });
    vresult = result;
  }

  {
    // Neon/neon
    const sql = neon(process.env.POSTGRES_URL!, { fullResults: true });  // extra line
    const result = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    if (!result) return new Response('Not found (Neon)', { status: 404 });
    nresult = result;
  }

  // return the posts as JSON
  return new Response(JSON.stringify({
    same: JSON.stringify(nresult, deterministicReplacer) === JSON.stringify(vresult, deterministicReplacer),
    vresult,
    nresult
  }), {
    headers: { 'content-type': 'application/json' }
  });
}

export const config = {
  runtime: 'edge',
  regions: ['iad1'],  // specify the region nearest your Neon DB
};
