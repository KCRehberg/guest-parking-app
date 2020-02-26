var mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    property: String,
    tag: String,
    make: String,
    model: String,
    time: Date,
    unit: String,
    address: String,
    email: String,
    mobile: String,
    permit: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    active: Boolean
});

module.exports = mongoose.model("Guest", guestSchema);