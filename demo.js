var request = require('request');

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

var requestData = {
  twitter: 'foxreymann',
  name: 'Fox Reymann',
  location: 'London, England'
}

// Configure the request
var options = {
    url: 'http://localhost:8080/score',
    method: 'POST',
    json: requestData
}

console.log('Feeding Web Truster with user data:');
console.log(requestData);
console.log('Web Truster is thinking!');
// Start the request
request(options, function (error, response, body) {
    //console.log(error);
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log('Web Truster replied with:');
        console.log(body)
    }
})
