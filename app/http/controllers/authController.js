// mongoose model
const User = require('../../models/user')

// modules used for authentication
const bcrypt = require('bcrypt')
const passport = require('passport')

// authController is a factory function -> which creates and returns an object(object creational pattern technique)
const authController = ()=>{
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin'?'/admin/orders' : '/customer/orders'
    }
    
    // return object containing functions
    return{
        login(req,res){
            res.render('auth/login')
        },
        postLogin(req,res,next){
            // refer for authenticate: https://www.npmjs.com/package/passport
            // 1st arg = strategy = local(username and password login)
            // 2nd arg = same done fn which is coming from /app/config/passport.js
            // there we have called done fn, here we are defining done fn.

            // passport.authenticate() returns a fn, so call it after recieving it
            const fn = passport.authenticate('local',(err,user,info) =>{
                // info is message obj(see done fn in /app/config/passport.js)
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }

                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }

                // if everything goes right, login the user
                req.logIn(user,(err) =>{
                    // if error while login
                    if(err){
                        req.flash('error',info.message)
                        return next(err)
                    }

                    // else redirect to url specified in req
                    return res.redirect(_getRedirectUrl(req))
                })
            })
            fn(req,res,next);
        },
        register(req,res){
            res.render('auth/register')
        },
        // postRegister is async fn bcoz bcrypt.hash() returns a promise so to await that, outer fn has to be async
        async postRegister(req,res){
            const { name,email,password } = req.body
            // console.log(req.body)

            // // no need to validate bcoz our form is good enough. will do it automatically
            // // validate request
            // if(!name || !email || !password){
            //     // if error, specify msg using flash using session
            //     req.flash('error','All fields are required')
            //     req.flash('name',name)
            //     req.flash('email',email)
            //     return res.redirect('/register')
            // }

            // check if email already exists in User model
            // 1st arg = filter obj
            // 2nd arg = call back fn, which will be executed when filter matches
            User.exists({email:email},(err,result)=>{
                // if filter matches
                if(result){
                    req.flash('error','Email already taken')
                    req.flash('name',name)
                    req.flash('email',email)
                    return res.redirect('/register')    // we need to always send response/redirect(else page will keep loading)
                }
            })

            // if everything goes right, create user and save to db
            // always stored hashed passwords in db for security
            // use bcrypt package
            // hash password
            // this is Technique 2 (to auto-gen a salt and hash):
            // refer: https://www.npmjs.com/package/bcrypt
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password,saltRounds)
            // create a user 
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            })

            // user.save() returns a promise, so use .then()
            user.save().then((user) =>{
                // redirect to login page
                // as of now redirect to home page(since no login page)
                return res.redirect('/')
            }).catch(err =>{
                req.flash('error','Something went wrong')
                return res.redirect('/register')
            })
        },
        logout(req,res){
            req.logout()
            return res.redirect('/login')
        }
    }
}

// export and recieve it in web.js
module.exports = authController