const express = require('express')
const router = new express.Router()
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')


router.post('/user',async(req,res)=>{
    const user = new User(req.body);

    try{
        await user.save();
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }

    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>
    // {
    //     res.status(400).send(e);
    // })
})

router.post('/user/login', async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token})
    }catch(e){
        res.status(400).send(e);
    }
})

router.post('/user/logout', auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save();

        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/user/logoutAll',  auth, async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.get('/user/me', auth, async (req,res)=>{
        res.send(req.user);
})


const upload = multer({
    //dest: 'avatars',          we add this line if we want to store the images in the avatars folder, but we want to store it in the usera model so we skip it
    limits: {
        fileSize: 1000000                                   //  1 MB limit
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an Image'))
        }

        cb(undefined, true)
    }
})
router.post('/user/me/avatar', auth, upload.single('avatar'), async (req,res)=>{               //now this route has two middleware auth and upload
    const buffer = await sharp(req.file.buffer).resize({with: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    //req.user.avatar = req.file.buffer                                 we do this if we dont need to modify image using sharp
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/user/me/avatar', auth, async(req,res)=>{
    req.user.avatar = undefined 
    await req.user.save()
    res.send()
})

router.get('/user/:id/avatar', async (req,res)=>{       //we can serve the image in html page like this <img src="http://localhost:3000/users/5f40c22e7d80b026a4a50f1b/avatar">
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png')               //used to set the data we are going to send to png, y default it is set to json so thats why we didnt use it till now
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})

router.patch('/user/me', auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try{
        updates.forEach((update)=> req.user[update]=req.body[update])
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        await req.user.save()
        
        res.send(req.user);
    }catch(e)
    {
        res.status(400).send(e);
    }
})

router.delete('/user/me', auth, async(req,res)=>{

    try{
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user);
    }catch(e){
        res.status(400).send(e);
    }
})


module.exports = router;