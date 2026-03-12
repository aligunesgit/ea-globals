import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Geçersiz istek.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, company, email, phone, location, category, message } = body;

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Ad, e-posta ve mesaj zorunludur.' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #C8102E; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">EA Globals — Yeni Teklif Talebi</h1>
      </div>
      <div style="padding: 32px; background: #f9f9f9; border: 1px solid #eee;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 140px; font-size: 13px;">Ad Soyad</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600; font-size: 13px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">Firma</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600; font-size: 13px;">${company || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">E-posta</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px;"><a href="mailto:${email}" style="color: #C8102E;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">Telefon</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px;">${phone || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">Ülke / Şehir</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px;">${location || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">Kategori</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px;">${category || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-size: 13px; vertical-align: top; padding-top: 16px;">Mesaj</td>
            <td style="padding: 10px 0; font-size: 13px; padding-top: 16px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</td>
          </tr>
        </table>
      </div>
      <div style="padding: 16px 32px; background: #eee; font-size: 11px; color: #999; text-align: center;">
        eaglobals.com — Otomatik bildirim maili
      </div>
    </div>
  `;

  try {
    // 1) İç bildirim — sana gelen mail
    await resend.emails.send({
      from: 'EA Globals <noreply@eaglobals.com>',
      to: ['info@eaglobals.com'],
      replyTo: email,
      subject: `Yeni Teklif Talebi: ${company || name}`,
      html: emailHtml,
    });

    // 2) Otomatik onay — müşteriye giden mail
    await resend.emails.send({
      from: 'EA Globals <info@eaglobals.com>',
      to: [email],
      subject: 'Talebiniz Alındı — EA Globals',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #C8102E; padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Talebiniz Alındı</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 15px; color: #333;">Merhaba <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #555; line-height: 1.7;">
              Teklif talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.
            </p>
            <p style="font-size: 14px; color: #555; line-height: 1.7;">
              Acil talepleriniz için <a href="mailto:info@eaglobals.com" style="color: #C8102E;">info@eaglobals.com</a> adresine doğrudan yazabilirsiniz.
            </p>
            <p style="font-size: 14px; color: #333; margin-top: 24px;">Saygılarımızla,<br/><strong>EA Globals Import & Export</strong></p>
          </div>
          <div style="padding: 16px 32px; background: #f4f4f4; font-size: 11px; color: #999; text-align: center;">
            eaglobals.com
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ error: 'Mail gönderilemedi, lütfen tekrar deneyin.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
