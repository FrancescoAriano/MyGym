import nodemailer from "nodemailer";

const getEtherealCredentials = async () => {
  if (!global.etherealTestAccount) {
    global.etherealTestAccount = await nodemailer.createTestAccount();
  }
  return global.etherealTestAccount;
};

export const sendOnboardingEmail = async (to, token) => {
  try {
    const testAccount = await getEtherealCredentials();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const onboardingUrl = `${process.env.NEXTAUTH_URL}/user/set-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: "Benvenuto su MyGym! Imposta la tua password",
      html: `
          <h1>Benvenuto su MyGym!</h1>
          <p>Il tuo account è stato creato. Clicca sul link qui sotto per impostare la tua password e attivare il tuo account.</p>
          <p>Questo link scadrà tra 72 ore.</p>
          <a href="${onboardingUrl}">Imposta la tua password</a>
          <p>Se non hai richiesto questo, ignora questa email.</p>
          <p>Un saluto,<br/>Il team di MyGym</p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Preview URL: %s", previewUrl);

    return { success: true, previewUrl };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
};

export const sendGymVerificationEmail = async (to, token) => {
  try {
    const testAccount = await getEtherealCredentials();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/gym/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: "Benvenuto su MyGym! Verifica la tua email",
      html: `
          <h1>Benvenuto su MyGym!</h1>
          <p>Il tuo account è stato creato. Clicca sul link qui sotto per verificare la tua email e attivare il tuo account.</p>
          <p>Questo link scadrà tra 72 ore.</p>
          <a href="${verificationUrl}">Verifica la tua mail</a>
          <p>Se non hai richiesto questo, ignora questa email.</p>
          <p>Un saluto,<br/>Il team di MyGym</p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Preview URL: %s", previewUrl);

    return { success: true, previewUrl };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
};

export const sendAdminGymRegistrationNotification = async (gymData) => {
  try {
    const testAccount = await getEtherealCredentials();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `[MyGym] Nuova richiesta di registrazione: ${gymData.name}`,
      html: `
          <h1>Nuova Richiesta di Registrazione Palestra</h1>
          <p>Una nuova palestra si è registrata e attende approvazione.</p>
          <ul>
            <li><strong>Nome:</strong> ${gymData.name}</li>
            <li><strong>Email:</strong> ${gymData.email}</li>
            <li><strong>Indirizzo:</strong> ${gymData.address}</li>
          </ul>
          <p>Puoi approvare questa palestra direttamente dal tuo database Neon.</p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Preview URL: %s", previewUrl);

    return { success: true, previewUrl };
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return { success: false, error: "Failed to send admin notification" };
  }
};
