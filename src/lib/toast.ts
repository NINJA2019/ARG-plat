type Listener = (message: string) => void

let listener: Listener | null = null

export function onToast(fn: Listener) {
  listener = fn
  return () => { listener = null }
}

export function showToast(message: string) {
  if (listener) {
    listener(message)
  }
}
