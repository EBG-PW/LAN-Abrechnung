function errorHandler(err, req, res, next) {
    let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    /* Returns 400 if the client didn´t provide all data/wrong data type*/
    if (err.name === "ValidationError") {
        statusCode = 400
    }
    
    /* Returns 403 if the clients token doesn´t have the permissions required */
    if (err.message === "NoPermissions") {
        statusCode = 403
    }

    /* Returns 500 if some DB Query failed catastrophical */
    if(err.message === "DBError") {
        statusCode = 500
    }

    res.status(statusCode);
    res.json({
        message: err.message
    });
}

module.exports = {
    errorHandler
};