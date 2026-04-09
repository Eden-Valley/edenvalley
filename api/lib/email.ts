import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Welcome to Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Welcome to Eden Valley</h1>
          <p>Your application has been accepted.</p>
          <p>You will receive your access credentials shortly.</p>
          <p>In the meantime, you can explore the platform.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendRejectionEmail(email: string) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Your application to Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Application Status</h1>
          <p>Thank you for your interest in Eden Valley.</p>
          <p>After careful review, your application was not retained at this time.</p>
          <p>You may revisit your application in the future if your profile evolves.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    return false;
  }
}

export async function sendPriorityConfirmationEmail(email: string) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Priority Review Confirmed - Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Priority Review Confirmed</h1>
          <p>Your payment has been received.</p>
          <p>Our team will manually evaluate your profile within <strong>72 hours</strong>.</p>
          <p>You will receive your access credentials once your application is approved.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send priority confirmation email:', error);
    return false;
  }
}

export async function sendRefundEmail(email: string, refundId: string) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Your Priority Review Refund - Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Refund Processed</h1>
          <p>Your Priority Review payment has been refunded.</p>
          <p>We did not meet our 72-hour decision SLA. As promised, your refund has been processed.</p>
          <p>Refund ID: ${refundId}</p>
          <p>The funds will appear in your account within 5-10 business days.</p>
          <p style="margin-top: 24px; color: #666;">You're welcome to reapply when your profile evolves.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send refund email:', error);
    return false;
  }
}
