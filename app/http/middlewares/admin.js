// this middleware is use to protect admin routes
// allowing only admin to access /admin/orders page(admin order section)
const admin = (req,res,next)=>{
    // if user is authenticated/logged-in and user is admin then only allow access to admin order section
    if(req.isAuthenticated() && req.user.role == 'admin'){
        return next()
    }
    // else redirect back to home page
    return res.redirect('/')
}

// export this middleware to use in web.js
module.exports = admin