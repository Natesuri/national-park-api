01/25/19

# National Park Finder

Front End Repo: https://github.com/Natesuri/national-park-client

Backend Repo: https://github.com/Natesuri/national-park-api

Deployed Site: https://natesuri.github.io/national-park-client/#/

<img width="1680" alt="screen shot 2019-01-25 at 12 14 05 pm" src="https://user-images.githubusercontent.com/35355802/51761335-cd202880-209a-11e9-98d7-677e29baebf9.png">



#### About

The National Park Finder allows users to look through a set of national parks, learn more about them, see a few pictures from each park and add their favorite parks to a list if they choose to sign in.



#### Technologies Used

The National Park Finder front end uses React, CSS, and SASS. React is an ideal technology for this app because when the user changes which park to learn more about, the data can be quickly loaded from state to re-render the page.

The backend uses the remainder of the MERN stack: Mongo, Express, and Node.



#### Open-source Contribution

If anyone wants to contribute to the project, please fork and clone this repo, then run `npm instal`l to make sure the correct versions of all dependencies have been installed.

##### Possible Features to work on

- Current weather data for parks using lat /long.
- Driving duration from user's location to the park.
- Accessing the NPS `/alerts` and `/events` endpoints to show updates for Explored Parks.
-  Implement a quiz that will return "best fit" parks based on a user's answers.



#### Routes and endpoints

Park Routes

| Request type | Route                          | Action                                                       | Return if Successful             |
| ------------ | ------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| SHOW         | `/favoriteParks/:id`           | Fetches a user's favoriteParks                               | 200 / favoriteParks              |
| PATCH        | `/favoriteParks/:id/updateOne` | Adds or removes park from user's favoriteParks               | 204 / Updated favoriteParks      |
| POST         | `/favoriteParks`               | Creates a new favoriteParks item, and assigns it's id to user's userFavorites. | 201 / new favoriteParks          |
| SHOW         | `/exploreParks/:id`            | Gets a list of 10 parks. A combination of the user's and default parks | 204 / allParks and favoriteParks |

User Routes

### Authentication

| Request type | Route              | Action                  | Return if Successful         |
| ------------ | ------------------ | ----------------------- | ---------------------------- |
| POST         | `/sign-up`         | Creates a new user      | 201 / user object            |
| POST         | `/sign-in`         | Checks credentials      | 201 / user object with token |
| PATCH        | `/change-password` | Hashes new password     | 204                          |
| DELETE       | `/sign-out`        | Hashes stored Api Token | 204                          |


###  --- Previous Planning and Documentation ---


01/11/2019

## Planning and Documentation

### App

The National Parker Finder helps a user figure out what National Park to visit, and learn more about the parks they may want to visit.

The user can visit the site to learn more about the individual parks (v1), those parks nearest to them (v2), or take a quiz (v2 or v3) to help them sort the parks by certain user preferences. The user can either toggle through parks from a gallery style view with a brief description, or learn more about a park in another view. Down the line, the individual park views will display information about the current weather, how long it'll take the user to drive to the park, alerts from the NPS and more.

#### Third Party APIs

This app is not affiliated with the NPS, but uses the NPS API to collect data that is formatted and displayed to the user. In additon to the NPS API, the v3 app will also use a mapping / geocoding API(s), a weather API, and have social media integration. See some research on mapping and weather APIs in /NO LINK YET [this document]().

Currently planned APIs (as of 01/12/19):

- [National Park Service](https://www.nps.gov/subjects/developer/api-documentation.htm)
- Mapping: [MapBox](https://www.mapbox.com/api-documentation/)
  - Geocoding: None
- Weather: [Dark Sky](https://darksky.net/dev)
- Social Media: None

## User Stories

https://www.dropbox.com/s/pkw4v4prrq7n3io/User%20Stories%2020190111_153742%20sq.jpg?dl=0

#### Page Actions

##### v1

- Explore parks
- Learn more about individual park

##### v2

- Take A Quiz that sorts parks in order of preference

##### v3

- See What other users selected
- Do Social Media Stuff

#### User Resource (My List) Actions

##### v1

- CRUD the user's customized list
  - CREATE - Save the user's sorted park list
  - READ - View the user's sorted park list
  - UPDATE - Change the order of the list
  - DELETE - Get rid of the user's ordered list ( **v2**: and prompt them to retake the quiz)

#### Auth

##### v1

- Sign Up
- Sign In
- Change Password
- Sign Out

### Story Tree

https://www.dropbox.com/s/5ttmdql7od2t1nq/Story%20Tree%20v2%2020190111_164136.jpg?dl=0

**Lock Symbol Signifies Authenticated Route*

From Home a user can

- Sign In / Up
  - Once Signed in they can their Change Passwords
  - And Sign Out
- Take a quiz to sort the parks list
  - And then follow the Explore Parks route
- Explore the parks using a default listing.
  - Learn more about an individual park
  - Save their park list (if signed in)
  - View, rearrange or delete their park list (if signed in, and saved).
  - See a list of the most popular ("favorite") parks.

### ERD

https://www.dropbox.com/s/kicjgg0n8ycq6us/ERD%2020190111_164927%20copy.jpg?dl=0

The User's will have their authenication values as well as a lat/long of their current location

The Sorted park list, will contain the sorted list of parks, as determines by the user's actions while using the app. The sorted park list will have an owner key with the creating user in it.

Favortie Parks is a table that has no formal relationship to User or Sorted park list. Essentially, it will calculate the rankings of parks based on each park's postition on every user's Sorted Park List.
