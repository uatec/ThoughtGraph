var React = require('react');

var SVG = require('../components/svg');

var Image = SVG.Image;
var Circle = SVG.Circle;
var Line = SVG.Line;

var Node = require('../components/Node/Node.jsx');
var EditNodePanel = require('../components/Node/EditNodePanel.jsx');
var SearchPanel = require('../components/SearchPanel.jsx');

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

function pointsToVector(P1, P2) {
    return { x: P2.x - P1.x, y: P2.y - P1.y };
}

function vectorToRadians(vector)
{
    var angle = Math.atan2(vector.y, vector.x);
    return angle < 0 ? angle + (Math.PI * 2) : angle;
}

function vectorLength(vector)
{
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}


function findNodeInDirection(nodeCollection, origin, angleInRadians, pointFunctor, scoreFunctor)
{
    var nodesWithPoints = nodeCollection.map(function(n) {
        var point = pointFunctor(n);
        var vectorToPoint = pointsToVector(point, origin);
        if ( vectorToPoint.x === 0 && vectorToPoint.y === 0 )
        {
            return { 
                node: n, 
                score: NaN
            };
        }
        var distanceToPoint = vectorLength(vectorToPoint);
        var angleToPoint = vectorToRadians(vectorToPoint);
        var score = scoreFunctor(angleToPoint, distanceToPoint);
        return {
            node: n,
            score: score,
            angleToPoint: angleToPoint,
            distanceToPoint: distanceToPoint
        };
    });

    var highest = nodesWithPoints[0];
    nodesWithPoints.forEach(function(element) {
        if ( isNaN(highest.score) || element.score < highest.score ) {
            highest = element;
        }
    }, this);
    if ( isNaN(highest.score) ) return null;
    return highest.node;
}

