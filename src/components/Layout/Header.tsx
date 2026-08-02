export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      <h1 className="text-sm font-bold text-slate-900 tracking-tight uppercase">{title}</h1>
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search..."
          className="pl-4 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs w-64 focus:ring-2 focus:ring-indigo-500"
        />
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
      </div>
    </header>
  );
}
