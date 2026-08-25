const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const otpStore = {};

app.use(cors());
app.use(express.json());

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateEmail(email) {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendEmailOtp(email, otp) {
  const smtpHost = process.env.EMAIL_SMTP_HOST;
  const smtpPort = Number(process.env.EMAIL_SMTP_PORT || 587);
  const smtpUser = process.env.EMAIL_SMTP_USER;
  const smtpPass = process.env.EMAIL_SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return {
      demoMode: true,
      message: `OTP demo berhasil dibuat: ${otp}`
    };
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    throw new Error('Modul nodemailer belum terinstall.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || smtpUser,
    to: email,
    subject: 'Kode Verifikasi Login',
    text: `Kode verifikasi Anda adalah ${otp}. Kode ini berlaku untuk 5 menit.`,
    html: `<p>Kode verifikasi Anda adalah <strong>${otp}</strong>.</p><p>Kode ini berlaku untuk 5 menit.</p>`
  });

  return {
    demoMode: false,
    message: 'OTP berhasil dikirim via email',
  };
}

app.post('/api/send-otp', async (req, res) => {
  const email = normalizeEmail(req.body.email || '');

  if (!email) {
    return res.status(400).json({ message: 'Alamat email wajib diisi.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Alamat email tidak valid. Contoh: nama@email.com' });
  }

  const otp = generateOtp();
  otpStore[email] = otp;

  try {
    const result = await sendEmailOtp(email, otp);
    return res.json({
      success: true,
      message: result.demoMode ? `OTP demo berhasil dikirim ke ${email}.` : 'OTP berhasil dikirim ke email.',
      otpDemo: result.demoMode ? otp : undefined
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Gagal mengirim OTP. Coba lagi nanti.' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const email = normalizeEmail(req.body.email || '');
  const otp = (req.body.otp || '').trim();

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'OTP dan alamat email wajib diisi.' });
  }

  const storedOtp = otpStore[email];

  if (storedOtp && storedOtp === otp) {
    delete otpStore[email];
    return res.json({ success: true, message: 'Verifikasi email berhasil.' });
  }

  return res.status(400).json({ success: false, message: 'OTP salah atau sudah kadaluarsa.' });
});

app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = { app, normalizeEmail, validateEmail };

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}
