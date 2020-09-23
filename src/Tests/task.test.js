const { TestScheduler } = require('jest')
const request = require('supertest')
const app = require('../app')
const Task = require('../models/task')
const {userOne, userOneId, taskTwo, setupDB} = require('./fixtures/db')


beforeEach(setupDB)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    
    const task = await Task.findById(response.body._id)
    expect((task)).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should fetch user tasks', async () => {
    const response = await request(app)
        .get('/task')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body.length).toEqual(1)
})

test('Should not delete other users task', async () => {
    const response = await request(app)
        .delete(`/task/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
    
    const task = await Task.findById(taskTwo._id)
    expect(task).not.toBeNull()
})