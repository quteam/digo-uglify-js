/**
 * @fileOverview digo 插件：使用 UglifyJS 混淆、压缩或格式化 JS
 * @author xuld <xuld@vip.qq.com>
 * @license MIT
 * @see https://github.com/mishoo/UglifyJS2
 */
var uglifyJS = require("uglify-js");

module.exports = function UglifyJS(file, options) {

    // 设置默认选项。
    options = merge(options, {
        fromString: true,
        inSourceMap: file.sourceMapData,
        outSourceMap: file.sourceMap,
        parse: {
            filename: file.srcPath
        },
        compress: {
            drop_console: true,
            dead_code: true,
            drop_debugger: true,
            global_defs: {
                DEBUG: false,
                RELEASE: true
            }
        },
        output: {
            comments: /^!|@preserve|@license|@cc_on/
        }
    });

    // 设置警告函数。
    if (options.warnings || options.compress.warnings) {
        var oldWarnFunction = uglifyJS.AST_Node.warn_function;
        uglifyJS.AST_Node.warn_function = function (output) {
            var match = /\s*\[\d+:(\d+),(\d+)\]$/.exec(output);
            file.warning({
                plugin: UglifyJS.name,
                message: match ? output.substr(0, match.index) : output,
                startLine: match && +match[1],
                startColumn: match && +match[2]
            });
        };
    }

    // 生成。
    try {
        var result = uglifyJS.minify(file.content, options);
    } catch (e) {
        return file.error({
            plugin: UglifyJS.name,
            error: e,
        });
    } finally {
        if (oldWarnFunction) {
            uglifyJS.AST_Node.warn_function = oldWarnFunction;
        }
    }

    // 保存。
    file.content = result.code;
    if (result.map) {
        var map = JSON.parse(result.map);
        map.sources[0] = file.srcPath;
        file.sourceMap = map;
    }
};

function merge(src, dest) {
    for (var key in src) {
        if (src[key] && dest[key] && typeof src[key] === "object" && typeof dest[key] === "object") {
            merge(dest[key], src[key]);
        } else {
            dest[key] = src[key];
        }
    }
    return dest;
}
