require('dotenv').config()
const _ = require('lodash');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const Trello = require('node-trello');
Promise.promisifyAll(Trello.prototype);

const app = express();
app.use(bodyParser.json());

const authed = {};

const config = {
  // storybot
  idBotMember: "594c98dac441bfe6067dc3af",
  appKey: process.env.REACT_APP_APP_KEY,
  apiToken: process.env.REACT_APP_TOKEN,
};

const botTrello = Promise.promisifyAll(new Trello(config.appKey, config.apiToken));

const getUserTrello = (userToken) => {
  return new Trello(config.appKey, userToken);
}
// Adds @storybot to the board using the user's token.
// This validates that the user has write access to the board, and allows us to
// perform other write actions as storybot.
const auth = (userToken, idBoard) => {
  const userTrello = getUserTrello(userToken);
  if (authed[userToken] != null && authed[userToken].indexOf(idBoard) != -1) {
    console.log('already authed');
    return Promise.resolve(userTrello);
  }
  console.log('checking auth');
  return userTrello.putAsync(
    `/1/boards/${idBoard}/members/${config.idBotMember}`,
    { idMember: config.idBotMember, type: 'normal'}
  )
  .then(() => {
    if (authed[userToken] == null) {
      authed[userToken] = [];
    }
    if (authed[userToken].indexOf(idBoard) == -1) {
      authed[userToken].push(idBoard);
    }
    return userTrello;
  });
};

const validateArgs = (args) => {
  return Promise.try(() => {
    if (!_.isString(args.idBoard) || _.isEmpty(args.idBoard)) {
      throw new Error('Invalid idBoard');
    }
    if (!_.isString(args.token) || !/^[a-f0-9]{64}$/.test(args.token)) {
      throw new Error('Invalid token');
    }
    return true;
  });
};

const errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ statusCode, error: message });
};

app.use(express.static(path.join(__dirname, '../../client/build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

app.get('/trello/boards', (req, res, next) => {
  const userTrello = getUserTrello(req.query.token);
  userTrello.getAsync(`/1/members/me/boards`, {
    organization: 'true',
    fields: 'name,dateLastActivity',
    filter: 'open',
  })
  .then(boards => {
    res.json(boards);
  })
  .catch(next);
});

app.get('/trello/me', (req, res, next) => {
  const userTrello = getUserTrello(req.query.token);
  userTrello.getAsync('/1/members/me', req.query)
  .then(res.json.bind(res))
  .catch(next);
});

app.post('/trello/boards', (req, res, next) => {
  Promise.try(() => {
    const name = req.body.name || `Story Board`;
    const userTrello = getUserTrello(req.query.token);
    const createBoard = (boardName) => {
      return userTrello.postAsync(`/1/boards`, {
        name: boardName,
        defaultLists: false,
        desc: 'Created by Story Board app — story-board.glitch.me'
      })
      .catch(err => {
        console.log('board create err', err);
      });
    };
    return createBoard(name);
  })
  .then(board => {
    res.json(board);
  })
  .catch(next);
});

app.all('/trello/*', (req, res, next) => {
  validateArgs(req.query)
  .then(() => auth(req.query.token, req.query.idBoard))
  .then((userTrello) => {
    let trello, query;
    const path = `/${req.params[0]}`;
    if (req.method == 'GET') {
      trello = userTrello;
      query = _.omit(req.query, 'idBoard', 'token');
      console.log('GET as user')
    } else {
      trello = botTrello;
      query = req.body;
      console.log(`${req.method} as bot`);
    }
    console.log(path, query);
    return trello[`${req.method.toLowerCase()}Async`](path, query);
  })
  .then(apiResponse => {
    res.json(apiResponse);
  })
  .catch(err => {
    if (err.statusCode == 401) {
      errorResponse(res, 401, "You don't have access to that board, or it doesn't exist");
    } else {
      throw err;
    }
  })
  .catch(next);
  // if first request for this token
  //   do a PUT /1/boards/[board_id]/members/[idMember] request with user's token on that board, to add storybot
  //
});

app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).send('Oh dear, something went a bit wrong.')
  }
});

app.listen(3001, () => console.log('Server listening on 3001'));
