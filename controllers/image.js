const Image = require('../models/image');
const User = require('../models/user');
const fs = require('fs');

exports.add_post_image = (req, res, next) => {
    const image = new Image({
        image: {
            data: fs.readFileSync('uploads/' + req.file.filename),
            contentType: 'image/png'
        },
        post: req.body.postId,
        author: req.params.userId
    })
    image.save((err) => {
        if(err) return next(err);
        res.json({ msg: 'Image saved', post: image.post })
    });
};

exports.add_comment_image = (req, res, next) => {
    const image = new Image({
        image: {
            data: fs.readFileSync('uploads/' + req.file.filename),
            contentType: 'image/png/'
        },
        comment: req.body.commentId
    })
    image.save((err) => {
        if(err) return next(err);
        res.json({ msg: 'Image saved', comment: image.comment })
    });
};

exports.user_images = (req, res, next) => {
    Image.find({ author: req.params.userId }).exec((err, images) => {
        if (err) return next(err);
        res.json({
            images
        });
    });
};