var React = require('react');

module.exports = React.createClass({
    
  propTypes: {
      x: React.PropTypes.number,
      y: React.PropTypes.number,
      label: React.PropTypes.string
  },
  
  enterEditMode: function()
  {
      this.setState({edit: true});
  },
  
  getInitialState: function() {
      return {
          edit: false
      };
  },
  
  render: function () {
    return <g>      
        <circle cx={this.props.x} cy={this.props.y} r="5" fill="orange" />
        <text onClick={this.enterEditMode} x={this.props.x+10} y={this.props.y+5}>{this.props.label}</text>
    </g>;
  }
});