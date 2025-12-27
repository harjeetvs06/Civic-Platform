# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd civic-platform
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Firebase Setup

The Firebase configuration is already set in `app/firebase.js`. Make sure:

1. **Firebase Project** is created at [Firebase Console](https://console.firebase.google.com/)
2. **Authentication** is enabled:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
3. **Firestore Database** is created:
   - Go to Firestore Database
   - Create database in production mode
   - Start in test mode (for development)
4. **Storage** is enabled:
   - Go to Storage
   - Get started
   - Start in test mode (for development)

### 4. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Maps JavaScript API**:
   - Go to APIs & Services > Library
   - Search for "Maps JavaScript API"
   - Click Enable
4. Create API Key:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the key
   - (Optional) Restrict the key to Maps JavaScript API
5. Add the key to `.env.local`

### 5. Google Gemini API Setup (Optional)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Add it to `.env.local`

**Note**: AI features will work without this, but report generation will be disabled.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the Platform

### Create Test Accounts

1. **Citizen Account**:
   - Go to `/login`
   - Click "Sign Up"
   - Select "Citizen" role
   - Create account

2. **Municipality Account**:
   - Sign up with "Municipality Authority" role
   - Access `/municipality-dashboard`

3. **Think Tank Account**:
   - Sign up with "Think Tank / Policy Agency" role
   - Access `/analytics`

### Test Workflow

1. **As Citizen**:
   - Report an issue at `/post-issue`
   - Upload images
   - Select location on map
   - Submit

2. **As Municipality**:
   - Go to dashboard
   - View issues
   - Respond with proof
   - Mark as resolved

3. **As Think Tank**:
   - View analytics
   - Generate AI report
   - Export CSV

## Troubleshooting

### Google Maps not loading
- Check if API key is set in `.env.local`
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Make sure API key restrictions allow your domain

### Firebase errors
- Verify Firebase config in `app/firebase.js`
- Check Firestore rules (should allow read/write for testing)
- Ensure Storage rules allow uploads

### AI report generation fails
- Verify Gemini API key is set
- Check API quota limits
- Ensure you have internet connection

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## Security Notes

- Never commit `.env.local` to version control
- Restrict Google Maps API key to your domain in production
- Set up proper Firestore security rules for production
- Enable Storage security rules for production

