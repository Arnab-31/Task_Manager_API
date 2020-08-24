const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const express = require('express');
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');
const { count } = require('./models/user');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

const app = express();
const port = process.env.PORT 


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, ()=>{
    console.log('Server is up on the port ',  port);
})