import React from 'react';
import Chapter from '../Chapter'

export default class Introduction extends Chapter {
  get pages() {
    return [
      <div>
        <h1>Welcome to Story Board!</h1>
        <p>We'll be telling a story together. Open your Trello board to get started:</p>
        <p><a href={this.props.boardUrl}>{this.props.boardUrl}</a></p>
        <p>Then press the right arrow on your keyboard or press <span className="icon-arrow-right2"></span>.</p>
      </div>
    ,
      <div>
        { this.props.story.characters.length === 0 ?
          <div>
            <h1>First, our story needs some characters!</h1>
            <p className="hint hint--trello">Add three cards to the <a href={this.props.boardUrl}>{this.props.config.lists.characters.name} list</a> with names <br />— and photos too if you like!</p>
          </div>
          :
          <h1>Our fearless adventurers</h1>
        }
        <ul className="characters">
          { this.props.story.characters.map((character) =>
            <li key={character.name}>
              <h2>{character.name}</h2>
              <img alt={character.name} src={character.image || `https://api.adorable.io/avatars/184/${character.name}`} />
            </li>
          ) }
        </ul>
        { this.props.story.characters.length === 0 || this.props.story.characters.find(c => c.image)
          ? null
          : <p className="hint hint--trello hint--subtle">You can add photos of the characters to the cards too!</p>
        }
      </div>
    ,
      {
        canView: () => this.props.story.characters.length > 1,
        element:
          <div>
            <p>Now, open the “Chapters” card on the board.</p>
          </div>
      }
    ];
  }
}
