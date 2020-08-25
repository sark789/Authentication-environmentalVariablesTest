require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
//lv4 encryption
//const bcrypt = require("bcrypt");
//const saltRounds = 10;
//lv 3 security
//const md5 = require("md5");
//lv2 encryption
//const encrypt = require("mongoose-encryption");


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
//console.log(process.env.API_KEY);

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

//lv2 encryption
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});


app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})



app.post("/register", function(req, res){
  //lv4 encryption
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash){
  //   const newUser = new User({
  //     email: req.body.username,
  //     //lv3 security
  //     //password: md5(req.body.password)
  //     password: hash
  //   });
  //
  //   newUser.save(function(err){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     res.render("secrets");
  //   }
  // });
  // });

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      })
    }
  })



});


app.post("/login", function(req, res){

  //lv4 encryption
  // const username = req.body.username;
  // const password = req.body.password;
  // //lv3 security
  // //const password = md5(req.body.password);
  //
  // User.findOne({email: username}, function(err, foundUser){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(foundUser){
  //       //lv3
  //       // if(foundUser.password === password){
  //       //   res.render("secrets");
  //       // }
  //       bcrypt.compare(password, foundUser.password, function(err, result){
  //         if(result === true){
  //           res.render("secrets");
  //         }
  //       });
  //     }
  //   }
  // })

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
    })
  }
})

})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
