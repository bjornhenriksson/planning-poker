var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var handlebars = require('handlebars');
var fs = require('fs');

var rooms = [
  {
    slug: 'bosses-rum',
    scoreboard: {
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
    },
    users: [
      {
        token: 'abc123'
      },
      {
        token: 'deb123'
      }
    ]
  },
  {
    slug: 'ainas-rum',
    scoreboard: {
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
        }
      ]
    },
    users: [
      {
        token: 'mjao123'
      },
      {
        token: 'mjao1337'
      }
    ]
  }
]

function renderLayout(yield) {
  var source = fs.readFileSync('layout.hbs', 'utf8');
  return handlebars.compile(source)({yield: yield});
}

app.get('/room/:slug/:token', function(req, res) {
  var slug = req.params.slug;
  var token = req.params.token;

  var room = _.find(rooms, {slug});
  var user = _.find(room.users, {token});

  if (user) {
    var source = fs.readFileSync('show.hbs', 'utf8');
    var template = handlebars.compile(source);

    res.send(renderLayout(
      template({slug: slug, user: user})
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
    let user = vote.token;
    let room = _.find(rooms, {slug: _.get(vote, 'room.slug')});

    let option = _.find(room.scoreboard.options, {id: vote.optionId});
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

    let updates = [option];
    
    if (previousVoteOption) {
      updates.push(previousVoteOption);
    }

    io.emit('updated', updates);
  });
});

http.listen(3000, function() {
  console.log("listening on port 3000");
})