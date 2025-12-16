# Sales Dashboard API - Vercel Serverless Deployment

## Project Structure

```
Backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── lib/
│   └── dbConnect.js      # MongoDB connection handler (cached)
├── Controllers/
│   ├── DashboardController.js
│   ├── OrderController.js
│   ├── ProductController.js
│   └── UserController.js
├── Models/
│   ├── Dashboard.js
│   ├── Order.js
│   ├── product.js
│   └── User.js
├── Routes/
│   ├── dashboard.js
│   ├── orderRoute.js
│   ├── productRoute.js
│   └── userRoute.js
├── Middleware/
│   └── requireAuth.js
├── app.js                # Main Express application
├── local-server.js       # Local development server
├── vercel.json           # Vercel configuration
├── package.json
├── .env                  # Environment variables (DO NOT COMMIT)
├── .env.example          # Example environment variables
└── .gitignore
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
password=your_mongodb_password
SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PORT=8080
```

**Important:** In Vercel, set these environment variables in your project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable for Production, Preview, and Development environments

## Local Development

```bash
# Install dependencies
npm install

# Run with local server
npm run dev

# Run with Vercel CLI
npm run vercel-dev
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Import the repository in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on each push

## API Endpoints

| Method | Endpoint                       | Description        |
| ------ | ------------------------------ | ------------------ |
| GET    | `/api/health`                  | Health check       |
| GET    | `/api/products/getAllProducts` | Get all products   |
| GET    | `/api/products/getproduct/:id` | Get single product |
| POST   | `/api/products/addproduct`     | Add new product    |
| GET    | `/api/orders/getAllorders`     | Get all orders     |
| GET    | `/api/orders/getorder/:id`     | Get single order   |
| POST   | `/api/orders/addorder`         | Add new order      |
| GET    | `/api/dashboards/getDashboard` | Get dashboard data |
| POST   | `/api/users/signup`            | User registration  |
| POST   | `/api/users/login`             | User login         |

## Serverless Optimizations Applied

1. **Connection Caching**: MongoDB connections are cached across function invocations to prevent connection exhaustion

2. **Lean Queries**: All read operations use `.lean()` for faster serialization

3. **Proper Error Handling**: All controllers return proper status codes and handle errors gracefully

4. **CORS Configuration**: Production-ready CORS setup with configurable origins

5. **Request Limits**: Body parser configured with size limits (10MB)

6. **Memory Optimization**: Vercel function configured with 1024MB memory

7. **Timeout Configuration**: 30-second max duration for function execution

## Troubleshooting

### Cold Start Issues

If you experience slow initial responses, this is normal for serverless functions. The MongoDB connection caching helps minimize subsequent request times.

### CORS Errors

Update the `allowedOrigins` array in `app.js` to include your frontend domain.

### Database Connection Errors

1. Ensure the `password` environment variable is set correctly
2. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for serverless)
3. Verify the connection string in `lib/dbConnect.js`

## License

MIT
