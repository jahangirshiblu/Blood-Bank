// jshint esversion: 8

const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

function passportInitializer(passport, getUserByEmail, getUserById){
    const authenticator = async (email, password, done)=>{
        const user = getUserByEmail(email);
        if (user == null){
            return done(null, false, {message: "No user registered with that email"})
        }
        try {
            if( await bcrypt.compare(password, user.password)){
                return done(null, user);
            }
            else{
                return done(null, false, {message: "Password doesn't match"});
            }
        } catch (error) {
            return done(error);
        }
    }
    passport.use(new localStrategy({usernameField: "email"}, authenticator));
    passport.serializeUser((user, done)=>done(null, user.id));
    passport.deserializeUser((id, done)=>{
        return done(null, getUserById(id));
    });
}

module.exports = passportInitializer;