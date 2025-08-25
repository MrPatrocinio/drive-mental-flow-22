
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Inicializar com false ao invés de undefined para evitar problemas de renderização
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    console.log('useIsMobile: Inicializando detecção mobile');
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      console.log('useIsMobile: Mudança detectada - isMobile:', newIsMobile);
      setIsMobile(newIsMobile);
    }
    
    mql.addEventListener("change", onChange)
    
    // Set initial value
    const initialIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
    console.log('useIsMobile: Valor inicial - isMobile:', initialIsMobile);
    setIsMobile(initialIsMobile);
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
