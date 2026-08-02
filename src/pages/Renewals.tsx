import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { RefreshCw, Search, Loader2, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "", package_id: "", amount: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [rData, uData, pData] = await Promise.all([
        api.getRenewals(),
        api.getUsers(),
        api.getPackages()
      ]);
      setRenewals(rData || []);
      setUsers(uData || []);
      setPackages(pData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  // Auto-fill amount based on package selection
  useEffect(() => {
    if (formData.package_id) {
      const pkg = packages.find(p => p.id === formData.package_id);
      if (pkg) {
        setFormData(prev => ({ ...prev, amount: pkg.price.toString() }));
      }
    }
  }, [formData.package_id, packages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createRenewal({
        ...formData,
        amount: Number(formData.amount)
      });
      setShowModal(false);
      setFormData({ user_id: "", package_id: "", amount: "" });
      toast.success("Renewal recorded successfully!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error recording renewal');
    }
  }

  const filteredRenewals = renewals.filter(r => 
    r.users?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    r.packages?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Renewal Management">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search renewals..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
            <RefreshCw className="w-4 h-4" /> New Renewal
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : filteredRenewals.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">No renewals found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Amount Added to Due</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRenewals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{r.users?.full_name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-700">{r.packages?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-600">+${r.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 font-bold text-xs hover:underline">View User</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">Process Renewal</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select User</label>
                  <select required value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">-- Choose User --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.sid})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Package</label>
                  <select required value={formData.package_id} onChange={e => setFormData({...formData, package_id: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">-- Choose Package --</option>
                    {packages.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price} for {p.duration_days} days)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount to Add to Due ($)</label>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" />
                  <p className="text-xs text-slate-500 mt-2">This amount will be added to the user's Total Due balance. Expiry will be automatically extended.</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
