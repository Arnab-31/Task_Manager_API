const request = require('supertest')
const app = require('../app')
const User = require('../models/user')
const {userOne, userOneId, setupDB} = require('./fixtures/db')


beforeEach(setupDB)

test('Should signup a new user', async() => {
    jest.setTimeout(30000);
    const response = await request(app).post('/user').send({
        name: 'Arnab',
        email: 'anc@gmail.com',
        password: 'MyAPI123!'
    }).expect(201)

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'Arnab',
            email: 'anc@gmail.com',
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('MyAPI123!');
})

test('Should login user', async() => {
    jest.setTimeout(30000);
    const response = await request(app).post('/user/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async() => {
    jest.setTimeout(30000);
    await request(app).post('/user/login').send({
        email: 'nonexis@gmail.com',
        password: 'anyPass123'
    }).expect(400)
})

test('Should get profile for user', async() => {
    jest.setTimeout(30000);
    await request(app)
        .get('/user/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async() => {
    jest.setTimeout(30000);
    await request(app)
        .get('/user/me')
        .send()
        .expect(401)
})

test('Should delete a  user', async() => {
    jest.setTimeout(30000);
    await request(app)
        .delete('/user/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOne._id);
    expect(user).toBeNull();
})

test('Should not delete an unauthenticated user', async() => {
    jest.setTimeout(30000);
    await request(app)
        .delete('/user/me')
        .send()
        .expect(401)
})

test('Should upload avatar', async() => {
    jest.setTimeout(30000);
    await request(app)
        .post('/user/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'src/Tests/fixtures/profile-pic.jpeg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async() => {
    jest.setTimeout(30000);
    await request(app)
        .patch('/user/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name: 'Mike Renamed!'})
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Mike Renamed!')
})

test('Should not update invalid user fields', async() => {
    jest.setTimeout(30000);
    await request(app)
        .patch('/user/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({location: 'India'})
        .expect(400)
})