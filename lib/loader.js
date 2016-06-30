// 写的巨简单，不要吐槽
!function (win, Zone) {
    var map = {};
    var noop = {};
    var dependence = {};
    var alias = {};
    var hasSet = {};

    function define(name, factory) {
        if (typeof factory === 'function') {
            map[name] = {
                factory: factory,
                exports: noop 
            };
        } else {
            map[name] = {
                exports: factory
            };
        }
    }

    function require(name) {
        var module = map[name]
        if (module.exports !== noop) return module.exports;
        if (dependence[name]) {
            var properties = {};
            Object.keys(dependence[name]).forEach(function (key) {
                var res;
                if (alias[key]) res = alias[key];
                else res = key;
                properties[res] = require(key + '@' + dependence[name][key]);
                if (!hasSet[res]) {
                    hasSet[res] = true;
                    Object.defineProperty(window, res, {
                        get: function () {
                            return Zone.current.get(res)
                        }
                    });
                }
            });
            Zone.current.fork({
                properties: properties
            }).run(function () {
                module.exports = module.factory()
            });
        } else {
            module.exports = module.factory();
            return module.exports;
        }
    }

    function config(opt) {
        Object.assign(dependence, opt.dep);
        Object.assign(alias, opt.alias);
    }

    require.config = config;
    window.define = define;
    window.require = require;
}(window, Zone)

