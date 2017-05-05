module.exports = { 
    RulesEngine:function(){
        var rules = {};
        this.rule = function(ruleName,handler){
            rules[ruleName] = handler;
        }
        this.when = function(ruleDescription,value,whenMatched,whenNotMatched){
            whenMatched = whenMatched || function(){};
            whenNotMatched = whenNotMatched || function(){};
            var ruleHandle =rules[ruleDescription];
            if(ruleHandle){
                try{
                    ruleHandle(value,whenMatched,whenNotMatched);
                }
                catch(ex){
                    return whenNotMatched({errors:[{
                        message:"error checking rules",
                        details:ex
                    }]});
                }
                
            }
            else{
                return whenNotMatched({validationFails:[{message:"rule not found"}]});
            }
        }
    }
}