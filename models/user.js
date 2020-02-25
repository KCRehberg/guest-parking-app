var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);