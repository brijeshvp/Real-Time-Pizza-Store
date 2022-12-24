const guest = (req,res,next)=>{
    // if user is not authenticated/logged-in, render /login and /register routes to user
    if(!req.isAuthenticated()){
        return next()
    }
    // if user is authenticated/logged-in, don't render /login and /register route to user
    return res.redirect('/')
}

// export this middleware to use in web.js
module.exports = guest