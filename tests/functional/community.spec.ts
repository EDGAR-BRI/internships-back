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

  test('ranking includes private-profile users too', async ({ client, assert }) => {
    const res = await client.get('/api/v1/community/ranking').loginAs(userA)
    res.assertStatus(200)
    const body: any = res.body()
    const ranking = body.data?.ranking || body.ranking
    const privateUser = ranking.find((r: any) => r.user.id === userB.id)
    assert.exists(privateUser)
    assert.isFalse('email' in privateUser.user)
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

  test('can react to a public note and toggle it off', async ({ client, assert }) => {
    const note = await Note.query().where('userId', userA.id).firstOrFail()
    const res = await client
      .post(`/api/v1/community/notes/${note.id}/reactions`)
      .loginAs(userA)
      .json({ emoji: '👍' })
    res.assertStatus(200)
    const body: any = res.body()
    const reactions = body.data?.reactions || body.reactions
    assert.equal(reactions.length, 1)
    assert.equal(reactions[0].emoji, '👍')
    assert.equal(reactions[0].reacted, true)

    const res2 = await client
      .post(`/api/v1/community/notes/${note.id}/reactions`)
      .loginAs(userA)
      .json({ emoji: '👍' })
    const body2: any = res2.body()
    const reactions2 = body2.data?.reactions || body2.reactions
    assert.equal(reactions2.length, 0)
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

  test('can react to a comment', async ({ client, assert }) => {
    const comment = await import('#models/note_comment').then((m) =>
      m.default.query().where('userId', userA.id).firstOrFail()
    )
    const res = await client
      .post(`/api/v1/community/comments/${comment.id}/reactions`)
      .loginAs(userA)
      .json({ emoji: '🔥' })
    res.assertStatus(200)
    const body: any = res.body()
    const reactions = body.data?.reactions || body.reactions
    assert.equal(reactions.length, 1)
    assert.equal(reactions[0].emoji, '🔥')
    assert.equal(reactions[0].reacted, true)
  })

  test('feed notes include comment reactions', async ({ client, assert }) => {
    const res = await client.get('/api/v1/community/notes?sort=popular').loginAs(userA)
    res.assertStatus(200)
    const body: any = res.body()
    const notes = body.data?.notes || body.notes
    assert.exists(notes)
    const note = notes.find((n: any) => n.title === 'Nota pública')
    assert.exists(note)
    assert.isTrue(Array.isArray(note.reactions))
    assert.isTrue(Array.isArray(note.comments[0].reactions))
    assert.exists(note.popularity)
  })

  test('cleanup', async () => {
    const notes = await Note.query().whereIn('userId', [userA.id, userB.id])
    for (const n of notes) await n.delete()
    await userA.delete()
    await userB.delete()
  })
})
