var assert = require("assert");
var digo = require("digo");
var plugin = require("./");

describe('digo-uglifyJs', function () {

    it("compress", function () {
        assert.equal(exec("var a = 1;"), "var a=1;");
        assert.equal(exec("if (RELEASE) { alert('hello') }"), "alert(\"hello\");");
        assert.equal(exec("if (DEBUG) { alert('hello') }"), "");
        assert.equal(exec("console.log('debug stuff');"), "");
        assert.equal(exec("var c = /*@cc_on!@*/false"), "var c=/*@cc_on!@*/!1;");
    });

    it("error", function () {
        var error = false;
        digo.onLog = function (data) {
            error = true;
            assert.equal(data.startLine, 0);
            assert.equal(data.startColumn, 8);
            return false;
        };
        assert.equal(exec("var b = ;"), "var b = ;");
        assert.equal(error, true);
        delete digo.onLog;
    });

    function exec(input, options) {
        var file = new digo.File("", "", input);
        plugin(file, options);
        return file.content;
    }
});
