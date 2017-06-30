import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';
import Promise from 'bluebird';
import qs from 'qs';
import moment from 'moment';
import Trello from './Trello';
import loading from './loading.svg';
import DognappedStory from './stories/dognapped';
Promise.config({ cancellation: true });


const stories = {
  dognapped: DognappedStory
};

const config = {
  // storybot
  botIdMember: "594c98dac441bfe6067dc3af",
  appKey: process.env.REACT_APP_APP_KEY,
  apiToken: process.env.REACT_APP_TOKEN,

  pollInterval: 2000,

  story: 'dognapped',
};


class App extends Component {

  get story() {
    return stories[config.story](this);
  }

  // the rest below here is unrelated to any one particular story

  constructor() {
    super();


    const userToken = this.getUserToken();
    this.idBoard = window.sessionStorage.getItem('idBoard');

    // it's fine if either param is null at this stage
    this.trello = new Trello(userToken, this.idBoard);

    if (userToken) {
      this.getMemberDetails();
      if (!this.idBoard) {
        this.getExistingBoards();
      }
    }

    this.lists = {};
    this.state = {
      authed: userToken,
      idBoard: this.idBoard,
      dataLoaded: false,
      chapter: 0,
      page: 0,
      pageCount: null,
      existingBoards: null,
    };

    const hashMatches = window.location.hash.match(/\b(\d+)\.(\d+)/);
    if (hashMatches) {
      this.firstChapter = Number(hashMatches[1]) - 1;
      this.firstPage = Number(hashMatches[2]) - 1;
    }
    this.firstLoad = true;

    window.addEventListener('keydown', this.onWindowKeyDown.bind(this));
    window.addEventListener('click', (ev) => {
      if (ev.target.tagName === 'A' && ev.target.href) {
        ev.preventDefault();
        window.open(ev.target.href);
      }
    });

    window.trelloStory = this;
  }

