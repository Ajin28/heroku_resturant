var express = require('express');
var userRouter = express.Router();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const User = require('../models/user');
var passport = require('passport')
var authenticate = require('../authenticate')
const cors = require('./cors')

userRouter.use(bodyParser.json())

userRouter.options("*", cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  res.sendStatus(200);
})

/* GET users listing. */
userRouter.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  User.find({}, (err, users) => {
    if (err) {
      next(err)
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json')
      res.json(users)
    }
  })
})

userRouter.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {

  if (req.user) {
    var token = authenticate.getToken({ _id: req.user._id })
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    res.json({ success: true, token: token, status: 'You are successfully logged in!' })

  }
})


userRouter.post('/signup', cors.corsWithOptions, function (req, res, next) {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json')
      res.json({ err: err })
    }
    else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json')
          res.json({ err: err })
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json')
          res.json({ success: true, status: 'Registration Successful!' })
        });
        // req.user is populated here
        // console.log("req.user", req.user);
      });

    }
  })

});

userRouter.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {

    if (err) {
      next(err)
    }

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json')
      return res.json({ status: "JWT invalid", success: false, err: info })
    }
    else {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json')
      return res.json({ status: "JWT valid", success: true, user: user })
    }
  })(req, res, next);
})

// when the post route is executed first the passport.authenticate will be called.
// Only when authentication is suucessful the followint function will be executed.
// If there is an error in authentication passport.authenticate will automatically send back a replay to client about the failure that occured   
userRouter.post('/login', cors.corsWithOptions, (req, res, next) => {
  // Custom Callback
  passport.authenticate('local', (err, user, info) => {

    if (err) {
      next(err);

    }

    if (!user) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json')
      res.json({ success: false, status: "Login Unsuccessful", err: info })
    }

    // populates req.user which otherwise remains undefined
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        console.log("Error in req.login", err);
        res.json({ success: false, status: "Login Unsuccessful", err: 'Could not log in user' })
      } else {
        // req.user is populated here
        // console.log("req.user", req.user);

        var token = authenticate.getToken({ _id: req.user._id })
        //console.log(req.user + "\n\n------\n\n" + req.session);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json({ success: true, token: token, status: 'You are successfully logged in!' })

      }
    })


  })(req, res, next);


})

//Now, the session itself provides this method called destroy and when you call the destroy method, the session is destroyed and the information is removed from the server side pertaining to this session.
//So the clearCookie is a way of asking the client to remove the cookie and the cookie name is the session ID.
userRouter.get('/logout', cors.corsWithOptions, function (req, res, next) {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/')
  }
  else {
    var err = new Error("You are not logged in");
    res.statusCode = 403//forbidden operation
    next(err)
  }
})

module.exports = userRouter;
