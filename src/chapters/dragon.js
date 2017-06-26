import React from 'react';
import Chapter from '../Chapter'
import joinn from 'joinn';

export default class Dragon extends Chapter {
  get pages() {
    const { story, friendCount, person, object, place } = this.storyHelpers;
    return [
      <div>
        <p>The giant bird circled the castle, then came to a soft landing in front of the drawbridge that leads to the entrance.</p>
        <p>{joinn(this.getNames('characters'))} climbed down off the bird. {person(2)} gave it a pat and the bird wriggled with happiness, then flew off into the distance.</p>
        <p>The {friendCount} adventurers gazed up at the giant castle looming in front of them.</p>
      </div>
    ,
      <div>
        <p>Suddenly, a huge red dragon landed in front of them. THUD! Plumes of dust blew up around it.</p>
        <p>{joinn(this.getNames('characters'))} jumped back in fright.</p>
      </div>
    ,
      <div>
        <p>From the dragon's mouth came wisps of smoke. The smell of burning stung their noses.</p>
        <p>They were {this.getOne('feelings', 0).name || '_____'}!</p>
        {story.feelings.length == 0
          ? <p className="trello-hint">Add a card to the “Feelings” list to describe how they feel.</p>
          : this.getOne('feelings', 0).image ? <p><img src={this.getOne('feelings', 0).image} title={this.getOne('feelings', 0).name}/></p> : null
        }
        {story.feelings.length > 0 &&
          <p>How were they going to get past the dragon to the castle?</p>
        }
      </div>
    ];
  }
}
