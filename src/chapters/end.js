import React from 'react';
import Chapter from '../Chapter'

export default class End extends Chapter {
  get pages() {
    return [
      <div>The end!</div>
    ]
  }
}
