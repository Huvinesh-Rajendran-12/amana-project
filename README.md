This is a [Next.js](https://nextjs.org) project with a [Convex](https://www.convex.dev) backend for a personal finance AI assistant.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Convex account (sign up at [convex.dev](https://www.convex.dev))

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Set up Convex:**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project (if you don't have one)
   - Generate deployment URL
   - Start the Convex development server

3. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   ```
   
   The Convex URL will be provided when you run `npx convex dev`.

4. **Set Convex environment variables:**
   
   In your Convex dashboard (or via CLI), set:
   ```bash
   npx convex env set ANTHROPIC_API_KEY your_api_key_here
   ```
   This enables AI-powered insights (optional but recommended).

5. **Start the Next.js development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** to see your app.

## Deployment

### Step 1: Deploy Convex Backend

1. **Deploy to Convex production:**
   ```bash
   npx convex deploy --prod
   ```
   
   Or deploy to a specific deployment:
   ```bash
   npx convex deploy
   ```

2. **Set production environment variables in Convex:**
   ```bash
   npx convex env set ANTHROPIC_API_KEY your_api_key_here --prod
   ```

3. **Get your production Convex URL:**
   - After deployment, Convex will display your deployment URL
   - Or find it in your [Convex Dashboard](https://dashboard.convex.dev)
   - It will look like: `https://your-project.convex.cloud`

### Step 2: Deploy Next.js Frontend to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Import your project to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure environment variables:**
   - In Vercel project settings → Environment Variables
   - Add: `NEXT_PUBLIC_CONVEX_URL` = `https://your-production-convex-url.convex.cloud`
   - Make sure to set it for **Production**, **Preview**, and **Development** environments

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your Next.js app

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   When prompted:
   - Set `NEXT_PUBLIC_CONVEX_URL` environment variable
   - Use your production Convex URL from Step 1

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Step 3: Verify Deployment

1. **Check your Vercel deployment URL** (provided after deployment)
2. **Verify Convex connection** - The app should connect to your Convex backend
3. **Test functionality** - Ensure all features work correctly

### Environment Variables Summary

**Next.js (Vercel):**
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL

**Convex (Convex Dashboard/CLI):**
- `ANTHROPIC_API_KEY` - Your Anthropic API key for AI features (optional)

### Continuous Deployment

Once set up:
- **Convex**: Automatically deploys when you push to your main branch (if configured)
- **Vercel**: Automatically deploys when you push to your main branch
- Both services support preview deployments for pull requests

### Troubleshooting

- **Connection issues**: Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly in Vercel
- **API errors**: Check Convex environment variables are set in production
- **Build failures**: Check Vercel build logs for errors

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Vercel Deployment Guide](https://vercel.com/docs)
