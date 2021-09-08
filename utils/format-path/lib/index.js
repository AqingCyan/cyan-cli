'use strict';

const path = require('path');

/**
 * 不同 OS 下的路径兼容
 * @param p
 * @returns {*}
 */
module.exports = function formatPath(p) {
  if (p) {
    // 获取路径分割符
    const sep = path.sep;
    if (sep === '/') {
      return p;
    }
    return p.replace(/\\/g, '/');
  }
  return p;
};
