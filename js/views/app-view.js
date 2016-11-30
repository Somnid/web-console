var AppView = (function(){

	function create(){
		var appView = {};
		bind(appView);
		appView.init();
		return appView;
	}

	function bind(appView){
		appView.installServiceWorker = installServiceWorker.bind(appView);
		appView.serviceWorkerInstalled = serviceWorkerInstalled.bind(appView);
		appView.serviceWorkerInstallFailed = serviceWorkerInstallFailed.bind(appView);
		appView.cacheDom = cacheDom.bind(appView);
		appView.attachEvents = attachEvents.bind(appView);
		appView.attachSubviews = attachSubviews.bind(appView);
		appView.init = init.bind(appView);
		appView.registerCommand = registerCommand.bind(appView);
	}

	function installServiceWorker(){
		if("serviceWorker" in navigator){
			navigator.serviceWorker.register("service-worker.js", {scope: "./"})
				.then(this.serviceWorkerInstalled)
				.catch(this.serviceWorkerInstallFailed);
		}
	}

	function serviceWorkerInstalled(registration){
		console.log("App Service registration successful with scope:", registration.scope);
	}

	function serviceWorkerInstallFailed(error){
		console.error("App Service failed to install", error);
	}

	function cacheDom(){
		this.dom = {};
		this.dom.console = document.querySelector(".console");
	}

	function attachEvents(){
	}

	function attachSubviews(){
		this.cmd = Cmd.create({
			root : this.dom.console
		});
		this.cmd.install(EchoCmd);
		this.cmd.install(ImportCmd);
		window.registerCommand = this.registerCommand;
	}

	function registerCommand(name, func){
		this.cmd.install(name, func);
	}

	function init(){
		this.installServiceWorker();
		this.cacheDom();
		this.attachEvents();
		this.attachSubviews();
	}

	return {
		create : create
	};

})();
