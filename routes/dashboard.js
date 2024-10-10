const express = require('express');
const dashboard = express.Router();

dashboard .get('/', function (request, response) {
    response.render('index');
});

module.exports = dashboard ;