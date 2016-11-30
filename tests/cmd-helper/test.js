QUnit.module("parseArguments");
QUnit.test("should get one arg", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["command"], { 0: "command" });
  assert.equal(args.command, "command");
});
QUnit.test("should get two args", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["command", "subcommand"], { 0: "command", 1: "subcommand" });
  assert.equal(args.command, "command");
  assert.equal(args.subcommand, "subcommand");
});
QUnit.test("should get one unmapped arg", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["command"]);
  assert.equal(args[0], "command");
});
QUnit.test("should get two unmapped arg", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["command", "subcommand"]);
  assert.equal(args[0], "command");
  assert.equal(args[1], "subcommand");
});
QUnit.test("should get mapped and unmapped args", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["command", "subcommand",], { 0: "command" });
  assert.equal(args.command, "command");
  assert.equal(args[1], "subcommand");
});
QUnit.test("should get one flag", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["-f"], null, { "f" : "flag" });
  assert.equal(flags.flag, true);
});
QUnit.test("should get two flags", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["-f", "-e"], null, { "f" : "flag", "e" : "else" });
  assert.equal(flags.flag, true);
  assert.equal(flags.else, true);
});
QUnit.test("should not get missing flag", function(assert){
  const [args, flags] = CmdHelper.parseArguments([], null, { "f" : "flag" });
  assert.equal(flags.flag, false);
});
QUnit.test("should get unmapped flag", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["-r"], null, { "f" : "flag" });
  assert.equal(flags.r, true);
});
QUnit.test("should get mix of args", function(assert){
  const [args, flags] = CmdHelper.parseArguments(["command", "-f", "subcommand", "-e"], { 0: "command" }, { "f" : "flag", "r" : "reverse" });
  assert.equal(args.command, "command");
  assert.equal(args[1], "subcommand");
  assert.equal(flags.flag, true);
  assert.equal(flags.e, true);
  assert.equal(flags.reverse, false);
});
