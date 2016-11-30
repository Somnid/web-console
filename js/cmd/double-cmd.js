"use strict";
let DoubleCmd = (function(){
	function run(args, flags){
		this.message(args.text + " " + args.text);
	}

	return {
		run : run,
		name : "double",
		args : {
			0 : "text"
		}
	};
})();
window.registerCommand(DoubleCmd);
