const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  }

  const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    let message = err.message;

      if(err.name === 'CastError' && err.kind === 'ObjectId'){
       statusCode = 404;
       message = 'Resource not found';
    }

    res.json({
      message: message,
      stack: process.env.NODE_ENV === 'production' ? null: err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};