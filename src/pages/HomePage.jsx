var React = require('react');

var SVG = require('../components/svg');

var Image = SVG.Image;
var Circle = SVG.Circle;
var Line = SVG.Line;

var Node = require('../components/Node/Node.jsx');
var EditNodePanel = require('../components/Node/EditNodePanel.jsx');


var _ = require('lodash');


var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;
    
var GlobalKeyHookMixin = require('../mixins/GlobalKeyHookMixin.js');
    
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

module.exports = HomePage = React.createClass({

    mixins: [FluxMixin, StoreWatchMixin('GraphStore'), GlobalKeyHookMixin],
    
    renderGraphLines: function(n)
    {
        console.log('rendering lines', n.props.parents.length);
        return n.props.parents.map(function(p){ 
                  console.log('rendering line to parent');
            var start = n.props.x + ',' + n.props.y;
            var startCP = n.props.x + ',' + (n.props.y - 100);
            var endCP = p.props.x + ',' + (p.props.y + 100);
            var end = p.props.x + ',' + p.props.y;
            var pathString = 'M' + start + ' C' + startCP + ' ' + endCP + ' ' + end;
            // return 'x';
            return <path key={n.props.label + '->' + p.props.label} d={pathString} stroke="#00BCD6" strokeWidth="2" fill="none" />;
        }).concat(n.props.children.map(function(p){ 
                  console.log('rendering line to children');
            var start = n.props.x + ',' + n.props.y;
            var startCP = n.props.x + ',' + (n.props.y + 100);
            var endCP = p.props.x + ',' + (p.props.y - 100);
            var end = p.props.x + ',' + p.props.y;
            var pathString = 'M' + start + ' C' + startCP + ' ' + endCP + ' ' + end;
            // return 'x';
            return <path key={n.props.label + '->' + p.props.label} d={pathString} stroke="#00BCD6" strokeWidth="2" fill="none" />;
        }));
       
    },
    
    getStateFromFlux: function() {
        var flux = this.getFlux();
        return {
            x: guid(),
        };
    },
    
    renderNode: function(node, x, y) {
        return <Node key={node.id} x={x} y={y} data={node} label={node.name} onClick={this.focusNode.bind(this, node)} />;
    },
    
    renderGraph: function(node)
    {
        var centre = {x: 500, y: 500};
        var x = 0;  
        var x2 = 0;
        var parents = node.parents.map(function(p) {
                return this.renderNode(p, x += 100, 250);
                            
             }.bind(this));
             
             var children = 
                node.children.map(function(c) {
                    return this.renderNode(c, x += 100, 750);
                }.bind(this));
                
                
        return [<Node key={node.id} x={centre.x} y={centre.y} data={node} label={node.name} parents={parents} children={children} />]
            .concat(
             parents//,
            ).concat( children
            )
            // node.children.map(function(c) {
            
        //}
        ;
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
            output.push(<Node key={n.id} y={250} x={x + (parentSpacing * (i + 1))/2} data={n} label={n.name} onClick={this.focusNode.bind(this, n)} />);
        }.bind(this));
        
        var childSpacing = 750/children.length;
        
        children.forEach(function(n, i) {
            output.push(<Node key={n.id} y={750} x={x + (childSpacing * (i + 1))/2} data={n} label={n.name} onClick={this.focusNode.bind(this, n)}/>);            
        }.bind(this));
        
        return output; 
  },
  
  getInitialState: function()
  {
    return {
        selectedNode: 2,
        focussedNode: 2,
        editNode: false
    };
  },
  
  focusNode: function(focussedNode) {
    this.setState({
        focussedNode: focussedNode.id,
        selectedNode: focussedNode.id
    });
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
        
        var deletedNode = this.state.focussedNode;
        
        this.setState({
            focussedNode: this.getFlux().store('GraphStore').getParents(deletedNode)[0].id
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
  
  getMetaKeyBindings: function() { 
    return {
        38: this.moveSelectionUp,
        40: this.moveSelectionDown,
        37: this.moveSelectionLeft,
        39: this.moveSelectionRight,
        13: this.focusNode.bind(this, {id: this.state.selectedNode})
    };
  },
  
  moveSelectionUp: function() {
      // if we are currently on a child, select focussed node
      // if we are currently on a parent do nothing
      // if we are currently on the focussed node, move to parent
  },
  moveSelectionDown: function() {
      // if we are currently on a child, do nothing
      // if we are currently on a parent, move to focussed node
      // if we are corrently on the focussed node, move to child
  },
  moveSelectionLeft: function() {
      // if we are currently on a child, 
        // get our position
        // if we are not furthest left, move left
      // if we are currently on a parent
        // get our position
        // if we not the furthest left, move left
      // if we are corrently on the focussed node, do nothing      
  },
  moveSelectionRight: function() {
      // if we are currently on a child, 
        // get our position
        // if we are not furthest right, move right
      // if we are currently on a parent
        // get our position
        // if we not the furthest right, move right
      // if we are corrently on the focussed node, do nothing      
  },
  
  beginEditingNode: function() {
    this.setState({
        editNode: true,
        editingNodeId: this.state.focussedNode
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
            focussedNode: newNode.id
        });
    },
    
  newNode: function(id)
  {
    return {
        id: id,
        parent: this.state.focussedNode
    };
  },
  
  render: function () {
    var nodes = this.renderGraph(this.getFlux().store('GraphStore').getGraph(this.state.focussedNode, 1));
  //  var nodes = this.renderNodes(this.getFlux().store('GraphStore').getRelatedNodes(this.state.focussedNode), this.state.focussedNode);
    //var lines = renderLines(nodes);
   
   var lines = this.renderGraphLines(nodes[0]);
    var highlightedNode = _.find(nodes, function(n) { return n.props.data.id == this.state.selectedNode; }.bind(this));
    var selectHighlight = <circle cx={highlightedNode.props.x} cy={highlightedNode.props.y} r="50" stroke="green" fill="none" />;
    console.log(lines);
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
            {selectHighlight}
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



/*

    Focussed Node => node that is at the centre of the current display
    Selected Node => node that is currently highlighted and all keyboard actions refer to


*/