import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-row justify-between">
      <h2 className="text-3xl font-extrabold tracking-tight mb-2">{title}</h2>
      {actions && <div className="flex flex-row gap-3">{actions}</div>}
    </div>
  );
}
