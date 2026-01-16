interface SuiteCardRoutesListProps {
  routes: string[];
}

export function SuiteCardRoutesList({ routes }: SuiteCardRoutesListProps) {
  const routesLength = routes?.length ?? 0;
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          {`Routes (${routesLength})`}
        </span>
      </div>
      <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
        {routes.map((route) => (
          <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <code className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {route}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
