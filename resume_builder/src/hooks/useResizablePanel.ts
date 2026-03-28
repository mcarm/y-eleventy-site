import { useState, useCallback, useEffect } from 'react'

type UseResizablePanelReturn = {
  panelWidth: number
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
}

export const useResizablePanel = (
  initialWidth: number = 50,
  minWidth: number = 20,
  maxWidth: number = 80
): UseResizablePanelReturn => {
  const [panelWidth, setPanelWidth] = useState(initialWidth)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const containerWidth = window.innerWidth
    const newWidth = (e.clientX / containerWidth) * 100
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setPanelWidth(newWidth)
    }
  }, [isDragging, minWidth, maxWidth])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return { panelWidth, isDragging, handleMouseDown }
}
