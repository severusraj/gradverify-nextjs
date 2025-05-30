# GradVerify - Gordon College Graduate Verification System

A modern web application for verifying and managing graduate credentials at Gordon College. Built with Next.js, TypeScript, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- PostgreSQL (v14.0 or higher)
- Git

### Installation Steps

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
   # Create .env file
   touch .env
   ```

   Add the following to your `.env` file:
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
   # Generate Prisma client
   npx prisma generate

   # Push the schema to your database
   npx prisma db push

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
gradverify-nextjs/
├── prisma/              # Database schema and migrations
├── public/             # Static assets
├── src/
│   ├── app/           # Next.js app directory
│   │   ├── api/       # API routes
│   │   ├── auth/      # Authentication pages
│   │   ├── dashboard/ # Dashboard pages
│   │   └── settings/  # Settings pages
│   ├── components/    # Reusable components
│   ├── lib/          # Utility functions
│   └── styles/       # Global styles
└── package.json      # Project dependencies
```

## 🔧 Configuration

### Database Setup

1. Install PostgreSQL if you haven't already
2. Create a new database named `gradverify`
3. Update the `DATABASE_URL` in your `.env` file with your database credentials

### Authentication Setup

1. Generate a secure secret for NextAuth:
   ```bash
   openssl rand -base64 32
   ```
2. Add the generated secret to your `.env` file as `NEXTAUTH_SECRET`

### Creating Super Admin

1. First, ensure your database is set up and migrations are run:
   ```bash
   npx prisma migrate dev
   ```

2. Run the create-admin script:
   ```bash
   npx tsx scripts/create-admin.ts
   ```

3. Follow the prompts to create your superadmin account:
   - Enter email address
   - Enter password
   - Confirm password

4. Verify the superadmin was created:
   ```bash
   npx prisma studio
   ```
   Then check the User table for your new superadmin account.

### Email Setup (Optional)

1. Configure your email provider settings in the `.env` file
2. Supported providers: SMTP, SendGrid, Amazon SES

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

The project uses GitHub Actions for continuous integration and deployment. Here's what's set up:

#### ✅ CI Checks
- [ ] **Lint Check**
  - Runs ESLint
  - Checks code formatting
  - Verifies TypeScript types

- [ ] **Build Check**
  - Verifies Next.js build
  - Checks for build errors
  - Validates static generation

- [ ] **Test Suite**
  - Runs unit tests
  - Executes integration tests
  - Reports test coverage

#### 🚀 Deployment
- [ ] **Development**
  - Automatic deployment to development environment
  - Runs on push to `development` branch
  - Includes database migrations

- [ ] **Production**
  - Manual deployment to production
  - Triggered by release tags
  - Includes security checks

### Setting Up CI/CD

1. **Enable GitHub Actions**
   - Go to repository Settings
   - Navigate to Actions > General
   - Enable "Allow all actions and reusable workflows"

2. **Configure Secrets**
   Add the following secrets in repository Settings > Secrets:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `EMAIL_SERVER_*` (if using email)

3. **Branch Protection**
   Set up branch protection rules:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

## 👥 User Roles

1. **Super Admin**
   - Full system access
   - User management
   - System configuration

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

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run prisma:studio` - Open Prisma Studio

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Authentication Problems**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your environment
   - Clear browser cookies if needed

3. **Build Errors**
   - Clear node_modules and reinstall
   - Update dependencies
   - Check TypeScript errors

### Getting Help

If you encounter any issues:
1. Check the error logs
2. Review the documentation
3. Create an issue in the repository

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support:
- Create an issue in the repository
- Contact the development team
- Check the documentation