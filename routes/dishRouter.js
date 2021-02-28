const express = require('express')
const bodyParser = require('body-parser')
const dishRouter = express.Router();
const mongoose = require('mongoose');
const Dishes = require('../models/dishes')
const authenticate = require('../authenticate');
const cors = require('./cors')

dishRouter.use(bodyParser.json())

//the dishRouter, it supports a method called route method, which can take in an endpoint as a parameter.
dishRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        //https:..../?featured=true
        Dishes.find(req.query)
            .populate('comments.author')
            .then((dishes) => {
                res.statusCode = 200;
                // Since we are going to be returning the value as a json, so we'll set that to application json
                res.setHeader('Content-Type', 'application/json')
                //So the res.json will take as an input a json string and then send it back as a json response.
                // It will put this dishes into the body of the reply message and then send it back to the server.
                res.json(dishes)
            }, (err) => { next(err) })
            .catch((err) => { next(err) })

        //So if an error is returned, then that'll simply pass off the error to the overall error handler for my application
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish Created ', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(dish)
            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.deleteMany({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(resp)
            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })

dishRouter.route("/:dishId")
    .options(cors.cors, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.corsWithOptions, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(dish)
            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, { $set: req.body }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(dish)
            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndDelete(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(resp)
            }, (err) => { next(err) })
            .catch((err) => { next(err) })


    });



module.exports = dishRouter;


