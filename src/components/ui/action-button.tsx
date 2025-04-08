
import React from 'react';
import { Button } from '@/components/ui/button';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, PenSquare, Trash2 } from 'lucide-react';

const actionButtonVariants = cva(
  "inline-flex items-center justify-center gap-2",
  {
    variants: {
      action: {
        view: "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
        edit: "text-amber-600 hover:text-amber-800 hover:bg-amber-50",
        delete: "text-destructive hover:text-destructive/90 hover:bg-destructive/10",
      },
    },
    defaultVariants: {
      action: "view",
    },
  }
);

export interface ActionButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  action: "view" | "edit" | "delete";
  label?: string;
  iconOnly?: boolean;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, action, label, iconOnly = false, ...props }, ref) => {
    // Map actions to icons
    const icons = {
      view: <Eye className="h-4 w-4" />,
      edit: <PenSquare className="h-4 w-4" />,
      delete: <Trash2 className="h-4 w-4" />
    };

    // Map actions to screen reader text
    const srLabels = {
      view: "Ver detalhes",
      edit: "Editar",
      delete: "Excluir"
    };

    // Decide whether to render just icon or icon with text
    if (iconOnly) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className={cn(actionButtonVariants({ action }), className)}
          ref={ref}
          {...props}
        >
          {icons[action]}
          <span className="sr-only">{label || srLabels[action]}</span>
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(actionButtonVariants({ action }), className)}
        ref={ref}
        {...props}
      >
        {icons[action]}
        <span>{label || srLabels[action]}</span>
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export { ActionButton, actionButtonVariants };
