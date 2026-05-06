import { createClient } from '@supabase/supabase-js';
import type { ScanResult } from './types';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function saveScan(result: ScanResult): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('scans')
    .insert({
      domain: result.domain,
      score: result.score,
      risk_level: result.riskLevel,
      result,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to save scan:', error.message);
    return null;
  }

  return data?.id || null;
}

export async function getScan(id: string): Promise<ScanResult | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('scans')
    .select('id,result')
    .eq('id', id)
    .single();

  if (error || !data?.result) return null;
  return { ...(data.result as ScanResult), id: data.id };
}
