import React from 'react';
import converter from 'number-to-words';
import Chapter from '../Chapter'
import joinn from 'joinn';
import _ from 'lodash';
import NavigateCastle from './inside-castle/NavigateCastle'

export default class InsideCastle extends Chapter {
  constructor(props) {
    super(props);

    this.navigate = new NavigateCastle();
  }

  getTurn(landmark) {
    return this.navigate.what_do_we_do_when(landmark);
  }

  get pages() {
    const { story } = this.props;
    const friendCount = converter.toWords(story.characters.length);
    const person = (index) => this.getOne('characters', index, { name: '???' }).name
    return [
        <div>
          <p>{joinn(_.map(story.characters, 'name'))} run to the castle. With all their strength they push open the big wooden doors. CREEEAK.</p>
          <p>They walk nervously inside, unable to see as their eyes try to get used to the darkness.</p>
        </div>
      ,
        <div>
          <p>The {friendCount} friends start walking down the hallway. The sound of their footsteps echos off the cold stone walls.</p>
          <p>They reach the end of the corridor. It continues to the left and the right.</p>
          <p>“Which way do we go?” asked {person(1)}.</p>
        </div>
    ]
  }
}
