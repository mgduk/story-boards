import React, { Component } from 'react';
import _ from 'lodash';
import { articlize } from 'articles';
import converter from 'number-to-words';
import pluralize from 'pluralize';

export default class Chapter extends Component {
  getOne(set, index = null, fallback = '_____') {
    const items = this.props.story[set] || []
    if (items.length === 0) {
      return fallback;
    }
    if (index === null) {
      index = Math.floor(Math.random() * items.length);
    }
    index = Math.min(items.length-1, Math.max(0, index))
    return items[index] != null ? items[index] : fallback;
  }

  getArticlized(set, index = null, fallback = 'a _____') {
    return this.articlize(this.getOne.apply(this, arguments))
  }

  getNames(set) {
    return _.map(this.props.story[set], 'name')
  }

  articlize(string) {
    string = pluralize.singular(string)
    string = string.replace(/^(a|an|the|my|our|the) /i, '')
    return (string.match(/^(some) /i, string))
      ? string
      : articlize(string);
  }

  dearticlize(string) {
    string = pluralize.singular(string)
    return string.replace(/^(a|an|the|my|our|some|the) /i, '')
  }

  get storyHelpers() {
    return {
      story: this.props.story,
      friendCount: converter.toWords(this.props.story.characters.length),
      place: (index) => this.getOne('places', index, { name: '_____' }).name,
      person: (index) => this.getOne('characters', index, { name: '_____' }).name,
      object: (index, article = false) => {
        const object = this.getOne('objects', index);
        return (article)
          ? this.articlize(object)
          : this.dearticlize(object);
      }
    }
  }

  get pages() {
    return []
  }

  componentWillMount() {
    this.props.setPages(this.pages);
  }

  render() {
    const pages = (this.pages || []).map(page =>
       (_.isFunction(page.canView))
         ? page
         : { canView: () => true, element: page }
    )
    return <div className="chapter-{this.props.name}">
      { pages[this.props.page].element }
    </div>
  }
}
