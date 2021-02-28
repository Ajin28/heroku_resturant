var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var User = require('./models/user')
var config = require('./Config/keys')
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken')

var FacebookTokenStrategy = require('passport-facebook-token');
exports.facebookPassport = passport.use(new FacebookTokenStrategy(
    {
        clientID: config.facebookClientId,
        clientSecret: config.facebookClientSecret,
        fbGraphVersion: 'v3.0'
    },
    function (accessToken, refreshToken, profile, done) {
        User.findOne({ facebookId: profile.id }, function (err, user) {
            if (err) {
                return done(err, false)
            }
            else if (!err && user !== null) {
                return done(null, user)
            }
            else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err) {
                        done(err, false)
                    }
                    else {
                        done(null, user)
                    }
                })
            }
        });
    }
));



exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    function (jwt_payload, done) {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false)
            }

        })
    })
)

exports.verifyUser = passport.authenticate('jwt', { session: false })
exports.verifyAdmin = function (req, res, next) {
    if (req.user && req.user.admin === true) {
        next();
    }
    else {
        var err = new Error('You are not authorized to perform this operation!')
        err.status = 403
        next(err)

    }
}




// here there is nothing special about local keyword, it is just the name of the variable that is used to export the passport local authentication strategy configuration
// new LocalStrategy()  this is where the functions that are supported by the passport-local-mongoose comes to our help.
// So the local strategy will need to be supplied with the verify function.
// Inside this function we will verify the user.
// This verify function will be called with the username and password that passport will extract from our incoming request.
// Now in the incoming request for the LocalStrategy the username and password should be supplied in the body of the message in the form of a Json string.
// Again because we are using body-parser so that'll be added into the body of the message and then from there passport we'll retrieve that and then use that and supply the username and password as parameters to the verify function that we will supply to the LocalStrategy.
// Since we are using passport mongoose plugin, the mongoose plugin itself adds this function called User.authenticate() to our User schema and model.
// We're going to supply that as the function that will provide the authentication for the LocalStrategy.
// Now if you are not using passport-local-mongoose then you need to write your own user authentication function here

//Also since we are still using sessions to track users in our application, we need to serialize and deserialize the user.
// Now recall that the passport authenticate will mount the req.user or the user property to the request message and so that user information will be serialized and deserialized realized by using serializeUser and passport deserializeUser.
// These two functions they serialize user and deserialize user are provided on the user schema and model by the use of the passport-local-mongoose plugin here.

// jwt.sign (payload,secret,options)
//expiresIn : 3600 // means it will expire in 1 hour