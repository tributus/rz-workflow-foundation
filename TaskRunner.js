module.exports={
    TaskRunner:function(){
        var tasks={};
        var context={};
        var workflows={};
        var eventHandlers={
            "task-started":[],
            "task-finished":[],
            "workflow-started":[],
            "workflow-finished":[]
        };
        var signals={};
        var $this = this;
        
        var executeTask = function(workFlow,step,previousStep){
            var transition = workFlow[step];
            console.log("Executing transition: " + transition);
            if(typeof transition=="string"){
                //implicit transition
                var task = tasks[transition];
                if(task){
                    raiseEvent("task-started",{context:context,workflow:workFlow,step:step,previousStep:previousStep});
                    task($this,stepDone,signalHandler,previousStep);
                }
                else{
                    throw "Task \"*\" not found".replace("*",transition);
                }
            }
            else{
                throw "NOT IMPLEMENTED";
            }
        }

        var stepDone = function(status,stepData){
            var workflow = workflows[context.runningWorkflowName];

            var previousStep = {
                taskName: workflow[context.currentStep],
                step: context.currentStep,
                status: status || "0",
                stepData:stepData
            }
            raiseEvent("task-finished",previousStep);
            context.currentStep++;
            
            if(context.currentStep < workflow.length){
                executeTask(workflow,context.currentStep,previousStep);
            }
            else{
                finishWorkflowExecution();
            }
        }

        var finishWorkflowExecution = function(){
            raiseEvent("workflow-finished",{context:context});
        }

        this.task = function(taskName,handler){
            tasks[taskName]=handler;
            
        }
        this.workflow = function(workflowName,workflowHandler){
            workflows[workflowName]=workflowHandler
        }
        this.setVar = function(varName,value){
            context[varName]=value;
        }
        this.getVar = function(varName){
            return context[varName];
        }
        this.start = function(workflowName){
            var workflow = workflows[workflowName];
            if(workflow){
                context.runningWorkflowName=workflowName;
                context.currentStep=0;
                raiseEvent("workflow-started",{context:context});
                executeTask(workflow,0);
            }
            else{
                throw "workflow not found: " + workflowName;
            }
        }
        
        //event handling
        this.on = function(eventName,eventHandler){
            if(!eventHandlers[eventName]){
                if(!signals[eventName]){
                    signals[eventName] = [];
                }
                signals[eventName].push(eventHandler);
            }
            else{
                eventHandlers[eventName].push(eventHandler);
            }        
        }
        this.detachEvent = function(eventName,eventHandler){
            if(eventHandlers[eventName]){
                var index = eventHandlers[eventName].indexOf(eventHandler);
                eventHandlers[eventName].splice(index, 1);
            }
            
        }
        var raiseEvent = function(eventName,eventData){
            var handlerList = eventHandlers[eventName];
            if(handlerList){
                handlerList.forEach(function(it){
                    it($this,eventData);
                });
            }
        }
        var signalHandler = function(signalName,signalData,callback){
            if(!eventHandlers[signalName]){
                var handlerList = signals[signalName];
                if(handlerList){
                    handlerList.forEach(function(it){
                        it($this,signalData,callback);
                    });
                }
            }
            else{
                throw "invalid signal \"" + signalName + "\". Use another signal name";
            }
        }
    }
}