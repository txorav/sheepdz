# Sheep Import & Distribution Management System - Algeria 2025

## Project Overview
A comprehensive web application for managing the fair distribution of imported sheep for Eid across Algeria's 48 wilayas. The system ensures one sheep per family using family notebook verification and enables online reservations with payment processing.

## Features Implemented

### ✅ Core System Components
1. **Government Admin Panel** - Central management and oversight
2. **Wilaya-Level Management** - Regional distribution control
3. **Customer Portal** - Public registration, reservation, and payment

### ✅ Key Features
- **Authentication & Authorization** - Role-based access (Admin, Wilaya Admin, Customer)
- **Family Notebook Verification** - Unique constraint preventing duplicates
- **Import Tracking** - Multiple batches from different countries
- **Allocation Management** - Quantity distribution across wilayas
- **Reservation System** - Customer booking with status tracking
- **Payment Processing** - Integrated payment confirmation
- **Notification System** - Real-time updates for customers
- **Advanced Scheduling** - Bulk pickup scheduling with automated reminders

### ✅ Database Schema
- **48 Algerian Wilayas** - Complete geographical coverage
- **User Management** - Admin, Wilaya Admin, and Customer roles
- **Sheep Import Batches** - Multi-country import tracking
- **Allocation System** - Wilaya-level quantity management
- **Reservation Workflow** - Complete booking to pickup cycle
- **Payment Integration** - Status tracking and confirmation
- **Notification System** - Customer communication

## Technology Stack
- **Frontend**: Next.js 15.3 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs

## Test Data Available

### Admin Users
- **System Admin**: admin@sheep.dz / admin123
- **Wilaya Admins**: admin.01@sheep.dz / admin123 (Adrar), etc.

### Customer Users
- customer1@example.com / admin123 (Ahmed Benali)
- customer2@example.com / admin123 (Fatima Khelifi)
- ... (12 total customers)

### Sample Data Includes
- 48 Algerian Wilayas
- 3 Sheep Import Batches (Romania, Argentina, Uruguay)
- 16 Wilaya Allocations
- 18 Users (1 admin + 5 wilaya admins + 12 customers)
- 8 Customer Reservations
- 4 Completed Payments
- 5 Customer Notifications

## Key API Endpoints

### Admin APIs
- `/api/admin/users` - User management
- `/api/admin/wilayas` - Wilaya management
- `/api/admin/imports` - Import batch management
- `/api/admin/allocations` - Allocation management

### Wilaya Admin APIs
- `/api/wilaya-admin/allocations` - Regional allocation management
- `/api/wilaya-admin/reservations` - Reservation status updates
- `/api/wilaya-admin/schedule` - Pickup scheduling with reminders
- `/api/wilaya-admin/distribution` - Distribution tracking

### Customer APIs
- `/api/customer/wilayas` - Available wilayas
- `/api/customer/allocations` - Available allocations
- `/api/customer/reservations` - Reservation management
- `/api/customer/payments` - Payment processing
- `/api/customer/notifications` - Customer notifications

### Public APIs
- `/api/auth/register` - Customer registration
- `/api/auth/[...nextauth]` - Authentication

## Development Commands
```bash
# Start development server
npm run dev

# Reset and seed database
npm run db:reset

# Seed database only
npm run db:seed

# Build application
npm run build

# Start production server
npm run start
```

## Access URLs
- **Main Application**: http://localhost:3003
- **Admin Dashboard**: http://localhost:3003/admin/dashboard
- **Wilaya Admin Dashboard**: http://localhost:3003/wilaya-admin/dashboard
- **Customer Portal**: http://localhost:3003/customer/dashboard
- **Public Registration**: http://localhost:3003/auth/signup
- **Login**: http://localhost:3003/auth/signin

## System Workflow
1. **Import Management**: Admins create sheep import batches
2. **Allocation**: Quantities allocated to wilayas
3. **Customer Registration**: Families register with notebook numbers
4. **Reservation**: Customers reserve their sheep allocation
5. **Payment**: Payment confirmation for reservations
6. **Scheduling**: Wilaya admins schedule pickup times
7. **Notification**: Customers receive pickup reminders
8. **Distribution**: Final sheep pickup and distribution

## Security Features
- Family notebook uniqueness enforcement
- Role-based access control
- Password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization

## Next Steps for Production
1. **Environment Configuration** - Production database and secrets
2. **Email/SMS Integration** - Real communication channels
3. **Payment Gateway** - Actual payment processing
4. **Enhanced Analytics** - Detailed reporting and insights
5. **Mobile Optimization** - Responsive design improvements
6. **Performance Testing** - Load testing and optimization
7. **Security Audit** - Comprehensive security review
