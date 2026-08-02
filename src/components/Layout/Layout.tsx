import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1">
        <Header title={title} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
