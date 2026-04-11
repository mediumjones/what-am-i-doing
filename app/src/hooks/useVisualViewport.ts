import { useEffect, useState } from 'react'

/**
 * Returns the visual viewport height, which shrinks when the iOS keyboard
 * opens. This is the only reliable way to detect keyboard presence on iOS
 * Safari/PWA — dvh, interactive-widget, and VirtualKeyboard API are all
 * unsupported on iOS.
 *
 * On every viewport change we force window.scrollTo(0,0) to prevent iOS
 * from scrolling the layout viewport when focusing an input. Combined with
 * position:fixed on html/body this keeps the page pinned at the top.
 */
export function useVisualViewport() {
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  )

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      // Force layout viewport back to top — prevents iOS from scrolling
      // the page when the keyboard opens, even with position:fixed on body
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      setHeight(vv.height)
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return height
}
