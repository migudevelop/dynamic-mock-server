import type { PropsWithChildren, ReactNode } from "react";

interface SettingSectionProps extends PropsWithChildren {
  title: string;
  icon: ReactNode;
}

export function SettingSection({ title, icon, children }: SettingSectionProps) {
  return (
    <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-3 p-6">{children}</div>
    </section>
  );
}
