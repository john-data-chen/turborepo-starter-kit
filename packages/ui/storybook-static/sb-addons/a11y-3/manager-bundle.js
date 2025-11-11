try {
  ;(() => {
    const Tn = Object.defineProperty
    const de = ((e) =>
      typeof require < 'u'
        ? require
        : typeof Proxy < 'u'
          ? new Proxy(e, { get: (t, n) => (typeof require < 'u' ? require : t)[n] })
          : e)(function (e) {
      if (typeof require < 'u') {return require.apply(this, arguments)}
      throw Error('Dynamic require of "' + e + '" is not supported')
    })
    const xe = (e, t) => () => (e && (t = e((e = 0))), t)
    const Cn = (e, t) => {
      for (let n in t) {Tn(e, n, { get: t[n], enumerable: !0 })}
    }
    const A = xe(() => {})
    const T = xe(() => {})
    const C = xe(() => {})
    const wt = {}
    Cn(wt, {
      A: () => Hn,
      ActionBar: () => Un,
      AddonPanel: () => jn,
      Badge: () => ne,
      Bar: () => Bn,
      Blockquote: () => Gn,
      Button: () => ae,
      ClipboardCode: () => qn,
      Code: () => zn,
      DL: () => Wn,
      Div: () => Vn,
      DocumentWrapper: () => Yn,
      EmptyTabContent: () => Ue,
      ErrorFormatter: () => Kn,
      FlexBar: () => Xn,
      Form: () => Qn,
      H1: () => Zn,
      H2: () => Jn,
      H3: () => ea,
      H4: () => ta,
      H5: () => ra,
      H6: () => na,
      HR: () => aa,
      IconButton: () => oe,
      Img: () => oa,
      LI: () => ia,
      Link: () => Se,
      ListItem: () => la,
      Loader: () => sa,
      Modal: () => ca,
      OL: () => ua,
      P: () => da,
      Placeholder: () => ma,
      Pre: () => fa,
      ProgressSpinner: () => pa,
      ResetWrapper: () => ba,
      ScrollArea: () => je,
      Separator: () => ha,
      Spaced: () => ya,
      Span: () => va,
      StorybookIcon: () => ga,
      StorybookLogo: () => Sa,
      SyntaxHighlighter: () => Be,
      TT: () => Ea,
      TabBar: () => $a,
      TabButton: () => Ia,
      TabWrapper: () => _a,
      Table: () => xa,
      Tabs: () => Ra,
      TabsState: () => Aa,
      TooltipLinkList: () => Ge,
      TooltipMessage: () => Ta,
      TooltipNote: () => Ee,
      UL: () => Ca,
      WithTooltip: () => fe,
      WithTooltipPure: () => Oa,
      Zoom: () => ka,
      codeCommon: () => wa,
      components: () => Na,
      createCopyToClipboardFunction: () => Pa,
      default: () => Fn,
      getStoryHref: () => Da,
      interleaveSeparators: () => Ma,
      nameSpaceClassNames: () => La,
      resetComponents: () => Fa,
      withReset: () => Ha
    })
    let Fn,
      Hn,
      Un,
      jn,
      ne,
      Bn,
      Gn,
      ae,
      qn,
      zn,
      Wn,
      Vn,
      Yn,
      Ue,
      Kn,
      Xn,
      Qn,
      Zn,
      Jn,
      ea,
      ta,
      ra,
      na,
      aa,
      oe,
      oa,
      ia,
      Se,
      la,
      sa,
      ca,
      ua,
      da,
      ma,
      fa,
      pa,
      ba,
      je,
      ha,
      ya,
      va,
      ga,
      Sa,
      Be,
      Ea,
      $a,
      Ia,
      _a,
      xa,
      Ra,
      Aa,
      Ge,
      Ta,
      Ee,
      Ca,
      fe,
      Oa,
      ka,
      wa,
      Na,
      Pa,
      Da,
      Ma,
      La,
      Fa,
      Ha,
      ie = xe(() => {
        A()
        T()
        C()
        ;((Fn = __STORYBOOK_COMPONENTS__),
          ({
            A: Hn,
            ActionBar: Un,
            AddonPanel: jn,
            Badge: ne,
            Bar: Bn,
            Blockquote: Gn,
            Button: ae,
            ClipboardCode: qn,
            Code: zn,
            DL: Wn,
            Div: Vn,
            DocumentWrapper: Yn,
            EmptyTabContent: Ue,
            ErrorFormatter: Kn,
            FlexBar: Xn,
            Form: Qn,
            H1: Zn,
            H2: Jn,
            H3: ea,
            H4: ta,
            H5: ra,
            H6: na,
            HR: aa,
            IconButton: oe,
            Img: oa,
            LI: ia,
            Link: Se,
            ListItem: la,
            Loader: sa,
            Modal: ca,
            OL: ua,
            P: da,
            Placeholder: ma,
            Pre: fa,
            ProgressSpinner: pa,
            ResetWrapper: ba,
            ScrollArea: je,
            Separator: ha,
            Spaced: ya,
            Span: va,
            StorybookIcon: ga,
            StorybookLogo: Sa,
            SyntaxHighlighter: Be,
            TT: Ea,
            TabBar: $a,
            TabButton: Ia,
            TabWrapper: _a,
            Table: xa,
            Tabs: Ra,
            TabsState: Aa,
            TooltipLinkList: Ge,
            TooltipMessage: Ta,
            TooltipNote: Ee,
            UL: Ca,
            WithTooltip: fe,
            WithTooltipPure: Oa,
            Zoom: ka,
            codeCommon: wa,
            components: Na,
            createCopyToClipboardFunction: Pa,
            getStoryHref: Da,
            interleaveSeparators: Ma,
            nameSpaceClassNames: La,
            resetComponents: Fa,
            withReset: Ha
          } = __STORYBOOK_COMPONENTS__))
      })
    A()
    T()
    C()
    A()
    T()
    C()
    A()
    T()
    C()
    const q = 'storybook/a11y',
      Re = `${q}/panel`,
      xt = 'a11y',
      ol = `${q}/ui`,
      On = `${q}/result`,
      kn = `${q}/request`,
      wn = `${q}/running`,
      Nn = `${q}/error`,
      Pn = `${q}/manual`,
      Dn = `${q}/select`,
      Mn = 'writing-tests/accessibility-testing',
      Rt = `${Mn}#why-are-my-tests-failing-in-different-environments`,
      le = { RESULT: On, REQUEST: kn, RUNNING: wn, ERROR: Nn, MANUAL: Pn, SELECT: Dn },
      He = 'storybook/component-test',
      At = 'storybook/a11y'
    A()
    T()
    C()
    const Ln = Object.defineProperty,
      l = (e, t) => Ln(e, 'name', { value: t, configurable: !0 })
    A()
    T()
    C()
    const o = __REACT__,
      {
        Children: D,
        Component: pl,
        Fragment: se,
        Profiler: bl,
        PureComponent: Tt,
        StrictMode: hl,
        Suspense: yl,
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: vl,
        act: gl,
        cloneElement: z,
        createContext: me,
        createElement: p,
        createFactory: Sl,
        createRef: Ct,
        forwardRef: P,
        isValidElement: j,
        lazy: El,
        memo: $l,
        startTransition: Il,
        unstable_act: _l,
        useCallback: I,
        useContext: ye,
        useDebugValue: xl,
        useDeferredValue: Rl,
        useEffect: N,
        useId: Ot,
        useImperativeHandle: Al,
        useInsertionEffect: Tl,
        useLayoutEffect: ve,
        useMemo: B,
        useReducer: kt,
        useRef: L,
        useState: G,
        useSyncExternalStore: Cl,
        useTransition: Ol,
        version: kl
      } = __REACT__
    ie()
    A()
    T()
    C()
    const Fl = __STORYBOOK_API__,
      {
        ActiveTabs: Hl,
        Consumer: Ul,
        ManagerContext: jl,
        Provider: Bl,
        RequestResponseError: Gl,
        addons: Te,
        combineParameters: ql,
        controlOrMetaKey: zl,
        controlOrMetaSymbol: Wl,
        eventMatchesShortcut: Vl,
        eventToShortcut: Yl,
        experimental_MockUniversalStore: Kl,
        experimental_UniversalStore: Xl,
        experimental_getStatusStore: Nt,
        experimental_getTestProviderStore: Ql,
        experimental_requestResponse: Zl,
        experimental_useStatusStore: Pt,
        experimental_useTestProviderStore: Jl,
        experimental_useUniversalStore: es,
        internal_fullStatusStore: ts,
        internal_fullTestProviderStore: rs,
        internal_universalStatusStore: ns,
        internal_universalTestProviderStore: as,
        isMacLike: os,
        isShortcutTaken: is,
        keyToSymbol: ls,
        merge: ss,
        mockChannel: cs,
        optionOrAltSymbol: us,
        shortcutMatchesShortcut: ds,
        shortcutToHumanString: ms,
        types: qe,
        useAddonState: Ce,
        useArgTypes: fs,
        useArgs: ps,
        useChannel: Dt,
        useGlobalTypes: bs,
        useGlobals: Mt,
        useParameter: Lt,
        useSharedState: hs,
        useStoryPrepared: ys,
        useStorybookApi: ge,
        useStorybookState: Ft
      } = __STORYBOOK_API__
    ie()
    A()
    T()
    C()
    const $s = __STORYBOOK_ICONS__,
      {
        AccessibilityAltIcon: Is,
        AccessibilityIcon: Ht,
        AccessibilityIgnoredIcon: _s,
        AddIcon: xs,
        AdminIcon: Rs,
        AlertAltIcon: As,
        AlertIcon: Ts,
        AlignLeftIcon: Cs,
        AlignRightIcon: Os,
        AppleIcon: ks,
        ArrowBottomLeftIcon: ws,
        ArrowBottomRightIcon: Ns,
        ArrowDownIcon: Ps,
        ArrowLeftIcon: Ds,
        ArrowRightIcon: Ms,
        ArrowSolidDownIcon: Ls,
        ArrowSolidLeftIcon: Fs,
        ArrowSolidRightIcon: Hs,
        ArrowSolidUpIcon: Us,
        ArrowTopLeftIcon: js,
        ArrowTopRightIcon: Bs,
        ArrowUpIcon: Gs,
        AzureDevOpsIcon: qs,
        BackIcon: zs,
        BasketIcon: Ws,
        BatchAcceptIcon: Vs,
        BatchDenyIcon: Ys,
        BeakerIcon: Ks,
        BellIcon: Xs,
        BitbucketIcon: Qs,
        BoldIcon: Zs,
        BookIcon: Js,
        BookmarkHollowIcon: ec,
        BookmarkIcon: tc,
        BottomBarIcon: rc,
        BottomBarToggleIcon: nc,
        BoxIcon: ac,
        BranchIcon: oc,
        BrowserIcon: ic,
        BugIcon: lc,
        ButtonIcon: sc,
        CPUIcon: cc,
        CalendarIcon: uc,
        CameraIcon: dc,
        CameraStabilizeIcon: mc,
        CategoryIcon: fc,
        CertificateIcon: pc,
        ChangedIcon: bc,
        ChatIcon: hc,
        CheckIcon: Ut,
        ChevronDownIcon: yc,
        ChevronLeftIcon: vc,
        ChevronRightIcon: gc,
        ChevronSmallDownIcon: jt,
        ChevronSmallLeftIcon: Sc,
        ChevronSmallRightIcon: Ec,
        ChevronSmallUpIcon: $c,
        ChevronUpIcon: Ic,
        ChromaticIcon: _c,
        ChromeIcon: xc,
        CircleHollowIcon: Rc,
        CircleIcon: Ac,
        ClearIcon: Tc,
        CloseAltIcon: Cc,
        CloseIcon: Oc,
        CloudHollowIcon: kc,
        CloudIcon: wc,
        CogIcon: Nc,
        CollapseIcon: Bt,
        CommandIcon: Pc,
        CommentAddIcon: Dc,
        CommentIcon: Mc,
        CommentsIcon: Lc,
        CommitIcon: Fc,
        CompassIcon: Hc,
        ComponentDrivenIcon: Uc,
        ComponentIcon: jc,
        ContrastIcon: Bc,
        ContrastIgnoredIcon: Gc,
        ControlsIcon: qc,
        CopyIcon: Gt,
        CreditIcon: zc,
        CrossIcon: Wc,
        DashboardIcon: Vc,
        DatabaseIcon: Yc,
        DeleteIcon: Kc,
        DiamondIcon: Xc,
        DirectionIcon: Qc,
        DiscordIcon: Zc,
        DocChartIcon: Jc,
        DocListIcon: eu,
        DocumentIcon: tu,
        DownloadIcon: ru,
        DragIcon: nu,
        EditIcon: au,
        EditorIcon: ou,
        EllipsisIcon: iu,
        EmailIcon: lu,
        ExpandAltIcon: qt,
        ExpandIcon: su,
        EyeCloseIcon: zt,
        EyeIcon: Wt,
        FaceHappyIcon: cu,
        FaceNeutralIcon: uu,
        FaceSadIcon: du,
        FacebookIcon: mu,
        FailedIcon: fu,
        FastForwardIcon: pu,
        FigmaIcon: bu,
        FilterIcon: hu,
        FlagIcon: yu,
        FolderIcon: vu,
        FormIcon: gu,
        GDriveIcon: Su,
        GiftIcon: Eu,
        GithubIcon: $u,
        GitlabIcon: Iu,
        GlobeIcon: _u,
        GoogleIcon: xu,
        GraphBarIcon: Ru,
        GraphLineIcon: Au,
        GraphqlIcon: Tu,
        GridAltIcon: Cu,
        GridIcon: Ou,
        GrowIcon: ku,
        HeartHollowIcon: wu,
        HeartIcon: Nu,
        HomeIcon: Pu,
        HourglassIcon: Du,
        InfoIcon: Mu,
        ItalicIcon: Lu,
        JumpToIcon: Fu,
        KeyIcon: Hu,
        LightningIcon: Uu,
        LightningOffIcon: ju,
        LinkBrokenIcon: Bu,
        LinkIcon: Gu,
        LinkedinIcon: qu,
        LinuxIcon: zu,
        ListOrderedIcon: Wu,
        ListUnorderedIcon: Vu,
        LocationIcon: Vt,
        LockIcon: Yu,
        MarkdownIcon: Ku,
        MarkupIcon: Xu,
        MediumIcon: Qu,
        MemoryIcon: Zu,
        MenuIcon: Ju,
        MergeIcon: ed,
        MirrorIcon: td,
        MobileIcon: rd,
        MoonIcon: nd,
        NutIcon: ad,
        OutboxIcon: od,
        OutlineIcon: id,
        PaintBrushAltIcon: ld,
        PaintBrushIcon: sd,
        PaperClipIcon: cd,
        ParagraphIcon: ud,
        PassedIcon: dd,
        PhoneIcon: md,
        PhotoDragIcon: fd,
        PhotoIcon: pd,
        PhotoStabilizeIcon: bd,
        PinAltIcon: hd,
        PinIcon: yd,
        PlayAllHollowIcon: vd,
        PlayBackIcon: gd,
        PlayHollowIcon: Sd,
        PlayIcon: Ed,
        PlayNextIcon: $d,
        PlusIcon: Id,
        PointerDefaultIcon: _d,
        PointerHandIcon: xd,
        PowerIcon: Rd,
        PrintIcon: Ad,
        ProceedIcon: Td,
        ProfileIcon: Cd,
        PullRequestIcon: Od,
        QuestionIcon: kd,
        RSSIcon: wd,
        RedirectIcon: Nd,
        ReduxIcon: Pd,
        RefreshIcon: Dd,
        ReplyIcon: Md,
        RepoIcon: Ld,
        RequestChangeIcon: Fd,
        RewindIcon: Hd,
        RulerIcon: Ud,
        SaveIcon: jd,
        SearchIcon: Bd,
        ShareAltIcon: Gd,
        ShareIcon: qd,
        ShieldIcon: zd,
        SideBySideIcon: Wd,
        SidebarAltIcon: Vd,
        SidebarAltToggleIcon: Yd,
        SidebarIcon: Kd,
        SidebarToggleIcon: Xd,
        SortDownIcon: Qd,
        SortUpIcon: Zd,
        SpeakerIcon: Jd,
        StackedIcon: em,
        StarHollowIcon: tm,
        StarIcon: rm,
        StatusFailIcon: nm,
        StatusIcon: am,
        StatusPassIcon: om,
        StatusWarnIcon: im,
        StickerIcon: lm,
        StopAltHollowIcon: sm,
        StopAltIcon: cm,
        StopIcon: um,
        StorybookIcon: dm,
        StructureIcon: mm,
        SubtractIcon: fm,
        SunIcon: pm,
        SupportIcon: bm,
        SweepIcon: hm,
        SwitchAltIcon: ym,
        SyncIcon: Oe,
        TabletIcon: vm,
        ThumbsUpIcon: gm,
        TimeIcon: Sm,
        TimerIcon: Em,
        TransferIcon: $m,
        TrashIcon: Im,
        TwitterIcon: _m,
        TypeIcon: xm,
        UbuntuIcon: Rm,
        UndoIcon: Am,
        UnfoldIcon: Tm,
        UnlockIcon: Cm,
        UnpinIcon: Om,
        UploadIcon: km,
        UserAddIcon: wm,
        UserAltIcon: Nm,
        UserIcon: Pm,
        UsersIcon: Dm,
        VSCodeIcon: Mm,
        VerifiedIcon: Lm,
        VideoIcon: Fm,
        WandIcon: Hm,
        WatchIcon: Um,
        WindowsIcon: jm,
        WrenchIcon: Bm,
        XIcon: Gm,
        YoutubeIcon: qm,
        ZoomIcon: zm,
        ZoomOutIcon: Wm,
        ZoomResetIcon: Vm,
        iconList: Ym
      } = __STORYBOOK_ICONS__
    A()
    T()
    C()
    const Jm = __STORYBOOK_THEMING__,
      {
        CacheProvider: ef,
        ClassNames: tf,
        Global: Yt,
        ThemeProvider: rf,
        background: nf,
        color: af,
        convert: Kt,
        create: of,
        createCache: lf,
        createGlobal: sf,
        createReset: cf,
        css: uf,
        darken: df,
        ensure: mf,
        ignoreSsrWarning: ff,
        isPropValid: pf,
        jsx: bf,
        keyframes: hf,
        lighten: yf,
        styled: $,
        themes: Xt,
        typography: vf,
        useTheme: gf,
        withTheme: Sf
      } = __STORYBOOK_THEMING__
    A()
    T()
    C()
    const xf = __STORYBOOK_CORE_EVENTS__,
      {
        ARGTYPES_INFO_REQUEST: Rf,
        ARGTYPES_INFO_RESPONSE: Af,
        CHANNEL_CREATED: Tf,
        CHANNEL_WS_DISCONNECT: Cf,
        CONFIG_ERROR: Of,
        CREATE_NEW_STORYFILE_REQUEST: kf,
        CREATE_NEW_STORYFILE_RESPONSE: wf,
        CURRENT_STORY_WAS_SET: Nf,
        DOCS_PREPARED: Pf,
        DOCS_RENDERED: Df,
        FILE_COMPONENT_SEARCH_REQUEST: Mf,
        FILE_COMPONENT_SEARCH_RESPONSE: Lf,
        FORCE_REMOUNT: Ff,
        FORCE_RE_RENDER: Hf,
        GLOBALS_UPDATED: Uf,
        NAVIGATE_URL: jf,
        OPEN_IN_EDITOR_REQUEST: Bf,
        OPEN_IN_EDITOR_RESPONSE: Gf,
        PLAY_FUNCTION_THREW_EXCEPTION: qf,
        PRELOAD_ENTRIES: zf,
        PREVIEW_BUILDER_PROGRESS: Wf,
        PREVIEW_INITIALIZED: Vf,
        PREVIEW_KEYDOWN: Yf,
        REGISTER_SUBSCRIPTION: Kf,
        REQUEST_WHATS_NEW_DATA: Xf,
        RESET_STORY_ARGS: Qf,
        RESULT_WHATS_NEW_DATA: Zf,
        SAVE_STORY_REQUEST: Jf,
        SAVE_STORY_RESPONSE: ep,
        SELECT_STORY: tp,
        SET_CONFIG: rp,
        SET_CURRENT_STORY: np,
        SET_FILTER: ap,
        SET_GLOBALS: op,
        SET_INDEX: ip,
        SET_STORIES: lp,
        SET_WHATS_NEW_CACHE: sp,
        SHARED_STATE_CHANGED: cp,
        SHARED_STATE_SET: up,
        STORIES_COLLAPSE_ALL: dp,
        STORIES_EXPAND_ALL: mp,
        STORY_ARGS_UPDATED: fp,
        STORY_CHANGED: Qt,
        STORY_ERRORED: pp,
        STORY_FINISHED: Zt,
        STORY_HOT_UPDATED: Jt,
        STORY_INDEX_INVALIDATED: bp,
        STORY_MISSING: hp,
        STORY_PREPARED: yp,
        STORY_RENDERED: vp,
        STORY_RENDER_PHASE_CHANGED: er,
        STORY_SPECIFIED: gp,
        STORY_THREW_EXCEPTION: Sp,
        STORY_UNCHANGED: Ep,
        TELEMETRY_ERROR: $p,
        TOGGLE_WHATS_NEW_NOTIFICATIONS: Ip,
        UNHANDLED_ERRORS_WHILE_PLAYING: _p,
        UPDATE_GLOBALS: xp,
        UPDATE_QUERY_PARAMS: Rp,
        UPDATE_STORY_ARGS: Ap
      } = __STORYBOOK_CORE_EVENTS__
    A()
    T()
    C()
    A()
    T()
    C()
    const ke = 'storybook/highlight',
      we = `${ke}/add`,
      Ne = `${ke}/remove`,
      Ua = `${ke}/reset`,
      ze = `${ke}/scroll-into-view`
    A()
    T()
    C()
    const Mp = ((e) =>
      typeof de < 'u' ? de : typeof Proxy < 'u' ? new Proxy(e, { get: (t, n) => (typeof de < 'u' ? de : t)[n] }) : e)(
      function (e) {
        if (typeof de < 'u') {return de.apply(this, arguments)}
        throw Error('Dynamic require of "' + e + '" is not supported')
      }
    )
    ie()
    ie()
    A()
    T()
    C()
    const Yp = __REACT_DOM__,
      {
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: Kp,
        createPortal: Xp,
        createRoot: Qp,
        findDOMNode: tr,
        flushSync: rr,
        hydrate: Zp,
        hydrateRoot: Jp,
        render: eb,
        unmountComponentAtNode: tb,
        unstable_batchedUpdates: rb,
        unstable_renderSubtreeIntoContainer: nb,
        version: ab
      } = __REACT_DOM__
    ie()
    ie()
    ie()
    const Y = { VIOLATION: 'violations', PASS: 'passes', INCOMPLETION: 'incomplete' },
      ja = {
        'area-alt': {
          title: '<area> alt text',
          axeSummary: 'Ensure <area> elements of image maps have alternative text',
          friendlySummary: 'Add alt text to all <area> elements of image maps.'
        },
        'aria-allowed-attr': {
          title: 'Supported ARIA attributes',
          axeSummary: "Ensure an element's role supports its ARIA attributes",
          friendlySummary: "Only use ARIA attributes that are permitted for the element's role."
        },
        'aria-braille-equivalent': {
          title: 'Braille equivalent',
          axeSummary: 'Ensure aria-braillelabel and aria-brailleroledescription have a non-braille equivalent',
          friendlySummary: 'If you use braille ARIA labels, also provide a matching non-braille label.'
        },
        'aria-command-name': {
          title: 'ARIA command name',
          axeSummary: 'Ensure every ARIA button, link and menuitem has an accessible name',
          friendlySummary: 'Every ARIA button, link, or menuitem needs a label or accessible name.'
        },
        'aria-conditional-attr': {
          title: 'ARIA attribute valid for role',
          axeSummary: "Ensure ARIA attributes are used as described in the specification of the element's role",
          friendlySummary: "Follow the element role's specification when using ARIA attributes."
        },
        'aria-deprecated-role': {
          title: 'Deprecated ARIA role',
          axeSummary: 'Ensure elements do not use deprecated roles',
          friendlySummary: "Don't use deprecated ARIA roles on elements."
        },
        'aria-hidden-body': {
          title: 'Hidden body',
          axeSummary: 'Ensure aria-hidden="true" is not present on the document <body>',
          friendlySummary: 'Never set aria-hidden="true" on the <body> element.'
        },
        'aria-hidden-focus': {
          title: 'Hidden element focus',
          axeSummary: 'Ensure aria-hidden elements are not focusable nor contain focusable elements',
          friendlySummary: 'Elements marked hidden (aria-hidden) should not be focusable or contain focusable items.'
        },
        'aria-input-field-name': {
          title: 'ARIA input field name',
          axeSummary: 'Ensure every ARIA input field has an accessible name',
          friendlySummary: 'Give each ARIA text input or field a label or accessible name.'
        },
        'aria-meter-name': {
          title: 'ARIA meter name',
          axeSummary: 'Ensure every ARIA meter node has an accessible name',
          friendlySummary: 'Give each element with role="meter" a label or accessible name.'
        },
        'aria-progressbar-name': {
          title: 'ARIA progressbar name',
          axeSummary: 'Ensure every ARIA progressbar node has an accessible name',
          friendlySummary: 'Give each element with role="progressbar" a label or accessible name.'
        },
        'aria-prohibited-attr': {
          title: 'ARIA prohibited attributes',
          axeSummary: "Ensure ARIA attributes are not prohibited for an element's role",
          friendlySummary: "Don't use ARIA attributes that are forbidden for that element's role."
        },
        'aria-required-attr': {
          title: 'ARIA required attributes',
          axeSummary: 'Ensure elements with ARIA roles have all required ARIA attributes',
          friendlySummary: 'Include all required ARIA attributes for elements with that ARIA role.'
        },
        'aria-required-children': {
          title: 'ARIA required children',
          axeSummary: 'Ensure elements with an ARIA role that require child roles contain them',
          friendlySummary: 'If an ARIA role requires specific child roles, include those child elements.'
        },
        'aria-required-parent': {
          title: 'ARIA required parent',
          axeSummary: 'Ensure elements with an ARIA role that require parent roles are contained by them',
          friendlySummary: 'Place elements with certain ARIA roles inside the required parent role element.'
        },
        'aria-roles': {
          title: 'ARIA role value',
          axeSummary: 'Ensure all elements with a role attribute use a valid value',
          friendlySummary: 'Use only valid values in the role attribute (no typos or invalid roles).'
        },
        'aria-toggle-field-name': {
          title: 'ARIA toggle field name',
          axeSummary: 'Ensure every ARIA toggle field has an accessible name',
          friendlySummary:
            'Every ARIA toggle field (elements with the checkbox, radio, or switch roles) needs an accessible name.'
        },
        'aria-tooltip-name': {
          title: 'ARIA tooltip name',
          axeSummary: 'Ensure every ARIA tooltip node has an accessible name',
          friendlySummary: 'Give each element with role="tooltip" a descriptive accessible name.'
        },
        'aria-valid-attr-value': {
          title: 'ARIA attribute values valid',
          axeSummary: 'Ensure all ARIA attributes have valid values',
          friendlySummary: 'Use only valid values for ARIA attributes (no typos or invalid values).'
        },
        'aria-valid-attr': {
          title: 'ARIA attribute valid',
          axeSummary: 'Ensure attributes that begin with aria- are valid ARIA attributes',
          friendlySummary: 'Use only valid aria-* attributes (make sure the attribute name is correct).'
        },
        blink: {
          title: '<blink> element',
          axeSummary: 'Ensure <blink> elements are not used',
          friendlySummary: "Don't use the deprecated <blink> element."
        },
        'button-name': {
          title: 'Button name',
          axeSummary: 'Ensure buttons have discernible text',
          friendlySummary: 'Every <button> needs a visible label or accessible name.'
        },
        bypass: {
          title: 'Navigation bypass',
          axeSummary: 'Ensure each page has at least one mechanism to bypass navigation and jump to content',
          friendlySummary: 'Provide a way to skip repetitive navigation (e.g. a "Skip to content" link).'
        },
        'color-contrast': {
          title: 'Color contrast',
          axeSummary: 'Ensure the contrast between foreground and background text meets WCAG 2 AA minimum thresholds',
          friendlySummary: 'The color contrast between text and its background meets WCAG AA contrast ratio.'
        },
        'definition-list': {
          title: 'Definition list structure',
          axeSummary: 'Ensure <dl> elements are structured correctly',
          friendlySummary: 'Definition lists (<dl>) should directly contain <dt> and <dd> elements in order.'
        },
        dlitem: {
          title: 'Definition list items',
          axeSummary: 'Ensure <dt> and <dd> elements are contained by a <dl>',
          friendlySummary: 'Ensure <dt> and <dd> elements are contained by a <dl>'
        },
        'document-title': {
          title: 'Document title',
          axeSummary: 'Ensure each HTML document contains a non-empty <title> element',
          friendlySummary: 'Include a non-empty <title> element for every page.'
        },
        'duplicate-id-aria': {
          title: 'Unique id',
          axeSummary: 'Ensure every id attribute value used in ARIA and in labels is unique',
          friendlySummary: 'Every id used for ARIA or form labels should be unique on the page.'
        },
        'form-field-multiple-labels': {
          title: 'Multiple form field labels',
          axeSummary: 'Ensure a form field does not have multiple <label> elements',
          friendlySummary: "Don't give a single form field more than one <label>."
        },
        'frame-focusable-content': {
          title: 'Focusable frames',
          axeSummary: 'Ensure <frame> and <iframe> with focusable content do not have tabindex="-1"',
          friendlySummary: `Don't set tabindex="-1" on a <frame> or <iframe> that contains focusable elements.`
        },
        'frame-title-unique': {
          title: 'Unique frame title',
          axeSummary: 'Ensure <iframe> and <frame> elements contain a unique title attribute',
          friendlySummary: 'Use a unique title attribute for each <frame> or <iframe> on the page.'
        },
        'frame-title': {
          title: 'Frame title',
          axeSummary: 'Ensure <iframe> and <frame> elements have an accessible name',
          friendlySummary: 'Every <frame> and <iframe> needs a title or accessible name.'
        },
        'html-has-lang': {
          title: '<html> has lang',
          axeSummary: 'Ensure every HTML document has a lang attribute',
          friendlySummary: 'Add a lang attribute to the <html> element.'
        },
        'html-lang-valid': {
          title: '<html> lang valid',
          axeSummary: 'Ensure the <html lang> attribute has a valid value',
          friendlySummary: 'Use a valid language code in the <html lang> attribute.'
        },
        'html-xml-lang-mismatch': {
          title: 'HTML and XML lang mismatch',
          axeSummary: "Ensure that HTML elements with both lang and xml:lang agree on the page's language",
          friendlySummary: 'If using both lang and xml:lang on <html>, make sure they are the same language.'
        },
        'image-alt': {
          title: 'Image alt text',
          axeSummary: 'Ensure <img> elements have alternative text or a role of none/presentation',
          friendlySummary: 'Give every image alt text or mark it as decorative with alt="".'
        },
        'input-button-name': {
          title: 'Input button name',
          axeSummary: 'Ensure input buttons have discernible text',
          friendlySummary: 'Give each <input type="button"> or similar a clear label (text or aria-label).'
        },
        'input-image-alt': {
          title: 'Input image alt',
          axeSummary: 'Ensure <input type="image"> elements have alternative text',
          friendlySummary: '<input type="image"> must have alt text describing its image.'
        },
        label: {
          title: 'Form label',
          axeSummary: 'Ensure every form element has a label',
          friendlySummary: 'Every form field needs an associated label.'
        },
        'link-in-text-block': {
          title: 'Identifiable links',
          axeSummary: 'Ensure links are distinguishable from surrounding text without relying on color',
          friendlySummary: 'Make sure links are obviously identifiable without relying only on color.'
        },
        'link-name': {
          title: 'Link name',
          axeSummary: 'Ensure links have discernible text',
          friendlySummary: 'Give each link meaningful text or an aria-label so its purpose is clear.'
        },
        list: {
          title: 'List structure',
          axeSummary: 'Ensure that lists are structured correctly',
          friendlySummary: 'Use proper list structure. Only use <li> inside <ul> or <ol>.'
        },
        listitem: {
          title: 'List item',
          axeSummary: 'Ensure <li> elements are used semantically',
          friendlySummary: 'Only use <li> tags inside <ul> or <ol> lists.'
        },
        marquee: {
          title: '<marquee> element',
          axeSummary: 'Ensure <marquee> elements are not used',
          friendlySummary: "Don't use the deprecated <marquee> element."
        },
        'meta-refresh': {
          title: '<meta> refresh',
          axeSummary: 'Ensure <meta http-equiv="refresh"> is not used for delayed refresh',
          friendlySummary: 'Avoid auto-refreshing or redirecting pages using <meta http-equiv="refresh">.'
        },
        'meta-viewport': {
          title: '<meta> viewport scaling',
          axeSummary: 'Ensure <meta name="viewport"> does not disable text scaling and zooming',
          friendlySummary: `Don't disable user zooming in <meta name="viewport"> to allow scaling.`
        },
        'nested-interactive': {
          title: 'Nested interactive controls',
          axeSummary: 'Ensure interactive controls are not nested (nesting causes screen reader/focus issues)',
          friendlySummary: 'Do not nest interactive elements; it can confuse screen readers and keyboard focus.'
        },
        'no-autoplay-audio': {
          title: 'Autoplaying video',
          axeSummary: 'Ensure <video> or <audio> do not autoplay audio > 3 seconds without a control to stop/mute',
          friendlySummary: "Don't autoplay audio for more than 3 seconds without providing a way to stop or mute it."
        },
        'object-alt': {
          title: '<object> alt text',
          axeSummary: 'Ensure <object> elements have alternative text',
          friendlySummary: 'Provide alternative text or content for <object> elements.'
        },
        'role-img-alt': {
          title: 'role="img" alt text',
          axeSummary: 'Ensure elements with role="img" have alternative text',
          friendlySummary: 'Any element with role="img" needs alt text.'
        },
        'scrollable-region-focusable': {
          title: 'Scrollable element focusable',
          axeSummary: 'Ensure elements with scrollable content are keyboard-accessible',
          friendlySummary: 'If an area can scroll, ensure it can be focused and scrolled via keyboard.'
        },
        'select-name': {
          title: '<select> name',
          axeSummary: 'Ensure <select> elements have an accessible name',
          friendlySummary: 'Give each <select> field a label or other accessible name.'
        },
        'server-side-image-map': {
          title: 'Server-side image map',
          axeSummary: 'Ensure that server-side image maps are not used',
          friendlySummary: "Don't use server-side image maps."
        },
        'svg-img-alt': {
          title: 'SVG image alt text',
          axeSummary: 'Ensure <svg> images/graphics have accessible text',
          friendlySummary: 'SVG images with role="img" or similar need a text description.'
        },
        'td-headers-attr': {
          title: 'Table headers attribute',
          axeSummary: 'Ensure each cell in a table using headers only refers to <th> in that table',
          friendlySummary: 'In tables using the headers attribute, only reference other cells in the same table.'
        },
        'th-has-data-cells': {
          title: '<th> has data cell',
          axeSummary: 'Ensure <th> (or header role) elements have data cells they describe',
          friendlySummary: 'Every table header (<th> or header role) should correspond to at least one data cell.'
        },
        'valid-lang': {
          title: 'Valid lang',
          axeSummary: 'Ensure lang attributes have valid values',
          friendlySummary: 'Use valid language codes in all lang attributes.'
        },
        'video-caption': {
          title: '<video> captions',
          axeSummary: 'Ensure <video> elements have captions',
          friendlySummary: 'Provide captions for all <video> content.'
        }
      },
      Ba = {
        'autocomplete-valid': {
          title: 'autocomplete attribute valid',
          axeSummary: 'Ensure the autocomplete attribute is correct and suitable for the form field',
          friendlySummary: "Use valid autocomplete values that match the form field's purpose."
        },
        'avoid-inline-spacing': {
          title: 'Forced inline spacing',
          axeSummary: 'Ensure that text spacing set via inline styles can be adjusted with custom CSS',
          friendlySummary:
            "Don't lock in text spacing with forced (!important) inline styles\u2014allow user CSS to adjust text spacing."
        }
      },
      Ga = {
        'target-size': {
          title: 'Touch target size',
          axeSummary: 'Ensure touch targets have sufficient size and space',
          friendlySummary: 'Make sure interactive elements are big enough and not too close together for touch.'
        }
      },
      qa = {
        accesskeys: {
          title: 'Unique accesskey',
          axeSummary: 'Ensure every accesskey attribute value is unique',
          friendlySummary: 'Use unique values for all accesskey attributes.'
        },
        'aria-allowed-role': {
          title: 'Appropriate role value',
          axeSummary: 'Ensure the role attribute has an appropriate value for the element',
          friendlySummary: 'ARIA roles should have a valid value for the element.'
        },
        'aria-dialog-name': {
          title: 'ARIA dialog name',
          axeSummary: 'Ensure every ARIA dialog and alertdialog has an accessible name',
          friendlySummary: 'Give each ARIA dialog or alertdialog a title or accessible name.'
        },
        'aria-text': {
          title: 'ARIA role="text"',
          axeSummary: 'Ensure role="text" is used on elements with no focusable descendants',
          friendlySummary: `Only use role="text" on elements that don't contain focusable elements.`
        },
        'aria-treeitem-name': {
          title: 'ARIA treeitem name',
          axeSummary: 'Ensure every ARIA treeitem node has an accessible name',
          friendlySummary: 'Give each ARIA treeitem a label or accessible name.'
        },
        'empty-heading': {
          title: 'Empty heading',
          axeSummary: 'Ensure headings have discernible text',
          friendlySummary: "Don't leave heading elements empty or hide them."
        },
        'empty-table-header': {
          title: 'Empty table header',
          axeSummary: 'Ensure table headers have discernible text',
          friendlySummary: 'Make sure table header cells have visible text.'
        },
        'frame-tested': {
          title: 'Test all frames',
          axeSummary: 'Ensure <iframe> and <frame> elements contain the axe-core script',
          friendlySummary: 'Make sure axe-core is injected into all frames or iframes so they are tested.'
        },
        'heading-order': {
          title: 'Heading order',
          axeSummary: 'Ensure the order of headings is semantically correct (no skipping levels)',
          friendlySummary: "Use proper heading order (don't skip heading levels)."
        },
        'image-redundant-alt': {
          title: 'Redundant image alt text',
          axeSummary: 'Ensure image alternative text is not repeated as nearby text',
          friendlySummary: "Avoid repeating the same information in both an image's alt text and nearby text."
        },
        'label-title-only': {
          title: 'Visible form element label',
          axeSummary: 'Ensure each form element has a visible label (not only title/ARIA)',
          friendlySummary: 'Every form input needs a visible label (not only a title attribute or hidden text).'
        },
        'landmark-banner-is-top-level': {
          title: 'Top-level landmark banner',
          axeSummary: 'Ensure the banner landmark is at top level (not nested)',
          friendlySummary:
            'Use the banner landmark (e.g. site header) only at the top level of the page, not inside another landmark.'
        },
        'landmark-complementary-is-top-level': {
          title: 'Top-level <aside>',
          axeSummary: 'Ensure the complementary landmark (<aside>) is top level',
          friendlySummary:
            'The complementary landmark <aside> or role="complementary" should be a top-level region, not nested in another landmark.'
        },
        'landmark-contentinfo-is-top-level': {
          title: 'Top-level contentinfo',
          axeSummary: 'Ensure the contentinfo landmark (footer) is top level',
          friendlySummary:
            'Make sure the contentinfo landmark (footer) is at the top level of the page and not contained in another landmark.'
        },
        'landmark-main-is-top-level': {
          title: 'Top-level main',
          axeSummary: 'Ensure the main landmark is at top level',
          friendlySummary: 'The main landmark should be a top-level element and not nested inside another landmark.'
        },
        'landmark-no-duplicate-banner': {
          title: 'Duplicate banner landmark',
          axeSummary: 'Ensure the document has at most one banner landmark',
          friendlySummary: 'Have only one role="banner" or <header> on a page.'
        },
        'landmark-no-duplicate-contentinfo': {
          title: 'Duplicate contentinfo',
          axeSummary: 'Ensure the document has at most one contentinfo landmark',
          friendlySummary: 'Have only one role="contentinfo" or <footer> on a page.'
        },
        'landmark-no-duplicate-main': {
          title: 'Duplicate main',
          axeSummary: 'Ensure the document has at most one main landmark',
          friendlySummary: 'Have only one role="main" or <main> on a page.'
        },
        'landmark-one-main': {
          title: 'main landmark',
          axeSummary: 'Ensure the document has a main landmark',
          friendlySummary: 'Include a main landmark on each page using a <main> region or role="main".'
        },
        'landmark-unique': {
          title: 'Unique landmark',
          axeSummary: 'Ensure landmarks have a unique role or role/label combination',
          friendlySummary: 'If you use multiple landmarks of the same type, give them unique labels (names).'
        },
        'meta-viewport-large': {
          title: 'Significant viewport scaling',
          axeSummary: 'Ensure <meta name="viewport"> can scale a significant amount (e.g. 500%)',
          friendlySummary: '<meta name="viewport"> should allow users to significantly scale content.'
        },
        'page-has-heading-one': {
          title: 'Has <h1>',
          axeSummary: 'Ensure the page (or at least one frame) contains a level-one heading',
          friendlySummary: 'Every page or frame should have at least one <h1> heading.'
        },
        'presentation-role-conflict': {
          title: 'Presentational content',
          axeSummary: 'Ensure elements with role="presentation"/"none" have no ARIA or tabindex',
          friendlySummary: `Don't give elements with role="none"/"presentation" any ARIA attributes or a tabindex.`
        },
        region: {
          title: 'Landmark regions',
          axeSummary: 'Ensure all page content is contained by landmarks',
          friendlySummary: 'Wrap all page content in appropriate landmark regions (<header>, <main>, <footer>, etc.).'
        },
        'scope-attr-valid': {
          title: 'scope attribute',
          axeSummary: 'Ensure the scope attribute is used correctly on tables',
          friendlySummary: 'Use the scope attribute only on <th> elements, with proper values (col, row, etc.).'
        },
        'skip-link': {
          title: 'Skip link',
          axeSummary: 'Ensure all "skip" links have a focusable target',
          friendlySummary: 'Make sure any "skip to content" link targets an existing, focusable element.'
        },
        tabindex: {
          title: 'tabindex values',
          axeSummary: 'Ensure tabindex attribute values are not greater than 0',
          friendlySummary: "Don't use tabindex values greater than 0."
        },
        'table-duplicate-name': {
          title: 'Duplicate names for table',
          axeSummary: 'Ensure the <caption> does not duplicate the summary attribute text',
          friendlySummary: "Don't use the same text in both a table's <caption> and its summary attribute."
        }
      },
      za = {
        'color-contrast-enhanced': {
          title: 'Enhanced color contrast',
          axeSummary: 'Ensure contrast between text and background meets WCAG 2 AAA enhanced contrast thresholds',
          friendlySummary: 'Use extra-high contrast for text and background to meet WCAG AAA level.'
        },
        'identical-links-same-purpose': {
          title: 'Same link name, same purpose',
          axeSummary: 'Ensure links with the same accessible name serve a similar purpose',
          friendlySummary: 'If two links have the same text, they should do the same thing (lead to the same content).'
        },
        'meta-refresh-no-exceptions': {
          title: 'No <meta http-equiv="refresh">',
          axeSummary: 'Ensure <meta http-equiv="refresh"> is not used for delayed refresh (no exceptions)',
          friendlySummary: `Don't auto-refresh or redirect pages using <meta http-equiv="refresh"> even with a delay.`
        }
      },
      Wa = {
        'css-orientation-lock': {
          title: 'CSS orientation lock',
          axeSummary: 'Ensure content is not locked to a specific display orientation (works in all orientations)',
          friendlySummary: "Don't lock content to one screen orientation; support both portrait and landscape modes."
        },
        'focus-order-semantics': {
          title: 'Focus order semantic role',
          axeSummary: 'Ensure elements in the tab order have a role appropriate for interactive content',
          friendlySummary: 'Ensure elements in the tab order have a role appropriate for interactive content'
        },
        'hidden-content': {
          title: 'Hidden content',
          axeSummary: 'Informs users about hidden content',
          friendlySummary: 'Display hidden content on the page for test analysis.'
        },
        'label-content-name-mismatch': {
          title: 'Content name mismatch',
          axeSummary: 'Ensure elements labeled by their content include that text in their accessible name',
          friendlySummary: "If an element's visible text serves as its label, include that text in its accessible name."
        },
        'p-as-heading': {
          title: 'No <p> headings',
          axeSummary: "Ensure <p> elements aren't styled to look like headings (use real headings)",
          friendlySummary:
            "Don't just style a <p> to look like a heading \u2013 use an actual heading tag for headings."
        },
        'table-fake-caption': {
          title: 'Table caption',
          axeSummary: 'Ensure that tables with a caption use the <caption> element',
          friendlySummary: 'Use a <caption> element for table captions instead of just styled text.'
        },
        'td-has-header': {
          title: '<td> has header',
          axeSummary: 'Ensure each non-empty data cell in large tables (3\xD73+) has one or more headers',
          friendlySummary: 'Every data cell in large tables should be associated with at least one header cell.'
        }
      },
      Va = {
        'aria-roledescription': {
          title: 'aria-roledescription',
          axeSummary: 'Ensure aria-roledescription is only used on elements with an implicit or explicit role',
          friendlySummary: 'Only use aria-roledescription on elements that already have a defined role.'
        }
      },
      hr = { ...ja, ...Ba, ...Ga, ...za, ...qa, ...Wa, ...Va },
      Ze = l((e) => hr[e.id]?.title || e.id, 'getTitleForAxeResult'),
      Je = l((e) => hr[e.id]?.friendlySummary || e.description, 'getFriendlySummaryForAxeResult'),
      Ya = ['html', 'body', 'main'],
      We = Kt(Xt.light),
      Ve = { [Y.VIOLATION]: We.color.negative, [Y.PASS]: We.color.positive, [Y.INCOMPLETION]: We.color.warning },
      yr = me({
        parameters: {},
        results: void 0,
        highlighted: !1,
        toggleHighlight: l(() => {}, 'toggleHighlight'),
        tab: Y.VIOLATION,
        handleCopyLink: l(() => {}, 'handleCopyLink'),
        setTab: l(() => {}, 'setTab'),
        setStatus: l(() => {}, 'setStatus'),
        status: 'initial',
        error: void 0,
        handleManual: l(() => {}, 'handleManual'),
        discrepancy: null,
        selectedItems: new Map(),
        allExpanded: !1,
        toggleOpen: l(() => {}, 'toggleOpen'),
        handleCollapseAll: l(() => {}, 'handleCollapseAll'),
        handleExpandAll: l(() => {}, 'handleExpandAll'),
        handleJumpToElement: l(() => {}, 'handleJumpToElement'),
        handleSelectionChange: l(() => {}, 'handleSelectionChange')
      }),
      Ka = l((e) => {
        let t = Lt('a11y', {}),
          [n] = Mt() ?? [],
          r = ge(),
          a = I((h = !1) => (h ? 'manual' : 'initial'), []),
          i = B(() => n?.a11y?.manual ?? !1, [n?.a11y?.manual]),
          s = B(() => {
            let h = r.getQueryParam('a11ySelection')
            return (h && r.setQueryParams({ a11ySelection: '' }), h)
          }, [r]),
          [u, d] = Ce(q, { ui: { highlighted: !1, tab: Y.VIOLATION }, results: void 0, error: void 0, status: a(i) }),
          { ui: c, results: f, error: m, status: b } = u,
          { storyId: y } = Ft(),
          g = Pt((h) => h[y]?.[At]?.value)
        N(
          () =>
            Nt('storybook/component-test').onAllStatusChange((E, v) => {
              let w = E[y]?.[He],
                H = v[y]?.[He]
              w?.value === 'status-value:error' &&
                H?.value !== 'status-value:error' &&
                d((be) => ({ ...be, status: 'component-test-error' }))
            }),
          [d, y]
        )
        let O = I(() => {
            d((h) => ({ ...h, ui: { ...h.ui, highlighted: !h.ui.highlighted } }))
          }, [d]),
          [_, S] = G(() => {
            let h = new Map()
            if (s && /^[a-z]+.[a-z-]+.[0-9]+$/.test(s)) {
              let [E, v] = s.split('.')
              h.set(`${E}.${v}`, s)
            }
            return h
          }),
          x = B(() => f?.[c.tab]?.every((E) => _.has(`${c.tab}.${E.id}`)) ?? !1, [f, _, c.tab]),
          K = I((h, E, v) => {
            h.stopPropagation()
            let w = `${E}.${v.id}`
            S((H) => new Map(H.delete(w) ? H : H.set(w, `${w}.1`)))
          }, []),
          U = I(() => {
            S(new Map())
          }, []),
          W = I(() => {
            S(
              (h) =>
                new Map(
                  f?.[c.tab]?.map((E) => {
                    let v = `${c.tab}.${E.id}`
                    return [v, h.get(v) ?? `${v}.1`]
                  }) ?? []
                )
            )
          }, [f, c.tab]),
          k = I((h) => {
            let [E, v] = h.split('.')
            S((w) => new Map(w.set(`${E}.${v}`, h)))
          }, []),
          R = I(
            (h) => {
              d((E) => ({ ...E, status: 'error', error: h }))
            },
            [d]
          ),
          F = I(
            (h, E) => {
              y === E &&
                (d((v) => ({ ...v, status: 'ran', results: h })),
                setTimeout(() => {
                  ;(d((v) => (v.status === 'ran' ? { ...v, status: 'ready' } : v)),
                    S((v) => {
                      if (v.size === 1) {
                        let [w] = v.values()
                        document.getElementById(w)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                      return v
                    }))
                }, 900))
            },
            [y, d, S]
          ),
          J = I(
            (h, E) => {
              let [v, w] = h.split('.'),
                { helpUrl: H, nodes: be } = f?.[v]?.find((ue) => ue.id === w) || {},
                _t = H && window.open(H, '_blank', 'noopener,noreferrer')
              if (be && !_t) {
                let ue = be.findIndex((he) => E.selectors.some((An) => An === String(he.target))) ?? -1
                if (ue !== -1) {
                  let he = `${v}.${w}.${ue + 1}`
                  ;(S(new Map([[`${v}.${w}`, he]])),
                    setTimeout(() => {
                      document.getElementById(he)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 100))
                }
              }
            },
            [f]
          ),
          te = I(
            ({ reporters: h }) => {
              let E = h.find((v) => v.type === 'a11y')
              E && ('error' in E.result ? R(E.result.error) : F(E.result, y))
            },
            [R, F, y]
          ),
          pe = I(
            ({ newPhase: h }) => {
              h === 'loading'
                ? d((E) => ({ ...E, results: void 0, status: i ? 'manual' : 'initial' }))
                : h === 'afterEach' && !i && d((E) => ({ ...E, status: 'running' }))
            },
            [i, d]
          ),
          V = Dt(
            {
              [le.RESULT]: F,
              [le.ERROR]: R,
              [le.SELECT]: J,
              [Qt]: () => S(new Map()),
              [er]: pe,
              [Zt]: te,
              [Jt]: () => {
                ;(d((h) => ({ ...h, status: 'running' })), V(le.MANUAL, y, t))
              }
            },
            [pe, te, J, R, F, t, y]
          ),
          _e = I(() => {
            ;(d((h) => ({ ...h, status: 'running' })), V(le.MANUAL, y, t))
          }, [V, t, d, y]),
          Fe = I(async (h) => {
            let { createCopyToClipboardFunction: E } = await Promise.resolve().then(() => (ie(), wt))
            await E()(`${window.location.origin}${h}`)
          }, []),
          re = I((h) => V(ze, h), [V])
        N(() => {
          d((h) => ({ ...h, status: a(i) }))
        }, [a, i, d])
        let It = b === 'initial'
        ;(N(() => {
          s &&
            d((h) => {
              let E = { ...h.ui, highlighted: !0 },
                [v] = s.split('.') ?? []
              return (v && Object.values(Y).includes(v) && (E.tab = v), { ...h, ui: E })
            })
        }, [s]),
          N(() => {
            if ((V(Ne, `${q}/selected`), V(Ne, `${q}/others`), !c.highlighted || It)) {return}
            let h = Array.from(_.values()).flatMap((v) => {
              let [w, H, be] = v.split('.')
              if (w !== c.tab) {return []}
              let ue = f?.[w]?.find((he) => he.id === H)?.nodes[Number(be) - 1]?.target
              return ue ? [String(ue)] : []
            })
            h.length &&
              V(we, {
                id: `${q}/selected`,
                priority: 1,
                selectors: h,
                styles: {
                  outline: `1px solid color-mix(in srgb, ${Ve[c.tab]}, transparent 30%)`,
                  backgroundColor: 'transparent'
                },
                hoverStyles: { outlineWidth: '2px' },
                focusStyles: { backgroundColor: 'transparent' },
                menu: f?.[c.tab].map((v) => {
                  let w = v.nodes
                    .flatMap((H) => H.target)
                    .map(String)
                    .filter((H) => h.includes(H))
                  return [
                    { id: `${c.tab}.${v.id}:info`, title: Ze(v), description: Je(v), selectors: w },
                    {
                      id: `${c.tab}.${v.id}`,
                      iconLeft: 'info',
                      iconRight: 'shareAlt',
                      title: 'Learn how to resolve this violation',
                      clickEvent: le.SELECT,
                      selectors: w
                    }
                  ]
                })
              })
            let E = f?.[c.tab]
              .flatMap((v) => v.nodes.flatMap((w) => w.target).map(String))
              .filter((v) => ![...Ya, ...h].includes(v))
            E?.length &&
              V(we, {
                id: `${q}/others`,
                selectors: E,
                styles: {
                  outline: `1px solid color-mix(in srgb, ${Ve[c.tab]}, transparent 30%)`,
                  backgroundColor: `color-mix(in srgb, ${Ve[c.tab]}, transparent 60%)`
                },
                hoverStyles: { outlineWidth: '2px' },
                focusStyles: { backgroundColor: 'transparent' },
                menu: f?.[c.tab].map((v) => {
                  let w = v.nodes
                    .flatMap((H) => H.target)
                    .map(String)
                    .filter((H) => !h.includes(H))
                  return [
                    { id: `${c.tab}.${v.id}:info`, title: Ze(v), description: Je(v), selectors: w },
                    {
                      id: `${c.tab}.${v.id}`,
                      iconLeft: 'info',
                      iconRight: 'shareAlt',
                      title: 'Learn how to resolve this violation',
                      clickEvent: le.SELECT,
                      selectors: w
                    }
                  ]
                })
              })
          }, [It, V, c.highlighted, f, c.tab, _]))
        let Rn = B(() => {
          if (!g) {return null}
          if (g === 'status-value:success' && f?.violations.length) {return 'cliPassedBrowserFailed'}
          if (g === 'status-value:error' && !f?.violations.length) {
            if (b === 'ready' || b === 'ran') {return 'browserPassedCliFailed'}
            if (b === 'manual') {return 'cliFailedButModeManual'}
          }
          return null
        }, [f?.violations.length, b, g])
        return o.createElement(yr.Provider, {
          value: {
            parameters: t,
            results: f,
            highlighted: c.highlighted,
            toggleHighlight: O,
            tab: c.tab,
            setTab: I((h) => d((E) => ({ ...E, ui: { ...E.ui, tab: h } })), [d]),
            handleCopyLink: Fe,
            status: b,
            setStatus: I((h) => d((E) => ({ ...E, status: h })), [d]),
            error: m,
            handleManual: _e,
            discrepancy: Rn,
            selectedItems: _,
            toggleOpen: K,
            allExpanded: x,
            handleCollapseAll: U,
            handleExpandAll: W,
            handleJumpToElement: re,
            handleSelectionChange: k
          },
          ...e
        })
      }, 'A11yContextProvider'),
      ut = l(() => ye(yr), 'useA11yContext')
    function M() {
      return (
        (M = Object.assign
          ? Object.assign.bind()
          : function (e) {
              for (let t = 1; t < arguments.length; t++) {
                const n = arguments[t]
                for (let r in n) Object.hasOwn(n, r) && (e[r] = n[r])
              }
              return e
            }),
        M.apply(null, arguments)
      )
    }
    l(M, '_extends')
    function ee(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
      return l(function (a) {
        if ((e?.(a), n === !1 || !a.defaultPrevented)) {return t?.(a)}
      }, 'handleEvent')
    }
    l(ee, '$e42e1063c40fb3ef$export$b9ecd428b558ff10')
    function De(e, t = []) {
      let n = []
      function r(i, s) {
        let u = me(s),
          d = n.length
        n = [...n, s]
        function c(m) {
          let { scope: b, children: y, ...g } = m,
            O = b?.[e][d] || u,
            _ = B(() => g, Object.values(g))
          return p(O.Provider, { value: _ }, y)
        }
        l(c, 'Provider')
        function f(m, b) {
          let y = b?.[e][d] || u,
            g = ye(y)
          if (g) {return g}
          if (s !== void 0) {return s}
          throw new Error(`\`${m}\` must be used within \`${i}\``)
        }
        return (l(f, 'useContext'), (c.displayName = i + 'Provider'), [c, f])
      }
      l(r, '$c512c27ab02ef895$export$fd42f52fd3ae1109')
      let a = l(() => {
        let i = n.map((s) => me(s))
        return l(function (u) {
          let d = u?.[e] || i
          return B(() => ({ [`__scope${e}`]: { ...u, [e]: d } }), [u, d])
        }, 'useScope')
      }, 'createScope')
      return ((a.scopeName = e), [r, vr(a, ...t)])
    }
    l(De, '$c512c27ab02ef895$export$50c7b4e9d9f19c1')
    function vr(...e) {
      let t = e[0]
      if (e.length === 1) {return t}
      let n = l(() => {
        let r = e.map((a) => ({ useScope: a(), scopeName: a.scopeName }))
        return l(function (i) {
          let s = r.reduce((u, { useScope: d, scopeName: c }) => {
            let m = d(i)[`__scope${c}`]
            return { ...u, ...m }
          }, {})
          return B(() => ({ [`__scope${t.scopeName}`]: s }), [s])
        }, 'useComposedScopes')
      }, 'createScope1')
      return ((n.scopeName = t.scopeName), n)
    }
    l(vr, '$c512c27ab02ef895$var$composeContextScopes')
    function gr(e, t) {
      typeof e === 'function' ? e(t) : e != null && (e.current = t)
    }
    l(gr, '$6ed0406888f73fc4$var$setRef')
    function dt(...e) {
      return (t) => e.forEach((n) => gr(n, t))
    }
    l(dt, '$6ed0406888f73fc4$export$43e446d32b3d21af')
    function et(...e) {
      return I(dt(...e), e)
    }
    l(et, '$6ed0406888f73fc4$export$c7b2cbe3552a0d05')
    const tt = P((e, t) => {
      let { children: n, ...r } = e,
        a = D.toArray(n),
        i = a.find(Sr)
      if (i) {
        let s = i.props.children,
          u = a.map((d) => (d === i ? (D.count(s) > 1 ? D.only(null) : j(s) ? s.props.children : null) : d))
        return p(rt, M({}, r, { ref: t }), j(s) ? z(s, void 0, u) : null)
      }
      return p(rt, M({}, r, { ref: t }), n)
    })
    tt.displayName = 'Slot'
    const rt = P((e, t) => {
      let { children: n, ...r } = e
      return j(n) ? z(n, { ...Er(r, n.props), ref: t ? dt(t, n.ref) : n.ref }) : D.count(n) > 1 ? D.only(null) : null
    })
    rt.displayName = 'SlotClone'
    const Xa = l(({ children: e }) => p(se, null, e), '$5e63c961fc1ce211$export$d9f1ccf0bdb05d45')
    function Sr(e) {
      return j(e) && e.type === Xa
    }
    l(Sr, '$5e63c961fc1ce211$var$isSlottable')
    function Er(e, t) {
      let n = { ...t }
      for (let r in t) {
        let a = e[r],
          i = t[r]
        ;/^on[A-Z]/.test(r)
          ? a && i
            ? (n[r] = (...u) => {
                ;(i(...u), a(...u))
              })
            : a && (n[r] = a)
          : r === 'style'
            ? (n[r] = { ...a, ...i })
            : r === 'className' && (n[r] = [a, i].filter(Boolean).join(' '))
      }
      return { ...e, ...n }
    }
    l(Er, '$5e63c961fc1ce211$var$mergeProps')
    function $r(e) {
      let t = e + 'CollectionProvider',
        [n, r] = De(t),
        [a, i] = n(t, { collectionRef: { current: null }, itemMap: new Map() }),
        s = l((y) => {
          let { scope: g, children: O } = y,
            _ = o.useRef(null),
            S = o.useRef(new Map()).current
          return o.createElement(a, { scope: g, itemMap: S, collectionRef: _ }, O)
        }, 'CollectionProvider')
      Object.assign(s, { displayName: t })
      let u = e + 'CollectionSlot',
        d = o.forwardRef((y, g) => {
          let { scope: O, children: _ } = y,
            S = i(u, O),
            x = et(g, S.collectionRef)
          return o.createElement(tt, { ref: x }, _)
        })
      Object.assign(d, { displayName: u })
      let c = e + 'CollectionItemSlot',
        f = 'data-radix-collection-item',
        m = o.forwardRef((y, g) => {
          let { scope: O, children: _, ...S } = y,
            x = o.useRef(null),
            K = et(g, x),
            U = i(c, O)
          return (
            o.useEffect(() => (U.itemMap.set(x, { ref: x, ...S }), () => void U.itemMap.delete(x))),
            o.createElement(tt, { [f]: '', ref: K }, _)
          )
        })
      Object.assign(m, { displayName: c })
      function b(y) {
        let g = i(e + 'CollectionConsumer', y)
        return o.useCallback(() => {
          let _ = g.collectionRef.current
          if (!_) {return []}
          let S = Array.from(_.querySelectorAll(`[${f}]`))
          return Array.from(g.itemMap.values()).sort((U, W) => S.indexOf(U.ref.current) - S.indexOf(W.ref.current))
        }, [g.collectionRef, g.itemMap])
      }
      return (l(b, 'useCollection'), [{ Provider: s, Slot: d, ItemSlot: m }, b, r])
    }
    l($r, '$e02a7d9cb1dc128c$export$c74125a8e3af6bb2')
    function Ir(e, t) {
      typeof e === 'function' ? e(t) : e != null && (e.current = t)
    }
    l(Ir, '$6ed0406888f73fc4$var$setRef')
    function mt(...e) {
      return (t) => e.forEach((n) => Ir(n, t))
    }
    l(mt, '$6ed0406888f73fc4$export$43e446d32b3d21af')
    function _r(...e) {
      return I(mt(...e), e)
    }
    l(_r, '$6ed0406888f73fc4$export$c7b2cbe3552a0d05')
    let Qa = globalThis?.document ? ve : () => {},
      Za = Ot || (() => {}),
      Ja = 0
    function ft(e) {
      let [t, n] = G(Za())
      return (
        Qa(() => {
          e || n((r) => r ?? String(Ja++))
        }, [e]),
        e || (t ? `radix-${t}` : '')
      )
    }
    l(ft, '$1746a345f3d73bb7$export$f680877a34711e37')
    const xr = P((e, t) => {
      let { children: n, ...r } = e,
        a = D.toArray(n),
        i = a.find(Rr)
      if (i) {
        let s = i.props.children,
          u = a.map((d) => (d === i ? (D.count(s) > 1 ? D.only(null) : j(s) ? s.props.children : null) : d))
        return p(nt, M({}, r, { ref: t }), j(s) ? z(s, void 0, u) : null)
      }
      return p(nt, M({}, r, { ref: t }), n)
    })
    xr.displayName = 'Slot'
    const nt = P((e, t) => {
      let { children: n, ...r } = e
      return j(n) ? z(n, { ...Ar(r, n.props), ref: t ? mt(t, n.ref) : n.ref }) : D.count(n) > 1 ? D.only(null) : null
    })
    nt.displayName = 'SlotClone'
    const eo = l(({ children: e }) => p(se, null, e), '$5e63c961fc1ce211$export$d9f1ccf0bdb05d45')
    function Rr(e) {
      return j(e) && e.type === eo
    }
    l(Rr, '$5e63c961fc1ce211$var$isSlottable')
    function Ar(e, t) {
      let n = { ...t }
      for (let r in t) {
        let a = e[r],
          i = t[r]
        ;/^on[A-Z]/.test(r)
          ? a && i
            ? (n[r] = (...u) => {
                ;(i(...u), a(...u))
              })
            : a && (n[r] = a)
          : r === 'style'
            ? (n[r] = { ...a, ...i })
            : r === 'className' && (n[r] = [a, i].filter(Boolean).join(' '))
      }
      return { ...e, ...n }
    }
    l(Ar, '$5e63c961fc1ce211$var$mergeProps')
    const to = [
        'a',
        'button',
        'div',
        'form',
        'h2',
        'h3',
        'img',
        'input',
        'label',
        'li',
        'nav',
        'ol',
        'p',
        'span',
        'svg',
        'ul'
      ],
      Tr = to.reduce((e, t) => {
        let n = P((r, a) => {
          let { asChild: i, ...s } = r,
            u = i ? xr : t
          return (
            N(() => {
              window[Symbol.for('radix-ui')] = !0
            }, []),
            p(u, M({}, s, { ref: a }))
          )
        })
        return ((n.displayName = `Primitive.${t}`), { ...e, [t]: n })
      }, {})
    function Cr(e) {
      let t = L(e)
      return (
        N(() => {
          t.current = e
        }),
        B(
          () =>
            (...n) => {
              let r
              return (r = t.current) === null || r === void 0 ? void 0 : r.call(t, ...n)
            },
          []
        )
      )
    }
    l(Cr, '$b1b2314f5f9a1d84$export$25bec8c6f54ee79a')
    function pt(e) {
      let t = L(e)
      return (
        N(() => {
          t.current = e
        }),
        B(
          () =>
            (...n) => {
              let r
              return (r = t.current) === null || r === void 0 ? void 0 : r.call(t, ...n)
            },
          []
        )
      )
    }
    l(pt, '$b1b2314f5f9a1d84$export$25bec8c6f54ee79a')
    function bt({ prop: e, defaultProp: t, onChange: n = l(() => {}, 'onChange') }) {
      let [r, a] = Or({ defaultProp: t, onChange: n }),
        i = e !== void 0,
        s = i ? e : r,
        u = pt(n),
        d = I(
          (c) => {
            if (i) {
              let m = typeof c === 'function' ? c(e) : c
              m !== e && u(m)
            } else {a(c)}
          },
          [i, e, a, u]
        )
      return [s, d]
    }
    l(bt, '$71cd76cc60e0454e$export$6f32135080cb4c3')
    function Or({ defaultProp: e, onChange: t }) {
      let n = G(e),
        [r] = n,
        a = L(r),
        i = pt(t)
      return (
        N(() => {
          a.current !== r && (i(r), (a.current = r))
        }, [r, a, i]),
        n
      )
    }
    l(Or, '$71cd76cc60e0454e$var$useUncontrolledState')
    const ro = me(void 0)
    function ht(e) {
      let t = ye(ro)
      return e || t || 'ltr'
    }
    l(ht, '$f631663db3294ace$export$b39126d51d94e6f3')
    const Ye = 'rovingFocusGroup.onEntryFocus',
      no = { bubbles: !1, cancelable: !0 },
      Me = 'RovingFocusGroup',
      [at, kr, ao] = $r(Me),
      [oo, wr] = De(Me, [ao]),
      [io, lo] = oo(Me),
      Nr = P((e, t) =>
        p(
          at.Provider,
          { scope: e.__scopeRovingFocusGroup },
          p(at.Slot, { scope: e.__scopeRovingFocusGroup }, p(so, M({}, e, { ref: t })))
        )
      )
    Object.assign(Nr, { displayName: Me })
    const so = P((e, t) => {
        let {
            __scopeRovingFocusGroup: n,
            orientation: r,
            loop: a = !1,
            dir: i,
            currentTabStopId: s,
            defaultCurrentTabStopId: u,
            onCurrentTabStopIdChange: d,
            onEntryFocus: c,
            ...f
          } = e,
          m = L(null),
          b = _r(t, m),
          y = ht(i),
          [g = null, O] = bt({ prop: s, defaultProp: u, onChange: d }),
          [_, S] = G(!1),
          x = Cr(c),
          K = kr(n),
          U = L(!1),
          [W, k] = G(0)
        return (
          N(() => {
            let R = m.current
            if (R) {return (R.addEventListener(Ye, x), () => R.removeEventListener(Ye, x))}
          }, [x]),
          p(
            io,
            {
              scope: n,
              orientation: r,
              dir: y,
              loop: a,
              currentTabStopId: g,
              onItemFocus: I((R) => O(R), [O]),
              onItemShiftTab: I(() => S(!0), []),
              onFocusableItemAdd: I(() => k((R) => R + 1), []),
              onFocusableItemRemove: I(() => k((R) => R - 1), [])
            },
            p(
              Tr.div,
              M({ tabIndex: _ || W === 0 ? -1 : 0, 'data-orientation': r }, f, {
                ref: b,
                style: { outline: 'none', ...e.style },
                onMouseDown: ee(e.onMouseDown, () => {
                  U.current = !0
                }),
                onFocus: ee(e.onFocus, (R) => {
                  let F = !U.current
                  if (R.target === R.currentTarget && F && !_) {
                    let J = new CustomEvent(Ye, no)
                    if ((R.currentTarget.dispatchEvent(J), !J.defaultPrevented)) {
                      let te = K().filter((re) => re.focusable),
                        pe = te.find((re) => re.active),
                        V = te.find((re) => re.id === g),
                        Fe = [pe, V, ...te].filter(Boolean).map((re) => re.ref.current)
                      yt(Fe)
                    }
                  }
                  U.current = !1
                }),
                onBlur: ee(e.onBlur, () => S(!1))
              })
            )
          )
        )
      }),
      Pr = 'RovingFocusGroupItem',
      Dr = P((e, t) => {
        let { __scopeRovingFocusGroup: n, focusable: r = !0, active: a = !1, tabStopId: i, ...s } = e,
          u = ft(),
          d = i || u,
          c = lo(Pr, n),
          f = c.currentTabStopId === d,
          m = kr(n),
          { onFocusableItemAdd: b, onFocusableItemRemove: y } = c
        return (
          N(() => {
            if (r) {return (b(), () => y())}
          }, [r, b, y]),
          p(
            at.ItemSlot,
            { scope: n, id: d, focusable: r, active: a },
            p(
              Tr.span,
              M({ tabIndex: f ? 0 : -1, 'data-orientation': c.orientation }, s, {
                ref: t,
                onMouseDown: ee(e.onMouseDown, (g) => {
                  r ? c.onItemFocus(d) : g.preventDefault()
                }),
                onFocus: ee(e.onFocus, () => c.onItemFocus(d)),
                onKeyDown: ee(e.onKeyDown, (g) => {
                  if (g.key === 'Tab' && g.shiftKey) {
                    c.onItemShiftTab()
                    return
                  }
                  if (g.target !== g.currentTarget) {return}
                  let O = Lr(g, c.orientation, c.dir)
                  if (O !== void 0) {
                    g.preventDefault()
                    let S = m()
                      .filter((x) => x.focusable)
                      .map((x) => x.ref.current)
                    if (O === 'last') {S.reverse()}
                    else if (O === 'prev' || O === 'next') {
                      O === 'prev' && S.reverse()
                      let x = S.indexOf(g.currentTarget)
                      S = c.loop ? Fr(S, x + 1) : S.slice(x + 1)
                    }
                    setTimeout(() => yt(S))
                  }
                })
              })
            )
          )
        )
      })
    Object.assign(Dr, { displayName: Pr })
    const co = {
      ArrowLeft: 'prev',
      ArrowUp: 'prev',
      ArrowRight: 'next',
      ArrowDown: 'next',
      PageUp: 'first',
      Home: 'first',
      PageDown: 'last',
      End: 'last'
    }
    function Mr(e, t) {
      return t !== 'rtl' ? e : e === 'ArrowLeft' ? 'ArrowRight' : e === 'ArrowRight' ? 'ArrowLeft' : e
    }
    l(Mr, '$d7bdfb9eb0fdf311$var$getDirectionAwareKey')
    function Lr(e, t, n) {
      let r = Mr(e.key, n)
      if (
        !(t === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(r)) &&
        !(t === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(r))
      )
        {return co[r]}
    }
    l(Lr, '$d7bdfb9eb0fdf311$var$getFocusIntent')
    function yt(e) {
      let t = document.activeElement
      for (let n of e) {if (n === t || (n.focus(), document.activeElement !== t)) return}
    }
    l(yt, '$d7bdfb9eb0fdf311$var$focusFirst')
    function Fr(e, t) {
      return e.map((n, r) => e[(t + r) % e.length])
    }
    l(Fr, '$d7bdfb9eb0fdf311$var$wrapArray')
    const uo = Nr,
      mo = Dr
    function Hr(e, t) {
      typeof e === 'function' ? e(t) : e != null && (e.current = t)
    }
    l(Hr, '$6ed0406888f73fc4$var$setRef')
    function Ur(...e) {
      return (t) => e.forEach((n) => Hr(n, t))
    }
    l(Ur, '$6ed0406888f73fc4$export$43e446d32b3d21af')
    function jr(...e) {
      return I(Ur(...e), e)
    }
    l(jr, '$6ed0406888f73fc4$export$c7b2cbe3552a0d05')
    const nr = globalThis?.document ? ve : () => {}
    function Br(e, t) {
      return kt((n, r) => {
        let a = t[n][r]
        return a ?? n
      }, e)
    }
    l(Br, '$fe963b355347cc68$export$3e6543de14f8614f')
    const Gr = l((e) => {
      let { present: t, children: n } = e,
        r = qr(t),
        a = typeof n === 'function' ? n({ present: r.isPresent }) : D.only(n),
        i = jr(r.ref, a.ref)
      return typeof n === 'function' || r.isPresent ? z(a, { ref: i }) : null
    }, '$921a889cee6df7e8$export$99c2b779aa4e8b8b')
    Gr.displayName = 'Presence'
    function qr(e) {
      let [t, n] = G(),
        r = L({}),
        a = L(e),
        i = L('none'),
        s = e ? 'mounted' : 'unmounted',
        [u, d] = Br(s, {
          mounted: { UNMOUNT: 'unmounted', ANIMATION_OUT: 'unmountSuspended' },
          unmountSuspended: { MOUNT: 'mounted', ANIMATION_END: 'unmounted' },
          unmounted: { MOUNT: 'mounted' }
        })
      return (
        N(() => {
          let c = Ie(r.current)
          i.current = u === 'mounted' ? c : 'none'
        }, [u]),
        nr(() => {
          let c = r.current,
            f = a.current
          if (f !== e) {
            let b = i.current,
              y = Ie(c)
            ;(e
              ? d('MOUNT')
              : y === 'none' || c?.display === 'none'
                ? d('UNMOUNT')
                : d(f && b !== y ? 'ANIMATION_OUT' : 'UNMOUNT'),
              (a.current = e))
          }
        }, [e, d]),
        nr(() => {
          if (t) {
            let c = l((m) => {
                let y = Ie(r.current).includes(m.animationName)
                m.target === t && y && rr(() => d('ANIMATION_END'))
              }, 'handleAnimationEnd'),
              f = l((m) => {
                m.target === t && (i.current = Ie(r.current))
              }, 'handleAnimationStart')
            return (
              t.addEventListener('animationstart', f),
              t.addEventListener('animationcancel', c),
              t.addEventListener('animationend', c),
              () => {
                ;(t.removeEventListener('animationstart', f),
                  t.removeEventListener('animationcancel', c),
                  t.removeEventListener('animationend', c))
              }
            )
          }d('ANIMATION_END')
        }, [t, d]),
        {
          isPresent: ['mounted', 'unmountSuspended'].includes(u),
          ref: I((c) => {
            ;(c && (r.current = getComputedStyle(c)), n(c))
          }, [])
        }
      )
    }
    l(qr, '$921a889cee6df7e8$var$usePresence')
    function Ie(e) {
      return e?.animationName || 'none'
    }
    l(Ie, '$921a889cee6df7e8$var$getAnimationName')
    function zr(e, t) {
      typeof e === 'function' ? e(t) : e != null && (e.current = t)
    }
    l(zr, '$6ed0406888f73fc4$var$setRef')
    function Wr(...e) {
      return (t) => e.forEach((n) => zr(n, t))
    }
    l(Wr, '$6ed0406888f73fc4$export$43e446d32b3d21af')
    const Vr = P((e, t) => {
      let { children: n, ...r } = e,
        a = D.toArray(n),
        i = a.find(Yr)
      if (i) {
        let s = i.props.children,
          u = a.map((d) => (d === i ? (D.count(s) > 1 ? D.only(null) : j(s) ? s.props.children : null) : d))
        return p(ot, M({}, r, { ref: t }), j(s) ? z(s, void 0, u) : null)
      }
      return p(ot, M({}, r, { ref: t }), n)
    })
    Vr.displayName = 'Slot'
    const ot = P((e, t) => {
      let { children: n, ...r } = e
      return j(n) ? z(n, { ...Kr(r, n.props), ref: t ? Wr(t, n.ref) : n.ref }) : D.count(n) > 1 ? D.only(null) : null
    })
    ot.displayName = 'SlotClone'
    const fo = l(({ children: e }) => p(se, null, e), '$5e63c961fc1ce211$export$d9f1ccf0bdb05d45')
    function Yr(e) {
      return j(e) && e.type === fo
    }
    l(Yr, '$5e63c961fc1ce211$var$isSlottable')
    function Kr(e, t) {
      let n = { ...t }
      for (let r in t) {
        let a = e[r],
          i = t[r]
        ;/^on[A-Z]/.test(r)
          ? a && i
            ? (n[r] = (...u) => {
                ;(i(...u), a(...u))
              })
            : a && (n[r] = a)
          : r === 'style'
            ? (n[r] = { ...a, ...i })
            : r === 'className' && (n[r] = [a, i].filter(Boolean).join(' '))
      }
      return { ...e, ...n }
    }
    l(Kr, '$5e63c961fc1ce211$var$mergeProps')
    const po = [
        'a',
        'button',
        'div',
        'form',
        'h2',
        'h3',
        'img',
        'input',
        'label',
        'li',
        'nav',
        'ol',
        'p',
        'span',
        'svg',
        'ul'
      ],
      Le = po.reduce((e, t) => {
        let n = P((r, a) => {
          let { asChild: i, ...s } = r,
            u = i ? Vr : t
          return (
            N(() => {
              window[Symbol.for('radix-ui')] = !0
            }, []),
            p(u, M({}, s, { ref: a }))
          )
        })
        return ((n.displayName = `Primitive.${t}`), { ...e, [t]: n })
      }, {}),
      vt = 'Tabs',
      [bo, nh] = De(vt, [wr]),
      Xr = wr(),
      [ho, gt] = bo(vt),
      Qr = P((e, t) => {
        let {
            __scopeTabs: n,
            value: r,
            onValueChange: a,
            defaultValue: i,
            orientation: s = 'horizontal',
            dir: u,
            activationMode: d = 'automatic',
            ...c
          } = e,
          f = ht(u),
          [m, b] = bt({ prop: r, onChange: a, defaultProp: i })
        return p(
          ho,
          { scope: n, baseId: ft(), value: m, onValueChange: b, orientation: s, dir: f, activationMode: d },
          p(Le.div, M({ dir: f, 'data-orientation': s }, c, { ref: t }))
        )
      })
    Object.assign(Qr, { displayName: vt })
    const Zr = 'TabsList',
      Jr = P((e, t) => {
        let { __scopeTabs: n, loop: r = !0, ...a } = e,
          i = gt(Zr, n),
          s = Xr(n)
        return p(
          uo,
          M({ asChild: !0 }, s, { orientation: i.orientation, dir: i.dir, loop: r }),
          p(Le.div, M({ role: 'tablist', 'aria-orientation': i.orientation }, a, { ref: t }))
        )
      })
    Object.assign(Jr, { displayName: Zr })
    const en = 'TabsTrigger',
      tn = P((e, t) => {
        let { __scopeTabs: n, value: r, disabled: a = !1, ...i } = e,
          s = gt(en, n),
          u = Xr(n),
          d = St(s.baseId, r),
          c = Et(s.baseId, r),
          f = r === s.value
        return p(
          mo,
          M({ asChild: !0 }, u, { focusable: !a, active: f }),
          p(
            Le.button,
            M(
              {
                type: 'button',
                role: 'tab',
                'aria-selected': f,
                'aria-controls': c,
                'data-state': f ? 'active' : 'inactive',
                'data-disabled': a ? '' : void 0,
                disabled: a,
                id: d
              },
              i,
              {
                ref: t,
                onMouseDown: ee(e.onMouseDown, (m) => {
                  !a && m.button === 0 && m.ctrlKey === !1 ? s.onValueChange(r) : m.preventDefault()
                }),
                onKeyDown: ee(e.onKeyDown, (m) => {
                  ;[' ', 'Enter'].includes(m.key) && s.onValueChange(r)
                }),
                onFocus: ee(e.onFocus, () => {
                  let m = s.activationMode !== 'manual'
                  !f && !a && m && s.onValueChange(r)
                })
              }
            )
          )
        )
      })
    Object.assign(tn, { displayName: en })
    const rn = 'TabsContent',
      nn = P((e, t) => {
        let { __scopeTabs: n, value: r, forceMount: a, children: i, ...s } = e,
          u = gt(rn, n),
          d = St(u.baseId, r),
          c = Et(u.baseId, r),
          f = r === u.value,
          m = L(f)
        return (
          N(() => {
            let b = requestAnimationFrame(() => (m.current = !1))
            return () => cancelAnimationFrame(b)
          }, []),
          p(Gr, { present: a || f }, ({ present: b }) =>
            p(
              Le.div,
              M(
                {
                  'data-state': f ? 'active' : 'inactive',
                  'data-orientation': u.orientation,
                  role: 'tabpanel',
                  'aria-labelledby': d,
                  hidden: !b,
                  id: c,
                  tabIndex: 0
                },
                s,
                { ref: t, style: { ...e.style, animationDuration: m.current ? '0s' : void 0 } }
              ),
              b && i
            )
          )
        )
      })
    Object.assign(nn, { displayName: rn })
    function St(e, t) {
      return `${e}-trigger-${t}`
    }
    l(St, '$69cb30bb0017df05$var$makeTriggerId')
    function Et(e, t) {
      return `${e}-content-${t}`
    }
    l(Et, '$69cb30bb0017df05$var$makeContentId')
    const yo = Qr,
      vo = Jr,
      go = tn,
      ar = nn,
      or = $(Be)(
        ({ theme: e }) => ({ fontSize: e.typography.size.s1 }),
        ({ language: e }) => e === 'css' && { '.selector ~ span:nth-last-of-type(-n+3)': { display: 'none' } }
      ),
      So = $.div({ display: 'flex', flexDirection: 'column' }),
      Eo = $.div(({ theme: e }) => ({
        display: 'block',
        color: e.textMutedColor,
        fontFamily: e.typography.fonts.mono,
        fontSize: e.typography.size.s1,
        marginTop: -8,
        marginBottom: 12,
        '@container (min-width: 800px)': { display: 'none' }
      })),
      $o = $.p({ margin: 0 }),
      Io = $.div({ display: 'flex', flexDirection: 'column', padding: '0 15px 20px 15px', gap: 20 }),
      _o = $.div({ gap: 15, '@container (min-width: 800px)': { display: 'grid', gridTemplateColumns: '50% 50%' } }),
      ir = $.div(({ theme: e, side: t }) => ({
        display: t === 'left' ? 'flex' : 'none',
        flexDirection: 'column',
        gap: 15,
        margin: t === 'left' ? '15px 0' : 0,
        padding: t === 'left' ? '0 15px' : 0,
        borderLeft: t === 'left' ? `1px solid ${e.color.border}` : 'none',
        '&:focus-visible': { outline: 'none', borderRadius: 4, boxShadow: `0 0 0 1px inset ${e.color.secondary}` },
        '@container (min-width: 800px)': { display: t === 'left' ? 'none' : 'flex' }
      })),
      xo = $(ae)(({ theme: e }) => ({
        fontFamily: e.typography.fonts.mono,
        fontWeight: e.typography.weight.regular,
        color: e.textMutedColor,
        height: 40,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '0 12px',
        '&[data-state="active"]': { color: e.color.secondary, backgroundColor: e.background.hoverable }
      })),
      Ro = $.div({ display: 'flex', flexDirection: 'column', gap: 10 }),
      Ao = $.div({ display: 'flex', gap: 10 }),
      To = l(({ onClick: e }) => {
        let [t, n] = G(!1),
          r = I(() => {
            ;(e(), n(!0))
            let a = setTimeout(() => n(!1), 2e3)
            return () => clearTimeout(a)
          }, [e])
        return o.createElement(
          ae,
          { onClick: r },
          t ? o.createElement(Ut, null) : o.createElement(Gt, null),
          ' ',
          t ? 'Copied' : 'Copy link'
        )
      }, 'CopyButton'),
      Co = l(
        ({ id: e, item: t, type: n, selection: r, handleSelectionChange: a }) =>
          o.createElement(
            Io,
            { id: e },
            o.createElement(
              So,
              null,
              o.createElement(Eo, null, t.id),
              o.createElement(
                $o,
                null,
                Je(t),
                ' ',
                o.createElement(
                  Se,
                  { href: t.helpUrl, target: '_blank', rel: 'noopener noreferrer', withArrow: !0 },
                  'Learn how to resolve this violation'
                )
              )
            ),
            o.createElement(
              yo,
              { defaultValue: r, orientation: 'vertical', value: r, onValueChange: a, asChild: !0 },
              o.createElement(
                _o,
                null,
                o.createElement(
                  vo,
                  { 'aria-label': n },
                  t.nodes.map((i, s) => {
                    let u = `${n}.${t.id}.${s + 1}`
                    return o.createElement(
                      se,
                      { key: u },
                      o.createElement(
                        go,
                        { value: u, asChild: !0 },
                        o.createElement(xo, { variant: 'ghost', size: 'medium', id: u }, s + 1, '. ', i.html)
                      ),
                      o.createElement(ar, { value: u, asChild: !0 }, o.createElement(ir, { side: 'left' }, it(i)))
                    )
                  })
                ),
                t.nodes.map((i, s) => {
                  let u = `${n}.${t.id}.${s + 1}`
                  return o.createElement(
                    ar,
                    { key: u, value: u, asChild: !0 },
                    o.createElement(ir, { side: 'right' }, it(i))
                  )
                })
              )
            )
          ),
        'Details'
      )
    function it(e) {
      let { handleCopyLink: t, handleJumpToElement: n } = ut(),
        { any: r, all: a, none: i, html: s, target: u } = e,
        d = [...r, ...a, ...i]
      return o.createElement(
        o.Fragment,
        null,
        o.createElement(
          Ro,
          null,
          d.map((c) =>
            o.createElement('div', { key: c.id }, `${c.message}${/(\.|: [^.]+\.*)$/.test(c.message) ? '' : '.'}`)
          )
        ),
        o.createElement(
          Ao,
          null,
          o.createElement(ae, { onClick: () => n(e.target.toString()) }, o.createElement(Vt, null), ' Jump to element'),
          o.createElement(To, { onClick: () => t(e.linkPath) })
        ),
        o.createElement(
          or,
          { language: 'jsx', wrapLongLines: !0 },
          `/* element */
${s}`
        ),
        o.createElement(
          or,
          { language: 'css', wrapLongLines: !0 },
          `/* selector */
${u} {}`
        )
      )
    }
    l(it, 'getContent')
    let Oo = { minor: 'neutral', moderate: 'warning', serious: 'negative', critical: 'critical' },
      ko = { minor: 'Minor', moderate: 'Moderate', serious: 'Serious', critical: 'Critical' },
      wo = $.div(({ theme: e }) => ({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderBottom: `1px solid ${e.appBorderColor}`,
        containerType: 'inline-size',
        fontSize: e.typography.size.s2
      })),
      No = $(jt)({ transition: 'transform 0.1s ease-in-out' }),
      Po = $.div(({ theme: e }) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px 6px 15px',
        minHeight: 40,
        background: 'none',
        color: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        '&:hover': { color: e.color.secondary }
      })),
      Do = $.div(({ theme: e }) => ({
        display: 'flex',
        alignItems: 'baseline',
        flexGrow: 1,
        fontSize: e.typography.size.s2,
        gap: 8
      })),
      Mo = $.div(({ theme: e }) => ({
        display: 'none',
        color: e.textMutedColor,
        fontFamily: e.typography.fonts.mono,
        fontSize: e.typography.size.s1,
        '@container (min-width: 800px)': { display: 'block' }
      })),
      Lo = $.div(({ theme: e }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: e.textMutedColor,
        width: 28,
        height: 28
      })),
      Ke = l(
        ({ items: e, empty: t, type: n, handleSelectionChange: r, selectedItems: a, toggleOpen: i }) =>
          o.createElement(
            o.Fragment,
            null,
            e && e.length
              ? e.map((s) => {
                  let u = `${n}.${s.id}`,
                    d = `details:${u}`,
                    c = a.get(u),
                    f = Ze(s)
                  return o.createElement(
                    wo,
                    { key: u },
                    o.createElement(
                      Po,
                      { onClick: (m) => i(m, n, s), 'data-active': !!c },
                      o.createElement(Do, null, o.createElement('strong', null, f), o.createElement(Mo, null, s.id)),
                      s.impact &&
                        o.createElement(ne, { status: n === Y.PASS ? 'neutral' : Oo[s.impact] }, ko[s.impact]),
                      o.createElement(Lo, null, s.nodes.length),
                      o.createElement(
                        oe,
                        {
                          onClick: (m) => i(m, n, s),
                          'aria-label': `${c ? 'Collapse' : 'Expand'} details for ${f}`,
                          'aria-expanded': !!c,
                          'aria-controls': d
                        },
                        o.createElement(No, { style: { transform: `rotate(${c ? -180 : 0}deg)` } })
                      )
                    ),
                    c
                      ? o.createElement(Co, { id: d, item: s, type: n, selection: c, handleSelectionChange: r })
                      : o.createElement('div', { id: d })
                  )
                })
              : o.createElement(Ue, { title: t })
          ),
        'Report'
      ),
      lt = l(function (e, t) {
        return (
          (lt =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (n, r) {
                n.__proto__ = r
              }) ||
            function (n, r) {
              for (let a in r) Object.hasOwn(r, a) && (n[a] = r[a])
            }),
          lt(e, t)
        )
      }, 'extendStatics')
    function an(e, t) {
      if (typeof t !== 'function' && t !== null)
        {throw new TypeError('Class extends value ' + String(t) + ' is not a constructor or null')}
      lt(e, t)
      function n() {
        this.constructor = e
      }
      ;(l(n, '__'), (e.prototype = t === null ? Object.create(t) : ((n.prototype = t.prototype), new n())))
    }
    l(an, '__extends')
    let st = l(function () {
      return (
        (st =
          Object.assign ||
          l(function (t) {
            for (let n, r = 1, a = arguments.length; r < a; r++) {
              n = arguments[r]
              for (let i in n) Object.hasOwn(n, i) && (t[i] = n[i])
            }
            return t
          }, '__assign')),
        st.apply(this, arguments)
      )
    }, '__assign')
    function on(e, t) {
      const n = {}
      for (var r in e) Object.hasOwn(e, r) && t.indexOf(r) < 0 && (n[r] = e[r])
      if (e != null && typeof Object.getOwnPropertySymbols === 'function')
        {for (var a = 0, r = Object.getOwnPropertySymbols(e); a < r.length; a++)
          t.indexOf(r[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[a]) && (n[r[a]] = e[r[a]])}
      return n
    }
    l(on, '__rest')
    const Pe =
      typeof globalThis < 'u'
        ? globalThis
        : typeof window < 'u' || typeof window < 'u'
          ? window
          : typeof self < 'u'
            ? self
            : {}
    function ln(e) {
      const t = typeof e
      return e != null && (t == 'object' || t == 'function')
    }
    l(ln, 'isObject$3')
    const $t = ln,
      Fo = typeof Pe === 'object' && Pe && Pe.Object === Object && Pe,
      Ho = Fo,
      Uo = Ho,
      jo = typeof self === 'object' && self && self.Object === Object && self,
      Bo = Uo || jo || Function('return this')(),
      sn = Bo,
      Go = sn,
      qo = l(function () {
        return Go.Date.now()
      }, 'now$1'),
      zo = qo,
      Wo = /\s/
    function cn(e) {
      for (var t = e.length; t-- && Wo.test(e.charAt(t)); ){;}
      return t
    }
    l(cn, 'trimmedEndIndex$1')
    const Vo = cn,
      Yo = Vo,
      Ko = /^\s+/
    function un(e) {
      return e && e.slice(0, Yo(e) + 1).replace(Ko, '')
    }
    l(un, 'baseTrim$1')
    const Xo = un,
      Qo = sn,
      Zo = Qo.Symbol,
      dn = Zo,
      lr = dn,
      mn = Object.prototype,
      Jo = mn.hasOwnProperty,
      ei = mn.toString,
      $e = lr ? lr.toStringTag : void 0
    function fn(e) {
      const t = Jo.call(e, $e),
        n = e[$e]
      try {
        e[$e] = void 0
        var r = !0
      } catch {}
      const a = ei.call(e)
      return (r && (t ? (e[$e] = n) : delete e[$e]), a)
    }
    l(fn, 'getRawTag$1')
    const ti = fn,
      ri = Object.prototype,
      ni = ri.toString
    function pn(e) {
      return ni.call(e)
    }
    l(pn, 'objectToString$1')
    const ai = pn,
      sr = dn,
      oi = ti,
      ii = ai,
      li = '[object Null]',
      si = '[object Undefined]',
      cr = sr ? sr.toStringTag : void 0
    function bn(e) {
      return e == null ? (e === void 0 ? si : li) : cr && cr in Object(e) ? oi(e) : ii(e)
    }
    l(bn, 'baseGetTag$1')
    const ci = bn
    function hn(e) {
      return e != null && typeof e === 'object'
    }
    l(hn, 'isObjectLike$1')
    const ui = hn,
      di = ci,
      mi = ui,
      fi = '[object Symbol]'
    function yn(e) {
      return typeof e === 'symbol' || (mi(e) && di(e) == fi)
    }
    l(yn, 'isSymbol$1')
    const pi = yn,
      bi = Xo,
      ur = $t,
      hi = pi,
      dr = NaN,
      yi = /^[-+]0x[0-9a-f]+$/i,
      vi = /^0b[01]+$/i,
      gi = /^0o[0-7]+$/i,
      Si = parseInt
    function vn(e) {
      if (typeof e === 'number') {return e}
      if (hi(e)) {return dr}
      if (ur(e)) {
        const t = typeof e.valueOf === 'function' ? e.valueOf() : e
        e = ur(t) ? t + '' : t
      }
      if (typeof e !== 'string') {return e === 0 ? e : +e}
      e = bi(e)
      const n = vi.test(e)
      return n || gi.test(e) ? Si(e.slice(2), n ? 2 : 8) : yi.test(e) ? dr : +e
    }
    l(vn, 'toNumber$1')
    const Ei = vn,
      $i = $t,
      Xe = zo,
      mr = Ei,
      Ii = 'Expected a function',
      _i = Math.max,
      xi = Math.min
    function gn(e, t, n) {
      let r,
        a,
        i,
        s,
        u,
        d,
        c = 0,
        f = !1,
        m = !1,
        b = !0
      if (typeof e !== 'function') {throw new TypeError(Ii)
      ;}((t = mr(t) || 0),
        $i(n) &&
          ((f = !!n.leading),
          (m = 'maxWait' in n),
          (i = m ? _i(mr(n.maxWait) || 0, t) : i),
          (b = 'trailing' in n ? !!n.trailing : b)))
      function y(k) {
        const R = r,
          F = a
        return ((r = a = void 0), (c = k), (s = e.apply(F, R)), s)
      }
      l(y, 'invokeFunc')
      function g(k) {
        return ((c = k), (u = setTimeout(S, t)), f ? y(k) : s)
      }
      l(g, 'leadingEdge')
      function O(k) {
        const R = k - d,
          F = k - c,
          J = t - R
        return m ? xi(J, i - F) : J
      }
      l(O, 'remainingWait')
      function _(k) {
        const R = k - d,
          F = k - c
        return d === void 0 || R >= t || R < 0 || (m && F >= i)
      }
      l(_, 'shouldInvoke')
      function S() {
        const k = Xe()
        if (_(k)) {return x(k)}
        u = setTimeout(S, O(k))
      }
      l(S, 'timerExpired')
      function x(k) {
        return ((u = void 0), b && r ? y(k) : ((r = a = void 0), s))
      }
      l(x, 'trailingEdge')
      function K() {
        ;(u !== void 0 && clearTimeout(u), (c = 0), (r = d = a = u = void 0))
      }
      l(K, 'cancel')
      function U() {
        return u === void 0 ? s : x(Xe())
      }
      l(U, 'flush')
      function W() {
        const k = Xe(),
          R = _(k)
        if (((r = arguments), (a = this), (d = k), R)) {
          if (u === void 0) {return g(d)}
          if (m) {return (clearTimeout(u), (u = setTimeout(S, t)), y(d))}
        }
        return (u === void 0 && (u = setTimeout(S, t)), s)
      }
      return (l(W, 'debounced'), (W.cancel = K), (W.flush = U), W)
    }
    l(gn, 'debounce$1')
    const Sn = gn,
      Ri = Sn,
      Ai = $t,
      Ti = 'Expected a function'
    function En(e, t, n) {
      let r = !0,
        a = !0
      if (typeof e !== 'function') {throw new TypeError(Ti)}
      return (
        Ai(n) && ((r = 'leading' in n ? !!n.leading : r), (a = 'trailing' in n ? !!n.trailing : a)),
        Ri(e, t, { leading: r, maxWait: t, trailing: a })
      )
    }
    l(En, 'throttle')
    const Ci = En,
      $n = l(function (e, t, n, r) {
        switch (t) {
          case 'debounce':
            return Sn(e, n, r)
          case 'throttle':
            return Ci(e, n, r)
          default:
            return e
        }
      }, 'patchResizeHandler'),
      ct = l(function (e) {
        return typeof e === 'function'
      }, 'isFunction'),
      ce = l(function () {
        return typeof window > 'u'
      }, 'isSSR'),
      fr = l(function (e) {
        return e instanceof Element || e instanceof HTMLDocument
      }, 'isDOMElement'),
      In = l(function (e, t, n, r) {
        return function (a) {
          const i = a.width,
            s = a.height
          t(function (u) {
            return (u.width === i && u.height === s) || (u.width === i && !r) || (u.height === s && !n)
              ? u
              : (e && ct(e) && e(i, s), { width: i, height: s })
          })
        }
      }, 'createNotifier'),
      dh = (function (e) {
        an(t, e)
        function t(n) {
          const r = e.call(this, n) || this
          ;((r.cancelHandler = function () {
            r.resizeHandler && r.resizeHandler.cancel && (r.resizeHandler.cancel(), (r.resizeHandler = null))
          }),
            (r.attachObserver = function () {
              const c = r.props,
                f = c.targetRef,
                m = c.observerOptions
              if (!ce()) {
                f && f.current && (r.targetRef.current = f.current)
                const b = r.getElement()
                b &&
                  ((r.observableElement && r.observableElement === b) ||
                    ((r.observableElement = b), r.resizeObserver.observe(b, m)))
              }
            }),
            (r.getElement = function () {
              const c = r.props,
                f = c.querySelector,
                m = c.targetDomEl
              if (ce()) {return null}
              if (f) {return document.querySelector(f)}
              if (m && fr(m)) {return m}
              if (r.targetRef && fr(r.targetRef.current)) {return r.targetRef.current}
              const b = tr(r)
              if (!b) {return null}
              const y = r.getRenderType()
              switch (y) {
                case 'renderProp':
                  return b
                case 'childFunction':
                  return b
                case 'child':
                  return b
                case 'childArray':
                  return b
                default:
                  return b.parentElement
              }
            }),
            (r.createResizeHandler = function (c) {
              const f = r.props,
                m = f.handleWidth,
                b = m === void 0 ? !0 : m,
                y = f.handleHeight,
                g = y === void 0 ? !0 : y,
                O = f.onResize
              if (!(!b && !g)) {
                const _ = In(O, r.setState.bind(r), b, g)
                c.forEach(function (S) {
                  const x = (S && S.contentRect) || {},
                    K = x.width,
                    U = x.height,
                    W = !r.skipOnMount && !ce()
                  ;(W && _({ width: K, height: U }), (r.skipOnMount = !1))
                })
              }
            }),
            (r.getRenderType = function () {
              const c = r.props,
                f = c.render,
                m = c.children
              return ct(f)
                ? 'renderProp'
                : ct(m)
                  ? 'childFunction'
                  : j(m)
                    ? 'child'
                    : Array.isArray(m)
                      ? 'childArray'
                      : 'parent'
            }))
          const a = n.skipOnMount,
            i = n.refreshMode,
            s = n.refreshRate,
            u = s === void 0 ? 1e3 : s,
            d = n.refreshOptions
          return (
            (r.state = { width: void 0, height: void 0 }),
            (r.skipOnMount = a),
            (r.targetRef = Ct()),
            (r.observableElement = null),
            ce() ||
              ((r.resizeHandler = $n(r.createResizeHandler, i, u, d)),
              (r.resizeObserver = new window.ResizeObserver(r.resizeHandler))),
            r
          )
        }
        return (
          l(t, 'ResizeDetector'),
          (t.prototype.componentDidMount = function () {
            this.attachObserver()
          }),
          (t.prototype.componentDidUpdate = function () {
            this.attachObserver()
          }),
          (t.prototype.componentWillUnmount = function () {
            ce() || ((this.observableElement = null), this.resizeObserver.disconnect(), this.cancelHandler())
          }),
          (t.prototype.render = function () {
            let n = this.props,
              r = n.render,
              a = n.children,
              i = n.nodeType,
              s = i === void 0 ? 'div' : i,
              u = this.state,
              d = u.width,
              c = u.height,
              f = { width: d, height: c, targetRef: this.targetRef },
              m = this.getRenderType(),
              b
            switch (m) {
              case 'renderProp':
                return r && r(f)
              case 'childFunction':
                return ((b = a), b(f))
              case 'child':
                if (((b = a), b.type && typeof b.type === 'string')) {
                  f.targetRef
                  const y = on(f, ['targetRef'])
                  return z(b, y)
                }
                return z(b, f)
              case 'childArray':
                return (
                  (b = a),
                  b.map(function (g) {
                    return !!g && z(g, f)
                  })
                )
              default:
                return p(s, null)
            }
          }),
          t
        )
      })(Tt),
      Oi = ce() ? N : ve
    function _n(e) {
      e === void 0 && (e = {})
      const t = e.skipOnMount,
        n = t === void 0 ? !1 : t,
        r = e.refreshMode,
        a = e.refreshRate,
        i = a === void 0 ? 1e3 : a,
        s = e.refreshOptions,
        u = e.handleWidth,
        d = u === void 0 ? !0 : u,
        c = e.handleHeight,
        f = c === void 0 ? !0 : c,
        m = e.targetRef,
        b = e.observerOptions,
        y = e.onResize,
        g = L(n),
        O = L(null),
        _ = m ?? O,
        S = L(),
        x = G({ width: void 0, height: void 0 }),
        K = x[0],
        U = x[1]
      return (
        Oi(
          function () {
            if (!ce()) {
              const W = In(y, U, d, f),
                k = l(function (F) {
                  ;(!d && !f) ||
                    F.forEach(function (J) {
                      const te = (J && J.contentRect) || {},
                        pe = te.width,
                        V = te.height,
                        _e = !g.current && !ce()
                      ;(_e && W({ width: pe, height: V }), (g.current = !1))
                    })
                }, 'resizeCallback')
              S.current = $n(k, r, i, s)
              const R = new window.ResizeObserver(S.current)
              return (
                _.current && R.observe(_.current, b),
                function () {
                  R.disconnect()
                  const F = S.current
                  F && F.cancel && F.cancel()
                }
              )
            }
          },
          [r, i, s, d, f, y, b, _.current]
        ),
        st({ ref: _ }, K)
      )
    }
    l(_n, 'useResizeDetector')
    const ki = $.div({ width: '100%', position: 'relative', minHeight: '100%' }),
      wi = $.button(
        ({ theme: e }) => ({
          textDecoration: 'none',
          padding: '10px 15px',
          cursor: 'pointer',
          color: e.textMutedColor,
          fontWeight: e.typography.weight.bold,
          fontSize: e.typography.size.s2 - 1,
          lineHeight: 1,
          height: 40,
          border: 'none',
          borderBottom: '3px solid transparent',
          background: 'transparent',
          '&:focus': { outline: '0 none', borderColor: e.color.secondary }
        }),
        ({ active: e, theme: t }) => (e ? { opacity: 1, color: t.color.secondary, borderColor: t.color.secondary } : {})
      ),
      Ni = $.div(({ theme: e }) => ({
        boxShadow: `${e.appBorderColor} 0 -1px 0 0 inset`,
        background: e.background.app,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        overflow: 'auto',
        paddingRight: 10,
        gap: 6,
        scrollbarColor: `${e.barTextColor} ${e.background.app}`,
        scrollbarWidth: 'thin'
      })),
      Pi = $.div({}),
      Di = $.div({
        display: 'flex',
        flexBasis: '100%',
        justifyContent: 'flex-end',
        containerType: 'inline-size',
        minWidth: 96,
        gap: 6
      }),
      Mi = $(oe)({ '@container (max-width: 193px)': { span: { display: 'none' } } }),
      Li = l(({ tabs: e }) => {
        let { ref: t } = _n({ refreshMode: 'debounce', handleHeight: !1, handleWidth: !0 }),
          {
            tab: n,
            setTab: r,
            toggleHighlight: a,
            highlighted: i,
            handleManual: s,
            allExpanded: u,
            handleCollapseAll: d,
            handleExpandAll: c
          } = ut(),
          f = I(
            (m) => {
              r(m.currentTarget.getAttribute('data-type'))
            },
            [r]
          )
        return p(
          ki,
          { ref: t },
          p(
            Ni,
            null,
            p(
              Pi,
              { role: 'tablist' },
              e.map((m, b) =>
                p(
                  wi,
                  {
                    role: 'tab',
                    key: b,
                    'data-type': m.type,
                    'data-active': n === m.type,
                    'aria-selected': n === m.type,
                    active: n === m.type,
                    onClick: f
                  },
                  m.label
                )
              )
            ),
            p(
              Di,
              null,
              p(
                fe,
                {
                  as: 'div',
                  hasChrome: !1,
                  placement: 'top',
                  tooltip: p(Ee, { note: 'Highlight elements with accessibility violations' }),
                  trigger: 'hover'
                },
                p(
                  Mi,
                  { onClick: a, active: i },
                  i ? p(zt, null) : p(Wt, null),
                  p('span', null, i ? 'Hide highlights' : 'Show highlights')
                )
              ),
              p(
                fe,
                {
                  as: 'div',
                  hasChrome: !1,
                  placement: 'top',
                  tooltip: p(Ee, { note: u ? 'Collapse all' : 'Expand all' }),
                  trigger: 'hover'
                },
                p(
                  oe,
                  { onClick: u ? d : c, 'aria-label': u ? 'Collapse all' : 'Expand all' },
                  u ? p(Bt, null) : p(qt, null)
                )
              ),
              p(
                fe,
                {
                  as: 'div',
                  hasChrome: !1,
                  placement: 'top',
                  tooltip: p(Ee, { note: 'Rerun the accessibility scan' }),
                  trigger: 'hover'
                },
                p(oe, { onClick: s, 'aria-label': 'Rerun accessibility scan' }, p(Oe, null))
              )
            )
          ),
          p(je, { vertical: !0, horizontal: !0 }, e.find((m) => m.type === n)?.panel)
        )
      }, 'Tabs'),
      Fi = $.div(({ theme: { color: e, typography: t, background: n } }) => ({
        textAlign: 'start',
        padding: '11px 15px',
        fontSize: `${t.size.s2}px`,
        fontWeight: t.weight.regular,
        lineHeight: '1rem',
        background: n.app,
        borderBottom: `1px solid ${e.border}`,
        color: e.defaultText,
        backgroundClip: 'padding-box',
        position: 'relative',
        code: {
          fontSize: `${t.size.s1 - 1}px`,
          color: 'inherit',
          margin: '0 0.2em',
          padding: '0 0.2em',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '2px',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)'
        }
      })),
      Hi = l(({ discrepancy: e }) => {
        let n = ge().getDocsUrl({ subpath: Rt, versioned: !0, renderer: !0 }),
          r = B(() => {
            switch (e) {
              case 'browserPassedCliFailed':
                return 'Accessibility checks passed in this browser but failed in the CLI.'
              case 'cliPassedBrowserFailed':
                return 'Accessibility checks passed in the CLI but failed in this browser.'
              case 'cliFailedButModeManual':
                return 'Accessibility checks failed in the CLI. Run the tests manually to see the results.'
              default:
                return null
            }
          }, [e])
        return r
          ? o.createElement(
              Fi,
              null,
              r,
              ' ',
              o.createElement(Se, { href: n, target: '_blank', withArrow: !0 }, 'Learn what could cause this')
            )
          : null
      }, 'TestDiscrepancyMessage'),
      pr = $(Oe)(({ theme: e }) => ({ animation: `${e.animation.rotate360} 1s linear infinite;`, margin: 4 })),
      Qe = $.div({ display: 'flex', alignItems: 'center', gap: 6 }),
      br = $.span(({ theme: e }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: e.typography.size.s2,
        height: '100%',
        gap: 24,
        div: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
        p: { margin: 0, color: e.textMutedColor },
        code: {
          display: 'inline-block',
          fontSize: e.typography.size.s2 - 1,
          backgroundColor: e.background.app,
          border: `1px solid ${e.color.border}`,
          borderRadius: 4,
          padding: '2px 3px'
        }
      })),
      Ui = l(() => {
        let {
            parameters: e,
            tab: t,
            results: n,
            status: r,
            handleManual: a,
            error: i,
            discrepancy: s,
            handleSelectionChange: u,
            selectedItems: d,
            toggleOpen: c
          } = ut(),
          f = B(() => {
            let { passes: m, incomplete: b, violations: y } = n ?? { passes: [], incomplete: [], violations: [] }
            return [
              {
                label: o.createElement(
                  Qe,
                  null,
                  'Violations',
                  o.createElement(ne, { compact: !0, status: t === 'violations' ? 'active' : 'neutral' }, y.length)
                ),
                panel: o.createElement(Ke, {
                  items: y,
                  type: Y.VIOLATION,
                  empty: 'No accessibility violations found.',
                  handleSelectionChange: u,
                  selectedItems: d,
                  toggleOpen: c
                }),
                items: y,
                type: Y.VIOLATION
              },
              {
                label: o.createElement(
                  Qe,
                  null,
                  'Passes',
                  o.createElement(ne, { compact: !0, status: t === 'passes' ? 'active' : 'neutral' }, m.length)
                ),
                panel: o.createElement(Ke, {
                  items: m,
                  type: Y.PASS,
                  empty: 'No passing accessibility checks found.',
                  handleSelectionChange: u,
                  selectedItems: d,
                  toggleOpen: c
                }),
                items: m,
                type: Y.PASS
              },
              {
                label: o.createElement(
                  Qe,
                  null,
                  'Inconclusive',
                  o.createElement(ne, { compact: !0, status: t === 'incomplete' ? 'active' : 'neutral' }, b.length)
                ),
                panel: o.createElement(Ke, {
                  items: b,
                  type: Y.INCOMPLETION,
                  empty: 'No inconclusive accessibility checks found.',
                  handleSelectionChange: u,
                  selectedItems: d,
                  toggleOpen: c
                }),
                items: b,
                type: Y.INCOMPLETION
              }
            ]
          }, [t, n, u, d, c])
        return e.disable || e.test === 'off'
          ? o.createElement(
              br,
              null,
              o.createElement(
                'div',
                null,
                o.createElement('strong', null, 'Accessibility tests are disabled for this story'),
                o.createElement(
                  'p',
                  null,
                  'Update',
                  ' ',
                  o.createElement('code', null, e.disable ? 'parameters.a11y.disable' : 'parameters.a11y.test'),
                  ' ',
                  'to enable accessibility tests.'
                )
              )
            )
          : o.createElement(
              o.Fragment,
              null,
              s && o.createElement(Hi, { discrepancy: s }),
              r === 'ready' || r === 'ran'
                ? o.createElement(Li, { key: 'tabs', tabs: f })
                : o.createElement(
                    br,
                    { style: { marginTop: s ? '1em' : 0 } },
                    r === 'initial' &&
                      o.createElement(
                        'div',
                        null,
                        o.createElement(pr, { size: 12 }),
                        o.createElement('strong', null, 'Preparing accessibility scan'),
                        o.createElement('p', null, 'Please wait while the addon is initializing...')
                      ),
                    r === 'manual' &&
                      o.createElement(
                        o.Fragment,
                        null,
                        o.createElement(
                          'div',
                          null,
                          o.createElement('strong', null, 'Accessibility tests run manually for this story'),
                          o.createElement(
                            'p',
                            null,
                            'Results will not show when using the testing module. You can still run accessibility tests manually.'
                          )
                        ),
                        o.createElement(ae, { size: 'medium', onClick: a }, 'Run accessibility scan'),
                        o.createElement(
                          'p',
                          null,
                          'Update ',
                          o.createElement('code', null, 'globals.a11y.manual'),
                          ' to disable manual mode.'
                        )
                      ),
                    r === 'running' &&
                      o.createElement(
                        'div',
                        null,
                        o.createElement(pr, { size: 12 }),
                        o.createElement('strong', null, 'Accessibility scan in progress'),
                        o.createElement('p', null, 'Please wait while the accessibility scan is running...')
                      ),
                    r === 'error' &&
                      o.createElement(
                        o.Fragment,
                        null,
                        o.createElement(
                          'div',
                          null,
                          o.createElement('strong', null, 'The accessibility scan encountered an error'),
                          o.createElement(
                            'p',
                            null,
                            typeof i === 'string' ? i : i instanceof Error ? i.toString() : JSON.stringify(i, null, 2)
                          )
                        ),
                        o.createElement(ae, { size: 'medium', onClick: a }, 'Rerun accessibility scan')
                      ),
                    r === 'component-test-error' &&
                      o.createElement(
                        o.Fragment,
                        null,
                        o.createElement(
                          'div',
                          null,
                          o.createElement('strong', null, "This story's component tests failed"),
                          o.createElement(
                            'p',
                            null,
                            'Automated accessibility tests will not run until this is resolved. You can still test manually.'
                          )
                        ),
                        o.createElement(ae, { size: 'medium', onClick: a }, 'Run accessibility scan')
                      )
                  )
            )
      }, 'A11YPanel'),
      ji = l(
        (e) =>
          p(
            'svg',
            { ...e },
            p(
              'defs',
              null,
              p(
                'filter',
                { id: 'protanopia' },
                p('feColorMatrix', {
                  in: 'SourceGraphic',
                  type: 'matrix',
                  values: '0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'
                })
              ),
              p(
                'filter',
                { id: 'protanomaly' },
                p('feColorMatrix', {
                  in: 'SourceGraphic',
                  type: 'matrix',
                  values: '0.817, 0.183, 0, 0, 0 0.333, 0.667, 0, 0, 0 0, 0.125, 0.875, 0, 0 0, 0, 0, 1, 0'
                })
              ),
              p(
                'filter',
                { id: 'deuteranopia' },
                p('feColorMatrix', {
                  in: 'SourceGraphic',
                  type: 'matrix',
                  values: '0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'
                })
              ),
              p(
                'filter',
                { id: 'deuteranomaly' },
                p('feColorMatrix', {
                  in: 'SourceGraphic',
                  type: 'matrix',
                  values: '0.8, 0.2, 0, 0, 0 0.258, 0.742, 0, 0, 0 0, 0.142, 0.858, 0, 0 0, 0, 0, 1, 0'
                })
              ),
              p(
                'filter',
                { id: 'tritanopia' },
                p('feColorMatrix', {
                  in: 'SourceGraphic',
                  type: 'matrix',
                  values: '0.95, 0.05,  0, 0, 0 0,  0.433, 0.567, 0, 0 0,  0.475, 0.525, 0, 0 0,  0, 0, 1, 0'
                })
              ),
              p(
                'filter',
                { id: 'tritanomaly' },
                p('feColorMatrix', {
                  in: 'SourceGraphic',
                  type: 'matrix',
                  values: '0.967, 0.033, 0, 0, 0 0, 0.733, 0.267, 0, 0 0, 0.183, 0.817, 0, 0 0, 0, 0, 1, 0'
                })
              ),
              p(
                'filter',
                { id: 'achromatopsia' },
                p('feColorMatrix', {
                  in: 'SourceGraphic',
                  type: 'matrix',
                  values: '0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0, 0, 0, 1, 0'
                })
              )
            )
          ),
        'Filters'
      ),
      Bi = 'storybook-preview-iframe',
      Gi = [
        { name: 'blurred vision', percentage: 22.9 },
        { name: 'deuteranomaly', percentage: 2.7 },
        { name: 'deuteranopia', percentage: 0.56 },
        { name: 'protanomaly', percentage: 0.66 },
        { name: 'protanopia', percentage: 0.59 },
        { name: 'tritanomaly', percentage: 0.01 },
        { name: 'tritanopia', percentage: 0.016 },
        { name: 'achromatopsia', percentage: 1e-4 },
        { name: 'grayscale' }
      ],
      xn = l(
        (e) =>
          e ? (e === 'blurred vision' ? 'blur(2px)' : e === 'grayscale' ? 'grayscale(100%)' : `url('#${e}')`) : 'none',
        'getFilter'
      ),
      qi = $.div({ '&, & svg': { position: 'absolute', width: 0, height: 0 } }),
      zi = $.span(
        {
          background: 'linear-gradient(to right, #F44336, #FF9800, #FFEB3B, #8BC34A, #2196F3, #9C27B0)',
          borderRadius: '1rem',
          display: 'block',
          height: '1rem',
          width: '1rem'
        },
        ({ filter: e }) => ({ filter: xn(e) }),
        ({ theme: e }) => ({ boxShadow: `${e.appBorderColor} 0 0 0 1px inset` })
      ),
      Wi = $.span({ display: 'flex', flexDirection: 'column' }),
      Vi = $.span({ textTransform: 'capitalize' }),
      Yi = $.span(({ theme: e }) => ({ fontSize: 11, color: e.textMutedColor })),
      Ki = l(
        (e, t) => [
          ...(e !== null
            ? [
                {
                  id: 'reset',
                  title: 'Reset color filter',
                  onClick: l(() => {
                    t(null)
                  }, 'onClick'),
                  right: void 0,
                  active: !1
                }
              ]
            : []),
          ...Gi.map((n) => {
            let r = n.percentage !== void 0 ? `${n.percentage}% of users` : void 0
            return {
              id: n.name,
              title: o.createElement(Wi, null, o.createElement(Vi, null, n.name), r && o.createElement(Yi, null, r)),
              onClick: l(() => {
                t(n)
              }, 'onClick'),
              right: o.createElement(zi, { filter: n.name }),
              active: e === n
            }
          })
        ],
        'getColorList'
      ),
      Xi = l(() => {
        let [e, t] = G(null)
        return o.createElement(
          o.Fragment,
          null,
          e && o.createElement(Yt, { styles: { [`#${Bi}`]: { filter: xn(e.name) } } }),
          o.createElement(
            fe,
            {
              placement: 'top',
              tooltip: ({ onHide: n }) => {
                let r = Ki(e, (a) => {
                  ;(t(a), n())
                })
                return o.createElement(Ge, { links: r })
              },
              closeOnOutsideClick: !0,
              onDoubleClick: () => t(null)
            },
            o.createElement(oe, { key: 'filter', active: !!e, title: 'Vision simulator' }, o.createElement(Ht, null))
          ),
          o.createElement(qi, null, o.createElement(ji, null))
        )
      }, 'VisionSimulator'),
      Qi = l(() => {
        let t = ge().getSelectedPanel(),
          [{ results: n }] = Ce(q, {
            ui: { highlighted: !1, tab: Y.VIOLATION },
            results: void 0,
            error: void 0,
            status: 'initial'
          }),
          r = n?.violations?.length ?? 0,
          a = n?.incomplete?.length ?? 0,
          i = r + a,
          s = i === 0 ? null : o.createElement(ne, { compact: !0, status: t === Re ? 'active' : 'neutral' }, i)
        return o.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          o.createElement('span', null, 'Accessibility'),
          s
        )
      }, 'Title')
    Te.register(q, (e) => {
      ;(Te.add(Re, {
        title: '',
        type: qe.TOOL,
        match: l(({ viewMode: t, tabId: n }) => t === 'story' && !n, 'match'),
        render: l(() => o.createElement(Xi, null), 'render')
      }),
        Te.add(Re, {
          title: Qi,
          type: qe.PANEL,
          render: l(({ active: t = !0 }) => o.createElement(Ka, null, t ? o.createElement(Ui, null) : null), 'render'),
          paramKey: xt
        }))
    })
  })()
} catch (e) {
  console.error('[Storybook] One of your manager-entries failed: ' + import.meta.url, e)
}
