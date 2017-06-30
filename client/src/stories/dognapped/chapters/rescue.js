import React from 'react';
import Chapter from '../../../Chapter'
import joinn from 'joinn';
import capitalize from 'capitalize';
import taco from './rescue/taco-paws.svg';

export default class Rescue extends Chapter {
  get pages() {
    const { friendCount, person, place } = this.storyHelpers;
    return [
      <div>
        <p>{joinn(this.getNames('characters'))} walk into the bright room, their eyes struggling to adjust to the light.</p>
        <p>In a corner, on the dusty floor, lay a grey and white husky dog, snoring peacefully.</p>
        <p>“Taco!” cried {person(2)}. “We're so pleased to see you!”</p>
      </div>
    ,
      <div>
        <p>Taco woke up and looked at {joinn(this.getNames('characters'))}.</p>
        <p>A great big husky smile spread across his great big husky face.</p>
        <p>
          <img className="taco" src={taco} alt="Taco" />
        </p>
        <p>“Roo!” howled Taco happily, rushing up to his {friendCount} rescuers and licking them in a way that clearly meant he was very thankful for all the effort they'd gone to in rescuing him and would like to be their friend forever.</p>
      </div>
    ,
      <div>
        <p>As {joinn(this.getNames('characters'))} and their new friend Taco walk happily away from the castle, the giant green bird lands gracefully beside them.</p>
        <p>“Where shall we go now?” wonders {person(0)}.</p>
        <p>“We could go anywhere! Let's all go somewhere that the fun and excitement will never end,” says {person(2)}.</p>
        <p>“And where dogs are allowed, of course,” adds {person(1)}, rubbing Taco's head.</p>
        <p>“I know the perfect place,” says {person(2)}.</p>
      </div>
    ,
      <div>
        <p>“{capitalize(place(2))}.”</p>
        <p>
          <img src="/images/taco-head.png" alt="Taco" className="taco" />
        </p>
        <p>“Roooo!”</p>
      </div>
    ,
      <div>
        <h1>The end</h1>
        <p className="subtle">Story and app written by Matt Dolan.</p>
        <p className="subtle">Powered by Trello which is free to use at <a href="https://trello.com">trello.com</a> and on mobile apps.</p>
      </div>
    ]
  }
}
