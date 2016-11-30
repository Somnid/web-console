const MimeMapper = (function() {
	const mimeTypes = {
		"html": "text/html",
		"css": "text/css",
		"js": "application/javascript",
		"json": "application/json",
		"txt": "text/plain",
		"woff": "application/font-woff",
		"woff2": "font/woff2",
		"svg": "image/svg+xml",
		"gif": "image/gif",
		"jpg": "image/jpeg",
		"jpeg": "image/jpeg",
		"png": "image/png",
		"mustache": "text/plain",
		"ico": "image/x-icon",
		"map": "application/json",
		"mp3": "audio/mpeg",
		"mp4": "video/mp4",
		"*": "application/octet-stream"
	};

	function map(url) {
		return getMappedValue(getExtension(url), mimeTypes);
	}

	function getMappedValue(value, map){
		let result = map[value];
		if(!result){
			result = map["*"];
		}
		return result;
	}

	function getExtension(path) {
		const split = path.split(".");
		return split[split.length - 1];
	}

	return {
		map,
		getExtension
	};
})();
