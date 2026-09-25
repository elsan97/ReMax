// ==UserScript==
// @name         ReMax
// @name:ru      ReMax
// @version      2.2.8
// @description  ReMax with custom wallpapers, theme presets, import/export, and fixed context menu. | ReMax с кастомными обоями, пресетами тем, импортом/экспортом и фиксом контекстного меню.
// @author       Elsan97SS
// @match        https://web.max.ru/*
// @match        https://*.max.ru/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  /* ============================================================
   *  ПРЕСЕТЫ
   * ============================================================ */
  const PRESETS = {
    remax:   { name:'ReMax (default)', c1:'#6B87FF', c2:'#9B5DE5', angle:135, accent:'#4A6CF7',
               bg0:'#0B0E14', bg1:'#10141D', bg2:'#161B27', text:'#E8ECF3' },
    midnight:{ name:'Midnight',        c1:'#5B8DEF', c2:'#3D5AFE', angle:120, accent:'#3D5AFE',
               bg0:'#070B18', bg1:'#0C1224', bg2:'#131A30', text:'#E4E8F5' },
    sunset:  { name:'Sunset',          c1:'#FF6B9D', c2:'#FFA45C', angle:145, accent:'#FF6B9D',
               bg0:'#1A0E14', bg1:'#231320', bg2:'#2E1A2B', text:'#F5E6EC' },
    ocean:   { name:'Ocean',           c1:'#3FC1C9', c2:'#364F6B', angle:160, accent:'#3FC1C9',
               bg0:'#0A1418', bg1:'#0F1E24', bg2:'#152A33', text:'#E0F0F5' },
    neon:    { name:'Neon',            c1:'#00F5A0', c2:'#00D9F5', angle:135, accent:'#00F5A0',
               bg0:'#050E0E', bg1:'#08161A', bg2:'#0E2029', text:'#D6FFF6' },
    cyber:   { name:'Cyber',           c1:'#F637EC', c2:'#7A3FF5', angle:120, accent:'#F637EC',
               bg0:'#0D0715', bg1:'#140B22', bg2:'#1D1230', text:'#F0E5FF' },
    mono:    { name:'Mono',            c1:'#B0B7C3', c2:'#606770', angle:135, accent:'#8892A0',
               bg0:'#0A0A0B', bg1:'#111113', bg2:'#19191D', text:'#E8EAEF' },
    forest:  { name:'Forest',          c1:'#7FB069', c2:'#3E7C4F', angle:150, accent:'#7FB069',
               bg0:'#0A1108', bg1:'#0F1A10', bg2:'#152418', text:'#E4F0E0' },
    lava:    { name:'Lava',            c1:'#FF5722', c2:'#B71C1C', angle:135, accent:'#FF5722',
               bg0:'#140805', bg1:'#1E0C08', bg2:'#2A1310', text:'#F5E4DD' },
    sakura:  { name:'Sakura',          c1:'#FFB7C5', c2:'#C77DBB', angle:140, accent:'#FF7B9C',
               bg0:'#140E12', bg1:'#1D141A', bg2:'#291E26', text:'#F5E0E8' },
  };

  const DEFAULT_SETTINGS = {
    ...PRESETS.remax,
    presetName: 'remax',
    gradC1: PRESETS.remax.c1,
    gradC2: PRESETS.remax.c2,
    gradAngle: PRESETS.remax.angle,
    accent: PRESETS.remax.accent,
    bg0: PRESETS.remax.bg0,
    bg1: PRESETS.remax.bg1,
    bg2: PRESETS.remax.bg2,
    textColor: PRESETS.remax.text,
    radiusSm: 8, radiusMd: 12, radiusLg: 16, radiusBubble: 16,
    // Обои
    wallEnabled: false,
    wallType: 'gradient',      // 'gradient' | 'image' | 'solid'
    wallUrl: '',
    wallOpacity: 0.15,
    wallBlur: 0,
    wallSize: 'cover',         // cover | contain | auto
    wallPosition: 'center',
    wallAttach: 'fixed',       // fixed | scroll
    wallGradC1: '#6B87FF',
    wallGradC2: '#9B5DE5',
    wallGradAngle: 135,
    wallSolid: '#0B0E14',
    // Пустой экран
    showEmpty: true,
  };

  function loadSettings() {
    try {
      const raw = GM_getValue('remax_settings_v3', null);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch { return { ...DEFAULT_SETTINGS }; }
  }
  function saveSettings(s) {
    try { GM_setValue('remax_settings_v3', JSON.stringify(s)); } catch {}
  }

  let S = loadSettings();

  /* ============================================================
   *  CSS
   * ============================================================ */
  function buildCss() {
    const grad = `linear-gradient(${S.gradAngle}deg, ${S.gradC1} 0%, ${S.gradC2} 100%)`;
    const wallGrad = `linear-gradient(${S.wallGradAngle}deg, ${S.wallGradC1} 0%, ${S.wallGradC2} 100%)`;
    const rSm = S.radiusSm + 'px';
    const rMd = S.radiusMd + 'px';
    const rLg = S.radiusLg + 'px';
    const rBub = S.radiusBubble + 'px';

    // Обои
    let wallBg = 'transparent';
    if (S.wallEnabled) {
      if (S.wallType === 'image' && S.wallUrl) {
        wallBg = `url("${S.wallUrl.replace(/"/g, '\\"')}")`;
      } else if (S.wallType === 'gradient') {
        wallBg = wallGrad;
      } else if (S.wallType === 'solid') {
        wallBg = S.wallSolid;
      }
    }
    const wallBgSize = S.wallType === 'image' ? S.wallSize : 'auto';
    const wallBgPos = S.wallType === 'image' ? S.wallPosition : 'center';
    const wallBlurPx = (S.wallBlur || 0) + 'px';

    return `
    :root, html, body, [data-color-scheme="dark"] {
      --rm-bg0:${S.bg0};--rm-bg1:${S.bg1};--rm-bg2:${S.bg2};--rm-bg3:${S.bg2}33;
      --rm-text:${S.textColor};
      --rm-text-dim:#9BA4B5;--rm-text-mute:#646E82;
      --rm-accent:${S.accent};--rm-accent-2:${S.gradC2};
      --rm-danger:#F04E5A;--rm-online:#3DD68C;
      --rm-bubble-in:${S.bg2};
      --rm-grad:${grad};
      --rm-grad-c1:${S.gradC1};--rm-grad-c2:${S.gradC2};--rm-grad-angle:${S.gradAngle}deg;
      --rm-radius-sm:${rSm};--rm-radius-md:${rMd};--rm-radius-lg:${rLg};--rm-radius-bubble:${rBub};
      --rm-glass:rgba(20, 24, 33, 0.65);
      --rm-glass-str:rgba(255,255,255,0.10);
      --rm-border:rgba(255,255,255,0.06);
      --rm-border-soft:rgba(255,255,255,0.04);
      --rm-border-str:rgba(255,255,255,0.10);

      --background-color:${S.bg0}!important;
      --background-color-secondary:${S.bg1}!important;
      --background-color-tertiary:${S.bg2}!important;
      --background-color-hover:${S.bg2}!important;
      --surface-color:${S.bg2}!important;
      --font-primary:${S.textColor}!important;
      --font-secondary:#9BA4B5!important;
      --text-primary:${S.textColor}!important;
      --icon-primary:${S.textColor}!important;
      --icon-secondary:#9BA4B5!important;
      --button-background-color:${S.bg2}!important;
      --border-color:rgba(255,255,255,0.06)!important;
      --accent-color:${S.accent}!important;
      color-scheme: dark;
    }

    html, body {
      background: var(--rm-bg0) !important;
      color: var(--rm-text) !important;
      font-family: 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif !important;
      font-size: 14px !important;
      -webkit-font-smoothing: antialiased;
      letter-spacing: -0.005em;
    }
    *,*::before,*::after { box-sizing: border-box; }
    ::selection { background: rgba(74,108,247,0.25); color: var(--rm-text); }

    * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.10) transparent; }
    *::-webkit-scrollbar { width: 8px; height: 8px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.10); border-radius: 999px;
      border: 2px solid transparent; background-clip: padding-box;
    }
    *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); background-clip: padding-box; }
    .thumb--y,.thumb--x { background: rgba(255,255,255,0.10) !important; border-radius: 999px !important; }
    .track { background: transparent !important; }

    /* ============================================================
     *  ОБОИ (кастомные)
     * ============================================================ */
    .app, .app > .background, .background.svelte-fqw3x2, .background.svelte-1afbb1c {
      ${S.wallEnabled ? `
        background-image: ${wallBg} !important;
        background-size: ${wallBgSize} !important;
        background-position: ${wallBgPos} !important;
        background-attachment: ${S.wallAttach} !important;
        background-repeat: no-repeat !important;
      ` : ''}
    }
    /* Затемнение обоев (opacity) */
    ${S.wallEnabled ? `
      .app::after {
        content: '';
        position: absolute;
        inset: 0;
        background: ${S.bg0};
        opacity: ${1 - S.wallOpacity};
        pointer-events: none;
        z-index: 0;
      }
      .app > * { position: relative; z-index: 1; }
    ` : ''}
    /* Blur обоев */
    ${S.wallEnabled && S.wallBlur > 0 ? `
      .app .background, .app > .background {
        filter: blur(${wallBlurPx});
        transform: scale(1.05);
      }
    ` : ''}

    /* Отключаем встроенный canvas-градиент MAX (заменяем своим) */
    .layer-base, .layer-additional, .layer-pattern {
      ${S.wallEnabled ? 'background: transparent !important;' : `
        background: var(--rm-bg0) !important;
        background-image:
          radial-gradient(ellipse 1200px 600px at 15% -10%, rgba(107,135,255,0.10), transparent 65%),
          radial-gradient(ellipse 1000px 500px at 85% 110%, rgba(155,93,229,0.08), transparent 65%) !important;
      `}
    }
    .layer-pattern { opacity: ${S.wallEnabled ? 0 : 0.03} !important; }

    nav[aria-label="Папки и профиль"],nav.navigation,.navigation.svelte-fqw3x2,.navigation.svelte-174ybgs,
    .folders.svelte-174ybgs,.foldersViewport,.draggableViewport,.bottomGroup,.upperTrigger,.bottomTrigger {
      background: ${S.wallEnabled ? 'rgba(16,20,29,0.72)' : 'var(--rm-bg1)'} !important;
      ${S.wallEnabled ? 'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);' : ''}
    }
    nav.navigation,.navigation.svelte-fqw3x2 { border-right: 1px solid var(--rm-border) !important; }

    .navigation button,.navigation .button,nav.navigation button,.folders button,
    .foldersViewport button,.draggableViewport button,.bottomGroup button {
      background: transparent !important;
      color: var(--rm-text-dim) !important;
      border-radius: var(--rm-radius-md) !important;
      transition: background .15s ease, color .15s ease, transform .1s ease;
      border: none !important;
    }
    .navigation button:hover,.navigation .button:hover,nav.navigation button:hover,
    .folders button:hover,.bottomGroup button:hover {
      background: rgba(255,255,255,0.06) !important;
      color: var(--rm-text) !important;
    }
    .navigation button:active { transform: scale(0.94); }
    .navigation button.button--active,.navigation .button.button--active,
    nav.navigation button[class*="active"],.foldersViewport button.button--active {
      background: ${grad} !important;
      color: #fff !important;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2), 0 4px 16px rgba(74,108,247,0.3) !important;
    }
    .navigation button.button--active .title,.navigation button.button--active span,
    .navigation button.button--active svg { color: #fff !important; }
    .navigation svg,.navigation svg use,.navigation .icon { color: inherit !important; fill: currentColor !important; }
    .navigation canvas { filter: brightness(0.75) saturate(0.6); }
    .navigation button.button--active canvas {
      filter: brightness(1.5) saturate(1.2) drop-shadow(0 0 6px rgba(107,135,255,0.6));
    }
    .navigation button:hover canvas { filter: brightness(1.1); }
    .navigation .title,.navigation .title.svelte-xwrwgf,.navigation .title.svelte-6izvqj {
      color: var(--rm-text-mute) !important;
      font-size: 11px !important; font-weight: 500 !important;
      transition: color .15s;
    }
    .navigation button.button--active .title,.navigation button:hover .title { color: var(--rm-text) !important; }
    .navigation button.button--active .title { color: #fff !important; }
    .separator.svelte-174ybgs { background: var(--rm-border) !important; height: 1px !important; margin: 8px 12px !important; }

    aside.aside,.aside.svelte-fqw3x2,.aside.svelte-1u8ha7t {
      background: ${S.wallEnabled ? 'rgba(16,20,29,0.65)' : 'var(--rm-bg1)'} !important;
      ${S.wallEnabled ? 'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);' : ''}
      border-right: 1px solid var(--rm-border) !important;
    }
    .header.svelte-pu1tym {
      background: rgba(16,20,29,0.72) !important;
      backdrop-filter: saturate(180%) blur(22px);
      -webkit-backdrop-filter: saturate(180%) blur(22px);
      border-bottom: 1px solid var(--rm-border) !important;
    }
    .title.svelte-pu1tym {
      color: var(--rm-text) !important;
      font-weight: 700 !important; font-size: 22px !important;
      letter-spacing: -0.02em !important;
    }
    button.button--primary.svelte-kjj9fr .shape path { fill: url(#rm-svg-grad) !important; transition: opacity .2s; }
    button.button--primary.svelte-kjj9fr:hover .shape path { opacity: 0.85; }
    button.button--primary.svelte-kjj9fr .content svg { color: #fff !important; }

    .input.svelte-14rzpox,input.field.svelte-14rzpox {
      background: rgba(22,27,39,0.7) !important;
      color: var(--rm-text) !important;
      border: 1px solid transparent !important;
      border-radius: 999px !important;
      padding: 9px 16px !important;
      font-size: 14px !important;
      backdrop-filter: blur(12px);
      transition: background .18s, border-color .18s, box-shadow .18s;
    }
    input.field.svelte-14rzpox::placeholder { color: var(--rm-text-mute) !important; }
    input.field.svelte-14rzpox:focus,.input.svelte-14rzpox:focus-within {
      background: rgba(22,27,39,0.9) !important;
      border-color: var(--rm-accent) !important;
      box-shadow: 0 0 0 3px rgba(74,108,247,0.15) !important;
      outline: none !important;
    }

    .item.svelte-rg2upy { padding: 2px 8px !important; }
    .cell.svelte-q2jdqb {
      background: transparent !important;
      border-radius: var(--rm-radius-md) !important;
      padding: 10px 12px !important;
      margin: 1px 0 !important;
      transition: background .15s ease, transform .1s ease;
      color: var(--rm-text) !important;
      cursor: pointer;
    }
    .cell.svelte-q2jdqb:hover { background: rgba(255,255,255,0.04) !important; }
    .cell.svelte-q2jdqb:active { transform: scale(0.99); }
    .cell.svelte-q2jdqb.cell--selected {
      background: ${grad} !important;
      box-shadow: 0 4px 20px rgba(74,108,247,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .cell.svelte-q2jdqb.cell--selected .title,
    .cell.svelte-q2jdqb.cell--selected .name,
    .cell.svelte-q2jdqb.cell--selected .text,
    .cell.svelte-q2jdqb.cell--selected .meta,
    .cell.svelte-q2jdqb.cell--selected .time { color: #fff !important; }
    .cell.svelte-q2jdqb.cell--selected .readMarker svg { color: #fff !important; }

    .cell.svelte-q2jdqb .avatar.svelte-q2jdqb,.avatar.svelte-1gp4c0a { border-radius: 50% !important; }
    .avatar.svelte-1gp4c0a img.img { border-radius: 50% !important; transition: transform .25s ease; }
    .cell.svelte-q2jdqb:hover .avatar.svelte-1gp4c0a img { transform: scale(1.04); }

    .title.svelte-q2jdqb,.name.svelte-1riu5uh,.text.svelte-1riu5uh {
      color: var(--rm-text) !important;
      font-weight: 600 !important; font-size: 14.5px !important;
      letter-spacing: -0.01em !important;
    }
    .text.svelte-q2jdqb,.author.svelte-q2jdqb {
      color: var(--rm-text-dim) !important;
      font-size: 13px !important; line-height: 1.4 !important;
    }
    .meta.svelte-q2jdqb,.time.svelte-q2jdqb {
      color: var(--rm-text-mute) !important;
      font-size: 12px !important; font-weight: 500 !important;
    }
    .readMarker.svelte-q2jdqb svg { color: var(--rm-accent) !important; }
    .iconMute.svelte-q2jdqb svg { color: var(--rm-text-mute) !important; }
    .pinSeparator.svelte-1hgamje { background: var(--rm-border) !important; height: 1px !important; margin: 6px 16px !important; }

    main.main,.main.svelte-fqw3x2 {
      ${S.wallEnabled ? 'background: transparent !important;' : `
        background: var(--rm-bg0) !important;
        background-image:
          radial-gradient(ellipse 900px 500px at 20% 0%, rgba(107,135,255,0.05), transparent 70%),
          radial-gradient(ellipse 900px 500px at 80% 100%, rgba(155,93,229,0.04), transparent 70%) !important;
      `}
    }

    .topbar.svelte-1rr87da,.headerWrapper.svelte-1rr87da,
    .header.svelte-1rr87da,.header.svelte-1hrr6vf {
      background: rgba(16,20,29,0.72) !important;
      backdrop-filter: saturate(180%) blur(22px);
      -webkit-backdrop-filter: saturate(180%) blur(22px);
      border-bottom: 1px solid var(--rm-border) !important;
    }
    .title.svelte-1hrr6vf .name,.title.svelte-1hrr6vf .text {
      color: var(--rm-text) !important;
      font-weight: 700 !important; font-size: 15px !important;
    }
    .subtitle.svelte-1hrr6vf,.subtitle.svelte-j1rs9b,.subtitleItem.svelte-j1rs9b {
      color: var(--rm-text-mute) !important;
      font-size: 12.5px !important;
    }
    button.button--ghost.svelte-kjj9fr { color: var(--rm-text-dim) !important; }
    button.button--ghost.svelte-kjj9fr .shape path { fill: transparent !important; transition: fill .15s; }
    button.button--ghost.svelte-kjj9fr:hover { color: var(--rm-text) !important; }
    button.button--ghost.svelte-kjj9fr:hover .shape path { fill: rgba(255,255,255,0.08) !important; }

    .banner.svelte-1rr87da,.banner.svelte-wia3yg {
      background: rgba(240,78,90,0.06) !important;
      border-bottom: 1px solid var(--rm-border) !important;
    }
    button.button--stretched.svelte-23gx81 { color: var(--rm-danger) !important; font-weight: 500 !important; }
    button.button--stretched.svelte-23gx81:hover { background: rgba(240,78,90,0.10) !important; }

    .history.svelte-3850xr,.history.svelte-1prjz03,
    .droparea.svelte-1j1uzh9,.zone.svelte-1j1uzh9 { background: transparent !important; }

    .capsule.svelte-3850xr,.capsule.svelte-1sv74gv {
      background: rgba(30,37,52,0.72) !important;
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      color: var(--rm-text) !important;
      border-radius: 999px !important;
      padding: 6px 16px !important;
      font-size: 12.5px !important; font-weight: 600 !important;
      border: 1px solid rgba(255,255,255,0.10) !important;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3) !important;
    }
    .capsuleSeparator.svelte-3850xr { background: transparent !important; position: relative; }
    .capsuleSeparator.svelte-3850xr::before {
      content: ''; position: absolute; left: 16px; right: 16px; top: 50%;
      height: 1px; background: var(--rm-border); z-index: 0;
    }
    .capsuleSeparator.svelte-3850xr .capsule { position: relative; z-index: 1; }

    /* ============================================================
     *  ПУЗЫРИ
     * ============================================================ */
    .bubble.svelte-1htnb3l {
      border-radius: var(--rm-radius-bubble) !important;
      padding: 6px 10px 4px !important;
      box-shadow: 0 1px 2px rgba(0,0,0,0.25) !important;
    }
    div[data-bubbles-variant="incoming"] .bubble,[data-bubbles-variant="incoming"] .bubble {
      background: ${S.wallEnabled ? 'rgba(22,27,39,0.85)' : 'var(--rm-bubble-in)'} !important;
      color: var(--rm-text) !important;
      border: 1px solid var(--rm-border-soft) !important;
      backdrop-filter: blur(12px);
    }
    div[data-bubbles-variant="outgoing"] .bubble,[data-bubbles-variant="outgoing"] .bubble {
      background: ${grad} !important;
      color: #fff !important;
      border: none !important;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 4px 16px rgba(74,108,247,0.25) !important;
    }
    [data-bubbles-variant="outgoing"] .bubble .text,
    [data-bubbles-variant="outgoing"] .bubble span { color: #fff !important; }
    .bubble.bubble--hideBackground { background: transparent !important; box-shadow: none !important; border: none !important; }

    .bordersWrapper--upper--left .bubble { border-top-left-radius: 4px !important; }
    .bordersWrapper--upper--right .bubble { border-top-right-radius: 4px !important; }
    .bordersWrapper--bottom--left .bubble { border-bottom-left-radius: 4px !important; }
    .bordersWrapper--bottom--right .bubble { border-bottom-right-radius: 4px !important; }

    .text.svelte-1htnb3l { font-size: 14.5px !important; line-height: 1.42 !important; word-wrap: break-word; }
    .meta.svelte-13lobfv,.meta .text.svelte-13lobfv {
      color: rgba(255,255,255,0.65) !important;
      font-size: 11.5px !important; font-weight: 500 !important;
    }
    [data-bubbles-variant="incoming"] .meta.svelte-13lobfv,
    [data-bubbles-variant="incoming"] .meta .text.svelte-13lobfv { color: var(--rm-text-mute) !important; }
    .meta--bubbled .meta.svelte-13lobfv,.meta--bubbled-outside .meta.svelte-13lobfv { color: var(--rm-text-mute) !important; }
    .header.svelte-1wamq0n .name .text,.name.svelte-1riu5uh .text {
      color: ${S.gradC1} !important;
      font-weight: 600 !important; font-size: 13px !important;
    }
    [data-bubbles-variant="incoming"] .header .name .text { color: ${S.gradC1} !important; }
    .role.svelte-1wamq0n { color: var(--rm-text-mute) !important; font-size: 11.5px !important; font-weight: 500 !important; }

    /* Reply */
    .link.svelte-1htnb3l { margin: 0 0 4px 0 !important; display: block !important; }
    .link.svelte-1htnb3l .mark.svelte-m3np2o {
      display: block !important; width: 100% !important; text-align: left !important;
      border: none !important; border-left: 3px solid !important;
      border-radius: var(--rm-radius-sm) !important;
      padding: 4px 8px 5px !important; margin: 0 !important; line-height: 1.25 !important;
      transition: background .15s, border-color .15s, transform .15s;
      cursor: pointer; overflow: hidden; position: relative;
      font-size: 12.5px !important; color: inherit !important;
      box-shadow: none !important; background-image: none !important;
    }
    .link.svelte-1htnb3l .mark.svelte-m3np2o[style] { background-color: unset !important; }
    [data-bubbles-variant="outgoing"] .link .mark.svelte-m3np2o {
      background: rgba(255,255,255,0.16) !important;
      border-left-color: #ffffff !important;
    }
    [data-bubbles-variant="outgoing"] .link .mark.svelte-m3np2o:hover {
      background: rgba(255,255,255,0.24) !important; transform: translateX(1px);
    }
    [data-bubbles-variant="incoming"] .link .mark.svelte-m3np2o {
      background: rgba(74,108,247,0.14) !important;
      border-left-color: ${S.gradC1} !important;
    }
    [data-bubbles-variant="incoming"] .link .mark.svelte-m3np2o:hover {
      background: rgba(74,108,247,0.22) !important; transform: translateX(1px);
    }
    .link.svelte-1htnb3l .mark.svelte-m3np2o::after {
      content: ''; position: absolute; left: 8px; right: 8px; bottom: -4px;
      height: 1px; pointer-events: none;
    }
    [data-bubbles-variant="outgoing"] .link .mark.svelte-m3np2o::after { background: rgba(255,255,255,0.14); }
    [data-bubbles-variant="incoming"] .link .mark.svelte-m3np2o::after { background: var(--rm-border); }

    [data-bubbles-variant="outgoing"] .mark .author .name .text,
    [data-bubbles-variant="outgoing"] .mark .author.svelte-m3np2o {
      color: #ffffff !important; font-weight: 700 !important; font-size: 12px !important;
    }
    [data-bubbles-variant="incoming"] .mark .author .name .text,
    [data-bubbles-variant="incoming"] .mark .author.svelte-m3np2o {
      color: ${S.gradC1} !important; font-weight: 700 !important; font-size: 12px !important;
    }
    .mark .author { display: inline !important; margin-right: 4px !important; }
    .mark .author .name { display: inline !important; }
    .mark .author .name .text.svelte-1riu5uh { display: inline !important; font-size: 12px !important; }
    [data-bubbles-variant="outgoing"] .mark .text.svelte-m3np2o,
    [data-bubbles-variant="outgoing"] .mark .text.svelte-m3np2o span {
      color: rgba(255,255,255,0.95) !important;
      font-size: 12px !important; font-weight: 500 !important; line-height: 1.25 !important;
    }
    [data-bubbles-variant="incoming"] .mark .text.svelte-m3np2o,
    [data-bubbles-variant="incoming"] .mark .text.svelte-m3np2o span {
      color: var(--rm-text-dim) !important;
      font-size: 12px !important; font-weight: 500 !important; line-height: 1.25 !important;
    }
    .bubbleContent.svelte-1htnb3l > .link:first-child { margin-top: 0 !important; }
    .bubbleContent.svelte-1htnb3l > .link + .text { margin-top: 2px !important; }

    .sticker.svelte-19cataq { background: transparent !important; border-radius: var(--rm-radius-md) !important; }
    .image-placeholder.svelte-1aizpza img { border-radius: var(--rm-radius-md) !important; }
    .spinner svg { color: ${S.gradC1} !important; }

    /* Composer */
    .composer.svelte-17fi2hf,.composer.svelte-nwz8cp {
      background: ${S.wallEnabled ? 'rgba(16,20,29,0.75)' : 'var(--rm-bg1)'} !important;
      ${S.wallEnabled ? 'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);' : ''}
      border-top: 1px solid var(--rm-border) !important;
      padding: 12px 16px !important;
      width: 100% !important; max-width: 100% !important;
    }
    .composer.svelte-nwz8cp {
      display: flex !important; align-items: flex-end !important; gap: 6px !important;
      width: 100% !important; max-width: 100% !important;
    }
    .input.svelte-nwz8cp {
      flex: 1 1 auto !important; min-width: 0 !important;
      display: flex !important; align-items: flex-end !important; gap: 6px !important;
      background: rgba(22,27,39,0.85) !important;
      border-radius: var(--rm-radius-lg) !important; padding: 2px !important;
      transition: background .18s, box-shadow .18s;
    }
    .input.svelte-nwz8cp:focus-within {
      background: rgba(22,27,39,0.95) !important;
      box-shadow: 0 0 0 3px rgba(74,108,247,0.15) !important;
    }
    .input.svelte-1k31az8 {
      flex: 1 1 auto !important; min-width: 0 !important;
      background: transparent !important; border-radius: var(--rm-radius-lg) !important;
    }
    .input.svelte-1k31az8:focus-within { background: transparent !important; box-shadow: none !important; }
    .contenteditable.svelte-1k31az8 {
      background: transparent !important;
      color: var(--rm-text) !important;
      caret-color: ${S.gradC1} !important;
      font-size: 14.5px !important; line-height: 1.45 !important;
      padding: 10px 14px 10px 14px !important;
      min-height: 42px !important; outline: none !important;
    }
    .contenteditable.svelte-1k31az8 p { margin: 0; padding: 0 !important; }
    .placeholder.svelte-1k31az8 {
      color: var(--rm-text-mute) !important; font-size: 14.5px !important;
      left: 46px !important; right: auto !important;
      pointer-events: none !important; transition: opacity .15s;
    }
    .btn.svelte-nwz8cp { flex: 0 0 auto !important; }
    .btn.svelte-nwz8cp button.button--ghost { color: var(--rm-text-dim) !important; }
    .btn.svelte-nwz8cp button.button--ghost:hover { color: var(--rm-text) !important; background: rgba(255,255,255,0.08) !important; }
    .btn.svelte-nwz8cp button.button--ghost .shape path { fill: transparent !important; transition: fill .15s; }
    .btn.svelte-nwz8cp button.button--ghost:hover .shape path { fill: rgba(255,255,255,0.08) !important; }

    .splitter.svelte-1ou0ns6 { background: transparent !important; transition: background .2s; }
    .splitter.svelte-1ou0ns6:hover,.splitter.svelte-1ou0ns6:active { background: var(--rm-accent) !important; }

    /* ============================================================
     *  FIX: Контекстное меню (ПКМ) — реакции + список действий
     *  Проблема: уезжает вниз, reactions-бар отделяется.
     *  Решение: не перезаписываем position/transform, только цвета.
     * ============================================================ */
    .popoverPortal > *,
    .tooltipPortal > *,
    [role="dialog"],
    [role="menu"],
    [class*="popover" i],
    [class*="contextMenu" i],
    [class*="context-menu" i],
    [class*="dropdown" i] {
      background: var(--rm-glass) !important;
      backdrop-filter: blur(28px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
      color: var(--rm-text) !important;
      border: 1px solid var(--rm-glass-str) !important;
      border-radius: var(--rm-radius-lg) !important;
      box-shadow:
        0 12px 40px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.06) !important;
      /* ВАЖНО: не трогаем position/transform/inset/top/left/right/bottom —
         иначе ломается позиционирование относительно курсора */
    }
    /* НЕ применяем overflow:hidden — из-за него срезаются реакции */
    .popoverPortal > *,
    [class*="contextMenu" i],
    [class*="context-menu" i] {
      overflow: visible !important;
    }

    /* Реакции-бар (смайлики сверху) — не трогаем layout, только цвета */
    [class*="reaction" i],
    [class*="Reaction" i],
    [class*="reactions" i] {
      background: transparent !important;
    }
    [class*="reaction" i] button,
    [class*="Reaction" i] button,
    [class*="reactions" i] button {
      background: transparent !important;
      border-radius: 50% !important;
      transition: transform .12s, background .12s;
    }
    [class*="reaction" i] button:hover,
    [class*="Reaction" i] button:hover {
      background: rgba(255,255,255,0.10) !important;
      transform: scale(1.12);
    }

    /* Пункты меню */
    [role="dialog"] button,
    [role="menu"] button,
    [class*="menuItem" i],
    [class*="menu-item" i],
    [class*="contextMenuItem" i],
    [class*="context-menu-item" i] {
      color: var(--rm-text) !important;
      border-radius: var(--rm-radius-sm) !important;
      transition: background .12s;
      background: transparent !important;
    }
    [role="dialog"] button:hover,
    [role="menu"] button:hover,
    [class*="menuItem" i]:hover,
    [class*="menu-item" i]:hover,
    [class*="contextMenuItem" i]:hover { background: rgba(255,255,255,0.08) !important; }

    /* Иконки внутри меню */
    [class*="menuItem" i] svg,
    [class*="contextMenuItem" i] svg { color: var(--rm-text-dim) !important; }
    [class*="menuItem" i]:hover svg,
    [class*="contextMenuItem" i]:hover svg { color: var(--rm-text) !important; }

    /* Удалить — красный */
    [class*="menuItem" i]:has(svg + span),
    [class*="contextMenuItem" i] [class*="danger" i],
    [class*="contextMenuItem" i] [class*="delete" i] { color: ${S.danger || '#F04E5A'} !important; }

    /* ============================================================
     *  EMPTY STATE
     * ============================================================ */
    .emptyState.svelte-fqw3x2,
    main.main .emptyState,
    .emptyState {
      position: absolute !important;
      inset: 0 !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      width: 100% !important; height: 100% !important;
      pointer-events: none;
    }
    .emptyState.svelte-fqw3x2::before,
    main.main .emptyState::before,
    .emptyState::before {
      content: attr(data-remax-empty);
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: clamp(32px, 5vw, 64px);
      font-weight: 800;
      letter-spacing: -0.03em;
      background: ${grad};
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center; opacity: 0.9;
      filter: drop-shadow(0 4px 24px rgba(74,108,247,0.35));
      animation: remax-fade-in .5s ease-out;
      white-space: nowrap; pointer-events: auto;
    }
    @keyframes remax-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 0.9; transform: translateY(0); }
    }

    button { font-family: inherit !important; transition: background .15s, color .15s, transform .1s, box-shadow .15s; }
    button:active:not(.splitter) { transform: scale(0.96); }
    button:focus-visible { outline: 2px solid var(--rm-accent); outline-offset: 2px; }

    .settingsTab .item, .settingsTab button.item, .settingsTab a.item {
      color: var(--rm-text) !important;
      border-radius: var(--rm-radius-md) !important;
    }
    .settingsTab .item:hover { background: rgba(255,255,255,0.05) !important; }
    .settingsTab .profile {
      background: rgba(255,255,255,0.05) !important;
      border-radius: var(--rm-radius-lg) !important;
    }
    .settingsTab .name { color: var(--rm-text) !important; font-weight: 600 !important; }
    .settingsTab .phone { color: var(--rm-text-mute) !important; }

    [style*="background: #fff"],[style*="background:#fff"],
    [style*="background-color: #fff"],[style*="background-color:#fff"],
    [style*="background: white"],[style*="background-color: white"],
    [style*="background: #ffffff"],[style*="background-color: #ffffff"] {
      background: var(--rm-bg2) !important;
    }
    [style*="color: #000"],[style*="color:#000"],
    [style*="color: black"],[style*="color: #000000"] {
      color: var(--rm-text) !important;
    }
    #boot-loader { background: var(--rm-bg0) !important; }
    .spinner.svelte-ssmtps svg { color: ${S.gradC1} !important; }

    /* ============================================================
     *  ПАНЕЛЬ НАСТРОЕК
     * ============================================================ */
    #remax-settings-modal {
      position: fixed; inset: 0; z-index: 2147483646;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
      animation: remax-fade-in .2s ease-out;
      font-family: 'Inter', system-ui, sans-serif;
    }
    #remax-settings-modal .box {
      width: min(600px, 92vw); max-height: 88vh; overflow: auto;
      background: var(--rm-glass);
      backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid var(--rm-glass-str);
      border-radius: var(--rm-radius-lg);
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      color: var(--rm-text); padding: 22px;
    }
    #remax-settings-modal h2 {
      margin: 0 0 4px; font-size: 20px; font-weight: 700;
      background: ${grad};
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    #remax-settings-modal .sub { color: var(--rm-text-mute); font-size: 12.5px; margin-bottom: 18px; }
    #remax-settings-modal .presets {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 8px; margin-bottom: 18px;
    }
    #remax-settings-modal .preset {
      padding: 8px 10px; border-radius: var(--rm-radius-md);
      border: 1px solid var(--rm-border-str);
      background: rgba(255,255,255,0.03);
      cursor: pointer; font-size: 12px; color: var(--rm-text);
      transition: transform .12s, background .12s, border-color .12s;
      font-weight: 600; text-align: center;
    }
    #remax-settings-modal .preset:hover {
      background: rgba(255,255,255,0.08); transform: translateY(-1px);
    }
    #remax-settings-modal .preset.active {
      border-color: var(--rm-accent);
      box-shadow: 0 0 0 1px var(--rm-accent), 0 4px 16px rgba(74,108,247,0.25);
    }
    #remax-settings-modal .preset .swatch {
      height: 20px; border-radius: 6px; margin-bottom: 6px;
    }
    #remax-settings-modal .group {
      padding: 12px 0; border-bottom: 1px solid var(--rm-border);
    }
    #remax-settings-modal .group:last-of-type { border-bottom: none; }
    #remax-settings-modal label {
      display: block; font-size: 12px; color: var(--rm-text-dim);
      font-weight: 600; margin-bottom: 6px; letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    #remax-settings-modal .row {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
    }
    #remax-settings-modal input[type="color"] {
      width: 44px; height: 32px; padding: 0;
      border: 1px solid var(--rm-border-str);
      border-radius: var(--rm-radius-sm); cursor: pointer; background: transparent;
    }
    #remax-settings-modal input[type="range"] { flex: 1; accent-color: ${S.gradC1}; }
    #remax-settings-modal input[type="text"],
    #remax-settings-modal input[type="url"] {
      background: rgba(0,0,0,0.25); border: 1px solid var(--rm-border-str);
      color: var(--rm-text); border-radius: var(--rm-radius-sm);
      padding: 6px 10px; font-size: 13px; font-family: monospace;
      flex: 1; min-width: 0;
    }
    #remax-settings-modal .val {
      min-width: 48px; text-align: right; font-family: monospace;
      font-size: 12.5px; color: var(--rm-text-dim);
    }
    #remax-settings-modal .preview {
      height: 48px; border-radius: var(--rm-radius-md);
      background: ${grad};
      border: 1px solid var(--rm-border-str);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
      transition: background .2s ease;
    }
    #remax-settings-modal .footer {
      display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px;
      flex-wrap: wrap;
    }
    #remax-settings-modal button.rm-btn {
      border: none; cursor: pointer; font-family: inherit;
      font-size: 13.5px; font-weight: 600;
      padding: 8px 16px; border-radius: var(--rm-radius-md);
      transition: transform .1s, opacity .15s;
    }
    #remax-settings-modal button.rm-btn:active { transform: scale(0.97); }
    #remax-settings-modal button.rm-primary {
      background: ${grad}; color: #fff;
      box-shadow: 0 4px 16px rgba(74,108,247,0.35);
    }
    #remax-settings-modal button.rm-primary:hover { opacity: 0.9; }
    #remax-settings-modal button.rm-secondary {
      background: rgba(255,255,255,0.08); color: var(--rm-text);
    }
    #remax-settings-modal button.rm-secondary:hover { background: rgba(255,255,255,0.14); }
    #remax-settings-modal button.rm-danger {
      background: rgba(240,78,90,0.15); color: #F04E5A;
    }
    #remax-settings-modal button.rm-danger:hover { background: rgba(240,78,90,0.25); }
    #remax-settings-modal textarea {
      background: rgba(0,0,0,0.25); border: 1px solid var(--rm-border-str);
      color: var(--rm-text); border-radius: var(--rm-radius-sm);
      padding: 8px 10px; font-size: 12px; font-family: monospace;
      width: 100%; min-height: 120px; resize: vertical;
    }
    `;
  }

  /* ============================================================
   *  STYLES INJECT
   * ============================================================ */
  let styleEl = null;
  function injectStyles() {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'remax-theme';
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = buildCss();
  }
  injectStyles();

  function injectSvgGrad() {
    let svg = document.getElementById('rm-svg-defs');
    if (svg) svg.remove();
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'rm-svg-defs';
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.pointerEvents = 'none';
    svg.innerHTML = `
      <defs>
        <linearGradient id="rm-svg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${S.gradC1}"/>
          <stop offset="100%" stop-color="${S.gradC2}"/>
        </linearGradient>
      </defs>`;
    document.body.appendChild(svg);
  }

  /* ============================================================
   *  DARK PAINT
   * ============================================================ */
  function luminance(rgb) {
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3) return null;
    const [r, g, b] = m.map(Number);
    return r * 0.299 + g * 0.587 + b * 0.114;
  }
  function paintDark(root) {
    const nodes = (root || document.body).querySelectorAll('*:not(svg *)');
    nodes.forEach((el) => {
      if (el.closest('#remax-settings-modal')) return;
      if (el.closest('.popoverPortal, .tooltipPortal, [role="dialog"], [role="menu"]')) return;
      if (el.classList && el.classList.contains('mark') &&
          el.closest('.link.svelte-1htnb3l')) return;
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const lum = luminance(bg);
        if (lum !== null && lum > 180) {
          const big = el.clientWidth > innerWidth * 0.5 && el.clientHeight > innerHeight * 0.5;
          el.style.setProperty('background-color', big ? 'var(--rm-bg0)' : 'var(--rm-bg2)', 'important');
        }
      }
      const col = cs.color;
      if (col) {
        const lum = luminance(col);
        if (lum !== null && lum < 90) el.style.setProperty('color', 'var(--rm-text)', 'important');
      }
    });
  }

  /* ============================================================
   *  EMPTY STATE
   * ============================================================ */
  function applyEmptyState() {
    if (!S.showEmpty) return;
    const lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
    const isRu = lang.startsWith('ru');
    const text = isRu ? '404, ладно шучу' : '404, just kidding';
    const states = document.querySelectorAll('.emptyState, main .emptyState');
    states.forEach((el) => el.setAttribute('data-remax-empty', text));
  }

  /* ============================================================
   *  ПАНЕЛЬ НАСТРОЕК
   * ============================================================ */
  function openSettings() {
    if (document.getElementById('remax-settings-modal')) return;

    const presetList = Object.entries(PRESETS).map(([key, p]) => `
      <div class="preset ${S.presetName === key ? 'active' : ''}" data-preset="${key}">
        <div class="swatch" style="background: linear-gradient(${p.angle}deg, ${p.c1}, ${p.c2})"></div>
        ${p.name}
      </div>
    `).join('');

    const modal = document.createElement('div');
    modal.id = 'remax-settings-modal';
    modal.innerHTML = `
      <div class="box">
        <h2>ReMax v3.0 — Настройки</h2>
        <div class="sub">Всё меняется в реальном времени · Сохраняется автоматически · Alt+Shift+R</div>

        <label>Пресеты тем</label>
        <div class="presets" id="rm-presets">${presetList}</div>

        <div class="group">
          <label>Градиент — цвет 1 (светло-синий)</label>
          <div class="row">
            <input type="color" id="rm-c1" value="${S.gradC1}">
            <input type="text" id="rm-c1-hex" value="${S.gradC1}">
            <span class="val">→ цвет 2</span>
          </div>
        </div>

        <div class="group">
          <label>Градиент — цвет 2 (фиолетовый)</label>
          <div class="row">
            <input type="color" id="rm-c2" value="${S.gradC2}">
            <input type="text" id="rm-c2-hex" value="${S.gradC2}">
          </div>
        </div>

        <div class="group">
          <label>Угол градиента</label>
          <div class="row">
            <input type="range" id="rm-angle" min="0" max="360" value="${S.gradAngle}">
            <span class="val" id="rm-angle-val">${S.gradAngle}°</span>
          </div>
          <div class="preview" id="rm-preview" style="margin-top:10px;"></div>
        </div>

        <div class="group">
          <label>Акцентный цвет (ссылки, фокус, галочки)</label>
          <div class="row">
            <input type="color" id="rm-accent" value="${S.accent}">
            <input type="text" id="rm-accent-hex" value="${S.accent}">
          </div>
        </div>

        <div class="group">
          <label>Фон 0 (глубокий) · Фон 1 (sidebar) · Фон 2 (карточки)</label>
          <div class="row">
            <input type="color" id="rm-bg0" value="${S.bg0}">
            <input type="color" id="rm-bg1" value="${S.bg1}">
            <input type="color" id="rm-bg2" value="${S.bg2}">
          </div>
        </div>

        <div class="group">
          <label>Цвет текста</label>
          <div class="row">
            <input type="color" id="rm-text" value="${S.textColor}">
            <input type="text" id="rm-text-hex" value="${S.textColor}">
          </div>
        </div>

        <div class="group">
          <label>Скругления: малое / среднее / большое / пузыри</label>
          <div class="row"><input type="range" id="rm-rsm" min="0" max="20" value="${S.radiusSm}"><span class="val" id="rm-rsm-val">${S.radiusSm}</span></div>
          <div class="row"><input type="range" id="rm-rmd" min="0" max="30" value="${S.radiusMd}"><span class="val" id="rm-rmd-val">${S.radiusMd}</span></div>
          <div class="row"><input type="range" id="rm-rlg" min="0" max="40" value="${S.radiusLg}"><span class="val" id="rm-rlg-val">${S.radiusLg}</span></div>
          <div class="row"><input type="range" id="rm-rbub" min="0" max="40" value="${S.radiusBubble}"><span class="val" id="rm-rbub-val">${S.radiusBubble}</span></div>
        </div>

        <div class="group">
          <label>🖼️ Кастомные обои</label>
          <div class="row" style="margin-bottom:8px">
            <label style="text-transform:none;font-weight:500;margin:0;display:flex;align-items:center;gap:6px">
              <input type="checkbox" id="rm-wall-enabled" ${S.wallEnabled ? 'checked' : ''}> Включить обои
            </label>
          </div>
          <div class="row" style="margin-bottom:8px">
            <label style="text-transform:none;font-weight:500;margin:0;color:var(--rm-text-dim)">Тип:</label>
            <select id="rm-wall-type" style="background:rgba(0,0,0,0.25);border:1px solid var(--rm-border-str);color:var(--rm-text);padding:6px 10px;border-radius:8px;font-size:13px">
              <option value="gradient" ${S.wallType==='gradient'?'selected':''}>Градиент</option>
              <option value="image" ${S.wallType==='image'?'selected':''}>Картинка (URL)</option>
              <option value="solid" ${S.wallType==='solid'?'selected':''}>Сплошной цвет</option>
            </select>
          </div>
          <div class="row" id="rm-wall-image-row" style="display:${S.wallType==='image'?'flex':'none'};margin-bottom:8px">
            <input type="url" id="rm-wall-url" placeholder="https://example.com/wallpaper.jpg" value="${(S.wallUrl||'').replace(/"/g,'&quot;')}">
          </div>
          <div class="row" id="rm-wall-gradient-row" style="display:${S.wallType==='gradient'?'flex':'none'};margin-bottom:8px">
            <input type="color" id="rm-wall-c1" value="${S.wallGradC1}">
            <input type="color" id="rm-wall-c2" value="${S.wallGradC2}">
            <input type="range" id="rm-wall-angle" min="0" max="360" value="${S.wallGradAngle}">
            <span class="val" id="rm-wall-angle-val">${S.wallGradAngle}°</span>
          </div>
          <div class="row" id="rm-wall-solid-row" style="display:${S.wallType==='solid'?'flex':'none'};margin-bottom:8px">
            <input type="color" id="rm-wall-solid" value="${S.wallSolid}">
          </div>
          <div class="row" style="margin-bottom:8px">
            <label style="text-transform:none;font-weight:500;margin:0;color:var(--rm-text-dim);min-width:90px">Прозрачность:</label>
            <input type="range" id="rm-wall-opacity" min="0" max="1" step="0.05" value="${S.wallOpacity}">
            <span class="val" id="rm-wall-opacity-val">${Math.round(S.wallOpacity*100)}%</span>
          </div>
          <div class="row" style="margin-bottom:8px">
            <label style="text-transform:none;font-weight:500;margin:0;color:var(--rm-text-dim);min-width:90px">Размытие:</label>
            <input type="range" id="rm-wall-blur" min="0" max="30" value="${S.wallBlur}">
            <span class="val" id="rm-wall-blur-val">${S.wallBlur}px</span>
          </div>
          <div class="row">
            <label style="text-transform:none;font-weight:500;margin:0;color:var(--rm-text-dim);min-width:90px">Поведение:</label>
            <select id="rm-wall-attach" style="background:rgba(0,0,0,0.25);border:1px solid var(--rm-border-str);color:var(--rm-text);padding:6px 10px;border-radius:8px;font-size:13px">
              <option value="fixed" ${S.wallAttach==='fixed'?'selected':''}>Зафиксировано</option>
              <option value="scroll" ${S.wallAttach==='scroll'?'selected':''}>Прокручивается</option>
            </select>
          </div>
        </div>

        <div class="group">
          <label>404 надпись на пустом экране</label>
          <div class="row">
            <input type="checkbox" id="rm-showempty" ${S.showEmpty ? 'checked' : ''}>
            <span style="color:var(--rm-text-dim);font-size:13px">Показывать</span>
          </div>
        </div>

        <div class="group">
          <label>📋 Импорт / Экспорт</label>
          <textarea id="rm-json" placeholder='Вставь JSON сюда для импорта, либо нажми "Экспорт" чтобы получить текущий'></textarea>
          <div class="row" style="margin-top:8px">
            <button class="rm-btn rm-secondary" id="rm-export" style="flex:1">Экспорт в поле</button>
            <button class="rm-btn rm-secondary" id="rm-copy" style="flex:1">Скопировать в буфер</button>
            <button class="rm-btn rm-primary" id="rm-import" style="flex:1">Импорт из поля</button>
          </div>
        </div>

        <div class="footer">
          <button class="rm-btn rm-danger" id="rm-reset">Сбросить всё</button>
          <button class="rm-btn rm-secondary" id="rm-close">Закрыть</button>
          <button class="rm-btn rm-primary" id="rm-save">Применить и закрыть</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const $ = (sel) => modal.querySelector(sel);

    function syncPreview() {
      const c1 = $('#rm-c1').value;
      const c2 = $('#rm-c2').value;
      const angle = $('#rm-angle').value;
      $('#rm-preview').style.background = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    }

    function applyLive() {
      S.gradC1 = $('#rm-c1').value;
      S.gradC2 = $('#rm-c2').value;
      S.gradAngle = +$('#rm-angle').value;
      S.accent = $('#rm-accent').value;
      S.bg0 = $('#rm-bg0').value;
      S.bg1 = $('#rm-bg1').value;
      S.bg2 = $('#rm-bg2').value;
      S.textColor = $('#rm-text').value;
      S.radiusSm = +$('#rm-rsm').value;
      S.radiusMd = +$('#rm-rmd').value;
      S.radiusLg = +$('#rm-rlg').value;
      S.radiusBubble = +$('#rm-rbub').value;
      S.showEmpty = $('#rm-showempty').checked;

      S.wallEnabled = $('#rm-wall-enabled').checked;
      S.wallType = $('#rm-wall-type').value;
      S.wallUrl = $('#rm-wall-url').value;
      S.wallGradC1 = $('#rm-wall-c1').value;
      S.wallGradC2 = $('#rm-wall-c2').value;
      S.wallGradAngle = +$('#rm-wall-angle').value;
      S.wallSolid = $('#rm-wall-solid').value;
      S.wallOpacity = +$('#rm-wall-opacity').value;
      S.wallBlur = +$('#rm-wall-blur').value;
      S.wallAttach = $('#rm-wall-attach').value;

      // Лейблы
      $('#rm-angle-val').textContent = S.gradAngle + '°';
      $('#rm-rsm-val').textContent = S.radiusSm;
      $('#rm-rmd-val').textContent = S.radiusMd;
      $('#rm-rlg-val').textContent = S.radiusLg;
      $('#rm-rbub-val').textContent = S.radiusBubble;
      $('#rm-wall-angle-val').textContent = S.wallGradAngle + '°';
      $('#rm-wall-opacity-val').textContent = Math.round(S.wallOpacity*100) + '%';
      $('#rm-wall-blur-val').textContent = S.wallBlur + 'px';

      // Показ нужной строки
      $('#rm-wall-image-row').style.display = S.wallType === 'image' ? 'flex' : 'none';
      $('#rm-wall-gradient-row').style.display = S.wallType === 'gradient' ? 'flex' : 'none';
      $('#rm-wall-solid-row').style.display = S.wallType === 'solid' ? 'flex' : 'none';

      // Hex обновления
      $('#rm-c1-hex').value = S.gradC1;
      $('#rm-c2-hex').value = S.gradC2;
      $('#rm-accent-hex').value = S.accent;
      $('#rm-text-hex').value = S.textColor;

      injectStyles();
      injectSvgGrad();
      saveSettings(S);
      applyEmptyState();
    }

    // Color ↔ hex
    [['#rm-c1','#rm-c1-hex'],['#rm-c2','#rm-c2-hex'],['#rm-accent','#rm-accent-hex'],['#rm-text','#rm-text-hex']].forEach(([c,h]) => {
      $(c).addEventListener('input', () => { $(h).value = $(c).value; applyLive(); syncPreview(); });
      $(h).addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test($(h).value)) { $(c).value = $(h).value; applyLive(); syncPreview(); }
      });
    });

    // Range / все inputs
    ['#rm-angle','#rm-rsm','#rm-rmd','#rm-rlg','#rm-rbub',
     '#rm-wall-enabled','#rm-wall-type','#rm-wall-url',
     '#rm-wall-c1','#rm-wall-c2','#rm-wall-angle','#rm-wall-solid',
     '#rm-wall-opacity','#rm-wall-blur','#rm-wall-attach',
     '#rm-bg0','#rm-bg1','#rm-bg2','#rm-showempty'].forEach(sel => {
      $(sel).addEventListener('input', applyLive);
      $(sel).addEventListener('change', applyLive);
    });

    // Пресеты
    modal.querySelectorAll('.preset').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.preset;
        const p = PRESETS[key];
        if (!p) return;
        S.presetName = key;
        S.gradC1 = p.c1; S.gradC2 = p.c2; S.gradAngle = p.angle;
        S.accent = p.accent;
        S.bg0 = p.bg0; S.bg1 = p.bg1; S.bg2 = p.bg2;
        S.textColor = p.text;
        saveSettings(S);
        modal.remove();
        openSettings();
      });
    });

    // Экспорт / импорт
    $('#rm-export').addEventListener('click', () => {
      $('#rm-json').value = JSON.stringify(S, null, 2);
    });
    $('#rm-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(S, null, 2));
        $('#rm-copy').textContent = '✓ Скопировано';
        setTimeout(() => $('#rm-copy').textContent = 'Скопировать в буфер', 1500);
      } catch {}
    });
    $('#rm-import').addEventListener('click', () => {
      try {
        const data = JSON.parse($('#rm-json').value);
        S = { ...DEFAULT_SETTINGS, ...data };
        saveSettings(S);
        injectStyles();
        injectSvgGrad();
        applyEmptyState();
        modal.remove();
        openSettings();
      } catch (e) {
        alert('Ошибка импорта: ' + e.message);
      }
    });

    $('#rm-close').addEventListener('click', () => modal.remove());
    $('#rm-save').addEventListener('click', () => { applyLive(); modal.remove(); });
    $('#rm-reset').addEventListener('click', () => {
      S = { ...DEFAULT_SETTINGS };
      saveSettings(S);
      injectStyles();
      injectSvgGrad();
      applyEmptyState();
      modal.remove();
      openSettings();
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    syncPreview();
  }

  /* ============================================================
   *  МЕНЮ VIOLENTMONKEY + ХОТКЕЙ + FAB
   * ============================================================ */
  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('⚙️ ReMax — Настройки мода', openSettings);
    GM_registerMenuCommand('🔄 ReMax — Сбросить', () => {
      S = { ...DEFAULT_SETTINGS };
      saveSettings(S);
      injectStyles();
      injectSvgGrad();
      applyEmptyState();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyR') { e.preventDefault(); openSettings(); }
  });

  function injectFloatButton() {
    if (document.getElementById('remax-fab')) return;
    const fab = document.createElement('button');
    fab.id = 'remax-fab';
    fab.title = 'ReMax — Настройки (Alt+Shift+R)';
    fab.innerHTML = '⚙️';
    Object.assign(fab.style, {
      position: 'fixed', bottom: '20px', left: '86px',
      width: '40px', height: '40px', borderRadius: '50%',
      background: `linear-gradient(${S.gradAngle}deg, ${S.gradC1}, ${S.gradC2})`,
      color: '#fff', border: 'none', cursor: 'pointer', fontSize: '18px',
      zIndex: '2147483645',
      boxShadow: '0 4px 16px rgba(74,108,247,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform .15s, box-shadow .15s',
      padding: '0', lineHeight: '1'
    });
    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'scale(1.08)';
      fab.style.boxShadow = '0 6px 24px rgba(74,108,247,0.5), inset 0 1px 0 rgba(255,255,255,0.25)';
    });
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'scale(1)';
      fab.style.boxShadow = '0 4px 16px rgba(74,108,247,0.35), inset 0 1px 0 rgba(255,255,255,0.2)';
    });
    fab.addEventListener('click', openSettings);
    document.body.appendChild(fab);
  }

  /* ============================================================
   *  BOOT
   * ============================================================ */
  function applyMeta() {
    let tc = document.querySelector('meta[name="theme-color"]');
    if (!tc) { tc = document.createElement('meta'); tc.name = 'theme-color'; document.head.appendChild(tc); }
    tc.content = S.bg0;
  }
  function watchHtmlAttrs() {
    const html = document.documentElement;
    new MutationObserver(() => {
      if (html.getAttribute('data-color-scheme') !== 'dark') html.setAttribute('data-color-scheme', 'dark');
    }).observe(html, { attributes: true, attributeFilter: ['data-color-scheme', 'data-color-theme', 'class'] });
  }

  function boot() {
    applyMeta();
    watchHtmlAttrs();
    injectSvgGrad();
    injectFloatButton();
    paintDark();
    applyEmptyState();

    const mo = new MutationObserver(() => {
      clearTimeout(boot._t);
      boot._t = setTimeout(() => { paintDark(); applyEmptyState(); }, 300);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(() => { paintDark(); applyEmptyState(); }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else boot();
})();
