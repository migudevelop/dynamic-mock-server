import { PlusIcon, Trash2Icon } from "lucide-react";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { cn } from "@/helpers/shadcn/utils";
import type { RouteResponseDto } from "@/types/route.types";

interface VariantSidebarProps {
  /** All available response variants */
  variants: RouteResponseDto[];
  /** ID of the currently selected variant */
  selectedVariantId: string | null;
  /** Called when user clicks a variant */
  onSelect: (variantId: string) => void;
  /** Called when user clicks the "add variant" button */
  onAdd: () => void;
  /** Called when user clicks the trash button on a variant. Undefined means no delete available. */
  onRemove?: (variantId: string) => void;
  /** Whether deletion is currently disabled (e.g. only one variant left) */
  canRemove?: boolean;
}

/**
 * Left-side panel listing all response variants for a route.
 * Lets the user select a variant to edit and add new ones.
 */
export function VariantSidebar({
  variants,
  selectedVariantId,
  onSelect,
  onAdd,
  onRemove,
  canRemove = true,
}: VariantSidebarProps) {
  return (
    <aside className="flex flex-col gap-1 w-52 min-w-52 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Variants
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={onAdd}
          aria-label="Add variant"
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>

      {/* Variant list */}
      <div className="flex flex-col gap-0.5">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors w-full",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-foreground",
              )}
            >
              {/* Active dot */}
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  isSelected
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground/30",
                )}
              />
              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                <span className="text-sm font-medium truncate leading-none">
                  {variant.id}
                </span>
                {variant.status != null && (
                  <Badge
                    variant={isSelected ? "outline" : "secondary"}
                    className={cn(
                      "self-start text-[10px] px-1.5 py-0 h-4 font-mono",
                      isSelected &&
                        "border-primary-foreground/40 text-primary-foreground",
                    )}
                  >
                    {variant.status}
                  </Badge>
                )}
              </div>
              {onRemove && (
                <button
                  type="button"
                  aria-label={`Delete variant ${variant.id}`}
                  disabled={!canRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(variant.id);
                  }}
                  className={cn(
                    "shrink-0 size-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                    isSelected
                      ? "hover:bg-primary-foreground/20 text-primary-foreground"
                      : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                    !canRemove &&
                      "cursor-not-allowed opacity-30 group-hover:opacity-30",
                  )}
                >
                  <Trash2Icon className="size-3" />
                </button>
              )}
            </button>
          );
        })}

        {variants.length === 0 && (
          <div className="flex items-center justify-center py-6 rounded-md border border-dashed border-border">
            <p className="text-xs text-muted-foreground">No variants yet.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