  getUserToken() {
    const token = window.sessionStorage.getItem('token') || (() => {
      const m = window.location.hash.match(/[#&]token=([a-f0-9]{64})(?=$|&)/);
      if (m) {
        const hash = window.location.hash.replace(m[0], '').replace(/[#]$/, '');
        this.setUrl(hash);
      }
      return m && m[1];
    })();
    if (token) {
      window.sessionStorage.setItem('token', token);
    }
    return token;
  }

  setBoardId(idBoard) {
    window.sessionStorage.setItem('idBoard', idBoard)
    this.idBoard = idBoard;
    this.trello.setIdBoard(idBoard);
    this.setState({ idBoard });
  }

  setBoard(board) {
    this.setBoardId(board.id)
    this.setState({ board: board });
    return board;
  }

  onWindowKeyDown(ev) {
    if (ev.key === 'ArrowRight') {
      this.goToPage(this.state.page+1);
    }
    else if (ev.key === 'ArrowLeft') {
      this.goToPage(this.state.page-1);
    } else if (ev.key === 'f' && this.state.dataLoaded) {
      document.body.webkitRequestFullscreen();
    }
  }

  setUrl(hash = null) {
    let url = `/`;
    if (hash == null && this.state && this.state.page != null) {
      hash = `${1+this.state.chapter}.${1+this.state.page}`;
    }
    if (hash) {
      url += `#${hash.replace(/^#/, '')}`;
    }
    window.history.replaceState({}, '', url);
  }

  componentWillMount() {
    if (!this.idBoard) return;
    this.loadInitialData()
  }

  getStoryBoardTitle() {
    return `${this.story.config.title} — a Story Board`;
  }

  createBoard() {
    return this.trello.post('/boards', { name: this.getStoryBoardTitle() })
    .then(this.setBoard.bind(this))
    .then(this.loadInitialData.bind(this))
  }

  loadInitialData() {
    this.initChapters()
    .then(this.poll.bind(this))
    .then(() => {
      this.setState({ dataLoaded: true, message: null, error: null });
      setInterval(this.poll.bind(this), config.pollInterval);
    })
    .catch(err => {
      if (/unauthorized permission requested/.test(err.message)) {
        this.setState({ message: 'Please add ‘storybot’ as a member of your board' });
        setTimeout(this.loadInitialData.bind(this), 5000);
      } else {
        this.setState({ error: err.message });
        throw err;
      }
    });
  }

  poll() {
    if (this.pendingUpdate) {
      let timeSinceUpdate = Date.now() - this.pendingUpdate.timeStart;
      if (timeSinceUpdate > 10000) {
        this.pendingUpdate.promise.cancel();
        delete this.pendingUpdate;
      } else {
        return;
      }
    }
    this.pendingUpdate = {
      promise: this.getTrelloData()
        .then(this.processData.bind(this))
        .then(() => delete this.pendingUpdate)
        .catch(this.catchPollingError.bind(this)),
      timeStart: Date.now()
    };
    return this.pendingUpdate.promise;
  }

  catchPollingError(err) {
    if (err.message === 'board not found') {
      this.setState({ error: "I can't see that board. Please check that you've added @storybot and that the URL is correct." });
    } else if (/unauthorized permission requested/.test(err.message)) {
      this.setState({ message: 'Please add ‘storybot’ as a member of your board' });
      setTimeout(this.loadInitialData.bind(this), 5000);
    } else {
      this.setState({ error: err.message });
      throw err;
    }
  }

  initChapters() {
    return Promise.map(this.story.config.chapters, (data) =>
      Promise.all([ data, import(`./stories/${config.story}/chapters/${data.name}`)])
      .then(([data, template]) => {
        data.template = template.default;
        return data
      })
      // there may not be a template. That's okay during development.
      .catch(() => data)
    )
    .then(chapters => this.chapters = chapters)
  }

  getTrelloData() {
    return this.trello.get(`/1/boards/${this.idBoard}`, {
      labels: 'all',
      lists: 'open',
      cards: 'visible',
      card_stickers: true,
      card_attachments: true,
      card_checklists: 'all',
      card_actions: 'createCard'
    })
    .then(board => {
      this.setBoard(board);
      this.parseLists(board.lists);
      this.parseCards(board.cards);
      this.parseLabels(board.labels);
    })
    .catch(() => { throw new Error('Unable to load board') });
  }

  parseLists(listData) {
    this.lists = listData.reduce((obj, data) => {
      const codename = _.findKey(this.story.config.lists, l => l.name.toLowerCase() === data.name.toLowerCase());
      const listConfig = this.story.config.lists[codename];
      if (codename) {
        obj[codename] = {
          id: data.id,
          cards: [],
          includeBotCards: listConfig.includeBotCards
        };
      }
      return obj;
    }, {});
  }

  parseLabels(labelData) {
    this.labels = labelData.reduce((labels, data) => {
      labels[data.color] = data.name;
      return labels;
    }, {});
  }

  findListById(id) {
    return _.find(this.lists, (list) => list.id === id);
  }

  getCards(listName) {
    const list = this.lists[listName];
    return list ? list.cards : [];
  }

  getCardNames(listName) {
    return this.getCards(listName).map(card => card.name.trim())
  }

  getCardNamesAndImages(listName) {
    return this.getCards(listName).map(card => ({
      name: card ? card.name.trim() : '_____',
      image: this.getAttachmentUrl(card)
    }));
  }

  getAttachmentUrl(card) {
    if (card == null) return null;
    const attachment = card.attachments.find((a) => a.previews[4] != null)
    return attachment ? attachment.previews[4].url : null;
  }

  findCard(listName, cardName) {
    const cards = this.getCards(listName);
    return cards.find(card =>
      _.isRegExp(cardName)
        ? card.name.match(cardName)
        : card.name.toLowerCase() === cardName.toLowerCase()
    )
  }

  parseCards(cardData) {
    cardData
    .map(card => [card, this.findListById(card.idList)])
    .filter(([card, list]) =>
      list && (list.includeBotCards ||
      // ignore cards storybot created
      !card.actions.find(({ type, idMemberCreator }) =>
        type === 'createCard' && idMemberCreator === config.botIdMember
      ))
    )
    .forEach(([card, list]) => list && list.cards.push(card));
  }

  // Processing data

  processData() {
    this.setState(this.story.parseTrelloData());
    return Promise.all([
      this.createLists(),
      this.createCards(),
      this.setLabels(),
      // either moves to a new chapter, or creates the chapter card:
      this.processChaptersState(),
    ]);
  }

  // auto-create lists when they can be created
  createLists() {
    const lists = _.map(
      this.story.config.lists,
      (config, codename) => _.extend(config, { codename })
    );
    return Promise.each(lists, ({ codename, name, cards, canBeCreated }) => {
      canBeCreated = canBeCreated || (() => true)
      if (this.lists[codename] == null && canBeCreated.call(this)) {
        const createList = this.trello.post(`/1/lists`, {
          idBoard: this.idBoard,
          name,
          pos: 'bottom'
        });
        if (cards) {
          createList.then(list =>
            Promise.map(cards, (card) =>
              this.createCard(_.extend(card, { idList: list.id }))
            )
          )
        }
        return createList;
      }
    });
  }

  // auto-create cards when they can be created
  createCards() {
    return Promise.each(_.values(this.story.config.cards), (cardData) => {
      const list = this.lists[cardData.list];
      // by default, cards won't be recreated if they exist anywhere on the board
      const scope = (cardData.unique === false) ? list.cards : this.state.board.cards;
      if (scope == null || scope.find((card) => card.name === cardData.name)) return;
      if (cardData.canBeCreated && cardData.canBeCreated()) {
        return this.createCard(cardData);
      }
    });
  }

  createCard(data) {
    if (!data.idList && data.list) {
      const list = this.lists[data.list]
      if (!list) return Promise.reject(new Error(`List ${data.list} not found`));
      data.idList = list.id
      delete data.list
    }
    if (!data.idList) return Promise.reject(new Error(`No list specified for createCard`));
    if (data.addBotMember) {
      data.idMembers = (data.idMembers || []).concat(config.botIdMember);
    }
    const createCard = this.trello.post('/1/cards', _.omit(data, 'attachment'));
    if (data.attachment) {
      createCard.then(card =>
        this.trello.post(`/1/cards/${card.id}/attachments`, data.attachment)
      )
    }
    return createCard;
  }

  // auto-create labels when they can be created
  setLabels() {
    const labels = _.map(this.story.config.labels, (label, color) => {
      label.color = color;
      return label;
    });
    return Promise.each(labels, (data) => {
      const { name, color, canBeCreated } = data;
      if (canBeCreated && !canBeCreated()) return;

      if (this.labels[color] == null) {
        return this.trello.post(
          `/1/board/${this.idBoard}/labels`,
          { name, color }
        );
      } else if (this.labels[color] !== name) {
        return this.trello.put(
          `/1/board/${this.idBoard}/labelNames/${color}`,
          { value: name }
        );
      }
    });
  }

  checkItemsInSequence(checklist) {
    const items = checklist.checkItems;
    return _.every(items, (thisItem, index) => {
      const lastItem = items[index-1]
      return !lastItem || (lastItem.state === 'complete' || thisItem.state === 'incomplete')
    });
  }

  processChaptersState() {
    if (this.lists.story) {
      this.chaptersCard = this.findCard(
        'story',
        this.story.config.cards.chapters.name
      );
      if (!this.chaptersCard || this.chaptersCard.checklists.length === 0) {
        return this.createChaptersCard();
      } else if (!this.checkItemsInSequence(this.chaptersCard.checklists[0])) {
        return Promise.all([
          this.trello.post(
            `/1/cards/${this.chaptersCard.id}/actions/comments`, {
              text: "You can't skip chapters!"
          }),
          this.updateChapterChecklist()
        ]);
      } else {
        let uncheckedIndex = _.findIndex(
          this.chaptersCard.checklists[0].checkItems,
          item => item.state === 'incomplete'
        )
        this.goToChapter(uncheckedIndex != null ? uncheckedIndex : 'last');
      }
    }
  }

  createChaptersCard() {
    if (this.creatingCard) return this.creatingCard;
    return this.creatingCard = this.createCard(this.story.config.cards.chapters)
    .then(card =>
      Promise.all([
        card,
        this.trello.post('/1/checklist', { idCard: card.id, name: 'Chapters' })
      ])
    )
    .then(([card, checklist]) => {
      this.trello.post(`/1/cards/${card.id}/attachments`, {
        name: 'Book',
        url: 'https://media.giphy.com/media/11I8v5lE8uq79C/giphy.gif'
      })
      return Promise.each(this.chapters, (chapter) =>
        this.trello.post(`/1/checklists/${checklist.id}/checkItems`, {
          name: chapter.title
        })
      )
    })
    .finally(() => this.creatingCard = false);
  }

  updateChapterChecklist() {
    if (this.chaptersCard == null || this.chaptersCard.checklists[0] == null) {
      return;
    }
    const checklist = this.chaptersCard.checklists[0];
    // hit & hope update each checkitem
    return Promise.map(this.chapters, (chapter, index) => {
      const checkItem = checklist.checkItems[index];
      const shouldBeChecked = index < this.state.chapter;
      const expectedState = shouldBeChecked ? 'complete' : 'incomplete';
      if (!checkItem || checkItem.state === expectedState) return;
      return this.trello.put(
        `/1/cards/${this.chaptersCard.id}/checklist/${checklist.id}/checkItem/${checkItem.id}/state`, {
        value: shouldBeChecked ? 'true' : 'false'
      })
    });
  }

  //

  areChapterPrerequisitesMet(index, silent = false) {
    return _.every(this.chapters.slice(0, index+1).map(chapter => {
      try {
        _.isFunction(chapter.canView) && chapter.canView();
        return true;
      } catch (err) {
        if (!silent) {
          this.trello.post(
            `/1/cards/${this.chaptersCard.id}/actions/comments`, {
              text: err.message
          });
        }
        return false;
      }
    }))
  }

  goToChapter(index) {
    switch (index) {
      case 'first': index = 0; break;
      case 'last': index = this.chapters.length - 1; break;
      default:
    }
    if (index >= this.chapters.length) {
      index = this.chapters.length-1;
    } else if (index < 0) {
      index = 0
    }
    if (this.currentChapter === index) return;

    if (!this.areChapterPrerequisitesMet(index)) {
      const backtrackTo = _.range(index-1, -1, -1).find(this.areChapterPrerequisitesMet.bind(this));
      this.goToChapter(backtrackTo);
      return this.updateChapterChecklist();
    }
    let pageIndex = this.firstLoad && this.firstChapter === index
      ? this.firstPage || 0
      : 0;
    this.setState({
      chapter: index,
      page: pageIndex,
      pageCount: null
    })
    this.firstLoad = false
    this.currentChapter = index;
  }

  goToPage(index) {
    const { pageCount } = this.state;
    if (pageCount < 2) return;

    if (index >= pageCount) {
      index = pageCount-1;
    }
    else if (index < 0) {
      index = 0;
    }
    if (this.canViewPage(index)) {
      this.setState({ page: index })
    }
  }

  canViewPage(index) {
    const fx = this.state.canViewPage[index];
    return !fx || fx();
  }

  movePage(delta) {
    this.goToPage(this.state.page + delta);
  }

  get chapter() {
    return this.getChapterData(this.state.chapter);
  }

  getChapterData(chapterIndex) {
    const data = _.extend({
      name: '??',
      props: {},
      pageCount: null
    }, this.chapters[chapterIndex] || {});
    data.props = _.mapValues(data.props, (val, key) =>
      _.isFunction(val) ? val() : val
    );
    data.props.story = _.omit(this.state, 'chapter', 'page');
    return data;
  }

  setPages(pages) {
    this.setState({
      pageCount: pages.length,
      canViewPage: _.map(pages, 'canView')
    })
    // if the current page's prerequisites aren't yet met, move back a page
    const page = pages[this.state.page];
    if (page && page.canView != null && !page.canView()) {
      this.setState({ page: Math.max(0, this.state.page - 1) })
    }
    this.forceUpdate()
  }

  startAuth() {
    window.location.href =
      'https://trello.com/1/authorize?' +
      qs.stringify({
        response_type: 'fragment',
        key: config.appKey,
        redirect_uri: window.location.href.replace(/#.*$/, ''),
        scope: 'read,write',
        name: 'Story Board',
        expiration: '1day'
      });
  }

  reset() {
    sessionStorage.clear()
    this.setUrl(false);
    window.location.reload();
  }

  getMemberDetails() {
    const fields = ['username', 'fullName', 'avatarHash'];
    const details = fields.reduce((obj, field) => {
      obj[field] = window.sessionStorage.getItem(field);
      return obj
    }, {});
    return (
      _.some(details, _.isNull)
        ? this.trello.get('/me', { fields: fields.join(',')})
        : Promise.resolve(details)
    )
    .then(details => {
      this.setState(details);
      return details;
    });
  }

  _dateFromObjectId(id) {
    return new Date(parseInt(id.substring(0, 8), 16) * 1000);
  }

  getExistingBoards() {
    return this.trello.get('/boards')
    .then(boards => {
      return Promise.all(
        boards
        .filter(board => board.name === this.getStoryBoardTitle())
        .map(board => Promise.all([
          board,
          this.trello.get(`/1/board/${board.id}/cards`, {
            idBoard: board.id,
            checklists: 'all'
          })
        ]))
      )
    })
    .then(boardAndCards =>
      boardAndCards.map(([board, cards]) => {
        const chaptersCard = cards.find(card =>
          card.name === this.story.config.cards.chapters.name && card.checklists.length === 1
        )
        if (chaptersCard) {
          const uncompletedChapters = chaptersCard.checklists[0].checkItems
            .map((item, index) => { item.index = index; return item; })
            .filter(item => item.state === 'incomplete')
          board.latestChapter = uncompletedChapters.shift()
        }
        board.date = moment(board.dateLastActivity).fromNow();
        return board
      })
    )
    .then(boards => _.sortBy(boards, 'dateLastActivity'))
    .then(existingBoards => this.setState({ existingBoards }));
  }

  existingBoardSubmit(ev) {
    ev.preventDefault()
    this.setBoardId(ev.target.idBoard.value);
    this.loadInitialData();
  }

  renderMessage() {
    return <div className="hint hint--trello"><p>{this.state.message}</p></div>
  }

  renderError() {
    return <div className="error">
      <p>{this.state.error}</p>
      <p>(that's an error, sorry)</p>
      <p><button className="button button--primary" onClick={this.reset.bind(this)}>Start Again</button></p>
    </div>
  }

  renderStory() {
    this.setUrl();

    const chapter = this.chapter;
    const ChapterTemplate = chapter.template;
    return <div className="App">
      { ChapterTemplate
        ? <ChapterTemplate
            {...chapter.props}
            config={this.story.config}
            title={chapter.title}
            page={this.state.page}
            setPages={this.setPages.bind(this)}
            movePage={this.movePage.bind(this)}
          />
        : <div>{chapter.title || `Chapter "${chapter.name}"`} has no pages</div>
      }
      {(this.state.page === this.state.pageCount-1) && (this.state.chapter < this.chapters.length-1) && (this.areChapterPrerequisitesMet(this.state.chapter+1, true)) &&
        <p className="hint hint--trello">Click the `{chapter.title}` check box on the Chapters card to finish this chapter and move onto the next one</p>
      }
      {this.state.pageCount > 1 &&
        <nav className="pagination">
          {this.state.page > 0
            ? <button className="page-change page-change--prev icon-arrow-left2" onClick={() => this.movePage(-1)} title="Go to previous page"></button>
            : <span className="page-change page-change--prev"></span>
          }
          <div className="pageNumber">
            <div>{this.story.config.title} chapter {this.state.chapter+1} ‘{chapter.title}’</div>
            <div>page {this.state.page+1} of {this.state.pageCount}</div>
            <div className="footer">
              <a className="open-board subtle-link" href={this.state.board.url}>Open Trello board</a>
              <button className="subtle-link" onClick={this.reset.bind(this)}>Save my place and sign out</button>
            </div>
          </div>
          {this.state.pageCount > this.state.page+1 && this.canViewPage(this.state.page+1)
            ? <button className="page-change page-change--next icon-arrow-right2" onClick={() => this.movePage(1)} title="Go to next page"></button>
            : <span className="page-change page-change--next"></span>
          }
        </nav>
      }
    </div>
  }

  renderSetup() {
    const { authed, loading, username, avatarHash, fullName, existingBoards } = this.state;
    const hasExistingBoards = !_.isEmpty(existingBoards)
    return <div className="splash">
      <h1>Story Board</h1>
      <p className="strapline">Interactive Storytrelling</p>

      {!authed &&
        <div>
          <p>To begin the story, we first need to connect to your Trello account.</p>
          <p>You'll use a Trello board to interact with this story.</p>
          <button className="button button--primary" onClick={this.startAuth.bind(this)}>Connect to Trello</button>
          <p className="small-print">
            This is safe and secure.
            The authorization token we obtain for your Trello account is stored in your browser and nowhere else. It is automatically cleared when you close your browser, or you can sign out at any time. None of the data in your Trello account will be accessed or changed, apart from the board we create for this story, and listing your existing boards to allow you to continue a story later.
            But if you don't want to trust a random website with your all the Trello-y goodness in your Trello account, why not just create a new Trello account just for this? They are free, afterall!
          </p>
        </div>
      }

      {loading && <div className="loading">Loading…</div>}

      {(authed && username) &&
        <div>
          <div className="trello-member">
            <h2>
              <img src="/images/trello-mark-white.png" alt="Trello"/>
              You're signed into Trello as
            </h2>
            {avatarHash && <img className="avatar" alt="" src={`https://trello-avatars.s3.amazonaws.com/${avatarHash}/50.png`} />}
            <span className="trello-fullName">{fullName}</span>
            <span className="trello-username">@{username}</span>
            <button className="button change-trello-account" onClick={this.reset}>Change</button>
          </div>
          {existingBoards === null && <div>Loading…</div>}

          {existingBoards !== null &&
            <div>
              <h2>{this.story.config.title}</h2>
              {!_.isEmpty(existingBoards) &&
                <form onSubmit={this.existingBoardSubmit.bind(this)} className="existing-stories">
                  <p>You have started this story before.</p>
                  {existingBoards.length === 1
                    ? <div>
                        <input name="idBoard" type="hidden" value={existingBoards[0].id} />
                        <button type="submit" className="button button--primary">Continue from {existingBoards[0].date}</button>
                        <p className="smaller">{existingBoards[0].latestChapter && existingBoards[0].latestChapter.index > 0
                            ? `You were up to chapter ${existingBoards[0].latestChapter.index+1} ‘${existingBoards[0].latestChapter.name}’`
                            : `You were at the beginning`
                          }</p>
                          <p className="small-print">You can remove an old story by closing the board in Trello.</p>
                      </div>
                    : <div>
                        <p>
                          Continue from&nbsp;
                          <select name="idBoard">
                            {existingBoards.reverse().map(board =>
                              <option key={`board${board.id}`} value={board.id}>
                                {board.latestChapter && board.latestChapter.index > 0
                                  ? `${board.date} (at chapter ${board.latestChapter.index+1} ‘${board.latestChapter.name}’)`
                                  : `${board.date} (at the beginning)`
                                }
                              </option>
                            )}
                          </select>?
                        </p>
                        <p><button type="submit" className="button button--primary">Continue the Story</button></p>
                        <p className="small-print">You can remove old stories by closing the boards in Trello.</p>
                      </div>
                  }
                </form>
              }
              <div>
                {hasExistingBoards
                  ? <button className="button" onClick={this.createBoard.bind(this)}>
                      Begin Story Again
                    </button>
                  : <button className="button button--primary" onClick={this.createBoard.bind(this)}>
                      Begin Story
                    </button>
                }
                <p className="smaller">This will create a new board in your Trello account called ‘{this.getStoryBoardTitle()}`<br/> and add Story Bot as a member of it.</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  }

  renderLoading() {
    return <div className="loading"><img src={loading} alt="Loading…" title="Loading…" /></div>
  }

  render() {
    if (this.state.message) {
      return this.renderMessage();
    } else if (this.state.error) {
      return this.renderError();
    } else if (this.state.dataLoaded) {
      return this.renderStory();
    } else if (!this.state.idBoard) {
      return this.renderSetup();
    } else {
      return this.renderLoading();
    }
  }
}

export default App;
