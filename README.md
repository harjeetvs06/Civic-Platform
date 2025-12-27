# CivicGrievance Platform

A public, AI-powered civic issue platform that turns citizen complaints into accountable action and policy intelligence.

## 🎯 Overview

CivicGrievance is a CPGRAMS-inspired public issue reporting platform where:
- **Citizens** report local infrastructure and civic issues
- **Municipalities** respond transparently with proof
- **Think Tanks** extract policy intelligence from aggregated data

Think of it as: **Twitter + Google Maps + RTI-style accountability + AI reporting**

## ✨ Features

### For Citizens
- 📝 Report issues with location, images, and category
- 👍 Upvote issues to prioritize them
- 📊 Track issue status and responses
- 🔍 Filter and search issues by location, category, status

### For Municipal Authorities
- 🏛️ Dedicated dashboard to view tagged issues
- ✅ Respond with structured resolutions
- 📸 Upload proof (before/after photos, documents)
- 📈 Track response metrics

### For Think Tanks / Policy Agencies
- 📊 Analytics dashboard with insights
- 🤖 AI-powered report generation (Google Gemini)
- 📥 Export data as CSV
- 🔍 Analyze trends and recurring issues

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: Google Maps API
- **AI**: Google Gemini API
- **Deployment**: Vercel (recommended)

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Google Maps API key
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd civic-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - The Firebase config is already set in `app/firebase.js`
   - Update it with your Firebase project credentials if needed
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Storage

4. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
civic-platform/
├── app/
│   ├── components/
│   │   └── Navbar.js          # Navigation component
│   ├── analytics/
│   │   └── page.js            # Think tank analytics dashboard
│   ├── municipality-dashboard/
│   │   └── page.js            # Municipality response dashboard
│   ├── post-issue/
│   │   └── page.js            # Issue reporting page
│   ├── profile/
│   │   └── page.js            # User profile page
│   ├── login/
│   │   └── page.js            # Login/Signup page
│   ├── firebase.js            # Firebase configuration
│   ├── auth.js                # Authentication helpers
│   ├── layout.js              # Root layout
│   ├── page.js                # Home feed
│   └── globals.css            # Global styles
├── package.json
└── README.md
```

## 🔐 User Roles

1. **Citizen** (default)
   - Can report issues
   - Can upvote issues
   - Can view all issues

2. **Municipality**
   - All citizen features
   - Access to municipality dashboard
   - Can respond to issues
   - Can upload proof of resolution

3. **Think Tank**
   - Read-only access
   - Access to analytics dashboard
   - Can generate AI reports
   - Can export data

## 📊 Firestore Collections

### `issues`
```javascript
{
  issueId: string,
  userId: string,
  userEmail: string,
  title: string,
  description: string,
  category: string, // roads, water, waste, electricity, sanitation, other
  location: string,
  geoLocation: { lat: number, lng: number },
  mediaURLs: string[],
  taggedAuthority: string,
  upvotes: number,
  upvotedBy: string[],
  status: string, // open, in_progress, resolved, unresolved
  response: {
    type: string,
    text: string,
    proofURLs: string[],
    respondedBy: string,
    respondedAt: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `users`
```javascript
{
  email: string,
  role: string, // citizen, municipality, thinktank
  name: string,
  createdAt: string,
  updatedAt: string
}
```

## 🗺️ Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials (API Key)
5. Add the API key to `.env.local`

## 🤖 Google Gemini Setup (Optional)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to `.env.local` as `NEXT_PUBLIC_GEMINI_API_KEY`

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 🎨 Customization

- Update colors in `globals.css`
- Modify issue categories in `app/post-issue/page.js`
- Adjust analytics metrics in `app/analytics/page.js`

## 📝 License

This project is open source and available for hackathon use.

## 🤝 Contributing

This is a hackathon project. Feel free to fork and enhance!

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for transparent and accountable governance**

