# Team Management System

A comprehensive team management platform designed to streamline organizational performance tracking, communication, and workforce analytics.

## Table of Contents

1. [System Overview](#system-overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Key Features](#key-features)
4. [System Workflow](#system-workflow)
5. [Installation](#installation)
6. [Running the Application](#running-the-application)
7. [Technical Architecture](#technical-architecture)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Frontend Components](#frontend-components)

## System Overview

This application provides a hierarchical team management system where users with higher roles can create, manage, and monitor users below them in the hierarchy. It includes comprehensive tracking for attendance, client acquisitions, report submissions, and performance metrics, all visualized through charts and dashboards specific to each user's role.

## Role Hierarchy

The system implements a strict hierarchical structure with the following roles:

1. **Admin** - System administrators with unrestricted access.
2. **Manager** - Oversee Sales Staff and all operations.
3. **Sales Staff** - Manage Team Leaders and Individual Agents.
4. **Team Leader** - Lead groups of Sales Agents.
5. **Individual Agent** - Report directly to Sales Staff.
6. **Sales Agent** - Entry-level agents who report to Team Leaders.

Each role has specific permissions and can only interact with users below them in the hierarchy. For example:

- Admins can manage all users
- Managers can manage Sales Staff and below
- Sales Staff can manage Team Leaders, Individual Agents, and indirectly, Sales Agents
- Team Leaders can only manage Sales Agents

## Key Features

- **User Management**: Role-based user creation and management
- **Attendance Tracking**: Record, view, and excuse attendance with location data
- **Client Management**: Add and track clients with validation based on attendance
- **Reporting System**: Hierarchical report submission with approval/rejection
- **Performance Analytics**: Role-specific performance metrics and visualizations
- **Notification System**: Automated and manual notifications for important events
- **Activity Logging**: Comprehensive logging of user activities

## System Workflow

### User Creation and Management
1. Higher-level roles (Admin, Manager, Sales Staff) create users below them in hierarchy
2. Users can log in with work ID and email (passwords optional)
3. Login help system allows users to request assistance

### Attendance Process
1. Users mark attendance daily with location and sector information
2. Late attendance can be excused by Sales Staff
3. Attendance status affects ability to add clients

### Client Acquisition
1. Agents can add clients only if they've attended or been excused for the day
2. Client details are stored with reference to who added them
3. Client acquisition metrics contribute to performance evaluation

### Reporting Workflow
1. Reports follow a strict hierarchical path:
   - Sales Agents → Team Leader → Sales Staff → Manager
   - Individual Agents → Sales Staff → Manager
2. Reports include period type (weekly, monthly, quarterly)
3. Recipients can approve or reject reports with comments

### Performance Monitoring
1. System automatically calculates performance metrics based on:
   - Attendance rates
   - Client acquisitions
   - Report submissions
   - Other key indicators
2. Performance data is visualized through charts
3. Higher roles can view performance of users below them

## Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- PostgreSQL

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/team-management-system.git
cd team-management-system

# Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Configure environment variables
# Create a .env file with the following variables:
# DATABASE_URL=postgres://username:password@localhost:5432/team_management
# SECRET_KEY=your_secret_key
# DEBUG=True

# Run migrations
python manage.py migrate

# Create a superuser (Admin)
python manage.py createsuperuser
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install frontend dependencies
npm install
```

## Running the Application

### Start the Backend Server
```bash
# From the backend directory
python manage.py runserver 0.0.0.0:5000
```

### Start the Frontend Development Server
```bash
# From the frontend directory
PORT=5001 HOST=0.0.0.0 npm start
```

The application will be accessible at:
- Backend API: http://localhost:5000/
- Frontend: http://localhost:5001/

## Technical Architecture

### Technology Stack
- **Backend**: Django with Django REST Framework
- **Frontend**: React with Redux for state management
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React-Chartjs-2
- **Background Tasks**: Django-background-tasks

### Architecture Overview
The application follows a client-server architecture:

1. **Django Backend**:
   - RESTful API endpoints
   - Business logic implementation
   - Authentication and authorization
   - Background task scheduling
   - Database interactions

2. **React Frontend**:
   - Component-based UI
   - Role-specific dashboards
   - State management with Redux
   - API integration
   - Data visualization

## Database Schema

### Core Models
1. **User**
   - `id`: AutoField (Primary Key)
   - `work_id`: CharField (Unique)
   - `email`: EmailField (Unique)
   - `role`: CharField with choices
   - `password`: CharField (Nullable)
   - `is_active`: BooleanField
   - `is_staff`: BooleanField
   - `is_superuser`: BooleanField
   - `created_by`: ForeignKey to User
   - `group`: ForeignKey to Group

2. **Group**
   - `id`: AutoField (Primary Key)
   - `name`: CharField
   - `team_leader`: ForeignKey to User
   - `sales_staff`: ForeignKey to User
   - `created_at`: DateTimeField

3. **Client**
   - `id`: AutoField (Primary Key)
   - `name`: CharField
   - `details`: TextField
   - `added_by`: ForeignKey to User
   - `timestamp`: DateTimeField

4. **Attendance**
   - `id`: AutoField (Primary Key)
   - `user`: ForeignKey to User
   - `date`: DateField
   - `time`: TimeField
   - `status`: CharField with choices
   - `sector`: CharField
   - `location`: CharField

5. **Report**
   - `id`: AutoField (Primary Key)
   - `submitted_by`: ForeignKey to User
   - `submitted_to`: ForeignKey to User
   - `period`: CharField with choices
   - `period_start_date`: DateField
   - `period_end_date`: DateField
   - `content`: TextField
   - `comment`: TextField
   - `status`: CharField with choices

6. **Performance**
   - `id`: AutoField (Primary Key)
   - `user`: ForeignKey to User
   - `period`: CharField with choices
   - `period_start_date`: DateField
   - `period_end_date`: DateField
   - `metrics_json`: TextField (JSON-formatted)

7. **ActivityLog**
   - `id`: AutoField (Primary Key)
   - `user`: ForeignKey to User
   - `action`: TextField
   - `timestamp`: DateTimeField

8. **Notification**
   - `id`: AutoField (Primary Key)
   - `sender`: ForeignKey to User
   - `receiver`: ForeignKey to User
   - `message`: TextField
   - `timestamp`: DateTimeField
   - `is_system`: BooleanField
   - `is_read`: BooleanField

9. **LoginHelpRequest**
   - `id`: AutoField (Primary Key)
   - `user`: ForeignKey to User
   - `message`: TextField
   - `status`: CharField with choices

10. **AttendanceTimeFrame**
    - `id`: AutoField (Primary Key)
    - `sales_staff`: ForeignKey to User
    - `date`: DateField
    - `start_time`: TimeField
    - `end_time`: TimeField
    - `created_at`: DateTimeField

## API Endpoints

The API follows RESTful conventions with the following main endpoints:

### Authentication
- `POST /api/auth/login/`: User login
- `POST /api/auth/token/refresh/`: Refresh JWT token
- `POST /api/auth/login-help/`: Request login assistance

### Users
- `GET /api/users/`: List users (filtered by role-based permissions)
- `POST /api/users/`: Create a new user
- `GET /api/users/<id>/`: Get user details
- `PUT /api/users/<id>/`: Update user
- `DELETE /api/users/<id>/`: Delete user

### Groups
- `GET /api/groups/`: List groups
- `POST /api/groups/`: Create a new group
- `GET /api/groups/<id>/`: Get group details
- `PUT /api/groups/<id>/`: Update group
- `DELETE /api/groups/<id>/`: Delete group

### Clients
- `GET /api/clients/`: List clients
- `POST /api/clients/`: Add a new client
- `GET /api/clients/<id>/`: Get client details

### Attendance
- `GET /api/attendance/`: List attendance records
- `POST /api/attendance/`: Mark attendance
- `PUT /api/attendance/<id>/excuse/`: Excuse a late attendance
- `GET /api/attendance/today/`: Get today's attendance status

### Reports
- `GET /api/reports/`: List reports
- `POST /api/reports/`: Submit a new report
- `GET /api/reports/<id>/`: Get report details
- `PUT /api/reports/<id>/approve/`: Approve a report
- `PUT /api/reports/<id>/reject/`: Reject a report

### Performance
- `GET /api/performance/`: Get performance metrics
- `GET /api/performance/<id>/`: Get specific performance record
- `PUT /api/performance/<id>/`: Update performance metrics

### Notifications
- `GET /api/notifications/`: List notifications
- `POST /api/notifications/`: Send a notification
- `PUT /api/notifications/read/`: Mark notifications as read

### Activity Logs
- `GET /api/logs/`: List activity logs (admin only)

## Frontend Components

### Core Components
1. **Auth Components**
   - Login
   - LoginHelp
   - PasswordReset

2. **Layout Components**
   - Dashboard
   - Sidebar
   - Header
   - NotificationPanel

3. **User Management**
   - UserList
   - UserForm
   - UserDetail

4. **Attendance Components**
   - AttendanceForm
   - AttendanceList
   - ExcuseAttendanceForm
   - AttendanceTimeFrameForm

5. **Client Components**
   - ClientForm
   - ClientList
   - ClientDetail

6. **Report Components**
   - ReportForm
   - ReportList
   - ReportDetail
   - ReportAction

7. **Performance Components**
   - PerformanceCharts
   - PerformanceMetrics
   - PerformanceComparison

8. **Notification Components**
   - NotificationList
   - NotificationForm

All components utilize role-based rendering to show only what's relevant to the current user's role, and all data access is restricted according to the hierarchical permissions system.