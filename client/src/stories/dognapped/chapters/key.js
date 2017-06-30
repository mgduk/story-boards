import React from 'react';
import Chapter from '../../../Chapter'
import joinn from 'joinn';

export default class Key extends Chapter {
  chosenKey() {
    if (!this.props.story.vendingMachine) return;
    return this.props.story.vendingMachine.find(card => card.stickers.length > 0)
  }
  coinsPaid() {
    if (!this.props.story.vendingMachine) return;
    return this.props.story.vendingMachine.filter(card => card.name === 'Gold coin').length >= 3
  }
  get pages() {
    const { person, object, food } = this.storyHelpers;
    return [
      <div>
        <p>“It's locked,” says {person(0)}. “What do we do now?”</p>
        <p>{person(2)}'s eyes adjust to the darkness. In an alcove a few steps away, a shape becomes visible. It's a tall rectangular box, with a glass front and a panel of metal buttons to one side.</p>
        <p>Across the top is a sign saying “Key Vending Machine”.</p>
        <p>“A vending machine for keys!” cries {person(2)}. “How wonderfully convenient!”</p>
      </div>
    ,
      <div>
        <p>{joinn(this.getNames('characters'))} rush over to the machine.</p>
        <p>The machine contains three keys, and also {object(2, true)} for some reason. Beneath each key is a small label saying, “3 gold coins”.</p>
        <p>{person(1)} looks in their bag. “We only have enough to buy one key. We're just going have to choose one and hope it's the right one for this door.”</p>
        {!(this.coinsPaid() && this.chosenKey()) &&
          <div className="hint hint--trello">
            {!this.chosenKey() && <p>On the board, choose a key by putting a sticker on it.</p>}
            {!this.coinsPaid() && <p>{this.chosenKey() ? 'Now' : 'Then'} pay for the key by moving the gold coins to the vending machine.</p>}
          </div>
        }
      </div>
    ,
      {
        canView: () => this.coinsPaid() && this.chosenKey(),
        element:
          <div>
            <p>The vending machine makes a whirr and a clunk and a click and a bing! and the key drops down inside.</p>
            <p>Reaching into the tray, {person(2)} pulls it out.</p>
            {this.chosenKey() && <p><img src={this.chosenKey().imageUrl} alt=""/></p>}
          </div>
      }
    ,
      <div>
        <p>{person(1)} looks round to check that the troll hasn't come back to eat them, or to pick up its half-eaten {this.dearticlize(food(2))}.</p>
        <p>{person(2)} walks purposefully over to the red door. The key slides easily into the lock. It turns, the lock clicks, and the door swings open.</p>
        <p>Dazzling bright light floods into the previously gloomy space.</p>
      </div>
    ]
  }
}
