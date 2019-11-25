//jshint esversion:8
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const bcrypt = require('bcryptjs');
const override = require("method-override");
const flash = require('express-flash');
const session = require("express-session");
const app = express();
app.use(express.static("public"));
const users = [];

const passportInitializer = require("./passport-config");
passportInitializer(passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id));

app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    save: false,
    resave: true,
    saveUninitialized: false
}));
app.use(override("_method"));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req,res)=>{
    res.render("index");
});

app.get("/become-donor", (req, res) => {
    res.render("become-donor");
});
app.get("/contact-us", (req, res) => {
    res.render("contact-us");
});
app.get("/page", (req, res) => {
    res.render("page");
});
app.get("/search-donor", (req, res) => {
    res.render("search-donor");
});
app.get("/slider", (req, res) => {
    res.render("slider");
});

app.get("/login", (req,res)=>{
    res.render("login");
});
app.get('/user', (req, res)=>{
    res.render("user", {users: users});
});
app.delete('/logout', (req,res)=>{
    req.logOut();
    res.redirect('/login');
});
app.post("/become-donor",async (req, res)=>{
    try {
        const hashpass = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashpass
        });
        res.redirect('/login');
    } catch (error) {
        res.redirect('/become-donor');
    }
    console.log(users);

});

app.post("/login", passport.authenticate('local',{
    successRedirect: "/user",
    failureRedirect: '/login',
    failureFlash: true
}));

function canNotGoBackIfLogIn(req,res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function canNotGoToAccountIfNotLogIN(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/user');
    }
    next();
}

app.listen(3000,(req,res)=>{
    console.log("Server-Port: 3000");
});
