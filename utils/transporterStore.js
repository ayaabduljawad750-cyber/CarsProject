import nodemailer from "nodemailer";

const transporterStore = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EmailStore,
    pass: process.env.PasswordStore,
  },
});

export default transporterStore;
