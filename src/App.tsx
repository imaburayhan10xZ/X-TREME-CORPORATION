/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import PackagesPage from "@/pages/Packages";
import PaymentsPage from "@/pages/Payments";
import RenewalsPage from "@/pages/Renewals";
import OBBFeesPage from "@/pages/OBBFees";
import ReportsPage from "@/pages/Reports";
import PaymentAlertsPage from "@/pages/PaymentAlerts";
import ActivityLogsPage from "@/pages/ActivityLogs";
import SettingsPage from "@/pages/Settings";
import LoginPage from "@/pages/Login";

import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/contexts/SettingsContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/packages" element={<ProtectedRoute><PackagesPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/renewals" element={<ProtectedRoute><RenewalsPage /></ProtectedRoute>} />
          <Route path="/obb-fees" element={<ProtectedRoute><OBBFeesPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><PaymentAlertsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}
