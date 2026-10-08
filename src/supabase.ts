import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sikiuaxaosvdjprsoqmq.supabase.co';
const supabaseKey = 'sb_publishable_sJG4sB6pSo7kXywaaDZTAw_Qv559Fcv';

export const supabase = createClient(supabaseUrl, supabaseKey);
