// this middleware is use to apply on all protected routes
// allowing authenticated/logged-in users only at protected/secure routes like order section.
const auth = (req,res,next)=>{
    // if user is authenticated/logged-in then only allow to go to protected routes
    if(req.isAuthenticated()){
        return next()
    }
    // else redirect back to login page
    return res.redirect('/login')
}

// export this middleware to use in web.js
module.exports = auth