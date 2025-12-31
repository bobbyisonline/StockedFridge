# 🍳 Fridge Chef

> Transform static images of food ingredients into structured culinary recipes using AI

## Overview

Fridge Chef is an Expo-based mobile application (iOS/Android) that revolutionizes home cooking by using Large Language Models to analyze photos of your ingredients and generate complete, structured recipes. Simply snap a photo of what's in your fridge, and let AI create delicious recipes tailored to what you have.

## ✨ Features

- 📸 **Smart Image Capture**: Take photos or select from gallery with automatic compression
- 🤖 **AI Recipe Generation**: Powered by GPT-4 Vision to analyze ingredients and create recipes
- 📚 **Recipe Library**: Save and manage all your generated recipes
- 🔍 **Search & Filter**: Find recipes by name, ingredients, or tags
- 🏷️ **Smart Tagging**: Automatic categorization (Vegan, Quick, Healthy, etc.)
- 📊 **Nutrition Info**: Calorie and macro tracking for each recipe
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 💾 **Offline Storage**: Recipes saved locally with AsyncStorage

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native with Expo (Managed Workflow)
- **Language**: TypeScript (Strict Mode)
- **Routing**: Expo Router (File-based routing)
- **Styling**: React Native StyleSheet with theme constants
- **State Management**: Zustand (global state) + React Hooks
- **AI/LLM**: OpenAI GPT-4 Vision API
- **Storage**: AsyncStorage for local persistence

### Project Structure

```
fridge-chef/
├── app/                              # Expo Router file-based routing
│   ├── (tabs)/                       # Tab navigation
│   │   ├── index.tsx                 # Home/Camera screen
│   │   ├── recipes.tsx               # Recipe library
│   │   └── settings.tsx              # User settings
│   ├── recipe/[id].tsx               # Dynamic recipe detail
│   └── _layout.tsx                   # Root layout
├── src/
│   ├── components/
│   │   ├── ui/                       # Reusable atoms
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Badge.tsx
│   │   └── features/                 # Domain-specific components
│   │       ├── CameraCapture.tsx
│   │       ├── ImagePreview.tsx
│   │       ├── RecipeGenerator.tsx
│   │       └── RecipeSteps.tsx
│   ├── hooks/                        # Custom hooks
│   │   ├── useCamera.ts
│   │   ├── useImagePicker.ts
│   │   ├── useGenerateRecipe.ts
│   │   ├── useRecipeStorage.ts
│   │   └── usePermissions.ts
│   ├── services/                     # API abstraction
│   │   ├── LLMService.ts             # OpenAI integration
│   │   ├── ImageService.ts           # Image processing
│   │   ├── StorageService.ts         # Local storage
│   │   └── CameraService.ts          # Camera access
│   ├── store/                        # Zustand stores
│   │   ├── scanSessionStore.ts
│   │   ├── recipeStore.ts
│   │   └── settingsStore.ts
│   ├── types/                        # TypeScript definitions
│   │   ├── recipe.types.ts
│   │   ├── scan.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   ├── utils/                        # Helper functions
│   │   ├── imageUtils.ts
│   │   ├── promptBuilder.ts
│   │   └── validators.ts
│   └── constants/                    # App constants
│       ├── prompts.ts
│       ├── config.ts
│       └── theme.ts
└── assets/
```

### Core User Flows

#### 1. Capture Flow
```
Permission Check → Image Capture → Compression → Base64 Conversion → Ready for API
```

#### 2. Recipe Generation Flow
```
Image Submission → AI Analysis → JSON Parsing → Validation → Storage → Display
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fridge-chef.git
   cd fridge-chef
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on a device**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 📱 Usage

1. **Capture Ingredients**: Open the app and tap "Take Photo" or "Choose from Gallery"
2. **Preview**: Review the captured image and tap "Generate Recipe"
3. **Wait for Magic**: AI analyzes your ingredients (10-15 seconds)
4. **View Recipe**: Complete recipe with ingredients, steps, and nutrition info
5. **Save & Browse**: Recipe automatically saved to your library

## 🔧 Configuration

### API Settings

Edit `src/constants/config.ts` to customize:

```typescript
export const API_CONFIG = {
  OPENAI_MODEL: 'gpt-4o',      // Model to use
  MAX_TOKENS: 2000,             // Response length
  TEMPERATURE: 0.7,             // Creativity (0-1)
};
```

### Image Processing

Adjust compression in `src/constants/config.ts`:

```typescript
export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
  MAX_SIZE_MB: 5,
};
```

## 🎨 Customization

### Theme

Modify colors and spacing in `src/constants/theme.ts`:

```typescript
export const COLORS = {
  primary: '#10B981',    // Emerald green
  secondary: '#F59E0B',  // Amber
  // ... more colors
};
```

### System Prompts

Fine-tune AI behavior in `src/constants/prompts.ts`:

```typescript
export const SYSTEM_PROMPTS = {
  RECIPE_GENERATION: `Your custom prompt here...`,
};
```

## 🧪 Development

### Type Checking
```bash
npm run type-check
```

### Code Structure Guidelines

- **Services**: Never call `fetch` directly from components
- **Hooks**: Encapsulate all business logic
- **Components**: Keep UI components pure and reusable
- **Types**: Always define interfaces for data structures

## 📦 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### EAS Build (Recommended)
```bash
eas build --platform all
```

## 🐛 Troubleshooting

### Common Issues

**Camera not working**
- Check permissions in device settings
- Ensure `expo-camera` is properly installed

**API errors**
- Verify OpenAI API key is valid
- Check internet connection
- Ensure you have API credits

**Build failures**
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 Vision API
- Expo team for the amazing framework
- React Native community

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@fridgechef.app

---

**Built with ❤️ using React Native, Expo, and AI**