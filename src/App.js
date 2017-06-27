import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';
import Promise from 'bluebird';
import qs from 'qs';
import Trello from './Trello';
import rp from 'request-promise';
Promise.config({ cancellation: true });

const config = {
  // storybot
  idMember: "594c98dac441bfe6067dc3af",
  appKey: process.env.REACT_APP_APP_KEY,
  apiToken: process.env.REACT_APP_TOKEN,
  coinImageUrl: 'https://cdn.glitch.com/59eb59af-6a74-424b-b78d-47a120942668%2Fcoin.jpg?1498515332815',
  keyImage1: 'https://cdn.pixabay.com/photo/2015/07/16/15/27/key-847830_960_720.jpg',
  keyImage2: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Standard-lock-key.jpg',
  keyImage3: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Ancient_warded_lock_key_transparent.png',

  pollInterval: 1000
};


class App extends Component {

  get data() {
    return {
      // These lists will be autocreated once canBeCreated returns true
      //  (or immediately if no `canBeCreated` is defined)
      lists: {
        story: {
          name: 'Story Board',
          // Normally, any cards created by this bot are ignored
          includeBotCards: true,
          cards: [
            {
              name: 'About this board',
              desc: "This Trello board is part of an interactive storytelling app called Story Board. Add cards to give your ideas for the story. Make choices in the story by changing things on this board.",
              idMembers: [config.idMember]
            }
          ],
        },
        characters: {
          name: 'Characters',
          cards: [
            {
              name: "Add three people's names to this list as separate cards. 👨🏾‍⚕️👩‍🔧👦🏼👩🏼 You can attach photos too, if you like!",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.chapter.name === 'introduction' && this.state.page >= 1,
        },
        places: {
          name: 'Places',
          cards: [
            {
              name: "Famous places or places near you — whatever you want",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.chapter.name === 'beginning'
        },
        activities: {
          name: 'Activities people might be doing',
          cards: [
            {
              name: "e.g. ‘swimming’ or ‘building a tower out of mattresses’",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.chapter.name === 'beginning'
        },
        objects: {
          name: 'Things you might find around the house',
          cards: [
            {
              name: "e.g. ‘a spoon’ or ‘football boot’",
              desc: "Ideally these are fairly small objects (so no ‘sofas’) which you can have one of (so no ‘dust’)",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.chapter.name === 'beginning'
        },
        foods: {
          name: 'Foods',
          cards: [
            {
              name: "e.g. ‘carrot cake’ (my favourite!)",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.chapter.name === 'beginning'
        },
        feelings: {
          name: 'Feelings',
          cards: [
            {
              name: "e.g. ‘happy’",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.chapter.name === 'dragon'
        },
        dragonFood: {
          name: 'Feed the Dragon!',
          cards: [
            {
              name: "We need to give the dragon food! Add pictures of food to this list!",
              desc: "Why not try drawing some food at http://www.autodraw.com",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.chapter.name === 'dragon' && this.state.page === 3
        },
        ground: {
          name: 'On the ground',
          cards: [
            {
              name: 'Gold coin',
              attachment: { url: config.coinImageUrl },
            }
          ],
          canBeCreated: () => this.chapter.name === 'dragon' && this.state.page === 4,
          includeBotCards: true
        },
        bag: {
          name: 'Bag',
          canBeCreated: () => this.chapter.name === 'dragon' && this.state.page === 4,
          includeBotCards: true
        },
        scareTroll: {
          name: 'Scare the Troll',
          canBeCreated: () => this.chapter.name === 'troll',
        },
        vendingMachine: {
          name: 'Key Vending Machine',
          canBeCreated: () => this.chapter.name === 'key' && this.state.page > 0,
          includeBotCards: true,
          cards: [
            {
              name: 'Key 1',
              desc: 'Cost: 3 gold coins',
              attachment: { url: config.keyImage1 }
            },
            {
              name: 'Key 2',
              desc: 'Cost: 3 gold coins',
              attachment: { url: config.keyImage2 }
            },
            {
              name: 'Key 3',
              desc: 'Cost: 3 gold coins',
              attachment: { url: config.keyImage3 }
            },
          ]
        }
      },

      // These cards will be created later on in the story
      cards: {
        chapters: {
          list: 'story',
          name: "Chapters",
          desc: "Check off each chapter once you've done it, to move the story onto the next chapter.\n\nNow, are you sitting comfortably? Then I'll begin…"
        },
        coin2: {
          list: 'ground',
          name: 'Gold coin',
          attachment: { url: config.coinImageUrl },
          canBeCreated: () =>
            this.chapter.name === 'inside-castle'
            && this.state.page === 5
            && this.lists.bag.cards.filter(card => card.name === 'Gold coin').length < 2
        },
        coin3: {
          list: 'ground',
          name: 'Gold coin',
          attachment: { url: config.coinImageUrl },
          canBeCreated: () =>
            this.chapter.name === 'troll'
            && this.state.page === 3
            && this.lists.bag.cards.filter(card => card.name === 'Gold coin').length < 3
        },
      },

      chapters: [
        {
          // title screen
          // create characters
          name: 'introduction',
          title: 'Introduction',
          props: {
            boardUrl: `https://trello.com/b/${this.idBoard}`
          }
        },
        {
          // The beginnng of the story
          // get a note about Taco being kidnapped
          name: 'beginning',
          title: 'Once Upon a Time…',
          canView: () => {
            if (this.state.characters.length < 2) {
              throw new Error('We need at least two characters for the story. Add some cards with names to the “Characters” list.');
            }
          }
        },
        {
          // fly to castle
          // see things on the way (combining contributed activities/objects/famous people)
          name: 'flight',
          title: 'Flight'
        },
        {
          // a dragon guards the bridge to the castle
          // draw food (Autodraw) to throw to the dragon, so we can slip past
          // Dragon burps out a coin
          name: 'dragon',
          title: 'Outside the Castle'
        },
        {
          // read map and write if statements for navigating the castle
          name: 'map',
          title: 'A Boy with a Plan'
        },
        {
          // nagivate around the castle, using the directions the kids
          // programmed previously
          // Find and collect a coin
          name: 'inside-castle',
          title: 'Within the Castle'
        },
        {
          // get to the door, but there's a troll!
          // It's ugly. Make enough ugly faces to scare it off.
          // the troll runs away crying for its mummy, dropping a coin
          name: 'troll',
          title: 'A Rather Large Problem'
        },
        {
          // There's a door — but it's locked!
          // Luckily, there's a key vending machine.
          // Enter the coins you've collected. Then use a sticker to choose a key.
          // (the key then appears on the story)
          // Hurray — it works!
          name: 'key',
          title: 'The Key Part of the Story'
        },
        {
          // meet Taco. Taco says “Roo!”
          // escape the castle and set Taco free
          // the friends go off to do [activity] and eat some nice [food — from Dragon list]
          name: 'rescue',
          title: 'The Way It Ends'
        }
      ]

    };
  }

  processStoryInput() {
    const nameAndImage = (card) => ({
      name: card ? card.name.trim() : '_____',
      image: this.getAttachmentUrl(card)
    });

    this.setState({
      characters: this.getCards('characters').map(nameAndImage),
      places: this.getCards('places').map(nameAndImage),
      activities: this.getCardNames('activities'),
      objects: this.getCardNames('objects'),
      foods: this.getCardNames('foods'),
      feelings: this.getCards('feelings').map(nameAndImage),
      dragonFood: this.getCards('dragonFood').map(this.getAttachmentUrl),
      bag: this.getCardNames('bag'),
      scaryFaces: this.getCards('scareTroll').map(this.getAttachmentUrl),
      vendingMachine: this.getCards('vendingMachine').map(card => ({
        name: card.name,
        stickers: card.stickers,
        imageUrl: this.getAttachmentUrl(card),
      })),
    });
  }

  // the rest below here is unrelated to any one particular story

  constructor() {
    super();

    this.idBoard = qs.parse(window.location.search.substring(1)).idBoard;

    this.trello = new Trello(config.appKey, config.apiToken);

    this.lists = {};
    this.state = {
      dataLoaded: false,
      chapter: 0,
      page: 0,
      pageCount: 1
    };

    const hashMatches = window.location.hash.match(/\b(\d+)\.(\d+)/);
    if (hashMatches) {
      this.firstChapter = Number(hashMatches[1]) - 1;
      this.firstPage = Number(hashMatches[2]) - 1;
    }
    this.firstLoad = true;

    window.addEventListener('keydown', this.onWindowKeyDown.bind(this));
    // expose for debugging console use
    window.trelloStory = this;
  }

  onWindowKeyDown(ev) {
    if (ev.key === 'ArrowRight') {
      this.goToPage(this.state.page+1);
    }
    else if (ev.key === 'ArrowLeft') {
      this.goToPage(this.state.page-1);
    }
  }

  setUrl() {
    let url = `/?idBoard=${this.idBoard}`;
    if (this.state.page != null) {
      url += `#${1+this.state.chapter}.${1+this.state.page}`;
    }
    window.history.replaceState({}, '', url);
  }

  componentWillMount() {
    if (!this.idBoard) return;
    this.loadInitialData()
  }

  loadInitialData() {
    this.initChapters()
    .then(this.loadBoard.bind(this))
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

  loadBoard() {
    return this.trello.get(`/1/boards/${this.idBoard}`)
    .then(board => this.board = board);
  }

  poll() {
    if (this.pendingUpdate) {
      let timeSinceUpdate = Date.now() - this.pendingUpdate.timeStart;
      if (timeSinceUpdate > 10000) {
        console.log('Cancelled very slow update');
        this.pendingUpdate.promise.cancel();
        delete this.pendingUpdate;
      } else {
        console.log('Waiting for slow update');
        return;
      }
    }
    this.pendingUpdate = {
      promise: this.updateLists()
        .then(this.updateCards.bind(this))
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
    return Promise.map(this.data.chapters, (data) =>
      Promise.all([ data, import(`./chapters/${data.name}`)])
      .then(([data, template]) => {
        data.template = template.default;
        return data
      })
      // there may not be a template. That's okay during development.
      .catch(() => data)
    )
    .then(chapters => this.chapters = chapters)
  }

  updateLists() {
    return this.trello.get(`/1/board/${this.idBoard}/lists`)
    .then((listData) => {
      this.lists = listData.reduce((obj, data) => {
        const codename = _.findKey(this.data.lists, l => l.name.toLowerCase() === data.name.toLowerCase());
        const listConfig = this.data.lists[codename];
        if (codename) {
          obj[codename] = {
            id: data.id,
            cards: [],
            includeBotCards: listConfig.includeBotCards
          };
        }
        return obj;
      }, {});
    });
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

  findCard(listName, cardName) {
    const cards = this.getCards(listName);
    return cards.find(card =>
      _.isRegExp(cardName)
        ? card.name.match(cardName)
        : card.name.toLowerCase() === cardName.toLowerCase()
    )
  }

  updateCards() {
    return this.trello.get(`/1/board/${this.idBoard}/cards`, {
      stickers: true,
      attachments: true,
      checklists: 'all',
      actions: 'createCard'
    })
    .then((cardData) => {
      cardData
      .map(card => [card, this.findListById(card.idList)])
      .filter(([card, list]) =>
        list && (list.includeBotCards ||
        // ignore cards storybot created
        !card.actions.find(({ type, idMemberCreator }) =>
          type === 'createCard' && idMemberCreator === config.idMember
        ))
      )
      .forEach(([card, list]) => list && list.cards.push(card));
    });
  }

  getAttachmentUrl(card) {
    if (card == null) return null;
    const attachment = card.attachments.find((a) => a.previews[4] != null)
    return attachment ? attachment.previews[4].url : null;
  }

  // Processing data

  processData() {
    this.processStoryInput();
    return Promise.all([
      this.createLists(),
      this.createCards(),
      // either moves to a new chapter, or creates the chapter card:
      this.processChaptersState(),
      // this.decorateCards(),
    ]);
  }

  // auto-create lists when they can be created
  createLists() {
    const lists = _.map(
      this.data.lists,
      (config, codename) => _.extend(config, { codename })
    );
    return Promise.each(lists, ({ codename, name, cards, canBeCreated }) => {
      canBeCreated = canBeCreated || (() => true)
      if (this.lists[codename] == null && canBeCreated()) {
        const createList = this.trello.post(`/1/lists`, {
          idBoard: this.board.id,
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
    return Promise.each(_.values(this.data.cards), (cardData) => {
      const list = this.lists[cardData.list];
      if (!list || list.cards.find((card) => card.name === cardData.name)) return;
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
    const createCard = this.trello.post('/1/cards', _.omit(data, 'attachment'));
    if (data.attachment) {
      createCard.then(card =>
        this.trello.post(`/1/cards/${card.id}/attachments`, data.attachment)
      )
    }
    return createCard;
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
        this.data.cards.chapters.name
      );
      if (!this.chaptersCard || this.chaptersCard.checklists.length === 0) {
        this.createChaptersCard();
      } else if (!this.checkItemsInSequence(this.chaptersCard.checklists[0])) {
        this.updateChapterChecklist();
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
    return this.creatingCard = this.createCard(this.data.cards.chapters)
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
      Promise.each(this.chapters, (chapter) =>
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
    Promise.map(this.chapters, (chapter, index) => {
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

  decorateCards() {
    if (this.lists.feelings && this.lists.feelings.cards.length) {
      return Promise.all(
        this.lists.feelings.cards.filter(card => card.attachments.length === 0)
        .map(card =>
          this.getGiphyImage(card.name)
          .then(giphy => {
            const url = _.get(giphy, 'data.images.fixed_height.url')
            if (url) {
              return this.trello.post(`/1/cards/${card.id}/attachments`, { url });
            }
          })
        )
      )
    }
  }

  getGiphyImage(name) {
    return rp.get(
      `http://api.giphy.com/v1/gifs/translate?api_key=dc6zaTOxFJmzC&s=${name}`,
      { json: true }
    )
  }

  //

  areChapterPrerequisitesMet(index) {
    return _.every(this.chapters.slice(0, index+1).map(chapter => {
      try {
        _.isFunction(chapter.canView) && chapter.canView();
        return true;
      } catch (err) {
        this.trello.post(
          `/1/cards/${this.chaptersCard.id}/actions/comments`, {
            text: err.message
        });
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
      return this.updateChapterChecklist();
    }
    let pageIndex = this.firstLoad && this.firstChapter === index
      ? this.firstPage || 0
      : 0;
    this.setState({
      chapter: index,
      page: pageIndex,
      pageCount: 1
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
      pageCount: 1
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
  }

  onBoardIdKeyUp(ev) {
    const regex = new RegExp('^(?:https://trello.com/b/)?([a-z0-9]{8})($|/| )', 'i');
    const matches = ev.target.value.match(regex);
    if (matches) {
      window.location.href = `?idBoard=${matches[1]}`;
    }
  }

  render() {
    if (this.state.message) {
      return <div className="hint hint--trello"><p>{this.state.message}</p></div>
    } else if (this.state.error) {
      return <div className="error">
               <p>{this.state.error}</p>
               <p>(that's an error, sorry)</p>
              </div>
    } else if (this.state.dataLoaded) {
      this.setUrl();
      const chapter = this.chapter;
      const ChapterTemplate = chapter.template;
      return (
        <div className="App">
          { ChapterTemplate
            ? <ChapterTemplate
                {...chapter.props}
                config={this.data}
                title={chapter.title}
                page={this.state.page}
                setPages={this.setPages.bind(this)}
                movePage={this.movePage.bind(this)}
              />
            : <div>{chapter.title || `Chapter "${chapter.name}"`} has no pages</div>
          }
          {(this.state.page === this.state.pageCount-1) && (this.state.chapter < this.chapters.length-1) &&
            <p className="hint hint--trello">Click the `{chapter.title}` check box on the Chapters card to finish this chapter and move onto the next one</p>
          }
          {this.state.pageCount > 1 &&
            <nav className="pagination">
              {this.state.page > 0
                ? <button className="page-change page-change--prev icon-arrow-left2" onClick={() => this.movePage(-1)} title="Go to previous page"></button>
                : <span className="page-change page-change--prev"></span>
              }
              <div className="pageNumber">
                <div>{chapter.title}</div>
                <div>page {this.state.page+1} of {this.state.pageCount}</div>
              </div>
              {this.state.pageCount > this.state.page+1 && this.canViewPage(this.state.page+1)
                ? <button className="page-change page-change--next icon-arrow-right2" onClick={() => this.movePage(1)} title="Go to next page"></button>
                : <span className="page-change page-change--next"></span>
              }
            </nav>
          }
        </div>
      );
    } else if (!this.idBoard) {
      return <div className="error">
        <h1>Story Board</h1>
        <p className="strapline">Interactive Storytrelling</p>

        <p>Add <em>@storybot</em> to an empty Trello board and paste the board URL here:</p>
        <input type="text" ref="idBoard" placeholder="e.g. https://trello.com/b/V8y9r5tF" onKeyUp={this.onBoardIdKeyUp} />
      </div>
    } else {
      return <div className="loading">Loading…</div>
    }
  }
}

export default App;
