var React = require('react');

module.exports = Image = React.createClass({
  render: function () {
      return (
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" version="1.1">
                    {this.props.children}  
            </svg>
      );
  }
});