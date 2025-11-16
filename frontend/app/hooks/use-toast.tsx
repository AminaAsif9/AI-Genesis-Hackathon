import * as React from "react";
import { toast as sonnerToast } from "sonner";

import type { ToasterProps } from "sonner";

type ToasterToast = ToasterProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
};

type Toast = Omit<ToasterToast, "id">;

function toast({ title, description, ...props }: Toast) {
  // Use Sonner's toast function directly
  if (description) {
    return sonnerToast(title as string, {
      description: description as string,
      ...props,
    });
  } else {
    return sonnerToast(title as string, props);
  }
}

function useToast() {
  return {
    toast,
    // Keep the interface compatible but these are no-ops now
    toasts: [],
    dismiss: () => {},
  };
}

export { useToast, toast };