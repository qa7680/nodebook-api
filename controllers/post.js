const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Image = require('../models/image');

// GET route for single posts
exports.get_post = (req, res, next) => {
    Post.find({ _id: req.params.postId }).exec((err, post) => {
        if(err) return next(err);
        res.json({post});
    });
};

// POST route for a new post
exports.create_post = (req, res, next) => {
    const post = new Post({
        post: req.body.post,
        author: req.body.author,
        time: req.body.time,
        likes: req.body.likes,
    })
    post.save((err) => {
        if(err) return next(err);
        res.json({
            msg: 'post saved',
            post: post
        });
    });
};

// GET route for all posts by a single user
exports.posts_user = (req, res, next) => {
    Post.find({ author: req.params.userId }).sort({ 'time': -1 }).populate('author').exec((err, posts) => {
        if(err) return next(err);
        Post.find({ author: req.params.userId }).select('_id').exec((err, postIds) => {
            if(err) return next(err);
            Comment.find().where('post').populate('author').in(postIds).sort({ 'time': -1 }).exec((err, comments) => {
                if(err) return next(err);
                Image.find().where('post').in(postIds).exec((err, postImages) => {
                    if(err) return next(err);
                    res.json({
                        posts,                    
                        postImages,
                        comments
                    });
                });     
            })                    
        });                
    });
};

// GET route for all timeline posts for a specific user
exports.timeline_posts = (req, res, next) => {
    User.find({ _id: req.params.userId }).select('friends').exec((err, result) => {
        if(err) return next(err);
        const ids = result[0].friends;
        ids.push(req.params.userId);
        Post.find().where('author').in(result[0].friends).sort({ 'time': -1 }).populate('author').exec((err, posts) => {
            if(err) return next(err);
            Post.find().where('author').in(result[0].friends).select('_id').exec((err, postIds) => {
                if(err) return next(err);                
                Comment.find().where('post').in(postIds).sort({'time': -1}).populate('author', 'first_name last_name profile_pic').exec((err, comments) => {
                    if(err) return next(err);
                    Image.find().where('post').in(postIds).exec((err, images) => {
                        if(err) return next(err);
                        res.json({
                            posts,
                            comments,
                            images
                        });
                    })                   
                });
            });            
        });
    });
};

// DELETE route for post deletion
exports.delete_post = (req, res, next) => {
    Post.findByIdAndDelete({ _id: req.params.postId }).exec((err, deletedPost) => {
        if(err) return next(err);
        Comment.deleteMany({ post: req.params.postId }).exec((err, deletedComments) => {
            if(err) return next(err);
            Image.deleteOne({ post: req.params.postId }).exec((err, deletedImage) => {
                if(err) return next(err);
                res.json({
                    deletedPost,
                    deletedComments,
                    deletedImage
                });
            })            
        });
    });
};


// PUT route for editing a post
exports.edit_post = (req, res, next) => {
    Post.find({ _id: req.params.postId }).exec((err, single_post) => {
        if(err) return next(err);
        const post = new Post({
            _id: single_post[0]._id,
            post: req.body.post,
            author: single_post[0].author,
            likes: single_post[0].likes
        })
        Post.findOneAndUpdate({ _id: req.params.postId }, post,(err, updated_post) => {
            if(err) return next(err);
            res.json({
                updated_post
            })
        });
    });
};

// PUT route for incrementing likes and liking a post
exports.like_post = (req, res, next) => {
    Post.findOne({ _id: req.params.postId }).exec((err, post) => {
        if(err) return next(err);
        if(!post.likes.includes(req.body.userId)){
            Post.findOneAndUpdate({ _id: req.params.postId }, { $addToSet: {likes: req.body.userId}, $inc: {likes_length: 1} }
                , (err, likedPost) => {
                if(err) return next(err);
                res.json({
                    likedPost
                });
            })
        }else{
            res.status(409).json({error: 'Like already posted'})
        }
    })
};

// PUT route for decrementing likes (can't have less than 1 like) and unliking a post
exports.unlike_post = (req, res, next) => {
    Post.findOneAndUpdate({ _id: req.params.postId, likes_length: {$gt: 0} }, { $inc: {likes_length: -1},
    $pull: { likes: req.body.userId } }, (err, unlikedPost) => {
        if(err) return next(err);
        res.json({unlikedPost});
    });
};
