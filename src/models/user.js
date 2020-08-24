const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer                //used to store binary image data
    }
}, {
    timestamps: true
})


userSchema.virtual('tasks', {             //used for establishing a relationship between two entities( We are not storing task id in the database under User entity)
    ref: 'tasks',
    localField: '_id',                  // _id of the User
    foreignField: 'owner'              //owner of the Task
})

userSchema.methods.toJSON = function() {      // used to remove private data from JSON response
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function() {                       //we use .methods when function is specific for every instance of model
    const token = jwt.sign({_id: this._id.toString() }, process.env.JWT_SECRET)

    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token
}

userSchema.statics.findByCredentials = async(email, password) => {         // .statics is used for fucntions which is going to used by models
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user;
}

//milleware hash the plain text password before saving
userSchema.pre('save', async function(next){

    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

//mdddleware remove all associated data of user before removing the user
userSchema.pre('remove', async function (next){
        await Task.deleteMany({owner: this._id})
        next()
})

const User = mongoose.model('users', userSchema)

module.exports = User