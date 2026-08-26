const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vriqwtzyxdnlpagexqay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaXF3dHp5eGRubHBhZ2V4cWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDY4MDMsImV4cCI6MjEwMTA4MjgwM30.-ohvCVsIivfcohHcSiYgsA1TnnDYdIsuSkP_VTwN_IM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'official@mavrostech.in',
    password: 'veytrix@control.7090',
  });
  console.log('Result:', data, error);
}
main();
