function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  var statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  /* Returns 400 if the client didn´t provide all data/wrong data type*/
  if(err.name === "ValidationError"){
    statusCode = 400
  }
  
  res.status(statusCode);
  res.json({
    message: err.message
  });
}

module.exports = {
  notFound,
  errorHandler
};
