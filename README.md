*Yipeng Zhao, Personal Project*
# CareerTalk Node.js Back-end
## Project overview
The career talk is web application for college student users to get the information about career fairs happening in their schools and schedule talks of some chosen companies to reduce the time span of waiting in lines. Colleges can create school users to upload new career fairs with information of companies and talks. Career talk is a MEAN stack RESTful application. This is the node.js back-end of the application. Click the [link](https://github.com/qio1112/career-talk-frontend) to check the front-end.

The Career Talks is a MEAN stack application, the back-end is based on [Node.js](https://nodejs.org/en/) and uses [MongoDB](https://www.mongodb.com/) as database. [Express.js](https://expressjs.com/) and [mongoose](https://mongoosejs.com) are used to build the back-end code.

## Getting started
[Npm](https://www.npmjs.com/get-npm) is needed to run and modify the project. Run `npm install` for package installation. Run `npm start` to run the file `app.js` to start the back-end.

This application uses MongoDB atlas as database and Google Maps api for location search, so a MongoDB api-key and a Google Maps api-key are needed. To input the api-keys into the project, create a file called `apiKeys.js` at the root of the project, write the file as:
```
exports.mongoDBApiKey = '<YOUR API_KEY>';

exports.googleMapsApiKey = '<YOUR API_KEY>';
```
Change `'<YOUR API_KEY>'` to your api-keys respectively.

## Dependency
- [Node.js](https://nodejs.org/en/)  
The JavaScript based environment.
- [express.js](https://expressjs.com/)  
Web framework used for building the application.
- [mongoose](https://mongoosejs.com)  
Mongoose is a MongoDB modeling package for creating schemas of database storage and operating data in database.
- [nodemon](https://nodemon.io/)  
Nodemon is a development dependency which is used for the automatically reloading of the server.
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)  
The package bcryptjs provides the function of encryption and checking of the user passwords.
- [express-validator](https://express-validator.github.io/docs/)  
Express-validator provides the function of the server side validation of input forms.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)  
The package jsonwebtoken is used for creating the JWT (JSON web token) for the authorization of users' logging in status.
- [multer](https://www.npmjs.com/package/multer)  
Multer is used to parse multipart/formdata in http request bodies. It provides the function of uploading and downloading files.
- [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator)  
Mongoose-unique-validator is used for the uniqueness of some certain fields in mongoose schema.

## Introduction of files
### auth
`is-auth.js`:    
A middleware used for checking the logging in status of a user. Store the user id if logged in.
### routers
`careerfairRoutes.js`, `companyRoutes.js` and `userRoutes.js`:  
Routes relevant to career fairs, companies and users respectively. Link the routes with the corresponding functions in the controller files.
### controllers
`careerfairController.js`, `companyController.js`, `schoolController.js` and `userController.js`:  
Functions called when the server gets requests for database operations and data transformation.
### models
`careerfair.js`, `company.js`, `school.js`, `talk.js` and `user.js`:
Models for MongoDB database storage. These files stores the mongoose schemas.
