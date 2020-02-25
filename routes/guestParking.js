var express = require('express');
var router = express.Router();
var db = require('../models')
var moment = require("moment-timezone")

// Contact route
router.get("/contact", function(req, res){
    res.render("contact");
});

router.post("/contact", function(req, res){
    let email = req.body.email;
    let subject = req.body.subject;
    let message = req.body.message;
    let contact = {
        from: email,
        to: "guestparkingnet@gmail.com",
        subject: subject,
        text: message
    }
    transport.sendMail(contact, (error, info) => {
        if(error){
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        res.redirect("/");
    });
});

//parking route
router.get("/parking", function(req, res){
        res.render("parking");
});

//Access Search property route
router.post("/parking", async function(req, res){
    try {
        let code = req.body.code;
        let property = await db.Property.findOne({code: code});
        res.redirect("/parking/" + property._id);            
    } catch(err){
        console.log(err);
        res.redirect("/parking");
    }    
});

// show property registration
router.get("/parking/:id", async function(req, res){
    try{
        let foundProperty = await db.Property.findById(req.params.id);
        if(foundProperty){
            res.render("show", {property: foundProperty});
        }
    } catch(err){
        console.log(err);
        res.redirect("back")
    }   
});

//show property registration options
router.get("/parking/:id/register", async function(req, res){
    try{
        let foundProperty = await db.Property.findById(req.params.id);
        res.render("register", {property: foundProperty});
    } catch(err){
        console.log(err);
    }
});

//create guest route
router.post("/parking/:id/register", async function(req, res){
    try {
        let property = await db.Property.findById(req.params.id);
        let guest = await db.Guest.create(req.body.guest);
        guest.property = property.name;
        guest.permit = Math.floor(100000 + Math.random() * 900000);
        await guest.save();
        await property.guests.push(guest);
        await property.save();
        console.log(property);
        res.redirect("/parking/" + req.params.id + "/register/" + guest._id);
    } catch(err){
        console.log(err);
    }
});

//successful registration route
router.get("/parking/:id/register/:id", async function(req, res){
        try {
            let guest = await db.Guest.findById(req.params.id);
            // let user = await User.findById(req.user.id);
            // console.log(user);
            guest.startDate = moment.tz('America/New_York').format('dddd - MMMM Do, YYYY');
            guest.endDate = moment.tz('America/New_York').add(1, 'days').format('dddd - MMMM Do, YYYY');
            guest.startTime = moment.tz('America/New_York').format('h:mm a');
            await guest.save();   
            res.render("success", {guest: guest});
        } catch(err){
            console.log(err);
        }
});

module.exports = router;