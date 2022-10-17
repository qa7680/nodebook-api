const User = require('../models/user');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const async = require('async');
const Post = require('../models/post');
const Comment = require('../models/comment');
const fs = require('fs');

require('dotenv').config();
require('passport');

exports.home = (req, res) => {
    res.json({hello:'hello'})
};

// POST request for new user sign up with image
exports.sign_up = [
    body('email').trim().isEmail().withMessage('Please enter valid email'),
    body('password').trim().isLength({min: '6'}).escape().withMessage('Password must be at least 6 characters'),
    body('confirm_password').trim().isLength({min: '6'}).escape().withMessage('Password must be at least 6 characters')
        .custom((confirmPassword, {req}) => {
            if(confirmPassword !== req.body.password) throw new Error('Passwords must be the same');
            return true;
        }),    
    (req, res, next) => {
        // check for errors        
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log('Error');
            return res.json(errors);
        }        
        else{
        // check if user email already exists.
        User.findOne({ email: req.body.email }).exec((err, found_email) => {
            if(err) return next(err);
            if(found_email){
                res.status(409).json({ emailError: 'Email already exists. Please use another email.' })
            }else{
                bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {                
                    if(err) console.log(err);                                       
                            const user = new User({
                                email: req.body.email,
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                password: hashedPassword,
                                dob: req.body.dob,
                                profile_pic: {
                                    data: fs.readFileSync('uploads/' + req.file.filename),
                                    contentType: 'image/png'
                                }
                            })
                            user.save((err) => {                                
                                if(err) return next(err);
                                res.json({
                                    message: 'user saved',
                                    user: user
                                });
                            });  
                        }                                                            
            )};
        });
    };
}
];

// POST request for new user sign up without image
exports.sign_up_no_image = [
    body('email').trim().isEmail().withMessage('Please enter valid email'),
    body('password').trim().isLength({min: '6'}).escape().withMessage('Password must be at least 6 characters'),
    body('confirm_password').trim().isLength({min: '6'}).escape().withMessage('Password must be at least 6 characters')
        .custom((confirmPassword, {req}) => {
            if(confirmPassword !== req.body.password) throw new Error('Passwords must be the same');
            return true;
        }),    
    (req, res, next) => {
        // check for errors        
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log('Error');
            return res.json(errors);
        }        
        else{
        // check if user email already exists.
        User.findOne({ email: req.body.email }).exec((err, found_email) => {
            if(err) return next(err);
            if(found_email){
                res.status(409).json({ emailError: 'Email already exists. Please use another email.' })
            }else{
                bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {                
                    if(err) console.log(err);                                       
                            const user = new User({
                                email: req.body.email,
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                password: hashedPassword,
                                dob: req.body.dob,                                
                            });
                            user.save((err) => {                                
                                if(err) return next(err);
                                res.json({
                                    message: 'user saved',
                                    user: user
                                });
                            });  
                        }                                                            
            )};
        });
    };
}
];

// POST request for user login
exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false, failureFlash: true },
    (err, user, option) => {
        if(err || !user) {
            res.status(400).json({
                message: 'Authorization Denied',
                user: user,
                error: option,
                status: 400
            });
        };
        if(err) res.send(err);
        // return res.status(200).send({
        //     user: user
        // });
        jwt.sign({ _id: user.id, email: user.email }, process.env.JWT_KEY, { expiresIn: '30m' }, (err, token) => {
            if(err) return res.status(400).json(err);
            const [,payload,] = token.split('.');
            const expiryInfo = JSON.parse(Buffer.from(payload, 'base64'));
            res.json({ token: token, user: { _id: user._id, email: user.email }, iat:expiryInfo.iat, exp: expiryInfo.exp });
        })
        
    })(req, res)
};

// GET route for single user info
exports.get_user = (req, res, next) => {
    User.findOne({ _id: req.params.userId }).exec((err, user) => {
        if(err) return next(err);
        res.json({
            user: user
        });
    });
};

// POST request for sending a friend request
exports.send_request = (req, res, next) => {
    User.findOneAndUpdate({ _id: req.body.recipient }, { $addToSet: {
        requests: req.params.userId
    }}, (err, results) => {
        if(err) return next(err);
        res.json({
            results
        });
    });
};

// PUT request for accepting a friend request
exports.accept_request = (req, res, next) => {
    User.bulkWrite([
        {
            updateOne: {
                "filter": { _id: req.params.userId },
                "update": { "$addToSet": { "friends": req.body.requester } }
            }
        },
        {
            updateOne: {
                "filter": { _id: req.params.userId },
                "update": { "$pull": { "requests": req.body.requester } }
            }
        },
        {
            updateOne: {
                "filter": { _id: req.body.requester },
                "update": { "$addToSet": { "friends": req.params.userId } }
            }
        }
    ], (err, results) => {
        if(err) return next(err);
        res.json({
            results
        });
    });
};

