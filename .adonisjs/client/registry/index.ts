/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'auth.google_auth.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google/redirect',
    tokens: [{"old":"/api/v1/auth/google/redirect","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"google","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth.google_auth.redirect']['types'],
  },
  'auth.google_auth.callback': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google/callback',
    tokens: [{"old":"/api/v1/auth/google/callback","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"google","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.google_auth.callback']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'settings.settings.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/settings',
    tokens: [{"old":"/api/v1/account/settings","type":0,"val":"api","end":""},{"old":"/api/v1/account/settings","type":0,"val":"v1","end":""},{"old":"/api/v1/account/settings","type":0,"val":"account","end":""},{"old":"/api/v1/account/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['settings.settings.show']['types'],
  },
  'settings.settings.update': {
    methods: ["PUT"],
    pattern: '/api/v1/account/settings',
    tokens: [{"old":"/api/v1/account/settings","type":0,"val":"api","end":""},{"old":"/api/v1/account/settings","type":0,"val":"v1","end":""},{"old":"/api/v1/account/settings","type":0,"val":"account","end":""},{"old":"/api/v1/account/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['settings.settings.update']['types'],
  },
  'logEntries.log_entries.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/log-entries',
    tokens: [{"old":"/api/v1/log-entries","type":0,"val":"api","end":""},{"old":"/api/v1/log-entries","type":0,"val":"v1","end":""},{"old":"/api/v1/log-entries","type":0,"val":"log-entries","end":""}],
    types: placeholder as Registry['logEntries.log_entries.index']['types'],
  },
  'logEntries.log_entries.store': {
    methods: ["POST"],
    pattern: '/api/v1/log-entries',
    tokens: [{"old":"/api/v1/log-entries","type":0,"val":"api","end":""},{"old":"/api/v1/log-entries","type":0,"val":"v1","end":""},{"old":"/api/v1/log-entries","type":0,"val":"log-entries","end":""}],
    types: placeholder as Registry['logEntries.log_entries.store']['types'],
  },
  'logEntries.log_entries.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/log-entries/:id',
    tokens: [{"old":"/api/v1/log-entries/:id","type":0,"val":"api","end":""},{"old":"/api/v1/log-entries/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/log-entries/:id","type":0,"val":"log-entries","end":""},{"old":"/api/v1/log-entries/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['logEntries.log_entries.show']['types'],
  },
  'logEntries.log_entries.update': {
    methods: ["PUT"],
    pattern: '/api/v1/log-entries/:id',
    tokens: [{"old":"/api/v1/log-entries/:id","type":0,"val":"api","end":""},{"old":"/api/v1/log-entries/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/log-entries/:id","type":0,"val":"log-entries","end":""},{"old":"/api/v1/log-entries/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['logEntries.log_entries.update']['types'],
  },
  'logEntries.log_entries.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/log-entries/:id',
    tokens: [{"old":"/api/v1/log-entries/:id","type":0,"val":"api","end":""},{"old":"/api/v1/log-entries/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/log-entries/:id","type":0,"val":"log-entries","end":""},{"old":"/api/v1/log-entries/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['logEntries.log_entries.destroy']['types'],
  },
  'notes.notes.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/notes',
    tokens: [{"old":"/api/v1/notes","type":0,"val":"api","end":""},{"old":"/api/v1/notes","type":0,"val":"v1","end":""},{"old":"/api/v1/notes","type":0,"val":"notes","end":""}],
    types: placeholder as Registry['notes.notes.index']['types'],
  },
  'notes.notes.store': {
    methods: ["POST"],
    pattern: '/api/v1/notes',
    tokens: [{"old":"/api/v1/notes","type":0,"val":"api","end":""},{"old":"/api/v1/notes","type":0,"val":"v1","end":""},{"old":"/api/v1/notes","type":0,"val":"notes","end":""}],
    types: placeholder as Registry['notes.notes.store']['types'],
  },
  'notes.notes.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/notes/:id',
    tokens: [{"old":"/api/v1/notes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/notes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/notes/:id","type":0,"val":"notes","end":""},{"old":"/api/v1/notes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['notes.notes.show']['types'],
  },
  'notes.notes.update': {
    methods: ["PUT"],
    pattern: '/api/v1/notes/:id',
    tokens: [{"old":"/api/v1/notes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/notes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/notes/:id","type":0,"val":"notes","end":""},{"old":"/api/v1/notes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['notes.notes.update']['types'],
  },
  'notes.notes.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/notes/:id',
    tokens: [{"old":"/api/v1/notes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/notes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/notes/:id","type":0,"val":"notes","end":""},{"old":"/api/v1/notes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['notes.notes.destroy']['types'],
  },
  'admin.admin_users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users',
    tokens: [{"old":"/api/v1/admin/users","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.admin_users.index']['types'],
  },
  'admin.admin_users.summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/summary',
    tokens: [{"old":"/api/v1/admin/summary","type":0,"val":"api","end":""},{"old":"/api/v1/admin/summary","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/summary","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/summary","type":0,"val":"summary","end":""}],
    types: placeholder as Registry['admin.admin_users.summary']['types'],
  },
  'attendances.attendances.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/attendances',
    tokens: [{"old":"/api/v1/attendances","type":0,"val":"api","end":""},{"old":"/api/v1/attendances","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances","type":0,"val":"attendances","end":""}],
    types: placeholder as Registry['attendances.attendances.index']['types'],
  },
  'attendances.attendances.summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/attendances/summary',
    tokens: [{"old":"/api/v1/attendances/summary","type":0,"val":"api","end":""},{"old":"/api/v1/attendances/summary","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances/summary","type":0,"val":"attendances","end":""},{"old":"/api/v1/attendances/summary","type":0,"val":"summary","end":""}],
    types: placeholder as Registry['attendances.attendances.summary']['types'],
  },
  'attendances.attendances.check_in': {
    methods: ["POST"],
    pattern: '/api/v1/attendances/check-in',
    tokens: [{"old":"/api/v1/attendances/check-in","type":0,"val":"api","end":""},{"old":"/api/v1/attendances/check-in","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances/check-in","type":0,"val":"attendances","end":""},{"old":"/api/v1/attendances/check-in","type":0,"val":"check-in","end":""}],
    types: placeholder as Registry['attendances.attendances.check_in']['types'],
  },
  'attendances.attendances.check_out': {
    methods: ["POST"],
    pattern: '/api/v1/attendances/check-out',
    tokens: [{"old":"/api/v1/attendances/check-out","type":0,"val":"api","end":""},{"old":"/api/v1/attendances/check-out","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances/check-out","type":0,"val":"attendances","end":""},{"old":"/api/v1/attendances/check-out","type":0,"val":"check-out","end":""}],
    types: placeholder as Registry['attendances.attendances.check_out']['types'],
  },
  'attendances.attendances.full_day': {
    methods: ["POST"],
    pattern: '/api/v1/attendances/full-day',
    tokens: [{"old":"/api/v1/attendances/full-day","type":0,"val":"api","end":""},{"old":"/api/v1/attendances/full-day","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances/full-day","type":0,"val":"attendances","end":""},{"old":"/api/v1/attendances/full-day","type":0,"val":"full-day","end":""}],
    types: placeholder as Registry['attendances.attendances.full_day']['types'],
  },
  'attendances.attendances.partial': {
    methods: ["POST"],
    pattern: '/api/v1/attendances/partial',
    tokens: [{"old":"/api/v1/attendances/partial","type":0,"val":"api","end":""},{"old":"/api/v1/attendances/partial","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances/partial","type":0,"val":"attendances","end":""},{"old":"/api/v1/attendances/partial","type":0,"val":"partial","end":""}],
    types: placeholder as Registry['attendances.attendances.partial']['types'],
  },
  'attendances.attendances.update': {
    methods: ["PUT"],
    pattern: '/api/v1/attendances/:id',
    tokens: [{"old":"/api/v1/attendances/:id","type":0,"val":"api","end":""},{"old":"/api/v1/attendances/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances/:id","type":0,"val":"attendances","end":""},{"old":"/api/v1/attendances/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['attendances.attendances.update']['types'],
  },
  'attendances.attendances.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/attendances/:id',
    tokens: [{"old":"/api/v1/attendances/:id","type":0,"val":"api","end":""},{"old":"/api/v1/attendances/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/attendances/:id","type":0,"val":"attendances","end":""},{"old":"/api/v1/attendances/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['attendances.attendances.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
