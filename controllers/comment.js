const  Comment = require('../models/comment')

// POST route for adding a comment to a post
exports.add_comment = (req, res, next) => {
    const comment = new Comment({
        comment: req.body.comment,
        post: req.params.postId,
        author: req.body.author
    })
    comment.save((err) => {
        if(err) return next(err);
        res.json({
            msg: 'Comment saved',
            comment
        });
    });
};

// GET route for all comments of a specific post
exports.post_comments = (req, res, next) => {
    Comment.find({ post: req.params.postId }).exec((err, allComments) => {
        if(err) return next(err);
        res.json({
            length: allComments.length,
            allComments
        });
    });
};

// DELETE route for a single comment
exports.delete_comment = (req, res, next) => {
    Comment.findByIdAndDelete({ _id: req.params.commentId }).exec((err, deletedComment) => {
                if(err) return next(err);
                res.json({
                    deletedComment,
        });
    });    
}

// PUT request for editing a comment
exports.edit_comment = (req, res, next) => {
    const commentUpdated = new Comment({
        comment:req.body.comment,
        post: req.params.postId,
        author:req.body.editor,
        _id: req.params.commentId
    })
    Comment.find({ _id: req.params.commentId }).exec((err, comment) => {
        if(err) return next(err);
        if(comment[0].author == req.body.editor) {
            Comment.findByIdAndUpdate({ _id: req.params.commentId }, commentUpdated, (err, commentUpdated) => {
                if(err) return next(err);
                res.json({
                    updated_comment: commentUpdated
                });
            });
        }else{
            res.sendStatus(401)
        };
    });
};

// PUT route for incrementing likes
exports.like_comment = (req, res, next) => {
    Comment.updateOne({ _id: req.params.commentId }, { $inc: {likes:1} }, (err, likedComment) => {
        if(err) return(err)
        res.json({likedComment});
    });
};

// PUT route for decrementing likes (can't have less than 1 like)
exports.unlike_comment = (req, res, next) => {
    Comment.findOneAndUpdate({ _id: req.params.commentId, likes: {$gt: 0} }, { $inc: {likes: -1} }, (err, likedComment) => {
        if(err) return next(err);
        res.json({likedComment})
    });
};