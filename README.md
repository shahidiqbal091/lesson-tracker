# Quran LMS - Online Quran Classes Management System

A comprehensive Learning Management System designed specifically for online Quran classes. This full-stack application provides role-based dashboards for administrators, teachers, students, and parents with complete management of classes, attendance, fees, homework, and progress tracking.

## Features

### Multi-Role System
- **Admin Dashboard**: Complete system oversight with analytics, user management, and reporting
- **Teacher Dashboard**: Class management, student tracking, homework assignment, and attendance marking
- **Student Dashboard**: View classes, submit homework, track progress, and access recorded lessons
- **Parent Dashboard**: Monitor children's progress, attendance, and fee payments

### Core Functionality

#### Class Management
- Schedule classes with Zoom/Google Meet integration
- Support for multiple learning levels: Qaida, Nazra, Hifz, and Tajweed
- Class enrollment and capacity management
- Recorded lesson uploads and access

#### Student Management
- Complete student profiles with learning level tracking
- Parent-student relationship management
- Student enrollment in multiple classes
- Progress tracking across multiple metrics

#### Attendance System
- Easy attendance marking by teachers
- Real-time attendance statistics
- Attendance rate calculations
- Historical attendance records

#### Fee Management
- Flexible fee structures (monthly, weekly, per-class)
- Payment tracking and history
- Automatic fee reminders
- Payment status monitoring (pending, paid, overdue)

#### Homework Module
- Teachers can create and assign homework
- Students submit homework online
- Teachers grade submissions with feedback
- Track pending and completed homework

#### Progress Reports
- Comprehensive progress tracking
- Quran memorization percentage
- Tajweed score tracking
- Teacher comments and feedback
- Performance analytics with charts

#### WhatsApp Notifications
- Automated notifications via edge function
- Fee reminders
- Class reminders
- Homework notifications
- Progress report alerts

## Technology Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email/password
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Custom CSS with Islamic design theme
- **Edge Functions**: Supabase Edge Functions (Deno)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account and project set up

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Database Schema

The system uses the following main tables:

- **profiles**: User information for all roles
- **teachers**: Teacher-specific data
- **students**: Student information and levels
- **parent_student_relation**: Links parents to their children
- **courses**: Course templates (Qaida, Nazra, Hifz, Tajweed)
- **classes**: Scheduled classes
- **enrollments**: Student class enrollments
- **attendance**: Attendance records
- **fee_records**: Fee structure per student
- **payments**: Payment transactions
- **homework**: Homework assignments
- **homework_submissions**: Student homework submissions
- **progress_reports**: Student progress tracking
- **recorded_lessons**: Video recordings of classes
- **notifications**: System notifications

All tables have Row Level Security (RLS) enabled with role-based policies.

## User Roles & Permissions

### Admin
- Full access to all features
- User management (teachers, students)
- Class creation and management
- Fee management and payment tracking
- System-wide analytics and reports

### Teacher
- View and manage assigned classes
- Mark attendance
- Create and grade homework
- Submit progress reports
- View enrolled students

### Student
- View enrolled classes
- Join live classes via meeting links
- Submit homework
- View progress reports
- Access recorded lessons

### Parent
- View children's information
- Monitor attendance and progress
- View and pay fees
- Receive notifications

## Islamic UI Design

The application features a carefully designed Islamic theme with:
- Green color scheme (primary, secondary tones)
- Amiri font for Arabic text
- Clean, professional layout
- Subtle Islamic geometric patterns
- Respectful and culturally appropriate design

## API Integration

### WhatsApp Notifications
The system includes a Supabase Edge Function for WhatsApp notifications:
- Endpoint: `https://your-project.supabase.co/functions/v1/whatsapp-notifications`
- Ready for integration with WhatsApp Business API or Twilio

### Meeting Integration
- Direct integration with Zoom and Google Meet
- Meeting links stored per class
- One-click join functionality

## Security Features

- Row Level Security (RLS) on all database tables
- Role-based access control
- Secure authentication with Supabase
- Protected routes on frontend
- Input validation and sanitization

## Development

### Project Structure
```
src/
├── components/          # Reusable components
│   ├── Layout.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── lib/               # Utilities and configs
│   └── supabase.js
├── pages/             # Page components
│   ├── admin/
│   ├── teacher/
│   ├── student/
│   └── parent/
├── styles/            # Global styles
│   └── global.css
├── App.jsx            # Main app component
└── main.jsx          # Entry point
```

## Future Enhancements

- Video call integration directly in the platform
- Mobile application (React Native)
- Certificate generation for completed courses
- Advanced analytics with AI insights
- Multi-language support
- SMS notifications
- Payment gateway integration
- Live streaming capabilities
- Interactive whiteboard for lessons
- Gamification features

## Support

For questions or support, please contact your system administrator.

---

Built with care for the Muslim community.
