import React from 'react';
import Chapter from '../Chapter'

export default class Map extends Chapter {
  get pages() {
    const { friendCount, person, object } = this.storyHelpers;
    return [
      <div>
        <p>The {friendCount} friends run across the drawbridge towards the castle.</p>
        <p>As they get near the large building, {person(1)} hears a whimpering sound. </p>
        <p>Looking around, {person(1)} sees a young boy sat in the dust. The boy is crying.</p>
      </div>
    ,
      <div>
        <p>{person(1)} runs over to him. “What's wrong?” asks {person(1)}.</p>
        <p>“I've lost my {object(0)},” weeps the boy, “and my mother will be so upset. It was our last one and we have no money to buy another.”</p>
      </div>
    ,
      <div>
        <p>{person(1)} looks at the boy, then looks down at the {object(0)} that had travelled with them.</p>
        <p>“Here you go,” says {person(1)} holding out the {object(0)}, “you need it more than I do.”</p>
        <p>The boy looks up, surprise and delight on his face. “Oh thank you! You are so kind. Yet all I have to repay you is this crumpled piece of paper.”</p>
      </div>
    ,
      <div>
        <p>The boy jumps up, drops a ragged piece of paper onto {person(1)}'s lap, and skips off down the road with his new {object(0)}.</p>
        <p>{person(1)} looks at the piece of paper. It was a map of the inside of the castle! Just what they need to find Taco in such a huge building.</p>
        <p><img src="/images/map.jpg" alt="Map" className="map map--small" /></p>
        <p>“Great, we don't want to get lost inside the castle! But oh, it'll be dark, so we won't be able to read the map in there.” said {person(0)}, sadly.</p>
      </div>
    ,
      <div>
        <p>“I know, we can use this!” said {person(2)}, pulling a small robot ball out of a pocket. “We can programme it where to go, then follow its light in the dark castle corridors.”</p>
        <p>
          <img src="/images/bb8.jpg" alt="Robot Ball" className="bb8" />
        </p>
        <p>“Brilliant idea!” said {person(0)}.</p>
      </div>
    ,
      <div>
        <p className="hint">Use the map to programme the robot ball, telling it which way to turn when it sees each thing that is marked on the map.</p>
        <p><img src="/images/map.jpg" alt="Map" className="map map--large" /></p>
      </div>
    ,
      <div>
        <p>{person(0)} pushes on the large wooden door to the castle.</p>
        <p>With a CREEAAK it slowly swings open, and the {friendCount} friends walk nervously into the darkness.</p>
      </div>
    ];
  }
}
