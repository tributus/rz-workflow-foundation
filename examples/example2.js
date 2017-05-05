var wff = require('../index');


var start = function(){
    var re = new wff.RulesEngine();
    var obj = {
        val1:1,
        val2:"ok"
    }
    re.rule("is ok",function(value, match,nomatch){
        if(value && value.val1==1 && value.val2=="ok"){
            return match();
        }
        else{
            return nomatch("fail in some rule");
        }
    });

    re.when("is ok",obj,function(){
        console.log("Matched !!!");
    });
}

start();