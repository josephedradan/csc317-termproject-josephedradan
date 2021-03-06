/* 
Created by Joseph Edradan
Github: https://github.com/josephedradan

Date created: 12/9/2020

Purpose:

Details:

Description:

Notes:
    res.locals 
        lasts whiles it's being generated and sent back.
        It's the thing that you can use to communicate between different middlewares and to the user BEFORE the page finishes loading.
        This means that you can't carry over unless you use flash, but that's buggy
    
    app.locals
        last entirety of program

    res.send(data)
        send content back to use
    
    res.end()
        no type header
    
    res.sendFile("./path" err => function)
        send back file
    
    res.json(jsonData)
        send back json
    
    res.redirect(http code, ./path )
        redirect
    
    res.format(...)
        return different types of content

    res.links(data)
        add link tags for other urls, send it in the header not the html
    
    res.render("view", locals, callback )
        uses template and uses view engine and the folder for the views
    
    res.set(data)
        set header
    
    res.append(data)
        add additional headers

    res.cookie(data ...)
        send cookie
    
    res.status(status).end()
        sending status

    res.type()
        send back response type

    res.attachment(file)
        sets content disposition header, file that the user will see
    
    res.endFile(file, callback)
        send file?

    res.download(path,name, callback)
        ask user to download file

IMPORTANT NOTES:
    *** DO NOT USE express-flash it will prevent express-sessions from removing sessions_id from the database

Explanation:

Reference:
    Express JS - Sending Headers, Content, Attachments and Statuses
        https://www.youtube.com/watch?v=w02YRfpYnS0
            Notes:
                Explanation of Express stuff

    Express JS - Settings, Variables & Locals
        https://www.youtube.com/watch?v=G6pmkVI2EKM
            Notes:
                Explanation of Express stuff

    Flash Express
        https://www.npmjs.com/package/flash-express
            Notes:
                "notifications that can work with any template engine"
    
    Better Error Handling In NodeJS With Error Classes
        https://www.smashingmagazine.com/2020/08/error-handling-nodejs-error-classes/


        
*/
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const loggerMorgan = require("morgan");
const expressHandlebars = require("express-handlebars");
const expressSessions = require("express-session");
const MySQLSession = require("express-mysql-session")(expressSessions);
// const expressFlash = require('express-flash'); // Buggy with express-sessions

// Routers
const routerIndex = require("./controllers/routes/index"); //
const routerUsers = require("./controllers/routes/users");
const routerPosts = require("./controllers/routes/posts");
const routerComments = require("./controllers/routes/comments");

const routerDatabaseTest = require("./controllers/routes/test_database"); // Db testing TODO: FIXME

// Debug printer
const debugPrinter = require("./controllers/helpers/debug/debug_printer");

const handlebarHelpers = require("./controllers/helpers/handlebars_helpers/handlebars_helper");

const mySQLPrinter = require("./controllers/helpers/debug/my_sql_printer");

// Asynchronous Function Middleware Handler
const asyncFunctionHandler = require("./controllers/decorators/async_function_handler");

// Express object
const app = express();

// const SESSION_MAX_TIME = 1000 * 60 * 60 * 2

/* 
app.get()
app.post()
app.put()
app.delete()
*/

/* 
Set engine and set static folder for handlebars directory

*/
app.engine(
    "hbs",
    expressHandlebars({
        // Dir for layout
        layoutsDir: path.join(__dirname, "views/layouts"),

        // Default layout hbs based on layoutsDir
        defaultLayout: "base",

        // Dir for layouts/partials
        partialsDir: path.join(__dirname, "views/layouts/partials"),

        // Extension for handlebars
        extname: ".hbs",

        // Helper functions for you
        helpers: {
            expressHelperObjectEmpty: handlebarHelpers.emptyObject
        },
    })
);

const mySQLSessionStore = new MySQLSession(
    {
        /* Using default options */
    },
    require("./config/database_connecter")
);

/* 
*** Unmounted middleware ***

Reference:
    Express JS - Settings, Variables & Locals
        https://www.youtube.com/watch?v=G6pmkVI2EKM

*/
/* 
Express-sessions

Reference:
    https://www.youtube.com/watch?v=OH6Z0dJ_Huk
*/
app.use(
    expressSessions({
        // Key used in the from end
        key: "csid",

        // Sign the cookie
        secret: "session_cookie_secret",

        // Cookie to die because Flash won't let the session die
        // cookie: {
        //     maxAge  : new Date(Date.now() + 3600000), //1 Hour
        //     expires : new Date(Date.now() + 3600000), //1 Hour
        // },

        // Select a session store
        store: mySQLSessionStore,

        // Don't save when nothing is changed
        resave: false,

        // Don't save an empty value in this session
        saveUninitialized: false,

        // cookie: {
        //     sameSite: true,
        //     secure: true,
        // }
    })
);
app.set("view engine", "hbs"); // app.locals.settings["view engine"]
app.use(loggerMorgan("dev"));
app.use(express.json()); // Parse response
app.use(express.urlencoded({ extended: false })); // Parse response
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(expressFlash()); // Buggy with express-sessions

