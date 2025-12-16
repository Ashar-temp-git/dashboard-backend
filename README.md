# Serverless MERN Backend

This project has been optimized for Vercel Serverless deployment.

## Structure

-    **`api/index.js`**: The Monolithic Serverless Function. Contains all Models, Controllers, Routes, and DB connection logic. This is the only file Vercel needs.
-    **`local-server.js`**: A local wrapper to run the API on your machine (`npm run dev`).
-    **`vercel.json`**: Configuration to route all requests to `api/index.js`.

## Deployment

1. **Push to GitHub** or use Vercel CLI.
2. **Environment Variables**: Set `password` (MongoDB) and `SECRET` (JWT) in Vercel.
3. **Deploy**:
     ```bash
     vercel --prod
     ```

## Development

Run locally:

```bash
npm run dev
```

The server runs at `http://localhost:8080`.
