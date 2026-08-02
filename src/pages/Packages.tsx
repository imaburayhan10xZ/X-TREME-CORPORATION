import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Plus, Edit2, Trash2, Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [pkgToDelete, setPkgToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", price: "", duration_days: "", description: "", color_label: "#4f46e5", is_active: true, package_type: "regular", offer_price: "", obb_fee_amount: "0", obb_fee_duration_days: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await api.getPackages();
      setPackages(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function requestDeletePackage(id: string) {
    setPkgToDelete(id);
    setShowConfirm(true);
  }

  async function deletePackage() {
    if (!pkgToDelete) return;
    try {
      await api.deletePackage(pkgToDelete);
      toast.success("Package deleted successfully!");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Error deleting package");
    } finally {
      setPkgToDelete(null);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        duration_days: formData.package_type === 'permanent' ? null : Number(formData.duration_days),
        offer_price: formData.offer_price ? Number(formData.offer_price) : null,
        obb_fee_amount: formData.obb_fee_amount ? Number(formData.obb_fee_amount) : 0,
        obb_fee_duration_days: formData.obb_fee_duration_days ? Number(formData.obb_fee_duration_days) : null
      };
      
      if (editingPkg) {
        await api.updatePackage(editingPkg.id, payload);
        toast.success("Package updated successfully!");
      } else {
        await api.createPackage(payload);
        toast.success("Package created successfully!");
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving package');
    }
  }
  
  function openModal(pkg?: any) {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        name: pkg.name, price: pkg.price.toString(), duration_days: pkg.duration_days?.toString() || "", description: pkg.description || "", color_label: pkg.color_label || "#4f46e5", is_active: pkg.is_active, package_type: pkg.package_type || "regular", offer_price: pkg.offer_price ? pkg.offer_price.toString() : "", obb_fee_amount: pkg.obb_fee_amount?.toString() || "0", obb_fee_duration_days: pkg.obb_fee_duration_days?.toString() || ""
      });
    } else {
      setEditingPkg(null);
      setFormData({
        name: "", price: "", duration_days: "", description: "", color_label: "#4f46e5", is_active: true, package_type: "regular", offer_price: "", obb_fee_amount: "0", obb_fee_duration_days: ""
      });
    }
    setShowModal(true);
  }

  const filteredPackages = packages.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Package Management">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : filteredPackages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">No packages found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4">Package Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">OBB Fee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pkg.color_label }}></div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{pkg.name}</div>
                          {pkg.description && <div className="text-[11px] text-slate-500 mt-0.5">{pkg.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 capitalize">{pkg.package_type || 'Regular'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">${pkg.offer_price ? pkg.offer_price : pkg.price}</div>
                      {pkg.offer_price && <div className="text-[10px] text-slate-400 line-through">${pkg.price}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {pkg.package_type === 'permanent' ? <span className="font-bold text-indigo-600">Lifetime</span> : `${pkg.duration_days} Days`}
                    </td>
                    <td className="px-6 py-4">
                      {pkg.obb_fee_amount > 0 ? (
                        <div className="text-sm">
                          <span className="font-bold text-rose-600">${pkg.obb_fee_amount}</span>
                          <span className="text-slate-500 text-xs ml-1">after {pkg.obb_fee_duration_days}d</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        pkg.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {pkg.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(pkg)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => requestDeletePackage(pkg.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
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
              <h3 className="font-bold text-lg">{editingPkg ? 'Edit Package' : 'Add New Package'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Package Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Package Type</label>
                  <select required value={formData.package_type} onChange={e => setFormData({...formData, package_type: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="regular">Regular</option>
                    <option value="trial">Trial</option>
                    <option value="permanent">Permanent</option>
                    <option value="offer">Special Offer</option>
                  </select>
                </div>
                {formData.package_type !== 'permanent' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration (Days)</label>
                    <input required type="number" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Regular Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Offer Price (Optional $)</label>
                  <input type="number" step="0.01" value={formData.offer_price} onChange={e => setFormData({...formData, offer_price: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Leave empty if no offer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">OBB Fee Amount ($)</label>
                  <input type="number" step="0.01" value={formData.obb_fee_amount} onChange={e => setFormData({...formData, obb_fee_amount: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">OBB Fee Interval (Days)</label>
                  <input type="number" value={formData.obb_fee_duration_days} onChange={e => setFormData({...formData, obb_fee_duration_days: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="E.g., 30" />
                </div>
                <div className="col-span-2 flex gap-6 items-center">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Color Label</label>
                    <div className="flex gap-2">
                      <input type="color" value={formData.color_label} onChange={e => setFormData({...formData, color_label: e.target.value})} className="h-9 w-12 cursor-pointer border-0 p-0" />
                      <input type="text" value={formData.color_label} onChange={e => setFormData({...formData, color_label: e.target.value})} className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Active Package</label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description (Optional)</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
                  {editingPkg ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        onConfirm={deletePackage}
        onCancel={() => setShowConfirm(false)}
      />
    </Layout>
  );
}
