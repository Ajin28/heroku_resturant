var express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate')
var router = express.Router();



router.route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    res.json(req.body)
  })

module.exports = router;
