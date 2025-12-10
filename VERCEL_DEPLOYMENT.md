# Vercel Deployment Guide

## Required Environment Variables

Before deploying, you'll need to set these environment variables in Vercel:

### 1. MongoDB Connection
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority
MONGODB_DB_NAME=wrapsody-in-white
```

### 2. Stripe (Required for Payments)
```
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
```

### 3. Email (Optional - for sending booking confirmations)
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password
```

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub/GitLab/Bitbucket** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

3. **Import your repository**
   - Select your Git provider
   - Find and import your repository

4. **Configure Project Settings**
   - **Framework Preset:** Nuxt.js (should auto-detect)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** Leave empty (Nuxt 3 handles this automatically)
   - **Install Command:** `npm install` (auto-filled)

5. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all the variables listed above
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked about environment variables, you can add them now or later in the dashboard

4. **Set Environment Variables via CLI**
   ```bash
   vercel env add MONGODB_URI
   vercel env add MONGODB_DB_NAME
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_PUBLISHABLE_KEY
   vercel env add GMAIL_USER
   vercel env add GMAIL_APP_PASSWORD
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Method 3: Deploy via Git Integration (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect Repository in Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your Git repository

3. **Configure Environment Variables** (in Vercel Dashboard)
   - Go to Project Settings → Environment Variables
   - Add all required variables
   - This ensures they're available for all deployments

4. **Automatic Deployments**
   - Every push to `main`/`master` = Production deployment
   - Every push to other branches = Preview deployment
   - Every pull request = Preview deployment

## Post-Deployment Checklist

- [ ] Set all environment variables in Vercel dashboard
- [ ] Test the production URL
- [ ] Verify MongoDB connection (check logs)
- [ ] Test booking flow
- [ ] Test payment integration (use Stripe test cards)
- [ ] Set up custom domain (optional)
- [ ] Configure MongoDB Atlas Network Access for Vercel IPs (if needed)

## Important Notes

1. **MongoDB Atlas Network Access**
   - Make sure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` or add Vercel's IP ranges
   - For production, consider restricting to specific IPs

2. **Stripe Keys**
   - Use test keys (`pk_test_` / `sk_test_`) for staging/preview deployments
   - Use live keys (`pk_live_` / `sk_live_`) only for production

3. **Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS as instructed

4. **Build Logs**
   - Check Vercel deployment logs if build fails
   - Common issues: missing env vars, MongoDB connection issues

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 18+)

### Environment Variables Not Working
- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas Network Access settings
- Ensure database user has correct permissions

### API Routes Not Working
- Check serverless function logs in Vercel dashboard
- Verify API routes are in `server/api/` directory
- Check cold start issues (may take a few seconds on first request)
