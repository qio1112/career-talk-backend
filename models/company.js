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
        required: true,
        default: 'This is a new company in Career Talk.'
    },
    // the image of the company 
    // imageUrl: {
    //     type: String,
    //     required: true
    // }
    careerfairs: [{ // all career fairs the company joined
        type: Schema.Types.ObjectId,
        ref: 'Careerfair'
    }]
});

companySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Company', companySchema);