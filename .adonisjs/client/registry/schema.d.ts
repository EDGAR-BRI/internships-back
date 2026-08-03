/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.google_auth.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/google/redirect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['redirect']>>>
    }
  }
  'auth.google_auth.callback': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/google/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['callback']>>>
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'settings.settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['show']>>>
    }
  }
  'settings.settings.update': {
    methods: ["PUT"]
    pattern: '/api/v1/account/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_setting').updateSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_setting').updateSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'logEntries.log_entries.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/log-entries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['index']>>>
    }
  }
  'logEntries.log_entries.store': {
    methods: ["POST"]
    pattern: '/api/v1/log-entries'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/log_entry').createLogEntryValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/log_entry').createLogEntryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'logEntries.log_entries.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/log-entries/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['show']>>>
    }
  }
  'logEntries.log_entries.update': {
    methods: ["PUT"]
    pattern: '/api/v1/log-entries/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/log_entry').updateLogEntryValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/log_entry').updateLogEntryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'logEntries.log_entries.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/log-entries/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/log_entries_controller').default['destroy']>>>
    }
  }
  'notes.notes.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/notes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['index']>>>
    }
  }
  'notes.notes.store': {
    methods: ["POST"]
    pattern: '/api/v1/notes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/note').createNoteValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/note').createNoteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'notes.notes.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/notes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['show']>>>
    }
  }
  'notes.notes.update': {
    methods: ["PUT"]
    pattern: '/api/v1/notes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/note').updateNoteValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/note').updateNoteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'notes.notes.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/notes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notes_controller').default['destroy']>>>
    }
  }
  'attendances.attendances.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attendances'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['index']>>>
    }
  }
  'attendances.attendances.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attendances/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['summary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['summary']>>>
    }
  }
  'attendances.attendances.check_in': {
    methods: ["POST"]
    pattern: '/api/v1/attendances/check-in'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').checkInValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').checkInValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['checkIn']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['checkIn']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'attendances.attendances.check_out': {
    methods: ["POST"]
    pattern: '/api/v1/attendances/check-out'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').checkOutValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').checkOutValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['checkOut']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['checkOut']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'attendances.attendances.full_day': {
    methods: ["POST"]
    pattern: '/api/v1/attendances/full-day'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').fullDayValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').fullDayValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['fullDay']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['fullDay']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'attendances.attendances.partial': {
    methods: ["POST"]
    pattern: '/api/v1/attendances/partial'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').partialValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').partialValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['partial']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['partial']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'attendances.attendances.update': {
    methods: ["PUT"]
    pattern: '/api/v1/attendances/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').updateAttendanceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').updateAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'attendances.attendances.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/attendances/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendances_controller').default['destroy']>>>
    }
  }
}
