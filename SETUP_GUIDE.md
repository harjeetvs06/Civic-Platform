# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd civic-platform
npm install
```



### 2. Firebase Setup

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





### 3. Run Development Server

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



### Firebase errors
- Verify Firebase config in `app/firebase.js`
- Check Firestore rules (should allow read/write for testing)
- Ensure Storage rules allow uploads



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