module.exports = HomePage = React.createClass({

    mixins: [FluxMixin, StoreWatchMixin('GraphStore'), GlobalKeyHookMixin],
    
    renderGraphLines: function(n)
    {
        return n.props.parents.map(function(p){ 
            var start = n.props.x + ',' + n.props.y;
            var startCP = n.props.x + ',' + (n.props.y - 100);
            var endCP = p.props.x + ',' + (p.props.y + 100);
            var end = p.props.x + ',' + p.props.y;
            var pathString = 'M' + start + ' C' + startCP + ' ' + endCP + ' ' + end;
            // return 'x';
            return <path key={n.props.label + '->' + p.props.label} d={pathString} stroke="#00BCD6" strokeWidth="2" fill="none" />;
        }).concat(n.props.children.map(function(p){ 
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
        return <Node key={node.id} x={x} y={y} data={node} label={node.id + ' - ' + node.name} onClick={this.focusNode.bind(this, node)} />;
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
                
                
        return [<Node key={node.id} x={centre.x} y={centre.y} data={node} label={node.id + ' - ' + node.name} parents={parents} children={children} />]
            .concat(parents)
            .concat(children)
        ;
    },

    
  getInitialState: function()
  {
    return {
        selectedNode: 2,
        focussedNode: 2,
        editNode: false,
        disableGlobalKeys: false
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
        
        var deletedNode = this.state.selectedNode;
        
        var moveToNode = this.getFlux().store('GraphStore').getNode(deletedNode).parents[0].id;
        
        this.setState({
            focussedNode: this.state.focussedNode == this.state.selectedNode ? moveToNode : this.state.focussedNode,
            selectedNode: moveToNode
        });
        
        this.getFlux().actions.deleteNode(deletedNode);
    },
  
  getKeyBindings: function() { 
    return {
        e: this.editNode,
        a: this.addNode,
        d: this.deleteNode,
        f: this.beginSearch,
        i: this.beginLinkNode.bind(this, 'parent'),
        k: this.beginLinkNode.bind(this, 'child'),
        l: this.beginLinkNode.bind(this, 'sibling'),
        u: this.unLinkNode
    }
  },
  
  unLinkNode: function() {
    if ( this.state.focussedNode != this.state.selectedNode) {
        this.getFlux().actions.unlink(this.state.focussedNode, this.state.selectedNode);
        this.setState({
            selectedNode: this.state.focussedNode
        });
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
  
  beginLinkNode: function(linkType, e) {
    e.preventDefault();
    this.setState({
        disableGlobalKeys: true,
        showLink: true,
        linkType: linkType
    })
  },
  
  endLinkNode: function() {
    this.setState({
      disableGlobalKeys: false,
      showLink: false  
    });
  },
  
  linkNode: function(linkTo)
  {
      this.getFlux().actions.linkNode(this.state.focussedNode, linkTo.id || linkTo.data.id, this.state.linkType);
  },
  
  beginSearch: function(e) {
    e.preventDefault();
    this.setState({
        disableGlobalKeys: true,
        showSearch: true
    });    
  },
  
  endSearch: function() {
    this.setState({
      disableGlobalKeys: false,
      showSearch: false  
    });
  },
  
  moveSelector: function(vector)
  {
      var pointExtractor = function(n) { return {x: n.props.x, y: n.props.y}; };
      var targetAngle = vectorToRadians(vector);
      var angleCoefficient = 100* (2 * Math.PI);
      var distanceCoefficient = 1;
//function findNodeInDirection(nodeCollection, origin, angleInRadians, pointFunctor, scoreFunctor)
      var selectedNode = _.filter(this.renderedNodes, function(n) { return n.props.data.id == this.state.selectedNode; }.bind(this));
      
      var bestNode = findNodeInDirection(this.renderedNodes, pointExtractor(selectedNode[0]),
        0, pointExtractor, function(angle, distance) { 
            // score functor
            if ( distance == 0 ) return NaN;
            var angleDeviation = Math.abs(angle - targetAngle);
            if ( angleDeviation > Math.PI / 2 ) return NaN;
            return angleCoefficient * angleDeviation + distanceCoefficient * distance;
        });
      
      if ( bestNode == null ) return;  
      
      this.setState({selectedNode: bestNode.props.data.id});
  },
  
  
  moveSelectionUp: function() {
    this.moveSelector({x: 0, y: 1});
  },
  moveSelectionDown: function() {
    this.moveSelector({x: 0, y: -1});
  },
  moveSelectionLeft: function() {
    this.moveSelector({x: 1, y: 0});  
  },
  moveSelectionRight: function() {
    this.moveSelector({x: -1, y: 0});
  },
  
  beginEditingNode: function() {
    this.setState({
        editNode: true,
        disableGlobalKeys: true,
        editingNodeId: this.state.focussedNode
    });
  },
  
  
  beginAddingNode: function() {
    this.setState({
        editNode: true,
        disableGlobalKeys: true,
        editingNodeId: guid()
    });
  },
  
  handleClose: function() {
    this.setState({
        disableGlobalKeys: false,
        editNode: false
        });
      },

    saveAndClose: function(newNode) {
        this.getFlux().actions.saveNode(newNode);
        this.setState({
            disableGlobalKeys: false,
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
    var visibleGraphEntryPoint = this.getFlux().store('GraphStore').getRelatedNodes(this.state.focussedNode, 1);
    this.renderedNodes = this.renderGraph(visibleGraphEntryPoint);
   
    var lines = this.renderGraphLines(this.renderedNodes[0]);
    var highlightedNode = _.find(this.renderedNodes, function(n) { return n.props.data.id == this.state.selectedNode; }.bind(this)) 
        || this.renderedNodes[0];
    var selectHighlight = <circle cx={highlightedNode.props.x} cy={highlightedNode.props.y} r="50" stroke="green" fill="none" />;
    return (
      <div className='home-page'>
        {this.state.editNode ? <EditNodePanel
            node={this.getFlux().store('GraphStore').getNode(this.state.editingNodeId) || this.newNode(this.state.editingNodeId)}
            onClose={this.handleClose}
            onSave={this.saveAndClose}
            /> : null }
        {this.state.showSearch ? <SearchPanel
            onClose={this.endSearch}
            onItemFound={this.focusNode} /> : null}
        {this.state.showLink ? <SearchPanel
            onClose={this.endLinkNode}
            onItemFound={this.linkNode} /> : null}
        <Image>
            {lines}
            {this.renderedNodes}
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
            <FlatButton
                label="[f] Search"
                secondary={true}
                onTouchTap={this.beginSearch}
            />
            <FlatButton
                label="[i] Link Parent Node"
                secondary={true}
                onTouchTap={this.beginLinkNode.bind(this, 'parent')}
            />
            <FlatButton
                label="[k] Link Child Node"
                secondary={true}
                onTouchTap={this.beginLinkNode.bind(this, 'child')}
            />
            <FlatButton
                label="[l] Link Sibling Node"
                secondary={true}
                onTouchTap={this.beginLinkNode.bind(this, 'sibling')}
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