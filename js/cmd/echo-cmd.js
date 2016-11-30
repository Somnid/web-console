"use strict";
let EchoCmd = (function(){
	function run(args, flags){
		this.message(args.text);
	}

	return {
		run : run,
		name : "echo",
		args : {
			0 : "text"
		}
	};
})();
