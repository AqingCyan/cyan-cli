'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

/**
 * 从 npm.org 获取 npm 包的信息
 * @param npmName
 * @param registry
 */
function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }

  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  return axios
    .get(npmInfoUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        return null;
      }
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

/**
 * 获取 npm 源地址
 * @param isOriginal
 * @returns {string}
 */
function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

/**
 * 获取 npm 包的所有版本
 * @param npmName
 * @param registry
 * @returns {Promise<string[]|*[]>}
 */
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

/**
 * 获取大于指定版本的版本号
 * @param baseVersion
 * @param versions
 */
function getSemverVersions(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
}

/**
 * 获取对应 npm 包大于指定版本的版本号们
 * @param baseVersion
 * @param npmName
 * @param registry
 * @returns {Promise<void>}
 */
async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersion = getSemverVersions(baseVersion, versions);
  if (newVersion && newVersion.length > 0) {
    return newVersion[0];
  }
}

/**
 * 获取 package 的最新版本
 * @param npmName
 * @param registry
 * @returns {Promise<null|*>}
 */
async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[0];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
};
