const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Post schema
const PostSchema = new Schema({
    post: { type: String, default: 'empty' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
    likes_length: { type: Number, default: 0 },
    time: { type: Date, default: Date.now },
    image: { data: Buffer, contentType: String }
});

module.exports = mongoose.model('Post', PostSchema);