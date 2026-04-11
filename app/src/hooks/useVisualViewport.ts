import { useEffect, useState } from 'react'

/**
 * Returns the visual viewport height, which shrinks when the iOS keyboard opens.
 * This is the only reliable way to detect keyboard presence on iOS Safari/PWA,
 * since dvh, interactive-widget, and VirtualKeyboard API are all unsupported.
 */
export function useVisualViewport() {
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  )

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const onResize = () => setHeight(vv.height)

    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', onResize)
    }
  }, [])

  return height
}
