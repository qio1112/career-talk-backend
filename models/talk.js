/**
 * mongodb model of talks
 * a talk here refers to a specific time of certain company
 * in a certain career fair which can be scheduled by a student
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const talkSchema = new Schema({
    careerfair: { // which career fair the talk is in
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Careerfair'
    }, 
    company: { // which company the talk belongs to
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    },
    startDate: { // the start time of the talk
        type: Date,
        retuired: true
    },
    endTime: { // the end time of the talk
        type: Date,
        required: true
    },
    scheduledBy: { // who appointed the talk, null if not appointed
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.export = mongoose.model('Talk', talkSchema);