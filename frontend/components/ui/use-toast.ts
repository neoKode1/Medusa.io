import * as React from "react"

const TOAST_LIMIT = 1

type ToastActionElement = React.ReactElement<{
  altText: string
  onClick: () => void
}>

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
}

interface State {
  toasts: Toast[]
}

export const reducer = (state: State, action: { type: "ADD_TOAST" | "REMOVE_TOAST", toast?: Toast, toastId?: string }): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast!, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "REMOVE_TOAST":
      const { toastId } = action

      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: { type: "ADD_TOAST" | "REMOVE_TOAST", toast?: Toast, toastId?: string }) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export function toast({ ...props }: Omit<Toast, "id">) {
  const id = Math.random().toString(36).substring(2, 9)

  const update = (props: Toast) =>
    dispatch({
      type: "ADD_TOAST",
      toast: { ...props, id },
    })

  const dismiss = () => dispatch({ type: "REMOVE_TOAST", toastId: id })

  update(props as Toast)

  return {
    id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "REMOVE_TOAST", toastId }),
  }
} 