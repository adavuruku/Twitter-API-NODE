//create server object
const http = require('http');
 const app = require('./app');
const port = process.env.PORT || 3000;
//create the server
const server = http.createServer(app);
server.listen(port);
