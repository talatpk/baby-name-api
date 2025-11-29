# Baby Name API - Deployment Guide

## Quick Deployment to Vercel

### Prerequisites
- A [Vercel account](https://vercel.com) (free tier works great!)
- A [GitHub account](https://github.com) (optional, but recommended)

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   cd baby-name-api
   git init
   git add .
   git commit -m "Initial commit: Baby Name API"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/baby-name-api.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Click "Import Git Repository"
   - Select your `baby-name-api` repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Wait a few minutes for deployment to complete!

3. **Your API is now live!**
   - You'll get a URL like: `https://baby-name-api-xyz.vercel.app`
   - Test it: `https://baby-name-api-xyz.vercel.app/api/search?name=Emma`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd baby-name-api
   vercel
   ```

4. **Follow the prompts:**
   ```
   ? Set up and deploy "~/baby-name-api"? [Y/n] y
   ? Which scope do you want to deploy to? › Your Username
   ? Link to existing project? [y/N] n
   ? What's your project's name? › baby-name-api
   ? In which directory is your code located? › ./
   ```

5. **Your API is deployed!**
   - The CLI will show you the deployment URL
   - For production deployment, run: `vercel --prod`

### Method 3: One-Click Deploy Button

Add this button to your README.md:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/baby-name-api)
```

## Testing Your Deployment

Once deployed, test these endpoints:

1. **API Documentation:**
   ```
   https://your-app.vercel.app/
   ```

2. **Search for a name:**
   ```
   https://your-app.vercel.app/api/search?name=Emma
   https://your-app.vercel.app/api/search?name=Noah
   https://your-app.vercel.app/api/search?name=Sophia
   ```

## Custom Domain (Optional)

1. Go to your project on Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Environment Variables (If Needed)

If you want to add environment variables:

1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add your variables
4. Redeploy for changes to take effect

## Monitoring

- **Logs**: View in Vercel Dashboard → Your Project → Deployments → Click on a deployment
- **Analytics**: Available in the Analytics tab (requires upgrade)

## Troubleshooting

### Build Failed
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm install` and `npm run build` locally to test

### API Returns Errors
- Check function logs in Vercel dashboard
- The source website might be blocking requests. Consider:
  - Adding a delay between requests
  - Using different User-Agent headers
  - Implementing caching

### Timeout Errors
- Vercel Serverless Functions have a 10-second timeout on free tier
- The scraping should be fast enough, but consider:
  - Implementing caching
  - Upgrading to Pro for 60-second timeout

## Rate Limiting

The free tier includes:
- Unlimited API requests
- 100GB bandwidth per month
- More than enough for most use cases!

## Updating Your Deployment

When you push changes to GitHub:
1. Vercel automatically detects the push
2. Starts a new build
3. Deploys to production (if on main branch)
4. Or creates a preview deployment (if on other branches)

Manual redeploy via CLI:
```bash
vercel --prod
```

## Cost

- **Free Tier**: Perfect for this API
  - Unlimited API requests
  - 100GB bandwidth
  - 100 deployments per day
  
- **Upgrade** only if you need:
  - Custom domains
  - More bandwidth
  - Longer function timeout
  - Analytics

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**That's it! Your Baby Name API is now live and ready to use! 🎉**
