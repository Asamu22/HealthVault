import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { WebSocket } from 'ws';

config();

global.WebSocket = WebSocket;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.VITE_ADMIN_EMAIL;
const adminClinicianId = process.env.VITE_ADMIN_CLINICIAN_ID;

if (!supabaseUrl || !serviceRoleKey || !adminEmail || !adminClinicianId) {
  console.error('Missing Supabase environment values. Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_ADMIN_EMAIL, and VITE_ADMIN_CLINICIAN_ID first.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const password = process.env.SUPABASE_ADMIN_PASSWORD || 'HealthVault@2026!';

const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

if (listError) {
  console.error('Failed to inspect existing users:', listError.message);
  process.exit(1);
}

const existingUser = existingUsers.users.find((user) => user.email === adminEmail);

if (existingUser) {
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
    user_metadata: {
      clinician_id: adminClinicianId,
      role: 'admin',
      is_super_admin: true,
    },
  });

  if (updateError) {
    console.error('Failed to update admin user:', updateError.message);
    process.exit(1);
  }

  console.log('Admin user updated:', updatedUser.user?.id);
  console.log('Use this password to sign in:', password);
  process.exit(0);
}

const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
  email: adminEmail,
  password,
  email_confirm: true,
  user_metadata: {
    clinician_id: adminClinicianId,
    role: 'admin',
    is_super_admin: true,
  },
});

if (signUpError) {
  console.error('Failed to create admin user:', signUpError.message);
  process.exit(1);
}

console.log('Admin user created:', userData.user?.id);
console.log('Use this password to sign in:', password);
