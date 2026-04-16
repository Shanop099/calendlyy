import nodemailer from 'nodemailer';

interface BookingEmailData {
  invitee_name: string;
  invitee_email: string;
  event_name: string;
  start_time: Date;
  end_time: Date;
  host_name: string;
  host_email: string;
  location?: string;
  meeting_id: string;
}

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export async function sendBookingConfirmationToInvitee(data: BookingEmailData): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[Email] SMTP not configured — skipping invitee confirmation email');
    return;
  }

  const subject = `Confirmed: ${data.event_name} with ${data.host_name}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1A2E;">
      <div style="background: #006BFF; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Meeting Confirmed ✓</h1>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #6B7280; margin-top: 0;">Hi ${data.invitee_name},</p>
        <p>Your meeting has been scheduled. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280; width: 120px;">Event</td><td style="padding: 8px 0; font-weight: 600;">${data.event_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Host</td><td style="padding: 8px 0;">${data.host_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Date &amp; Time</td><td style="padding: 8px 0;">${formatDateTime(data.start_time)}</td></tr>
          ${data.location ? `<tr><td style="padding: 8px 0; color: #6B7280;">Location</td><td style="padding: 8px 0;">${data.location}</td></tr>` : ''}
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #F9FAFB; border-radius: 8px; font-size: 13px; color: #6B7280;">
          Meeting ID: ${data.meeting_id}
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${data.host_name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: data.invitee_email,
    subject,
    html,
  });

  console.log(`[Email] Booking confirmation sent to ${data.invitee_email}`);
}

export async function sendBookingNotificationToHost(data: BookingEmailData): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[Email] SMTP not configured — skipping host notification email');
    return;
  }

  const subject = `New Booking: ${data.event_name} with ${data.invitee_name}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1A2E;">
      <div style="background: #006BFF; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">New Booking Received</h1>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #6B7280; margin-top: 0;">Hi ${data.host_name},</p>
        <p>You have a new meeting booked:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280; width: 120px;">Invitee</td><td style="padding: 8px 0; font-weight: 600;">${data.invitee_name} (${data.invitee_email})</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Event</td><td style="padding: 8px 0;">${data.event_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Date &amp; Time</td><td style="padding: 8px 0;">${formatDateTime(data.start_time)}</td></tr>
        </table>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Calendly Clone" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: data.host_email,
    subject,
    html,
  });

  console.log(`[Email] Host notification sent to ${data.host_email}`);
}