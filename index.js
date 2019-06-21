var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var _ = require('lodash')

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

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
    }
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
    }
  }
]

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
    // let previousVoteOption = _.find(room.scoreboard.options, {users: user});
    
    option.users.push(user);

    io.emit('updated', option);
  });
});

http.listen(3000, function() {
  console.log("listening on port 3000");
})