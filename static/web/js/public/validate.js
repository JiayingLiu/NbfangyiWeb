define([], function () {
    var isNotNull = function(value){
        return value && value.replace(/(^\s+)|(\s+$)/g,"") && value.length
    }
    return {
        require:function(value){
            return isNotNull(value)
        },
        phone: function (value) {
            return isNotNull(value) && /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|16[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$|19[0-9]{9}$/.test(value)
        },
        email: function (value) {
            return isNotNull(value) && /^([0-9A-Za-z\\-_\\.]+)@([0-9a-z]+\\.[a-z]{2,3}(\\.[a-z]{2})?)$/i.test(value)
        },
        password: function (value) {
            return isNotNull(value) && /[a-z\d]{6,18}$/i.test(value)
        }
    }
});