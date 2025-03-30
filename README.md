# Sign Language Translator

A web-based sign language translator that uses machine learning and computer vision to convert American Sign Language (ASL) into real-time text output.

## Features

- Real-time hand gesture detection
- Translation of ASL alphabet, words, and phrases
- User-friendly, accessible interface
- Optimized for performance with TensorFlow.js
- Responsive design for mobile and desktop use

## Technologies Used

- React with TypeScript
- TensorFlow.js and Handpose model
- Express backend (optional, for local development)
- Shadcn UI components with Tailwind CSS
- PostgreSQL database (optional, for local development)

## Getting Started

### Prerequisites

- Node.js (version 18+)
- npm or yarn
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/sign-language-translator.git
   cd sign-language-translator
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:5000

## Deployment Options

### GitHub Pages (Static Frontend Only)

This application has been configured to work on GitHub Pages with a static frontend. The backend API calls are replaced with static data when deployed to a `github.io` domain.

Follow these steps to deploy to GitHub Pages:

1. Fork or clone this repository
2. Make any desired changes
3. Follow one of these deployment methods:

#### Method 1: Automatic GitHub Actions Deployment

The repository includes a GitHub Actions workflow that will automatically build and deploy the site to GitHub Pages when you push to the main branch.

1. In your repository settings, enable GitHub Pages
2. Select the `gh-pages` branch as the source
3. Push changes to the main branch
4. GitHub Actions will build and deploy automatically

#### Method 2: Manual Deployment

1. Build the project
   ```bash
   npm run build
   ```

2. Copy the contents of the `dist/public` directory to the `docs` folder
   ```bash
   mkdir -p docs
   cp -r dist/public/* docs/
   ```

3. Push the changes to GitHub
   ```bash
   git add docs
   git commit -m "Update GitHub Pages build"
   git push
   ```

4. In your repository settings, enable GitHub Pages and select the main branch and `/docs` folder as the source

### Alternative Deployment Options

For a full-stack deployment with database support:

1. Deploy the backend to a service like Render, Railway, or Heroku
2. Update the API endpoints in the frontend to point to your deployed backend
3. Deploy the frontend to GitHub Pages or another static hosting service

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Microsoft ASL dataset for training data
- TensorFlow.js team for the Handpose model
- Google Translate for UI inspiration