import _ from 'lodash';
import converter from 'number-to-words';
import capitalize from 'capitalize';
import lcfirst from 'lcfirst';
import joinn from 'joinn';

export default function(app) {
  const coinImageUrl = 'https://cdn.glitch.com/59eb59af-6a74-424b-b78d-47a120942668%2Fcoin.jpg?1498515332815';
  const coinName = 'Gold coin';
  const keyImage1 = 'https://cdn.pixabay.com/photo/2015/07/16/15/27/key-847830_960_720.jpg';
  const keyImage2 = 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Standard-lock-key.jpg';
  const keyImage3 = 'https://upload.wikimedia.org/wikipedia/commons/3/33/Ancient_warded_lock_key_transparent.png';

  const mapImageUrl = 'https://trello-attachments.s3.amazonaws.com/59562e0b1ec3e8344261e3c7/5956a5ce1adb1ac3651dae0b/074c259aa7eff97c502a788b8fddae5d/map.jpg';

  const countCoinsOnBoard = () =>
    app.state.board.cards.filter(card => card.name === coinName).length;

  return {
    config: {
      title: 'Dognapped!',

      chapters: [
        {
          // title screen
          // create characters
          name: 'introduction',
          title: 'Introduction'
        },
        {
          // The beginnng of the story
          // get a note about Taco being kidnapped
          name: 'beginning',
          title: 'Once Upon a Time…',
          canView: () => {
            if (app.state.characters.length < 2) {
              throw new Error('We need at least two characters for the story. Add some cards with names to the “Characters” list.');
            }
          }
        },
        {
          // fly to castle
          // see things on the way (combining contributed activities/objects/famous people)
          name: 'flight',
          title: 'Flight',
          canView: () => {
            const deficient = ['places', 'activities', 'objects', 'foods'].filter(name => app.state[name].length < 3);
            if (deficient.length > 1) {
              throw new Error(`We need at least three ${joinn(deficient)} for the story. Add your ideas on cards to ${deficient.length === 1 ? 'that list' : 'those lists'}.`);
            }
          }
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
          title: 'A Boy with a Plan',
          canView: () => {
            if (app.state.dragonFood.length < 2) {
              throw new Error('You need to add at least two cards with pictures of food to throw to the dragon!');
            }
          }
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
          title: 'A Rather Large Problem',
          canView: () => {
            if ((app.state.robotBall.find(c => c.name === `at chair`) || {}).direction !== 'turn right') {
              throw new Error("You need to carefully program that robot ball, otherwise there's no hope of finding Taco in that dark castle!");
            }
          }
        },
        {
          // There's a door — but it's locked!
          // Luckily, there's a key vending machine.
          // Enter the coins you've collected. Then use a sticker to choose a key.
          // (the key then appears on the story)
          // Hurray — it works!
          name: 'key',
          title: 'The Key Part of the Story',
          canView: () => {
            if (app.state.scaryFaces.length === 0) {
              throw new Error(`You ain't gonna get past this troll without at least three pictures of scary faces!`);
            }
            if (app.state.scaryFaces.length < 3) {
              throw new Error(`{capitalize(converter.toWords(app.state.scaryFaces.length))} faces does not a troll scare. Add at least three scary faces!`);
            }
          }
        },
        {
          // meet Taco. Taco says “Roo!”
          // escape the castle and set Taco free
          // the friends go off to do [activity] and eat some nice [food — from Dragon list]
          name: 'rescue',
          title: 'The Way It Ends',
          canView: () => {
            if (app.state.vendingMachine.filter(card => card.name === coinName).length < 3) {
              throw new Error(`Excuse me. You gotta pay for that there key, ya know. Put three gold coins in the vending machine list.`);
            }
            if (!app.state.vendingMachine.find(card => card.stickers.length > 0)) {
              throw new Error(`Choose a key by putting a sticker on it (click “Show Menu” at the top right)`);
            }
          }
        }
      ],


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
              addBotMember: true
            }
          ],
        },
        characters: {
          name: 'Characters',
          cards: [
            {
              name: "Add three people's names to this list as separate cards. 👨🏾‍⚕️👩‍🔧👦🏼👩🏼 You can attach photos too, if you like!",
              addBotMember: true
            }
          ],
          canBeCreated: () => app.chapter.name === 'introduction' && app.state.page >= 1,
        },
        places: {
          name: 'Places',
          cards: [
            {
              name: "Famous places or places near you — whatever you want",
              addBotMember: true
            }
          ],
          canBeCreated: () => app.chapter.name === 'beginning'
        },
        activities: {
          name: 'Activities people might be doing',
          cards: [
            {
              name: "e.g. ‘swimming’ or ‘building a tower out of mattresses’",
              addBotMember: true
            }
          ],
          canBeCreated: () => app.chapter.name === 'beginning'
        },
        objects: {
          name: 'Small things you might find around the house',
          cards: [
            {
              name: "e.g. ‘a spoon’ or ‘football boot’",
              desc: "Ideally these are things you could hold in your hand (so no ‘sofas’) which you can have one of (so no ‘dust’)",
              addBotMember: true
            }
          ],
          canBeCreated: () => app.chapter.name === 'beginning'
        },
        foods: {
          name: 'Foods',
          cards: [
            {
              name: "e.g. ‘carrot cake’ (my favourite!)",
              addBotMember: true
            }
          ],
          canBeCreated: () => app.chapter.name === 'beginning'
        },
        feelings: {
          name: 'Feelings',
          cards: [
            {
              name: "e.g. ‘happy’",
              addBotMember: true
            }
          ],
          canBeCreated: () => app.chapter.name === 'dragon'
        },
        dragonFood: {
          name: 'Feed the Dragon!',
          cards: [
            {
              name: "We need to give the dragon food! Add pictures of food to this list!",
              desc: "Why not try drawing some food at http://www.autodraw.com",
              addBotMember: true
            }
          ],
          canBeCreated: () => app.chapter.name === 'dragon' && app.state.page === 3
        },
        ground: {
          name: 'On the ground',
          cards: [
            {
              name: coinName,
              attachment: { url: coinImageUrl },
            }
          ],
          canBeCreated: () => app.chapter.name === 'dragon' && app.state.page === 4,
          includeBotCards: true
        },
        bag: {
          name: 'Bag',
          canBeCreated: () => app.chapter.name === 'dragon' && app.state.page === 4,
          includeBotCards: true
        },
        robotBall: {
          name: 'Robot Ball instructions',
          canBeCreated: () => app.chapter.name === 'map' && app.state.page === 5,
          includeBotCards: true,
          cards: [
            { name: 'at suit of armour' },
            { name: 'at large mirror' },
            { name: 'at tiger painting' },
            { name: 'at chair' },
          ]
        },
        scareTroll: {
          name: 'Scare the Troll',
          canBeCreated: () => app.chapter.name === 'troll',
        },
        vendingMachine: {
          name: 'Key Vending Machine',
          canBeCreated: () => app.chapter.name === 'key' && app.state.page > 0,
          includeBotCards: true,
          cards: [
            {
              name: 'Key 1',
              desc: 'Cost: 3 gold coins',
              attachment: { url: keyImage1 }
            },
            {
              name: 'Key 2',
              desc: 'Cost: 3 gold coins',
              attachment: { url: keyImage2 }
            },
            {
              name: 'Key 3',
              desc: 'Cost: 3 gold coins',
              attachment: { url: keyImage3 }
            },
          ]
        }
      },

      // These cards will be created later on in the story
      cards: {
        chapters: {
          list: 'story',
          // by default, a card can only exist once per board
          unique: false,
          name: "Chapters",
          desc: "Check off each chapter once you've completed it, to move the story onto the next chapter. (The story will tell you when.)\n\nNow, are you sitting comfortably? Then I'll begin…"
        },
        map: {
          list: 'bag',
          name: 'Map of inside the castle',
          attachment: { url: mapImageUrl },
          canBeCreated: () => app.chapter.name === 'map' && app.state.page === 3
        },
        coin2: {
          list: 'ground',
          unique: false,
          name: coinName,
          attachment: { url: coinImageUrl },
          canBeCreated: () =>
            app.chapter.name === 'inside-castle'
            && app.state.page === 5
            && countCoinsOnBoard() < 2
        },
        coin3: {
          list: 'ground',
          unique: false,
          name: coinName,
          attachment: { url: coinImageUrl },
          canBeCreated: () =>
            app.chapter.name === 'troll'
            && app.state.page === 3
            && countCoinsOnBoard() < 3
        },
      },

      labels: {
        green: {
          name: 'Turn left',
          canBeCreated: () => app.chapter.name === 'map' && app.state.page === 5,
        },
        yellow: {
          name: 'Turn right',
          canBeCreated: () => app.chapter.name === 'map' && app.state.page === 5,
        },
        orange: {
          name: 'Straight on',
          canBeCreated: () => app.chapter.name === 'map' && app.state.page === 5,
        },
      },

    },

    // Returns an object containing all the elements of the story that we are
    // getting from the board. This will be used as React state.
    parseTrelloData: function() {
      return {
        characters: app.getCardNamesAndImages('characters'),
        places: app.getCardNamesAndImages('places')
          .map(({ name, image }) => {
            if (name.match(/^(my|the|in|on|inside|under|behind|a|where)\b/i)) {
              name = lcfirst(name);
            }
            return { name, image };
          }),
        activities: app.getCardNames('activities', true).map(lcfirst),
        objects: app.getCardNames('objects', true).map(lcfirst),
        foods: app.getCardNames('foods').map(lcfirst),
        feelings: app.getCardNamesAndImages('feelings')
          .map(({ name, image }) => ({ name: lcfirst(name), image })),
        dragonFood: app.getCards('dragonFood')
          .map(app.getAttachmentUrl)
          .filter(_.identity),
        bag: app.getCardNames('bag'),
        robotBall: app.getCards('robotBall')
          .map(({ name, labels }) => ({
            name,
            direction: labels[0] != null ? labels[0].name.toLowerCase() : null
          })),
        scaryFaces: app.getCards('scareTroll')
          .map(app.getAttachmentUrl)
          .filter(_.identity),
        vendingMachine: app.getCards('vendingMachine').map(card => ({
          name: card.name,
          stickers: card.stickers,
          imageUrl: app.getAttachmentUrl(card),
        })),
      };
    }
  };
}