/* 
Unmounted middleware user defined

Notes:

*/
// Print information about the request
app.use(asyncFunctionHandler(middlewareRequestResponseHandler));

async function middlewareRequestResponseHandler(req, res, next) {
    /* 
    This function reads requests and response
    
    */
    // res.locals (req.locals does not exist)
    // debugPrinter.printDebug(res.locals);

    // print request method
    // debugPrinter.printRequest(req.method);

    // print request url
    // debugPrinter.printRequest(req.url);

    // Debug print method and url
    debugPrinter.printRequest(`${req.method}: ${req.url}`);

    // Call next middleware
    next();
}

// Express Session handling (Must be below expressSessions)
app.use(asyncFunctionHandler(middlewareExpressSessionHandler));

async function middlewareExpressSessionHandler(req, res, next) {
    /* 
    This function handles logged in users 

    */
    // debugPrinter.printSuccess("Session")
    // debugPrinter.printDebug(req.session);

    // Print the session from the database
    // mySQLPrinter.printSessions();

    // If session.session_username exists (User is logged in)
    if (req.session.session_username) {
        res.locals.locals_session_logged = true;
        res.locals.locals_session_username = req.session.session_username;



        // res.locals.session_text_term_search = req.session.session_text_term_search;

        // Rest req.session.session_text_term_search
        // req.session.session_text_term_search = "";


    }

    // Call next middleware
    next();
}

/* 
*** Mounted middleware ***

Notes:
    Format (URL, Router module

*/
app.use("/", routerIndex); // app.locals.settings["/"]
app.use("/databaseTest", routerDatabaseTest); // app.locals.settings["/databaseTest"]
app.use("/users", routerUsers); // app.locals.settings["/users"]
app.use("/posts", routerPosts); // app.locals.settings["/posts"]
app.use("/comments", routerComments);

// Using my asyncFunctionHandler will cause errors!
// app.use("/", asyncFunctionHandler(routerIndex, "printRouter")); // app.locals.settings["/"]
// app.use("/databaseTest", asyncFunctionHandler(routerDatabaseTest, "printRouter")); // app.locals.settings["/databaseTest"]
// app.use("/users", asyncFunctionHandler(routerUsers, "printRouter")); // app.locals.settings["/users"]
// app.use("/posts", asyncFunctionHandler(routerPosts, "printRouter")); // app.locals.settings["/posts"]


app.use(asyncFunctionHandler(middlewareSaveSessionThenRedirect));

async function middlewareSaveSessionThenRedirect(req, res, next) {
    /* 
    This function handles the redirect at the end of all next() calls if the user is logged in

    Notes:
        Once you are logged out, express-flash will not work
    
    */

    // Debug res.locals, it may or may not exist
    // debugPrinter.printDebug("Printing res.locals");
    // debugPrinter.printDebug(res.locals);

    // Get location of Redirect based on res.locals.locals_redirect_last
    let redirect_last = res.locals.locals_redirect_last;

    if (req.session.session_username) {

        // Must force a save because redirect is TOO FAST COMPARED TO req to write to the Database
        req.session.save((err) => {
            // Handle errors when saving
            if (err) {
                next(err);
            }
            // If successful after saving
            else {
                if (redirect_last) {
                    debugPrinter.printSuccess(`Redirecting User to: ${redirect_last}`);

                    // Redirect user to redirect_last
                    res.redirect(redirect_last);
                } else {
                    debugPrinter.printSuccess(`Redirecting User to: /`);

                    // Redirect user to default
                    res.redirect("/");
                }

            }
        });

        // req.session.save() does not support promise, it's just a callback which is why you can't await i think...
        /* 
        req.session.save().then(() => {
            // Get location of Redirect based on res.locals.locals_redirect_last
            let location = res.locals.locals_redirect_last;

            // Redirect user
            res.redirect(location);
        }).catch(err => {
            next(err);
        })
        */

    } else {
        if (redirect_last) {
            debugPrinter.printWarning(`User is not logged in, no session exists and will not not save! Will redirect to: ${redirect_last}`)
            // Redirect user to redirect_last
            res.redirect(redirect_last);

        } else {
            debugPrinter.printWarning(`User is not logged in, no session exists and will not not save! Will redirect to: /`)
            // Redirect user to default
            res.redirect("/");
        }
    }
}

/* 
*** Error Handling Middleware ***

Notes:
    If an error is caught, then this is called.

*/

app.use(middlewareErrorHandler);

function middlewareErrorHandler(err, req, res, next) {
    /* 
    This functions handles all errors at the end of the day
    
    */
    debugPrinter.printMiddleware(middlewareErrorHandler.name);
    // Use the debugPrinter's errorPrint function to print message to console
    debugPrinter.printError(err);

    // Render error page with error message
    // TODO: error.hbs does not exist so you will get another error
    // res.render('error', { err_message: err })

    // VERY IMPORTANT NOTE: ALL ERRORS NOT CAUGHT BY THE DEVELOPER WILL REDIRECT TO THE HOME PAGE
    // res.redirect("/"); // DON'T DO CALL THIS
}

// Export app
module.exports = app;
