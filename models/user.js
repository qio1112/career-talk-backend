/**
 * the mongodb model of User
 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

// model
const userSchema = new Schema({
    email: { // email, used as the account 
        type: String,
        required: true,
        unique: true
    }, 
    password: { // edcoded password
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    school: { // school of the user
        type: Schema.Types.ObjectId,
        ref: 'School'
    },
    talks: [{ // talks the user has scheduled
        type: Schema.Types.ObjectId,
        ref: 'Talk'
    }],
    type: { // type of the user, student or school
        type: String,
        enum: ['student', 'school'],
        required: true
    }
});

// make sure the usernames saved are unique
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);