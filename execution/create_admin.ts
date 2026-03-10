import { createClient } from '@supabase/supabase-js'

// Use the publishable key - we'll use the admin API via the Management API
// The Supabase client with anon key can only use auth.signUp()
// We need to use the Admin API which requires service role key

// Let's check if we can find service role key in any config files
import { readFileSync } from 'fs'

const supabaseUrl = 'https://zidvplwggyfmwvtffxyv.supabase.co'
const anonKey = 'sb_publishable_GW-jcJ04iO4PEoP7DQBAAw_-YpLV-rM'

// Use regular client to try signup - disable email confirmation can be done via Supabase dashboard
const supabase = createClient(supabaseUrl, anonKey)

async function main() {
    console.log('Attempting signup for admin@church.local ...')
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@church.local',
        password: 'Admin123!',
        options: {
            emailRedirectTo: 'http://localhost:3000'
        }
    })

    if (error) {
        console.error('Signup error:', error.message)
    } else {
        console.log('Signup result:', JSON.stringify(data, null, 2))
    }
}

main()
