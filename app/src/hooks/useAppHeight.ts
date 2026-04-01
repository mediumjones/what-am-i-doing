/**
 * Tracks the real visible viewport height via `window.visualViewport`
 * and sets CSS custom properties on <html> for the layout to consume.
 *
 * Uses `position: fixed` on html/body/#root (set in CSS) so that iOS
 * standalone PWA cannot scroll the document when the keyboard opens.
 * This keeps `vv.offsetTop` at 0 and prevents the double-compensation
 * bug where iOS resizes the layout viewport AND scrolls the visual viewport.
 */

import { useEffect } from 'react'

const KEYBOARD_THRESHOLD = 100

export function useAppHeight() {
  useEffect(() => {
    const vv = window.visualViewport
    const doc = document.documentElement
    const root = document.getElementById('root')

    function update() {
      const height = vv?.height ?? window.innerHeight
      const keyboardOpen = (window.innerHeight - height) > KEYBOARD_THRESHOLD

      doc.style.setProperty('--app-height', `${height}px`)

      doc.style.setProperty(
        '--spacing-safe-bottom-actual',
        keyboardOpen ? '0px' : 'env(safe-area-inset-bottom, 0px)',
      )

      if (root) {
        root.style.height = `${height}px`
      }

      // Force document scroll to origin — prevents iOS standalone from
      // shifting the visual viewport when the keyboard opens
      window.scrollTo(0, 0)
    }

    update()

    if (vv) {
      vv.addEventListener('resize', update)
      vv.addEventListener('scroll', update)
    }
    window.addEventListener('resize', update)

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update)
        vv.removeEventListener('scroll', update)
      }
      window.removeEventListener('resize', update)
    }
  }, [])
}
