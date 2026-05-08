import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://apoorxavkxuxdqxaajlq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwb29yeGF2a3h1eGRxeGFhamxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDgwNjUsImV4cCI6MjA5MzgyNDA2NX0.BeHzJbHg69WzCW64_NRmPKu3nfitNCzOqtLLQsfPCys";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);