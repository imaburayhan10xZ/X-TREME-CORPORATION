import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Plus, Search, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function OBBFeesPage() {
  const [obbs, setObbs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "", amount: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [oData, uData] = await Promise.all([
        api.getOBBPayments(),
        api.getUsers()
      ]);
      setObbs(oData || []);
      setUsers(uData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createOBBPayment({
        ...formData,
        amount: Number(formData.amount)
      });
      setShowModal(false);
      setFormData({ user_id: "", amount: "" });
      toast.success("OBB Payment recorded successfully!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error recording OBB payment');
    }
  }

  const filteredObbs = obbs.filter(o => 
    o.users?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="OBB Fee Management">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Record OBB Payment
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : filteredObbs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">No OBB payments found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredObbs.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{o.users?.full_name || 'Unknown'}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">${o.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold">PAID</span>
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
              <h3 className="font-bold text-lg">Record OBB Payment</h3>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount Paid ($)</label>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
                  Save OBB Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
