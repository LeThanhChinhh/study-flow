export const normalizeTimeValue = (time) => (time ? String(time).slice(0, 5) : '')

export const timeSlotsOverlap = (left, right) => {
  if (Number(left.dayOfWeek) !== Number(right.dayOfWeek)) return false

  const leftStart = normalizeTimeValue(left.startTime)
  const leftEnd = normalizeTimeValue(left.endTime)
  const rightStart = normalizeTimeValue(right.startTime)
  const rightEnd = normalizeTimeValue(right.endTime)

  return leftStart < rightEnd && leftEnd > rightStart
}

export const findOverlap = (candidate, slots, ignoredId = null) =>
  slots.find(
    (slot) =>
      (!ignoredId || slot.id !== ignoredId) &&
      timeSlotsOverlap(candidate, slot),
  ) || null

export const findInternalOverlap = (slots) => {
  for (let leftIndex = 0; leftIndex < slots.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < slots.length; rightIndex += 1) {
      if (timeSlotsOverlap(slots[leftIndex], slots[rightIndex])) {
        return { leftIndex, rightIndex }
      }
    }
  }

  return null
}
