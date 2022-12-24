// import passport-local strategy
const LocalStrategy = require('passport-local').Strategy
// mongoose model
const User = require('../models/user')
// to compare hashed and plain password and provide login, import bcrypt
const bcrypt = require('bcrypt')

// recieve passport module from server.js
const init = (passport)=>{
    // Refer: https://www.passportjs.org/packages/passport-local/
    // 1st arg in LocalStrategy object is an object specifying what is username in your app
    // in our case, username = email
    // 2nd arg = fn recieving username(email in our case),password,done(callback fn)
    // this fn = async since findOne() returns promise so we have to use await
    passport.use(new LocalStrategy({usernameField: 'email'},async (email,password,done)=>{
        // Login logic
        // check if email exists
        // we have set email as unique in user model. so we can use findOne instead of findMany it will return only one user if exists
        // findOne() arg = filter object
        const user = await User.findOne({email: email})
        // if user not found, run callback fn giving error msg
        // callback done fn takes 3 arg
        // 1st error = null
        // 2nd user data = false(since user doesn't exist)
        // 3rd optional arg
        if(!user){
            return done(null,false,{message: 'No user with this email'})
        }

        // 1st arg = plain password
        // 2nd arg = hashed password = user.password from db
        // refer: https://www.npmjs.com/package/bcrypt
        bcrypt.compare(password,user.password).then((match) =>{
            // if password matches, run callback and login 
            if(match){
                // here 2nd arg = user bcoz user exists
                return done(null,user,{message: 'Logged in successfully'})
            }

            // else run callback and give error msg
            return done(null,false,{message: 'Incorrect username or password'})
        }).catch(err =>{
            return done(null,false,{message:'Something went wrong'})
        })
        // if any error while comparing passwords, throw error
    }))

    // refer serialize and deserialize logic here: https://www.npmjs.com/package/passport
    // Passport will maintain persistent login sessions. In order for persistent sessions to work, the authenticated user must be serialized to the session, and deserialized when subsequent requests are made. Passport does not impose any restrictions on how your user records are stored. Instead, you provide functions to Passport which implements the necessary serialization and deserialization logic. In a typical application, this will be as simple as serializing the user ID, and finding the user by ID when deserializing.

    // if user is logged in, store user id in session
    passport.serializeUser((user,done) =>{
        // 1st arg = error
        // 2nd arg = whatever you want to store in session
        done(null,user._id)
    })


    passport.deserializeUser((id,done) =>{
        User.findById(id,(err,user)=>{
            done(err,user)
        })
    })
}

// export this to import in server.js
module.exports = init