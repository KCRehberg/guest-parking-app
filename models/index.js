var mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://127.0.0.1:27017/bit-parking", { useNewUrlParser: true});

mongoose.Promise = Promise;

module.exports.Guest = require("./guest");
module.exports.Property = require("./property");
module.exports.User = require("./user");