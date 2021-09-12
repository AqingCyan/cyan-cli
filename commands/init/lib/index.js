'use strict';

const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');

const Command = require('@cyan-cli/command');
const { verbose: verboseLog, error: errorLog } = require('@cyan-cli/log');

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
  async exec() {
    try {
      const ret = await this.prepare();

      if (ret) {
      }
    } catch (error) {
      errorLog(error);
    }
  }

  /**
   * init exec 准备阶段：判断当前目录是否为空，是否强制更新，选择创建项目和组件，获取项目基本信息
   */
  async prepare() {
    const localPath = process.cwd();

    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;

      if (!this.force) {
        const { isContinue } = await inquirer.prompt({
          type: 'confirm',
          name: 'isContinue',
          default: false,
          message: '当前文件夹不为空，是否继续创建项目？',
        });

        if (!isContinue) return;
        ifContinue = isContinue;
      }

      if (ifContinue || this.force) {
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否确认清空当前目录下的文件？',
        });

        if (confirmDelete) {
          fse.emptyDirSync(localPath);
        }
      }
    }
  }

  /**
   * 判断安装模板目录是否为空
   * @param localPath
   * @returns {boolean}
   */
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(
      (file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0,
    );
    return !fileList || fileList.length === 0;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
