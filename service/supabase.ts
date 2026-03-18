//ตั้งค่าการเชื่อมต่อกับ Supabase
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qndrszuiialryujwlott.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZHJzenVpaWFscnl1andsb3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTgxMzYsImV4cCI6MjA4NTczNDEzNn0.IjDd-AymdF4lyi1ErM9q9RmFBh29IYGYvRPsICn2LAI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
