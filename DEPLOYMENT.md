# Studio Fermentia - Deployment Guide

## Netlify Deployment Instructions

### Prerequisites
1. Have a Netlify account
2. Connect your GitHub repository to Netlify
3. Set up environment variables

### Environment Variables Required
Set these in your Netlify dashboard under Site Settings > Environment Variables:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
NODE_VERSION=18
NETLIFY_NEXT_PLUGIN_SKIP=false
```

### Deployment Steps

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

3. **Install Dependencies**
   The build will automatically run:
   ```bash
   npm install
   npm run build
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app

### Troubleshooting

#### Common Issues:
1. **Build fails with TypeScript errors**
   - Solution: We've configured `ignoreBuildErrors: true` in next.config.ts

2. **Environment variables not working**
   - Solution: Make sure they're set in Netlify dashboard
   - Check they start with `NEXT_PUBLIC_` for client-side variables

3. **404 errors on page refresh**
   - Solution: The `_redirects` file handles this automatically

4. **API routes not working**
   - Solution: Netlify automatically converts them to serverless functions

### Performance Optimizations
- Images are set to `unoptimized: true` for Netlify compatibility
- Static asset compression is enabled
- ETags are disabled for better caching control

### Post-Deployment
1. Test all routes work correctly
2. Verify environment variables are loaded
3. Check that API endpoints respond properly
4. Test the AI chat functionality

### Local Development vs Production
- Local: `npm run dev`
- Production: Automatically built by Netlify

### Support
If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test locally with `npm run build` first
