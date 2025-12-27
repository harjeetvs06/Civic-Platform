# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│                    (Next.js + React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Citizen    │  │ Municipality │  │  Think Tank  │     │
│  │   Interface  │  │   Dashboard  │  │   Analytics   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Layer                      │
│                    (Firebase Auth)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Role-Based Access Control (RBAC)                    │  │
│  │  - Citizen (default)                                 │  │
│  │  - Municipality                                       │  │
│  │  - Think Tank                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│                      (Firebase)                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firestore   │  │   Storage     │  │   Auth       │     │
│  │  (Database)  │  │  (Media Files)│  │  (Users)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Google Maps  │  │ Google Gemini│                        │
│  │     API      │  │     API      │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Issue Reporting Flow
```
Citizen → Post Issue Page → Google Maps (Location) → Firebase Storage (Images)
    → Firestore (Issue Document) → Home Feed (Real-time Update)
```

### Municipality Response Flow
```
Municipality Dashboard → View Issues → Submit Response → Upload Proof
    → Firestore Update → Home Feed (Show Response)
```

### Analytics Flow
```
Think Tank Dashboard → Firestore Query → Calculate Metrics
    → Google Gemini API (AI Analysis) → Generate Report → Download
```

## Database Schema

### Collections

#### `issues`
- **Document ID**: Auto-generated
- **Fields**:
  - `title` (string)
  - `description` (string)
  - `category` (string)
  - `location` (string)
  - `geoLocation` (GeoPoint)
  - `mediaURLs` (array of strings)
  - `taggedAuthority` (string)
  - `userId` (string)
  - `userEmail` (string)
  - `upvotes` (number)
  - `upvotedBy` (array of strings)
  - `status` (string)
  - `response` (object, optional)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

#### `users`
- **Document ID**: User UID
- **Fields**:
  - `email` (string)
  - `role` (string)
  - `name` (string)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Issues: public read, authenticated write
    match /issues/{issueId} {
      allow read: if true; // Public read
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'municipality');
    }
  }
}
```

## Component Architecture

```
app/
├── components/
│   └── Navbar.js          # Shared navigation
├── page.js                # Home feed (public)
├── post-issue/
│   └── page.js            # Issue creation
├── municipality-dashboard/
│   └── page.js            # Municipality interface
├── analytics/
│   └── page.js            # Think tank interface
├── profile/
│   └── page.js            # User profile
└── login/
    └── page.js            # Authentication
```

## API Integration Points

1. **Firebase Auth**: User authentication and role management
2. **Firestore**: Real-time database for issues and users
3. **Firebase Storage**: Image and document storage
4. **Google Maps API**: Location selection and geocoding
5. **Google Gemini API**: AI-powered report generation

## Scalability Considerations

- **Firestore**: Automatically scales with usage
- **Storage**: CDN-backed, handles large files efficiently
- **Next.js**: Server-side rendering for SEO and performance
- **Real-time Updates**: Firestore listeners for live feed updates

## Future Enhancements

- Cloud Functions for scheduled AI analysis
- Push notifications for issue updates
- Email notifications
- SMS alerts for critical issues
- Multi-language support
- Mobile app (React Native)

