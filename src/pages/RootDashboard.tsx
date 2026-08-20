import { useState, useEffect } from "react";
import { masterSupabase, initTenantClient } from "@/lib/supabase";
import { Plus, Database, ShieldAlert, Loader2, Edit2, Trash2, LogIn, X, Search, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function RootDashboardPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    password: "", // Only used for creation
    tenant_url: "",
    tenant_key: "",
    status: "active",
    plan: "pro",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await masterSupabase.from('tenants_registry').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error("Failed to load tenants");
    } else {
      setTenants(data || []);
    }
    setLoading(false);
  };

  const openModal = (tenant: any = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        business_name: tenant.business_name,
        email: tenant.email,
        password: "", // Leave empty for edit
        tenant_url: tenant.tenant_url,
        tenant_key: tenant.tenant_key,
        status: tenant.status || 'active',
        plan: tenant.plan || 'pro',
      });
    } else {
      setEditingTenant(null);
      setFormData({
        business_name: "",
        email: "",
        password: "",
        tenant_url: "",
        tenant_key: "",
        status: "active",
        plan: "pro",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTenant) {
        // Edit existing tenant
        const { error: dbError } = await masterSupabase
          .from('tenants_registry')
          .update({
            business_name: formData.business_name,
            email: formData.email,
            tenant_url: formData.tenant_url,
            tenant_key: formData.tenant_key,
            status: formData.status,
            plan: formData.plan
          })
          .eq('id', editingTenant.id);

        if (dbError) throw dbError;
        toast.success("Tenant updated successfully");
      } else {
        // Create new user in Master Auth
        const { data: authData, error: authError } = await masterSupabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;
        const userId = authData.user?.id;

        // Insert into tenants_registry
        const { error: dbError } = await masterSupabase.from('tenants_registry').insert([{
          user_id: userId,
          business_name: formData.business_name,
          email: formData.email,
          tenant_url: formData.tenant_url,
          tenant_key: formData.tenant_key,
          status: formData.status,
          plan: formData.plan
        }]);

        if (dbError) throw dbError;
        toast.success("New Tenant Provisioned Successfully");
      }

      setShowModal(false);
      fetchTenants();
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you absolutely sure? This removes their mapping from the master database!")) return;
    const { error } = await masterSupabase.from('tenants_registry').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete tenant");
    } else {
      toast.success("Tenant removed from registry");
      fetchTenants();
    }
  };

  const loginAsTenant = async (tenant: any) => {
    try {
       initTenantClient(tenant.tenant_url, tenant.tenant_key);
       toast.success(`Logging into ${tenant.business_name}...`);
       
       // In a real scenario with strict RLS, root admin needs the tenant password 
       // to authenticate into the tenant DB, OR the tenant DB allows root access via 
       // a special JWT. For this boilerplate, since root initialized the client with 
       // anon key, they'll need to re-auth in the main app if session checks apply, 
       // or we bypass session checks for root. Let's redirect to login for them to use tenant creds,
       // OR we can just redirect to / and see if the anon key allows access (it usually won't if RLS is on).
       // A quick hack for root dev without password is not possible via anon key. 
       // But we initialized the client, so they can log in via normal login page using tenant email/pass.
       navigate("/login");
    } catch (e) {
       toast.error("Failed to assume tenant identity");
    }
  };

  const handleLogout = async () => {
    await masterSupabase.auth.signOut();
    navigate("/root-login");
  };

  const filteredTenants = tenants.filter(t => 
    t.business_name.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Navbar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h1 className="font-bold text-white tracking-tight">X-TREME <span className="text-rose-500">ROOT</span></h1>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-400 hover:text-white transition">
            Terminate Session
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Tenants</h3>
            <p className="text-3xl font-black text-white">{tenants.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active</h3>
            <p className="text-3xl font-black text-emerald-500">{tenants.filter(t => t.status === 'active').length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Suspended</h3>
            <p className="text-3xl font-black text-rose-500">{tenants.filter(t => t.status === 'suspended').length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">System Status</h3>
            <div className="flex items-center gap-2 text-emerald-500 mt-2">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="font-bold">Operational</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search tenants..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
          <button 
            onClick={() => openModal()} 
            className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          >
            <Plus className="w-4 h-4" /> Add Tenant
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tenant Database</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No tenants found.
                    </td>
                  </tr>
                ) : filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-800/50 transition group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{tenant.business_name}</div>
                      <div className="text-xs text-slate-500">{tenant.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-300">
                        {tenant.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {(tenant.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-mono text-slate-400 truncate max-w-[150px]" title={tenant.tenant_url}>
                          {tenant.tenant_url.replace('https://', '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => loginAsTenant(tenant)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition" title="Login as Tenant">
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal(tenant)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(tenant.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h2 className="font-bold text-lg text-white">{editingTenant ? 'Edit Tenant' : 'Provision New Tenant'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Business Name</label>
                  <input required type="text" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Owner Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  {!editingTenant && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                      <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Plan</label>
                    <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none">
                      <option value="free">Free Plan</option>
                      <option value="pro">Pro Plan</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none">
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" /> Database Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tenant Supabase URL</label>
                      <input required type="url" value={formData.tenant_url} onChange={e => setFormData({...formData, tenant_url: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tenant Anon Key</label>
                      <input required type="text" value={formData.tenant_key} onChange={e => setFormData({...formData, tenant_key: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="eyJhb..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-700 transition flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTenant ? 'Save Changes' : 'Provision Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
