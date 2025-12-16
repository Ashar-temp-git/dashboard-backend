# Sales Dashboard API

Merged Single-File Entry Point with Modular Logic.

## Structure

-    **`index.js`**: Main entry point. Contains DB connection, middleware, and imports all routes.
-    **`Controllers/`, `Models/`, `Routes/`**: Modular logic used by `index.js`.
-    **`vercel.json`**: Configured to serve `index.js` as the serverless function.

## Deployment

1. **Deploy**:
     ```bash
     vercel --prod
     ```

## Development

Run locally:

```bash
npm run dev
# or
node index.js
```

The server runs at `http://localhost:8080`.
