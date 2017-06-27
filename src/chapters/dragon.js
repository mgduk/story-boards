import React from 'react';
import Chapter from '../Chapter'
import joinn from 'joinn';
import _ from 'lodash';

export default class Dragon extends Chapter {
  constructor(props) {
    super(props);
    this.state = {
      foodClickCount: 0
    }
  }

  onFoodClick(ev) {
    const foodClickCount = (this.state.foodClickCount || 0) + 1
    this.setState({ foodClickCount });
    ev.currentTarget.classList.add('clicked')
    if (foodClickCount >= this.props.story.dragonFood.length) {
      const audio = new Audio('/audio/burp.mp3');
      audio.play();
      audio.addEventListener('pause', () =>
        this.props.movePage(1)
      )
    }
  }

  get pages() {
    const { story, friendCount, person, feeling } = this.storyHelpers;
    return [
      <div>
        <p>The giant bird circles the castle, then comes to a soft landing in front of the drawbridge that leads to the entrance.</p>
        <p>{joinn(this.getNames('characters'))} climb down off the bird. {person(2)} gives it a pat and the bird wriggles with happiness, then flies off into the distance.</p>
        <p>The {friendCount} adventurers gaze up at the giant castle looming in front of them.</p>
      </div>
    ,
      <div>
        <p>Suddenly, a huge red dragon lands in front of them. <br />THUD!</p>
        <p>Plumes of dust plume up dustily.</p>
        <p>{joinn(this.getNames('characters'))} jump back in fright.</p>
      </div>
    ,
      <div>
        <p>From the dragon's mouth come wisps of smoke. The smell of burning stings their noses.</p>
        <p>{joinn(this.getNames('characters'))} were {feeling(0).name || '_____'}!</p>
        {story.feelings.length === 0
          ? <p className="hint hint--trello">Add a card to the “Feelings” list to describe how they feel.</p>
          : feeling(0).image ? <p><img src={feeling(0).image} alt={feeling(0).name}/></p> : null
        }
        {story.feelings.length > 0 &&
          <p>How are they going to get past the dragon to the castle?</p>
        }
      </div>
    ,
      {
        canView: () => this.props.story.feelings.length > 0,
        element:
          <div>
            <p>“That dragon looks hungry!” says {person(2)}.</p>
            <p>“I think it wants to eat us!” cries {person(1)}.</p>
            <p>{person(2)} notices {this.getArticlized('foods', 1)} lying on the floor. Picking it up, {person(2)} throws it to the dragon. In one gulp he swallows it down!</p>
            <p>“It's not enough — we need more food!” says {person(2)}.</p>
            {story.dragonFood.filter(_.identity).length === 0
              ? <p className="hint hint--trello">Add pictures of food to the ‘{this.props.config.lists.dragonFood.name}’ list — quickly!</p>
              : <ul className="dragon-food image-grid">
                  {story.dragonFood.filter(_.identity).map(food =>
                    <li key={food} onClick={this.onFoodClick.bind(this)}><img src={food} alt="Some food"/></li>
                  )}
                </ul>
            }
            {story.dragonFood.filter(_.identity).length > 0 && <p>Touch the food to throw it to the dragon</p> }
          </div>
        }
    ,
      {
        canView: () => this.props.story.dragonFood.length > 0 && this.state.foodClickCount >= this.props.story.dragonFood.length,
        element:
          <div>
            <p>The dragon greedily eats all the food thrown to it.</p>
            <p>The beast then lets out a humongous BUUUURRRRB, flaps its wings and lifts up into the air and away.</p>
            <p>As the {friendCount} friends let out a sigh of relief, there's a quiet metallic tinkling sound on the floor.</p>
            <p>“A coin!” says {person(0)}, stooping to look at it. “The dragon must have burped it out. I wonder if that will be useful later.”</p>
            {story.bag.indexOf('Gold coin') === -1 &&
              <p className="hint hint--trello">You can collect the coin by moving it to your ‘{this.props.config.lists.bag.name}’ list</p>
            }
          </div>
      }
    ,
      <div></div>
    ];
  }
}
