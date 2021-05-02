import { atom } from 'jotai'

export const atomWithLocalStorage = (key, initialValue) => {
  const getInitialValue = () => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      if (item !== null) {
        return JSON.parse(item)
      }
      return initialValue
    }else{
      return initialValue
    }
  }
  const baseAtom = atom(getInitialValue())
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(nextValue))
      }
    }
  )
  return derivedAtom
}