"use strict";
var Util = (function() {

	function isWhitespace(char) {
		var whitespace = [
			String.fromCharCode(13), //carriage return
			String.fromCharCode(10), //new line
			String.fromCharCode(32), //space
			String.fromCharCode(9) //tab
		];
		return whitespace.indexOf(char) != -1;
	}


	function splitWhitespace(text) {
		var split = [];
		var buffer = "";
		var quoted = false;
		var readWhitespace = false;
		for (var i = 0; i < text.length; i++) {
			if (isWhitespace(text[i]) && !quoted && !readWhitespace) {
				split.push(buffer);
				buffer = "";
				readWhitespace = true;
			} else if (isWhitespace(text[i]) && !quoted && readWhitespace) {
				continue;
			} else if (text[i] == "\"" && !quoted) {
				quoted = true;
				readWhitespace = false;
			} else if (text[i] == "\"" && quoted) {
				quoted = false;
				readWhitespace = false;
			} else {
				buffer += text[i];
				readWhitespace = false;
			}
		}
		if (buffer) {
			split.push(buffer);
		}

		return split;
	}

	function asyncSequence(promises) {
		return promises.reduce((cur, next) => cur.then(next), Promise.resolve());
	}

	function clamp(value, low, high) {
		low = low !== undefined ? low : Number.MIN_SAFE_INTEGER;
		high = high !== undefined ? high : Number.MAX_SAFE_INTEGER;
		if (value < low) {
			value = low;
		}
		if (value > high) {
			value = high;
		}
		return value;
	}

	return {
		isWhitespace,
		splitWhitespace,
		asyncSequence,
		clamp
	};

})();
