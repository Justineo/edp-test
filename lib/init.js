var fs = require('fs');
var path = require('path');

function lower(key) {
    return key.toLowerCase().replace(/_[a-z]/g, function (a) {
        return a.slice(1).toUpperCase();
    });
}

function quote(value) {
    return typeof value != 'string'
        ? JSON.stringify(value)
        : '\'' + value + '\'';
}

function buildFromTemplate(from, to, config) {
    var cwd = process.cwd();
    var configFile = 'test/' + to;
    var configFilePath = path.resolve(cwd, configFile);

    var tplFile = path.resolve(
        __dirname,
        '../' + from
    );
    
    config = config || {};
    config.date = config.date || new Date();

    var content = fs.readFileSync(tplFile).toString().replace(
        /%(.*)%/g,
        function(a, key) {
            var value = config[lower(key)];
            if (value instanceof Array) {
                value = value.map(quote).join(', ');
            }
            return value;
        }
    );
    
    fs.writeFileSync(configFilePath, content);

    return configFilePath;

}

exports.run = function () {

    console.log('正在生成测试入口文件 test/main.js...');
    buildFromTemplate('main.tpl.js', 'main.js');
    console.log('测试入口文件生成。');

    console.log('正在生成配置文件 test/config.js...');
    var path = buildFromTemplate('conf.tpl.js', 'config.js');
    console.log('配置文件生成。');

    var config = require(path);
    var install = require('./install');
    
    config({
        set: function (options) {
            (options.plugins || []).forEach(install.exec);
        }
    });
    
    
};
