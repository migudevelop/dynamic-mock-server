import type { ReactNode } from "react";

interface PageHeaderProps {
  /** The main heading content — can be a string or JSX */
  title: ReactNode;
  /** Optional subtitle displayed below the title */
  description?: string;
  /** Optional action elements rendered to the right of the title */
  actions?: ReactNode;
}

/**
 * Generic page header with title, description, and optional actions.
 *
 * @param title - Heading content (string or JSX)
 * @param description - Optional subtitle
 * @param actions - Optional buttons / badges rendered on the right
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between flex-1 min-w-0 gap-4">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight leading-none">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-row items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
