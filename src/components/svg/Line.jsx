var React = require('react');

module.exports = React.createClass({
    
  propTypes: {
      x1: React.PropTypes.number,
      x2: React.PropTypes.number,
      y1: React.PropTypes.number,
      y2: React.PropTypes.number
  },
  
  render: function () {
      return (
        <line x1={this.props.x1} y1={this.props.y1}
            x2={this.props.x2} y2={this.props.y2}
            stroke="black" 
            stroke-width="2"/>
      );
  }
});