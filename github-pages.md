# GitHub Pages Deployment Instructions

This document provides instructions for deploying this Sign Language Translator application to GitHub Pages.

## Step 1: Build Configuration

When building this application for GitHub Pages, you'll need to modify the Vite configuration to include a base path corresponding to your repository name. This step is crucial for proper asset path resolution.

Add the following to your vite.config.ts before building:

```js
// In vite.config.ts, add:
base: '/your-repository-name/',
```

Replace 'your-repository-name' with the actual name of your GitHub repository.

## Step 2: Build Process

Run the following command to build the application:

```bash
# Set environment variable for GitHub Pages build
GITHUB_PAGES=true npm run build
```

## Step 3: Preparing for Deployment

1. Create a docs directory in the root of your repository
2. Copy all contents from the `dist/public` directory to the `docs` directory

## Step 4: GitHub Pages Setup

1. Push your code to GitHub
2. Go to Settings > Pages
3. Under "Source", select "Deploy from a branch"
4. Choose the branch containing your code (usually `main` or `master`)
5. Select the `/docs` folder
6. Click "Save"

Your site will be available at: `https://your-username.github.io/your-repository-name/`

## Important Notes

1. The application uses static data when deployed to GitHub Pages
2. Backend functionality is simulated using client-side JavaScript
3. All gesture data is stored in `client/src/data/gestures.json`