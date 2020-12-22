/* 
Created by Joseph Edradan
Github: https://github.com/josephedradan

Date created: 12/22/2020

Purpose:

Details:

Description:

Notes:

IMPORTANT NOTES:

Explanation:

Reference:

*/
// Database Connector
const databaseConnector = require('../config/database_connecter');

// Asynchronous Function Middleware Handler
const asyncFunctionHandler = require("../decorators/async_function_handler");

async function getUserDataSimpleFromUsername(username) {

    // Base SQL query to get the username
    let baseSQLQueryGetUserDataSimpleFromUsername =
        `
        SELECT users_id, users_username, users_password 
        FROM users 
        WHERE users_username=?;
        `;

    // Get data from database via username (THIS AWAIT IS LITERALLY USELESS BECAUSE IT'S SEQUENTIAL)
    let [
        rowsResultUserData,
        fields,
    ] = await databaseConnector.execute(baseSQLQueryGetUserDataSimpleFromUsername, [username]);

    return [rowsResultUserData, fields]

}

async function getUserDataAllFromUsername(username) {

    let baseSQLQueryGetUserDataAllFromUsername = "SELECT * FROM users WHERE users_username=?"

    // Check if the Username already exists
    let [rowsResultUserData, fields] = await databaseConnector.execute(
        baseSQLQueryGetUserDataAllFromUsername,
        [username]
    );

    return [rowsResultUserData, fields]

}

async function getUserEmailDataAllFromEmail(email) {

    let baseSQLQueryGetEmailDataAllFromEmail = "SELECT * FROM users WHERE users_email=?"

    // Check if the Email already exists
    let [rowsResultEmailData, fields] = await databaseConnector.execute(
        baseSQLQueryGetEmailDataAllFromEmail,
        [email]
    );

    return [rowsResultEmailData, fields]
}

async function addUserNewToDatabase(username, email, passwordHashed) {

    // Query insert
    let baseSQLQueryInsert =
        "INSERT INTO users (`users_username`, `users_email`, `users_password`, `users_created`) VALUES (?, ?, ?, now());";

    let [rowsResultInsertUser, fields] = await databaseConnector.execute(baseSQLQueryInsert, [
        username,
        email,
        passwordHashed,
    ]);

    return [rowsResultInsertUser, fields]
}

const usersModel = {
    getUserDataSimpleFromUsername: asyncFunctionHandler(getUserDataSimpleFromUsername, "printFunction"),
    getUserDataAllFromUsername: asyncFunctionHandler(getUserDataAllFromUsername, "printFunction"),
    getUserEmailDataAllFromEmail: asyncFunctionHandler(getUserEmailDataAllFromEmail, "printFunction"),
    addUserNewToDatabase: asyncFunctionHandler(addUserNewToDatabase, "printFunction"),
}

module.exports = usersModel;