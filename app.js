const express = require("express");
const parser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const dotEnv = require("dotenv").config();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(parser.urlencoded({
    extended: true
}));
// const url = process.ADMIN + process.env.PASSWORD + process.env.DB;
const url = "mongodb://localhost:27017/Secrets";
mongoose.connect(url, {
    useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ["password"]
});
const User = mongoose.model("user", userSchema);
app.get("/", function(req, res) {
    res.render("home")
});
app.get("/login", function(req, res) {
    res.render("login")
});
app.post("/login", function(req, res) {
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({
        email: email,
    }, function(err, result) {
        if (err) console.log(err);
        else {
            if (result) {
                if (result.password === password) {
                    console.log("Successfull Login!!"); //send success msg.
                    res.redirect("/secrets");
                } else {
                    console.log("Wrong Password"); //send wrong password msg
                    res.redirect("/");
                }
            }
        }

    });
});
app.get("/secrets", function(req, res) {
    res.render("secrets");
});
app.get("/register", function(req, res) {
    res.render("register")
});
app.post("/register", function(req, res) {

    const email = req.body.username;
    const password = req.body.password;
    const user = new User({
        email: email,
        password: password
    });
    //find the user
    User.find({
        email: email
    }, function(err, result) {
        if (result.length > 0) { //if the user is already in the database, then display this msg and goto login
            console.log("User Already in the Database Please Login!!"); //send already registered msg.
            res.redirect("/login");
        } else if (err) { //if there is an error then goto home register page
            console.log("Some Error Occurred!!"); //send error occured msg.
            res.redirect("/register");
        } else { //and if there was no error and no user then register this user.
            //add into databse...
            user.save((err) => {
                if (!err) {
                    console.log("Successfully registered!"); //send successfully registered and say redirecting...
                    res.render("secrets");
                } else {
                    console.log(err);
                }
            });
        }
    });
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Starting Server on 3000");
});