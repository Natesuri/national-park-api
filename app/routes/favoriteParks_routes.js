'use strict'

// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
const fetch = require('node-fetch')

// pull in Mongoose model for posts
const FavoriteParks = require('../models/favoriteParks')
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
const requireOwnership = customErrors.requireOwnership

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

const defaultParks = ['bicy', 'elma', 'yose', 'dena', 'piro', 'acad', 'yell', 'amis', 'grca', 'jotr']

const checkFavoriteParksLength = favoriteParksList => (
  favoriteParksList.length < 10
    ? favoriteParksList.concat(defaultParks)
      // remove duplicates
      .filter((current, index, self) => self.indexOf(current) === index)
      // and limit output to 10
      .slice(0, 10)
    : favoriteParksList.slice(0, 10)
)

// Makes a request to the NPS api /parks endpoint.
const getParkData = (parkCodes) => (
  fetch(`https://api.nps.gov/api/v1/parks?parkCode=${parkCodes.toString()}&fields=images`)
    // returns the response in json format
    .then(res => res.json())
    .catch(error => console.error(`error is `, error))
)

// SHOW
router.get('/favoriteParks/:id', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  FavoriteParks.findById(req.params.id) // .populate('owner', 'nickname')
    .then(handle404)
    .then(favoriteParks => {
      // create a query to the NPS api using the parkCodes stores in favoriteParks.list
      return getParkData(favoriteParks.list)
    })
    // if `findById` is succesful, respond with 200 and "post" JSON
    .then(favoriteParksData => res.status(200).json({ favoriteParksData: favoriteParksData.data }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// UPDATE
router.patch('/favoriteParks/:id/updateOne', requireToken, (req, res) => {
  let favoriteParksId
  // req.params.id will be set based on the `:id` in the route
  FavoriteParks.findById(req.params.id)
    .then(handle404)
    .then(favoriteParks => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, favoriteParks)

      const newParksList = favoriteParks.list.includes(req.body.favoriteParks.list)
        ? favoriteParks.list.filter(current => current !== req.body.favoriteParks.list)
        : favoriteParks.list.concat(req.body.favoriteParks.list)

      favoriteParks.list = newParksList

      return favoriteParks.save()
    })
    .then(favoriteParks => {
      favoriteParksId = favoriteParks._id
      return getParkData(favoriteParks.list)
    })
    .then(favoriteParksData => {
      res.status(200).json({ favoriteParksId, favoriteParksData: favoriteParksData.data })
    })
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// EXPLORE PARKS
// GET PARK DATA FROM NPS API
router.get('/exploreParks/:id', (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  // if :id is not '0', check for the park by it's id
  req.params.id !== '0'
    ? FavoriteParks.findById(req.params.id)
      // function that adds common park to user's request in additional to the user's favorites
      .then(favoriteParks => checkFavoriteParksLength(favoriteParks.list))
      .then(parks => {
        // take list data, and form into comma seperated list
        // create a query to the NPS api using the park codes within the list data
        return getParkData(parks)
      })
      // adds the API response's data field (array of each park's data) to a parks object
      .then(parksData => res.status(200).json({ parks: parksData.data }))
      // if an error occurs, pass it to the handler
      .catch(err => handle(err, res))
    // if :id is '0', then query the NPS api with the default list.
    : getParkData(defaultParks)
      .then(parksData => res.status(200).json({ parks: parksData.data }))
      .catch(error => console.error(`error is `, error))
})

// CREATE
// POST /posts
router.post('/favoriteParks', requireToken, (req, res) => {
  // set owner of new post to be current user
  req.body.favoriteParks.owner = req.user.id
  let favoriteParksId

  FavoriteParks.create(req.body.favoriteParks)
    // respond to succesful `create` with status 201 and JSON of new "post"
    .then(favoriteParks => {
      User.findById(req.body.favoriteParks.owner)
        .then(user => {
          user.userFavorites = favoriteParks._id
          return user.save()
        })
      return favoriteParks
    })
    .then(favoriteParks => {
      favoriteParksId = favoriteParks._id
      return getParkData(favoriteParks.list)
    })
    .then(favoriteParksData => {
      res.status(201).json({ favoriteParksId, favoriteParksData: favoriteParksData.data })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

module.exports = router
