# Admin Setup Scripts

This directory contains scripts for setting up and managing admin users.

## create-admin-user.ts

Creates or updates the admin user account for `djplayxsilas134@gmail.com`.

### Prerequisites

- Node.js installed
- Access to Supabase service role key

### Usage

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Install tsx for running TypeScript:
   ```bash
   npm install -D tsx
   ```

3. Set environment variables and run the script:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key ADMIN_PASSWORD=your_secure_password npx tsx scripts/create-admin-user.ts
   ```

   Or if you have a `.env` file with the service role key and password:
   ```bash
   npx tsx scripts/create-admin-user.ts
   ```

### What it does

- Creates the admin user `djplayxsilas134@gmail.com` if it doesn't exist
- Sets a secure password for the account
- Assigns the admin role in the `user_roles` table
- If the user already exists, it updates the password

### Security Notes

- The script requires the Supabase service role key, which has admin privileges
- **Set a strong password** via the `ADMIN_PASSWORD` environment variable
- **Change the password immediately after first login** if using the default
- The service role key should never be committed to version control
- Store the service role key securely (e.g., in environment variables or a secrets manager)
- Passwords are not logged to console for security

### Default Credentials

After running the script, the admin can login with:
- **Email**: djplayxsilas134@gmail.com
- **Password**: The value you set in `ADMIN_PASSWORD` env var, or the default `Admin@2024!Secure`

**⚠️ IMPORTANT**: Change this password immediately after first login for security!
