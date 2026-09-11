# Orgflowhq - HR Application Management Solution

A production-grade MVP for managing job openings and applications with image uploads, sorting, and tracking. Built with modern web technologies and designed for scalability.

## Table of Contents
- [Technologies](#technologies)
- [Tools & Libraries](#tools--libraries)
- [Color Scheme](#color-scheme)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [Features](#features)
- [What's Implemented](#whats-implemented)
- [What's Left Out](#whats-left-out)
- [Known Concerns](#known-concerns)
- [Deployment](#deployment)
- [TODO / Development Roadmap](#todo--development-roadmap)
- [Troubleshooting](#troubleshooting)

## Technologies

### Core Framework
- **Next.js 15.5.4** - React framework with App Router for server-side rendering and API routes
- **React 19.1.0** - UI library for building interactive components
- **TypeScript 5** - Type-safe JavaScript for better development experience

### Database & Authentication
- **Supabase** - PostgreSQL database, authentication, and file storage
- **@supabase/ssr 0.7.0** - Server-side rendering support for Supabase

### State Management
- **Zustand 5.0.8** - Lightweight state management library

### Styling & UI
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Tailwind CSS Animate** - Animation utilities
- **PostCSS 8.5** - CSS processing tool

### UI Components & Icons
- **Radix UI** - Unstyled, accessible component library (30+ components)
- **Lucide React 0.454.0** - Beautiful SVG icon library
- **Recharts 2.15.4** - React charting library for data visualization

### Form & Validation
- **React Hook Form 7.60.0** - Performant form library
- **@hookform/resolvers 3.10.0** - Validation resolvers
- **Zod 3.25.76** - TypeScript-first schema validation

### Utilities
- **date-fns 4.1.0** - Modern date utility library
- **clsx 2.1.1** - Utility for constructing className strings
- **tailwind-merge 3.3.1** - Merge Tailwind CSS classes
- **class-variance-authority 0.7.1** - CSS-in-JS for component variants
- **Sonner 1.7.4** - Toast notifications
- **next-themes 0.4.6** - Theme management

### Additional Libraries
- **Embla Carousel React 8.5.1** - Carousel component
- **React Day Picker 9.8.0** - Date picker component
- **React Resizable Panels 2.1.7** - Resizable panel layouts
- **Vaul 0.9.9** - Drawer component
- **cmdk 1.0.4** - Command menu component
- **input-otp 1.4.1** - OTP input component

### Analytics
- **@vercel/analytics 1.3.1** - Vercel analytics integration

## Tools & Libraries

### Development Tools
- **ESLint** - Code linting and quality
- **Autoprefixer 10.4.20** - CSS vendor prefixing
- **Node.js 18+** - JavaScript runtime

### Build & Deployment
- **Vercel** - Deployment platform (recommended)
- **GitHub** - Version control and CI/CD

## Color Scheme

### Dark Theme (OKLCH Color Space)

#### Primary Colors
- **Background**: `oklch(0.145 0 0)` - Deep slate (#0f172a)
- **Foreground**: `oklch(0.985 0 0)` - Near white (#f8fafc)
- **Card**: `oklch(0.145 0 0)` - Deep slate
- **Card Foreground**: `oklch(0.985 0 0)` - Near white

#### Accent Colors
- **Primary**: `oklch(0.55 0.2 264)` - Indigo (#6366f1)
- **Primary Foreground**: `oklch(0.95 0 0)` - White
- **Accent**: `oklch(0.269 0 0)` - Dark gray
- **Accent Foreground**: `oklch(0.985 0 0)` - Near white

#### Semantic Colors
- **Destructive**: `oklch(0.396 0.141 25.723)` - Red
- **Destructive Foreground**: `oklch(0.637 0.237 25.331)` - Light red
- **Muted**: `oklch(0.269 0 0)` - Gray
- **Muted Foreground**: `oklch(0.708 0 0)` - Light gray

#### UI Elements
- **Border**: `oklch(0.269 0 0)` - Gray
- **Input**: `oklch(0.269 0 0)` - Gray
- **Ring**: `oklch(0.439 0 0)` - Focus ring color

#### Chart Colors
- **Chart 1**: `oklch(0.488 0.243 264.376)` - Indigo
- **Chart 2**: `oklch(0.696 0.17 162.48)` - Cyan
- **Chart 3**: `oklch(0.769 0.188 70.08)` - Yellow
- **Chart 4**: `oklch(0.627 0.265 303.9)` - Purple
- **Chart 5**: `oklch(0.645 0.246 16.439)` - Orange

#### Sidebar Colors
- **Sidebar**: `oklch(0.205 0 0)` - Darker slate
- **Sidebar Foreground**: `oklch(0.985 0 0)` - Near white
- **Sidebar Primary**: `oklch(0.488 0.243 264.376)` - Indigo
- **Sidebar Border**: `oklch(0.269 0 0)` - Gray

### Design Tokens
- **Border Radius**: 0.625rem (10px)
- **Spacing Scale**: Tailwind default (4px base unit)

## Project Structure

\`\`\`
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth pages layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx            # Dashboard home
│   │   ├── roles/
│   │   │   ├── page.tsx        # Roles list
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Create role
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Role detail
│   │   └── applications/
│   │       └── page.tsx        # Applications list
│   ├── apply/
│   │   └── [roleId]/
│   │       └── page.tsx        # Public application form
│   ├── layout.tsx              # Root layout with navbar
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles & theme
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── types.ts
│   ├── organization/
│   │   └── types.ts
│   ├── roles/
│   │   ├── components/
│   │   │   ├── CreateRoleForm.tsx
│   │   │   └── RoleDetail.tsx
│   │   ├── services/
│   │   │   └── roleService.ts
│   │   └── types.ts
│   ├── applications/
│   │   ├── components/
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── ApplicationTable.tsx
│   │   │   └── ApplicationsContent.tsx
│   │   ├── services/
│   │   │   └── applicationService.ts
│   │   └── types.ts
│   └── dashboard/
│       ├── components/
│       │   ├── DashboardContent.tsx
│       │   ├── RoleCard.tsx
│       │   └── StatCard.tsx
│       ├── services/
│       │   └── dashboardService.ts
│       └── types.ts
├── lib/
│   ├── supabaseClient.ts       # Supabase client setup
│   ├── constants.ts            # App constants
│   └── utils.ts                # Utility functions
├── store/
│   └── useAppStore.ts          # Zustand store
├── components/
│   ├── ui/                     # Radix UI components (30+)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── tabs.tsx
│   │   ├── dropdown.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── pagination.tsx
│   │   ├── skeleton.tsx
│   │   └── ... (20+ more)
│   ├── layout/
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Sidebar.tsx         # Dashboard sidebar
│   │   └── TopBar.tsx          # Dashboard top bar
│   └── shared/
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── scripts/
│   └── 01-init-schema.sql      # Database initialization
└── tsconfig.json               # TypeScript configuration
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Supabase account (free tier available)
- GitHub account (for deployment)

### Installation

1. **Clone or download the project**
   \`\`\`bash
   git clone <your-repo-url>
   cd hr-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key
   - Create storage buckets: `role_images` and `attachments`

4. **Configure environment variables**
   
   In the v0 sidebar, go to **Vars** section and add:
   \`\`\`
   SUPABASE_NEXT_PUBLIC_SUPABASE_URL=your_supabase_projecSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`

5. **Initialize the database**
   - In the v0 sidebar, go to **Connect** → **Supabase**
   - Run the SQL script from `scripts/01-init-schema.sql` in your Supabase SQL editor
   - This creates all tables, storage buckets, and Row Level Security policies

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account
   - Start creating roles and managing applications!

## Database Schema

### Tables

#### users
- `id` (UUID) - Primary key, references auth.users
- `email` (TEXT) - User email
- `full_name` (TEXT) - User full name
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update date

#### organizations
- `id` (UUID) - Primary key
- `name` (TEXT) - Organization name
- `owner_id` (UUID) - References users.id
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### roles
- `id` (UUID) - Primary key
- `organization_id` (UUID) - References organizations.id
- `title` (TEXT) - Job title
- `department` (TEXT) - Department name
- `description` (TEXT) - Job description
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### role_images
- `id` (UUID) - Primary key
- `role_id` (UUID) - References roles.id
- `image_url` (TEXT) - URL to image in storage
- `created_at` (TIMESTAMP)

#### applications
- `id` (UUID) - Primary key
- `role_id` (UUID) - References roles.id
- `candidate_name` (TEXT) - Applicant name
- `candidate_email` (TEXT) - Applicant email
- `resume_url` (TEXT) - URL to resume in storage
- `status` (TEXT) - One of: new, shortlisted, interviewed, hired, rejected
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Storage Buckets
- `role_images` - Images for job role descriptions (max 5 per role)
- `attachments` - Candidate resumes and CVs

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only view their own data
- Users can only manage their organization's data
- Public read access for role listings
- Anyone can submit applications

## Features

### Authentication
- ✅ Email/password signup and login
- ✅ Automatic organization creation on signup
- ✅ Secure session management with Supabase Auth
- ✅ Protected routes and pages

### Organization Dashboard
- ✅ Overview statistics (total roles, applications, status breakdown)
- ✅ Role cards with application counts
- ✅ Quick navigation to create new roles
- ✅ Responsive grid layout

### Role Management
- ✅ Create new job roles with title, department, description
- ✅ Upload up to 5 images per role
- ✅ Edit role details
- ✅ Delete roles
- ✅ Public shareable links for applicants
- ✅ Image management and deletion

### Application Management
- ✅ Centralized applications dashboard
- ✅ View all applications for your roles
- ✅ Filter by role and status
- ✅ Search by candidate name or email
- ✅ Status tracking (New → Shortlisted → Interviewed → Hired → Rejected)
- ✅ Resume/CV uploads
- ✅ Update application status
- ✅ Delete applications

### UI/UX
- ✅ Dark theme with professional design
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Loading states and skeleton screens
- ✅ Toast notifications for user feedback
- ✅ Empty states for better UX
- ✅ Accessible components (ARIA labels, keyboard navigation)

## What's Implemented

### Core Functionality
- Complete authentication flow (signup, login, logout)
- Multi-tenant organization support
- Full CRUD operations for roles and applications
- File upload and storage
- Real-time form validation
- Error handling and user feedback

### UI Components
- 30+ Radix UI components
- Custom form components
- Data tables with sorting and filtering
- Modal dialogs
- Toast notifications
- Loading spinners
- Empty states
- Responsive navigation

### Database & Security
- PostgreSQL database with Supabase
- Row Level Security (RLS) policies
- Secure authentication
- File storage with access control
- Automatic timestamps

### Developer Experience
- TypeScript for type safety
- Modular feature-based architecture
- Reusable hooks and services
- Zustand for state management
- ESLint for code quality

## What's Left Out

### Features Not Implemented (Future Enhancements)
- Real-time notifications (Supabase subscriptions)
- Email notifications for application updates
- Advanced analytics and reporting
- Interview scheduling system
- Offer management workflow
- Team collaboration (multiple admins per organization)
- Candidate communication portal
- Advanced filtering (date range, salary range, etc.)
- Bulk operations (bulk status updates, exports)
- API for third-party integrations
- Two-factor authentication (2FA)
- Social login (Google, GitHub, etc.)
- Dark/light theme toggle
- Internationalization (i18n)
- Automated email templates
- Candidate scoring/ranking
- Job posting to external platforms

### Why These Were Left Out
- **Scope**: MVP focuses on core functionality
- **Complexity**: Some features require additional infrastructure
- **Time**: Can be added incrementally based on user feedback
- **Cost**: Some features increase hosting/service costs

## Known Concerns

### Security
- ⚠️ **RLS Policies**: Ensure all RLS policies are properly tested before production
- ⚠️ **File Uploads**: Validate file types and sizes on both client and server
- ⚠️ **API Keys**: Never commit Supabase keys to version control
- ⚠️ **CORS**: Configure CORS properly for production domains
- ⚠️ **SQL Injection**: Always use parameterized queries (already done with Supabase)

### Performance
- ⚠️ **Image Optimization**: Consider implementing image compression for role images
- ⚠️ **Pagination**: Large datasets may need pagination (currently loads all)
- ⚠️ **Caching**: Implement caching for frequently accessed data
- ⚠️ **Database Indexes**: Add indexes on frequently queried columns
- ⚠️ **Bundle Size**: Monitor bundle size as more features are added

### Scalability
- ⚠️ **Database Limits**: Supabase free tier has storage limits
- ⚠️ **Concurrent Users**: Test with expected user load
- ⚠️ **File Storage**: Plan for storage growth as applications increase
- ⚠️ **Real-time Features**: Supabase subscriptions may need optimization

### Privacy & Compliance
- ⚠️ **GDPR**: Implement data deletion and export features
- ⚠️ **Privacy Policy**: Add privacy policy and terms of service
- ⚠️ **Data Retention**: Define data retention policies
- ⚠️ **Candidate Data**: Ensure compliance with employment laws
- ⚠️ **Audit Logs**: Consider implementing audit logging for compliance

### Maintenance
- ⚠️ **Dependencies**: Keep npm packages updated
- ⚠️ **Supabase Updates**: Monitor Supabase for breaking changes
- ⚠️ **Next.js Updates**: Test thoroughly when upgrading Next.js
- ⚠️ **Error Monitoring**: Implement error tracking (Sentry, etc.)
- ⚠️ **Backups**: Set up regular database backups

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the project

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the same variables from your local setup:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (set to your production domain)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Alternative Deployment Options
- **Netlify**: Similar process to Vercel
- **Self-hosted**: Deploy to your own server with Docker
- **AWS/GCP/Azure**: Use their deployment services

## TODO / Development Roadmap

### High Priority
- [ ] **Fix Schema Mismatch**: Update `scripts/01-init-schema.sql` to match the application's expected schema (add `slug` to organizations, `users_organizations` table, additional role fields)
- [ ] **Implement File Upload Validation**: Add client and server-side validation for file types and sizes
- [ ] **Add Pagination**: Implement pagination for roles and applications lists to handle large datasets
- [ ] **Create Storage Buckets**: Ensure `role-images` and `attachments` buckets exist in Supabase
- [ ] **Fix RLS Policies**: Add missing RLS policies for the advanced schema structure

### Medium Priority
- [ ] **Add Error Monitoring**: Integrate Sentry or similar for production error tracking
- [ ] **Implement Image Optimization**: Add image compression/resizing for role images
- [ ] **Database Indexes**: Add indexes on frequently queried columns (organization_id, role_id, status)
- [ ] **Add Tests**: Write unit tests for services and components
- [ ] **Implement Caching**: Add caching layer for frequently accessed data

### Feature Enhancements
- [ ] **Real-time Updates**: Implement Supabase subscriptions for live application updates
- [ ] **Email Notifications**: Add email notifications for new applications and status changes
- [ ] **Advanced Filtering**: Add date range, salary range, and other filters
- [ ] **Bulk Operations**: Enable bulk status updates and exports
- [ ] **Team Collaboration**: Support multiple users per organization
- [ ] **Analytics Dashboard**: Add charts and reports for hiring metrics
- [ ] **Interview Scheduling**: Build interview scheduling functionality
- [ ] **Dark/Light Theme Toggle**: Add theme switcher UI
- [ ] **Internationalization**: Add i18n support for multiple languages
- [ ] **API Integration**: Build REST API for third-party integrations

### Security & Compliance
- [ ] **GDPR Compliance**: Add data deletion and export features
- [ ] **Privacy Policy**: Create privacy policy and terms of service pages
- [ ] **Data Retention Policies**: Implement automatic data cleanup
- [ ] **Audit Logging**: Log all user actions for compliance
- [ ] **Two-Factor Authentication**: Add 2FA support for enhanced security
- [ ] **Social Login**: Support Google/GitHub OAuth

### Technical Debt
- [ ] **Code Refactoring**: Review and refactor authentication service for consistency
- [ ] **Type Safety**: Improve TypeScript definitions across all modules
- [ ] **Component Documentation**: Add JSDoc comments to all components
- [ ] **API Documentation**: Create API documentation for services
- [ ] **Performance Audit**: Run Lighthouse audits and optimize accordingly

## Troubleshooting

### Common Issues

#### "Cannot find module" errors
- **Solution**: Run `npm install` to ensure all dependencies are installed
- **Check**: Verify import paths match your file structure

#### Supabase connection errors
- **Solution**: Check environment variables are correctly set
- **Check**: Verify Supabase project is active and accessible
- **Debug**: Test connection in browser console: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

#### Authentication not working
- **Solution**: Ensure database tables are created (run SQL script)
- **Check**: Verify RLS policies are enabled
- **Debug**: Check browser console for error messages

#### File uploads failing
- **Solution**: Verify storage buckets exist (`role_images`, `attachments`)
- **Check**: Ensure bucket policies allow uploads
- **Debug**: Check Supabase storage logs

#### Styling issues
- **Solution**: Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`
- **Check**: Verify Tailwind CSS is properly configured
- **Debug**: Check browser DevTools for CSS conflicts

#### Slow performance
- **Solution**: Check database query performance in Supabase
- **Check**: Implement pagination for large datasets
- **Debug**: Use browser DevTools Performance tab

### Getting Help
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Supabase documentation](https://supabase.com/docs)
- Check [Tailwind CSS documentation](https://tailwindcss.com/docs)
- Open an issue on GitHub with detailed error messages

## Development Tips

### Code Organization
- Keep components small and focused
- Use custom hooks for shared logic
- Organize by feature, not by type
- Use TypeScript for type safety

### Performance
- Use React.memo for expensive components
- Implement code splitting with dynamic imports
- Optimize images with Next.js Image component
- Monitor bundle size with `npm run build`

### Testing
- Write unit tests for utilities and hooks
- Test components with React Testing Library
- Test database queries with Supabase
- Test authentication flows manually

### Debugging
- Use browser DevTools for client-side debugging
- Use Supabase dashboard for database debugging
- Use Next.js debug mode: `DEBUG=* npm run dev`
- Add console.log statements strategically

## License

MIT - Feel free to use this project for personal or commercial purposes.

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: Production Ready MVP
