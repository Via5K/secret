require("dotenv").config();
const express = require("express");
const parser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
const {
    faIgloo
} = require("@fortawesome/free-solid-svg-icons");


// const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(parser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// const url = process.ADMIN + process.env.PASSWORD + process.env.DB;

const url = "mongodb://localhost:27017/Secrets";
mongoose.connect(url, {
    useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {
//     secret: process.env.SECRET,
//     encryptedFields: ["password"]
// });

const User = mongoose.model("user", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function(req, res) {
    res.render("home")
});
app.get("/login", function(req, res) {
    res.render("login")
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated()) {

        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});
app.get("/register", function(req, res) {
    res.render("register")
});
app.post("/register", function(req, res) {
    User.register({
        username: req.body.username
    }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });

        }
    });

});

app.get("/logout", function(req, res) {
    req.logOut(function(err) {
        if (err) console.log("Unable to logout");
        else res.redirect("/");
    });
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Starting Server on 3000");
});