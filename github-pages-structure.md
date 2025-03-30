# GitHub Pages File Structure

When deploying to GitHub Pages, your repository should have the following structure:

```
sign-language-translator/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions workflow for automated deployment
├── client/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── data/
│   │   │   └── gestures.json    # Static gesture data for GitHub Pages
│   │   ├── lib/
│   │   │   ├── staticApiService.ts  # Service to replace backend API calls
│   │   │   └── queryClient.ts   # Modified to use static data on github.io
│   │   ├── App.tsx
│   │   └── ...
│   └── ...
├── docs/                        # GitHub Pages deployment folder
│   ├── assets/                  # Built assets
│   ├── index.html               # Main HTML file
│   └── ...                      # Other built files
├── server/                      # Server files (not used in GitHub Pages)
├── github-pages.md              # Deployment instructions
├── README.md                    # Project documentation
└── ...                          # Other project files
```

## Important Files for GitHub Pages Deployment

1. **client/src/data/gestures.json**
   - Contains all gesture data
   - Used instead of database queries on GitHub Pages

2. **client/src/lib/staticApiService.ts**
   - Mimics backend API functionality
   - Uses static JSON data instead of server calls

3. **client/src/lib/queryClient.ts**
   - Modified to detect github.io domain
   - Redirects API calls to static data service

4. **.github/workflows/deploy.yml**
   - Optional GitHub Actions workflow
   - Automates build and deployment process

5. **docs/ directory**
   - Contains the built static site
   - GitHub Pages will serve files from this directory

## Notes on GitHub Pages Limitations

1. GitHub Pages only serves static content
2. No server-side processing is available
3. All data must be included in the static files
4. API calls to external services are still possible
5. Use environment detection to switch between development and production modes