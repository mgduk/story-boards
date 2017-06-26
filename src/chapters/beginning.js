import React from 'react';
import Chapter from '../Chapter'
import joinn from 'joinn';
import _ from 'lodash';

export default class Beginning extends Chapter {
  get pages() {
    const { friendCount, person, object, place } = this.storyHelpers;
    const ideasNeeded = () =>
      ['places', 'activities', 'foods', 'objects']
      .filter((type) => _.toArray(this.props.story[type]).length < 3)
    return [
      <div>
        <p>
          Once upon a time, {joinn(this.getNames('characters'))} were in <span className="highlight">{place(0)} </span>
          having a great time <span className="highlight">{this.getOne('activities', 0)}</span>.
        </p>
        <p>{person(1)} had just been given <span className="highlight">{object(0, true)}</span> as a birthday present and had brought it along.</p>
        <p>After a while the {friendCount} of them got tired and stopped to eat some <span className="highlight">{this.getOne('foods', 0)}</span>.</p>
        {ideasNeeded().length > 0 &&
          <div className="trello-hint">
            <p>We need your ideas!</p>
            <p>Add cards with at least three {joinn(ideasNeeded())} to the board.</p>
          </div>
        }
      </div>
    ,
      {
        canView: () => ideasNeeded().length === 0,
        element:
          <div>
            <p>Suddenly, {person(0)} heard a noise. “Up there!” shouted {person(1)}, spotting something.</p>
            <p>The {friendCount} friends looked up.</p>
            <p>Unfortunately for {person(2)}, at that very moment something was falling from the sky and landed—splat!—on {person(2)}'s face!</p>
          </div>
      }
    ,
      <div>
        <p>A giant bird with bright green feathers landed softly next to them.</p>
        <p>The goo dribbled down into {person(2)}'s mouth. {person(2)}'s expression turned from disgust to delight — “mmm, carrot cake,” {person(2)} said, now happily licking the cake off. “The bird must have been eating it and dropped some.”</p>
        <p>Around the neck of the giant green bird there was a rolled up piece of paper tied with string.</p>
      </div>
    ,
      <div>
        <p>{person(1)} took the paper and untied it. “It's a note!” exclaimed {person(1)}.</p>
        <p>“To whoever finds this note —  help! I've been dognapped and locked in a castle. Please come quickly and rescue me! Taco” [pawprint]</p>
        <p>“Someone's in trouble!” said {person(0)}. “Someone called ‘Taco’ who signed their note with a paw print.”</p>
      </div>
    ,
      <div>
        <p>The green bird ducked down, seemingly urging them to climb on.</p>
        <p>“Maybe this bird will take us to the castle” said {person(0)}. The three friends climbed carefully onto its feathery back.</p>
        <p>“Wait a moment!” cried {person(1)}, “I nearly forgot my {object(0)}.” {person(1)} swiftly jumped down, pick up the {object(0)}, and clambered back on.</p>
        <p>With two powerful beats of its wings, the giant giant bird took off into the air with the {friendCount} friends holding on tightly.</p>
        <p className="trello-hint">Tick the ‘{this.props.title}’ checkbox on the {this.props.config.cards.chapters.name} card to go to the next chapter.</p>
      </div>
    ]
  }
}
