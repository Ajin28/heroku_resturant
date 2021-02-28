const express = require('express')
const bodyParser = require('body-parser')
const commentRouter = express.Router();
const mongoose = require('mongoose');
const Dishes = require('../models/comment');
const Comments = require('../models/comment')
const authenticate = require('../authenticate');
const cors = require('./cors')

commentRouter.use(bodyParser.json());


commentRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Comments.find(req.query)
            .populate('author')
            .then((comments) => {

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(comments)

            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        if (req.body != null) {

            req.body.author = req.user.id;
            Comments.create(req.body)
                .then(comment => {
                    Comments.findById(comment._id)
                        .populate('author')
                        .then((comment) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json')
                            res.json(comment)
                        })
                })
                .catch((err) => { next(err) })
        }
        else {
            err = new Error('Comment not found i reques body');
            next(err);
        }

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /comments/');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Comments.remove({})
            .then((res) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(resp)

            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })

commentRouter.route("/:commentId")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(comment)

            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /comments/' + req.params.commentsId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .then((comments) => {
                if (comments != null) {
                    var id1 = comments.author;
                    var id2 = req.user._id;
                    if (id1.equals(id2) === false) {
                        var err = new Error("You are not authorized to update this comment!");
                        err.status = 403;
                        next(err)
                    }
                    else {
                        req.body.author = req.user._id;
                        Comments.findByIdAndUpdate(req.params.commentId,
                            { $set: req.body },
                            { new: true }
                        ).then((comment) => {
                            Comments.findById(comment._id)
                                .populate('author')
                                .then((comment) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json')
                                    res.json(comment)
                                })
                        })
                    }

                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found')
                    err.status = 404;
                    return next(err)
                }
            }, (err) => { next(err) })
            .catch((err) => { next(err) })

    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null) {
                    var id1 = comments.author;
                    var id2 = req.user._id;
                    if (id1.equals(id2) === false) {
                        var err = new Error("You are not authorized to delete this comment!");
                        err.status = 403;
                        next(err)
                    }
                    else {
                        Comments.findByIdAndRemove(comment._id)
                            .then((resp) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json')
                                res.json(resp)

                            })
                            .catch(err => {
                                next(err)
                            })
                    }

                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found')
                    err.status = 404;
                    return next(err)
                }
            }, (err) => { next(err) })
            .catch((err) => { next(err) })


    });

module.exports = commentRouter