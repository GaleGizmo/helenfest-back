const nodemailer = require("nodemailer");
require("dotenv").config();
let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "Faltan variables SMTP_*. Los emails no se enviarán hasta configurarlas.",
    );
    return null;
  }
  console.log("Configurando el transporter de nodemailer...");
  console.log(`SMTP_HOST: ${SMTP_HOST}`);
  console.log(`SMTP_PORT: ${SMTP_PORT}`);
  console.log(`SMTP_SECURE: ${SMTP_SECURE}`);
  console.log(`SMTP_USER: ${SMTP_USER}`);
  console.log(`SMTP_PASS: ${SMTP_PASS ? "********" : "not set"}`);

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true", // true para el puerto 465, false para 587 (STARTTLS)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

module.exports = { getTransporter };
