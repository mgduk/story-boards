import React from 'react';
import Chapter from '../../../Chapter'

export default class Introduction extends Chapter {
  get pages() {
    const isTouchDevice = ('ontouchstart' in window);

    return [
      <div>
        <h1>{this.props.config.title}</h1>
        <p>We'll be telling the story together using a Trello board.</p>
        <p>Open your <a href={this.props.story.board.url}>‘{this.props.config.title}’ board</a> to get started <br />(open it in a Trello mobile app if you prefer).</p>
        <p>To move to the next page press <span className="icon-arrow-right2"></span></p>
        <div className="tips">
          <h2>Tips</h2>
          <ul>
            <li>Open your board on a different screen or <a href="https://trello.com/platforms">device</a> to see updates instantly and make it easy to move between the board and the story.</li>
            <li>To add pictures use your iPhone, iPad or Android device's camera then use the ‘Add Card to Trello’ sharing option on the photo. You'll need to have the free <a href="https://trello.com/platforms">Trello mobile app</a> installed.</li>
            <li>Alternatively, <a href="https://ifttt.com/do_camera">IFTTT's camera widget</a> makes it even easier to add a photo. It takes a bit of setting up, but it makes adding photos really fast — especially helpful if you're telling the story with a group.</li>
            <li>If your places/object/activity ideas don't work in the story, just rename the cards at any time!</li>
            {isTouchDevice
              ? <li>Swipe to go to the next page</li>
              : <li>Press <code>f</code> on your keyboard to go fullscreen, and the right arrow to move to the next page.</li>
            }
            <li>Read the story in a slightly hammy dramatic voice. And don't worry if you cry a little bit.</li>
          </ul>
        </div>
      </div>
    ,
      <div>
        { this.props.story.characters.length === 0 ?
          <div>
            <h1>First, our story needs some characters!</h1>
            <p className="hint hint--trello">Add three cards to the <a href={this.props.story.board.url}>{this.props.config.lists.characters.name} list</a> with names <br />— and photos too if you like!</p>
          </div>
          :
          <h1>Our fearless adventurers</h1>
        }
        <ul className="characters image-grid">
          { this.props.story.characters.map((character) =>
            <li key={character.name}>
              <h2>{character.name}</h2>
              <img alt={character.name} src={character.image || `https://api.adorable.io/avatars/184/${character.name}`} />
            </li>
          ) }
        </ul>
        { this.props.story.characters.length < 3 &&
          <p className="hint hint--trello">We'll need three characters for this story!</p>
        }
        { this.props.story.characters.length >= 3 && !this.props.story.characters.find(c => c.image) &&
          <p className="hint hint--trello hint--subtle">You can add photos of the characters to the cards if you want to</p>
        }
      </div>
    ,
      {
        canView: () => this.props.story.characters.length > 2,
        element:
          <div>
            <p>Now, open the “Chapters” card on the board.</p>
          </div>
      }
    ];
  }
}
