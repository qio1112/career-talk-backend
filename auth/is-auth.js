/**
 * A middleware which checks if the user is logged in, checks the token
 */
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let token = req.headers.authorization; 
    if(!token) {
        // no such header
        const error = new Error('Not Authenticated!');
        error.statusCode = 401;
        throw error;
    }
    token = token.split(' ')[1]; // parse the header "Bearer sometoken"
    let decodedToken;
    try {
        // try to decode the token into json file (js object)
        decodedToken = jwt.verify(token, 'jwt_encode_secret_private_q2*d3-=314;3mffgi3reqwe355');
    } catch(err) {
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken) {
        const error = new Error('Not Authenticated.');
        error.statusCode = 401;
        throw error;
    }
    // set the decoded token into the request for the following middlewares being authorized
    req.userId = decodedToken.userId;
    next();
}