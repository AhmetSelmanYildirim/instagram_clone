const loggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('error',['Please sign in first']);
        res.redirect('/login')
    }
}
const notLoggedIn = function(req,res,next){
    if(!req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect('/homepage')
    }
}
module.exports = {loggedIn,notLoggedIn}