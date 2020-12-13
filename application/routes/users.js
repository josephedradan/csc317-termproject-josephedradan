/* 
Created by Joseph Edradan
Github: https://github.com/josephedradan

Date created: 

Purpose:
  Handle urls relevant to the user
Details:

Description:

Notes:

IMPORTANT NOTES:

Explanation:

Reference:
    Sessions won't save in Node.js without req.session.save()
        https://stackoverflow.com/questions/26531143/sessions-wont-save-in-node-js-without-req-session-save
*/

/* 
Node modules 

*/
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Data base connecter
const databaseConnector = require("../config/database_connecter");

// Debugging printer
const debugPrinter = require("../helpers/debug/debug_printer");

// Custom user error class
const UserError = require("../helpers/error/user_error");

// Asynchronous Function Middleware Handler
const middlewareAsyncFunctionHandler = require("../helpers/middleware_async_function_handler");

// const mySQLPrinter = require('../helpers/my_sql_printer');

// Handle registration posting
router.post("/register", middlewareAsyncFunctionHandler(register));

async function register(req, res, next) {
    // req Comes with a bunch of garbage
    // Body of the POST
    debugPrinter.debugPrint(req.body);

    // TODO: DO VALIDATION
    let username = req.body["username"];
    let email = req.body["email"];
    let password1 = req.body["password-1"];
    let password2 = req.body["password-1"];
    let checkAge = req.body["checkbox-age"];
    let checkTOS = req.body["checkbox-tos"];

    // let active = 1;

    // Query insert
    let baseSQlQueryInsert =
        "INSERT INTO users (`users_username`, `users_email`, `users_password`, `users_created`) VALUES (?, ?, ?, now());";

    // Check if the Username already exists
    const promiseUsername = databaseConnector.execute(
        "SELECT * FROM users WHERE users_username=?",
        [username]
    );

    // Check if the Email already exists
    const promiseEmail = databaseConnector.execute(
        "SELECT * FROM users WHERE users_email=?",
        [email]
    );
    
    // Call promises concurrently
    [rowsResultUsername, fields1, rowsResultEmail, fields2] = Promise.call([promiseUsername, promiseEmail])

    // Check username exists in database then check its length
    if (rowsResultUsername && rowsResultUsername.length) {
        let stringFailure = `Username: ${username} already exists!`;
        debugPrinter.errorPrint(stringFailure);
        res.status(300).redirect("/registration");
        throw new UserError(
            "Registration Failed: Username already exists",
            "/registration",
            300
        );
    }

    // Check Email exist in database then check its length
    if (rowsResultEmail && rowsResultEmail.length) {
        let stringFailure = `Email: ${email} already exists!`;
        debugPrinter.errorPrint(stringFailure);
        res.status(300).redirect("/registration");
        throw new UserError(
            "Registration Failed: Email is already in use!",
            "/registration",
            300
        );
    }

    // Hash password
    passwordHashed = await bcrypt.hash(password1, 10);

    // TODO: MAKE A WRAPPER/FUNCTION TYPE FOR HANDLING QUERIES

    let stringSuccess1 = "Executing Registration Query";
    debugPrinter.successPrint(stringSuccess1);
    databaseConnector.execute(baseSQlQueryInsert, [
        username,
        email,
        passwordHashed,
    ]);

    let stringSuccess2 = `Query Successful`;
    debugPrinter.successPrint(stringSuccess2);

    // req.flash('alert_account_creation', "Your can now log in")

    res.locals.last_redirect = "/";
    // Will probably call saveSessionThenRedirect();
    next();

}

// Handle /login
router.post("/login", middlewareAsyncFunctionHandler(login));

async function login(req, res, next) {
    // Base SQL query to get the username
    let SQLQueryBase =
        "SELECT users_id, users_username, users_password FROM users WHERE users_username=?;";

    // Get both username and password
    let username = req.body["username"];
    let password = req.body["password"];

    // Get data from database via username (THIS AWAIT IS LITERALLY USELESS BECAUSE IT'S SEQUENTIAL)
    const [
        rowsResultUserData,
        fields,
    ] = await databaseConnector.execute(SQLQueryBase, [username]);

    // resultUserData Exists and resultUserData.length Exists
    if (rowsResultUserData && rowsResultUserData.length) {
        // Get the first instance of the user (there should only be 1)
        let resultUserDataFirst = rowsResultUserData[0];

        // Handle if there is more than 1 usr with the same name (should not exist)
        if (rowsResultUserData.length > 1) {
            throw new Error(
                `There is more than 1 user with the same Username as: ${username}`
            );
        }

        // Debug print resultUserDataFirst
        // debugPrinter.debugPrint(`Object from DB: ${resultUserDataFirst}`);

        // Assign local vars for easy use
        let db_id = resultUserDataFirst["users_id"];
        let db_username = resultUserDataFirst["users_username"];
        let db_password_hashed = resultUserDataFirst["users_password"];

        // Hash password here because it's costly to do a hash when you need to know the username first
        let check = await bcrypt.compare(password, db_password_hashed);

        if (check) {
            // debugPrinter.debugPrint(typeof (resultUserDataFirst)); // Type is object

            for (const [key, value] of Object.entries(resultUserDataFirst)) {
                debugPrinter.debugPrint(`${key}: ${value}`);
            }

            // Set user as logged in in Sessions
            req.session.session_username = await db_username; // await does nothing here
            req.session.session_user_id = await db_id; // await does nothing here

            // Assign res locals immediately (Doesn't matter since we are going to redirect to home anyways)
            // res.locals.session_logged = true;
            // res.locals.session_username = req.session.session_username;

            // Debug print successful login
            let stringSuccess = `User ${db_username} has logged in`;
            debugPrinter.successPrint(stringSuccess);

            // Add to flash before redirect
            // req.flash('alert_username', `${db_username}`) // await does nothing here
            debugPrinter.debugPrint(req.session);

            // Set the last redirect for the response
            res.locals.last_redirect = "/";

            // Will probably call saveSessionThenRedirect();
            next();

            // Debug print
            // debugPrinter.debugPrint("Stuff happens after?");
            // debugPrinter.successPrint(global); // this == global

            // CHECK IF YOU WROTE TO THE DATABASE
            // mySQLPrinter.printSessions();
        }
        // Credentials don't match
        else {
            // Redirect to login When invalid user entry
            throw new UserError("Invalid username and/or password", "/login", 200);
        }
    }
    // Account does not exist
    else {
        // Redirect to login When invalid user entry
        throw new UserError("Invalid username and/or password", "/login", 200);
    }
}

/* 
Handle /logout 
TODO: MAKE THE CALLBACK INTO A FUNCTION

Reference:
  Authentication in Node.js - #7 Login & Logout
    https://www.youtube.com/watch?v=BIxJEdMsCJs&t=9s
      Notes:
        A lot cleaner here and more advanced
*/
router.post("/logout", middlewareAsyncFunctionHandler(logout));

async function logout(req, res, next) {
    req.session.destroy((err) => {
        // Handle errors
        if (err) {
            // Debug print error
            debugPrinter.errorPrint("Session could not be destroyed.");
            next(err);
        }
        // Hand
        else {
            // Debug print success
            debugPrinter.successPrint("Session was destroyed");

            // Clear cookies
            res.clearCookie("csid");

            // Send json status and message back to the user
            res.json({ status: "OK", message: "use has logged out." });
        }
    });
}




module.exports = router;
