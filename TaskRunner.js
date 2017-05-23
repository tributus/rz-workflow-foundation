module.exports={
    TaskRunner:function(){
        var tasks={};
        var context={};
        var workflows={};
        var executionLog=[];
        var eventHandlers={
            "task-started":[],
            "task-finished":[],
            "workflow-started":[],
            "workflow-finished":[],
            "workflow-stoped":[]
        };
        var signals={};
        var $this = this;
        
        var executeTask = function(workFlow,step,previousStep){
            var transition = workFlow[step];
            console.log("Executing transition: " + transition);
            if(transition && typeof transition=="string"){
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

        var registerTaskExecutionLog = function(data){
            executionLog.push(data);
        }

/**
 * handle stepDone actions
 * @param {int} status exit code of execution (0 to indicate success or an arbitrary error code)
 * @param {*} stepData additional data produced by step execution
 */
        var stepDone = function(status,stepData){
            var workflow = workflows[context.runningWorkflowName];
            var previousStep = {
                taskName: workflow[context.currentStep],
                step: context.currentStep,
                status: status || 0,
                stepData:stepData
            }
            registerTaskExecutionLog(previousStep);
            raiseEvent("task-finished",previousStep);
            if(status!=255){
                context.currentStep++;
                if(context.currentStep < workflow.length){
                    setTimeout(function(){
                        return executeTask(workflow,context.currentStep,previousStep);
                    },1);
                    
                }
                if(context.currentStep==workflow.length && !context.isWorkflowFinished){
                    context.isWorkflowFinished=true;
                    finishWorkflowExecution();
                }
            }
            else{
                raiseEvent("workflow-stoped",{status:255,context:context});
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

        //workflow data handling
        this.setVar = function(varName,value){
            context[varName]=value;
        }
        this.getVar = function(varName){
            return context[varName];
        }

        this.getExecutionLog = function(){
            return executionLog;
        }

        //workflow execution
        reset = function(){
            context.currentStep=0;
            executionLog=[];
            context.isWorkflowFinished=false;
        }


        /**
         * Starts a predefined workflow
         * @param {*} workflow name ("default" if not defined)
         */
        this.start = function(workflowName){
            workflowName = workflowName || "default";
            var workflow = workflows[workflowName];
            if(workflow){
                context.runningWorkflowName=workflowName;
                reset();
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