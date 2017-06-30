import React from 'react';
import Chapter from '../../../Chapter'

export default class Flight extends Chapter {
  get pages() {
    const { friendCount, person, object, place } = this.storyHelpers;
    return [
      <div>
        <p>The would-be rescuers fly higher and higher above the ground, the bird's huge wings powerfully beating the air.</p>
        <p>Over the houses and streets they soar, the wind rushing past them.</p>
        <p>“Look down there,” shouts {person(2)}, “I can see {place(1)}! It looks so small from up here”.</p>
        <p>“Why are those people down there all {this.getOne('activities', 1)}?” wonders {person(0)}.</p>
      </div>
    ,
      <div>
        <p>Suddenly, the land below the {friendCount} friends disappears, and they are flying over a great sea.</p>
        <p>On and on the majestic bird soars.</p>
        <p>{person(1)} clutches tightly onto the {object(0)}, afraid that it might fall.</p>
      </div>
    ,
      <div>
        <p>After what seemed like no time at all (but was actually quite a long time because it was, of course, far far away) a small castle appears on the horizon.</p>
        <p>The small castle then becomes a slightly bigger castle, then a medium sized castle, until—as they get even closer—they see that it is actually a very, very big castle.</p>
      </div>
    ,
      <div>
        <p>“Wow!” says {person(0)}, “that is a big castle! Look at all those towers and flags and other things you'd expect to see on a castle.”</p>
        <p>“Poor Taco must be locked in one of those towers“, says {person(1)}. “I do hope he's okay. We must get to him quickly.”</p>
      </div>
    ];
  }
}
