var React = require('react');

var SVG = require('../../components/svg');

var Image = SVG.Image;
var Circle = SVG.Circle;
var Line = SVG.Line;

var Node = require('./Node.jsx');

var _ = require('lodash');

var EditNodePanel = require('./EditNodePanel.jsx');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;
    
var mui = require('material-ui'),
     FlatButton = mui.FlatButton,
     TextField = mui.TextField,
     Dialog = mui.Dialog;
     
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function renderLines(nodes)
{
    var lineList = [];
    var x = 10;
    return _.flatMap(nodes, function(n) {
        x += 10;
        return _.map(n.props.data.children, function(childId) {
            var child = _.find(nodes, function(c) { return c.props.data.id == childId; });
            
            if ( child === null || child === undefined ) { return null; } // if the child isn't present, we shouldn't render a link to it
            
            var start = n.props.x + ',' + n.props.y;
            var startCP = n.props.x + ',' + (n.props.y + 100);
            var endCP = child.props.x + ',' + (child.props.y - 100);
            var end = child.props.x + ',' + child.props.y;
            var pathString = 'M' + start + ' C' + startCP + ' ' + endCP + ' ' + end;
            
            return <path key={n.props.data.id + '->' + child.props.data.id} d={pathString} stroke="#00BCD6" strokeWidth="2" fill="none" />;
        });   
    }).filter(function(n) { return n != null; });
}

module.exports = React.createClass({

    mixins: [FluxMixin, StoreWatchMixin('GraphStore')],
    
    getStateFromFlux: function() {
        var flux = this.getFlux();
        return {
            x: guid(),
        };
    },

    renderNodes: function (nodes, centralNodeName)
    {
        var centralNode = _.find(nodes, function(c) { return c.id == centralNodeName; });
        var circles = [];
        var parents = [];
        var children = [];
        _.forEach(nodes, function(n) {
            if ( n == centralNode ) { return ; } // skip the central node, we've already assigned it
            
            if ( _.find(n.children || [], function(c) { return c == centralNode.id; } ) )// if this node is a parent of the central node
            {
                parents.push(n);    
            }
            
            if ( _.find(centralNode.children || [], function(c) { return c == n.id; }) ) // if this node is a child of the central node
            {
                children.push(n);            
            }
        }.bind(this));
        var output = [];
        
        output.push(<Node key={centralNode.id} x={500} y={500} data={centralNode} label={centralNode.name}/>);
        
        
        var x = 500 - (750/2);
        var parentSpacing = 750/parents.length;
        
        parents.forEach(function(n, i) {
            output.push(<Node key={n.id} y={250} x={x + (parentSpacing * (i + 1))/2} data={n} label={n.name} onClick={this.selectNode.bind(this, n)} />);
        }.bind(this));
        
        var childSpacing = 750/children.length;
        
        children.forEach(function(n, i) {
            output.push(<Node key={n.id} y={750} x={x + (childSpacing * (i + 1))/2} data={n} label={n.name} onClick={this.selectNode.bind(this, n)}/>);            
        }.bind(this));
        
        return output; 
  },
  
  getInitialState: function()
  {
    return {
        selectedNode: 2,
        editNode: false
    };
  },
  
  selectNode: function(selectedNode) {
    this.setState({
        selectedNode: selectedNode.id
    });
  },
  
  componentDidMount: function() {
    document.onkeypress = function(e) {
    
        if ( !this.state.editNode ) {
            e = e || window.event;
            var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
            if (charCode) {
                var key = String.fromCharCode(charCode);
                if ( key in this.getKeyBindings() )
                {
                    this.getKeyBindings()[key].bind(this)(e);
                }
            }
        }
    }.bind(this);
  },
  
    editNode: function(e) { // edit node
        e.preventDefault();
        this.beginEditingNode();
    },
    
    addNode: function(e) { // add new node
        e.preventDefault();
        this.beginAddingNode();
    },
    
    deleteNode: function(e) { // delete node
        
        e.preventDefault();    
        
        var deletedNode = this.state.selectedNode;
        
        this.setState({
            selectedNode: this.getFlux().store('GraphStore').getParents(deletedNode)[0].id
        });
        
        this.getFlux().actions.deleteNode(deletedNode);
    },
  
  getKeyBindings: function() { 
    return {
        e: this.editNode,
        a: this.addNode,
        d: this.deleteNode
    }
  },
  
  componentWillUnmount: function() {
    document.onkeypress = null;
  },
  
  beginEditingNode: function() {
    this.setState({
        editNode: true,
        editingNodeId: this.state.selectedNode
    });
  },
  
  
  beginAddingNode: function() {
    
    this.setState({
        editNode: true,
        editingNodeId: guid()
    });
  },
  
  handleClose: function() {
    this.setState({
        editNode: false
        });
      },

    saveAndClose: function(newNode) {
        this.getFlux().actions.saveNode(newNode);
        this.setState({
            editNode: false,
            selectedNode: newNode.id
        });
    },
    
  newNode: function(id)
  {
    return {
        id: id,
        parent: this.state.selectedNode
    };
  },
  
  render: function () {
  
    var nodes = this.renderNodes(this.getFlux().store('GraphStore').getRelatedNodes(this.state.selectedNode), this.state.selectedNode);
    var lines = renderLines(nodes);
        
    return (
      <div className='home-page'>
        {this.state.editNode ? <EditNodePanel
            node={this.getFlux().store('GraphStore').getNode(this.state.editingNodeId) || this.newNode(this.state.editingNodeId)}
            onClose={this.handleClose}
            onSave={this.saveAndClose}
            /> : null }
        <Image>
            {lines}
            {nodes}
        </Image>
        <div>
            <FlatButton
                label="[a] Add"
                secondary={true}
                onTouchTap={this.addNode}
            />
            <FlatButton
                label="[e] Edit"
                secondary={true}
                onTouchTap={this.editNode}
            />
            <FlatButton
                label="[d] Delete"
                secondary={true}
                onTouchTap={this.deleteNode}
            />
        </div>
      </div>
    );
  }

});

