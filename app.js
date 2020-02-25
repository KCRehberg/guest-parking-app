const express = require("express"),
      app = express(),
      bodyParser     = require("body-parser"),
      mongoose = require("mongoose"),
      passport = require("passport"),
      LocalStrategy = require("passport-local"),
      User = require('./models/user'),
      parkingRoutes = require('./routes/guestParking'),
      adminRoutes = require('./routes/admin')


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + '/views'));

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

//home route
app.get("/", function(req, res){ 
    res.render("home", {currentUser: req.user});
});

app.use('/', parkingRoutes);
app.use('/', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Parking App is running on port ${ PORT }`);
});