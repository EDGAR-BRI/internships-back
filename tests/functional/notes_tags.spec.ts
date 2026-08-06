import { test } from '@japa/runner'
import User from '#models/user'
import Note from '#models/note'
import SubscriptionService from '#services/subscription_service'

let user: User

test.group('Note tags', () => {
  test('setup user', async () => {
    user = await User.create({
      email: 'note-tags-user@example.com',
      password: 'password123',
      fullName: 'Note Tags User',
      role: 'user',
    })
    await SubscriptionService.assignPlan(user.id, 'pro')
  })

  test('creates a note with a free-text tag', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/notes')
      .loginAs(user)
      .json({ content: 'nota con tag libre', tag: 'investigación', logEntryId: null })
    res.assertStatus(200)
    assert.equal((res.body() as any).data.note.tag, 'investigación')
  })

  test('keeps preset tags working', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/notes')
      .loginAs(user)
      .json({ content: 'nota preset', tag: 'aprendizaje', logEntryId: null })
    res.assertStatus(200)
    assert.equal((res.body() as any).data.note.tag, 'aprendizaje')
  })

  test('rejects a tag longer than 30 chars', async ({ client }) => {
    const res = await client
      .post('/api/v1/notes')
      .loginAs(user)
      .json({ content: 'nota inválida', tag: 'a'.repeat(31), logEntryId: null })
    res.assertStatus(422)
  })

  test('allows updating a note to a custom tag', async ({ client, assert }) => {
    const created = await client
      .post('/api/v1/notes')
      .loginAs(user)
      .json({ content: 'nota a editar', tag: 'general', logEntryId: null })
    created.assertStatus(200)
    const noteId = (created.body() as any).data.note.id

    const updated = await client
      .put(`/api/v1/notes/${noteId}`)
      .loginAs(user)
      .json({ content: 'nota a editar', tag: 'tesis' })
    updated.assertStatus(200)
    assert.equal((updated.body() as any).data.note.tag, 'tesis')
  })

  test('cleanup', async () => {
    await Note.query().where('userId', user.id).delete()
    await User.query().where('id', user.id).delete()
  })
})
