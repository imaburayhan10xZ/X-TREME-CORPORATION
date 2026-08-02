import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { api } from "@/lib/api";
import { Loader2, Users, CreditCard, Activity, Package, AlertCircle, RefreshCw } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      
      const payments = await api.getPayments();
      setRecentPayments(payments.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  if (loading || !stats) {
    return (
      <Layout title="Overview Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  // Mock chart data for now, ideally derived from real payments
  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: stats.monthlyRevenue || 7000 },
  ];

  return (
    <Layout title="Overview Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-5 h-5 text-indigo-600" />} color="border-l-indigo-500" />
        <StatCard title="Active Subs" value={stats.activeUsers} icon={<Activity className="w-5 h-5 text-emerald-600" />} color="border-l-emerald-500" />
        <StatCard title="Expired Subs" value={stats.expiredUsers} icon={<AlertCircle className="w-5 h-5 text-rose-600" />} color="border-l-rose-500" />
        <StatCard title="Monthly Revenue" value={`$${stats.monthlyRevenue}`} icon={<CreditCard className="w-5 h-5 text-indigo-600" />} color="border-l-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Revenue Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Recent Payments</h2>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {recentPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No recent payments</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{p.users?.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium">{p.payment_method}</span>
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="font-bold text-emerald-600">${p.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 ${color} flex justify-between items-start`}>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}
