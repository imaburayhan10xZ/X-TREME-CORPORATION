import { useSettings } from "@/contexts/SettingsContext";
import { getCurrencySymbol } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Loader2, Download, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const { settings } = useSettings();
  const currencySymbol = getCurrencySymbol(settings.currency);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <Layout title="Reports">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  const exportCSV = () => {
    toast.error("Export feature will be implemented shortly.");
  };

  return (
    <Layout title="Reports & Analytics">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Business Overview</h2>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue</p>
            <h3 className="text-2xl font-black">{currencySymbol}{stats.totalPaid}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Monthly Revenue</p>
            <h3 className="text-2xl font-black">{currencySymbol}{stats.monthlyRevenue}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Users</p>
            <h3 className="text-2xl font-black">{stats.totalUsers}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Due</p>
            <h3 className="text-2xl font-black">{currencySymbol}{stats.totalDue}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Total Processed Payments</span>
              <span className="font-bold">{currencySymbol}{stats.totalPaid}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Total Outstanding Dues</span>
              <span className="font-bold text-rose-600">{currencySymbol}{stats.totalDue}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Active Subscriptions</span>
              <span className="font-bold text-emerald-600">{stats.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Expired Subscriptions</span>
              <span className="font-bold text-rose-600">{stats.expiredUsers}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Total Registered</span>
              <span className="font-bold">{stats.totalUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
