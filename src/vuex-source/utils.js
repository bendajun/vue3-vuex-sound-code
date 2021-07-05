export const forEachValue = (obj, fn) => {
  Object.keys(obj).forEach(key => {
    fn(obj[key], key)
  })
}

export const isPromise = (fn) => {
  return fn && typeof fn.then === 'function'
}
