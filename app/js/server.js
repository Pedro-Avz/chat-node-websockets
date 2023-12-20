const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }

      res.writeHead(200);
      res.end(data);
    });
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const parsedMessage = JSON.parse(message);
  
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          let formattedMessage;
  
          if (client === ws) {
            // Mensagem do próprio usuário
            formattedMessage = `Você: ${parsedMessage.message}`;
          } else {
            // Mensagem de outros usuários
            formattedMessage = `${parsedMessage.username}: ${parsedMessage.message}`;
          }
  
          client.send(formattedMessage);
        }
      });
    });
  
  ws.on('close', () => {
    if (ws.username) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`O usuário ${ws.username} se desconectou do chat.`);
        }
      });
    }
  });
});

server.listen(7777, () => {
  console.log('Server is running on http://localhost:7777');
});
