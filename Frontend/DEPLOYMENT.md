# NBA Project Frontend Deployment Guide

## Vercel Deployment

This React application is configured for deployment on Vercel with proper client-side routing support.

### Key Configuration Files

1. **vercel.json** - Handles SPA routing by redirecting all requests to index.html
2. **\_redirects** - Additional fallback for routing (in public folder)
3. **vite.config.js** - Build configuration with proper base URL

### Routing Fixes Applied

- ✅ Replaced `<a href="">` tags with React Router `<Link>` components in NavBar
- ✅ Removed duplicate `/awards` route in App.jsx
- ✅ Updated Vite configuration for production builds
- ✅ Configured Vercel rewrites for SPA routing

### Build Commands

```bash
npm run build
```

### Deployment Steps

1. Ensure all changes are committed to your repository
2. Push to your main branch
3. Vercel will automatically detect the build settings and deploy

### Troubleshooting 404 Errors

If you encounter 404 errors on route navigation:

1. Check that `vercel.json` is in the root of your frontend directory
2. Verify that `_redirects` file exists in the `public` folder
3. Ensure all navigation uses React Router `<Link>` components, not `<a>` tags
4. Check that the build output includes the `index.html` file

### Local Development

```bash
npm run dev
```

The application should work correctly with client-side routing in both development and production environments.
