var Fluxxor = require('fluxxor');
var _ = require('lodash');

function flatten(n) {
    var flattenedNode = {};
    flattenedNode.id = n.id;
    flattenedNode.name = n.name;
    flattenedNode.parents = n.parents.map(function(p) { return p.id; });
    flattenedNode.children = n.children.map(function(p) { return p.id; });
    return flattenedNode;
}


function serialiseGraph(graphIndex) {
    var flattenedIndex = {};
    for ( var key in graphIndex) {
        flattenedIndex[key] = flatten(graphIndex[key]);
    }
    return flattenedIndex;   
}

function deserialiseGraph(hashMap) {
    var graphIndex = _.clone(hashMap);
    
    var extractNodeById = function(c) {
           return graphIndex[c]; 
        };
    
    for ( var key in hashMap ) 
    {
        var node = graphIndex[key];
        node.children = node.children.map(extractNodeById);
        node.parents = node.parents.map(extractNodeById);
    }
    return graphIndex;   
}

module.exports = GraphStore = Fluxxor.createStore({
    actions: {
        "DELETE_NODE": "_deleteNode",
        "LINK_NODE": "_linkNode",
        "SAVE_NODE": "_saveNode",
        "LOCAL_QUERY_REQUESTED": "queryLocalGraph",
        "UNLINK_NODES": "_unlinkNodes"
    },
    
    _unlinkNodes: function(data) {
        var from = this.nodes[data.from];
        var to = this.nodes[data.to];
        
        if ( from.parents.indexOf(to) != -1 ) {// if 'to' is a parent of 'from'
            from.parents.splice(from.parents.indexOf(to), 1); // remove 'to' as a parent of 'from'
            to.children.splice(to.children.indexOf(from), 1); // remove 'from' as a child of 'to'
        } else if ( to.parents.indexOf(from) != -1 ) {
            to.parents.splice(to.parents.indexOf(from), 1); // remove 'from' as a parent of 'to'
            from.children.splice(from.children.indexOf(to), 1); // remove 'to' as a child of from'
        } else {
            // do siblings?
        }
        
        window.localStorage.setItem('graph', JSON.stringify(serialiseGraph(this.nodes)));
        this.emit('change');
    },
    
    
    getQueryResults: function() {
        return this.queryResults;
    },
    
    queryLocalGraph: function(queryString) {
        var query = new RegExp(queryString, 'i');
        
        this.queryResults = _.filter(this.nodes, function(n) { return query.test(n.name); });
        
        this.emit('change');
    },

    initialize: function(options) {
        if ( !window.localStorage.getItem('graph' ) ) {
            var data = {
                0: {id: 0, name: "Matthew", children: [ 1, 2 ], parents: []}, 
                1: {id: 1, name: "Mark", children: [], parents: [0]}, 
                2: {id: 2, name: "Luke", children: [3, 4, 5], parents: [0]}, 
                3: {id: 3, name: "John", children: [], parents: [2]}, 
                4: {id: 4, name: "Peter", children: [], parents: [2]}, 
                5: {id: 5, name: "Lionel", children: [], parents: [2]}
            }; 
            window.localStorage.setItem('graph', JSON.stringify(data));
        } 
        this.nodes = deserialiseGraph(JSON.parse(window.localStorage.getItem('graph')));
    },
    
    _linkNode: function(event)
    {
        var fromNode = this.nodes[event.from];
        var toNode = this.nodes[event.to];
        var linkType = event.linkType;
        
        switch ( linkType ) {
            case 'parent':
                fromNode.parents.push(toNode);
                toNode.children.push(fromNode);
                break;
            case 'child':
                fromNode.children.push(toNode);
                toNode.parents.push(fromNode);  
                break;
            case 'sibling':
                throw new Error('Cannot add link as sibling, siblings not implemented yet');
        }

        window.localStorage.setItem('graph', JSON.stringify(serialiseGraph(this.nodes)));

        this.emit('change');        
    },
    
    _saveNode: function(newNode)
    {
        if ( newNode.id in this.nodes )
        {
             this.nodes[newNode.id].name = newNode.name;
        } else {
            this.nodes[newNode.id] = newNode;
            
            var parent = this.nodes[newNode.parent];
            parent.children.push(newNode);
            delete newNode.parent;
            newNode.parents = [parent];
            newNode.children = newNode.children ? newNode.children.map(function(c) {
                return this.nodes[c];
            }) : [];
        }
 
        window.localStorage.setItem('graph', JSON.stringify(serialiseGraph(this.nodes)));

        this.emit('change');
    },
    
    _deleteNode: function(data) {
        var nodeToDelete = data.deletedNodeId;
        
        var doomedNode = this.nodes[nodeToDelete];
        
        for ( var parentIdx in doomedNode.parents )
        {  
            var parent = doomedNode.parents[parentIdx];
            parent.children.splice(parent.children.indexOf(doomedNode), 1);
        }

        for ( var childIdx in doomedNode.children )
        {
            var child = doomedNode.children[childIdx];
            child.parents.splice(child.parents.indexOf(doomedNode), 1);
        }

        delete this.nodes[nodeToDelete];

        window.localStorage.setItem('graph', JSON.stringify(serialiseGraph(this.nodes)));
        this.emit('change');
    },
    
    getRelatedNodes: function(focussedNodeId, distance, newIndex)
    {  
        newIndex = newIndex || {};
        
        if ( focussedNodeId in newIndex ) {
            return newIndex[focussedNodeId];
        }
        
        if ( distance === 0 ) { 
            return flatten(this.nodes[focussedNodeId]);
        }
       
        
        var thisNode = flatten(this.nodes[focussedNodeId]);
        
        newIndex[thisNode.id] = thisNode;
        
        thisNode.parents = thisNode.parents.map(function(p) {
           if ( typeof p === 'object' ) return p; // if we're looping back on ourselves andd we've already created this object
           var parent = this.getRelatedNodes(p, distance-1, newIndex);
           parent.children = _.pull(parent.children, p);
           parent.children.push(thisNode);
           return newIndex[p] = parent;
        }.bind(this));

        thisNode.children = thisNode.children.map(function(c) {
           if ( typeof c === 'object' ) return c; // if we're looping back on ourselves andd we've already created this object
           var child = this.getRelatedNodes(c, distance-1, newIndex);
           child.parents = _.pull(child.parents, c);
           child.parents.push(thisNode);
           return newIndex[c] = child;
        }.bind(this));
        
        return thisNode;
    },
    
    getNode: function(nodeId)
    {
        return this.nodes[nodeId];
    }
    
});
