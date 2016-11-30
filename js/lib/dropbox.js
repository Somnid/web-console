const Dropbox = (function() {

	const defaults = {
		appKey: "", //required
		namespace: self.location.origin + self.location.pathname,
		externalAuthFlow: false, //don't try to get token.  Wait for someone to call setToken.
		landingUrl: null //if left null uses current window url or first found client url
	};

	function create(options) {
		const dropbox = {};
		dropbox.options = Object.assign({}, defaults, options);
		bind(dropbox);
		return dropbox.init()
			.then(() => dropbox);
	}

	function bind(dropbox) {
		dropbox.init = init.bind(dropbox);
		dropbox.checkToken = checkToken.bind(dropbox);
		dropbox.getOwn = getOwn.bind(dropbox);
		dropbox.setOwn = setOwn.bind(dropbox);
		dropbox.authorize = authorize.bind(dropbox);
		dropbox.isAuthorized = isAuthorized.bind(dropbox);

		dropbox.download = download.bind(dropbox);
		dropbox.upload = upload.bind(dropbox);
		dropbox.folderGetLatestCursor = folderGetLatestCursor.bind(dropbox);
		dropbox.folderLongPoll = folderLongPoll.bind(dropbox);
		dropbox.listFolder = listFolder.bind(dropbox);
		dropbox.getMetadata = getMetadata.bind(dropbox);

		dropbox.setupStorage = setupStorage.bind(dropbox);
		dropbox.getStored = getStored.bind(dropbox);
		dropbox.setStored = setStored.bind(dropbox);
		dropbox.setToken = setToken.bind(dropbox);
		dropbox.getTokenAndUid = getTokenAndUid.bind(dropbox);
	}

	function setOwn(key, value) {
		return this.setStored(`${this.options.namespace}-${key}`, value);
	}

	function getOwn(key) {
		return this.getStored(`${this.options.namespace}-${key}`);
	}

	function authorize() {
		const registrationUrlBase = `https://www.dropbox.com/oauth2/authorize?response_type=token&client_id=${this.options.appKey}&redirect_uri=`;
		if (self.Window && self instanceof Window) {
			const landingUrl = this.options.landingUrl || self.location.href;
			window.location.href = registrationUrlBase + landingUrl;
			return;
		} else if (self.ServiceWorkerGlobalScope && self instanceof ServiceWorkerGlobalScope) {
			return self.clients.matchAll().then(clients => {
				const landingUrl = this.options.landingUrl || clients[0].url;
				const registrationUrl = registrationUrlBase + landingUrl;
				return clients[0].navigate(registrationUrl).then(x => x.focus());
			});
		}
	}

	function isAuthorized() {
		return this.getTokenAndUid().then(([x, y]) => !!x && !!y);
	}

	function getTokenAndUid() {
		return Promise.all([this.getOwn("access_token"), this.getOwn("uid")]);
	}

	function setToken(token, uid) {
		this.token = token;
		this.uid = uid;
		return Promise.all([
			this.setOwn("access_token", token),
			this.setOwn("uid", uid)
		]);
	}

	function checkToken(hash) {
		var params = new URLSearchParams(hash || self.location.hash.substr(1));
		if (params.has("access_token")) {
			let token = params.get("access_token");
			let uid = params.get("uid");
			this.setToken(token, uid);
		} else {
			return Promise.all([
				this.getOwn("access_token").then(x => this.token = x),
				this.getOwn("uid").then(x => this.uid = x)
			]);
		}
	}

	function download(path) {
		const arg = {
			path: path
		};
		return this.getTokenAndUid().then(([token, uid]) => {
			return fetch("https://content.dropboxapi.com/2/files/download", {
				headers: new Headers({
					"Authorization": `Bearer ${token}`,
					"Dropbox-API-Arg": JSON.stringify(arg)
				}),
				method: "POST"
			});
		});
	}

	function upload(content, options) {
		if (options.mode) {
			options.mode = {
				".tag": options.mode
			};
		}
		if (typeof(content) === "string") {
			content = stringToArrayBuffer(content);
		}
		return this.getTokenAndUid().then(([token, uid]) => {
			return fetch("https://content.dropboxapi.com/2/files/upload", {
				headers: new Headers({
					"Authorization": `Bearer ${this.token}`,
					"Dropbox-API-Arg": JSON.stringify(options),
					"Content-Type": "application/octet-stream"
				}),
				method: "POST",
				body: content
			});
		});
	}

	/*{
		"path": "/Homework/math",
		"recursive": false,
		"include_media_info": false,
		"include_deleted": false,
		"include_has_explicit_shared_members": false
	}*/
	function folderGetLatestCursor(options) {
		return fetch("https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor", {
			headers: new Headers({
				"Authorization": `Bearer ${this.token}`,
				"Content-Type": "application/json"
			}),
			method: "POST",
			body: JSON.stringify(options)
		}).then(x => x.json());
	}

	/*{
    	"cursor": "ZtkX9_EHj3x7PMkVuFIhwKYXEpwpLwyxp9vMKomUhllil9q7eWiAu",
    	"timeout": 30
	}*/
	function folderLongPoll(options) {
		if (this.backoff && new Date() - this.backoff.start < this.backoff.duration * 1000) {
			return;
		}
		return fetch("https://notify.dropboxapi.com/2/files/list_folder/longpoll", {
				headers: new Headers({
					"Content-Type": "application/json"
				}),
				method: "POST",
				body: JSON.stringify(options)
			})
			.then(x => x.json())
			.then(x => {
				if (x.backoff) {
					console.warn("We've been asked to back off.")
					this.backoff = {
						duration: x.backoff,
						start: new Date()
					};
				}
				return x;
			});
	}

	function listFolder(path) {
		return fetch("https://api.dropboxapi.com/2/files/list_folder", {
			headers: new Headers({
				"Authorization": `Bearer ${this.token}`,
				"Content-Type": "application/json"
			}),
			method: "POST",
			body: JSON.stringify({
				path
			})
		}).then(parseResponse);
	}

	function getMetadata(path){
		return fetch("https://api.dropboxapi.com/2/files/get_metadata", {
			headers: new Headers({
				"Authorization": `Bearer ${this.token}`,
				"Content-Type": "application/json"
			}),
			method: "POST",
			body: JSON.stringify({
				path
			})
		}).then(parseResponse);
	}

	function parseResponse(response){
		const contentType = response.headers.get("content-type");
		if(contentType === "application/json"){
			return response.json();
		}else{
			return response.text();
		}
	}

	function stringToArrayBuffer(string) {
		var arrayBuffer = new ArrayBuffer(string.length);
		var uInt8Array = new Uint8Array(arrayBuffer);

		for (var i = 0; i < string.length; i++) {
			uInt8Array[i] = string.charCodeAt(i);
		}

		return arrayBuffer;
	}

	function init() {
		return this.setupStorage()
			.then(() => {
				return Promise.all([
					this.getOwn("access_token").then(x => this.token = x),
					this.getOwn("uid").then(x => this.uid = x)
				]);
			})
			.then(() => {
				if ((!this.token || !this.uid) && !this.options.externalAuthFlow) {
					this.checkToken();
				}
			});
	}

	function getStored(accessor) {
		return new Promise((resolve, reject) => {
			const transaction = this.idb.transaction("db-cache", "readonly");
			const store = transaction.objectStore("db-cache");
			const request = store.get(accessor);
			request.onerror = () => reject(request.error);
			request.onsuccess = (e) => {
				resolve(e.target.result);
			};
		});
	}

	function setStored(accessor, value) {
		return new Promise((resolve, reject) => {
			const transaction = this.idb.transaction("db-cache", "readwrite");
			const store = transaction.objectStore("db-cache");
			const request = store.put(value, accessor);
			request.onerror = () => reject(request.error);
			request.onsuccess = (e) => {
				resolve(e.target.result);
			}
		});
	}

	function setupStorage() {
		if (this.idb) {
			return;
		}
		this.idb = new Promise((resolve, reject) => {
			let openRequest = indexedDB.open("db-cache-storage", 1);
			openRequest.onerror = () => reject(openRequest.error);
			openRequest.onupgradeneeded = (e) => {
				if (!e.target.result.objectStoreNames.contains("db-cache")) {
					e.target.result.createObjectStore("db-cache");
				}
			};
			openRequest.onsuccess = () => resolve(openRequest.result);
		});
		return this.idb.then(x => this.idb = x);
	}

	return {
		create: create
	};

})();
