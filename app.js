const express = require("express"),
      app = express(),
      bodyParser     = require("body-parser"),
      mongoose = require("mongoose"),
      passport = require("passport"),
      LocalStrategy = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      moment = require("moment"),
      nodemailer = require("nodemailer")
      User = require('./models/user')
      parkingRoutes = require('./routes/guestParking')
      adminRoutes = require('./routes/admin')



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + '/views'));

// var transport = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "fd37c262ae64e2",
//     pass: "bbea8f27d9f3fd"
//   }
// });

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Admin page",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();

});

app.use('/', parkingRoutes);
app.use('/', adminRoutes);

//home route
app.get("/", function(req, res){ 
    res.render("home", {currentUser: req.user});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Parking App is running on port ${ PORT }`);
});