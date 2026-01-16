# 🥗 StockedFridge

> Turn what you have into delicious meals with AI-powered recipe generation

## Overview

StockedFridge is an Expo-based mobile application (iOS/Android) that helps you make the most of the ingredients you have at home. Using Google's Gemini AI with vision capabilities, the app analyzes photos of your ingredients, manages your virtual fridge inventory, and generates personalized recipes based on what you have available.

## ✨ Features

### 📸 Smart Ingredient Detection
- Take photos or select from gallery with automatic compression
- AI-powered ingredient recognition from images
- Support for multiple photos in a single scan
- Review and edit detected ingredients before saving

### 🧊 Virtual Fridge Management
- Maintain a digital inventory of your ingredients
- Add ingredients manually or from scanned photos
- Remove items as you use them
- Duplicate detection prevents adding the same item twice

### 🍳 AI Recipe Generation
- Powered by **Google Gemini 2.5 Flash** for fast, accurate recipe generation
- Generate recipes directly from photos or from your fridge inventory
- Smart suggestions based on what you have available
- Culinary rules prevent "gross" flavor combinations

### 🛒 Shopping Recommendations
- Get intelligent suggestions for ingredients to buy
- See what recipes become possible with new purchases
- AI-generated shopping lists based on your current inventory

### 📚 Recipe Library
- Save and manage all your generated recipes
- View detailed recipe information with steps, timing, and nutrition
- Smart tagging (Vegan, Quick, Healthy, Breakfast, Dinner, etc.)
- Macro tracking (calories, protein, carbs, fat)

### 🎨 Modern Design
- Clean, intuitive interface with emerald green branding
- Bottom sheet interactions for suggestions
- Swipe-to-delete for fridge items
- Smooth animations throughout

## 🏗️ Architecture

### Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native with Expo SDK 54 |
| **Language** | TypeScript |
| **Routing** | Expo Router (File-based) |
| **State Management** | Zustand |
| **AI/LLM** | Google Gemini 2.5 Flash |
| **Storage** | AsyncStorage |
| **UI Components** | React Native Gesture Handler, Reanimated, Bottom Sheet |

### Project Structure

```
stocked-fridge/
├── app/                              # Expo Router file-based routing
│   ├── (tabs)/                       # Tab navigation
│   │   ├── index.tsx                 # Home - Camera & scan flow
│   │   ├── fridge.tsx                # My Fridge - Ingredient inventory
│   │   ├── recipes.tsx               # Recipe library
│   │   └── settings.tsx              # User settings
│   ├── recipe/[id].tsx               # Dynamic recipe detail page
│   └── _layout.tsx                   # Root layout
├── src/
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── Typography.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ...
│   │   └── features/                 # Domain-specific components
│   │       ├── CameraCapture.tsx     # Photo capture interface
│   │       ├── IngredientReviewScreen.tsx  # Post-scan review
│   │       ├── RecipeGenerator.tsx   # Generation loading screen
│   │       ├── SuggestionsSheet.tsx  # Shopping recommendations
│   │       └── AddIngredientModal.tsx
│   ├── hooks/                        # Custom React hooks
│   │   ├── useCamera.ts
│   │   ├── useImagePicker.ts
│   │   ├── useGenerateRecipe.ts
│   │   ├── useRecipeStorage.ts
│   │   └── usePermissions.ts
│   ├── services/                     # API & business logic
│   │   ├── LLMService.ts             # Gemini AI integration
│   │   ├── ImageService.ts           # Image processing & compression
│   │   ├── StorageService.ts         # AsyncStorage wrapper
│   │   └── CameraService.ts          # Camera utilities
│   ├── store/                        # Zustand state stores
│   │   ├── fridgeStore.ts            # Fridge inventory state
│   │   ├── recipeStore.ts            # Saved recipes state
│   │   ├── scanSessionStore.ts       # Active scan session
│   │   └── settingsStore.ts          # User preferences
│   ├── types/                        # TypeScript definitions
│   ├── utils/                        # Helper functions
│   │   ├── culinaryRules.ts          # Flavor pairing validation
│   │   ├── promptBuilder.ts          # AI prompt construction
│   │   └── validators.ts             # Data validation
│   └── constants/
│       ├── config.ts                 # API & app configuration
│       ├── prompts.ts                # AI system prompts
│       └── theme.ts                  # Design tokens
└── assets/
```

