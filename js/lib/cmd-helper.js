const CmdHelper = (function(){

  function loadScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        document.body.appendChild(script);
        script.addEventListener("load", e => resolve(e.target.src), { once : true });
        script.addEventListener("error", e => reject(`Import ${e.target.src} failed to load.`));
      });
  }

  function parseArguments(args, argMap = {}, flagMap = {}) {
      let flagHash = {};
      let argHash = {};
      let argIndex = 0;
      let argMappedIndex = 0;

      for(let key in flagMap){ //set all flags to false so they are not undefined at the end
        flagHash[flagMap[key]] = false;
      }
      for (let arg of args) {
          if (arg.charAt(0) == "-") {
            let flagName = arg.slice(1);
            let mapping = flagMap[arg.slice(1)];
            if(mapping !== undefined){
              flagHash[mapping] = true;
            }else{
              flagHash[flagName] = true;
            }
          } else {
              let mapping = argMap[argIndex];
              if(mapping !== undefined){
                argHash[mapping] = arg;
                argIndex++;
              }else {
                argHash[argMappedIndex] = arg;
              }
              argMappedIndex++;
          }
      }

      return [argHash, flagHash];
  }

  return {
    loadScript,
    parseArguments
  };

})();
