/**
 * mongodb model of schools
 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const schoolSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    careerfairs: [{
        type: Schema.Types.ObjectId,
        ref: 'Careerfair'
    }]
});

schoolSchema.plugin(uniqueValidator);

module.exports = mongoose.model('School', schoolSchema);