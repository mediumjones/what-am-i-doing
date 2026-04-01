/**
 * On-screen viewport debug overlay.
 * Activate via ?debug=1 in the URL.
 * Shows live visualViewport values so you can diagnose
 * keyboard/layout issues on a real device without dev tools.
 */

import { useEffect, useState } from 'react'

interface ViewportValues {
  innerHeight: number
  vvHeight: number | null
  vvOffsetTop: number | null
  appHeight: string
  vvOffsetVar: string
  rootHeight: number
  rootTransform: string
}

function read(): ViewportValues {
  const vv = window.visualViewport
  const style = getComputedStyle(document.documentElement)
  const root = document.getElementById('root')
  const rootStyle = root ? getComputedStyle(root) : null

  return {
    innerHeight: window.innerHeight,
    vvHeight: vv?.height ?? null,
    vvOffsetTop: vv?.offsetTop ?? null,
    appHeight: style.getPropertyValue('--app-height').trim() || '(unset)',
    vvOffsetVar: style.getPropertyValue('--vv-offset-top').trim() || '(unset)',
    rootHeight: root?.offsetHeight ?? 0,
    rootTransform: rootStyle?.transform ?? 'none',
  }
}

export default function ViewportDebug() {
  const [vals, setVals] = useState<ViewportValues>(read)

  useEffect(() => {
    const vv = window.visualViewport

    function update() {
      setVals(read())
    }

    // Poll at 200ms as a safety net (some iOS events are missed)
    const interval = setInterval(update, 200)

    if (vv) {
      vv.addEventListener('resize', update)
      vv.addEventListener('scroll', update)
    }
    window.addEventListener('resize', update)

    return () => {
      clearInterval(interval)
      if (vv) {
        vv.removeEventListener('resize', update)
        vv.removeEventListener('scroll', update)
      }
      window.removeEventListener('resize', update)
    }
  }, [])

  const kbOpen = vals.vvHeight !== null && vals.innerHeight - vals.vvHeight > 100
  const gap = vals.vvHeight !== null ? vals.innerHeight - vals.vvHeight - (vals.vvOffsetTop ?? 0) : null

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 10,
        lineHeight: 1.5,
        padding: '6px 8px',
        borderRadius: 6,
        pointerEvents: 'none',
        maxWidth: '55vw',
        whiteSpace: 'pre',
      }}
    >
      {`KB: ${kbOpen ? '🟢 OPEN' : '⚫ closed'}
innerHeight:    ${vals.innerHeight}
vv.height:      ${vals.vvHeight ?? 'N/A'}
vv.offsetTop:   ${vals.vvOffsetTop ?? 'N/A'}
--app-height:   ${vals.appHeight}
--vv-offset-top:${vals.vvOffsetVar}
#root height:   ${vals.rootHeight}
#root transform:${vals.rootTransform}
gap (ih-vvH-off):${gap ?? 'N/A'}`}
    </div>
  )
}
