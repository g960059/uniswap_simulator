import { useEffect } from 'react'
import { useRouter } from 'next/router'

import * as gtag from '../lib/gtag'

export default function usePageView() {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
}