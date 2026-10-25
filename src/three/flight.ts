export const FLIGHT_DURATION = 5
export const MOBILE_FLIGHT_DURATION = 2

export const flight = {
  progress: 0,
  tailX: -80,
  tailY: 180,
  epoch: -1,
  run: 0,
}

export function restartFlight() {
  flight.progress = 0
  flight.epoch = -1
  flight.tailX = -80
  flight.tailY = 180
  flight.run += 1
}

export function cruise(t: number) {
  const x = Math.min(Math.max(t, 0), 1)
  if (x < 0.03) {
    const u = x / 0.03
    return 0.03 * u * u
  }
  if (x > 0.94) {
    const u = (x - 0.94) / 0.06
    return 0.94 + 0.06 * (1 - (1 - u) * (1 - u))
  }
  return x
}
