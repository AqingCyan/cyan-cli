'use strict';

const path = require('path');
const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');

const { isObject } = require('@cyan-cli/utils');
const { getDefaultRegistry } = require('@cyan-cli/get-npm-info');
const formatPath = require('@cyan-cli/format-path');

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空');
    }

    if (!isObject(options)) {
      throw new Error('Package类的options必须为对象');
    }

    // package的目标路径
    this.targetPath = options.targetPath;

    // package的缓存路径
    this.storeDir = options.storeDir;

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
  install() {
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkg: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  /**
   * 更新 package
   */
  update() {}

  /**
   * 获取入口文件路径
   */
  getRootFilePath() {
    // 获取 package.json 的路径
    const dir = pkgDir(this.targetPath);

    // 检查判断并返回 package 入口文件路径
    if (dir) {
      const pkgFile = require(path.resolve(dir, 'package.json'));
      if (pkgFile && pkgFile.main) {
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }

    return null;
  }
}

module.exports = Package;
