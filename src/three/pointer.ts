export const pointer = {
  x: 0,
  y: 0,
  scroll: 0,
}

let attached = 0

function onMove(event: MouseEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function onScroll() {
  pointer.scroll = window.scrollY
}

export function attachPointer() {
  attached += 1
  if (attached === 1) {
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  return () => {
    attached -= 1
    if (attached === 0) {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }
}
