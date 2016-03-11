var Fluxxor = require('fluxxor');
var _ = require('lodash');

module.exports = GraphStore = Fluxxor.createStore({
    actions: {
        "DELETE_NODE": "_deleteNode",
        "SAVE_NODE": "_saveNode"
    },

    initialize: function(options) {
        if ( !window.localStorage.getItem('graph' ) ) {
            this.nodes = {
                0: {id: 0, name: "Matthew", children: [ 1, 2 ]}, 
                1: {id: 1, name: "Mark", children: []}, 
                2: {id: 2, name: "Luke", children: [3, 4, 5]}, 
                3: {id: 3, name: "John", children: []}, 
                4: {id: 4, name: "Peter", children: []}, 
                5: {id: 5, name: "Lionel", children: []}
            }; 
            window.localStorage.setItem('graph', JSON.stringify(this.nodes));
        } else { 
            this.nodes = JSON.parse(window.localStorage.getItem('graph'));
        }
    },

    _saveNode: function(newNode)
    {
        if ( newNode.id in this.nodes )
        {
             // node already exists, merge it (isn't merging stuff a bit 'actiony'?
             this.nodes[newNode.id].name = newNode.name;
        } else {
            this.nodes[newNode.parent].children.push(newNode.id);
            delete newNode.parent;
            this.nodes[newNode.id] = newNode;
        }
 
        window.localStorage.setItem('graph', JSON.stringify(this.nodes));

        this.emit('change');
    },
    
    _deleteNode: function(data) {
        var nodeToDelete = data.deletedNodeId;
        
        var doomedNode = this.nodes[nodeToDelete];
        
        // find nodes where doomedNode is a child
        var parents = _.filter(this.nodes, function(n) {
            // return TRUE if n.children contains doomedNode.id
            return _.indexOf(n.children, nodeToDelete) != -1;
        });

        parents.forEach(function(parent) {
            _.pull(parent.children, nodeToDelete);
        });

        delete this.nodes[nodeToDelete];

        window.localStorage.setItem('graph', JSON.stringify(this.nodes));
        this.emit('change');
    },
    
    getRelatedNodes: function(focussedNodeId)
    {  
        var focussedNode = this.nodes[focussedNodeId];
        return [focussedNode]
            .concat(this.getParents(focussedNodeId)) // find parents
            .concat(_.map(focussedNode.children, function(nid) { return this.nodes[nid];}.bind(this)))
            ;
    },
    
    getNode: function(nodeId)
    {
        return this.nodes[nodeId];
    },
    
    getParents: function(nodeId) {
        return _.filter(this.nodes, function(n) { return _.indexOf(n.children, nodeId) != -1 });
    }
});
