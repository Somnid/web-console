"use strict";
let Cmd = (function() {
	let defaults = {
		root: null, //required
		historyIndex: 0,
		commands: {}
	};

	function create(options) {
		let cmd = {};
		cmd.options = Object.assign({}, defaults, options);
		bind(cmd);
		cmd.init();
		return cmd;
	}

	function bind(cmd) {
		cmd.init = init.bind(cmd);
		cmd.cacheDom = cacheDom.bind(cmd);
		cmd.attachEvents = attachEvents.bind(cmd);
		cmd.enter = enter.bind(cmd);
		cmd.output = output.bind(cmd);
		cmd.message = message.bind(cmd);
		cmd.info = info.bind(cmd);
		cmd.error = error.bind(cmd);
		cmd.install = install.bind(cmd);

		cmd.triggerCommand = triggerCommand.bind(cmd);
		cmd.previousHistory = previousHistory.bind(cmd);
		cmd.nextHistory = nextHistory.bind(cmd);
	}

	function attachEvents() {
		this.dom.input.addEventListener("keydown", this.enter);
	}

	function cacheDom() {
		this.dom = {};
		this.dom.root = this.options.root;
		this.dom.input = this.dom.root.querySelector(".input");
		this.dom.list = this.dom.root.querySelector(".list");
	}

	function enter(e) {
		switch(e.which) {
			case 13:
				this.triggerCommand();
				return;
			case 38:
				this.previousHistory();
				return;
			case 40:
				this.nextHistory();
				return;
		}
	}

	function triggerCommand(){
		let value = this.dom.input.value;
		let cmdSplit = Util.splitWhitespace(value);
		let command = this.options.commands[cmdSplit[0]];
		this.info(value);
		if (command) {
			let commandPromise;
			if (command.flags && command.args) {
				commandPromise = command.run.apply(this, CmdHelper.parseArguments(cmdSplit.slice(1), command.args, command.flags));
			} else if (command.args) {
				commandPromise = command.run.apply(this, CmdHelper.parseArguments(cmdSplit.slice(1), command.args));
			}
			commandPromise
				.then(x => this.message(x))
				.catch(x => this.error(x));
		}else{
			this.message(`No known function ${cmdSplit[0]}`);
		}
		this.dom.input.value = "";
		this.dom.list.scrollTop = this.dom.list.scrollHeight;
		this.history.push(value);
		this.historyIndex = this.history.length - 1;
	}

	function previousHistory(){
		this.historyIndex--;
		this.historyIndex = Util.clamp(this.historyIndex, 0, this.history.length - 1);
		this.dom.input.value = this.history[this.historyIndex] || "";
	}

	function nextHistory(){
		this.historyIndex++;
		this.historyIndex = Util.clamp(this.historyIndex, 0, this.history.length - 1);
		this.dom.input.value = this.history[this.historyIndex] || "";
	}

	function output(text, type) {
		var li = document.createElement("li");
		li.textContent = text;
		li.classList.add(type);
		this.dom.list.appendChild(li);
	}

	function message(text){
		this.output(text, "message");
	}

	function error(text){
		this.output(text, "error");
	}

	function info(text){
		this.output(text, "info");
	}

	function install(command) {
		this.options.commands[command.name] = command;
		return new Promise((resolve, reject) => {
			if (command.dependencies) {
				let dependenciesPromises = command.dependencies.map(x => CmdHelper.loadScript(x)
																				  .then(y => this.message(`Loaded dependency ${y}.`))
																				  .catch(y => this.error(`Failed to load dependency ${y}`))
																	);
				return Util.asyncSequence(dependenciesPromises)
						.then(x => setTimeout(() => command.install.call(this), 1000));
			} else if (command.install) {
				return command.install.call(this);
			}
			return Promise.resolve(this);
		});
	}

	function init() {
		this.history = [];
		this.cacheDom();
		this.attachEvents();
	}
	return {
		create
	};
})();
