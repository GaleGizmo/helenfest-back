const { getTransporter } = require("../config/mailer");

async function sendTicketEmail(guest) {
  const transporter = getTransporter();
  if (!transporter) return;

  const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;
    const subject = guest.companionName
    ? "¡Vuestra entrada para HelenFest está confirmada! 🎉"
    : "¡Tu entrada para HelenFest está confirmada! 🎉";

  const salutation = guest.companionName
    ? `Ya estáis en la lista, <strong>${guest.name}</strong> y <strong>${guest.companionName}</strong>`
    : `Ya estás en la lista, <strong>${guest.name}</strong>`;

  const bodymain = guest.companionName
    ? "Habéis superado con éxito el durísimo proceso de admisión: hacer clic en un botón. Guardad este correo como recuerdo, justificante, entrada VIP o prueba documental de que dijisteis que veníais. 🎉"
    : "Has superado con éxito el durísimo proceso de admisión: hacer clic en un botón. Guarda este correo como recuerdo, justificante, entrada VIP o prueba documental de que dijiste que venías. 🎉";
  
    await transporter.sendMail({
    from: `"HelenFest" <${fromAddress}>`,
    to: guest.email,
    bcc: process.env.MAIL_BCC || "",
    subject: subject,
    html: `
      <div style="font-family: sans-serif; color: #1b1633;">
        <h1 style="color: #c1432e;">¡${salutation}!</h1>    
        <p>${bodymain}</p>
        <p>Tu entrada para HelenFest ha quedado reservada. No hace falta imprimir nada, con tu nombre en la puerta basta.</p>
       
        <p>Nos vemos en la pista 🕺💃</p>
        <p>— La Comisión de Fiestas de HelenFest —</p>
      </div>
    `,
  });
}

module.exports = { sendTicketEmail };
