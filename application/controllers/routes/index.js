/* 
Created by Joseph Edradan
Github: https://github.com/josephedradan

Date created: 

Purpose:
  Handle basic pages

Details:

Description:

Notes:

IMPORTANT NOTES:

Explanation:

Reference:

*/
const express = require('express');
const router = express.Router();

// Database connecter
// const databaseConnector = require('../config/database_connecter');

// Database Handler
const databaseHandler = require('../database/database_handler')

// Debug printer
const debugPrinter = require('../helpers/debug/debug_printer');

// middlewareRouteProtectors
const middlewareRouteProtectors = require('../middleware/middleware_route_protectors');

// middlewareGetRecentPosts
const middlewareGetRecentPosts = require('../middleware/middleware_get_recent_posts');

// Asynchronous Function Middleware Handler
const middlewareAsyncFunctionHandler = require("../middleware/middleware_async_function_handler");

/* GET home page. */
router.get("/", middlewareAsyncFunctionHandler(middlewareGetRecentPosts.getRecentPosts), getPageHome)
router.get("/home", middlewareAsyncFunctionHandler(middlewareGetRecentPosts.getRecentPosts), getPageHome);

// GET Login page 
router.get("/login", middlewareAsyncFunctionHandler(getPageLogin));

async function getPageLogin(req, res, next) {
    // debugPrinter.routerPrint("/login");

    // TODO Throw an error...
    // next(new Error('test'));

    res.render(
        "login",
        {
            title: "Login"
        });

};

router.get("/registration", getPageRegistration);

function getPageRegistration(req, res, next) {
    // debugPrinter.routerPrint("/registration");

    res.render(
        "registration",
        {
            title: "Registration",
            js_files:
                [
                    "/js/registration.js"
                ]
        });
};


// Route for image-post
// router.get("/image-post", getPageImagePost);

// function getPageImagePost(req, res, next) {
//     res.render(
//         "image-post",
//         {
//             title: "Image post"
//         });
// };


// Route Protection (Prevents user from accessing a page, specifically post-image)
router.use("/post-image", middlewareAsyncFunctionHandler(middlewareRouteProtectors.checkIfLoggedIn));

router.get("/post-image", getPagePostImage);

function getPagePostImage(req, res, next) {
    res.render(
        "post-image",
        {
            title: "Post Image",
            js_files:
                [
                    "https://unpkg.com/axios/dist/axios.min.js",
                    "/js/post_image.js",
                ]
        });
};

function getPageHome(req, res, next) {
    res.render(
        "home",
        {
            // Order of js files matter
            title: "Home",
            js_files:
                [
                    "https://unpkg.com/axios/dist/axios.min.js",
                    // "/js/home_OLD.js",
                ]
        });
}

router.get("/post/:post_id(\\d+)", getPagePost);

async function getPagePost(req, res, next) {
    /*  
    Handles post pages

    Notes:
        :id(\\d+)   Means that the id must be a number

    Reference:
        CSC 317 Term Project Show an Individual Post
            https://www.youtube.com/watch?v=GC07FdbVozc&feature=youtu.be
                Notes:
                    Using :id will prevent any following URL such as /posts/help, it will treat the id as help instead,
                    but i guess that happens if the order is wrong.
                    Also there is regex in :id(\\d+)
    */

    // Get post ID from url
    let post_id = req.params.post_id;
    
    // Get Post from post_id
    let [resultsSQLPostID, fields] = await databaseHandler.getPostFromPostID(post_id);

    // Post object
    let postObject = resultsSQLPostID[0];
        
    if (resultsSQLPostID && resultsSQLPostID.length) {

        // Get Post from post_id
        let [rowsResultPostIDComments, fields2] = await databaseHandler.getCommentsFromPostID(post_id);

        res.render(
            "post",
            {
                title: postObject["posts_title"],
                postCurrent: postObject,
                // comment: yeet.convert(rowsResultPostIDComments),
                // unique: "Post",
            });
        req.session.viewing = req.params.id;
    } else {
        // req.flash("error", "This is not the post you are looking for!");
        res.redirect("/");
    }
};

module.exports = router;