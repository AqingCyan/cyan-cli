'use strict';

const { isObject } = require('@cyan-cli/utils');

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空');
    }

    if (!isObject(options)) {
      throw new Error('Package类的options必须为对象');
    }

    // package的路径
    this.targetPath = options.targetPath;

    // package的存储路径
    this.storePath = options.storePath;

    // package的名字
    this.packageName = options.packageName;

    // package的版本
    this.packageVersion = options.packageVersion;
  }

  /**
   * 判断当前 package 是否存在
   */
  exists() {}

  /**
   * 安装 package
   */
  install() {}

  /**
   * 更新 package
   */
  update() {}

  /**
   * 获取入口文件路径
   */
  getRootFilePath() {}
}

module.exports = Package;
