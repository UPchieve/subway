UPchieve web server
===================

> Web server providing endpoints for the UPchieve web client

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

[Contributing Guide](CONTRIBUTING.md)

## GITLAB

NOTE: Active development on this project has moved to https://gitlab.com/upchieve/subway, no more pushes should go straight to the Github repo.

**Table of Contents**

- [Local Development](#local-development)
    - [Dependencies](#dependencies)
    - [Setup](#setup)
    - [Test Users](#test-users)
- [Structure](#structure)
    - [config.ts](#config)
    - [models](#models)
    - [router](#router)
    - [controllers](#controllers)
    - [services](#services)
- [Endpoints](#endpoints)
    - [POST /auth/login](#post-authlogin)
    - [GET /auth/logout](#get-authlogout)
    - [POST /auth/register/checkcred](#post-authregistercheckcred)
    - [POST /auth/register](#post-authregister)
    - [POST /auth/reset/send](#post-authresetsend)
    - [POST /auth/reset/confirm](#post-authresetconfirm)
    - [POST /auth/reset/verify](#post-authresetverify)
    - [GET /auth/partner/volunteer](#get-authpartnervolunteer)
    - [GET /auth/partner/student](#get-authpartnerstudent)
    - [GET /auth/partner/student/code](#get-authpartnerstudentcode)
    - [POST /api/session/new](#post-apisessionnew)
    - [POST /api/session/check](#post-apisessioncheck)
    - [POST /api/session/latest](#post-apisessioncheck)
    - [POST /api/training/questions](#post-apitrainingquestions)
    - [POST /api/training/score](#post-apitrainingscore)
    - [POST /api/calendar/save](#post-apicalendarsave)
    - [POST /api/feedback](#post-apifeedback)
    - [GET /api/user](#get-apiuser)
    - [PUT /api/user](#put-apiuser)
    - [GET /api/user/:id](#get-apiuserid)
    - [POST /api/volunteers](#post-apivolunteers)
    - [POST /api/volunteers/availability](#post-apivolunteersavailibility)
    - [POST /api/verify/send](#post-apiverifysend)
    - [POST /api/verify/confirm](#post-apiverifyconfirm)
    - [POST /moderate/message](#post-moderatemessage)
    - [POST /eligibility/check](#post-eligibilitycheck)
    - [GET /eligibility/school/search](#get-eligibilityschoolsearch)
    - [GET /eligibility/school/studentusers/:schoolUpchieveId](#get-eligibilityschoolstudentusersschoolupchieveid)
- [Worker](#worker)
    - [Jobs](#worker-jobs)

Local Development
-----------------
## docker-compose
Docker provides an alternative for local development. A docker-compose file exists, tied to Mongo. Here's how to work in docker-compose.

1. Build the container using the command `$ pack build upchieve/subway:local --builder heroku/buildpacks:20`
1. Navigate to this directory and run `mkdir mongo-volume` to create a directory for the MongoDB volume.
1. Run `cp config.example.ts config.ts` to copy the default config as your own config.
1. Run `docker-compose up` to launch the server.
1. After any change: Run `docker-compose down --rmi all` to destroy images and containers. Then run `docker-compose up` to see your changes.

Note: the default command ran when starting the server will populate/refresh all seed data, so any data changes to seed data will be overwritten.

## Without docker-compose
If not using docker-compose, follow these steps to start required components.

### Dependencies

The recommended tool for runtime version management is [`nvm`][nvm] and [`Docker`][Docker]. To use `nvm` on Windows, first install the appropriate Linux shell distribution using [`WSL`][wsl] (Windows Subsystem for Linux).

#### Local Node

We currently run on Node v12.20.0, you can switch to this using

```shell
$ nvm install v12.20.0 && nvm use v12.20.0
```

After switching npm versions using nvm, you will need to rerun `$ npm install`.

#### Mongo 4.2.3

Using a Volume (else data is not saved), pull and run docker image `mongo:4.2.3-bionic`. You can use any empty directory to which you have write access for your volume.

```shell-script
docker run -i --rm --name mongoContainer -p 27017-27019:27017-27019 -v <Absolute Path to directory on your drive>:/data/db mongo:4.2.3-bionic
```

#### Redis 5.0.8

Pull and run docker image `redis:5.0.8`. You can use any empty directory to which you have write access for your volume.

```shell-script
docker run -i --rm --name redis -p 6379:6379 -v <Absolute Path to directory on your drive>:/data -t redis:5.0.8
```

[wsl]: https://docs.microsoft.com/en-us/windows/wsl/install-win10
[nvm]: https://github.com/nvm-sh/nvm
[Docker]: https://www.docker.com/products/docker-desktop

### Setup
The below steps are tested on a Macintosh.

1. Confirm that Mongo and Redis container dependencies above are running.
1. Custom properties are currently required for the server to connect data sources on a desktop computer, so run or add to your profile the below commands.
    1. `export SUBWAY_REDIS_HOST=localhost`
    1. `export SUBWAY_DB_HOST=localhost`
1. Try connecting to your database container by running `mongo` (see Mongo dependency if this will not connect). Run `quit()` to exit the shell. You can also interface with the database using a free MongoDB GUI such as [MongoDB Compass Community](https://docs.mongodb.com/manual/administration/install-community/)
1. Run `npm install` to install the required dependencies.
1. Run `npx ts-node init` to seed the database with users, quiz questions, schools, and zip codes.
1. If you want to test Twilio voice calling functionality, set the `host` property to `[your public IP address]:3000` (minus the brackets), and configure your router/firewall to allow connections to port 3000 from the Internet. Twilio will need to connect to your system to obtain TwiML instructions.
1. Run `npm run dev` to start the dev server on `http://localhost:3000`. If you get a [`bcrypt`][bcrypt] compilation error, run `npm rebuild`.
1. See [the web client repo](https://github.com/UPchieve/web) for client
   installation.
1. (optional) Run `npm run worker:dev` to start the redis database and dev worker. The dev worker will automatically attempt to connect to your local Redis instance and read jobs from there. Additionally, you can run `ts-node ./scripts/add-cron-jobs.ts` to add all repeatable jobs to the job queue.

[bcrypt]: https://www.npmjs.com/package/bcrypt

## Test Users

The database is populated with the following users for local development:

| email                     | password      |
|:--------------------------|:--------------|
| `student1@upchieve.org`   | `Password123` |
| `volunteer1@upchieve.org` | `Password123` |
| `volunteer2@upchieve.org` | `Password123` |
| `volunteer3@upchieve.org` | `Password123` |

By default, none of the test users have an `approvedHighschool` set. The volunteers are all admins by default, and `volunteer1@upchieve.org` and `volunteer2@upchieve.org` have also passed all of their certifications. `volunteer3@upchieve.org` has not passed any quizzes.

Structure
---------

The root folder of the repository provides the bootstrap file `main.js` and a
package definitions file.

## Config

`config.ts` contains a map of configuration keys for running the server. All
keys and sensitive information should be placed in this file.

## Models

Model definitions that map to database models, along with related methods to act
on those models, such as parsing, validation, and data transformations.

## Router

Directory structure mimics the endpoint structure exposed by the server. Each
file provides one or more endpoint routes, responsible for request
acceptance/rejection and error handling.

## Controllers

Routes use controllers to perform the business logic of the server, providing
separation of concerns: the controllers have no need to be aware of how the
endpoints work. Instead, a controller provides ways to allow the routes to
trigger something (a user update, e.g.)

## Services

A service is a step higher than a controller. Services provide abstract
functions to one or many controllers, often to interface with third party
services.

Endpoints
---------

### POST /auth/login

Expects the following request body:

```json
{
  "email": "String",
  "password": "String"
}
```

Authenticates the user with a session if credentials are correct.

### GET /auth/logout

Removes the user's current session.

### POST /auth/register/checkcred

Check whether the credential user entered is valid. (first step of registration)
The server will check for email duplications and validate the password.

```json
{
  "email": "String",
  "password": "String"
}
```

Possible errors:

- Email/password not provided
- Password does not meet requirements
- Email is not valid
- Email already exists

### POST /auth/register

Create a new account based on the information posted.

```json
{
  "email": "String",
  "password": "String",
  "code": "String",
  "highSchool": "String",
  "firstName": "String",
  "lastName": "String"
}
```

Possible errors:

- Email/password not provided
- Password does not meet requirements
- Email is not valid
- Email already exists
- Could not hash password
- Could not send verification email (for volunteers)

### POST /auth/reset/send

```json
{
  "email": "String"
}
```

### POST /auth/reset/confirm

```json
{
  "email": "String",
  "password": "String",
  "newpassword": "String",
  "token": "String"
}
```

### POST /auth/reset/verify

```json
{
  "token": "String"
}
```

### GET /auth/partner/volunteer

Expects the following query string:

```
?partnerId=PARTNER_ID
```

where `PARTNER_ID` is the key name of the volunteer partner organization defined in `config.ts` under `volunteerPartnerManifests`.

Returns a volunteer partner manifest object.

### GET /auth/partner/student

Expects the following query string:

```
?partnerId=PARTNER_ID
```

where `PARTNER_ID` is the key name of the student partner organization defined in `config.ts` under `studentPartnerManifests`.

Returns a student partner manifest object.

### GET /auth/partner/student/code

Expects the following query string:

```
?partnerSignupCode=PARTNER_SIGNUP_CODE
```

where `PARTNER_SIGNUP_CODE` is equal to a `signupCode` defined in `config.ts` under `studentPartnerManifests`.

Returns a student partner manifest key name.

### POST /api/session/new

```json
{
  "sessionType": "String",
  "sessionSubTopic": "String"
}
```

### POST /api/session/check

```json
{
  "sessionId": "String"
}
```

### POST /api/session/check

```json
{
  "user_id": "String"
}
```

### POST /api/training/questions

```json
{
  "category": "String"
}
```

### POST /api/training/score

```json
{
  "idAnswerMap": "String",
  "category": "String"
}
```

### POST /api/calendar/save

```json
{
  "availability": {
    "Sunday": {
      "12a": "Boolean",
      "1a": "Boolean",
      ...
    },
    "Monday": {
      ...
    },
    ...
  },
  "tz": "String"
}
```

### POST /api/feedback

```json
{
  "sessionId": "String",
  "topic": "String",
  "subTopic": "String",
  "responseData": "String"
}
```

### GET /api/user

Returns a sanitized public user record for the currently authenticated user

### PUT /api/user

Accepts a request body with fields mapping to profile fields to update for the
currently authenticated user:

```json
{
  "phone": "String"
}
```

### GET /api/user/:id

Returns a sanitized public user record for a user with the given id. May perform
checks on the authorization level of the current user to strip out privileged
information.

### POST /api/volunteers

Returns an object with all the users who are volunteers. All the keys are user ids.

### POST /api/volunteers/availability

Returns a map with the availability of all the volunteers. All the keys are user ids.

### POST /api/verify/send

Sends an email to verify the current user with unique hash. The email provided
will overwrite the user record's email, in the event that the two do not match.

```json
{
  "email": "String"
}
```

### POST /api/verify/confirm

Accepts a token used to verify the current user.

```json
{
  "token": "String"
}
```

### POST /moderate/message

Expects the following request body:

```json
{
  "content": "string with the content of a message"
}
```

Returns a boolean indicating whether or not the message is
clean.

The response body looks like this if no error occurred:

```javascript
{
  "isClean": true // or false
}
```

### POST /eligibility/check

Expects the following request body:

```json
{
  "schoolUpchieveId": "String",
  "zipCode": "String",
  "email": "String"
}
```

### GET /eligibility/school/search

Expects the following query string:

```
?q=SEARCH_STRING
```

where `SEARCH_STRING` is the string to be searched.

Searches the database of schools for a name or `upchieveId` matching the search string. The search string may match only part of the school's name, but if searching for an `upchieveId` the string must match exactly.

If there are no errors, the response body contains the list of schools matching the search string in the format:

```javascript
{
  "results": [
    {
      "upchieveId": "UPchieve ID",
      "name": "high school name",
      "districtName": "district name",
      "city": "city name",
      "state": "state postal code"
    },
    // ...
  ]
}
```

Adds an email address to the list of email addresses to notify when the school is approved by UPchieve.

If no error occurred, the response body looks like:

```json
{
  "schoolId": "School's UPchieve ID"
}
```

Checks if a student is eligible for UPchieve based on their school and zip code. If no error occurs, the response looks like:

```javascript
{
  "isEligible": true // or false
}
```

### GET /eligibility/school/studentusers/:schoolUpchieveId

Lists all student users registered with a school. Restricted to admins only. If no error occurs, the response looks like:

```javascript
{
  "upchieveId": "8-digit identifier",
  "studentUsers": [
    {
      "email": "student@example.com",
      "firstname": "Firstname",
      "lastname": "Lastname",
      "userId": "user's ObjectID in MongoDB"
    },
    // ...
  ]
}
```

## Worker
A [Bull](https://github.com/OptimalBits/bull) worker reading from a local [Redis](https://redis.io/) database. Job definitions live in `worker/jobs` and are registered in `worker/jobs/index.ts`. A script `scripts/add-cron-jobs.ts` will insert all repeatable jobs into the local Redis database.

### Worker Jobs
- [Update Elapsed Availability](worker/jobs/updateElapsedAvailability.ts): updates all volunteers' elapsed availabilities every day at 4 am.
