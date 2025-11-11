const re = { exports: {} },
  B = {}
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ let be
function Oe() {
  if (be) {return B}
  be = 1
  const e = Symbol.for('react.transitional.element'),
    t = Symbol.for('react.fragment')
  function r(o, a, l) {
    let i = null
    if ((l !== void 0 && (i = '' + l), a.key !== void 0 && (i = '' + a.key), 'key' in a)) {
      l = {}
      for (let u in a) {u !== 'key' && (l[u] = a[u])}
    } else {l = a}
    return ((a = l.ref), { $$typeof: e, type: o, key: i, ref: a !== void 0 ? a : null, props: l })
  }
  return ((B.Fragment = t), (B.jsx = r), (B.jsxs = r), B)
}
let ge
function Le() {
  return (ge || ((ge = 1), (re.exports = Oe())), re.exports)
}
const So = Le()
function ve(e) {
  let t,
    r,
    o = ''
  if (typeof e === 'string' || typeof e === 'number') {o += e}
  else if (typeof e === 'object')
    {if (Array.isArray(e)) {
      var a = e.length
      for (t = 0; t < a; t++) e[t] && (r = ve(e[t])) && (o && (o += ' '), (o += r))
    } else for (r in e) e[r] && (o && (o += ' '), (o += r))}
  return o
}
function _e() {
  for (var e, t, r = 0, o = '', a = arguments.length; r < a; r++)
    {(e = arguments[r]) && (t = ve(e)) && (o && (o += ' '), (o += t))}
  return o
}
const Ne = (e, t) => {
    const r = new Array(e.length + t.length)
    for (let o = 0; o < e.length; o++) {r[o] = e[o]}
    for (let o = 0; o < t.length; o++) {r[e.length + o] = t[o]}
    return r
  },
  Ve = (e, t) => ({ classGroupId: e, validator: t }),
  ze = (e = new Map(), t = null, r) => ({ nextPart: e, validators: t, classGroupId: r }),
  Z = '-',
  he = [],
  Fe = 'arbitrary..',
  We = (e) => {
    const t = $e(e),
      { conflictingClassGroups: r, conflictingClassGroupModifiers: o } = e
    return {
      getClassGroupId: (i) => {
        if (i.startsWith('[') && i.endsWith(']')) {return Be(i)}
        const u = i.split(Z),
          d = u[0] === '' && u.length > 1 ? 1 : 0
        return Ce(u, d, t)
      },
      getConflictingClassGroupIds: (i, u) => {
        if (u) {
          const d = o[i],
            f = r[i]
          return d ? (f ? Ne(f, d) : d) : f || he
        }
        return r[i] || he
      }
    }
  },
  Ce = (e, t, r) => {
    if (e.length - t === 0) {return r.classGroupId}
    const a = e[t],
      l = r.nextPart.get(a)
    if (l) {
      const f = Ce(e, t + 1, l)
      if (f) {return f}
    }
    const i = r.validators
    if (i === null) {return}
    const u = t === 0 ? e.join(Z) : e.slice(t).join(Z),
      d = i.length
    for (let f = 0; f < d; f++) {
      const h = i[f]
      if (h.validator(u)) {return h.classGroupId}
    }
  },
  Be = (e) =>
    e.slice(1, -1).indexOf(':') === -1
      ? void 0
      : (() => {
          const t = e.slice(1, -1),
            r = t.indexOf(':'),
            o = t.slice(0, r)
          return o ? Fe + o : void 0
        })(),
  $e = (e) => {
    const { theme: t, classGroups: r } = e
    return qe(r, t)
  },
  qe = (e, t) => {
    const r = ze()
    for (const o in e) {
      const a = e[o]
      ae(a, r, o, t)
    }
    return r
  },
  ae = (e, t, r, o) => {
    const a = e.length
    for (let l = 0; l < a; l++) {
      const i = e[l]
      Je(i, t, r, o)
    }
  },
  Je = (e, t, r, o) => {
    if (typeof e === 'string') {
      Ue(e, t, r)
      return
    }
    if (typeof e === 'function') {
      Ye(e, t, r, o)
      return
    }
    De(e, t, r, o)
  },
  Ue = (e, t, r) => {
    const o = e === '' ? t : Re(t, e)
    o.classGroupId = r
  },
  Ye = (e, t, r, o) => {
    if (Xe(e)) {
      ae(e(o), t, r, o)
      return
    }
    ;(t.validators === null && (t.validators = []), t.validators.push(Ve(r, e)))
  },
  De = (e, t, r, o) => {
    const a = Object.entries(e),
      l = a.length
    for (let i = 0; i < l; i++) {
      const [u, d] = a[i]
      ae(d, Re(t, u), r, o)
    }
  },
  Re = (e, t) => {
    let r = e
    const o = t.split(Z),
      a = o.length
    for (let l = 0; l < a; l++) {
      const i = o[l]
      let u = r.nextPart.get(i)
      ;(u || ((u = ze()), r.nextPart.set(i, u)), (r = u))
    }
    return r
  },
  Xe = (e) => 'isThemeGetter' in e && e.isThemeGetter === !0,
  He = (e) => {
    if (e < 1) {return { get: () => {}, set: () => {} }}
    let t = 0,
      r = Object.create(null),
      o = Object.create(null)
    const a = (l, i) => {
      ;((r[l] = i), t++, t > e && ((t = 0), (o = r), (r = Object.create(null))))
    }
    return {
      get(l) {
        let i = r[l]
        if (i !== void 0) {return i}
        if ((i = o[l]) !== void 0) {return (a(l, i), i)}
      },
      set(l, i) {
        l in r ? (r[l] = i) : a(l, i)
      }
    }
  },
  ne = '!',
  xe = ':',
  Qe = [],
  ke = (e, t, r, o, a) => ({
    modifiers: e,
    hasImportantModifier: t,
    baseClassName: r,
    maybePostfixModifierPosition: o,
    isExternal: a
  }),
  Ze = (e) => {
    const { prefix: t, experimentalParseClassName: r } = e
    let o = (a) => {
      const l = []
      let i = 0,
        u = 0,
        d = 0,
        f
      const h = a.length
      for (let v = 0; v < h; v++) {
        const k = a[v]
        if (i === 0 && u === 0) {
          if (k === xe) {
            ;(l.push(a.slice(d, v)), (d = v + 1))
            continue
          }
          if (k === '/') {
            f = v
            continue
          }
        }
        k === '[' ? i++ : k === ']' ? i-- : k === '(' ? u++ : k === ')' && u--
      }
      const y = l.length === 0 ? a : a.slice(d)
      let z = y,
        M = !1
      y.endsWith(ne) ? ((z = y.slice(0, -1)), (M = !0)) : y.startsWith(ne) && ((z = y.slice(1)), (M = !0))
      const I = f && f > d ? f - d : void 0
      return ke(l, M, z, I)
    }
    if (t) {
      const a = t + xe,
        l = o
      o = (i) => (i.startsWith(a) ? l(i.slice(a.length)) : ke(Qe, !1, i, void 0, !0))
    }
    if (r) {
      const a = o
      o = (l) => r({ className: l, parseClassName: a })
    }
    return o
  },
  Ke = (e) => {
    const t = new Map()
    return (
      e.orderSensitiveModifiers.forEach((r, o) => {
        t.set(r, 1e6 + o)
      }),
      (r) => {
        const o = []
        let a = []
        for (let l = 0; l < r.length; l++) {
          const i = r[l],
            u = i[0] === '[',
            d = t.has(i)
          u || d ? (a.length > 0 && (a.sort(), o.push(...a), (a = [])), o.push(i)) : a.push(i)
        }
        return (a.length > 0 && (a.sort(), o.push(...a)), o)
      }
    )
  },
  eo = (e) => ({ cache: He(e.cacheSize), parseClassName: Ze(e), sortModifiers: Ke(e), ...We(e) }),
  oo = /\s+/,
  ro = (e, t) => {
    const { parseClassName: r, getClassGroupId: o, getConflictingClassGroupIds: a, sortModifiers: l } = t,
      i = [],
      u = e.trim().split(oo)
    let d = ''
    for (let f = u.length - 1; f >= 0; f -= 1) {
      const h = u[f],
        {
          isExternal: y,
          modifiers: z,
          hasImportantModifier: M,
          baseClassName: I,
          maybePostfixModifierPosition: v
        } = r(h)
      if (y) {
        d = h + (d.length > 0 ? ' ' + d : d)
        continue
      }
      let k = !!v,
        P = o(k ? I.substring(0, v) : I)
      if (!P) {
        if (!k) {
          d = h + (d.length > 0 ? ' ' + d : d)
          continue
        }
        if (((P = o(I)), !P)) {
          d = h + (d.length > 0 ? ' ' + d : d)
          continue
        }
        k = !1
      }
      const q = z.length === 0 ? '' : z.length === 1 ? z[0] : l(z).join(':'),
        F = M ? q + ne : q,
        j = F + P
      if (i.indexOf(j) > -1) {continue}
      i.push(j)
      const O = a(P, k)
      for (let T = 0; T < O.length; ++T) {
        const W = O[T]
        i.push(F + W)
      }
      d = h + (d.length > 0 ? ' ' + d : d)
    }
    return d
  },
  to = (...e) => {
    let t = 0,
      r,
      o,
      a = ''
    for (; t < e.length; ) {(r = e[t++]) && (o = Ae(r)) && (a && (a += ' '), (a += o))}
    return a
  },
  Ae = (e) => {
    if (typeof e === 'string') {return e}
    let t,
      r = ''
    for (let o = 0; o < e.length; o++) {e[o] && (t = Ae(e[o])) && (r && (r += ' '), (r += t))}
    return r
  },
  so = (e, ...t) => {
    let r, o, a, l
    const i = (d) => {
        const f = t.reduce((h, y) => y(h), e())
        return ((r = eo(f)), (o = r.cache.get), (a = r.cache.set), (l = u), u(d))
      },
      u = (d) => {
        const f = o(d)
        if (f) {return f}
        const h = ro(d, r)
        return (a(d, h), h)
      }
    return ((l = i), (...d) => l(to(...d)))
  },
  no = [],
  b = (e) => {
    const t = (r) => r[e] || no
    return ((t.isThemeGetter = !0), t)
  },
  Se = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  Me = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  ao = /^\d+\/\d+$/,
  io = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  lo =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  co = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  mo = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  po = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  _ = (e) => ao.test(e),
  p = (e) => !!e && !Number.isNaN(Number(e)),
  S = (e) => !!e && Number.isInteger(Number(e)),
  te = (e) => e.endsWith('%') && p(e.slice(0, -1)),
  A = (e) => io.test(e),
  uo = () => !0,
  fo = (e) => lo.test(e) && !co.test(e),
  Ie = () => !1,
  bo = (e) => mo.test(e),
  go = (e) => po.test(e),
  ho = (e) => !s(e) && !n(e),
  xo = (e) => N(e, Ge, Ie),
  s = (e) => Se.test(e),
  E = (e) => N(e, Ee, fo),
  se = (e) => N(e, zo, p),
  we = (e) => N(e, Pe, Ie),
  ko = (e) => N(e, Te, go),
  H = (e) => N(e, je, bo),
  n = (e) => Me.test(e),
  $ = (e) => V(e, Ee),
  wo = (e) => V(e, Co),
  ye = (e) => V(e, Pe),
  yo = (e) => V(e, Ge),
  vo = (e) => V(e, Te),
  Q = (e) => V(e, je, !0),
  N = (e, t, r) => {
    const o = Se.exec(e)
    return o ? (o[1] ? t(o[1]) : r(o[2])) : !1
  },
  V = (e, t, r = !1) => {
    const o = Me.exec(e)
    return o ? (o[1] ? t(o[1]) : r) : !1
  },
  Pe = (e) => e === 'position' || e === 'percentage',
  Te = (e) => e === 'image' || e === 'url',
  Ge = (e) => e === 'length' || e === 'size' || e === 'bg-size',
  Ee = (e) => e === 'length',
  zo = (e) => e === 'number',
  Co = (e) => e === 'family-name',
  je = (e) => e === 'shadow',
  Ro = () => {
    const e = b('color'),
      t = b('font'),
      r = b('text'),
      o = b('font-weight'),
      a = b('tracking'),
      l = b('leading'),
      i = b('breakpoint'),
      u = b('container'),
      d = b('spacing'),
      f = b('radius'),
      h = b('shadow'),
      y = b('inset-shadow'),
      z = b('text-shadow'),
      M = b('drop-shadow'),
      I = b('blur'),
      v = b('perspective'),
      k = b('aspect'),
      P = b('ease'),
      q = b('animate'),
      F = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
      j = () => [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'left-top',
        'top-right',
        'right-top',
        'bottom-right',
        'right-bottom',
        'bottom-left',
        'left-bottom'
      ],
      O = () => [...j(), n, s],
      T = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'],
      W = () => ['auto', 'contain', 'none'],
      m = () => [n, s, d],
      C = () => [_, 'full', 'auto', ...m()],
      ie = () => [S, 'none', 'subgrid', n, s],
      le = () => ['auto', { span: ['full', S, n, s] }, S, n, s],
      J = () => [S, 'auto', n, s],
      ce = () => ['auto', 'min', 'max', 'fr', n, s],
      K = () => [
        'start',
        'end',
        'center',
        'between',
        'around',
        'evenly',
        'stretch',
        'baseline',
        'center-safe',
        'end-safe'
      ],
      L = () => ['start', 'end', 'center', 'stretch', 'center-safe', 'end-safe'],
      R = () => ['auto', ...m()],
      G = () => [_, 'auto', 'full', 'dvw', 'dvh', 'lvw', 'lvh', 'svw', 'svh', 'min', 'max', 'fit', ...m()],
      c = () => [e, n, s],
      de = () => [...j(), ye, we, { position: [n, s] }],
      me = () => ['no-repeat', { repeat: ['', 'x', 'y', 'space', 'round'] }],
      pe = () => ['auto', 'cover', 'contain', yo, xo, { size: [n, s] }],
      ee = () => [te, $, E],
      x = () => ['', 'none', 'full', f, n, s],
      w = () => ['', p, $, E],
      U = () => ['solid', 'dashed', 'dotted', 'double'],
      ue = () => [
        'normal',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion',
        'hue',
        'saturation',
        'color',
        'luminosity'
      ],
      g = () => [p, te, ye, we],
      fe = () => ['', 'none', I, n, s],
      Y = () => ['none', p, n, s],
      D = () => ['none', p, n, s],
      oe = () => [p, n, s],
      X = () => [_, 'full', ...m()]
    return {
      cacheSize: 500,
      theme: {
        animate: ['spin', 'ping', 'pulse', 'bounce'],
        aspect: ['video'],
        blur: [A],
        breakpoint: [A],
        color: [uo],
        container: [A],
        'drop-shadow': [A],
        ease: ['in', 'out', 'in-out'],
        font: [ho],
        'font-weight': ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
        'inset-shadow': [A],
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
        perspective: ['dramatic', 'near', 'normal', 'midrange', 'distant', 'none'],
        radius: [A],
        shadow: [A],
        spacing: ['px', p],
        text: [A],
        'text-shadow': [A],
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']
      },
      classGroups: {
        aspect: [{ aspect: ['auto', 'square', _, s, n, k] }],
        container: ['container'],
        columns: [{ columns: [p, s, n, u] }],
        'break-after': [{ 'break-after': F() }],
        'break-before': [{ 'break-before': F() }],
        'break-inside': [{ 'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column'] }],
        'box-decoration': [{ 'box-decoration': ['slice', 'clone'] }],
        box: [{ box: ['border', 'content'] }],
        display: [
          'block',
          'inline-block',
          'inline',
          'flex',
          'inline-flex',
          'table',
          'inline-table',
          'table-caption',
          'table-cell',
          'table-column',
          'table-column-group',
          'table-footer-group',
          'table-header-group',
          'table-row-group',
          'table-row',
          'flow-root',
          'grid',
          'inline-grid',
          'contents',
          'list-item',
          'hidden'
        ],
        sr: ['sr-only', 'not-sr-only'],
        float: [{ float: ['right', 'left', 'none', 'start', 'end'] }],
        clear: [{ clear: ['left', 'right', 'both', 'none', 'start', 'end'] }],
        isolation: ['isolate', 'isolation-auto'],
        'object-fit': [{ object: ['contain', 'cover', 'fill', 'none', 'scale-down'] }],
        'object-position': [{ object: O() }],
        overflow: [{ overflow: T() }],
        'overflow-x': [{ 'overflow-x': T() }],
        'overflow-y': [{ 'overflow-y': T() }],
        overscroll: [{ overscroll: W() }],
        'overscroll-x': [{ 'overscroll-x': W() }],
        'overscroll-y': [{ 'overscroll-y': W() }],
        position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
        inset: [{ inset: C() }],
        'inset-x': [{ 'inset-x': C() }],
        'inset-y': [{ 'inset-y': C() }],
        start: [{ start: C() }],
        end: [{ end: C() }],
        top: [{ top: C() }],
        right: [{ right: C() }],
        bottom: [{ bottom: C() }],
        left: [{ left: C() }],
        visibility: ['visible', 'invisible', 'collapse'],
        z: [{ z: [S, 'auto', n, s] }],
        basis: [{ basis: [_, 'full', 'auto', u, ...m()] }],
        'flex-direction': [{ flex: ['row', 'row-reverse', 'col', 'col-reverse'] }],
        'flex-wrap': [{ flex: ['nowrap', 'wrap', 'wrap-reverse'] }],
        flex: [{ flex: [p, _, 'auto', 'initial', 'none', s] }],
        grow: [{ grow: ['', p, n, s] }],
        shrink: [{ shrink: ['', p, n, s] }],
        order: [{ order: [S, 'first', 'last', 'none', n, s] }],
        'grid-cols': [{ 'grid-cols': ie() }],
        'col-start-end': [{ col: le() }],
        'col-start': [{ 'col-start': J() }],
        'col-end': [{ 'col-end': J() }],
        'grid-rows': [{ 'grid-rows': ie() }],
        'row-start-end': [{ row: le() }],
        'row-start': [{ 'row-start': J() }],
        'row-end': [{ 'row-end': J() }],
        'grid-flow': [{ 'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense'] }],
        'auto-cols': [{ 'auto-cols': ce() }],
        'auto-rows': [{ 'auto-rows': ce() }],
        gap: [{ gap: m() }],
        'gap-x': [{ 'gap-x': m() }],
        'gap-y': [{ 'gap-y': m() }],
        'justify-content': [{ justify: [...K(), 'normal'] }],
        'justify-items': [{ 'justify-items': [...L(), 'normal'] }],
        'justify-self': [{ 'justify-self': ['auto', ...L()] }],
        'align-content': [{ content: ['normal', ...K()] }],
        'align-items': [{ items: [...L(), { baseline: ['', 'last'] }] }],
        'align-self': [{ self: ['auto', ...L(), { baseline: ['', 'last'] }] }],
        'place-content': [{ 'place-content': K() }],
        'place-items': [{ 'place-items': [...L(), 'baseline'] }],
        'place-self': [{ 'place-self': ['auto', ...L()] }],
        p: [{ p: m() }],
        px: [{ px: m() }],
        py: [{ py: m() }],
        ps: [{ ps: m() }],
        pe: [{ pe: m() }],
        pt: [{ pt: m() }],
        pr: [{ pr: m() }],
        pb: [{ pb: m() }],
        pl: [{ pl: m() }],
        m: [{ m: R() }],
        mx: [{ mx: R() }],
        my: [{ my: R() }],
        ms: [{ ms: R() }],
        me: [{ me: R() }],
        mt: [{ mt: R() }],
        mr: [{ mr: R() }],
        mb: [{ mb: R() }],
        ml: [{ ml: R() }],
        'space-x': [{ 'space-x': m() }],
        'space-x-reverse': ['space-x-reverse'],
        'space-y': [{ 'space-y': m() }],
        'space-y-reverse': ['space-y-reverse'],
        size: [{ size: G() }],
        w: [{ w: [u, 'screen', ...G()] }],
        'min-w': [{ 'min-w': [u, 'screen', 'none', ...G()] }],
        'max-w': [{ 'max-w': [u, 'screen', 'none', 'prose', { screen: [i] }, ...G()] }],
        h: [{ h: ['screen', 'lh', ...G()] }],
        'min-h': [{ 'min-h': ['screen', 'lh', 'none', ...G()] }],
        'max-h': [{ 'max-h': ['screen', 'lh', ...G()] }],
        'font-size': [{ text: ['base', r, $, E] }],
        'font-smoothing': ['antialiased', 'subpixel-antialiased'],
        'font-style': ['italic', 'not-italic'],
        'font-weight': [{ font: [o, n, se] }],
        'font-stretch': [
          {
            'font-stretch': [
              'ultra-condensed',
              'extra-condensed',
              'condensed',
              'semi-condensed',
              'normal',
              'semi-expanded',
              'expanded',
              'extra-expanded',
              'ultra-expanded',
              te,
              s
            ]
          }
        ],
        'font-family': [{ font: [wo, s, t] }],
        'fvn-normal': ['normal-nums'],
        'fvn-ordinal': ['ordinal'],
        'fvn-slashed-zero': ['slashed-zero'],
        'fvn-figure': ['lining-nums', 'oldstyle-nums'],
        'fvn-spacing': ['proportional-nums', 'tabular-nums'],
        'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
        tracking: [{ tracking: [a, n, s] }],
        'line-clamp': [{ 'line-clamp': [p, 'none', n, se] }],
        leading: [{ leading: [l, ...m()] }],
        'list-image': [{ 'list-image': ['none', n, s] }],
        'list-style-position': [{ list: ['inside', 'outside'] }],
        'list-style-type': [{ list: ['disc', 'decimal', 'none', n, s] }],
        'text-alignment': [{ text: ['left', 'center', 'right', 'justify', 'start', 'end'] }],
        'placeholder-color': [{ placeholder: c() }],
        'text-color': [{ text: c() }],
        'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
        'text-decoration-style': [{ decoration: [...U(), 'wavy'] }],
        'text-decoration-thickness': [{ decoration: [p, 'from-font', 'auto', n, E] }],
        'text-decoration-color': [{ decoration: c() }],
        'underline-offset': [{ 'underline-offset': [p, 'auto', n, s] }],
        'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
        'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
        'text-wrap': [{ text: ['wrap', 'nowrap', 'balance', 'pretty'] }],
        indent: [{ indent: m() }],
        'vertical-align': [
          { align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', n, s] }
        ],
        whitespace: [{ whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'] }],
        break: [{ break: ['normal', 'words', 'all', 'keep'] }],
        wrap: [{ wrap: ['break-word', 'anywhere', 'normal'] }],
        hyphens: [{ hyphens: ['none', 'manual', 'auto'] }],
        content: [{ content: ['none', n, s] }],
        'bg-attachment': [{ bg: ['fixed', 'local', 'scroll'] }],
        'bg-clip': [{ 'bg-clip': ['border', 'padding', 'content', 'text'] }],
        'bg-origin': [{ 'bg-origin': ['border', 'padding', 'content'] }],
        'bg-position': [{ bg: de() }],
        'bg-repeat': [{ bg: me() }],
        'bg-size': [{ bg: pe() }],
        'bg-image': [
          {
            bg: [
              'none',
              {
                linear: [{ to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] }, S, n, s],
                radial: ['', n, s],
                conic: [S, n, s]
              },
              vo,
              ko
            ]
          }
        ],
        'bg-color': [{ bg: c() }],
        'gradient-from-pos': [{ from: ee() }],
        'gradient-via-pos': [{ via: ee() }],
        'gradient-to-pos': [{ to: ee() }],
        'gradient-from': [{ from: c() }],
        'gradient-via': [{ via: c() }],
        'gradient-to': [{ to: c() }],
        rounded: [{ rounded: x() }],
        'rounded-s': [{ 'rounded-s': x() }],
        'rounded-e': [{ 'rounded-e': x() }],
        'rounded-t': [{ 'rounded-t': x() }],
        'rounded-r': [{ 'rounded-r': x() }],
        'rounded-b': [{ 'rounded-b': x() }],
        'rounded-l': [{ 'rounded-l': x() }],
        'rounded-ss': [{ 'rounded-ss': x() }],
        'rounded-se': [{ 'rounded-se': x() }],
        'rounded-ee': [{ 'rounded-ee': x() }],
        'rounded-es': [{ 'rounded-es': x() }],
        'rounded-tl': [{ 'rounded-tl': x() }],
        'rounded-tr': [{ 'rounded-tr': x() }],
        'rounded-br': [{ 'rounded-br': x() }],
        'rounded-bl': [{ 'rounded-bl': x() }],
        'border-w': [{ border: w() }],
        'border-w-x': [{ 'border-x': w() }],
        'border-w-y': [{ 'border-y': w() }],
        'border-w-s': [{ 'border-s': w() }],
        'border-w-e': [{ 'border-e': w() }],
        'border-w-t': [{ 'border-t': w() }],
        'border-w-r': [{ 'border-r': w() }],
        'border-w-b': [{ 'border-b': w() }],
        'border-w-l': [{ 'border-l': w() }],
        'divide-x': [{ 'divide-x': w() }],
        'divide-x-reverse': ['divide-x-reverse'],
        'divide-y': [{ 'divide-y': w() }],
        'divide-y-reverse': ['divide-y-reverse'],
        'border-style': [{ border: [...U(), 'hidden', 'none'] }],
        'divide-style': [{ divide: [...U(), 'hidden', 'none'] }],
        'border-color': [{ border: c() }],
        'border-color-x': [{ 'border-x': c() }],
        'border-color-y': [{ 'border-y': c() }],
        'border-color-s': [{ 'border-s': c() }],
        'border-color-e': [{ 'border-e': c() }],
        'border-color-t': [{ 'border-t': c() }],
        'border-color-r': [{ 'border-r': c() }],
        'border-color-b': [{ 'border-b': c() }],
        'border-color-l': [{ 'border-l': c() }],
        'divide-color': [{ divide: c() }],
        'outline-style': [{ outline: [...U(), 'none', 'hidden'] }],
        'outline-offset': [{ 'outline-offset': [p, n, s] }],
        'outline-w': [{ outline: ['', p, $, E] }],
        'outline-color': [{ outline: c() }],
        shadow: [{ shadow: ['', 'none', h, Q, H] }],
        'shadow-color': [{ shadow: c() }],
        'inset-shadow': [{ 'inset-shadow': ['none', y, Q, H] }],
        'inset-shadow-color': [{ 'inset-shadow': c() }],
        'ring-w': [{ ring: w() }],
        'ring-w-inset': ['ring-inset'],
        'ring-color': [{ ring: c() }],
        'ring-offset-w': [{ 'ring-offset': [p, E] }],
        'ring-offset-color': [{ 'ring-offset': c() }],
        'inset-ring-w': [{ 'inset-ring': w() }],
        'inset-ring-color': [{ 'inset-ring': c() }],
        'text-shadow': [{ 'text-shadow': ['none', z, Q, H] }],
        'text-shadow-color': [{ 'text-shadow': c() }],
        opacity: [{ opacity: [p, n, s] }],
        'mix-blend': [{ 'mix-blend': [...ue(), 'plus-darker', 'plus-lighter'] }],
        'bg-blend': [{ 'bg-blend': ue() }],
        'mask-clip': [{ 'mask-clip': ['border', 'padding', 'content', 'fill', 'stroke', 'view'] }, 'mask-no-clip'],
        'mask-composite': [{ mask: ['add', 'subtract', 'intersect', 'exclude'] }],
        'mask-image-linear-pos': [{ 'mask-linear': [p] }],
        'mask-image-linear-from-pos': [{ 'mask-linear-from': g() }],
        'mask-image-linear-to-pos': [{ 'mask-linear-to': g() }],
        'mask-image-linear-from-color': [{ 'mask-linear-from': c() }],
        'mask-image-linear-to-color': [{ 'mask-linear-to': c() }],
        'mask-image-t-from-pos': [{ 'mask-t-from': g() }],
        'mask-image-t-to-pos': [{ 'mask-t-to': g() }],
        'mask-image-t-from-color': [{ 'mask-t-from': c() }],
        'mask-image-t-to-color': [{ 'mask-t-to': c() }],
        'mask-image-r-from-pos': [{ 'mask-r-from': g() }],
        'mask-image-r-to-pos': [{ 'mask-r-to': g() }],
        'mask-image-r-from-color': [{ 'mask-r-from': c() }],
        'mask-image-r-to-color': [{ 'mask-r-to': c() }],
        'mask-image-b-from-pos': [{ 'mask-b-from': g() }],
        'mask-image-b-to-pos': [{ 'mask-b-to': g() }],
        'mask-image-b-from-color': [{ 'mask-b-from': c() }],
        'mask-image-b-to-color': [{ 'mask-b-to': c() }],
        'mask-image-l-from-pos': [{ 'mask-l-from': g() }],
        'mask-image-l-to-pos': [{ 'mask-l-to': g() }],
        'mask-image-l-from-color': [{ 'mask-l-from': c() }],
        'mask-image-l-to-color': [{ 'mask-l-to': c() }],
        'mask-image-x-from-pos': [{ 'mask-x-from': g() }],
        'mask-image-x-to-pos': [{ 'mask-x-to': g() }],
        'mask-image-x-from-color': [{ 'mask-x-from': c() }],
        'mask-image-x-to-color': [{ 'mask-x-to': c() }],
        'mask-image-y-from-pos': [{ 'mask-y-from': g() }],
        'mask-image-y-to-pos': [{ 'mask-y-to': g() }],
        'mask-image-y-from-color': [{ 'mask-y-from': c() }],
        'mask-image-y-to-color': [{ 'mask-y-to': c() }],
        'mask-image-radial': [{ 'mask-radial': [n, s] }],
        'mask-image-radial-from-pos': [{ 'mask-radial-from': g() }],
        'mask-image-radial-to-pos': [{ 'mask-radial-to': g() }],
        'mask-image-radial-from-color': [{ 'mask-radial-from': c() }],
        'mask-image-radial-to-color': [{ 'mask-radial-to': c() }],
        'mask-image-radial-shape': [{ 'mask-radial': ['circle', 'ellipse'] }],
        'mask-image-radial-size': [{ 'mask-radial': [{ closest: ['side', 'corner'], farthest: ['side', 'corner'] }] }],
        'mask-image-radial-pos': [{ 'mask-radial-at': j() }],
        'mask-image-conic-pos': [{ 'mask-conic': [p] }],
        'mask-image-conic-from-pos': [{ 'mask-conic-from': g() }],
        'mask-image-conic-to-pos': [{ 'mask-conic-to': g() }],
        'mask-image-conic-from-color': [{ 'mask-conic-from': c() }],
        'mask-image-conic-to-color': [{ 'mask-conic-to': c() }],
        'mask-mode': [{ mask: ['alpha', 'luminance', 'match'] }],
        'mask-origin': [{ 'mask-origin': ['border', 'padding', 'content', 'fill', 'stroke', 'view'] }],
        'mask-position': [{ mask: de() }],
        'mask-repeat': [{ mask: me() }],
        'mask-size': [{ mask: pe() }],
        'mask-type': [{ 'mask-type': ['alpha', 'luminance'] }],
        'mask-image': [{ mask: ['none', n, s] }],
        filter: [{ filter: ['', 'none', n, s] }],
        blur: [{ blur: fe() }],
        brightness: [{ brightness: [p, n, s] }],
        contrast: [{ contrast: [p, n, s] }],
        'drop-shadow': [{ 'drop-shadow': ['', 'none', M, Q, H] }],
        'drop-shadow-color': [{ 'drop-shadow': c() }],
        grayscale: [{ grayscale: ['', p, n, s] }],
        'hue-rotate': [{ 'hue-rotate': [p, n, s] }],
        invert: [{ invert: ['', p, n, s] }],
        saturate: [{ saturate: [p, n, s] }],
        sepia: [{ sepia: ['', p, n, s] }],
        'backdrop-filter': [{ 'backdrop-filter': ['', 'none', n, s] }],
        'backdrop-blur': [{ 'backdrop-blur': fe() }],
        'backdrop-brightness': [{ 'backdrop-brightness': [p, n, s] }],
        'backdrop-contrast': [{ 'backdrop-contrast': [p, n, s] }],
        'backdrop-grayscale': [{ 'backdrop-grayscale': ['', p, n, s] }],
        'backdrop-hue-rotate': [{ 'backdrop-hue-rotate': [p, n, s] }],
        'backdrop-invert': [{ 'backdrop-invert': ['', p, n, s] }],
        'backdrop-opacity': [{ 'backdrop-opacity': [p, n, s] }],
        'backdrop-saturate': [{ 'backdrop-saturate': [p, n, s] }],
        'backdrop-sepia': [{ 'backdrop-sepia': ['', p, n, s] }],
        'border-collapse': [{ border: ['collapse', 'separate'] }],
        'border-spacing': [{ 'border-spacing': m() }],
        'border-spacing-x': [{ 'border-spacing-x': m() }],
        'border-spacing-y': [{ 'border-spacing-y': m() }],
        'table-layout': [{ table: ['auto', 'fixed'] }],
        caption: [{ caption: ['top', 'bottom'] }],
        transition: [{ transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', n, s] }],
        'transition-behavior': [{ transition: ['normal', 'discrete'] }],
        duration: [{ duration: [p, 'initial', n, s] }],
        ease: [{ ease: ['linear', 'initial', P, n, s] }],
        delay: [{ delay: [p, n, s] }],
        animate: [{ animate: ['none', q, n, s] }],
        backface: [{ backface: ['hidden', 'visible'] }],
        perspective: [{ perspective: [v, n, s] }],
        'perspective-origin': [{ 'perspective-origin': O() }],
        rotate: [{ rotate: Y() }],
        'rotate-x': [{ 'rotate-x': Y() }],
        'rotate-y': [{ 'rotate-y': Y() }],
        'rotate-z': [{ 'rotate-z': Y() }],
        scale: [{ scale: D() }],
        'scale-x': [{ 'scale-x': D() }],
        'scale-y': [{ 'scale-y': D() }],
        'scale-z': [{ 'scale-z': D() }],
        'scale-3d': ['scale-3d'],
        skew: [{ skew: oe() }],
        'skew-x': [{ 'skew-x': oe() }],
        'skew-y': [{ 'skew-y': oe() }],
        transform: [{ transform: [n, s, '', 'none', 'gpu', 'cpu'] }],
        'transform-origin': [{ origin: O() }],
        'transform-style': [{ transform: ['3d', 'flat'] }],
        translate: [{ translate: X() }],
        'translate-x': [{ 'translate-x': X() }],
        'translate-y': [{ 'translate-y': X() }],
        'translate-z': [{ 'translate-z': X() }],
        'translate-none': ['translate-none'],
        accent: [{ accent: c() }],
        appearance: [{ appearance: ['none', 'auto'] }],
        'caret-color': [{ caret: c() }],
        'color-scheme': [{ scheme: ['normal', 'dark', 'light', 'light-dark', 'only-dark', 'only-light'] }],
        cursor: [
          {
            cursor: [
              'auto',
              'default',
              'pointer',
              'wait',
              'text',
              'move',
              'help',
              'not-allowed',
              'none',
              'context-menu',
              'progress',
              'cell',
              'crosshair',
              'vertical-text',
              'alias',
              'copy',
              'no-drop',
              'grab',
              'grabbing',
              'all-scroll',
              'col-resize',
              'row-resize',
              'n-resize',
              'e-resize',
              's-resize',
              'w-resize',
              'ne-resize',
              'nw-resize',
              'se-resize',
              'sw-resize',
              'ew-resize',
              'ns-resize',
              'nesw-resize',
              'nwse-resize',
              'zoom-in',
              'zoom-out',
              n,
              s
            ]
          }
        ],
        'field-sizing': [{ 'field-sizing': ['fixed', 'content'] }],
        'pointer-events': [{ 'pointer-events': ['auto', 'none'] }],
        resize: [{ resize: ['none', '', 'y', 'x'] }],
        'scroll-behavior': [{ scroll: ['auto', 'smooth'] }],
        'scroll-m': [{ 'scroll-m': m() }],
        'scroll-mx': [{ 'scroll-mx': m() }],
        'scroll-my': [{ 'scroll-my': m() }],
        'scroll-ms': [{ 'scroll-ms': m() }],
        'scroll-me': [{ 'scroll-me': m() }],
        'scroll-mt': [{ 'scroll-mt': m() }],
        'scroll-mr': [{ 'scroll-mr': m() }],
        'scroll-mb': [{ 'scroll-mb': m() }],
        'scroll-ml': [{ 'scroll-ml': m() }],
        'scroll-p': [{ 'scroll-p': m() }],
        'scroll-px': [{ 'scroll-px': m() }],
        'scroll-py': [{ 'scroll-py': m() }],
        'scroll-ps': [{ 'scroll-ps': m() }],
        'scroll-pe': [{ 'scroll-pe': m() }],
        'scroll-pt': [{ 'scroll-pt': m() }],
        'scroll-pr': [{ 'scroll-pr': m() }],
        'scroll-pb': [{ 'scroll-pb': m() }],
        'scroll-pl': [{ 'scroll-pl': m() }],
        'snap-align': [{ snap: ['start', 'end', 'center', 'align-none'] }],
        'snap-stop': [{ snap: ['normal', 'always'] }],
        'snap-type': [{ snap: ['none', 'x', 'y', 'both'] }],
        'snap-strictness': [{ snap: ['mandatory', 'proximity'] }],
        touch: [{ touch: ['auto', 'none', 'manipulation'] }],
        'touch-x': [{ 'touch-pan': ['x', 'left', 'right'] }],
        'touch-y': [{ 'touch-pan': ['y', 'up', 'down'] }],
        'touch-pz': ['touch-pinch-zoom'],
        select: [{ select: ['none', 'text', 'all', 'auto'] }],
        'will-change': [{ 'will-change': ['auto', 'scroll', 'contents', 'transform', n, s] }],
        fill: [{ fill: ['none', ...c()] }],
        'stroke-w': [{ stroke: [p, $, E, se] }],
        stroke: [{ stroke: ['none', ...c()] }],
        'forced-color-adjust': [{ 'forced-color-adjust': ['auto', 'none'] }]
      },
      conflictingClassGroups: {
        overflow: ['overflow-x', 'overflow-y'],
        overscroll: ['overscroll-x', 'overscroll-y'],
        inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
        'inset-x': ['right', 'left'],
        'inset-y': ['top', 'bottom'],
        flex: ['basis', 'grow', 'shrink'],
        gap: ['gap-x', 'gap-y'],
        p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
        px: ['pr', 'pl'],
        py: ['pt', 'pb'],
        m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
        mx: ['mr', 'ml'],
        my: ['mt', 'mb'],
        size: ['w', 'h'],
        'font-size': ['leading'],
        'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
        'fvn-ordinal': ['fvn-normal'],
        'fvn-slashed-zero': ['fvn-normal'],
        'fvn-figure': ['fvn-normal'],
        'fvn-spacing': ['fvn-normal'],
        'fvn-fraction': ['fvn-normal'],
        'line-clamp': ['display', 'overflow'],
        rounded: [
          'rounded-s',
          'rounded-e',
          'rounded-t',
          'rounded-r',
          'rounded-b',
          'rounded-l',
          'rounded-ss',
          'rounded-se',
          'rounded-ee',
          'rounded-es',
          'rounded-tl',
          'rounded-tr',
          'rounded-br',
          'rounded-bl'
        ],
        'rounded-s': ['rounded-ss', 'rounded-es'],
        'rounded-e': ['rounded-se', 'rounded-ee'],
        'rounded-t': ['rounded-tl', 'rounded-tr'],
        'rounded-r': ['rounded-tr', 'rounded-br'],
        'rounded-b': ['rounded-br', 'rounded-bl'],
        'rounded-l': ['rounded-tl', 'rounded-bl'],
        'border-spacing': ['border-spacing-x', 'border-spacing-y'],
        'border-w': [
          'border-w-x',
          'border-w-y',
          'border-w-s',
          'border-w-e',
          'border-w-t',
          'border-w-r',
          'border-w-b',
          'border-w-l'
        ],
        'border-w-x': ['border-w-r', 'border-w-l'],
        'border-w-y': ['border-w-t', 'border-w-b'],
        'border-color': [
          'border-color-x',
          'border-color-y',
          'border-color-s',
          'border-color-e',
          'border-color-t',
          'border-color-r',
          'border-color-b',
          'border-color-l'
        ],
        'border-color-x': ['border-color-r', 'border-color-l'],
        'border-color-y': ['border-color-t', 'border-color-b'],
        translate: ['translate-x', 'translate-y', 'translate-none'],
        'translate-none': ['translate', 'translate-x', 'translate-y', 'translate-z'],
        'scroll-m': [
          'scroll-mx',
          'scroll-my',
          'scroll-ms',
          'scroll-me',
          'scroll-mt',
          'scroll-mr',
          'scroll-mb',
          'scroll-ml'
        ],
        'scroll-mx': ['scroll-mr', 'scroll-ml'],
        'scroll-my': ['scroll-mt', 'scroll-mb'],
        'scroll-p': [
          'scroll-px',
          'scroll-py',
          'scroll-ps',
          'scroll-pe',
          'scroll-pt',
          'scroll-pr',
          'scroll-pb',
          'scroll-pl'
        ],
        'scroll-px': ['scroll-pr', 'scroll-pl'],
        'scroll-py': ['scroll-pt', 'scroll-pb'],
        touch: ['touch-x', 'touch-y', 'touch-pz'],
        'touch-x': ['touch'],
        'touch-y': ['touch'],
        'touch-pz': ['touch']
      },
      conflictingClassGroupModifiers: { 'font-size': ['leading'] },
      orderSensitiveModifiers: [
        '*',
        '**',
        'after',
        'backdrop',
        'before',
        'details-content',
        'file',
        'first-letter',
        'first-line',
        'marker',
        'placeholder',
        'selection'
      ]
    }
  },
  Ao = so(Ro)
function Mo(...e) {
  return Ao(_e(e))
}
export { _e as a, Mo as c, So as j }
