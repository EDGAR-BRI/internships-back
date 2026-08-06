import { test } from '@japa/runner'
import User from '#models/user'
import Note from '#models/note'

test.group('Community', () => {
  let userA: User
  let userB: User

  test('setup users', async () => {
    userA = await User.create({
      email: 'community-a@example.com',
      password: 'password123',
      fullName: 'Comunidad A',
      role: 'user',
      profilePublic: true,
    })
    userB = await User.create({
      email: 'community-b@example.com',
      password: 'password123',
      fullName: 'Comunidad B',
      role: 'user',
      profilePublic: false,
    })
  })

  test('private profile cannot access ranking', async ({ client, assert }) => {
    const res = await client.get('/api/v1/community/ranking').loginAs(userB)
    res.assertStatus(200)
    const body: any = res.body()
    assert.exists(body.data?.error || body.error)
  })

  test('public profile sees ranking without emails', async ({ client, assert }) => {
    const res = await client.get('/api/v1/community/ranking').loginAs(userA)
    res.assertStatus(200)
    const body: any = res.body()
    const ranking = body.data?.ranking || body.ranking
    assert.exists(ranking)
    const entry = ranking.find((r: any) => r.user.id === userA.id)
    assert.exists(entry)
    assert.isFalse('email' in entry.user)
  })

  test('public notes include only public users and no email', async ({ client, assert }) => {
    await Note.create({
      userId: userA.id,
      title: 'Nota pública',
      content: 'Contenido',
      tag: 'learning',
    })

    const res = await client.get('/api/v1/community/notes').loginAs(userA)
    res.assertStatus(200)
    const body: any = res.body()
    const notes = body.data?.notes || body.notes
    const note = notes.find((n: any) => n.title === 'Nota pública')
    assert.exists(note)
    assert.isFalse('email' in note.user)
  })

  test('can comment on a public note', async ({ client, assert }) => {
    const note = await Note.query().where('userId', userA.id).firstOrFail()
    const res = await client
      .post(`/api/v1/community/notes/${note.id}/comments`)
      .loginAs(userA)
      .json({ content: 'Buen trabajo!' })
    res.assertStatus(200)
    const body: any = res.body()
    const comment = body.data?.comment || body.comment
    assert.equal(comment.content, 'Buen trabajo!')
    assert.isFalse('email' in comment.user)
  })

  test('cleanup', async () => {
    const notes = await Note.query().whereIn('userId', [userA.id, userB.id])
    for (const n of notes) await n.delete()
    await userA.delete()
    await userB.delete()
  })
})
