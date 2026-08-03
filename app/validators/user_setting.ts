import vine from '@vinejs/vine'

const dateFormats = { formats: ['iso8601'] }

export const updateSettingsValidator = vine.create({
  startDate: vine.date(dateFormats),
  endDate: vine.date(dateFormats).afterField('startDate'),
  skippedWeeks: vine.array(vine.number().positive().withoutDecimals()).optional(),
  workType: vine.enum(['full', 'partial']).optional(),
  workHoursPerDay: vine.number().positive().withoutDecimals().optional(),
})
