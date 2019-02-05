/**
 * mongoose model of career fairs
 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const careerfairSchema = new Schema({
    name: { // name of the career fair
        type: String,
        required: true,
        unique: true
    },
    school: { // school which the career fair is held
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'School'
    },
    address: { // location where the career fair is held
        type: String,
        required: true
    },
    description: {
        type: String
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    talks: [{ // all talks available in the career fair
        talk: {
            type: Schema.Types.ObjectId,
            ref: 'Talk'
        }
    }],
    companies: [{
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company'
        }
    }]
});

careerfairSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Careerfair', careerfairSchema);