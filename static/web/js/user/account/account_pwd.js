/**
 * Created by nbang on 16/3/30.
 */
require(['jquery', 'base','validate','model'], function ($,base,validate,model) {
    base.init();
    //修改密码
    $('#js_submit').on('click', null, function () {
        var password = document.getElementsByName('old_password')[0].value,
            newPassword = document.getElementsByName('new_password')[0].value,
            repeatPassword = document.getElementsByName('repeat_password')[0].value;
        //验证
        if (!validate.password(password)) {
            model.tip('密码为6至18位的字母和数字组合', 2000, null);
            return;
        }
        if (!validate.password(newPassword)) {
            model.tip('新密码为6至18位的字母和数字组合', 2000, null);
            return;
        }
        if (!validate.password(repeatPassword)) {
            model.tip('新密码为6至18位的字母和数字组合', 2000, null);
            return;
        }
        if (newPassword != repeatPassword) {
            model.tip('两次输入的新密码不一致', 2000, null);
            return;
        }
        var options = {
            data: {
                password: password,
                newPassword: newPassword
            },
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 1000, function () {
                        location.href ='/user/oauth/user/login';
                    });
                } else {
                    model.tip(data.message, 2000, function () {
                    });
                }
            }
        };
        $.ajax({
            url: '/usercore/api/member/changePasswd',
            type: 'post',
            dataType: 'json',
            data: options.data,
            success: options.success
        });
    });
});
