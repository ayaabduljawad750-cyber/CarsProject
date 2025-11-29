const appError = require("./appError.js");
const statusText = require("./statusText.js");

function isName(name) {
  if (!/[A-Z]/.test(name[0])) {
    const error = appError.create(
      `first letter must be capital in ${name}`,
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else if (!/[A-Za-z]/.test(name)) {
    const error = appError.create(
      `${name} must contain letters only`,
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else if (name.length < 3 || name.length > 20) {
    const error = appError.create(
      `${name} length must be between 3 and 20 characters`,
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else {
    return true;
  }
}

function isEmail(email) {
  if (/^[a-zA-Z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z]{2,})+$/.test(email)) {
    return true;
  } else {
    const error = appError.create("Invalid Email", 400, statusText.FAIL);
    throw error;
    return false;
  }
}

function isStrongPassword(password) {
  if (!/\W/.test(password)) {
    const error = appError.create(
      "Password must be contain at least one special character",
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else if (!/[a-z]/.test(password)) {
    const error = appError.create(
      "Password must be contain at least one letter from a to z",
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else if (!/[A-Z]/.test(password)) {
    const error = appError.create(
      "Password must be contain at least one letter from A to Z",
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else if (!/[0-9]/.test(password)) {
    const error = appError.create(
      "Password must be contain at least one number from 0 to 9",
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else if (password.length < 8 || password > 20) {
    const error = appError.create(
      "Password length must be between 8 and 20 characters",
      400,
      statusText.FAIL
    );
    throw error;
    return false;
  } else {
    return true;
  }
}


module.exports = { isName, isEmail, isStrongPassword };