### Core User Flows

#### 1. Scan & Add to Fridge
```
Take Photo → AI Detects Ingredients → Review & Edit → Add to Fridge
```

#### 2. Generate Recipe from Fridge
```
View Fridge → Get Suggestions → Select Recipe Idea → AI Generates Full Recipe → Save
```

#### 3. Direct Recipe from Photo
```
Take Photo → AI Detects & Generates Recipe → Review → Save to Library
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- iOS Simulator (Mac) or Android Emulator
- Google AI Studio API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fridge-chef.git
   cd stocked-fridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file and add your Gemini API key:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on a device**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 📱 Usage

### Adding Ingredients to Your Fridge
1. Open the app and tap **"Take Photo"** or **"Choose from Gallery"**
2. Review the AI-detected ingredients
3. Remove any incorrectly detected items
4. Tap **"Add to My Fridge"**

### Getting Recipe Ideas
1. Go to the **My Fridge** tab
2. Tap **"Get Suggestions"**
3. View recommended ingredients to buy and possible recipes
4. Tap any recipe name to generate the full recipe

### Generating a Recipe Directly
1. From the **Home** tab, capture your ingredients
2. After reviewing, tap **"Generate Recipes"**
3. The AI will create a complete recipe with steps and nutrition info

## 🔧 Configuration

### API Settings

Edit `src/constants/config.ts` to customize:

```typescript
export const API_CONFIG = {
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  GEMINI_MODEL: 'models/gemini-2.5-flash-lite',
  MAX_TOKENS: 3072,
  TEMPERATURE: 0.3,
};
```

### Image Processing

```typescript
export const IMAGE_CONFIG = {
  MAX_WIDTH: 768,
  MAX_HEIGHT: 768,
  QUALITY: 0.7,
  MAX_SIZE_MB: 5,
};
```

## 🎨 Customization

### Theme

Modify colors and spacing in `src/constants/theme.ts`:

```typescript
export const COLORS = {
  primary: '#10B981',    // Emerald green
  background: '#FFFFFF',
  textPrimary: '#111827',
  // ...
};
```

### AI Prompts

Customize AI behavior in `src/constants/prompts.ts`:

```typescript
export const SYSTEM_PROMPTS = {
  RECIPE_GENERATION: `...`,
  INGREDIENT_DETECTION: `...`,
  INGREDIENT_RECOMMENDATIONS: `...`,
};
```

## 🧪 Development

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run type-check # TypeScript type checking
npm run lint       # ESLint code linting
```

### Code Guidelines

- **Services**: API calls abstracted in service classes
- **Hooks**: Business logic encapsulated in custom hooks
- **Components**: UI components kept pure and reusable
- **Types**: All data structures have TypeScript interfaces
- **State**: Zustand stores for global state management

## 📦 Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for all platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android
```

### Development Builds

```bash
# Create a development build
eas build --profile development --platform ios
```

## 🐛 Troubleshooting

### Common Issues

**Camera not working**
- Check permissions in device settings
- Ensure `expo-camera` is properly installed
- Try restarting the Expo dev server

**API errors**
- Verify your Gemini API key is valid
- Check your internet connection
- Ensure you haven't exceeded API rate limits

**Ingredients not detected**
- Use good lighting when taking photos
- Ensure ingredients are clearly visible
- Try taking the photo from a different angle

**Pantry staples in recipes**
- The AI assumes common staples are always available (salt, pepper, oil, butter, water)
- Recipes may include these even if not in your fridge

**Build failures**
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

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

- [Google Gemini](https://ai.google.dev/) for AI vision and generation capabilities
- [Expo](https://expo.dev/) for the amazing React Native framework
- [Zustand](https://github.com/pmndrs/zustand) for simple state management
- React Native community for excellent tooling

---

**Built with ❤️ using React Native, Expo, and Google Gemini AI**
