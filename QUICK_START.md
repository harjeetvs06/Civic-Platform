# Quick Start Guide

##  Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd civic-platform
npm install
```





### Step 2: Firebase Setup

1. Go to https://console.firebase.google.com/
2. Use existing project or create new
3. Enable:
   - **Authentication** → Email/Password
   - **Firestore Database** → Create database
   - **Storage** → Get started

**Note**: The Firebase config in `app/firebase.js` is already set. Update it if using a different project.

### Step 3: Run
```bash
npm run dev
```

Visit: http://localhost:3000

##  Test the Platform

1. **Sign Up** as Citizen → Report an issue
2. **Sign Up** as Municipality → Respond to issues
3. **Sign Up** as Think Tank → View analytics

##  Project Structure

```
civic-platform/
├── app/
│   ├── page.js                    # Home feed
│   ├── post-issue/page.js         # Report issue
│   ├── municipality-dashboard/    # Municipality view
│   ├── analytics/                 # Think tank view
│   ├── login/                     # Auth
│   ├── profile/                   # User profile
│   └── components/Navbar.js       # Navigation
├── README.md                      # Full documentation
├── SETUP_GUIDE.md                 # Detailed setup
└── HACKATHON_PROPOSAL.md          # Proposal document
```

##  Checklist

- [ ] Dependencies installed
- [ ] `.env.local` created with API keys
- [ ] Firebase project configured
- [ ] Development server running
- [ ] Can create account and login
- [ ] Can report an issue
- [ ] Google Maps loads (check browser console if not)

## Common Issues


**Firebase errors?**
- Verify Firebase config in `app/firebase.js`
- Check Firestore/Storage are enabled
- Ensure test mode is on for development

**Build errors?**
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (18+)

## Next Steps

- Read `README.md` for full documentation
- Check `ARCHITECTURE.md` for system design
- Review `PROBLEM_STATEMENT.md` for context
- See `HACKATHON_PROPOSAL.md` for proposal details

---

**Ready to build! **

