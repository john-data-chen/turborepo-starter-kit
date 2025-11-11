try {
  ;(() => {
    const e = 'storybook/links'
    const n = { NAVIGATE: `${e}/navigate`, REQUEST: `${e}/request`, RECEIVE: `${e}/receive` }
    const f = __STORYBOOK_API__,
      {
        ActiveTabs: v,
        Consumer: j,
        ManagerContext: g,
        Provider: T,
        RequestResponseError: O,
        addons: a,
        combineParameters: U,
        controlOrMetaKey: E,
        controlOrMetaSymbol: A,
        eventMatchesShortcut: P,
        eventToShortcut: x,
        experimental_MockUniversalStore: R,
        experimental_UniversalStore: I,
        experimental_getStatusStore: D,
        experimental_getTestProviderStore: M,
        experimental_requestResponse: C,
        experimental_useStatusStore: N,
        experimental_useTestProviderStore: K,
        experimental_useUniversalStore: B,
        internal_fullStatusStore: V,
        internal_fullTestProviderStore: Y,
        internal_universalStatusStore: q,
        internal_universalTestProviderStore: G,
        isMacLike: L,
        isShortcutTaken: $,
        keyToSymbol: H,
        merge: Q,
        mockChannel: w,
        optionOrAltSymbol: z,
        shortcutMatchesShortcut: F,
        shortcutToHumanString: J,
        types: W,
        useAddonState: X,
        useArgTypes: Z,
        useArgs: ee,
        useChannel: oe,
        useGlobalTypes: re,
        useGlobals: te,
        useParameter: se,
        useSharedState: ne,
        useStoryPrepared: ae,
        useStorybookApi: _e,
        useStorybookState: de
      } = __STORYBOOK_API__
    a.register(e, (o) => {
      o.on(n.REQUEST, ({ kind: _, name: d }) => {
        let i = o.storyId(_, d)
        o.emit(n.RECEIVE, i)
      })
    })
  })()
} catch (e) {
  console.error('[Storybook] One of your manager-entries failed: ' + import.meta.url, e)
}
