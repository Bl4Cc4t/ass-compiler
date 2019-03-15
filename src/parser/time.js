export function parseTime(time) {
  const t = time.split(':')
  return t[0] * 3600000 + t[1] * 60000 + t[2] * 1000
}
