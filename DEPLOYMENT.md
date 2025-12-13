# Deployment Guide

This guide walks you through deploying the MAXPROFIT AI Trading platform to production.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Supabase](https://supabase.com/) account (free tier available)
- Git installed
- A domain name (optional, for custom domain)

---

## Step 1: Configure Supabase Project

### 1.1 Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **"New project"**
3. Fill in the details:
   - **Organization**: Select or create an organization
   - **Project name**: `maxprofit-trading` (or your preferred name)
   - **Database password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
   - **Pricing plan**: Select Free or Pro based on your needs
4. Click **"Create new project"**
5. Wait for the project to be provisioned (takes 1-2 minutes)

### 1.2 Get Your Supabase Credentials

Once your project is ready, navigate to **Settings > API**:

- **Project URL**: `https://your-project-id.supabase.co`
- **Anon/Public Key**: `eyJ...` (public, safe to expose)
- **Service Role Key**: `eyJ...` (secret, never expose in client code)

Save these credentials securely - you'll need them later.

---

## Step 2: Apply Database Migrations

### 2.1 Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or via npm (all platforms)
npm install -g supabase
```

### 2.2 Login to Supabase CLI

```bash
supabase login
```

This will open a browser window for authentication.

### 2.3 Link to Your Project

```bash
cd /path/to/MAXPROFIT-AUTOMATED-AI-TRADING
supabase link --project-ref your-project-id
```

Replace `your-project-id` with the ID from your project URL (the part before `.supabase.co`).

When prompted for the database password, enter the password you created in Step 1.1.

### 2.4 Apply All Migrations

```bash
supabase db push
```

This will apply all migrations in the `supabase/migrations/` directory to your Supabase database.

**Verify migrations were applied:**

```bash
supabase migration list
```

You should see all migrations with checkmarks (✓) indicating they've been applied.

### 2.5 Verify Database Schema

Go to **Supabase Dashboard > Table Editor** and confirm you see these tables:

- `profiles`
- `user_roles`
- `investment_plans`
- `investments`
- `transactions`
- `trading_bot_performance`
- `referrals`
- `admin_activity_logs`
- `contact_messages`

---

## Step 3: Deploy Edge Functions

### 3.1 Deploy All Edge Functions

```bash
# Deploy admin-create-user
supabase functions deploy admin-create-user

# Deploy admin-delete-user
supabase functions deploy admin-delete-user

# Deploy admin-reset-password
supabase functions deploy admin-reset-password

# Deploy admin-suspend-user
supabase functions deploy admin-suspend-user

# Deploy auto-process-withdrawals
supabase functions deploy auto-process-withdrawals

# Deploy verify-blockchain-transaction
supabase functions deploy verify-blockchain-transaction

# Deploy verify-withdrawal-confirmation-fee
supabase functions deploy verify-withdrawal-confirmation-fee

# Deploy send-password-reset-confirmation
supabase functions deploy send-password-reset-confirmation
```

**Or deploy all at once:**

```bash
supabase functions deploy admin-create-user admin-delete-user admin-reset-password admin-suspend-user auto-process-withdrawals verify-blockchain-transaction verify-withdrawal-confirmation-fee send-password-reset-confirmation
```

### 3.2 Verify Edge Functions

Go to **Supabase Dashboard > Edge Functions** and confirm all functions are deployed and showing as "Active".

### 3.3 Test Edge Functions (Optional)

You can test the functions from the Supabase Dashboard:

1. Go to **Edge Functions**
2. Click on a function (e.g., `admin-create-user`)
3. Click **"Invoke function"**
4. Provide test JSON payload

---

## Step 4: Set Environment Variables

### 4.1 Create `.env` File

In your project root, create a `.env` file:

```bash
cp .env.example .env
```

### 4.2 Update Environment Variables

Edit the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id

# Optional: For admin setup script
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ IMPORTANT**: 
- Never commit `.env` to version control
- `.env` is already in `.gitignore` for your safety
- Only use the **service role key** in server-side scripts, never in the frontend

### 4.3 Environment Variables for Deployment

If deploying to Vercel, Netlify, or similar:

1. Go to your hosting platform's dashboard
2. Navigate to **Environment Variables** or **Settings**
3. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

---

## Step 5: Change Default Admin Password

### 5.1 Option A: Using the Admin Setup Script (Recommended for Secondary Admin)

For the secondary admin account (`djplayxsilas134@gmail.com`):

```bash
# Set your desired password
export ADMIN_PASSWORD="your_secure_password_here"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run the script
npm run setup:admin
```

The script will:
- Create the admin user if it doesn't exist
- Set the password you specified
- Assign admin role

**Save the credentials:**
- Email: `djplayxsilas134@gmail.com`
- Password: The one you set in `ADMIN_PASSWORD`

### 5.2 Option B: Change Primary Admin Password via UI

For the primary admin account (`maxforexautomatedforexroboti@gmail.com`):

1. **Deploy your application** (see Step 6 first)
2. **Navigate to the admin login page**: `https://your-app-url/admin/login`
3. **Login with default credentials**:
   - Email: `maxforexautomatedforexroboti@gmail.com`
   - Password: `338822`
4. **Change password immediately**:
   - Go to **Admin Settings** or **Profile**
   - Click **"Change Password"**
   - Enter a strong new password (minimum 8 characters, include uppercase, lowercase, numbers, and symbols)
   - Save changes

**⚠️ CRITICAL**: Change this password immediately after first login for security!

### 5.3 Enable Two-Factor Authentication (Recommended)

After changing your password:

1. Go to **Profile Settings**
2. Look for **"Two-Factor Authentication"** or **"2FA"** section
3. Follow the prompts to set up 2FA using an authenticator app (Google Authenticator, Authy, etc.)
4. Save your backup codes in a secure location

---

## Step 6: Deploy the Application

### 6.1 Build the Application

```bash
npm install
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 6.2 Deploy to Vercel (Recommended)

**Using Vercel CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? maxprofit-trading
# - Directory? ./
# - Override settings? No
```

**Using Vercel Dashboard:**

1. Go to [vercel.com](https://vercel.com/)
2. Click **"New Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add your Supabase variables
5. Click **"Deploy"**

### 6.3 Deploy to Netlify

**Using Netlify CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# When prompted:
# - Build command: npm run build
# - Publish directory: dist
```

**Using Netlify Dashboard:**

1. Go to [netlify.com](https://www.netlify.com/)
2. Click **"Add new site"** > **"Import an existing project"**
3. Connect your Git repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**: Add your Supabase variables
5. Click **"Deploy site"**

### 6.4 Deploy to Custom Server (VPS/Cloud)

If deploying to your own server:

```bash
# Build the app
npm run build

# Upload dist/ folder to your server
scp -r dist/ user@your-server:/var/www/maxprofit-trading/

# Configure your web server (Nginx example)
# Create /etc/nginx/sites-available/maxprofit-trading:
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/maxprofit-trading;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Then enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/maxprofit-trading /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: Configure Storage Buckets

### 7.1 Create Storage Buckets

The migrations should have created these automatically, but verify in **Supabase Dashboard > Storage**:

1. **kyc-documents** (Private)
   - Max file size: 5MB
   - Allowed file types: PDF, JPG, PNG
   
2. **profile-pictures** (Public)
   - Max file size: 2MB
   - Allowed file types: JPG, PNG
   
3. **transaction-receipts** (Private)
   - Max file size: 10MB
   - Allowed file types: PDF, JPG, PNG
   
4. **platform-documents** (Public)
   - Max file size: 50MB
   - Allowed file types: PDF, DOC, DOCX

### 7.2 Verify Storage Policies

Each bucket should have RLS (Row Level Security) policies. Check **Storage > Policies** to ensure:

- **Private buckets**: Only authenticated users can access their own files
- **Public buckets**: Anyone can read, but only authenticated users can upload

---

## Step 8: Seed Initial Data (Optional)

### 8.1 Create Investment Plans

Go to **Supabase Dashboard > Table Editor > investment_plans** and insert the default plans:

**Silver Plan:**
```sql
INSERT INTO investment_plans (name, description, min_amount, max_amount, expected_roi_min, expected_roi_max, duration_days, risk_level, active)
VALUES ('Silver', 'Entry-level investment plan for beginners', 250, 500, 5, 15, 30, 'low', true);
```

**Gold Plan:**
```sql
INSERT INTO investment_plans (name, description, min_amount, max_amount, expected_roi_min, expected_roi_max, duration_days, risk_level, active)
VALUES ('Gold', 'Intermediate investment plan with balanced returns', 500, 1000, 10, 25, 30, 'medium', true);
```

**Platinum Plan:**
```sql
INSERT INTO investment_plans (name, description, min_amount, max_amount, expected_roi_min, expected_roi_max, duration_days, risk_level, active)
VALUES ('Platinum', 'Premium investment plan with maximum returns', 1000, 10000, 20, 40, 30, 'high', true);
```

### 8.2 Create Admin User Roles

The primary admin should already be set up. For the secondary admin:

```bash
npm run setup:admin
```

Or manually via SQL:

```sql
-- Ensure the user exists in auth.users first, then:
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Step 9: Configure Custom Domain (Optional)

### 9.1 For Vercel

1. Go to **Vercel Dashboard > Your Project > Settings > Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `maxprofit-trading.com`)
4. Follow the DNS configuration instructions

### 9.2 For Netlify

1. Go to **Netlify Dashboard > Your Site > Domain Settings**
2. Click **"Add custom domain"**
3. Enter your domain
4. Update your DNS records as instructed

---

## Step 10: Post-Deployment Checklist

### Security

- [ ] Changed default admin password
- [ ] Enabled 2FA for admin accounts
- [ ] Verified RLS policies are active on all tables
- [ ] Confirmed service role key is not exposed in client code
- [ ] Set up SSL/HTTPS (automatic on Vercel/Netlify)

### Functionality

- [ ] Test user registration flow
- [ ] Test user login
- [ ] Test KYC submission
- [ ] Test deposit submission
- [ ] Test investment creation
- [ ] Test withdrawal request
- [ ] Test referral link generation
- [ ] Test admin login
- [ ] Test admin user management
- [ ] Test admin deposit approval
- [ ] Test admin withdrawal approval

### Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure uptime monitoring (e.g., UptimeRobot)
- [ ] Set up database backups in Supabase
- [ ] Review Supabase usage metrics
- [ ] Configure email notifications for admin actions

### Performance

- [ ] Test page load times
- [ ] Verify images are optimized
- [ ] Check bundle size (should be ~220 KB gzipped)
- [ ] Test on mobile devices
- [ ] Verify lazy loading is working

---

## Troubleshooting

### Issue: "Invalid API key" error

**Solution**: Verify your environment variables are set correctly:
- Check `VITE_SUPABASE_URL` matches your project URL
- Check `VITE_SUPABASE_PUBLISHABLE_KEY` is the anon/public key (not service role)
- Restart the dev server after changing `.env`

### Issue: Database queries fail

**Solution**: 
- Verify migrations are applied: `supabase migration list`
- Check RLS policies are enabled on tables
- Ensure user is authenticated before making queries

### Issue: Edge Functions not working

**Solution**:
- Verify functions are deployed: Check Supabase Dashboard > Edge Functions
- Check function logs in Supabase Dashboard for errors
- Ensure CORS headers are set correctly (already done in function code)

### Issue: File uploads failing

**Solution**:
- Verify storage buckets exist
- Check bucket policies allow uploads
- Verify file size is within limits
- Check file type is allowed

### Issue: Admin cannot login

**Solution**:
- Verify user exists in `auth.users` table
- Check `user_roles` table has admin role for user
- Try password reset via Edge Function
- Check Supabase Auth logs for errors

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review admin activity logs for suspicious activity
2. **Monthly**: Check database size and upgrade plan if needed
3. **Quarterly**: Security audit and dependency updates
4. **As needed**: Backup database before major changes

### Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/
- **Project README**: See `README.md` for more details

### Updating the Application

To deploy updates:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Run new migrations (if any)
supabase db push

# Deploy edge functions (if changed)
supabase functions deploy function-name

# Build and deploy
npm run build
# Then deploy using your platform's method
```

---

## Conclusion

Your MAXPROFIT AI Trading Platform is now deployed! 🎉

**Next steps:**
1. Test all features thoroughly
2. Monitor the application for errors
3. Set up regular backups
4. Plan for scaling as users grow

For any issues or questions, refer to the troubleshooting section above or consult the main `README.md`.

---

**Deployment Completed**: [Current Date]  
**Platform Version**: 1.0.0  
**Database Version**: Latest migration applied  
**Edge Functions**: 4 deployed
