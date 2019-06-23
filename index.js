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

const rooms = []

function renderLayout(yield) {
  const source = fs.readFileSync('layout.hbs', 'utf8');
  return handlebars.compile(source)({yield: yield});
}

app.use(express.urlencoded());

app.get('/', function(req, res) {
  const source = fs.readFileSync('new.hbs', 'utf8');
  const template = handlebars.compile(source);

  res.send(renderLayout(
    template()
  ));
});

app.post('/', function(req, res) {
  const room = _.pick(req.body.task, 'name');
  room.slug = _.kebabCase(room.name);
  room.scoreboard = _.cloneDeep(scoreboard);

  rooms.push(room);

  res.redirect('/' + room.slug + '/share');
});

app.get('/:slug', function(req, res) {
  const slug = req.params.slug;
  const room = _.find(rooms, {slug});

  if (room) {
    const source = fs.readFileSync('show.hbs', 'utf8');
    const template = handlebars.compile(source);

    res.send(renderLayout(
      template({room})
    ));
  } else {
    res.send(404);
  }
});

app.get('/:slug/share', function(req, res) {
  const slug = req.params.slug;
  const room = _.find(rooms, {slug});

  if (room) {
    const source = fs.readFileSync('share.hbs', 'utf8');
    const template = handlebars.compile(source);

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
    const user = vote.user;
    const slug = _.get(vote, 'room.slug');
    const room = _.find(rooms, {slug: slug});
    const options = room.scoreboard.options;

    const option = _.find(options, {id: vote.optionId});
    const previousVoteOption = _.find(room.scoreboard.options, function(option) {
      return _.includes(option.users, user);
    });

    if (previousVoteOption) {
      const index = previousVoteOption.users.indexOf(user);
      if (index > -1) {
        previousVoteOption.users.splice(index, 1);
      }
    }
    
    option.users.push(user);

    const totalVotes = _.sum(_.map(options, function(option) {
      return option.users.length;
    }));

    io.to(slug).emit('updated', totalVotes, options);
  });
});

http.listen(3000, function() {
  console.log("listening on port 3000");
})