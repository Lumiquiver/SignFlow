# SignFlow: Real-Time Sign Language Translator

SignFlow is a web-based application that translates American Sign Language (ASL) gestures into text in real-time using your webcam. The application leverages machine learning and computer vision to provide an accessible communication tool for both deaf and hearing individuals.

![SignFlow Demo](https://raw.githubusercontent.com/Lumiquiver/SignFlow/refs/heads/main/42993bd2-d388-4d1b-b8da-945eb54b97af.jpg)

## Features

- **Real-time Sign Language Translation**: Translate ASL hand gestures into text with your webcam
- **Multi-gesture Support**: Recognizes both alphabets and common phrases
- **Learning Mode**: Practice and learn new signs with feedback
- **Offline Capability**: Works without an internet connection after initial load
- **Mobile-Responsive Design**: Use on any device with a camera
- **Accessibility-Focused**: High contrast UI with clear text for all users
- **Privacy-First**: All processing happens locally on your device

## Live Demo

Try the live application at: [https://lumiquiver.github.io/signflow](https://lumiquiver.github.io/signflow)

## How It Works

SignFlow uses TensorFlow.js and the handpose model to detect hand landmarks from your webcam feed. These landmarks are then processed through our custom gesture recognition algorithm that matches finger positions against known sign patterns from the Microsoft American Sign Language (MS-ASL) dataset.

The application features:
- Hand position and orientation detection
- Finger extension pattern matching
- Confidence threshold adjustments for different gesture types
- Gesture sequence recognition for phrases

## Getting Started

### Online Use
Simply visit [https://lumiquiver.github.io/signflow](https://lumiquiver.github.io/signflow) in any modern browser.

### Local Installation

1. Clone the repository:
   ```
   git clone https://github.com/lumiquiver/signflow.git
   cd signflow
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser to `http://localhost:5000`

## Usage Guide

1. **Allow Camera Access**: When prompted, allow the application to access your webcam
2. **Position Your Hand**: Center your hand in the camera view
3. **Make ASL Signs**: Form ASL signs with your hand
4. **View Results**: Recognized signs appear in the translation panel
5. **Browse Categories**: Use the Categories button to explore available signs
6. **Adjust Settings**: Customize recognition sensitivity in Settings

## Recognized Signs

SignFlow currently recognizes:
- All 26 letters of the ASL alphabet (A-Z)
- Common phrases: "Hello", "Thank You", "Please", "Yes", "No", "Good", "Bad", "Love"
- Additional signs are being added regularly

## Technologies Used

- **Frontend**: React, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (optional)
- **Machine Learning**: TensorFlow.js, handpose model
- **Deployment**: GitHub Pages

## Local Development

### Project Structure

```
signflow/
├── client/            # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── data/        # Static gesture data
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utility functions
│   │   └── pages/       # Application pages
├── server/            # Backend Express server
│   ├── routes.ts      # API endpoints
│   └── storage.ts     # Data storage layer
├── shared/            # Shared type definitions
└── docs/              # Documentation files
```

### Database Setup (Optional)

The application works with an in-memory database by default, but PostgreSQL support is available:

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable
3. Run the application with the following command:
   ```
   npm run dev
   ```

### GitHub Pages Deployment

The application can be deployed to GitHub Pages automatically using the included GitHub Actions workflow:

1. Push your code to GitHub
2. Go to the Actions tab in your repository
3. The workflow will automatically build and deploy to GitHub Pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- TensorFlow.js team for the handpose model
- Microsoft Research for the MS-ASL dataset
- All contributors who have helped improve SignFlow

## Contact

For questions or feedback, please open an issue on GitHub or reach out through my GitHub profile [@lumiquiver](https://github.com/lumiquiver)
