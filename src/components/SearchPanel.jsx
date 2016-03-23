var React = require('react');
var mui = require('material-ui'),
    Dialog = mui.Dialog,
    FlatButton = mui.FlatButton,
    AutoComplete = mui.AutoComplete,
    MenuItem = mui.MenuItem,
    TextField = mui.TextField;

var ReactDOM = require('react-dom');
    
var _ = require('lodash');

var GlobalKeyHookMixin = require('../mixins/GlobalKeyHookMixin.js');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;
    
module.exports = EditNodePanel = React.createClass({
    mixins: [GlobalKeyHookMixin, FluxMixin, StoreWatchMixin('GraphStore')],
    
    propTypes: {
        onItemFound: React.PropTypes.func.isRequired,
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
            queryText: ''
        };
    },

    mapResults: function(resultData) {
        return resultData.map(function(r) {
            return {
                text: r.name,
                data: r,
                value: (
                <MenuItem key={r.id}
                    primaryText={r.name}
                />
                )
            };
        });
    },

    getStateFromFlux: function() {
        return {
            dataSource: this.mapResults(this.getFlux().store('GraphStore').getQueryResults() || [])
        }
    },

    handleOK: function() {
        if ( this.props.onItemFound ) {
            var foundNode = this.state.foundNode;
            var firstNodeInList = (this.state.dataSource && this.state.dataSource.length) ? this.state.dataSource[0] : null;
            foundNode = foundNode ? foundNode : firstNodeInList;
            if ( foundNode ) {
                this.props.onItemFound(foundNode);
            }
        }
        if ( this.props.onClose )
        {
            this.props.onClose();
        }
    },
    
    handleCancel: function() {
        if ( this.props.onClose ) {
            this.props.onClose();
        }
    },

    changeQuery: function(query)
    {
        this.getFlux().actions.query(query);
    },
    
    componentDidMount: function() {
        this.refs.query.refs.searchTextField._getInputNode().focus();
    },
    
    selectionMade: function(text, idx, list) {
        if ( list ) {
            this.setState({
                foundNode: list[idx].data
            });
        }
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
                title="Search"
                modal={true}
                actions={actions}
                open={true}
                onRequestClose={this.handleCancel} >  
                
                    <AutoComplete
                        ref="query"
                        onNewRequest={this.selectionMade}
                        filter={AutoComplete.noFilter}
                        hintText="Type c"
                        dataSource={this.state.dataSource}
                        onUpdateInput={this.changeQuery}
                    />
            </Dialog>;
    }
});