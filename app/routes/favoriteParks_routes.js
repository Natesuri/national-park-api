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

const checkFavoriteParksLength = favoriteParks => {
  console.log(`my list is`, favoriteParks)
  if (favoriteParks.list.length < 10) {
    console.log('less than 10')
    // if the user's favorite parks list is less than 10, concat defaultParks to their list
    return favoriteParks.list.concat(defaultParks)
      // remove duplicates
      .filter((current, index, self) => self.indexOf(current) === index)
      // and limit output to 10
      .slice(0, 10)
  } else {
    console.log('length 10 or greater')
    return favoriteParks.list.slice(0, 10)
  }
}

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
    // if `findById` is succesful, respond with 200 and "post" JSON
    .then(favoriteParks => res.status(200).json({ favoriteParks: favoriteParks }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// UPDATE
router.patch('/favoriteParks/:id/update', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  FavoriteParks.findById(req.params.id)
    .then(handle404)
    .then(favoriteParks => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, favoriteParks)
      return favoriteParks.update(req.body.favoriteParks)
    })
    .then(favoriteParks => res.status(200).json({ favoriteParks: favoriteParks }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// UPDATE
router.patch('/favoriteParks/:id/updateOne', requireToken, (req, res) => {
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
      console.log(favoriteParks)
      res.status(200).json({ favoriteParks: favoriteParks })
    })
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// DELETE
router.delete('/favoriteParks/:id/delete', requireToken, (req, res) => {
  FavoriteParks.findById(req.params.id)
    .then(handle404)
    .then(favoriteParks => {
      // throw an error if current user doesn't own `favoriteParks`
      requireOwnership(req, favoriteParks)
      User.findById(favoriteParks.owner)
        .then(user => {
          // changes the userFavorites key in User to null
          user.userFavorites = null
          return user.save()
        })
      // delete the favoriteParks ONLY IF the above didn't throw
      favoriteParks.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
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
      .then(checkFavoriteParksLength)
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

  FavoriteParks.create(req.body.favoriteParks)
    // respond to succesful `create` with status 201 and JSON of new "post"
    .then(park => {
      User.findById(req.body.favoriteParks.owner)
        .then(user => {
          user.userFavorites = park._id
          return user.save()
        })
      return park
    })
    .then(favoriteParks => {
      res.status(201).json({ favoriteParks: favoriteParks.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

module.exports = router
