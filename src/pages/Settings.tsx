import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Loader2, Save } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useSettings } from "@/contexts/SettingsContext";

export default function SettingsPage() {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings({
      companyName: globalSettings.company_name || "X-TREME CORPORATION",
      currency: globalSettings.currency || "USD",
      timezone: globalSettings.timezone || "UTC",
      theme: globalSettings.theme || "light"
    });
    setLoading(false);
  }, [globalSettings]);

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSetting("company_name", settings.companyName);
      await api.updateSetting("currency", settings.currency);
      await api.updateSetting("timezone", settings.timezone);
      await api.updateSetting("theme", settings.theme);
      await refreshSettings();
      toast.success("Settings saved successfully.");
    } catch (error) {
      toast.error("Error saving settings.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Layout title="System Settings">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Settings">
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-lg">General Settings</h2>
            <p className="text-xs text-slate-500 mt-1">Manage global system configurations</p>
          </div>
          <form onSubmit={handleSave} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={settings.companyName} 
                  onChange={e => setSettings({...settings, companyName: e.target.value})} 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none max-w-md" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Currency</label>
                  <select 
                    value={settings.currency} 
                    onChange={e => setSettings({...settings, currency: e.target.value})} 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="BDT">BDT (৳)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timezone</label>
                  <select 
                    value={settings.timezone} 
                    onChange={e => setSettings({...settings, timezone: e.target.value})} 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Asia/Dhaka">Asia/Dhaka</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Theme Preference</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={e => setSettings({...settings, theme: e.target.value})} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium">Light Mode</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={e => setSettings({...settings, theme: e.target.value})} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button disabled={saving} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
