/**
 * Script to create an admin user for djplayxsilas134@gmail.com
 * 
 * This script should be run with Node.js using ts-node or similar
 * 
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/create-admin-user.ts
 * 
 * Or for local development:
 *   npx tsx scripts/create-admin-user.ts
 */

import { createClient } from '@supabase/supabase-js';

// Type for user object from Supabase Auth
interface SupabaseUser {
  id: string;
  email?: string;
  created_at?: string;
}

const ADMIN_EMAIL = 'djplayxsilas134@gmail.com';

// Generate a random secure password if not provided
function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
}

// Get password from environment variable, or generate a random one
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || generateSecurePassword();
const passwordWasGenerated = !process.env.ADMIN_PASSWORD;

async function createAdminUser() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'Set' : 'Not set');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Creating admin user:', ADMIN_EMAIL);

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      process.exit(1);
    }

    const existingUser = (existingUsers?.users || []).find((u) => (u as SupabaseUser).email === ADMIN_EMAIL) as SupabaseUser | undefined;
    
    if (existingUser) {
      console.log('User already exists with ID:', existingUser.id);
      console.log('Updating password...');
      
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: ADMIN_PASSWORD }
      );
      
      if (updateError) {
        console.error('Error updating password:', updateError);
        process.exit(1);
      }
      
      console.log('Password updated successfully!');
      
      // Check if admin role exists
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', existingUser.id)
        .eq('role', 'admin');
      
      if (roleError) {
        console.error('Error checking admin role:', roleError);
      } else if (!roleData || roleData.length === 0) {
        console.log('Assigning admin role...');
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: existingUser.id, role: 'admin' });
        
        if (insertRoleError) {
          console.error('Error assigning admin role:', insertRoleError);
        } else {
          console.log('Admin role assigned successfully!');
        }
      } else {
        console.log('User already has admin role');
      }
    } else {
      console.log('Creating new user...');
      
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // Auto-confirm email
      });

      if (createError) {
        console.error('Error creating user:', createError);
        process.exit(1);
      }

      console.log('User created successfully with ID:', newUser.user.id);

      // Wait for the profile trigger to complete
      // This uses a retry mechanism to check if the profile was created
      const maxRetries = 5;
      const baseDelay = 500; // Start with 500ms
      let profileCreated = false;
      
      for (let i = 0; i < maxRetries; i++) {
        // Use exponential backoff: 500ms, 1000ms, 2000ms, 4000ms, 8000ms
        const delay = i === 0 ? baseDelay : baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const { data: profile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', newUser.user.id)
          .single();
        
        if (!profileCheckError && profile) {
          profileCreated = true;
          console.log('Profile created successfully');
          break;
        }
      }
      
      if (!profileCreated) {
        console.error('Error: Profile was not created by the trigger after multiple retries');
        console.error('Please check that the handle_new_user trigger is properly configured');
        process.exit(1);
      }

      // Assign admin role
      console.log('Assigning admin role...');
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: 'admin',
        });

      if (roleError) {
        console.error('Error assigning admin role:', roleError);
        console.error('You may need to manually assign the admin role in the database');
        process.exit(1);
      }

      console.log('Admin role assigned successfully!');
    }

    console.log('\n=== Admin User Setup Complete ===');
    console.log('Email:', ADMIN_EMAIL);
    
    if (passwordWasGenerated) {
      console.log('Password (GENERATED):', ADMIN_PASSWORD);
      console.log('\n⚠️  CRITICAL: Save this generated password! It will not be shown again.');
    } else {
      console.log('Password: (set via ADMIN_PASSWORD environment variable)');
    }
    
    console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
