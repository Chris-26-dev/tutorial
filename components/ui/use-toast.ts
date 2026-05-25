"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const toastLimit = 3;
const toastRemoveDelay = 5000;

type ToastToaster = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastInput = Omit<ToastToaster, "id">;

interface State {
  toasts: ToastToaster[];
}

const actionTypes = {
  addToast: "ADD_TOAST",
  updateToast: "UPDATE_TOAST",
  dismissToast: "DISMISS_TOAST",
  removeToast: "REMOVE_TOAST"
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | {
      type: typeof actionTypes.addToast;
      toast: ToastToaster;
    }
  | {
      type: typeof actionTypes.updateToast;
      toast: Partial<ToastToaster>;
    }
  | {
      type: typeof actionTypes.dismissToast;
      toastId?: string;
    }
  | {
      type: typeof actionTypes.removeToast;
      toastId?: string;
    };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: actionTypes.removeToast, toastId });
  }, toastRemoveDelay);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.addToast:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, toastLimit)
      };
    case actionTypes.updateToast:
      return {
        ...state,
        toasts: state.toasts.map((toast) => (toast.id === action.toast.id ? { ...toast, ...action.toast } : toast))
      };
    case actionTypes.dismissToast: {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      }

      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === toastId || toastId === undefined
            ? {
                ...toast,
                open: false
              }
            : toast
        )
      };
    }
    case actionTypes.removeToast:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: []
        };
      }

      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId)
      };
  }
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

export function toast({ ...props }: ToastInput) {
  const id = genId();

  const update = (nextProps: Partial<ToastToaster>) =>
    dispatch({
      type: actionTypes.updateToast,
      toast: { ...nextProps, id }
    });
  const dismiss = () => dispatch({ type: actionTypes.dismissToast, toastId: id });

  dispatch({
    type: actionTypes.addToast,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss();
        }
      }
    }
  });

  return {
    id,
    dismiss,
    update
  };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.dismissToast, toastId })
  };
}
