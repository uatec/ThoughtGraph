var React = require('react');
var ReactDOM = require('react-dom');

module.exports = IFrame = React.createClass({

    propTypes: {
        onDone: React.PropTypes.func.isRequired
    },

    componentDidMount: function() {
        ReactDOM.findDOMNode(this.refs.iframe).src = "data:text/html;base64," + window.btoa(ReactDOM.findDOMNode(this.refs.content).innerHTML + '<script>window.print();</script>');
        setTimeout(this.props.onDone, 1000);
    },

    render: function () {
        return (
        <div style={{display: 'none'}}>
            <div ref="content">
                {this.props.children}
            </div>
            <iframe id='printframe' ref="iframe"/>
        </div>
        );
    }
});