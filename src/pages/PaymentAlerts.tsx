import { useSettings } from "@/contexts/SettingsContext";
import { getCurrencySymbol } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Loader2, AlertCircle, Clock, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";

export default function PaymentAlertsPage() {
  const [alerts, setAlerts] = useState<any>({ dues: [], upcomingObb: [], expiring: [] });
  const { settings } = useSettings();
  const currencySymbol = getCurrencySymbol(settings.currency);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchAlerts();
  }, []);

  return (
    <Layout title="Payment & Expiration Alerts">
      <div className="space-y-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Due Payments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-rose-100 bg-rose-50 flex items-center gap-3 text-rose-700">
              <CreditCard className="w-5 h-5" />
              <div>
                <h2 className="font-bold">Unpaid Dues</h2>
                <p className="text-[10px] uppercase font-bold opacity-70">{alerts.dues.length} users with balances</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {loading ? <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-rose-600" /></div> : alerts.dues.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No pending dues.</p> : null}
              {alerts.dues.map((user: any) => (
                <div key={user.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                      <p className="text-xs font-mono text-slate-500">{user.sid}</p>
                    </div>
                    <span className="font-bold text-rose-600">{currencySymbol}{user.total_due}</span>
                  </div>
                  <Link to={`/payments?user={currencySymbol}{user.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Record Payment &rarr;</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming OBB Fees */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-amber-100 bg-amber-50 flex items-center gap-3 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <h2 className="font-bold">Upcoming OBB Fees</h2>
                <p className="text-[10px] uppercase font-bold opacity-70">Next 7 days ({alerts.upcomingObb.length})</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {loading ? <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-amber-600" /></div> : alerts.upcomingObb.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No upcoming OBB fees.</p> : null}
              {alerts.upcomingObb.map((user: any) => (
                <div key={user.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                      <p className="text-xs text-slate-500">Due: <span className="font-bold text-amber-600">{new Date(user.next_obb_fee_date).toLocaleDateString()}</span></p>
                    </div>
                    <span className="font-bold text-slate-700">{currencySymbol}{user.packages?.obb_fee_amount || 0}</span>
                  </div>
                  <Link to={`/obb-fees?user={currencySymbol}{user.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Process OBB &rarr;</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring Subscriptions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-indigo-100 bg-indigo-50 flex items-center gap-3 text-indigo-700">
              <Clock className="w-5 h-5" />
              <div>
                <h2 className="font-bold">Expiring Packages</h2>
                <p className="text-[10px] uppercase font-bold opacity-70">Next 7 days ({alerts.expiring.length})</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {loading ? <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-600" /></div> : alerts.expiring.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No expiring users.</p> : null}
              {alerts.expiring.map((user: any) => (
                <div key={user.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                      <p className="text-xs text-slate-500">Expires: <span className="font-bold text-indigo-600">{new Date(user.subscription_expiry).toLocaleDateString()}</span></p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-700 rounded">{user.packages?.name}</span>
                  </div>
                  <Link to={`/renewals?user={currencySymbol}{user.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Renew Package &rarr;</Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
