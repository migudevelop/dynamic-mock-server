import type { ReactNode } from "react";

interface PageHeaderProps {
  /** The main heading text */
  title: string;
  /** Optional subtitle displayed below the title */
  description?: string;
  /** Optional action elements rendered to the right of the title */
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-row justify-between">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-row gap-3">{actions}</div>}
    </div>
  );
}
