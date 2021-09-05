'use strict';

const log = require('npmlog');

/**
 * 判断 debug 模式的 log 是否被打印，它受到 level 控制
 * 如果环境变量指明了 level 就使用对应的 log level，否者就默认用 info level
 * 关于 level 可以具体看 npmlog 的源码
 */
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

log.heading = 'CYAN';
log.headingStyle = { fg: 'black', bg: 'green' };
log.addLevel('success', 2000, { fg: 'green', bold: true });

module.exports = log;
