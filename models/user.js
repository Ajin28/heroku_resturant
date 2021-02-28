var mongoose = require('mongoose');
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')
var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: {
        type: String
    },
    //username and password added by passportLocalMongoose
    admin: {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);
// So, this will automatically as I said adding support for username and hashed storage of the password using the hash and salt and adding additional methods on the user schema and the model which are useful for passport authentication.


module.exports = mongoose.model('user', User);