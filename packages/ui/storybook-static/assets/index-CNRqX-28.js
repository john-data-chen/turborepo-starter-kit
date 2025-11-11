import { r as s } from './iframe-l6Qa-wLU.js'
import { j as p, a as x } from './utils-Cg71Lysi.js'
function C(n, t) {
  if (typeof n === 'function') {return n(t)}
  n != null && (n.current = t)
}
function g(...n) {
  return (t) => {
    let e = !1
    const l = n.map((r) => {
      const o = C(r, t)
      return (!e && typeof o === 'function' && (e = !0), o)
    })
    if (e)
      {return () => {
        for (let r = 0; r < l.length; r++) {
          const o = l[r]
          typeof o == 'function' ? o() : C(n[r], null)
        }
      }}
  }
}
function j(n) {
  const t = N(n),
    e = s.forwardRef((l, r) => {
      const { children: o, ...u } = l,
        a = s.Children.toArray(o),
        f = a.find(b)
      if (f) {
        const i = f.props.children,
          c = a.map((d) =>
            d === f
              ? s.Children.count(i) > 1
                ? s.Children.only(null)
                : s.isValidElement(i)
                  ? i.props.children
                  : null
              : d
          )
        return p.jsx(t, { ...u, ref: r, children: s.isValidElement(i) ? s.cloneElement(i, void 0, c) : null })
      }
      return p.jsx(t, { ...u, ref: r, children: o })
    })
  return ((e.displayName = `${n}.Slot`), e)
}
const W = j('Slot')
function N(n) {
  const t = s.forwardRef((e, l) => {
    const { children: r, ...o } = e
    if (s.isValidElement(r)) {
      const u = P(r),
        a = O(o, r.props)
      return (r.type !== s.Fragment && (a.ref = l ? g(l, u) : u), s.cloneElement(r, a))
    }
    return s.Children.count(r) > 1 ? s.Children.only(null) : null
  })
  return ((t.displayName = `${n}.SlotClone`), t)
}
const R = Symbol('radix.slottable')
function b(n) {
  return s.isValidElement(n) && typeof n.type === 'function' && '__radixId' in n.type && n.type.__radixId === R
}
function O(n, t) {
  const e = { ...t }
  for (const l in t) {
    const r = n[l],
      o = t[l]
    ;/^on[A-Z]/.test(l)
      ? r && o
        ? (e[l] = (...a) => {
            const f = o(...a)
            return (r(...a), f)
          })
        : r && (e[l] = r)
      : l === 'style'
        ? (e[l] = { ...r, ...o })
        : l === 'className' && (e[l] = [r, o].filter(Boolean).join(' '))
  }
  return { ...n, ...e }
}
function P(n) {
  let t = Object.getOwnPropertyDescriptor(n.props, 'ref')?.get,
    e = t && 'isReactWarning' in t && t.isReactWarning
  return e
    ? n.ref
    : ((t = Object.getOwnPropertyDescriptor(n, 'ref')?.get),
      (e = t && 'isReactWarning' in t && t.isReactWarning),
      e ? n.props.ref : n.props.ref || n.ref)
}
const S = (n) => (typeof n === 'boolean' ? `${n}` : n === 0 ? '0' : n),
  E = x,
  I = (n, t) => (e) => {
    let l
    if (t?.variants == null) {return E(n, e?.class, e?.className)}
    const { variants: r, defaultVariants: o } = t,
      u = Object.keys(r).map((i) => {
        const c = e?.[i],
          d = o?.[i]
        if (c === null) {return null}
        const m = S(c) || S(d)
        return r[i][m]
      }),
      a =
        e &&
        Object.entries(e).reduce((i, c) => {
          let [d, m] = c
          return (m === void 0 || (i[d] = m), i)
        }, {}),
      f =
        t == null || (l = t.compoundVariants) === null || l === void 0
          ? void 0
          : l.reduce((i, c) => {
              let { class: d, className: m, ...V } = c
              return Object.entries(V).every((h) => {
                let [y, v] = h
                return Array.isArray(v) ? v.includes({ ...o, ...a }[y]) : { ...o, ...a }[y] === v
              })
                ? [...i, d, m]
                : i
            }, [])
    return E(n, u, f, e?.class, e?.className)
  }
export { W as S, I as c }
