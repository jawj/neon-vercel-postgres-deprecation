# neon-vercel-postgres-deprecation

This repo demonstrates using [Neon's serverless driver](https://www.npmjs.com/package/@neondatabase/serverless) to replace the `sql` tagged-template function in Vercel Postgres.


## Deploy

* Ensure the `psql` client is installed

* Create a Neon database and make a note of the connection string.

* Clone this repo, then:

```bash
# get dependencies
npm install

# set up Vercel
npx vercel login
npx vercel link

# create DATABASE_URL environment variable, remote and local
npx vercel env add DATABASE_URL  # paste in the connection string: postgres://...
npx vercel env pull .env.local  # now bring it down into ./.env.local for local use

# create the schema and copy data to DB
(source .env.local \
  && echo "CREATE TABLE posts (id serial primary key, body text not null); INSERT INTO posts (body) VALUES ('Post 1'), ('Post 2');" \
  | psql $DATABASE_URL)

# ... and deploy
npx vercel deploy
```

* Now visit the deployed API, at `/api/sql?postId=1`.
