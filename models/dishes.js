const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
})

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
});

module.exports = mongoose.model("dish", dishSchema)

// The timestamps allow you to have two different fields in the document: 
// the created at field and the updated at field, 
// both of which are timestamps stored in the form of an ISO date string in the document.

// The unique field specifies no two documeants can have the same value in this field (here name)

// The required field specifies that every document should contain the this field.

// The min and max field specify the minimum and maximum value of that field of type Number

//  So that Mongoose currency module adds a new type called as the currency type, which enables us to store a currency value.

// When you call mongoose.model() on a schema, Mongoose compiles a model for you.
// The first argument is the singular name of the collection your model is for. Mongoose automatically looks for the plural, lowercased version of your model name. Thus, for the example above, the model dish is for the dishes collection in the database.


