import { SMTPServer } from 'smtp-server';
import { createServer } from 'net';

const port = Number(process.env.SMTP_PORT || 2525);
const host = process.env.SMTP_HOST || '127.0.0.1';

const server = new SMTPServer({
  disabledCommands: ['AUTH'],
  logger: false,
  onData(stream, session, callback) {
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk.toString();
    });
    stream.on('end', () => {
      console.log(`[smtp] message received for ${session.envelope.to}`);
      console.log(data.slice(0, 800));
      callback();
    });
  },
  onConnect() {
    console.log(`[smtp] connection opened on ${host}:${port}`);
  },
  onClose() {
    console.log('[smtp] connection closed');
  },
  onRcptTo(address, session, callback) {
    callback();
  },
  onMailFrom(address, session, callback) {
    callback();
  },
});

server.on('error', (err) => {
  console.error('[smtp] server error:', err);
});

server.listen(port, host);
console.log(`[smtp] listening on ${host}:${port}`);

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
