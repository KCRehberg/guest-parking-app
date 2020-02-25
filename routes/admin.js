const express = require('express'),
      router = express.Router(),
      db = require('../models'),
      passport = require("passport"),
      moment = require('moment-timezone')

//ADMIN LOGIN ROUTES
router.get("/admin", isLoggedIn, async function(req, res){
    try {
        let user = await db.User.findById(req.user.id);
        let properties = await db.Property.find(user.properties.id)
        res.render("admin", {properties: properties});
    } catch(err){
        console.log(err);
    }
 });
 
 router.get("/admin/addproperty", isLoggedIn, function(req, res){
     res.render("addproperty");
 });
 
 router.post("/admin/addproperty", isLoggedIn, async function(req, res){
     try {
         let user = await db.User.findById(req.user.id);
         let property = await db.Property.create(req.body.property);
         await user.properties.push(property);
         await user.save();
         res.redirect("/admin");
     } catch(err){
         console.log(err);
     }
 });
 
 router.get("/admin/:id", isLoggedIn, async function(req, res){
     try {
        let property = await db.Property.findById(req.params.id);
        let guest = await db.Guest.find({_id: property.guests});
        await guest.forEach(function(guest){
            if(moment().tz('America/New_York').isAfter(guest.time)){
                guest.active = false;
                guest.save();
        }
        });
        res.render("propertyShow", {guests: guest, property: property});
     } catch(err){
         console.log(err);
     }
 });
 
 router.get("/signup", function(req, res){
     res.render("signup");
 });
 
 router.post("/signup", async function(req, res){
     try {
         let newUser = new User({username: req.body.username});
         await User.register(newUser, req.body.password);
         passport.authenticate("local")(req, res, function(){
             res.redirect("/");
         });
     } catch(err){
         console.log(err);
         return res.render("signup");
     }
 });
 
 router.get("/login", function(req, res){
     res.render("login");
 });
 
 router.post("/login", passport.authenticate("local", 
     {
         successRedirect: "/",
         failureRedirect: "login"
     }), function(req, res){   
 });
 
 //Logout route
 router.get("/logout", function(req, res){
     req.logout();
     res.redirect("/");
 });
 
 //middleware
 function isLoggedIn(req, res, next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login");
 }

 module.exports = router;