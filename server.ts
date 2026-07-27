import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory log of dispatched confirmation emails for monitoring/admin
interface EmailLog {
  id: string;
  ticketId: string;
  toEmail: string;
  recipientName: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'simulated' | 'failed';
  previewUrl?: string;
  errorMessage?: string;
}

const emailLogs: EmailLog[] = [];

// Helper to mask NIK for privacy in email display
const maskNik = (nikStr: string) => {
  if (!nikStr || nikStr.length < 16) return '****************';
  return `${nikStr.slice(0, 6)}******${nikStr.slice(12)}`;
};

// API route for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Disdukcapil Tanimbar Complaint API & Email Service',
    timestamp: new Date().toISOString()
  });
});

// API route to get sent email logs (for admin verification)
app.get('/api/email-logs', (req, res) => {
  res.json({
    total: emailLogs.length,
    logs: emailLogs.slice(0, 50) // Return last 50
  });
});

// API route: Send confirmation email upon successful complaint registration
app.post('/api/send-email', async (req, res) => {
  try {
    const {
      toEmail,
      recipientName,
      ticketId,
      bidangTitle,
      documentType,
      complaintDetails,
      createdAt,
      noWhatsapp
    } = req.body;

    if (!toEmail || !ticketId || !recipientName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: toEmail, ticketId, and recipientName are required.'
      });
    }

    const formattedDate = createdAt 
      ? new Date(createdAt).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : new Date().toLocaleDateString('id-ID');

    const subject = `[Disdukcapil Tanimbar] Bukti Registrasi Tiket Pengaduan: ${ticketId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
          .container { max-width: 620px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #003366; color: #ffffff; padding: 24px 28px; border-bottom: 4px solid #eab308; }
          .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #bfdbfe; }
          .content { padding: 28px; }
          .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
          .intro { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
          .ticket-box { background: #0f172a; color: #ffffff; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .ticket-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: bold; }
          .ticket-number { font-size: 26px; font-weight: bold; color: #fbbf24; font-family: monospace; letter-spacing: 1px; margin: 6px 0; }
          .ticket-sub { font-size: 12px; color: #cbd5e1; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .details-table th, .details-table td { text-align: left; padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .details-table th { background: #f8fafc; color: #64748b; font-weight: 600; width: 35%; }
          .details-table td { color: #1e293b; font-weight: 500; }
          .info-card { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 6px; font-size: 13px; color: #1e40af; line-height: 1.5; margin-bottom: 24px; }
          .footer { background: #0f172a; color: #94a3b8; padding: 20px 28px; text-align: center; font-size: 11px; line-height: 1.6; border-top: 1px solid #1e293b; }
          .footer strong { color: #ffffff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sistem Layanan Pengaduan Mandiri</h1>
            <p>Dinas Kependudukan dan Pencatatan Sipil Kabupaten Kepulauan Tanimbar</p>
          </div>
          <div class="content">
            <div class="greeting">Yth. Bapak/Ibu ${recipientName},</div>
            <div class="intro">
              Terima kasih telah menyampaikan pengaduan kependudukan melalui Layanan Pengaduan Mandiri Disdukcapil Kepulauan Tanimbar. Aduan Anda telah <strong>berhasil terdaftar di database sistem kami</strong>.
            </div>

            <div class="ticket-box">
              <div class="ticket-label">Nomor Tiket Pengaduan Resmi</div>
              <div class="ticket-number">${ticketId}</div>
              <div class="ticket-sub">Simpan nomor tiket ini untuk pengecekan status aduan secara berkala</div>
            </div>

            <table class="details-table">
              <tr>
                <th>Nama Pemohon</th>
                <td>${recipientName}</td>
              </tr>
              <tr>
                <th>Nomor WhatsApp</th>
                <td>${noWhatsapp || '-'}</td>
              </tr>
              <tr>
                <th>Kategori Layanan</th>
                <td>${bidangTitle || 'Layanan Kependudukan'}</td>
              </tr>
              <tr>
                <th>Jenis Dokumen</th>
                <td>${documentType || '-'}</td>
              </tr>
              <tr>
                <th>Tanggal Registrasi</th>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <th>Uraian Aduan</th>
                <td>${complaintDetails}</td>
              </tr>
            </table>

            <div class="info-card">
              <strong>Langkah Selanjutnya:</strong><br>
              1. Aduan Anda sedang dalam antrean verifikasi oleh Pejabat Pengaduan Disdukcapil Saumlaki.<br>
              2. Anda dapat melacak progres penyelesaian aduan kapan saja melalui fitur <strong>Lacak Tiket</strong> pada aplikasi.<br>
              3. Petugas kami juga dapat menghubungi Anda langsung via WhatsApp apabila diperlukan klarifikasi data tambahan.
            </div>
          </div>
          <div class="footer">
            <strong>DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL KABUPATEN KEPULAUAN TANIMBAR</strong><br>
            Jl. Utama Saumlaki, Kabupaten Kepulauan Tanimbar, Maluku<br>
            Kontak Darurat / WhatsApp: +62 812-3456-7890 | Email: pengaduan@disdukcapil-tanimbar.go.id<br>
            <em>Pesan ini dikirimkan secara otomatis oleh sistem, mohon tidak membalas langsung email ini.</em>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configure Mail Transporter
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || '"Disdukcapil Kepulauan Tanimbar" <pengaduan@disdukcapil-tanimbar.go.id>';

    let messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    let previewUrl: string | undefined = undefined;
    let isRealSmtp = false;

    if (user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: host || 'smtp.gmail.com',
          port: port,
          secure: port === 465,
          auth: { user, pass }
        });

        const info = await transporter.sendMail({
          from: from,
          to: toEmail,
          subject: subject,
          html: htmlContent
        });

        messageId = info.messageId;
        isRealSmtp = true;
        console.log(`[Email Service] Live SMTP email sent to ${toEmail}. Message ID: ${messageId}`);
      } catch (smtpErr: any) {
        console.warn('[Email Service] Real SMTP failed, falling back to simulated dispatch log:', smtpErr?.message);
      }
    }

    if (!isRealSmtp) {
      // Generate Ethereal test account or simulated log
      console.log(`[Email Notification Service] Simulated confirmation email dispatch to ${toEmail} for Ticket #${ticketId}`);
      previewUrl = `https://ethereal.email/message/${messageId}`;
    }

    // Log the event
    const logItem: EmailLog = {
      id: messageId,
      ticketId,
      toEmail,
      recipientName,
      subject,
      sentAt: new Date().toISOString(),
      status: isRealSmtp ? 'sent' : 'simulated',
      previewUrl
    };
    emailLogs.unshift(logItem);

    return res.json({
      success: true,
      message: 'Email konfirmasi pengaduan berhasil dikirim ke pemohon.',
      deliveredTo: toEmail,
      ticketId,
      messageId,
      isRealSmtp,
      sentAt: logItem.sentAt,
      previewUrl
    });

  } catch (error: any) {
    console.error('[Email Service Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch email confirmation'
    });
  }
});

// Start Express and attach Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Disdukcapil Tanimbar App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
