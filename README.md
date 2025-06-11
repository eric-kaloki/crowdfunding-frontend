# Transcends Corp - Crowdfunding Platform Frontend

###Visit online at [Trancends Corp](https://www.trancends-corp.tech)

## Overview

Transcends Corp is a comprehensive crowdfunding platform built with React and TypeScript that enables individuals and organizations to create, manage, and support fundraising campaigns. The platform provides a modern, responsive interface for campaign management, user authentication, and secure payment processing through M-Pesa integration.

## 🚀 Key Features

### Authentication & User Management
- **Multi-Role Authentication**: Support for individual users, organizations, and administrators
- **Google OAuth Integration**: One-click sign-up and login with Google accounts
- **Email/Password Authentication**: Traditional registration with email verification
- **OTP Verification**: 6-digit email verification for account security
- **Password Recovery**: Secure password reset via email links
- **Profile Management**: Comprehensive user profiles with image upload capabilities

*[Screenshot Space: Login page with Google OAuth button]*

*[Screenshot Space: Registration form with organization/individual selection]*

### Campaign Management
- **Campaign Creation**: Rich campaign creation interface with image upload
- **Category-based Organization**: Campaigns organized by categories (Education, Healthcare, Technology, etc.)
- **Real-time Progress Tracking**: Live funding progress with visual progress bars
- **Campaign Discovery**: Public feed with filtering and search capabilities
- **Campaign Details**: Detailed campaign pages with funding metrics and updates

*[Screenshot Space: Campaign creation form]*

*[Screenshot Space: Campaign dashboard with progress tracking]*

### Payment Integration
- **M-Pesa Integration**: Seamless mobile money payments for Kenyan users
- **Secure Payment Processing**: PCI-compliant payment handling
- **Real-time Payment Updates**: Live payment status tracking
- **Contribution Management**: Detailed contribution history and receipts

*[Screenshot Space: Payment interface with M-Pesa option]*

### User Roles & Dashboards

#### Individual Users (Regular Users)
- **Personal Dashboard**: Campaign discovery feed with social media-like interface
- **Campaign Creation**: Ability to create personal fundraising campaigns
- **Contribution Tracking**: History of supported campaigns
- **Profile Management**: Personal profile with bio, location, and profile picture

*[Screenshot Space: Individual user dashboard]*

#### Organizations
- **Organization Registration**: Multi-step verification process with document upload
- **Organization Dashboard**: Dual-view dashboard (discovery feed + organization campaigns)
- **Certificate Management**: Upload and manage registration certificates
- **Enhanced Campaign Features**: Organization-branded campaigns with verification badges

*[Screenshot Space: Organization dashboard with approval status]*

#### Administrators
- **Comprehensive Admin Dashboard**: Platform-wide statistics and management tools
- **User Management**: Manage all platform users and their permissions
- **Organization Approval**: Review and approve organization registrations
- **Campaign Oversight**: Review, approve, and manage all campaigns
- **Analytics Dashboard**: Detailed platform analytics and reporting
- **Payment Management**: Monitor and manage all platform transactions

*[Screenshot Space: Admin dashboard with statistics]*

### Advanced Features

#### Real-time Updates
- **WebSocket Integration**: Live updates for campaign progress and comments
- **Real-time Notifications**: Instant updates for campaign activities
- **Live Comment System**: Real-time commenting on campaigns

#### Social Features
- **Campaign Sharing**: Social media integration for campaign promotion
- **Comment System**: Interactive commenting on campaigns
- **User Interactions**: Like and support campaign features
- **Activity Feeds**: Social media-style activity tracking

*[Screenshot Space: Campaign with comments and social features]*

#### Campaign Features
- **Rich Media Support**: Image and video upload for campaigns
- **Progress Visualization**: Interactive progress bars and funding metrics
- **Time-based Campaigns**: Deadline management with countdown timers
- **Campaign Updates**: Creator updates and milestone tracking
- **Funding Goals**: Flexible funding goals with progress tracking

## 🛠 Technical Stack

### Frontend Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom component library
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React Context API for authentication and global state
- **Routing**: React Router v6 with protected routes
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors for API communication

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-*": "Latest",
  "react-router-dom": "^6.15.0",
  "react-hook-form": "^7.45.0",
  "zod": "^3.22.0",
  "axios": "^1.5.0"
}
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── layout/          # Layout components (header, sidebar)
│   ├── GoogleAuthButton.tsx
│   ├── ProfileHeader.tsx
│   ├── ProtectedRoute.tsx
│   └── TopAppBar.tsx
├── pages/               # Page components
│   ├── admin/           # Admin-specific pages
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── AdminOrganizations.tsx
│   │   ├── PendingCampaigns.tsx
│   │   └── AdminAnalytics.tsx
│   ├── Index.tsx        # Landing page
│   ├── Login.tsx        # Authentication pages
│   ├── Signup.tsx
│   ├── ClientDashboard.tsx
│   ├── OrganizationDashboard.tsx
│   ├── CreateCampaign.tsx
│   ├── CampaignDetails.tsx
│   └── Profile.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── utils/              # Utility functions
│   ├── axiosConfig.ts   # API configuration
│   └── shared.ts        # Shared utilities
├── hooks/              # Custom React hooks
│   └── useWebSocket.ts  # WebSocket integration
└── lib/                # External library configurations
    └── utils.ts         # Utility functions
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser with ES6+ support

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/eric-kaloki/crowdfunding-frontend.git
cd crowdfunding-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=https://crowdfunding-backend-r9z5.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
NODE_ENV=development
```

4. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `https://www.transcends-corp.tech/`

