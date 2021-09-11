'use strict';

const Command = require('@cyan-cli/command');
const { verbose: verboseLog } = require('@cyan-cli/log');

// 继承自 Command 类，类交给子类必须实现 init 和 exec 方法，其实是子类重写咯～，具体可以点击进去看这两方法
class InitCommand extends Command {
  /**
   * 实现 init 命令初始化一些参数
   */
  init() {
    this.projectName = this._argv[0] || '';
    this.force = !!this._cmd.force;
    verboseLog('init project name', this.projectName);
    verboseLog('init is force', this.force);
  }

  /**
   * 实现 init 命令执行
   */
  exec() {
    console.log('init的业务逻辑');
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
