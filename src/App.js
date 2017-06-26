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
  appKey: "5a1ae77630022a5dfa099ad7c9406662",
  apiToken: "a87e7377fa46b60da287549f357fdc9cb09b5f9ec30a4035b30f8055054b9e94",
}

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
              name: "Add a few people's names to this list. 👨🏾‍⚕️👩‍🔧👦🏼👩🏼 You can attach photos too, if you like!",
              idMembers: [config.idMember]
            }
          ],
        },
        places: {
          name: 'Places',
          cards: [
            {
              name: "Famous places or places near you — whatever you want",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.state.characters.length > 1
        },
        activities: {
          name: 'Activities people might be doing',
          cards: [
            {
              name: "e.g. ‘swimming’ or ‘building a tower out of mattresses’",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.state.characters.length > 1
        },
        objects: {
          name: 'Things you might find around the house',
          cards: [
            {
              name: "e.g. ‘a chair’ or ‘football boot’",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.state.characters.length > 1
        },
        foods: {
          name: 'Foods',
          cards: [
            {
              name: "e.g. ‘carrot cake’ (my favourite!)",
              idMembers: [config.idMember]
            }
          ],
          canBeCreated: () => this.state.characters.length > 1
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
              attachment: {
                url: 'https://cdn.glitch.com/59eb59af-6a74-424b-b78d-47a120942668%2Fcoin.jpg?1498515332815'
              }
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
        keys: {
          name: 'Keys Vending Machine',
          canBeCreated: () => false,
        }
      },

      // These cards will be created later on in the story
      cards: {
        chapters: {
          list: 'story',
          name: "Chapters",
          desc: "Check off each chapter once you've done it. \n\nYou'll only be able to move on once you've completed all you need to in the current chapter!\n\nNow, are you sitting comfortably? Then I'll begin…"
        }
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
          prerequisites: () => {
            if (this.state.characters.length < 2) {
              throw new Error('We need at least two characters for the story. Add some cards with names to the “Characters” list.'
              )
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
        },
        {
          name: 'end',
          title: 'The end!'
        }
      ]

    };
  }

  processStoryInput() {
    const nameAndImage = (card) => ({
      name: card ? card.name.trim() : '_____',
      image: this.getAttachmentUrl(card)
    })

    this.setState({
      characters: this.getCards('characters').map(nameAndImage),
      places: this.getCards('places').map(nameAndImage),
      activities: this.getCardNames('activities'),
      objects: this.getCardNames('objects'),
      foods: this.getCardNames('foods'),
      feelings: this.getCards('feelings').map(nameAndImage),
      dragonFood: this.getCards('dragonFood').map(this.getAttachmentUrl),
      bag: this.getCardNames('bag'),
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
      this.goToPage(this.state.page+1)
    }
    else if (ev.key === 'ArrowLeft') {
      this.goToPage(this.state.page-1)
    }
  }

  setUrl() {
    let url = `/?idBoard=${this.idBoard}`;
    if (this.state.page != null) {
      url += `#${1+this.state.chapter}.${1+this.state.page}`
    }
    window.history.replaceState({}, '', url)
  }

  componentWillMount() {
    if (!this.idBoard) return;
    this.initChapters()
    .then(this.loadBoard.bind(this))
    .then(this.poll.bind(this))
    .then(() => {
      this.setState({dataLoaded: true});
      setInterval(this.poll.bind(this), 2000);
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
        console.log('Cancelled very slow update')
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

  getAttachmentUrl(card, previewIndex = 3) {
    if (card == null) return null;
    const attachment = card.attachments.find((a) => a.previews[previewIndex] != null)
    return attachment ? attachment.previews[previewIndex].url : null;
  }

  // Processing data

  processData() {
    this.processStoryInput();
    return Promise.all([
      this.createLists(),
      // either moves to a new chapter, or creates the chapter card:
      this.processChaptersState(),
      this.decorateCards(),
    ]);
  }

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
            Promise.each(cards, (card) => {
              const cardConfig = _.omit(_.extend(card, {
                idList: list.id
              }), 'attachment');
              const createCard = this.trello.post(`/1/cards`, cardConfig);
              if (card.attachment) {
                createCard.then(newCard =>
                  this.trello.post(`/1/cards/${newCard.id}/attachments`, card.attachment)
                )
              }
              return createCard;
            })
          )
        }
        return createList;
      }
    });
  }

  createCard(codename) {
    const data = this.data.cards[codename] || {};
    const list = this.lists[data.list]
    if (!list) return Promise.reject();
    data.idList = list.id
    delete data.list
    return this.trello.post('/1/cards', data);
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
    return this.creatingCard = this.createCard('chapters')
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
      Promise.each(this.chapters.slice(0, this.chapters.length-1), (chapter) =>
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
    if (this.lists.feelings.cards.length) {
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
        _.isFunction(chapter.prerequisites) && chapter.prerequisites();
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
    this.setState({
      chapter: index,
      page: this.firstLoad && this.firstChapter === index ? this.firstPage || 0 : 0,
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
  }

  onBoardIdKeyUp(ev) {
    const regex = new RegExp('^(?:https://trello.com/b/)?([a-z0-9]{8})($|/| )', 'i');
    const matches = ev.target.value.match(regex);
    if (matches) {
      window.location.href = `?idBoard=${matches[1]}`;
    }
  }

  render() {
    if (this.state.error) {
      return <div className="error">{this.state.error}</div>
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
          {this.state.pageCount > 1 &&
            <nav className="pagination">
              {this.state.page > 0
                ? <button className="page-change page-change--prev icon-arrow-left2" onClick={() => this.movePage(-1)} title="Go to previous page"></button>
                : <span className="page-change page-change--prev"></span>
              }
              <span className="pageNumber">{this.state.page+1} / {this.state.pageCount}</span>
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
