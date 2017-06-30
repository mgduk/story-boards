import React from 'react';
import Chapter from '../../../Chapter'
import joinn from 'joinn';
import _ from 'lodash';

export default class Troll extends Chapter {
  getScaryFacesElement() {
    return <ul className="scary-faces image-grid">
      {this.props.story.scaryFaces.filter(_.identity).map((imageUrl, index) =>
        <li key={`scary-face-${index}`}>
          <img src={imageUrl} alt="Be afraid. Be very afraid."/>
        </li>
      )}
    </ul>
  }

  get pages() {
    const { story } = this.props;
    const { friendCount, person, object, food, feeling } = this.storyHelpers;
    return [
      <div>
        <p>The troll is taller than two men. It's green with bulging muscles and a really, really ugly face. Really ugly.</p>
        <p>A half eaten {this.dearticlize(food(2))} falls from its slobbery mouth. In one hand, it holds {object(1, true)}. Nobody knows why.</p>
        <p>“Who goes there??” it bellows, its deep voice echoing in the stone passageway. “I smells humans. I likes eating humans.”</p>
      </div>
    ,
      <div>
        <p>“What do we do??” whispers {person(2)} to {joinn(_.without(_.map(story.characters, 'name'),person(2)))}.</p>
        <p>“He's a scary troll,” replies {person(0)}, “but if I know trolls — and I do know trolls — the only way to beat it is to be even scarier.”</p>
        {story.scaryFaces.length === 0
          ? <p className="hint hint--trello">Add your best scary faces to the ‘{this.props.config.lists.scareTroll.name}’ list.</p>
          : this.getScaryFacesElement()
        }
        {story.scaryFaces.length > 0 && story.scaryFaces.length < 3 &&
          <p className="hint">To scare this troll, we're going to need at least three scary faces!</p>
        }
      </div>
    ,
      {
        canView: () => this.props.story.scaryFaces.filter(_.identity).length >= 3,
        element:
          <div>
            {this.getScaryFacesElement()}
            <p>The troll looks at the faces. Its expression turns from anger to confusion to fear.</p>
            <p>With a little yelp like a kitten standing on a lego brick, the big, fat, ugly, smelly, uncouth troll runs away to find its mummy for a cuddle.</p>
          </div>
      }
    ,
      <div>
        <p>As the troll flees, a familiar metallic tinkling sound tells us that—in its fear—the troll has dropped a gold coin.</p>
        {story.bag.filter(name => name === 'Gold coin').length < 3 &&
          <p className="hint hint--trello">Collect the coin by moving it to your ‘{this.props.config.lists.bag.name}’ list</p>
        }
      </div>
    ,
      <div>
        <p>The {friendCount} dragon-feeding, boy-helping, robot-programming, castle-navigating, troll-scaring friends breath a collective sigh of relief.</p>
        <p>They felt {feeling(1).name}!</p>
        {story.feelings.length < 2
          ? <p className="hint hint--trello">Add a card to the “Feelings” list to describe how they feel.</p>
          : feeling(1).image ? <p><img src={feeling(1).image} alt={feeling(1).name}/></p> : null
        }
      </div>
    ,
      <div>
        <p>Boldly, {person(1)} walks up to the red door in front of them, takes hold of the handle and pulls.</p>
        <p>It doesn't move.</p>
      </div>
    ]
  }
}
