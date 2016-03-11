var React = require('react');
var mui = require('material-ui'),
    Dialog = mui.Dialog;
    FlatButton = mui.FlatButton;
    TextField = mui.TextField;

  
module.exports = React.createClass({

    propTypes: {
        node: React.PropTypes.object,
        onSave: React.PropTypes.func,
        onClose: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            labelText: this.props.node.name,
        };
    },

    handleOK: function() {
        if ( this.props.onSave ) {
            this.props.onSave({
                name: this.state.labelText
            });
        }
    },
    
    handleCancel: function() {
        if ( this.props.onClose ) {
            this.props.onClose();
        }
    },

    changeLabel: function(event)
    {
        this.setState({
            labelText: event.target.value,
        });
    },
    
    componentDidMount: function() {
        console.log('component did mount, focusing on text box');
        this.refs.labelText.focus();
    },

    render: function() {
        var actions = [
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={this.handleCancel} />,
            <FlatButton
                label="Submit"
                primary={true}
                type="submit"
                onTouchTap={this.handleOK} />,
        ];

        return <Dialog
                title="Dialog With Actions"
                modal={true}
                actions={actions}
                open={true}
                onRequestClose={this.handleCancel} >  
                    <TextField ref="labelText"
                        value={this.state.labelText}
                        onChange={this.changeLabel} />
            </Dialog>;
    }
});