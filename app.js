const express = require("express"),
      app = express(),
      bodyParser     = require("body-parser"),
      mongoose = require("mongoose"),
      passport = require("passport"),
      LocalStrategy = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      moment = require("moment"),
      nodemailer = require("nodemailer")

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://127.0.0.1:27017/bit-parking", { useNewUrlParser: true});
// mongoose.connect("mongodb+srv://krehberg:Qwaszx12!@parking-app-mnuwr.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "fd37c262ae64e2",
    pass: "bbea8f27d9f3fd"
  }
});

const guestSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    property: String,
    tag: String,
    make: String,
    model: String,
    time: String,
    unit: String,
    address: String,
    email: String,
    mobile: String,
    permit: String
});

var Guest = mongoose.model("Guest", guestSchema);

const propertySchema = new mongoose.Schema({
    name: String,
    address: String,
    image: String,
    code: String,
    propertyAdmin: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    },
    guests: [guestSchema]
});

var Property = mongoose.model("Property", propertySchema);

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    properties: [propertySchema]
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);

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

// Contact route
app.get("/contact", function(req, res){
    res.render("contact");
});

app.post("/contact", function(req, res){
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

//access route
app.get("/access", function(req, res){
        res.render("access");
});

//Access Search property route
app.post("/access", async function(req, res){
    try {
        let code = req.body.code;
        let property = await Property.findOne({code: code});
        res.redirect("/access/" + property._id);            
    } catch(err){
        console.log(err);
        res.redirect("/access");
    }    
});

// show property registration
app.get("/access/:id", async function(req, res){
    try{
        let foundProperty = await Property.findById(req.params.id);
        if(foundProperty){
            res.render("show", {property: foundProperty});
        }
    } catch(err){
        console.log(err);
        res.redirect("back")
    }   
});

//show property registration options
app.get("/access/:id/register", async function(req, res){
    try{
        let foundProperty = await Property.findById(req.params.id);
        res.render("register", {property: foundProperty});
    } catch(err){
        console.log(err);
    }
});

//create guest route
app.post("/access/:id/register", async function(req, res){
    try {
        let property = await Property.findById(req.params.id);
        let propertyAdmin = await User.findById(property.propertyAdmin.id);
        let guest = await Guest.create(req.body.guest);
        let index = propertyAdmin.properties.findIndex(code => code.id === property.id);
        guest.property = property.name;
        guest.permit = Math.floor(100000 + Math.random() * 900000);
        await guest.save();
        await property.guests.push(guest);
        await property.save();
        await propertyAdmin.properties[index].guests.push(guest);
        await propertyAdmin.save();
        res.redirect("/access/" + req.params.id + "/register/" + guest._id);
    } catch(err){
        console.log(err);
    }
});

//successful registration route
app.get("/access/:id/register/:id", async function(req, res){
        try {
            let guest = await Guest.findById(req.params.id);
            // let user = await User.findById(req.user.id);
            // console.log(user);
            let date = moment().format('dddd - MMMM Do, YYYY');
            let endDate = moment().add(1, 'days').format('dddd - MMMM Do, YYYY');
            let time = moment().format('h:mm a');   
            res.render("success", {guest: guest, date: date, endDate: endDate, time: time});
        } catch(err){
            console.log(err);
        }
});

//ADMIN LOGIN ROUTES
app.get("/admin", isLoggedIn, async function(req, res){
   try {
       let user = await User.findById(req.user.id);
       res.render("admin", {user: user});
   } catch(err){
       console.log(err);
   }
});

app.get("/admin/addproperty", function(req, res){
    res.render("addproperty");
});

app.post("/admin/addproperty", async function(req, res){
    try {
        let user = await User.findById(req.user.id);
        let property = await Property.create(req.body.property);
        property.propertyAdmin = {
            id: req.user._id,
            username: req.user.username
        };
        property.guests = [];
        await property.save();
        await user.properties.push(property);
        await user.save();
        res.redirect("/admin");
    } catch(err){
        console.log(err);
    }
});

app.get("/admin/:id", isLoggedIn, async function(req, res){
    try {
        let property = await Property.findById(req.params.id);
        console.log(property);
        res.render("propertyShow", {property: property});
    } catch(err){
        console.log(err);
    }
});

app.get("/signup", function(req, res){
    res.render("signup");
});

app.post("/signup", async function(req, res){
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

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "login"
    }), function(req, res){   
});

//Logout route
app.get("/logout", function(req, res){
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Parking App is running on port ${ PORT }');
});