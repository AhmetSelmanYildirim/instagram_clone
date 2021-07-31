const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user_model');
const bcrypt = require('bcrypt');

module.exports = function (passport) {
    const options = {
        usernameField: 'email',
        passwordField: 'password'
    };
    passport.use(new LocalStrategy(options, async (email, password, done) => {

        try {
            const _findUser = await User.findOne({ email: email });

            if (!_findUser) {
                return done(null, false, { message: 'User not found' })
            }

            const passwordCheck = await bcrypt.compare(password, _findUser.password);

            if (!passwordCheck) {
                return done(null, false, { message: 'Password failed' });
            } else {
                if (_findUser && _findUser.emailActive == false) {
                    return done(null, false, { message: 'Please approve your email' })
                } else {
                    return done(null, _findUser);
                }
            }

        } catch (error) {
            return done(error)
        }

    }));

    passport.serializeUser(function (user, done) {
        console.log("new session" + user.id);
        done(null, user.id);                                 //cookie id
    });

    // puts the current user datas to req.user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            const newUser = {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                username: user.username,
                avatar: user.avatar,
                photos: user.photos,
                followers: user.followers,
                following: user.following
            }
            done(err, newUser);
        })
    })
}