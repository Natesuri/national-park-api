'use strict'

// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
const fetch = require('node-fetch')

// pull in Mongoose model for posts
const ParksList = require('../models/parksList')
const User = require('../models/user')

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../lib/error_handler')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
// const requireOwnership = customErrors.requireOwnership

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// SHOW
// GET /posts/5a7db6c74d55bc51bdf39793
router.get('/parksList/:id', (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  ParksList.findById(req.params.id) // .populate('owner', 'nickname')
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "post" JSON
    .then(post => res.status(200).json({ post: post.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// EXPLORE PARKS
// GET PARK DATA FROM NPS API
router.get('/exploreParks/:id', (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  ParksList.findById(req.params.id)
    .then(handle404)
    .then(parksList => {
      // take list data, and form into comma seperated list
      const parks = parksList.list.toString()
      console.log(parks)
      // create a query to the NPS api using the park codes with the parksList
      return fetch(`https://api.nps.gov/api/v1/parks?parkCode=${parks}&fields=images`)
        // returns the response in json format
        .then(res => res.json())
        .catch(error => console.error(`error is `, error))
    })
    // adds the API response's data field (array of each park's data) to a parks object
    .then(parksData => res.status(200).json({ parks: parksData.data }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// CREATE
// POST /posts
router.post('/parksList', requireToken, (req, res) => {
  // set owner of new post to be current user
  req.body.parksList.owner = req.user.id

  ParksList.create(req.body.parksList)
    // respond to succesful `create` with status 201 and JSON of new "post"
    .then(park => {
      const parkId = park._id
      User.findById(req.body.parksList.owner)
        .then(user => {
          user.userList = parkId
          return user.save()
        })
      return park
    })
    .then(parksList => {
      res.status(201).json({ parksList: parksList.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

module.exports = router
