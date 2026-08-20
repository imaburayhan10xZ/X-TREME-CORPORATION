import { useState, useEffect } from "react";
import { masterSupabase, initTenantClient, supabase } from "@/lib/supabase";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Authenticate with Master Database
    const { data: masterAuthData, error: masterAuthError } = await masterSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (masterAuthError) {
      setError(masterAuthError.message);
      setLoading(false);
      return;
    }

    // 2. Fetch Tenant Config
    const { data: tenantData, error: tenantError } = await masterSupabase
      .from('tenants_registry')
      .select('*')
      .eq('email', email)
      .single();

    if (tenantError || !tenantData) {
      // Allow root admin login if they don't have a tenant record
      if (email === 'admin@xtcorp.com' || email.includes('admin')) {
         navigate('/');
      } else {
         setError("Tenant configuration not found for this account.");
         await masterSupabase.auth.signOut();
      }
      setLoading(false);
      return;
    }

    // 3. Initialize Tenant Client
    initTenantClient(tenantData.tenant_url, tenantData.tenant_key);

    // 4. Authenticate with Tenant Database (so RLS works)
    const { error: tenantAuthError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (tenantAuthError) {
      setError("Failed to authenticate with tenant database: " + tenantAuthError.message);
      setLoading(false);
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
