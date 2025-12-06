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

const ADMIN_EMAIL = 'djplayxsilas134@gmail.com';
const ADMIN_PASSWORD = 'Admin@2024!Secure'; // Change this to desired password

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

    const existingUser = existingUsers?.users?.find((u: any) => u.email === ADMIN_EMAIL);
    
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

      // Wait a moment for the profile trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

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
    console.log('Password:', ADMIN_PASSWORD);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
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
