import { createClient } from '@supabase/supabase-js'

// NOTE: In production, use environment variables. Hardcoded for demo/sandbox convenience.
const supabaseUrl = 'https://msavvhccduhtvcbzdcnz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYXZ2aGNjZHVodHZjYnpkY256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzQ3NzksImV4cCI6MjA3NTg1MDc3OX0.otMqAsERDqKX1hWds1GQQggXy64pY4kt3NvBc6-X69g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
