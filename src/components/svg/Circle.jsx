var React = require('react');

module.exports = React.createClass({
  propTypes: {
      x: React.PropTypes.number,
      y: React.PropTypes.number
  },

  render: function () {
      return (
          <circle cx={this.props.x} cy={this.props.y} r="5" fill="orange" />
      );
  }
});