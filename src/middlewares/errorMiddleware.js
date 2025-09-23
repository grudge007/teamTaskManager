module.exports = (err, req, response, next) => {
  console.error("Error Caught", err);
  const status = err.status || 500;
  const errorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
  };
  if (process.env.NODE_ENV === "dev") {
    errorResponse.stack = err.stack;
  }
  response.status(status).json(errorResponse);
};
