"use strict"
const DbxCmd = (function() {
	const idb = IdbStorage.create({
		name: "cmd-storage",
		siloName: "dbx-storage"
	});
	let db;
	let cwd = "";

	const subcommandMap = {
		"setup": setup,
		"ls": ls,
		"cd": cd
	};

	function run(args, flags) {
		let subcommand = subcommandMap[args.subcommand];
		if (subcommand) {
			return subcommand(args, flags);
		}
		return Promise.reject(`DBX Command ${args.subcommand} does not exist`);
	}

	function setup(args) {
		return db.then(x => x.authorize());
	}

	function ls(args) {
		return db.then(x => x.listFolder(cwd)).then(x => x.entries.map(y => y.path_lower).join("\n"));
	}

	function cd(args) {
		const path = resolveRelativeUrl(args[1], cwd);
		return db.then(x => x.getMetadata(path).then(x => {
			if((typeof(x) === "string" && /root folder is unsupported/.test(x)) || (x[".tag"] === "folder")){

				cwd = path;
				return `dbx:${x.path_lower || ""}`;
			}
			throw `${path} is not a valid path`;
		}))
	}

	function install() {
		db = Dropbox.create({
			appKey: "6lgexxxicnxaq7g"
		});
	}

	function getParentDirectory(path) {
		return path.substring(0, path.lastIndexOf("/"));
	}

	function resolveRelativeUrl(url, base) {
		base = base.replace(/\/$/, "");
        if (/^\//.test(url)) {
            return base + "/" + url.substr(1).replace(/\/$/, "");
        }
        if(/^\.\./.test(url)){
			return resolveRelativeUrl(url.replace(/^\.\.\/?/,""), getParentDirectory(base))
		}
		return (base + "/" + url).replace(/\/$/,"");
    }

	return {
		run,
		install,
		dependencies: [
			"js/lib/dropbox.js"
		],
		name: "dbx",
		args: {
			0: "subcommand"
		}
	};
})();
window.registerCommand(DbxCmd);
