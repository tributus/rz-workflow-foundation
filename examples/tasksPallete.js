module.exports = {
    sayHello: function(container,done){
        console.log("Hello");
        done();
    },
    sayGoodBye: function(container,done){
        console.log("Good by");
        done();
    },
    setContext: function(container,done,signal){
        container.setVar("Foo","BAH");
        container.setVar("Obj",{v1:"x",v2:"y"});
        signal("context-changed",{},function(cbdata){
            console.log("SIGNAL CALLBACK")
        });
        done();
    },
    getContext: function(container,done){
        console.log("The value of FOO is ",container.getVar("Foo"));
        done();
    }
}