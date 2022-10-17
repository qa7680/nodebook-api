const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email : { type: String, required: true },
    first_name: { type:String,  required: true},
    last_name: { type:String,  required: true},
    password: { type: String, required: true },
    profile_pic: { data: Buffer, contentType: String } , 
    dob: { type: Date },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blocked_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', UserSchema);