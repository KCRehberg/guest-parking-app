require('dotenv').config();
var mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(`mongodb+srv://krehberg:${process.env.PASSWORD}@parking-app.6jrz0x9.mongodb.net/?retryWrites=true&w=majority`, { useNewUrlParser: true});

mongoose.Promise = Promise;

module.exports.Guest = require("./guest");
module.exports.Property = require("./property");
module.exports.User = require("./user");