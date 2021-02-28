const express = require('express');
const cors = require('cors');
const app = express();

// The whitelist contains all the origins that this server is willing to accept.
const whileList = ['http://localhost:3000', 'https://localhost:5000', 'https://react-confusion-resturant.herokuapp.com/',]
var corsOptionsDelegate = (req, callback) => {

    var corsOptions;
    if (whileList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {
            origin: true
        }
    }
    else {
        corsOptions = {
            origin: false
        }
    }

    callback(null, corsOptions)
};

// when I set origin is equal to true here, then my cors Module will reply back saying access control allow origin, and then include that origin into the headers with the access control allow origin key there.
// So that way my client side will be informed saying it's okay for the server to accept this request for this particular origin

// when you set origin to false, then the access controller allowOrigin will not be returned by my server site.

// So by calling this function here, corsOptionsDelegate here, we will check to see if the incoming request belongs to one of the whitelisted origins.

// Enables all cors request
exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);