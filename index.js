/**
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var express = require('express');
var xhub = require('express-x-hub');

require('dotenv').config();

var app = express();

var port = process.env.PORT || 5000;

app.listen(port);

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(express.json());

var received_updates = [];

app.get('/', function(req, res) {
  res.setHeader('content-type', 'application/json');
  res.send(JSON.stringify(received_updates, null, 2));
});

var token = process.env.TOKEN || 'token';

app.get(['/facebook'], function(req, res) {
  if (req.query['hub.mode'] !== 'subscribe' || req.query['hub.verify_token'] !== token) {
    res.sendStatus(400);
    return;
  }

  res.send(req.query['hub.challenge']);
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

