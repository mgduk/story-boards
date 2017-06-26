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
    const { story, friendCount, person } = this.storyHelpers;
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
        <p>{joinn(this.getNames('characters'))} were {this.getOne('feelings', 0).name || '_____'}!</p>
        {story.feelings.length === 0
          ? <p className="trello-hint">Add a card to the “Feelings” list to describe how they feel.</p>
          : this.getOne('feelings', 0).image ? <p><img src={this.getOne('feelings', 0).image} alt={this.getOne('feelings', 0).name}/></p> : null
        }
        {story.feelings.length > 0 &&
          <p>How were they going to get past the dragon to the castle?</p>
        }
      </div>
    ,
      {
        canView: () => this.props.story.feelings.length > 0,
        element:
          <div>
            <p>“The dragon looks hungry!” said {person(2)}.</p>
            <p>“I think it wants to eat us,” cried {person(1)}.</p>
            <p>{person(3)} noticed {this.getArticlized('foods', 2)} lying on the floor. Picking it up, {person(3)} threw it to the dragon. In one gulp he swallowed it down!</p>
            <p>“It's not enough — we need more food!” said {person(3)}.</p>
            {story.dragonFood.length === 0
              ? <p className="trello-hint">Add pictures of food to the ‘{this.props.config.lists.dragonFood.name}’ list — quickly!</p>
              : <ul className="dragon-food">
                  {story.dragonFood.filter(_.identity).map(food =>
                    <li key={food} onClick={this.onFoodClick.bind(this)}><img src={food} alt="Some food"/></li>
                  )}
                </ul>
            }
          </div>
        }
    ,
      {
        canView: () => this.state.foodClickCount >= this.props.story.dragonFood.length,
        element:
          <div>
            <p>The dragon greedily eats all the food thrown to it.</p>
            <p>The beast lets out a humongous BUUUURRRRB. It flaps its wings, lifts up into the air and flies away.</p>
            <p>As the {friendCount} friends let out a sigh of relief, there's a quiet metallic sound on the floor.</p>
            <p>“A coin!” says {person(3)}, stooping to look at it. “The dragon must have burped it out. I wonder if that will be useful later.”</p>
            {story.bag.indexOf('Gold coin') === -1 &&
              <p className="trello-hint">You can collect the coin by moving it to your ‘{this.props.config.lists.bag.name}’ list</p>
            }
          </div>
      }
    ];
  }
}
