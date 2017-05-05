var taskRunner = require('../index');
var tp = require('./tasksPallete');

var setupEventHandlers = function(tr1){
    tr1.on("task-finished",function(s,e){
        console.log("TASK FINISHED",e);
        tr1.detachEvent("task-finished",this);
    });

    tr1.on("context-changed",function(s,e,c){
        console.log("Received SIGNAL context-changed with data",e);
        if(c){
            c("DONE");
        }
    });
    tr1.on("workflow-finished",function(){
        console.error("Workflow Finished");
    })

}

var start = function(){
    var tr1 = new taskRunner.TaskRunner();
    tr1.task("say-hello", tp.sayHello);
    tr1.task("do-something-else",tp.SomethingElse)
    tr1.task("async-task",tp.asyncTask);
    tr1.task("say-good-bye",tp.sayGoodBye);
    tr1.task("set-context",tp.setContext);
    tr1.task("get-context",tp.getContext);
    setupEventHandlers(tr1);
    
    //taskrunner mode
    tr1.workflow("default",["say-hello","set-context","get-context","do-something-else","async-task","say-good-bye"]);
    tr1.start("default");
    var r = tr1.getVar("Obj");
    console.log(r);

}

start();