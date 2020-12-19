/* 
Created by Joseph Edradan
Github: https://github.com/josephedradan

Date created: 12/9/2020

Purpose:
    Handle DB Calls for printing i guess

Details:

Description:

Notes:
    cb
        CallBack
IMPORTANT NOTES:

Explanation:

Reference:

*/
const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const multer = require('multer');
const crypto = require('crypto');

// Data base connecter
const databaseConnector = require('../config/database_connecter');

// Custom user error class
const PostError = require('../helpers/error/post_error');

// Debugging printer
const debugPrinter = require('../helpers/debug/debug_printer');

// Asynchronous Function Middleware Handler
const middlewareAsyncFunctionHandler = require("../middleware/middleware_async_function_handler");


// Rename and Upload image to storage
const multerStorage = multer.diskStorage({

    // Add an new key called destination
    destination: (req, file, cb) => {
        
        // Image upload location
        let pathImageFileUploadLocation =  "public/images/uploads"

        cb(null, pathImageFileUploadLocation)
    },

    // Add a new key called filename
    filename: (req, file, cb) => {

        // Get file ext
        let fileExt = file.mimetype.split("/")[1];

        // Generate file name 
        let randomName = crypto.randomBytes(22).toString("hex");
        cb(null, `${randomName}.${fileExt}`);
    }
})

const uploader = multer({ storage: multerStorage });

router.post('/createPost', uploader.single("post_file"), middlewareAsyncFunctionHandler(createPost));

async function createPost(req, res, next) {
    debugPrinter.debugPrint(req.file);

    // SQl Query to insert image information
    let sqlQueryInsert = `
    INSERT INTO posts (posts_title, posts_description, posts_path_file, posts_path_thumbnail, posts_created, posts_fk_users_id) 
    VALUES (?, ?, ?, ?, now(), ?);
    `;

    // Get the file path
    let postPathFileTemp = req.file.path;

    // Replace \ with /
    postPathFileTemp = postPathFileTemp.replace(/\\/g, "/");

    /* 
    Path for file to be 

    Notes: 
        Must replace "public" with ".."

    */
    let postPathFileUser = postPathFileTemp.replace("public/", "");
    
    // Acutal file path on server
    let postPathFile = postPathFileTemp;

    // Get the filename for the thumbnail
    let postThumbnailName = `thumbnail-${req.file.filename}`

    
    // Get the path of the thumbnail
    let postPathThumbnailTemp = req.file.destination;

    /* 
    File path for image based on the uploads folder being inside images

    Notes: 
        Must replace "public" with ".."
    */
    let postPathThumbnailUser = postPathThumbnailTemp.replace("public/", "") + "/" + postThumbnailName;

    // Acutal file path on server
    let postPathThumbnail = postPathThumbnailTemp + "/" + postThumbnailName;

    // Get the post title
    let postTitle = req.body["post_title"];

    // Get the description of the post
    let postDescription = req.body["post_description"];

    // Get the user ID based on the current session
    let fk_user_id = req.session.session_user_id;

    // TODO: SERVER VALIDATION EXPRESS-VALIDATION
    // TODO: VALIDATE  [postTitle, postDescription, postPathFile, postPathThumbnail, fk_user_id]

    // Make a thumbnail of postPathFile (Needs to be sequential)
    await sharp(postPathFile).resize(200).toFile(postPathThumbnail);

    // debugPrinter.successPrint(postPathThumbnail);
    // debugPrinter.successPrint(postPathFile);
    // debugPrinter.successPrint([postTitle, postDescription, postPathFile, postPathThumbnail, fk_user_id]);
    debugPrinter.successPrint(postPathFileUser);
    debugPrinter.successPrint(postPathThumbnailUser);

    // Make database Insert Query (Needs to be sequential)
    const [rowsResultInsertPost, fields] = await databaseConnector.execute(
        sqlQueryInsert,
        [postTitle, postDescription, postPathFileUser, postPathThumbnailUser, fk_user_id]
    )

    // debugPrinter.debugPrint(rowsResultInsertPost);

    // Check if Insert query was successful in being uploaded to the database
    if (rowsResultInsertPost && rowsResultInsertPost.affectedRows) {
        debugPrinter.successPrint(`Image uploaded by ${req.session.session_username} was successful!`);
    } else {

        // The below should be handled by middlewareAsyncFunctionHandler buy 
        // res.json({status:"OK", message:"Post was not Successful!", redirect: res.redirect.redirect_last})

        throw new PostError(400, 'User Post request (Post image) was not Successful!', '/postImage');
    };

    // Set last redirect URL (This is form the normal way of handling Post requests with standard form html)
    res.locals.redirect_last = "/";
    
    // Stuff to return to the user who did a post request (Basically, if the post was handled by frontend JS)
    res.json({status:200, message:"User Post request (Post image) was Successful!", "redirect": res.redirect.redirect_last})

    // Call next middleware (Will probably call saveSessionThenRedirect();)
    next();
};

module.exports = router;
