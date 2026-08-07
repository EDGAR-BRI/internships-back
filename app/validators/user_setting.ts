import vine from '@vinejs/vine'

const dateFormats = { formats: ['iso8601'] }

const timeFormat = vine.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const updateSettingsValidator = vine.create({
  startDate: vine.date(dateFormats),
  endDate: vine.date(dateFormats).afterField('startDate'),
  skippedWeeks: vine.array(vine.number().positive().withoutDecimals()).optional(),
  workType: vine.enum(['full', 'partial']).optional(),
  workHoursPerDay: vine.number().positive().min(0.5).max(10).optional(),
  daysPerWeek: vine.number().positive().withoutDecimals().min(1).max(7).optional(),
  workStartTime: timeFormat.optional(),
  workEndTime: timeFormat.optional(),
})
