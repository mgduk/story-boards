import React from 'react';
import Chapter from '../Chapter'

export default class Map extends Chapter {
  get pages() {
    const { friendCount, person, object, place } = this.storyHelpers;
    return [
      <div>
        <p>The {friendCount} friends run across the drawbridge towards the castle.</p>
        <p>As they get near the large building, {person(1)} hears a whimpering sound. Looking around, {person(1)} sees a young boy sat in the dust.</p>
        <p>The boy is crying.</p>
      </div>
    ,
      <div>
        <p>{person(1)} runs over to him. “What's wrong?” asks {person(1)}.</p>
        <p>“I've lost my {object(0)},” weeps the boy, “and my mother will be so upset. It was our last one and we have no money to buy another.”</p>
      </div>
    ,
      <div>
        <p>{person(1)} looked at the boy, then looked down at the {object(0)} that had travelled with them.</p>
        <p>“Here you go,” says {person(1)} holding out the {object(0)}, “you need it more than I do.”</p>
        <p>The boy looked up, a look of surprise and delight on his face. “Oh thank you! You are so kind. Yet all I have to repay you is this crumpled piece of paper.”</p>
        <p>The boy jumped up, dropped the ragged piece of paper onto {person(1)}'s lap, and skipped off down the road with his new {object(0)}.</p>
      </div>
    ,
      <div>
        <p>{person(1)} looked at the piece of paper. It was a map of the inside of the castle! Just what they needed to find Taco in such a huge building.</p>
      </div>
    ];
  }
}
