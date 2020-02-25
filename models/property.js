var mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: String,
    address: String,
    image: String,
    code: String,
    guests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guest"
        }
    ]
});

module.exports = mongoose.model("Property", propertySchema);