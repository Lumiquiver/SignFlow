# Sign Language Translator

A web-based sign language translator that leverages machine learning and computer vision to convert American Sign Language (ASL) into real-time text output.

## Features

- Real-time hand gesture recognition using webcam
- Translation of ASL gestures to text
- Responsive, user-friendly interface
- Support for alphabets, words, and phrases
- Training capability for improved recognition

## Technology Stack

- **Frontend**: React, TailwindCSS, Shadcn UI components
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Machine Learning**: TensorFlow.js, Handpose model
- **API**: RESTful API for gesture data

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database (optional, can use in-memory storage)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/sign-language-translator.git
   ```

2. Navigate to the project directory
   ```
   cd sign-language-translator
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Allow camera permissions when prompted
2. Position your hand in front of the camera
3. Make ASL gestures
4. View the translated text in the translation panel

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Microsoft American Sign Language Dataset (MS-ASL)
- TensorFlow.js and Handpose model contributors
- Shadcn UI components