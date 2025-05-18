# Contributing to this project

First off, thank you for considering contributing! 🙌 Your help makes this project better.

# How to contribute

### 1. Reporting Issues

If you find a bug or have a feature request:

- Check the [issues](https://github.com/almostJohn/gradverify/issues) to see if it's already reported.
- If not, open a new issue with a clear title and description.
- Provide steps to reproduce, expected behavior, and screenshots if applicable.

### 2. Suggesting Features

- Open an issue to discuss your idea before working on it.
- Explain the use case and why it would be helpful.

### 3. Your First Code Contribution

We welcome all contributions, big or small!

#### Steps to contribute code:

**1.** **Fork** the repository
**2.** **Clone** your fork locally

```bash
git clone https://github.com/almostJohn/gradverify.git
```

**3.** **Create a new branch** for your feature or fix

```bash
git checkout -b my-feature-branch
```

**4.** **Intall** the dependencies

```bash
npm install
# or
yarn install
```

> ℹ️ **Note:**
> Make sure to check all development resources, such as the `.env` file.  
> The development branch may break or throw errors if required development resources are missing.

##### Example `.env` resources:

You can always check this inside the `.env.example`

```bash
DATABASE_URL="" # Database connection string (e.g., postgres://user:password@host:port/dbname)
SECRET_KEY="" # Secret key for application encryption or JWT signing (keep this secure)
RESEND_API_KEY="" # API key for Resend service (used for sending emails)
PRODUCT_EMAIL="" # The email address used as the sender for product-related emails
EMAIL_TO="" # Default recipient email address for notifications or contact forms
EMAIL_FROM="" # Default sender email address for outgoing emails
SUPERUSER_ADMIN_NAME="" # Name of the superuser or admin account
SUPERUSER_ADMIN_EMAIL="" # Email address for the superuser or admin account
SUPERUSER_ADMIN_PASSWORD="" # Password for the superuser or admin account (ensure strong and secure)
```

**5.** **Run** the development server

```bash
npm run dev
# or
yarn dev
```

**6.** **Make** your changes
**7.** **Test** your changes thouroughly to avoid breaking existing functionality
**8.** **Commit** your changes with a **clear message**

```bash
git add .
git commit -m "feat: add button component"
```

**10.** **Open a Pull Request** and describe your changes

### 4. Code Style & Guidelines

- Follow the existing code style and conventions
- Use ESLint and Prettier for formatting if set up
- Write clear, concise commit messages
- Write meaningful comments if necessary

### 5. Testing

- Add or update tests for your changes if applicable
- Run existing tests to make sure nothing is broken

### 6. Branches and Pull Requests

- Pull requests should target the `main` branch
- PRs should be clean, focused, and pass all checks

# Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)

- [GitHub Flow](https://guides.github.com/introduction/flow/)
