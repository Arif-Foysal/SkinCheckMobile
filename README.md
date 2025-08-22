# SkinCheck Mobile

A React Native mobile application for AI-powered skin analysis using React Native Paper for the UI.

## Features

### Authentication System
- **Login Screen**: Email/password authentication with the SkinCheck API
- **Signup Screen**: User registration with email verification
- **Persistent Sessions**: Automatic login state management using AsyncStorage
- **Secure Logout**: Complete session cleanup

### Main Application
- **Home Screen**: React Native Paper component showcase and app overview
- **Scan Screen**: Camera interface for skin lesion analysis
- **History Screen**: Medical scan history with filtering and sorting
- **Profile Screen**: User account management and settings

### API Integration
- **Authentication API**: Login and signup endpoints
- **Medical Scan API**: Upload and analysis endpoints (ready for integration)
- **Secure Headers**: Bearer token authentication for all API calls

## Getting Started

### Prerequisites
- Node.js
- Expo CLI
- React Native development environment

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional required packages:
```bash
npm install @react-native-async-storage/async-storage
```

3. Start the development server:
```bash
npm run start
```

## Project Structure

```
app/
├── (auth)/              # Authentication screens
│   ├── _layout.tsx      # Auth stack layout
│   ├── login.tsx        # Login screen
│   └── signup.tsx       # Signup screen
├── (tabs)/              # Main app screens
│   ├── _layout.tsx      # Tab navigation layout
│   ├── index.tsx        # Home screen
│   ├── scan.tsx         # Camera/scan screen
│   ├── history.tsx      # Scan history screen
│   └── profile.tsx      # User profile screen
├── _layout.tsx          # Root layout with auth provider
└── index.tsx            # App entry point with auth routing

contexts/
└── AuthContext.tsx      # Authentication state management

constants/
└── PaperTheme.ts        # React Native Paper theme configuration

utils/
└── api.ts               # API utility functions
```

## Authentication Flow

1. **App Launch**: Check for stored authentication data
2. **Unauthenticated**: Redirect to login screen
3. **Login**: Authenticate with API and store user data
4. **Authenticated**: Access main app features
5. **Logout**: Clear stored data and return to login

## API Endpoints

### Authentication
- **Login**: `POST https://arif194-skincheck.hf.space/auth/`
- **Signup**: `POST https://arif194-skincheck.hf.space/signup/`

### Medical Scans
- **Get History**: `GET https://skincheck-yy0v.onrender.com/upload/history` (with Bearer token)
- **Delete Scan**: `DELETE https://skincheck-yy0v.onrender.com/upload/{id}` (with Bearer token) - Ready for implementation

## Development Notes

### Current Status
- ✅ Authentication system complete
- ✅ UI components with React Native Paper
- ✅ Navigation and routing
- ✅ Real API integration for scan history
- ✅ Pull-to-refresh functionality
- 🔄 Delete API endpoint ready for implementation
- 🔄 Image upload functionality ready for implementation

### Next Steps
1. Implement delete API endpoint integration
2. Add image upload functionality in `scan.tsx`
3. Test with production API endpoints
4. Add real-time scan result updates

### Theme
The app uses a custom React Native Paper theme optimized for medical applications with appropriate colors for health-related content.

## Contributing

1. Follow the existing code structure
2. Use React Native Paper components consistently
3. Update authentication headers for all API calls
4. Test authentication flow thoroughly