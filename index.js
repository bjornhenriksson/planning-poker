const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const _ = require('lodash');
const handlebars = require('handlebars');
const fs = require('fs');

const scoreboard = {
  options: [
    {
      id: 1,
      score: 0,
      users: []
    },
    {
      id: 2,
      score: 0.5,
      users: []
    },
    {
      id: 3,
      score: 1,
      users: []
    },
    {
      id: 4,
      score: 2,
      users: []
    },
    {
      id: 5,
      score: 3,
      users: []
    },
    {
      id: 6,
      score: 5,
      users: []
    },
    {
      id: 7,
      score: 8,
      users: []
    },
    {
      id: 8,
      score: 13,
      users: []
    }
  ]
}

const polls = []

app.engine('hbs', function(filePath, options, callback) {
  fs.readFile(filePath, 'utf8', function(err, source) {
    if (err) return callback(err);
    const template = handlebars.compile(source);

    fs.readFile('views/layout.hbs', 'utf8', function(err, layout) {
      return callback(null, handlebars.compile(layout)({yield: template(options)}));
    });
  });
});

app.set('views', './views');
app.set('view engine', 'hbs');
app.use(express.urlencoded());

app.get('/', function(req, res) {
  res.render('new');
});

app.post('/', function(req, res) {
  const poll = _.pick(req.body.task, 'name');
  poll.slug = _.kebabCase(poll.name);
  poll.scoreboard = _.cloneDeep(scoreboard);

  polls.push(poll);

  res.redirect('/' + poll.slug + '/share');
});

app.get('/:slug', function(req, res) {
  const slug = req.params.slug;
  const poll = _.find(polls, {slug});

  if (poll) {
    res.render('show', {poll});
  } else {
    res.send(404);
  }
});

app.get('/:slug/share', function(req, res) {
  const slug = req.params.slug;
  const poll = _.find(polls, {slug});

  if (poll) {
    res.render('share', {poll});
  } else {
    res.send(404);
  }
});

io.on('connection', function(socket) {
  console.log("someone connected");

  function results(poll) {
    poll.scoreboard.totalVotes = _.sum(_.map(poll.scoreboard.options, function(option) {
      return option.users.length;
    }));

    return poll;
  }

  socket.on('join', function(poll) {
    console.log("wants to join poll", poll)
    socket.join(poll);

    io.to(poll).emit('results', results(_.find(polls, {slug: poll})));
  });

  socket.on('vote', function(vote) {
    const user = vote.user;
    const slug = _.get(vote, 'poll.slug');
    const poll = _.find(polls, {slug: slug});
    const options = poll.scoreboard.options;

    const option = _.find(options, {id: vote.optionId});
    const previousVoteOption = _.find(options, function(option) {
      return _.includes(option.users, user);
    });

    if (previousVoteOption) {
      const index = previousVoteOption.users.indexOf(user);
      if (index > -1) {
        previousVoteOption.users.splice(index, 1);
      }
    }
    
    option.users.push(user);
    io.to(slug).emit('results', results(poll));
  });
});

http.listen(3000, function() {
  console.log("listening on port 3000");
})