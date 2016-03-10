var React = require('react');

var SVG = require('../../components/svg');

var Image = SVG.Image;
var Circle = SVG.Circle;
var Line = SVG.Line;

var _ = require('lodash');

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
    {name: "Matthew", children: [ "Mark", "Luke" ]}, 
    {name: "Mark"}, 
    {name: "Luke", children: ["John", "Peter", "Lionel"]}, 
    {name: "John"}, 
    {name: "Peter"}, 
    {name: "Lionel"}
    ];

function renderNodes(nodes, centralNodeName)
{
    var centralNode = _.find(nodes, function(c) { return c.name == centralNodeName; });
    var circles = [];
    var parents = [];
    var children = [];
    _.forEach(nodes, function(n) {
        if ( n == centralNode ) { return ; } // skip the central node, we've already assigned it
        
        if ( _.find(n.children || [], function(c) { return c == centralNode.name; } ) )// if this node is a parent of the central node
        {
            parents.push(<Circle y={250} data={n}/>);    
        }
        
        if ( _.find(centralNode.children || [], function(c) { return c == n.name; }) ) // if this node is a child of the central node
        {
            children.push(<Circle y={750} data={n}/>);            
        }
    });
    
    circles.push(<Circle x={500} y={500} data={centralNode}/>);
    
    var x = 500 - (750/2);
    var parentSpacing = 750/parents.length;
    
    parents.forEach(function(p, i) {
        p.props.x = x + (parentSpacing * (i + 1))/2;
    });
    
    var childSpacing = 750/children.length;
    
    children.forEach(function(p, i) {
        p.props.x = x + (childSpacing * (i + 1))/2;
    });
    
    return _.concat(circles, parents, children); 
}

function renderLines(nodes)
{
    var lineList = [];
    var x = 10;
    return _.flatMap(nodes, function(n) {
        x += 10;
        return _.map(n.props.data.children, function(childName) {
            var child = _.find(nodes, function(c) { return c.props.data.name == childName; });
            if ( child == null ) { return null; } // if the child isn't present, we shouldn't render a link to it
            
            var start = n.props.x + ',' + n.props.y;
            var startCP = n.props.x + ',' + (n.props.y + 100);
            var endCP = child.props.x + ',' + (child.props.y - 100);
            var end = child.props.x + ',' + child.props.y;
            
            return <path d={'M' + start + ' C' + startCP + ' ' + endCP + ' ' + end} stroke="blue" stroke-width="5" fill="none" />;
        });   
    }).filter(function(n) { return n != null; });
}

module.exports = React.createClass({

  render: function () {
    var nodes = renderNodes(node_data, "Luke");
    var lines = renderLines(nodes);

    return (
      <div className='home-page'>
        <Image>
            {nodes}
            {lines}
        </Image>
      </div>
    );
  }

});

