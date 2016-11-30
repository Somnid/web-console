"use strict";
let ImportCmd = (function() {
    const idb = IdbStorage.create({
      name : "cmd-storage",
      siloName : "import-storage"
    });

    function run(args, flags) {
      return CmdHelper.loadScript(args.url).then(x => {
          let message;
          if (flags.remember) {
            idb.set(`script-${args.url}`, `${args.url}`);
            message = `${x} was successfully imported and saved.`;
          }else{
            message =`${x} was successfully imported.`;
          }
          return message;
      });
    }

    function install(){
      return idb.getAll().then(x => {
        const scriptPromises = x.map(x => CmdHelper.loadScript(x));
        return Promise.all(scriptPromises)
                .then(x => {
                  this.message(`Imported ${x.join(", ")}.`);
                  return this;
                });
      });
    }

    return {
      install : install,
      run: run,
      name: "import",
      flags: {
          r: "remember"
      },
      args: {
          0: "url"
      }
    };
})();
