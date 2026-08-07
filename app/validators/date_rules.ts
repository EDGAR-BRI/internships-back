import vine from '@vinejs/vine'
import type { FieldContext } from '@vinejs/vine/types'

const TIMEZONE = 'America/Mexico_City'

export function todayInZone(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
}

export const dateRule = vine.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const notInFuture = vine.createRule(
  (value: unknown, _options, field: FieldContext) => {
    if (typeof value !== 'string') return value
    const today = todayInZone()
    if (value > today) {
      field.isValid = false
      field.report('La fecha no puede ser futura', 'notInFuture', field)
    }
    return value
  },
  { name: 'notInFuture' }
)
