/**
 * the mongodb model of companies
 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const companySchema = new Schema({
    name: { // name of the company
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String
    },
    website: {
        type: String
    },
    description: { 
        type: String,
        default: 'This is a new company in Career Talk.'
    },
    careerfairs: [{ // all career fairs the company joined
        type: Schema.Types.ObjectId,
        ref: 'Careerfair'
    }],
    // for filter
    majors: {
        type: [String]
    }, 
    sponsor: {
        type: Boolean,
        default: true
    },
    fulltime: {
        type: Boolean,
        default: true
    },
    intern: {
        type: Boolean,
        default: true
    },
    freshman: {
        type: Boolean,
        default: true
    },
    juniorOrSenior: {
        type: Boolean,
        default: true
    },
    graduate: {
        type: Boolean,
        default: true
    },
    doctoral: {
        type: Boolean,
        default: true
    }
});

companySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Company', companySchema);