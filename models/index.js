require('dotenv').config();
var mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(`mongodb+srv://krehberg:${process.env.password}@parking-app.mnuwr.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true});

mongoose.Promise = Promise;

module.exports.Guest = require("./guest");
module.exports.Property = require("./property");
module.exports.User = require("./user");