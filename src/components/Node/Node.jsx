var React = require('react');

module.exports = Node = React.createClass({
    
  propTypes: {
      x: React.PropTypes.number,
      y: React.PropTypes.number,
      label: React.PropTypes.string,
      onClick: React.PropTypes.func
  },
  
  render: function () {
    return <g transform={'translate(' + this.props.x + ',' + this.props.y + ')'} onClick={this.props.onClick}>      
        <circle r="5" fill="#FF4585" />
        <text x={10} y={5}>{this.props.label}</text>
    </g>;
  }
});