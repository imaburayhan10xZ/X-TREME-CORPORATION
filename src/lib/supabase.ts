/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const masterUrl = import.meta.env.VITE_SUPABASE_URL || '';
const masterKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const masterSupabase = masterUrl && masterKey 
  ? createClient(masterUrl, masterKey)
  : { auth: {}, from: () => ({ select: () => ({ data: [], error: 'Supabase not configured' }) }) } as any;

let tenantClientInstance: SupabaseClient | null = null;

export const initTenantClient = (url: string, key: string) => {
  tenantClientInstance = createClient(url, key);
  localStorage.setItem('tenant_url', url);
  localStorage.setItem('tenant_key', key);
  return tenantClientInstance;
};

export const clearTenantClient = () => {
  tenantClientInstance = null;
  localStorage.removeItem('tenant_url');
  localStorage.removeItem('tenant_key');
};

const getTenant = () => {
  if (tenantClientInstance) return tenantClientInstance;
  const storedUrl = localStorage.getItem('tenant_url');
  const storedKey = localStorage.getItem('tenant_key');
  if (storedUrl && storedKey) {
    tenantClientInstance = createClient(storedUrl, storedKey);
    return tenantClientInstance;
  }
  return masterSupabase;
};

export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getTenant();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
}) as SupabaseClient;
