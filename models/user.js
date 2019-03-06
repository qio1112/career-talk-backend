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
        required: () => this.type === 'student'
    },
    lastName: {
        type: String,
        required: () => this.type === 'student'
    },
    phone: {
        type: String,
        required: () => this.type === 'student'
    },
    school: { // school of the user
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: () => this.type === 'student'
    },
    talks: [{ // talks the user has scheduled
        type: Schema.Types.ObjectId,
        ref: 'Talk'
    }],
    type: { // type of the user, student or school
        type: String,
        enum: ['student', 'school'],
        required: true
    },
    resumePath: {
        type: String,
    },
    avatarPath: {
        type: String,
        required: true,
        default: 'storage/avatars/default_xiaohei.png'
    },
    major: {
        type: String,
        required: () => this.type === 'student'
    }
});

// make sure the usernames saved are unique
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);