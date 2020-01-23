var moment = require('moment');
var helperFunction = {
    // put all of your helpers inside this object
    ifCond: function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    },
    math: function (lvalue, operator, rvalue, options) {
        (lvalue);
        (rvalue);
        (operator);
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        (lvalue);
        (rvalue);
        (operator);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    },
    bar: function () {
        return "BAR";
    },
    looping: function (n, options) {
        var accum = '';
        for (var i = 0; i < n; ++i) {
            accum += options.fn(i);
        }
        return accum;
    },
    formatDate: function(date) {
        //return "test";
       return moment.unix(date).format("DD-MMM-YY hh:mm:ss");
    }
};

exports.helperFunction = helperFunction;