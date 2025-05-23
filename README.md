# GradVerify - Gordon College Graduate Verification System

A modern web application for verifying and managing graduate credentials at Gordon College. Built with Next.js, TypeScript, and Prisma.

## Features

- 🔐 Secure authentication system
- 👥 Role-based access control (Super Admin, Admin, Faculty, Student)
- 📝 Document verification workflow
- 📊 Analytics and reporting
- 🎓 Award management
- 📱 Responsive design
- 🔍 Advanced search and filtering

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- PostgreSQL (v14.0 or higher)
- Git

## System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 1GB free space
- **Processor**: Dual-core processor or better
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/severusraj/gradverify-nextjs.git
   cd gradverify-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/gradverify"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Email (Optional)
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@example.com"
   EMAIL_SERVER_PASSWORD="your-password"
   EMAIL_FROM="noreply@example.com"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
gradverify-nextjs/
├── prisma/              # Database schema and migrations
├── public/             # Static assets
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # Reusable components
│   ├── lib/          # Utility functions and configurations
│   └── styles/       # Global styles
├── tests/            # Test files
└── package.json      # Project dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run prisma:studio` - Open Prisma Studio

## Database Schema

The system uses PostgreSQL with the following main models:
- Users (with role-based access)
- Documents
- Verifications
- Awards
- Departments
- Programs

## Role-Based Access

1. **Super Admin**
   - Full system access
   - User management
   - System configuration
   - Analytics and reporting

2. **Admin**
   - Document verification
   - Basic user management
   - Reports generation

3. **Faculty**
   - Document submission
   - Student verification
   - Basic reporting

4. **Student**
   - Document upload
   - Status tracking
   - Profile management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For support, email support@example.com or create an issue in the repository.

## Acknowledgments

- Gordon College
- Next.js Team
- Prisma Team
- All contributors