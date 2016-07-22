const restify = require('restify');
const request = require('request');
const cheerio = require('cheerio');

class TwitterParser {
  constructor(host="www.twitter.com", protocol="https", basePath="/"){
    this.host=host;
    this.protocol=protocol;
    this.basePath=basePath
    this.twitterResult = {
      found: false,
      name: '',
      location:'',
      age: '',
      url: ''
    }
  }

  _parse(data) {
    const $ = cheerio.load(data)

    if ($('.ProfileHeaderCard').length) {
      this.twitterResult.found = true,
      this.twitterResult.name = $('.ProfileHeaderCard .ProfileHeaderCard-nameLink').text().trim()
      this.twitterResult.location = $('.ProfileHeaderCard .ProfileHeaderCard-location').text().trim()
      this.twitterResult.age = $('.ProfileHeaderCard .ProfileHeaderCard-joinDateText').attr('title').trim()
      this.twitterResult.url = $('.ProfileHeaderCard .ProfileHeaderCard-urlText').text().trim()
    }

    return this.twitterResult
  }
  parse(handle, callback) {
    let url = this.protocol + "://" + this.host + this.basePath + handle
    let me = this;
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(me._parse(body))
      } else {
        callback(me.twitterResult)
      }
    })

  }

}

const rules = [
  {
    condition: function() { return this.trustData.twitter.found },
    message: 'Twitter profile exists.',
    weight: function() { return 10 }
  },
  {
    condition: function() { return this.trustData.twitter.location },
    message: 'User location is provided on Twitter profile.',
    weight: function() { return 10 }
  },
  {
    condition: function() { return this.trustData.twitter.name },
    message: 'User name is provided on Twitter profile.',
    weight: function() { return 10 }
  },
  {
    condition: function() { return this.trustData.twitter.url },
    message: 'User has a website on Twitter profile.',
    weight: function() { return 10 }
  },
  {
    condition: function() { return this.userInput.name === this.trustData.twitter.name },
    message: 'User name on profile equals to name provided.',
    weight: function() { return this.userInput.name ? 10 : 0 }
  },
  {
    condition: function() { return this.userInput.location === this.trustData.twitter.location },
    message: 'User location on profile equals to location provided.',
    weight: function() { return this.userInput.name ? 10 : 0 }
  }
];

class ScoreComputer {
  constructor(userInput) {
    this.trustData = {};
    this.userInput = userInput;
  }

  getScore(callback) {
    this.callback = callback;
    let me = this;
    const twitter = new TwitterParser();
    twitter.parse(this.userInput.twitter, function(data){
      me.trustData.twitter = data;
      me._calculateScore(data).bind(me);
    });
  }

  _calculateScore() {
    let score = {
      actualScore: 0,
      possibleScore: 0
    }
    let response = {
      message: '',
      score: 0
    }
    for(let rule of rules) {
      const weight = rule.weight.bind(this)()
      const passed = rule.condition.bind(this)()
      score.possibleScore += weight
      score.actualScore += passed ? weight : 0
      response.message += passed ? rule.message + ' ' : ''
    }
    response.score = Math.round(score.actualScore / score.possibleScore * 100)
    this.callback(response)
  }
}


function respond(req, res, next) {
  const twitter = new TwitterParser();
  twitter.parse(req.params.name, function(data){
    // res.write(data)
    res.send(200, data)
    res.end()
  });

  next();
}

function getScore(req, res, next) {
  console.log(req.body);
  const scoreComputer = new ScoreComputer(req.body);
  scoreComputer.getScore(function(data) {
    res.send(200, data);
    res.end();
  });

  next();
}


const server = restify.createServer();

server.use(restify.CORS())
server.use(restify.bodyParser());
/* work around curl not closing http connection */
server.pre(restify.pre.userAgentConnection());

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);
server.post('/score/', getScore);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
