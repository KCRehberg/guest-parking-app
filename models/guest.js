var mongoose = require('mongoose');

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

module.exports = mongoose.model("Guest", guestSchema);