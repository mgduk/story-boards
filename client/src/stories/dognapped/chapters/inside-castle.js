import React from 'react';
import Chapter from '../../../Chapter'
import joinn from 'joinn';
import _ from 'lodash';

export default class InsideCastle extends Chapter {
  direction(landmark) {
    return (
      this.props.story.robotBall.find(c => c.name === `at ${landmark}`)
      || { direction: '???' })
    .direction
  }

  resolveDirection(landmark, turns) {
    return turns[_.camelCase(this.direction(landmark))] ||
      <div>
        <p>The ball lets out a tiny bleep then freezes, unable to understand the instruction.</p>
        {this.changeLabelHint(landmark)}
      </div>
  }

  changeLabelHint(landmark) {
    return <p className="hint hint--trello">That instruction was wrong! Check the map (it's in your bag) and change the label on the ‘at {landmark}’ card.</p>
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

    // These are just to avoid using strings everywhere — we'll get an error for
    // a mistyped variable name, but not for a mistyped string!
    const suitOfArmour = 'suit of armour';
    const largeMirror = 'large mirror';
    const tigerPainting = 'tiger painting';
    const chair = 'chair';
    const turnLeft = 'turn left';
    const turnRight = 'turn right';
    const straightOn = 'straight on';

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
          <p className="ball-screen">{this.direction(suitOfArmour)}</p>
          {this.resolveDirection(suitOfArmour, {
            turnLeft:
              <p>The ball swivels left and sets off again, rolling quickly down the hallway. {joinn(_.map(story.characters, 'name'))} follow.</p>,
            turnRight:
              <div>
                <p>The ball swivels right and sets off, rolling quickly down the hallway. BUMP! In the darkness it hits a dead end.</p>
                <p>{person(2)} picks up the ball and walks back to the suit of armour, feeling confused and lost in the gloom.</p>
                {this.changeLabelHint(suitOfArmour)}
              </div>,
            straightOn:
              <div>
                <p>The ball continues straight on, directly into the suit of armour! With a tremendous crash the metal suit collapses to the ground.</p>
                <p>The {friendCount} friends freeze, afraid that someone will come to find out what made the noise.</p>
                {this.changeLabelHint(suitOfArmour)}
              </div>
          })}
        </div>
      ,
        {
          canView: () => this.direction(suitOfArmour) === turnLeft,
          element:
            <div>
              <p>Soon, they arrive in front of a large mirror. <br />The robot ball's screen lights up:</p>
              <p className="ball-screen">{this.direction(largeMirror)}</p>
              {this.resolveDirection(largeMirror, {
                turnLeft:
                  <div>
                    <p>The robot ball turns left and continues down the hallway. The friends follow, and soon find themselves in a small room. There is a faint smell of mold.</p>
                    <p>“I… don't think this is the right way,” say {person(0)}. They walk carefully back to the mirror, worried that they might be lost in this darkness forever.</p>
                    {this.changeLabelHint(largeMirror)}
                  </div>,
                turnRight:
                  <p>{joinn(['The ball'].concat(_.map(story.characters, 'name')))} turn right.</p>,
                straightOn:
                  <div>
                    <p>The robot ball, with the {friendCount} adventureres following, attempt to leap through the glass of the mirror. It doesn't work.</p>
                    {this.changeLabelHint(largeMirror)}
                  </div>,
              })}
            </div>,
        }
      ,
        {
          canView: () => this.direction(largeMirror) === turnRight,
          element:
            <div>
              <p>The {countBasedTerm} continue down the cold, dark passageway, running along faster than the ball can go.</p>
              <p>Suddenly they get to a crossroads. They can turn left, right or continue straight on. “I think we should turn left” says {person(1)}. “That must be the way to the room where Taco is.”</p>
              <p>Just then, the robot ball rolls up. Its camera spots a painting of a tiger on the wall.</p>
              <p className="ball-screen">{this.direction('tiger painting')}</p>
              {this.resolveDirection(tigerPainting, {
                turnLeft:
                  <div>
                    <p>“I knew it — let's go!” says {person(1)}. They follow the ball to the left and continue on in the darkness.</p>
                    <p>Before long, the {countBasedTerm} are surprised to find themselves in a cleaning cupboard. {person(2)} steps on something squelchy.</p>
                    <p>“I think we may have gone the wrong way. There's no dog in here — just toilet cleaner!” says {person(0)}. They pick up the ball and feel their way back to the painting.</p>
                    {this.changeLabelHint(tigerPainting)}
                  </div>,
                turnRight:
                  <div>
                    <p>“Ah, I guess I was wrong!” says {person(1)}. They follow the ball to the right and down the hallway.</p>
                    <p>In the silence they hear a noise — “someone's snoring!” says {person(0)}. “I've got a bad feeling about this!”</p>
                    <p>As quietly as they can, they sneak backwards away from the noise until they are back at the tiger painting.</p>
                    {this.changeLabelHint(tigerPainting)}
                  </div>,
                straightOn:
                  <p>“Wow — good thing we programmed that robot!”, says {person(1)}. <br />They continue on.</p>,
              })}
            </div>
        }
      ,
        {
          canView: () => this.direction(tigerPainting) === straightOn,
          element:
            <div>
              <p>It felt like they were going deeper and deeper into the castle. The ball rolling ahead, casting a faint light to guide the friends.</p>
              <p>In the darkness, {person(0)}'s foot kicks something small, causing a metallic tinkling noise. “That sounds like a coin!” says {person(0)}, feeling around on the floor in the gloom.</p>
              {story.bag.filter(name => name === 'Gold coin').length < 2 &&
                <p className="hint hint--trello">Collect the coin by moving it to your ‘{this.props.config.lists.bag.name}’ list</p>
              }
            </div>
          }
      ,
        <div>
          <p>The ball's camera spots a chair up ahead, its screen lighting up once more.</p>
          <p className="ball-screen">{this.direction('chair')}</p>
          {this.resolveDirection(chair, {
            turnLeft:
              <div>
                <p>The ball turns left. The {friendCount} friends follow… and end up sat on each others laps on the chair.</p>
                <p>“I don't think we can go left here!” says {person(0)}.</p>
                {this.changeLabelHint(chair)}
              </div>,
            turnRight:
              <div>
                <p>As the adventurers turn that final corner, through the darkness they can make out a red door. “Hurray!” cries {person(0)}, relieved to have found it.</p>
                <p>But then, from out of the shadows lumbers a massive creature. The {friendCount} friends step back into the darkness, {person(2)} quickly catching and turning off the robot ball.</p>
              </div>,
            straightOn:
              <div>
                <p>The ball continues past the chair and the adventurers follow. Around the next bend they find themselves in a small kitchen.</p>
                <p>“I don't think this is the right way,” says {person(0)}, as {person(1)} makes a quick pot of tea.</p>
                <p>Once they'd finished their tea, they retraced their steps back to the chair, hoping they'd somehow be able to find the room where Taco was.</p>
                {this.changeLabelHint(chair)}
              </div>,
          })}
        </div>
    ]
  }
}