### Backend is available at 
`https://github.com/eric-kaloki/crowdfunding-backend.git`

### Build for Production
```bash
npm run build
yarn build
```

## 🎨 UI/UX Features

### Design System
- **Consistent Color Palette**: Professional green and blue theme
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Dark Mode Ready**: Theme system prepared for dark mode implementation

### User Experience
- **Intuitive Navigation**: Clear navigation patterns with breadcrumbs
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and fallbacks
- **Form Validation**: Real-time validation with helpful error messages

*[Screenshot Space: Responsive design on mobile and desktop]*

## 🔐 Security Features

### Authentication Security
- **JWT Token Management**: Secure token storage and automatic refresh
- **Protected Routes**: Role-based access control for all sensitive pages
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Cross-site request forgery prevention

### Data Security
- **Input Validation**: Client-side and server-side validation
- **Secure Communication**: HTTPS enforcement for all API calls
- **File Upload Security**: Secure file upload with type validation

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Mobile Devices**: 320px - 768px
- **Tablets**: 768px - 1024px
- **Desktop**: 1024px+

*[Screenshot Space: Mobile view of campaign feed]*

*[Screenshot Space: Tablet view of admin dashboard]*

## 🧪 Testing

### Testing Strategy
- **Component Testing**: Unit tests for individual components
- **Integration Testing**: API integration tests
- **E2E Testing**: End-to-end user journey tests
- **Accessibility Testing**: Screen reader and keyboard navigation tests

## 🚀 Deployment

### Deployment Options
- **Vercel**: Recommended for easy deployment with automatic previews
- **Netlify**: Alternative with form handling capabilities
- **AWS S3 + CloudFront**: Enterprise-grade hosting solution
- **Docker**: Containerized deployment option

### Environment Variables for Production
```env
VITE_API_URL=https://api.transcends-corp.com
VITE_GOOGLE_CLIENT_ID=production_google_client_id
NODE_ENV=production
```

## 🔄 API Integration

### API Communication
- **RESTful APIs**: Standard REST endpoints for all operations
- **WebSocket**: Real-time updates for campaigns and notifications
- **File Uploads**: Multipart form data for image and document uploads
- **Error Handling**: Comprehensive error handling with user feedback

### API Endpoints Used
```typescript
// Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/google-auth

// Campaigns
GET /api/campaigns/public
POST /api/campaigns
GET /api/campaigns/:id
POST /api/campaigns/:id/contribute

// User Management
GET /api/auth/profile/me
PATCH /api/auth/profile/me
POST /api/profile/upload-picture

// Admin Operations
GET /api/admin/stats
GET /api/admin/campaigns
PATCH /api/admin/campaigns/:id/status
```

## 🎯 Future Enhancements

### Planned Features
- **Multi-language Support**: Internationalization for multiple languages
- **Advanced Analytics**: Detailed campaign performance analytics
- **Social Media Integration**: Enhanced sharing and promotion features
- **Mobile App**: React Native mobile application
- **Advanced Payment Options**: Additional payment gateways
- **Campaign Templates**: Pre-built campaign templates for common causes

### Technical Improvements
- **Performance Optimization**: Code splitting and lazy loading
- **PWA Features**: Progressive web app capabilities
- **Advanced Caching**: Service worker implementation
- **Real-time Collaboration**: Live collaborative campaign editing

## 🐛 Troubleshooting

### Common Issues

#### Authentication Problems
```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()

# Check token expiration
console.log(localStorage.getItem('token'))
```

#### API Connection Issues
```bash
# Verify backend is running
curl https://crowdfunding-backend-r9z5.onrender.com/api/health

# Check CORS configuration
# Ensure frontend URL is in backend CORS whitelist
```

#### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npx vite --force
```

## 📞 Support & Contact

- **Documentation**: [GitHub Wiki](https://github.com/your-org/transcends-frontend/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/transcends-frontend/issues)
- **Email**: [To Reach Us](transcends.corp@gmail.com)
- **Response Time**: 24-48 hours for support requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Last updated: January 2024*
*Version: 1.0.0*
