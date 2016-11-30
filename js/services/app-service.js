var AppService = (function(){

	var defaults = {
		cacheName : "app-shell"
	};

	function create(options){
		var appService = {};
		appService.options = Object.assign({}, defaults, options);
		bind(appService);
		appService.init();
		return appService;
	}

	function bind(appService){
		appService.init = init.bind(appService);
		appService.attachEvents = attachEvents.bind(appService);
		appService.onInstall = onInstall.bind(appService);
		appService.onFetch = onFetch.bind(appService);
	}

	function attachEvents(){
		self.addEventListener("install", this.onInstall);
		self.addEventListener("fetch", this.onFetch);
	}

	function onInstall(e){
	}

	function onFetch(e){
		let responsePromise;
		if(/github/.test(e.request.url)){
			responsePromise = fetchWithFixedMimeType(e.request);
		}else{
			responsePromise = fetch(e.request);
		}
		e.respondWith(responsePromise);
	}

	function fetchWithFixedMimeType(request){
		return fetch(request)
			.then(x => x.blob())
			.then(x => {
				const blob = new Blob([x], { type : MimeMapper.map(request.url) });
				return new Response(blob, {
					headers : new Headers({
					"Content-Type" : mimeType
				})
			});
		});
	}

	function init(){
		this.attachEvents();
	}

	return {
		create : create
	};

})();
