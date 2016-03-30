var React = require('react');

module.exports = Node = React.createClass({
    
  propTypes: {
      x: React.PropTypes.number,
      y: React.PropTypes.number,
      label: React.PropTypes.string,
      onClick: React.PropTypes.func,
      selected: React.PropTypes.bool
  },
  
  render: function () {
    return <g transform={'translate(' + this.props.x + ',' + this.props.y + ')'} 
        style={{cursor:'pointer'}}
        onClick={this.props.onClick}>
        <rect is x="-25" width={32+12+(this.props.label.length*10)} height="64" y='-32' stroke="white" fill="white" filter="url(#dropshadow)" ></rect>
        {this.props.selected ? <rect is x="-25" width={32+12+(this.props.label.length*10)} height="64" y='-32' stroke="#F13D6B" fill="#F13D6B" ></rect> : null}    
        <circle r="5" fill="#FF4585" />
        <text x={10} y={5} style={{fontSize:15, lineHeight:'26pt'}}>{this.props.label}</text>
    </g>;
  }
});