#!/bin/bash

# Create a directory for temporary files
mkdir -p tmp/signflow

# Copy all necessary files
cp -r client tmp/signflow/
cp -r server tmp/signflow/
cp -r shared tmp/signflow/
cp -r assets tmp/signflow/
cp package.json tmp/signflow/
cp package-lock.json tmp/signflow/
cp tsconfig.json tmp/signflow/
cp vite.config.ts tmp/signflow/
cp postcss.config.js tmp/signflow/
cp tailwind.config.ts tmp/signflow/
cp theme.json tmp/signflow/
cp README.md tmp/signflow/
cp drizzle.config.ts tmp/signflow/
cp -r .github tmp/signflow/

# Create the zip file
cd tmp
zip -r ../project_download.zip signflow

# Clean up
cd ..
rm -rf tmp

echo "Package created at project_download.zip"