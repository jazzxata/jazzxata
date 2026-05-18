#!/bin/bash

# Jazz Xata Quick Start Script
# Run this after installing Node.js

echo "🎵 Jazz Xata — Setting up your cottage booking website..."
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "📥 Download from: https://nodejs.org/"
    echo "   We recommend the LTS version (16+)"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ NPM $(npm --version) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Installation failed. Check the errors above."
    exit 1
fi

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env with your API keys (Stripe, MongoDB, Email)"
    echo "   See SETUP.md for detailed instructions"
    echo ""
fi

echo ""
echo "🚀 Ready to start!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API keys (Stripe, MongoDB, Email)"
echo "2. Run: npm start"
echo "3. Open: http://localhost:3001"
echo ""
echo "Need help? See SETUP.md"
