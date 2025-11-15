const nodemailer = require("nodemailer");

const transporterStore = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EmailStore,
    pass: process.env.PasswordStore,
  },
});

module.exports = transporterStore;
