var React = require('react');
var mui = require('material-ui'),
    Dialog = mui.Dialog;
    FlatButton = mui.FlatButton;
    TextField = mui.TextField;
    
var _ = require('lodash');

var GlobalKeyHookMixin = require('../../mixins/GlobalKeyHookMixin.js');

  
module.exports = EditNodePanel = React.createClass({
    mixins: [GlobalKeyHookMixin],
    
    propTypes: {
        node: React.PropTypes.object.isRequired,
        onSave: React.PropTypes.func.isRequired,
        onClose: React.PropTypes.func.isRequired
    },

    getKeyBindings: function() { 
        return { };
    },
    
    getMetaKeyBindings: function() { 
        return {
            27: this.handleCancel,
            13: this.handleOK
        };
    },
    
    getInitialState: function() {
        return {
            labelText: this.props.node.name,
        };
    },

    handleOK: function() {
        if ( this.props.onSave ) {
            
            var newNode = _.clone(this.props.node);
            newNode.name = this.state.labelText;

            this.props.onSave(newNode);
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
                title="Edit thought"
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