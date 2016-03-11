var React = require('react');

var SVG = require('../../components/svg');

var Image = SVG.Image;
var Circle = SVG.Circle;
var Line = SVG.Line;

var Node = require('./Node.jsx');

var _ = require('lodash');

var EditNodePanel = require('./EditNodePanel.jsx');

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

// If you are going to be using stores, be sure to first load in the `Fluxxor`
// module.
//
//     var Fluxxor = require('Fluxxor');
//
// If you want to leverage the use of stores, a suggestion would be to
// initialize an object, and set it to a `stores` variable, and adding a new
// instance of the store as a property to the object, like so:
//
//     var stores = {
//       SomeStore: new SomeStore()
//     };
//
// And also, because we are using the Flux architecture, you may also initialize
// an object full of methods that represent "actions" that will be called upon
// by a "dispatcher", like so:
//
//     var actions = {
//       doSomething: function (info) {
//         this.dispatch('DO_SOMETHING', {info: info});
//       }
//     };
//
// And finally, you would pass the stores and actions to our dispatcher, like
// so:
//
//     var flux = new Fluxxor.Flux(stores, actions);
//
// And, then, you would pass in the reference of your dispatcher to the view
// relies on the dispatcher (that view is returned by the `render` method), like
// so:
//
//     <SomeView flux={flux} />


var node_data = [
    {id: 0, name: "Matthew", children: [ 1, 2 ]}, 
    {id: 1, name: "Mark", children: []}, 
    {id: 2, name: "Luke", children: [3, 4, 5]}, 
    {id: 3, name: "John", children: []}, 
    {id: 4, name: "Peter", children: []}, 
    {id: 5, name: "Lionel", children: []}
    ];

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
        e = e || window.event;
        var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
        if (charCode) {
            var key = String.fromCharCode(charCode);
            if ( key in this.getKeyBindings() )
            {
                this.getKeyBindings()[key].bind(this)(e);
            }
        }
    }.bind(this);
  },
  
  editNode: function(e) { // edit node
        if ( !this.state.editNode )
        {
            e.preventDefault();
            this.beginEditingNode();
        }
    },
    
    addNode: function(e) { // add new node
        if ( !this.state.editNode )
        {
            e.preventDefault();
            this.beginAddingNode();
        }
    },
    
    deleteNode: function(e) { // delete node
        if ( !this.state.editNode )
        {
            var centralNode = _.find(node_data, function(c) { return c.id == this.state.selectedNode; }.bind(this));  
        
            // find nodes where centralNode is a child
            var parents = _.filter(node_data, function(n) {
                // return TRUE if n.children contains centralNode.id
                return _.indexOf(n.children, centralNode.id) != -1;
                });

            parents.forEach(function(parent) {
                _.pull(parent.children, centralNode.id);
            });
            
            _.pull(node_data, centralNode);

            this.setState({
                selectedNode: parents[0].id
            });
                
            e.preventDefault();
        }
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
    var centralNode = _.find(node_data, function(c) { return c.id == this.state.selectedNode; }.bind(this));  
    this.setState({
        editNode: true,
        editingNodeId: centralNode.id
    });
  },
  
  
  beginAddingNode: function() {
    
    var centralNode = _.find(node_data, function(c) { return c.id == this.state.selectedNode; }.bind(this));  
    
    var newNode = {
        id: guid(),
        name: '',
    };
    
    node_data.push(newNode);
    centralNode.children.push(newNode.id);
    
    this.setState({
        editNode: true,
        editingNodeId: newNode.id
    });
  },
  
  handleClose: function() {
    this.setState({
        editNode: false
        });
      },

    saveAndClose: function(newNode) {
        var editedNode = _.find(node_data, function(c) { return c.id == newNode.id; }.bind(this));
        editedNode.name = newNode.name;
        this.setState({
            editNode: false,
            selectedNode: editedNode.id
        });
    },
  
  render: function () {

    var nodes = this.renderNodes(node_data, this.state.selectedNode);
    var lines = renderLines(nodes);
    var editingNode = _.find(node_data, function(c) { return c.id == this.state.editingNodeId; }.bind(this));
        
    return (
      <div className='home-page'>
        {this.state.editNode ? <EditNodePanel
            node={editingNode}
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

