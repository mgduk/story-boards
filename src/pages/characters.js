import React, { Component } from 'react';

export default class Page extends Component {
  render() {
    return (
      <div className="page page-characters">
        <h1>Our fearless adventurers</h1>
        <ul className="characters">
          { this.props.characters.map((character) =>
            <li key={character.name}>
              <h2>{character.name}</h2>
              {character.image && <img src={character.image} />}
            </li>
          ) }
        </ul>
        { this.props.characters.length == 0 &&
          <p>Err… where are they?</p>
        }
      </div>
    )
  }
}
