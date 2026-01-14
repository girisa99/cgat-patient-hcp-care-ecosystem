import * as React from "react"

// Breakpoints: mobile < 768 < tablet < 1024 < desktop
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Hook to detect if device is tablet (768-1023px) or smaller
export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobileOrTablet
}

// Hook to get device type
export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setDeviceType('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }
    
    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
    return () => window.removeEventListener('resize', updateDeviceType)
  }, [])

  return deviceType
}
