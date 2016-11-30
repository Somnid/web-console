const Args = (function(){

  function create(argList){
    let args = {};
    args.argList = argList;
    bind(args);
    return args;
  }

  function bind(args){
    args.get = get.bind(args);
  }

  function get(key){
    if(typeof key === "Number"){
      return this.argList.filter(x => x.index === key)[0];
    }
    return this.argList.filter(x => x.name === key)[0];
  }

})();
