01/11/2019

# Planning and Documentation

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

https://github.com/typora/typora-issues/issues/358 (fix image size)

![User Stories 20190111_153742 sq](/Users/natesuripro/Dropbox/GA/Project_4_NPS_Capstone/Documentation/User Stories 20190111_153742 sq.jpg)

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

![Story Tree v2 20190111_164136](/Users/natesuripro/Dropbox/GA/Project_4_NPS_Capstone/Documentation/Story Tree v2 20190111_164136.jpg)

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

![ERD 20190111_164927 copy](/Users/natesuripro/Dropbox/GA/Project_4_NPS_Capstone/Documentation/ERD 20190111_164927 copy.jpg)

The User's will have their authenication values as well as a lat/long of their current location

The Sorted park list, will contain the sorted list of parks, as determines by the user's actions while using the app. The sorted park list will have an owner key with the creating user in it.

Favortie Parks is a table that has no formal relationship to User or Sorted park list. Essentially, it will calculate the rankings of parks based on each park's postition on every user's Sorted Park List.
