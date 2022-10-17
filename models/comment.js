const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Comment Schema
const CommentSchema = new Schema({
    comment: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: { type: Number, default: 0 },
    time: { type: Date, default: Date.now},
    image: { data: Buffer, contentType: String }
});

module.exports = mongoose.model('Comment', CommentSchema);