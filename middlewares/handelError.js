const statusText = require("../utils/statusText.js");

let handelError = (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || statusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
};

module.exports = handelError;
