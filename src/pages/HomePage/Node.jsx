var React = require('react');

module.exports = Node = React.createClass({
    
  propTypes: {
      x: React.PropTypes.number,
      y: React.PropTypes.number,
      label: React.PropTypes.string,
      onClick: React.PropTypes.func
  },
  
  render: function () {
    return <g onClick={this.props.onClick}>      
        <circle cx={this.props.x} cy={this.props.y} r="5" fill="orange" />
        <text x={this.props.x+10} y={this.props.y+5}>{this.props.label}</text>
    </g>;
  }
});