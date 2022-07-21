function errorHandler(err, req, res, next) {
    let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    /* Returns 400 if the client didn´t provide all data/wrong data type*/
    if (err.name === "ValidationError") {
        statusCode = 400
    }

    res.status(statusCode);
    res.json({
        message: err.message
    });
}

module.exports = {
    errorHandler
};