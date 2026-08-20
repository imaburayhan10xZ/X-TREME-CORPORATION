import { useSettings } from "@/contexts/SettingsContext";
import { getCurrencySymbol } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Plus, Edit2, Trash2, Loader2, Search, X, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function UsersPage() {
  const { settings } = useSettings();
  const currencySymbol = getCurrencySymbol(settings.currency);
  const [users, setUsers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const navigate = useNavigate();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    sid: "", full_name: "", mobile: "", email: "", license_key: "", package_id: "", status: "active", total_paid: "0", total_due: "0", next_obb_fee_date: ""
  });

  const handlePackageChange = (e: any) => {
    const pkgId = e.target.value;
    const pkg = packages.find(p => p.id === pkgId);
    
    setFormData(prev => {
      let nextDate = prev.next_obb_fee_date;
      if (pkg && pkg.obb_fee_duration_days) {
        const date = new Date();
        date.setDate(date.getDate() + pkg.obb_fee_duration_days);
        nextDate = date.toISOString().split('T')[0];
      }
      return {
        ...prev,
        package_id: pkgId,
        next_obb_fee_date: nextDate
      };
    });
  };

  const handleDaysChange = (e: any) => {
    const days = parseInt(e.target.value);
    if (!isNaN(days)) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      setFormData(prev => ({ ...prev, next_obb_fee_date: date.toISOString().split('T')[0] }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [uData, pData] = await Promise.all([
        api.getUsers(),
        api.getPackages()
      ]);
      setUsers(uData || []);
      setPackages(pData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function requestDeleteUser(id: string) {
    setUserToDelete(id);
    setShowConfirm(true);
  }

  async function deleteUser() {
    if (!userToDelete) return;
    try {
      await api.deleteUser(userToDelete);
      toast.success("User deleted successfully!");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Error deleting user");
    } finally {
      setUserToDelete(null);
    }
  }
  
  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        total_paid: Number(formData.total_paid) || 0,
        total_due: Number(formData.total_due) || 0,
        next_obb_fee_date: formData.next_obb_fee_date ? new Date(formData.next_obb_fee_date).toISOString() : null
      };
      
      if (editingUser) {
        await api.updateUser(editingUser.id, payload);
        toast.success("User updated successfully!");
      } else {
        await api.createUser(payload);
        toast.success("User created successfully!");
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving user');
    }
  }
  
  function openModal(user?: any) {
    if (user) {
      setEditingUser(user);
      setFormData({
        sid: user.sid, 
        full_name: user.full_name, 
        mobile: user.mobile, 
        email: user.email || "", 
        license_key: user.license_key, 
        package_id: user.package_id || "", 
        status: user.status,
        total_paid: user.total_paid?.toString() || "0",
        total_due: user.total_due?.toString() || "0",
        next_obb_fee_date: user.next_obb_fee_date ? new Date(user.next_obb_fee_date).toISOString().split('T')[0] : ""
      });
    } else {
      setEditingUser(null);
      setFormData({
        sid: "", full_name: "", mobile: "", email: "", license_key: "", package_id: "", status: "active", total_paid: "0", total_due: "0", next_obb_fee_date: ""
      });
    }
    setShowModal(true);
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.sid?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile?.includes(search)
  );

  return (
    <Layout title="User Management">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">No users found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4">Name / SID</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Expiry / Next OBB</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Financial</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{user.full_name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-1">{user.sid}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5" title="License Key">{user.license_key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{user.mobile}</div>
                      {user.email && <div className="text-[11px] text-slate-500 mt-1">{user.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {user.packages ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: user.packages.color_label + '20', color: user.packages.color_label }}>
                          {user.packages.name}
                        </span>
                      ) : <span className="text-xs text-slate-400">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      {user.subscription_expiry ? (
                        <div className={`text-sm ${new Date(user.subscription_expiry) < new Date() ? 'text-rose-600 font-bold' : 'text-slate-600'}`} title="Subscription Expiry">
                          Exp: {new Date(user.subscription_expiry).toLocaleDateString()}
                        </div>
                      ) : <div className="text-xs text-slate-400">Exp: N/A</div>}
                      {user.next_obb_fee_date && (
                        <div className={`text-xs mt-1 ${new Date(user.next_obb_fee_date) < new Date() ? 'text-rose-600 font-bold' : 'text-indigo-600'}`} title="Next OBB Fee Date">
                          OBB: {new Date(user.next_obb_fee_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                        user.status === 'expired' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="text-slate-500">Paid:</span> <span className="font-bold text-emerald-600">{currencySymbol}{user.total_paid || 0}</span>
                      </div>
                      <div className="text-xs mt-1">
                        <span className="text-slate-500">Due:</span> <span className="font-bold text-rose-600">{currencySymbol}{user.total_due || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewUser(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => requestDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {viewUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Full Name</h4>
                  <p className="text-sm font-bold text-slate-900">{viewUser.full_name}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">SID</h4>
                  <p className="text-sm font-mono text-slate-700">{viewUser.sid}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">License Key</h4>
                  <p className="text-sm font-mono text-slate-700">{viewUser.license_key}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Contact</h4>
                  <p className="text-sm text-slate-700">{viewUser.mobile}</p>
                  {viewUser.email && <p className="text-sm text-slate-500">{viewUser.email}</p>}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Package</h4>
                  <p className="text-sm text-slate-700">{viewUser.packages?.name || 'None'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold inline-block mt-1 ${
                        viewUser.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                        viewUser.status === 'expired' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {viewUser.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Financials</h4>
                  <p className="text-sm text-slate-700">Paid: <span className="font-bold text-emerald-600">{currencySymbol}{viewUser.total_paid || 0}</span></p>
                  <p className="text-sm text-slate-700 mt-1">Due: <span className="font-bold text-rose-600">{currencySymbol}{viewUser.total_due || 0}</span></p>
                  {viewUser.next_obb_fee_date && (
                    <p className="text-sm text-slate-700 mt-1">Next OBB: <span className="font-bold text-indigo-600">{new Date(viewUser.next_obb_fee_date).toLocaleDateString()}</span></p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Quick Actions</h4>
                <div className="flex gap-3">
                  <button onClick={() => { setViewUser(null); navigate('/payments'); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition">Record Payment</button>
                  <button onClick={() => { setViewUser(null); navigate('/renewals'); }} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg hover:bg-emerald-100 transition">Process Renewal</button>
                  <button onClick={() => { setViewUser(null); openModal(viewUser); }} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition border border-slate-200">Edit User</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SID</label>
                  <input required type="text" value={formData.sid} onChange={e => setFormData({...formData, sid: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. SID-12345" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                  <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile</label>
                  <input required type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">License Key</label>
                  <input required type="text" value={formData.license_key} onChange={e => setFormData({...formData, license_key: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Package</label>
                  <select value={formData.package_id} onChange={handlePackageChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Select Package</option>
                    {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Paid ({currencySymbol})</label>
                  <input type="number" step="0.01" value={formData.total_paid} onChange={e => setFormData({...formData, total_paid: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Due ({currencySymbol})</label>
                  <input type="number" step="0.01" value={formData.total_due} onChange={e => setFormData({...formData, total_due: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Auto-set OBB in (Days)</label>
                    <input type="number" onChange={handleDaysChange} placeholder="e.g. 90" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Next OBB Fee Date</label>
                    <input type="date" value={formData.next_obb_fee_date} onChange={e => setFormData({...formData, next_obb_fee_date: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove associated records."
        onConfirm={deleteUser}
        onCancel={() => setShowConfirm(false)}
      />
    </Layout>
  );
}
