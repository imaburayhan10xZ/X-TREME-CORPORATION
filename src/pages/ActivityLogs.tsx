import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const data = await api.getActivityLogs();
        setLogs(data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <Layout title="Activity Logs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg">System Activity</h2>
          <p className="text-xs text-slate-500 mt-1">Showing the 50 most recent actions</p>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">No activity logs found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Admin</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4 w-1/2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{l.admins?.full_name || 'System / API'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-700">{l.action}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{l.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
