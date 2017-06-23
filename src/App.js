import React, { Component } from 'react';
import logo from './logo.svg';
import Trello from 'node-trello';
import _ from 'lodash';
import './App.css';
import Promise from 'bluebird';

const config = {
  appKey: "60db94aff65646366a560497b71ef281",
  apiToken: "f67b81813cbe020c250ba4120a7bdb8f172c58bea76fe051db9bc51294bb93ea",
  idBoard: 'VWy9rttF'
}

class App extends Component {
  constructor() {
    super();

    this.trello = Promise.promisifyAll(new Trello(config.appKey, config.apiToken));

    this.lists = {};

    // story elements
    this.state = {
      pagesLoaded: false,
      page: 0
    };

    window.trelloStory = this;

    // window.addEventListener('keydown', this.onWindowKeyDown.bind(this));
  }

  // onWindowKeyDown(ev) {
  //   if (ev.key === 'ArrowRight') {
  //     this.goToPage(this.state.page+1)
  //   }
  //   else if (ev.key === 'ArrowLeft') {
  //     this.goToPage(this.state.page-1)
  //   }
  // }

  componentWillMount() {
    this.initPages()
    .then(this.poll.bind(this))
    .then(() => {
      this.setState({pagesLoaded: true});
      setInterval(this.poll.bind(this), 2000);
    });
  }

  poll() {
    return this.updateLists()
    .then(this.updateCards.bind(this))
    .then(this.processData.bind(this))
  }

  initPages() {
    return Promise.map([
      {
        name: 'characters',
        title: 'Meet the Characters',
        props: {
          characters: () => this.state.characters
        }
      },
      {
        name: 'home',
        title: 'Once Upon a Time…',
        props: {
          location: () => this.state.homeLocation
        }
      },
      {
        name: 'end',
        title: 'The end!'
      }
    ], (data) =>
      Promise.all([ data, import(`./pages/${data.name}`)])
      .then(([data, template]) => {
        data.template = template.default;
        return data
      })
    )
    .then(pages => this.pages = pages)
  }

  updateLists() {
    return this.trello.getAsync(`/1/board/${config.idBoard}/lists`)
    .then((listData) => {
      this.lists = listData.reduce((obj, data) => {
        obj[data.name.toLowerCase().replace(/\W+/g, '')] = { id: data.id, cards: [] };
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

  findCard(listName, cardName) {
    const cards = this.getCards(listName);
    return cards.find(card => card.name.match(cardName))
  }

  updateCards() {
    const _this = this;
    return this.trello.getAsync(`/1/board/${config.idBoard}/cards`, {
      stickers: true,
      attachments: true,
      checklists: 'all'
    })
    .then((cardData) => {
      cardData.forEach((data) => {
        _this.findListById(data.idList).cards.push(data);
      });
    });
  }

  getAttachmentUrl(card, previewIndex = 3) {
    const attachment = card.attachments.find((a) => a.previews[previewIndex] != null)
    return attachment ? attachment.previews[previewIndex].url : null;
  }

  // Processing data

  processData() {
    let ref;
    if (this.lists['letsgo']) {
      const chaptersCard = this.findCard('letsgo', /story/i);
      if (!chaptersCard || chaptersCard.checklists.length === 0) {
        this.createChaptersCard();
      } else {
        let checkedIndex = _.findLastIndex(
          chaptersCard.checklists[0].checkItems,
          item => item.state === 'complete'
        )
        this.goToPage(checkedIndex != null ? checkedIndex + 1 : 0);
      }
    }
    this.setState({
      characters:
        this.getCards('characters').map((card) => {
          return {
            name: card.name,
            image: this.getAttachmentUrl(card)
          }
        }),
      homeLocation: (
          (ref = this.getCards('locations').find(card => card.name.match(/home: /i)))
           ? { name: ref.name.replace(/^home: /,''), image: this.getAttachmentUrl(ref) }
           : {}
        )
    });
  }

  createChaptersCard() {
    return this.trello.postAsync('/1/cards', {
      name: 'Let the Story begin…',
      idList: this.lists['letsgo'].id
    })
    .then(card =>
      Promise.all([
        card,
        this.trello.postAsync('/1/checklist', { idCard: card.id, name: 'Chapters' })
      ])
    )
    .then(([card, checklist]) =>
      Promise.each(this.pages.slice(0, this.pages.length-1), (page) =>
        this.trello.postAsync(`/1/checklists/${checklist.id}/checkItems`, {
          name: page.title
        })
      )
      .then(() => card)
    )
    .then(card =>
      this.trello.postAsync(`/1/cards/${card.id}/attachments`, {
        name: 'Book',
        url: 'https://media.giphy.com/media/11I8v5lE8uq79C/giphy.gif'
      })
    );
  }

  //

  goToPage(index) {
    if (index >= this.pages.length) {
      index = this.pages.length-1;
    }
    else if (index < 0) {
      index = 0
    }
    this.setState({ page: index })
  }

  getPageData(pageIndex) {
    const data = _.extend({
      name: '??',
      props: {}
    }, this.pages[pageIndex] || {});
    data.props = _.mapValues(data.props, (val, key) =>
      _.isFunction(val) ? val() : val
    );
    return data;
  }

  render() {
    if (this.state.pagesLoaded) {
      const page = this.getPageData(this.state.page);
      const PageTemplate = page.template;
      return (
        <div className="App">
          <PageTemplate {...page.props} />
        </div>
      );
    } else {
      return <div>Loading…</div>
    }
  }
}

export default App;
