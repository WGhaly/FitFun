# FitFun - Weight Loss Competition Platform

A web-based, mobile-first platform that allows individuals to create and participate in weight-loss competitions, track progress over time, and determine winners based on predefined measurable criteria.

## 🚀 Features

### User Portal (Mobile-First)
- **Authentication**: Email + password registration and login
- **Homepage**: View active competitions, notifications, and success stories
- **Competition Management**: Create, join, and participate in weight loss competitions
- **Progress Tracking**: Submit and track measurements throughout competitions
- **Analytics**: View personal progress and competition leaderboards
- **Profile Management**: Manage personal information and measurements

### Admin Portal (Desktop-First)
- **User Management**: View and manage all users
- **Competition Management**: Oversee and manage all competitions
- **Testimonial Moderation**: Approve/hide user testimonials
- **Admin Management**: Create and manage admin accounts (Super Admin only)
- **Platform Insights**: View aggregated statistics and analytics

## 📋 Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Custom CSS with design system
- **Data Storage**: LocalStorage (for MVP/demo)
- **Architecture**: Component-based with modular JavaScript

## 🎨 Design Principles

- **Mobile-First**: User portal optimized for mobile devices
- **Desktop-First**: Admin portal optimized for desktop screens
- **Modern Aesthetics**: Vibrant colors, smooth animations, glassmorphism effects
- **Responsive**: Works seamlessly across all device sizes
- **Accessible**: Semantic HTML and keyboard navigation support

## 🏗️ Project Structure

```
FitFun/
├── index.html                 # Main entry point
├── admin.html                 # Admin portal entry (to be created)
├── server.py                  # Development server
├── styles/
│   ├── design-system.css      # Design tokens and variables
│   ├── layout.css             # Layout utilities and grid system
│   └── components.css         # Reusable component styles
├── js/
│   ├── state.js               # State management with localStorage
│   ├── utils.js               # Utility functions
│   ├── auth.js                # Authentication logic
│   ├── competition.js         # Competition management
│   ├── measurements.js        # Measurement tracking
│   └── ui.js                  # UI components and helpers
├── pages/
│   ├── auth/
│   │   ├── login.html         # User login page
│   │   └── register.html      # User registration page
│   ├── user/
│   │   ├── home.html          # User homepage
│   │   ├── dashboard.html     # User dashboard
│   │   ├── profile.html       # User profile (to be created)
│   │   ├── analytics.html     # User analytics (to be created)
│   │   ├── competition-create.html  # Create competition
│   │   └── competition-detail.html  # Competition details (to be created)
│   └── admin/
│       └── (admin pages to be created)
├── components/                # Reusable HTML components (to be created)
└── assets/
    └── images/                # Image assets
```

## 🚦 Getting Started

### Prerequisites
- Python 3.x (for development server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Application

1. **Start the development server**:
   ```bash
   python3 server.py
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

3. **Login with demo credentials**:
   - **User**: john@example.com / Password123!
   - **Admin**: admin@fitfun.com / Admin123!

### Alternative: Direct File Access
You can also open `index.html` directly in your browser, but using the development server is recommended for the best experience.

## 👤 Demo Accounts

### User Account
- **Email**: john@example.com
- **Password**: Password123!
- **Role**: Regular user with sample data

### Admin Account
- **Email**: admin@fitfun.com
- **Password**: Admin123!
- **Role**: Super Admin with full access

## 📱 Key User Flows

### Creating a Competition
1. Login to your account
2. Click "Create Competition" from homepage or dashboard
3. Fill in competition details (name, dates, measurement method, etc.)
4. Submit to create (you're automatically added as a participant)

### Joining a Competition
1. Browse active competitions on the homepage
2. Click "Join" on a competition card
3. If approval required, wait for creator approval
4. Once joined, submit measurements during the competition

### Tracking Progress
1. Go to Dashboard to see all your competitions
2. Click on a competition to view details and leaderboard
3. Submit measurements according to the frequency
4. View your progress in the Analytics section

## 🔐 Security Notes

**Important**: This is a demo/MVP implementation using client-side storage:
- Passwords are stored in plain text in localStorage
- No server-side validation
- No encryption
- **NOT suitable for production use**

For production deployment, you would need:
- Backend API with proper authentication
- Database for data persistence
- Password hashing (bcrypt, etc.)
- HTTPS/SSL encryption
- Input sanitization and validation
- Rate limiting and security headers

## 📊 Competition Features

### Measurement Methods
- **Percentage Weight Loss**: Fairest for mixed groups
- **Absolute Weight Loss (KG)**: Simple kg-based tracking
- **BMI-based**: Requires BMI data in profile
- **Body Fat Percentage**: Requires body fat tracking

### Competition Lifecycle
1. **Upcoming**: Before start date
2. **Active**: Competition in progress
3. **Grace Period**: 24 hours after end for final measurements
4. **Completed**: Winners calculated and announced

### Measurement Frequency
- **Default**: Weekly (every 7 days)
- **Short competitions** (< 30 days): Duration ÷ 4 checkpoints

## 🎯 PRD Compliance

This implementation strictly follows the Product Requirements Document:
- ✅ No payments or financial transactions
- ✅ No external integrations
- ✅ No email notifications (in-app only)
- ✅ Email cannot be changed after registration
- ✅ Account deletion with cascade logic
- ✅ Metric system only
- ✅ 24-hour grace period for measurements
- ✅ Automatic winner calculation
- ✅ Role-based access control

## 🛠️ Development Status

### Completed
- ✅ Project structure and build setup
- ✅ Design system and component library
- ✅ State management with localStorage
- ✅ Authentication system (login/register)
- ✅ User homepage with notifications and competitions
- ✅ Competition creation form
- ✅ User dashboard with statistics
- ✅ Core business logic (competitions, measurements)

### In Progress
- 🔄 Competition detail page
- 🔄 User profile management
- 🔄 User analytics page
- 🔄 Admin portal

### Planned
- ⏳ Measurement submission interface
- ⏳ Leaderboard component
- ⏳ Testimonial submission
- ⏳ Competition history
- ⏳ Admin user management
- ⏳ Admin insights dashboard

## 📝 Notes

- All dates and times use ISO 8601 format
- All weights are in kilograms (KG)
- All heights are in centimeters (CM)
- BMI is calculated automatically when weight and height are provided
- Competition statuses update automatically based on dates

## 🤝 Contributing

This is a demo project built according to specific PRD requirements. For modifications:
1. Ensure changes align with the PRD
2. Maintain mobile-first design for user portal
3. Maintain desktop-first design for admin portal
4. Follow existing code patterns and conventions

## 📄 License

This is a demonstration project for educational purposes.

## 🆘 Support

For issues or questions:
1. Check the PRD documentation
2. Review the implementation plan
3. Inspect browser console for errors
4. Clear localStorage if experiencing data issues: `localStorage.clear()`

---

**Built with ❤️ following strict PRD requirements**