// PUT request for declining a friend request
exports.decline_request = (req, res, next) => {
    User.updateOne({ _id: req.params.userId }, { $pull: {
        requests: req.body.requester
    }}, (err, results) => {
        if(err) return next(err);
        res.json({
            results
        });
    });
};


// GET request for a users friends and pending requests sent
exports.friend_status = (req, res, next) => {
    // search for user id in other users friends array
    User.findById({ _id: req.params.userId }).select('friends').populate('friends').exec((err, friendsList) => {
        if(err) return next(err);
        User.findOne({ _id: req.params.userId }).select('requests').populate('requests').exec((err, received) => {
            if(err) return next(err);
            User.find({ requests: req.params.userId }).exec((err, sent) => {
                if (err) return next(err);
                res.json({
                    friendsList: friendsList.friends,
                    sent,
                    received: received.requests
                });
            })        
        });
    });
};


// PUT request for cancelling a friend request sent
exports.cancel_request = (req, res, next) => {
    User.updateOne({ _id: req.body.recipient }, { $pull: {
        requests: req.params.userId
    }}, (err, results) => {
        if(err) return next(err);
        res.json({
            results
        });
    });
};

// POST request for blocking a user
exports.block_user = (req, res, next) => {
    User.bulkWrite([
        {
            updateOne: {
                "filter": {_id: req.params.userId},
                "update": { "$pull": { "friends": req.body.blockedUser } }
            }
        },
        {
            updateOne: {
                "filter": {_id: req.body.blockedUser},
                "update": { "$pull": { "friends": req.params.userId } }
            }
        },
        {
            updateOne: {
                "filter": { _id: req.params.userId },
                "update": { "$addToSet": { "blocked_users": req.body.blockedUser } }
            }
        }
    ], (err, results) => {
        if(err) return next(err);
        res.json({
            results
        });
    });
};

// DELETE route for account deletion
// delete user, find all posts made by user, delete all comments associated with said posts,
// delete all posts and comments made user, delete user from any friends or requests array
exports.delete_account = (req, res, next) => {
    User.findByIdAndDelete({ _id: req.params.userId }).exec((err, user_deleted) => {
        if(err) return next(err);
        Post.find({ author: req.params.userId }).select('_id').exec((err, user_posts) => {
            if(err) return next(err);
                Post.deleteMany({ author: req.params.userId }).exec((err, posts_deleted) => {
                    if(err) return next(err);
                    Comment.deleteMany({ author: req.params.userId }).exec((err, user_comments) => {
                        if(err) return next(err);
                        User.bulkWrite([
                            {
                                updateOne: {
                                    "filter": {friends: req.params.userId},
                                    "update": { "$pull": { "friends": req.params.userId } }
                                }
                            },
                            {
                                updateOne: {
                                    "filter": {requests: req.params.userId},
                                    "update": { "$pull": { "requests": req.params.userId } }
                                }
                            },
                            {
                                updateOne: {
                                    "filter": {requests: req.params.userId},
                                    "update": { "$pull": { "blocked_users": req.params.userId } }
                                }
                            }
                        ])
                        if(user_posts.length > 0) {
                        Comment.deleteMany().where('post').in(user_posts[0]._id).exec((err, deleted_comments) => {
                        if(err) return next(err);
                        res.json({
                            user_deleted,
                            user_posts,
                            deleted_comments,
                            posts_deleted,
                            user_comments 
                        })
                        })}else{
                        res.json({
                            user_deleted,
                            user_posts,
                            posts_deleted,
                            user_comments
                    })};
                });
            });
        });
    });
};

// GET request for user discover page (returns every user in database except for the user)
exports.user_discover = (req, res, next) => {
    User.findById({ _id: req.params.userId }).select('friends requests').exec((err, friends) => {
        if(err) return next(err);
        User.find({ "requests": { "$in": req.params.userId } }).exec((err, requests_sent) => {
            if(err) return next(err);            
            User.find({ "_id": { "$ne": req.params.userId, "$nin": friends.friends.concat(friends.requests)}}).exec((err, users) => {            
                if(err) return next(err);                    
                    res.json({ users,  requests_received: friends.requests, requests_sent, friends: friends.friends});
            })                              
        });  
    })
};

// PUT request for unfriending user
exports.unfriend_user = (req, res, next) => {
    User.bulkWrite([
        {
            updateOne: {
                "filter": { _id: req.params.userId },
                "update": { "$pull": { "friends": req.body.requester } }
            }
        },        
        {
            updateOne: {
                "filter": { _id: req.body.requester },
                "update": { "$pull": { "friends": req.params.userId } }
            }
        }
    ], (err, results) => {
        if(err) return next(err);
        res.json({
            results
        });
    });
}

// change profile picture
exports.change_user_profile_picture = (req, res, next) => {
    User.updateOne({_id: req.params.userId}, {
        profile_pic:{
            data: fs.readFileSync('uploads/' + req.file.filename),
            contentType: 'image/png'
        },
    },
    function (err, result) {
        if(err) return next(err);
        res.json({ result })
    }
    );
};