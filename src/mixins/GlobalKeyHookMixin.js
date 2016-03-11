module.exports = GlobalKeyHookMixin = {

    globalKeyHandler: function(e) {
        if ( !this.state.editNode ) {
            e = e || window.event;
            var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
            if (charCode) {
                var key = String.fromCharCode(charCode);
                if ( key in this.getKeyBindings() )
                {
                    this.getKeyBindings()[key](e);
                }
            }
        }
    },
    
    globalMetaKeyHandler: function(e)
    {
        if (!/[a-zA-Z0-9-_ ]/.test(String.fromCharCode(e.keyCode)))
        {
            if ( e.keyCode in this.getMetaKeyBindings() )
            {
                this.getMetaKeyBindings()[e.keyCode]();
            }
        }
    },
    
    componentDidMount: function() {
        window.addEventListener("keypress", this.globalKeyHandler, false );
        window.addEventListener("keyup", this.globalMetaKeyHandler, false );
    },

    componentWillUnmount: function() {
        window.removeEventListener("keypress", this.globalKeyHandler);
        window.removeEventListener("keyup", this.globalMetaKeyHandler);
    }
};