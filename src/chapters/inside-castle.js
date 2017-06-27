import React from 'react';
import Chapter from '../Chapter'
import joinn from 'joinn';
import _ from 'lodash';
import RobotBall from './inside-castle/RobotBall'

export default class InsideCastle extends Chapter {
  constructor(props) {
    super(props);
    this.robotBall = new RobotBall();
  }

  direction(landmark) {
    return this.robotBall.when(landmark) || 'ERROR';
  }

  get pages() {
    const { story } = this.props;
    const { friendCount, person } = this.storyHelpers;

    let countBasedTerm;
    switch (story.characters.length) {
      case 1: countBasedTerm = 'adventurer'; break;
      case 2: countBasedTerm = 'pair'; break;
      case 3: countBasedTerm = 'trio'; break;
      default: countBasedTerm = 'adventurers';
    }
    return [
        <div>
          <p>The large wooden door of the castle slams shut, and the {friendCount} friends are plunged into darkness.</p>
          <p>It is silent, except for the distant sound of people {this.getOne('activities',2)}. But that's probably not important for this story.</p>
          <p>{person(2)} places the robot ball on the ground and presses its button. With a whirr the robot ball lights up and sets off rolling down the corridor.</p>
        </div>
      ,
        <div>
          <p>The {friendCount} friends walk swiftly down the hallway after the ball. The sound of their footsteps echos off the cold stone walls.</p>
          <p>The ball reaches the end of the corridor, which continues to the left and the right.</p>
        </div>
      ,
        <div>
          <p>In front is a suit of armour. The robot ball's camera sees the armour and its screen lights up with the programmed instruction:</p>
          <p className="ball-screen">{this.direction('suit of armour')}</p>
          <p>The ball swivels left and sets off again, rolling quickly down the hallway. {joinn(_.map(story.characters, 'name'))} follow.</p>
        </div>
      ,
        <div>
          <p>Soon, they arrive in front of a large mirror. <br />The robot ball's screen lights up:</p>
          <p className="ball-screen">{this.direction('large mirror')}</p>
          <p>{joinn(['The ball'].concat(_.map(story.characters, 'name')))} turn right.</p>
        </div>
      ,
        <div>
          <p>The {countBasedTerm} continue down the cold, dark passageway, running along faster than the ball can go.</p>
          <p>Suddenly they get to a crossroads. They can turn left, right or continue straight on. “I think we should turn left” says {person(1)}. “That must be the way to the room where Taco is.”</p>
          <p>Just then, the robot ball rolls up. Its camera spots a painting of a tiger on the wall.</p>
          <p className="ball-screen">{this.direction('tiger painting')}</p>
          <p>“Wow — good thing we programmed that robot!”, says {person(1)}. <br />They continue on.</p>
        </div>
      ,
        <div>
          <p>It felt like they were going deeper and deeper into the castle. The ball rolling ahead, casting a faint light to guide the friends.</p>
          <p>In the darkness, {person(0)}'s foot kicks something small, causing a metallic tinkling noise. “That sounds like a coin!” says {person(0)}, feeling around on the floor in the gloom.</p>
          {story.bag.filter(name => name === 'Gold coin').length < 2 &&
            <p className="hint hint--trello">Collect the coin by moving it to your ‘{this.props.config.lists.bag.name}’ list</p>
          }
        </div>
      ,
        <div>
          <p>The ball's camera spots a chair up ahead, its screen lighting up once more.</p>
          <p className="ball-screen">{this.direction('chair')}</p>
          <p>As the adventurers turn that final corner, through the darkness they can make out a red door. “Hurray!” cries {person(0)}, relieved to have found it.</p>
          <p>But then, from out of the shadows lumbers a massive creature. The {friendCount} friends step back into the darkness, {person(2)} quickly catching and turning off the robot ball.</p>
        </div>
    ]
  }
}
