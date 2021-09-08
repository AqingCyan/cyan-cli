'use strict';

const path = require('path');
const fse = require('fs-extra');
const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');
const pathExists = require('path-exists').sync;

const { isObject } = require('@cyan-cli/utils');
const { getDefaultRegistry, getNpmLatestVersion } = require('@cyan-cli/get-npm-info');
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

    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  /**
   * 预先处理
   */
  async prepare() {
    // 判断是否有缓存目录，没有则创建一个
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }

    // 当 package 的版本是 latest 时，获取最新版本号
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  // 缓存中依赖的文件名
  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`,
    );
  }

  /**
   * 获取指定版本的缓存 package 路径
   * @param packageVersion
   */
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`,
    );
  }

  /**
   * 判断当前 package 是否存在
   */
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  /**
   * 安装 package
   */
  async install() {
    await this.prepare();

    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  /**
   * 更新 package
   */
  async update() {
    await this.prepare();

    // 获取最新版本号并查询缓存，没有则安装最新版
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);

    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{ name: this.packageName, version: latestPackageVersion }],
      });
      this.packageVersion = latestPackageVersion;
    }
  }

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
