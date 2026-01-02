# Deployment Notes

## Vercel Deployment

If you encounter the error "Couldn't find any `pages` or `app` directory", ensure:

1. **All files are committed to git**: The `app` directory and all its contents must be committed to your git repository
   ```bash
   git add app/
   git add components/
   git add package.json
   git add next.config.js
   git add tailwind.config.ts
   git add tsconfig.json
   git commit -m "Initial commit"
   ```

2. **Project root is correct**: Ensure Vercel is detecting the correct project root. The `package.json` should be at the root level.

3. **Build settings**: Vercel should auto-detect Next.js. If not, verify:
   - Framework: Next.js
   - Build Command: `npm run build` (or leave default)
   - Output Directory: `.next` (or leave default)
   - Install Command: `npm install` (or leave default)

4. **Node version**: Vercel should use Node.js 18+ (default). You can specify in `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

## Local Testing

Before deploying, test locally:
```bash
npm install
npm run build
npm start
```

If the build succeeds locally, the issue is likely with git commits or Vercel configuration.

