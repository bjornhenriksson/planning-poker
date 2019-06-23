var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var handlebars = require('handlebars');
var fs = require('fs');

var scoreboard = {
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

var rooms = []

function renderLayout(yield) {
  var source = fs.readFileSync('layout.hbs', 'utf8');
  return handlebars.compile(source)({yield: yield});
}

app.use(express.urlencoded());

app.get('/', function(req, res) {
  var source = fs.readFileSync('new.hbs', 'utf8');
  var template = handlebars.compile(source);

  res.send(renderLayout(
    template()
  ));
});

app.post('/', function(req, res) {
  var room = _.pick(req.body.task, 'name');
  room.slug = _.kebabCase(room.name);
  room.scoreboard = _.cloneDeep(scoreboard);

  rooms.push(room);

  res.redirect('/' + room.slug + '/share');
});

app.get('/:slug', function(req, res) {
  var slug = req.params.slug;
  var room = _.find(rooms, {slug});

  if (room) {
    var source = fs.readFileSync('show.hbs', 'utf8');
    var template = handlebars.compile(source);

    res.send(renderLayout(
      template({room})
    ));
  } else {
    res.send(404);
  }
});

app.get('/:slug/share', function(req, res) {
  var slug = req.params.slug;
  var room = _.find(rooms, {slug});

  if (room) {
    var source = fs.readFileSync('share.hbs', 'utf8');
    var template = handlebars.compile(source);

    res.send(renderLayout(
      template({room})
    ));
  } else {
    res.send(404);
  }
});

io.on('connection', function(socket) {
  console.log("ssomne connected");

  socket.on('join', function(room) {
    console.log("wants to join room", room)
    socket.join(room);

    io.to(room).emit('roomData', _.find(rooms, {slug: room}));
  });

  socket.on('vote', function(vote) {
    let user = vote.user;
    let slug = _.get(vote, 'room.slug');
    let room = _.find(rooms, {slug: slug});
    let options = room.scoreboard.options;

    let option = _.find(options, {id: vote.optionId});
    let previousVoteOption = _.find(room.scoreboard.options, function(option) {
      return _.includes(option.users, user);
    });

    if (previousVoteOption) {
      let index = previousVoteOption.users.indexOf(user);
      if (index > -1) {
        previousVoteOption.users.splice(index, 1);
      }
    }
    
    option.users.push(user);

    let totalVotes = _.sum(_.map(options, function(option) {
      return option.users.length;
    }));

    io.to(slug).emit('updated', totalVotes, options);
  });
});

http.listen(3000, function() {
  console.log("listening on port 3000");
})