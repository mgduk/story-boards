import React, { Component } from 'react';

export default class Page extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.location.name}</h2>
        <p>Home sweet home</p>
      </div>
    )
  }
}
