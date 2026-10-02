const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const { getTransporter } = require("../config/mailer");

const assetsDir = path.join(__dirname, "../assets/email");

let qrBufferPromise;

// El QR es el mismo para todos los invitados, así que se genera una sola vez.
function getQrBuffer() {
  const target = process.env.QR_TARGET_URL;
  if (!target) {
    console.warn("Falta QR_TARGET_URL: el email se enviará sin QR.");
    return Promise.resolve(null);
  }
  qrBufferPromise ??= QRCode.toBuffer(target, { width: 320, margin: 1 });
  return qrBufferPromise;
}

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

function inlineImage(filename, cid, alt) {
  const filePath = path.join(assetsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Falta la imagen del email: ${filePath}`);
    return null;
  }
  return {
    html: `<img src="cid:${cid}" alt="${alt}" width="600" style="display:block;max-width:100%;height:auto;margin:0 auto 16px;">`,
    attachment: { filename, path: filePath, cid },
  };
}

function ticketRow(color, label, value) {
  return `<p style="margin:0 0 14px;"><span style="color:${color};font-weight:bold;font-size:20px;">${label}</span> <strong>${value}</strong></p>`;
}

async function sendTicketEmail(guest) {
  const transporter = getTransporter();
  if (!transporter) return;

  const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;
  const subject = guest.companionName
    ? "¡Vuestra entrada para HelenFest está confirmada! 🎉"
    : "¡Tu entrada para HelenFest está confirmada! 🎉";

  const salutation = guest.companionName
    ? `Hola, <strong><span style="color: #fd358b;">${escapeHtml(guest.name)}</span></strong> y <strong><span style="color: #fd358b;">${escapeHtml(guest.companionName)}</span></strong>, gracias por comprar a través de nuestra web. Aquí tenéis vuestra entrada para el HelenFest. `
    : `Hola, <strong><span style="color: #fd358b;">${escapeHtml(guest.name)}</span></strong>, gracias por comprar a través de nuestra web. Aquí tienes tu entrada para el HelenFest.`;

  const salutation2 = guest.companionName
    ? `Recordad que no es necesario imprimir vuestras entradas. Mostrad este QR en vuestros dispositivos móviles para poder acceder al recinto (y sobretodo, no lo escaneeis). `
    : `Recuerda que no es necesario imprimir tu entrada. Muestra este QR en tu dispositivo móvil para poder acceder al recinto (y sobretodo, no lo escanees).`;

  const generalCondition = `
  <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #222;">

    <p>
      <strong>🎟️ &nbsp;01. ESTA ENTRADA INCLUYE DERECHO A DISFRUTAR MUCHÍSIMO</strong><br>
      Incluye música, risas, bingo, karaoke y la peciosísima oportunidad de celebrar juntos este cumpleaños.
      Eso sí, ¡<strong>PROHIBIDO VENIR A MIRAR</strong>! El disfrute viene incluido y se recomienda sacarle el máximo partido.
    </p>

    <p>
      <strong>🍰 &nbsp;02. TRAE ALGUNA COMIDITA RICA PARA COMPARTIR</strong><br>
      El <strong>HELENFEST</strong> es un festival de alta gastronomía colaborativa de andar por casa, así que cada asistente deberá traer algo sabrosoooo.
      Todo será recibido con alegría y <del>entusiasmo</del> (¡hambre, mucha hambre!).
    </p>

    <p>
      <strong>🎶 &nbsp;03. DURANTE EL CONCIERTO, ¡SE CANTA A GRITO PELAO!</strong><br>
      Está permitido bailar, cantar, aplaudir y emocionarse (y abuchear también, ¿eh?, que ya estamos en otoño y tiene que llover un poquito…).
      Se recomienda especialmente corear las canciones, aunque no se conozca la letra.
      La organización valorará muchísimo el entusiasmo y establecerá preferencias hacia aquellos
      <strong>FANSES</strong> que más se hagan notar (Fomentamos activamente la competitividad).
    </p>

    <p>
      <strong>🎤 &nbsp;04. EL KARAOKE ES TERRITORIO LIBRE DE VERGÜENZA</strong><br>
      Aquí no se viene ensayado de casa, no se practica, no se estudia!. No valen los «<em>yo no canto</em>»
      ni los «<em>me da vergüenza</em>». ¡Se coge el micro y a destrozar canciones!
      Porque «cuanto peor para todos, mejor».
    <br>
      Se valorará especialmente la falta de reparos en perder la dignidad y el entusiasmo desmedido.
      Por lo que, por favor, cantad mucho… cantad alto, cantad bajo, cantad bien, cantad fatal,
      cantad como si estuvierais en la ducha. Lo importante no es acertar las notas:
      <strong>lo importante es pasarlo bien juntos.</strong>
    </p>

    <p>
      <strong>💃 &nbsp;05. ¡A PERREAR HASTA ABAJO! <em>(Pero con cabeza)</em></strong><br>
      En el <strong>HELENFEST</strong> todos los estilos de baile son válidos, especialmente aquellos bailes vergonzosos
      que pueden dejar recuerdos para la posteridad, aunque requieran una ambulancia.
      ¡Que ya tenemos una edad! Las rodillas se resienten, pero aún nos queda mucha fiesta.<br>
      <em>(La organización informa de la existencia de paracetamol e ibuprofeno en el recinto).</em>
    </p>

    <p>
      <strong>😂 &nbsp;06. ¡AQUÍ SE VIENE A HACER EL RIDÍCULO!</strong><br>
      Esperamos que lo des todo con las canciones, el bingo y los bailes…
      Se recomienda compartir las risas con los demás y sacar alguna que otra fotillo para el recuerdo
      (tu sabes…jeje).
    </p>

    <p>
      <strong>🥂 &nbsp;07. ABRAZOS, BRINDIS Y AMOOOOOOOR</strong> (oioioioioi)<br>
      Se recomienda repartir achuchones. La organización considera que celebrar un cumpleaños rodeada
      de personas queridas es una de las mayores motivaciones para montar todo este despropósito.
      Así que, solo por hoy y sin que sirva de precedente, <strong>¡ABRAZOS GRATIS!</strong>
    </p>

    <p>
      <strong>🎁 &nbsp;08. POLÍTICA DE REGALOS</strong><br>
      Se informa que <strong>no se aceptan presentes.</strong>
      El mayor regalo de cumpleaños es vuestro esfuerzo por compartir este día conmigo.
    </p>

    <p>
      <strong>❤️ &nbsp;CLÁUSULA ADICIONAL</strong><br>
      Helenita Retaca siempre ha soñado con un cumpleaños-karaoke rodeada de gente a la que quiere mucho.
      Y, 33 años después, ¡lo ha conseguido!<br>
    
      Así que, si hoy recibes este correo, no es solo porque tengas una entrada para un festival de dudosa
      solvencia artística 😌. Es porque eres parte de mi vida y porque
      <strong>no se me ocurre una forma más bonita de celebrar un año más que contigo</strong>.<br>
    
      Y todo esto jamás habría sido posible sin <strong>Migui</strong>, que hoy se merece una mención especial
      por su <strong>ayuda, su apoyo y por aguantar con (in)finita paciencia</strong> todas mis ocurrencias
      macarrónicas y los niveles de entusiasmo que me han <u>poseído fuertemente</u> durante la organización
      de este festival «de dudosa procedencia».<br>
      <strong>¡Gracias! ❤️</strong>
    </p>

    <p>
      Con muchísimo cariño,<br><br>
      <strong>🎸 &nbsp;LA COMISIÓN DE FIESTAS DEL HELENFEST 🎤</strong>
    </p>

  </div>
`;
  const legalNotice = `
    <p style="font-size: 12px; color: #888888;">
      Este mensaje puede contener información inventada y de dudosa confidencialidad.
       Si Ud. No es el destinatario (o el responsable de hacer llegar este mensaje al destinatario), le informamos 
       que está totalmente prohibida cualquier utilización, divulgación, distribución y/o reproducción de esta 
       entrada. No queremos patrocinar un “Si me queréis, irse”. Si ha recibido este mensaje por error, rogamos 
       proceda a su destrucción. El tratamiento de datos se realizará de forma confidensial y de conformidad con la
        normativa vigente. Ud. Podrá ejercer el derecho de rectificación, limitación y cancelación de sus datos en los
         términos establecidos en la Ley Orgánica 3/2018, del 5 de diciembre, de Protección de Gatos Personajes y
          Garantía de las Dignidades Digitales, otra cosa es que le hagamos caso, porque una vez que se ha apuntado, 
          ahora tiene que venir.  La organización no se responsabiliza de posibles daños psicológicos o reputacionales
           derivados de la participación en ninguna de las actividades organizadas en el HelenFest, ni de la
            existencia de imágenes o videos que pongan en compromiso la dignidad de los participantes. En todo caso, 
            rogamos nos hagan llegar adjuntos los vídeos comprometedores o fotografías especialmente desfavorecedoras 
            motivo de la reclamación (no lo valoraremos, solo es para reírnos, por si no lo teníamos todavía). 
             Se reserva el derecho de admisión, en caso de detectar negativa en participación activa en el evento 
             puede ser expulsado del recinto con una patada en el culito.
    </p>
  `;

  const headerImages = [
    inlineImage("logo_email.png", "logo", "HelenFest"),
    inlineImage("congrats.jpg", "congrats", "¡Ya tienes entrada!"),
  ].filter(Boolean);

  const qrBuffer = await getQrBuffer();
  const qrCell = qrBuffer
    ? `<img src="cid:qr" alt="QR de tu entrada" width="160" style="display:block;margin:0 auto;">`
    : "";

  const attachments = [
    ...headerImages.map((image) => image.attachment),
    ...(qrBuffer ? [{ filename: "qr.png", content: qrBuffer, cid: "qr" }] : []),
  ];

  const guestNames = guest.companionName
    ? `${escapeHtml(guest.name)} y ${escapeHtml(guest.companionName)}`
    : escapeHtml(guest.name);

  const ticketTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:2px solid #000000;margin:24px 0;font-family:Arial,Helvetica,sans-serif;color:#222222;">
      <tr>
        <td width="30%" align="center" valign="middle" style="border-right:2px solid #000000;padding:16px;">${qrCell}</td>
        <td valign="middle" style="padding:20px 24px;font-size:16px;line-height:1.5;">
          ${ticketRow("#3fd0c9", "INCLUYE:", "ACCESO AL HELENFEST - (PACK KARAOKE)")}
          ${ticketRow("#d4f01c", "NOMBRE:", guestNames)}
          ${ticketRow("#f07a10", "CORREO:", escapeHtml(guest.email))}
          ${ticketRow("#fd358b", "FECHA:", "25 DE OCTUBRE 2026")}
          <p style="margin:0;"><span style="color:#3fd0c9;font-weight:bold;font-size:20px;">RECINTO:</span> vivienda unifamiliar ubicada en <strong>O MARQUIÑO CITY CENTER</strong> (en breves recibirás información sobre las áreas de aparcamiento habilitados y los accesos al recinto)</p>
        </td>
      </tr>
    </table>
  `;

  await transporter.sendMail({
    from: `"HelenFest" <${fromAddress}>`,
    to: guest.email,
    bcc: process.env.MAIL_BCC || "",
    subject: subject,
    attachments,
    html: `
      <div style="font-family: sans-serif; color: #1b1633;">
        ${headerImages.map((image) => image.html).join("")}
        <p>¡${salutation}!</p>
        <p>${salutation2}</p>
        ${ticketTable}
        <h3>CONDICIONES GENERALES</h3>
        <hr style="border: 0; border-top: 1px solid #cccccc; margin: 28px 0;">
        ${generalCondition}
        
        <hr style="border: 0; border-top: 1px solid #cccccc; margin: 28px 0;">
        ${legalNotice}
      </div>
    `,
  });
}

module.exports = { sendTicketEmail };
