import { supabase } from './supabase';

export const api = {
  // Packages
  getPackages: async () => {
    const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createPackage: async (pkg: any) => {
    const { data, error } = await supabase.from('packages').insert([pkg]).select();
    if (error) throw error;
    return data[0];
  },
  updatePackage: async (id: string, pkg: any) => {
    const { data, error } = await supabase.from('packages').update(pkg).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deletePackage: async (id: string) => {
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) throw error;
  },

  // Users
  getUsers: async () => {
    const { data, error } = await supabase.from('users').select('*, packages(name, color_label)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  getUser: async (id: string) => {
    const { data, error } = await supabase.from('users').select('*, packages(name, duration_days)').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  createUser: async (user: any) => {
    const { data, error } = await supabase.from('users').insert([user]).select();
    if (error) throw error;
    return data[0];
  },
  updateUser: async (id: string, user: any) => {
    const { data, error } = await supabase.from('users').update(user).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deleteUser: async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  // Payments
  getPayments: async () => {
    const { data, error } = await supabase.from('payments').select('*, users(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createPayment: async (payment: any, paymentType: string = 'general') => {
    const { data, error } = await supabase.from('payments').insert([payment]).select();
    if (error) throw error;
    
    // Update user total_paid and total_due
    const user = await api.getUser(payment.user_id);
    const newPaid = Number(user.total_paid || 0) + Number(payment.amount);
    const newDue = Number(user.total_due || 0) - Number(payment.amount);
    
    const updates: any = { 
      total_paid: newPaid, 
      total_due: newDue < 0 ? 0 : newDue,
      status: 'active' 
    };

    if (paymentType === 'obb_fee') {
      const pkg = await api.getPackages().then(res => res.find((p:any) => p.id === user.package_id));
      if (pkg && pkg.obb_fee_duration_days) {
        const currentDate = user.next_obb_fee_date ? new Date(user.next_obb_fee_date) : new Date();
        const baseDate = currentDate > new Date() ? currentDate : new Date();
        baseDate.setDate(baseDate.getDate() + pkg.obb_fee_duration_days);
        updates.next_obb_fee_date = baseDate.toISOString();
      }
      
      // Also record in obb_payments for history
      await supabase.from('obb_payments').insert([{
        user_id: payment.user_id,
        amount: payment.amount
      }]);
    }
    
    await api.updateUser(payment.user_id, updates);
    
    return data[0];
  },

  // Renewals
  getRenewals: async () => {
    const { data, error } = await supabase.from('renewals').select('*, users(full_name), packages(name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createRenewal: async (renewal: any) => {
    const { data, error } = await supabase.from('renewals').insert([renewal]).select();
    if (error) throw error;
    
    // Update user expiry date based on package
    const user = await api.getUser(renewal.user_id);
    const pkg = await api.getPackages().then(res => res.find((p:any) => p.id === renewal.package_id));
    
    if (pkg) {
      const currentExpiry = user.subscription_expiry ? new Date(user.subscription_expiry) : new Date();
      // If expired, start from today. If active, add to existing expiry.
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      baseDate.setDate(baseDate.getDate() + pkg.duration_days);
      
      const newDue = Number(user.total_due || 0) + Number(pkg.price);
      
      await api.updateUser(renewal.user_id, {
        subscription_expiry: baseDate.toISOString(),
        package_id: pkg.id,
        total_due: newDue,
        status: 'active'
      });
    }
    
    return data[0];
  },

  // OBB
  getOBBPayments: async () => {
    const { data, error } = await supabase.from('obb_payments').select('*, users(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createOBBPayment: async (obb: any) => {
    const { data, error } = await supabase.from('obb_payments').insert([obb]).select();
    if (error) throw error;
    return data[0];
  },

  // Alerts & Auto-Expire
  autoExpireUsers: async () => {
    const now = new Date().toISOString();
    
    // Check subscription expiry
    const { error: err1 } = await supabase
      .from('users')
      .update({ status: 'expired' })
      .lt('subscription_expiry', now)
      .eq('status', 'active');
      
    // Check next obb fee date
    const { error: err2 } = await supabase
      .from('users')
      .update({ status: 'expired' })
      .lt('next_obb_fee_date', now)
      .eq('status', 'active');
    
    if (err1) console.error("Error auto-expiring users (expiry):", err1);
    if (err2) console.error("Error auto-expiring users (obb):", err2);
  },

  getAlerts: async () => {
    await api.autoExpireUsers();

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    // Get dues
    const { data: dueUsers } = await supabase
      .from('users')
      .select('*, packages(name)')
      .gt('total_due', 0)
      .order('total_due', { ascending: false });

    // Get upcoming OBB
    const { data: obbUsers } = await supabase
      .from('users')
      .select('*, packages(name, obb_fee_amount)')
      .lte('next_obb_fee_date', nextWeek.toISOString())
      .gte('next_obb_fee_date', now.toISOString())
      .order('next_obb_fee_date', { ascending: true });
      
    // Get upcoming Expirations
    const { data: expiringUsers } = await supabase
      .from('users')
      .select('*, packages(name)')
      .lte('subscription_expiry', nextWeek.toISOString())
      .gte('subscription_expiry', now.toISOString())
      .order('subscription_expiry', { ascending: true });
      
    return {
      dues: dueUsers || [],
      upcomingObb: obbUsers || [],
      expiring: expiringUsers || []
    };
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const [usersRes, packagesRes, paymentsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('packages').select('*'),
      supabase.from('payments').select('*'),
    ]);
    
    const users = usersRes.data || [];
    const payments = paymentsRes.data || [];
    
    const now = new Date();
    const activeUsers = users.filter(u => u.subscription_expiry && new Date(u.subscription_expiry) > now).length;
    const expiredUsers = users.filter(u => !u.subscription_expiry || new Date(u.subscription_expiry) <= now).length;
    
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalDue = users.reduce((sum, u) => sum + Number(u.total_due || 0), 0);
    
    // Calculate Monthly Revenue (current month)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRevenue = payments
      .filter(p => {
        const d = new Date(p.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);
      
    return {
      totalUsers: users.length,
      activeUsers,
      expiredUsers,
      totalPaid,
      totalDue,
      monthlyRevenue
    };
  },

  // Activity Logs
  getActivityLogs: async () => {
    const { data, error } = await supabase.from('activity_logs').select('*, admins(full_name)').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data;
  },
  logActivity: async (action: string, description: string) => {
    // For now we skip admin_id since we don't have auth context, or we set it to null
    await supabase.from('activity_logs').insert([{ action, description }]);
  },

  // Settings
  getSettings: async () => {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    return data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
  },
  updateSetting: async (key: string, value: string) => {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  }
};
