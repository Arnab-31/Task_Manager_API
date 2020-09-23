const express = require('express')
const router = new express.Router()
const Task = require('../models/task');
const auth = require('../middleware/auth');


router.post('/task', auth, async(req,res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });

    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }

    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((e)=>
    // {
    //     res.status(400).send(e);
    // })
})

router.get('/task', auth, async (req,res)=>{

    try{
        // var tasks
        // if(req.query.completed){
        //     tasks = await Task.find({owner: req.user._id, completed: req.query.completed === 'true'});   //the query is in form of a string so we use === to convert it into bool
        // }else{
        //     tasks = await Task.find({owner: req.user._id});
        // }
        // res.send(tasks);
        //Instead of above lines we can also use the User id to get the task

        const match = {}
        const sort = {}
        
        if(req.query.completed){
        match.completed = req.query.completed === 'true'    
        }
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1:1
        }
        await req.user.populate({
           path: 'tasks',                            //path is the entity we want to populate
           match,                                   //match is an object used to filter all the data
           options: {
            limit: parseInt(req.query.limit),        //parseInt is used to convert the query string into a integer      
            skip: parseInt(req.query.skip),
            sort     
            }                                     
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e)
    {
        res.status(500).send(e);
    }
})

router.get('/task/:id', auth, async (req,res)=>{
    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e)
    {
        res.status(500).send(e);
    }

    // Task.findById(_id).then((task)=> {
    //     if(!task){
    //         return res.status(404).send();
    //     }

    //     res.send(task);
    // }).catch((e)=>{
    //     res.status(500).send(e);
    //     console.log(e);
    // })
})

router.patch('/task/:id', auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send();
        }

        updates.forEach((update)=> task[update]=req.body[update])
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        await task.save();

        res.send(task);
    }catch(e)
    {
        res.status(400).send(e);
    }
})

router.delete('/task/:id', auth, async(req,res)=>{

    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    }catch(e){
        res.status(404).send(e);
    }
})


module.exports = router;