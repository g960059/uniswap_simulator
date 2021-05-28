import { atom, WritableAtom } from 'jotai'
import { atomWithDefault } from 'jotai/utils'

// export const atomWithLocalStorage = <A>(key, initialValue) => {
//   const getInitialValue = async () => {
//     if (typeof window !== "undefined") {
//       const item = await localStorage.getItem(key)
//       console.log(key,item)
//       if (item !== null || item !== undefined) {
//         const parsedItem = JSON.parse(item)
//         console.log(key,parsedItem, initialValue)
//         if(parsedItem == undefined ||  parsedItem == null || parsedItem === Object && Object.keys(parsedItem).length ===0){
//           await localStorage.setItem(key, JSON.stringify(initialValue))
//           console.log('initial value is set')
//           return initialValue
//         }
//         return parsedItem
//       }else{
//         console.log(initialValue)
//         await localStorage.setItem(key, JSON.stringify(initialValue))
//       }
//       return initialValue
//     }else{
//       return initialValue
//     }
//   }
//   const baseAtom = atom(getInitialValue())
//   const derivedAtom = atom<A,A>(
//     (get) => {
//       console.log(baseAtom)
//       return get(baseAtom)
//     },
//     (get, set, update) => {
//       const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update
//       set(baseAtom, nextValue)
//       if (typeof window !== "undefined") {
//         localStorage.setItem(key, JSON.stringify(nextValue))
//       }
//     }
//   )
//   return derivedAtom
// }


// export const atomWithLocalStorageDefault = <A>(key, initialValue) => {
//   const getInitialValue = async () => {
//     if (typeof window !== "undefined") {
//       const item = await localStorage.getItem(key)
//       console.log(key,item)
//       if (item !== null || item !== undefined) {
//         const parsedItem = JSON.parse(item)
//         console.log(key,parsedItem, initialValue)
//         if(parsedItem == undefined ||  parsedItem == null || parsedItem === Object && Object.keys(parsedItem).length ===0){
//           await localStorage.setItem(key, JSON.stringify(initialValue))
//           console.log('initial value is set')
//           return initialValue
//         }
//         return parsedItem
//       }else{
//         console.log(initialValue)
//         await localStorage.setItem(key, JSON.stringify(initialValue))
//       }
//       return initialValue
//     }else{
//       return initialValue
//     }
//   }
//   const baseAtom = atom(getInitialValue())
//   const derivedAtom = atom(
//     (get) => get(baseAtom),
//     (get, set, update) => {
//       const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update
//       set(baseAtom, nextValue)
//       if (typeof window !== "undefined") {
//         localStorage.setItem(key, JSON.stringify(nextValue))
//       }
//     }
//   )
//   return derivedAtom
// }

export const atomWithLocalStorage = <A>(key, initialValue):WritableAtom<A, A> => {
  const getInitialValue = () => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      if (item !== null) {
        if(Array.isArray(initialValue)){
          console.log(JSON.parse(item).map(i => atomWithLocalStorage<A>(i.id, i)))
          return JSON.parse(item).map(i => atomWithLocalStorage<A>(i.id, i))
        }
        return JSON.parse(item)
      }
      return initialValue
    }
  }
  const baseAtom = atom(getInitialValue())
  const derivedAtom = atom<A,A>(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      // console.log(key, initialValue,Array.isArray(initialValue))
      if (typeof window !== "undefined") {
        if(Array.isArray(initialValue)){
          localStorage.setItem(key, JSON.stringify(nextValue.map(get)))
        }else{
          localStorage.setItem(key, JSON.stringify(nextValue))
        }
      }
    }
  )
  return derivedAtom
}

export const atomWithLocalStorageAndDefault = <A>(key, initializeFn) => {
  const getInitialValue = () => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      if (item !== null) {
        return ()=> JSON.parse(item)
      }
      return initializeFn
    }
  }
  const baseAtom = atomWithDefault(getInitialValue())
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