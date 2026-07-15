import http from 'http';
import { appendFileSync } from 'fs';
import path from 'path';
import { createTransport } from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '127.0.0.1';
const smtpPort = Number(process.env.SMTP_PORT || 2525);
const port = Number(process.env.MAIL_API_PORT || 3001);

const logFilePath = path.join(process.cwd(), 'scripts', 'otp-mail-log.txt');

const transporter = createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  ignoreTLS: true,
  auth: undefined,
});

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/otp') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { email, code } = JSON.parse(body);
        const message = `To: ${email}\nCode: ${code}\n`;
        appendFileSync(logFilePath, `${new Date().toISOString()}\n${message}\n`);
        console.log(`[mail-api] otp for ${email}: ${code}`);

        await transporter.sendMail({
          from: 'healthvault@local.test',
          to: email,
          subject: 'HealthVault Reauthentication Code',
          text: `Your HealthVault reauthentication code is ${code}.`,
          html: `<p>Your HealthVault reauthentication code is <strong>${code}</strong>.</p>`,
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'not found' }));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[mail-api] listening on 127.0.0.1:${port}`);
});
