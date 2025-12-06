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
- Sets a password from `ADMIN_PASSWORD` env var, or generates a secure random password
- Assigns the admin role in the `user_roles` table
- If the user already exists, it updates the password
- Uses a retry mechanism to verify profile creation

### Security Notes

- The script requires the Supabase service role key, which has admin privileges
- **Recommended**: Set a strong password via the `ADMIN_PASSWORD` environment variable
- If `ADMIN_PASSWORD` is not set, a secure random password will be generated and displayed
- **Save the generated password** - it will only be shown once
- **Change the password immediately after first login**
- The service role key should never be committed to version control
- Store the service role key securely (e.g., in environment variables or a secrets manager)

### Credentials

After running the script, the admin can login with:
- **Email**: djplayxsilas134@gmail.com
- **Password**: 
  - If you set `ADMIN_PASSWORD`: Your custom password
  - If not set: A randomly generated password (displayed in console output)

**⚠️ IMPORTANT**: 
- Save the password immediately when shown
- Change this password after first login for security!
