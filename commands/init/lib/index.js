'use strict';

const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const semver = require('semver');

const Command = require('@cyan-cli/command');
const { verbose: verboseLog, error: errorLog } = require('@cyan-cli/log');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

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
    return this.getProjectInfo();
  }

  /**
   * 获取项目填入信息
   */
  async getProjectInfo() {
    const projectInfo = {};

    // project or component
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [
        { name: '项目', value: TYPE_PROJECT },
        { name: '组件', value: TYPE_COMPONENT },
      ],
    });

    verboseLog('init type is', type);

    if (type === TYPE_PROJECT) {
      const o = await inquirer.prompt([
        {
          type: 'input',
          message: '请输入项目的名称',
          name: 'projectName',
          validate: function (v) {
            const reg = /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;
            const done = this.async();
            setTimeout(() => {
              if (!reg.test(v)) {
                done('你应该输入合法的项目名称：字母数字组合，且开头应该为字母，仅允许 _ - 符号');
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入项目版本号',
          default: '1.0.0',
          validate: function (v) {
            const done = this.async();
            setTimeout(() => {
              if (!semver.valid(v)) {
                done('你应该输入合法的版本号，例如：v1.0.0 或者 1.0.0');
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            if (!!semver.valid(v)) {
              return semver.valid(v);
            }
            return v;
          },
        },
      ]);

      console.log(o);
    } else if (type === TYPE_COMPONENT) {
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
