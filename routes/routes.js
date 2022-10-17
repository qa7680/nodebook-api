const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// controllers
const userController = require('../controllers/user');
const postController = require('../controllers/post');
const commentController = require('../controllers/comment');
const imageController = require('../controllers/image');

// default home route
router.get('/', userController.home);

// user routes
router.post('/signup', upload.single('image'),userController.sign_up);
router.post('/signup/noimage', userController.sign_up_no_image);
router.get('/login', (req,res) => {res.send('login to nodebook!')})
router.post('/login', userController.login);
router.get('/users/:userId', userController.get_user);
router.post('/users/:userId/request', userController.send_request);
router.put('/users/:userId/accept', userController.accept_request);
router.put('/users/:userId/decline', userController.decline_request);
router.get('/users/:userId/friends', userController.friend_status);
router.put('/users/:userId/cancel', userController.cancel_request);
router.post('/users/:userId/block', userController.block_user);
router.delete('/users/:userId/', userController.delete_account);
router.get('/users/:userId/discover', userController.user_discover);
router.put('/users/:userId/unfriend', userController.unfriend_user);
router.put('/users/:userId/change_profile_picture', upload.single('image'),userController.change_user_profile_picture);

// post routes
router.get('/posts/:postId', postController.get_post);
router.post('/posts', postController.create_post);
router.get('/posts/profile/:userId', postController.posts_user);
router.get('/users/:userId/timeline', postController.timeline_posts);
router.delete('/posts/:postId', postController.delete_post);
router.put('/posts/:postId', postController.edit_post);
router.put('/posts/:postId/like', postController.like_post);
router.put('/posts/:postId/unlike', postController.unlike_post);

// comment routes
router.post('/posts/:postId/comments', commentController.add_comment);
router.get('/posts/:postId/comments', commentController.post_comments);
router.delete('/comments/:commentId', commentController.delete_comment);
router.put('/posts/:postId/comments/:commentId', commentController.edit_comment);
router.put('/posts/:postId/comments/:commentId/like', commentController.like_comment);
router.put('/posts/:postId/comments/:commentId/unlike', commentController.unlike_comment);

// image routes
router.post('/users/:userId/image/post', upload.single('image'),imageController.add_post_image);
router.post('/image/comment', upload.single('image'),imageController.add_comment_image);
router.get('/users/:userId/images', imageController.user_images);


module.exports = router;