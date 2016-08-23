require(['jquery', 'model', 'validate'], function ($, model, validate) {
    var URL = {
        CHECK_PASSWD_CODE: '/usercore/api/member/checkGetPasswdCode',//手机,验证码，验证下一步
        UPDATE_PASSWD: '/usercore/api/member/findAccountPasswd',//找回密码
        SEND_GETPWD_MSG: '/usercore/api/member/resetPasswdSendSms',//发送手机 验证码
        IMG_VERIFY: '/usercore/api/member/verify'//图片验证码
    };
    //模块切换
    var loadStep = function (index) {
        if (index == 1) {
            $('#insert_phone').show();
            $('#set_password,#update_success').hide();
        } else if (index == 2) {
            $('#set_password').show();
            $('#insert_phone,#update_success').hide();
        } else {
            $('#update_success').show();
            $('#set_password,#insert_phone').hide();
        }
    };
    //下一步
    $('#next').on('click', null, function () {
        var account = document.getElementsByName('account')[0].value,
            code = document.getElementsByName('code')[0].value;
        //验证
        if (!validate.phone(account)) {
            model.tip('手机号码不合法', 2000, null);
            return;
        }
        if (!validate.require(code)) {
            model.tip('验证码不能为空', 2000, null);
            return;
        }
        var options = {
            data: {
                account: account,//  手机
                code: code
            },
            success: function (data) {
                if (data.status == 0) {
                    loadStep(2);
                } else {
                    model.tip(data.message, 2000, function () {
                    });
                }
            }
        };
        $.ajax({
            url: URL.CHECK_PASSWD_CODE,
            type: 'post',
            dataType: 'json',
            data: options.data,
            success: options.success
        });
    });
    //修改密码
    $('#submit_data').on('click', null, function () {
        var password = document.getElementsByName('password')[0].value,
            newPassword = document.getElementsByName('newPassword')[0].value;
        //验证
        if (!validate.password(password)) {
            model.tip('密码为6至18位的字母和数字组合', 2000, null);
            return;
        }
        if (!validate.password(newPassword)) {
            model.tip('确认密码为6至18位的字母和数字组合', 2000, null);
            return;
        }
        if (password != newPassword) {
            model.tip('两次输入的密码不一致', 2000, null);
            return;
        }
        var options = {
            data: {
                account: document.getElementsByName('account')[0].value,
                code: document.getElementsByName('code')[0].value,
                password: password,
                newPassword: newPassword
            },
            success: function (data) {
                if (data.status == 0) {
                    loadStep(3);
                } else {
                    model.tip(data.message, 2000, function () {
                    });
                }
            }
        };
        $.ajax({
            url: URL.UPDATE_PASSWD,
            type: 'post',
            dataType: 'json',
            data: options.data,
            success: options.success
        });
    });
    //发送注册验证码
    $('#sendMsg').on('click', null, function () {
        var $this = $(this),
            account = document.getElementsByName('account')[0].value;
        if (!validate.phone(account)) {
            model.tip('手机号不合法', 2000, null);
            return;
        }
        //短信验证框
        model.confirm(
            '<div style="overflow: hidden"><div class="form-group"><img class="pull-left" src="' + URL.IMG_VERIFY + '" height="35"><a href="javascript:;" ' +
            'style="text-decoration: underline;" id="change_verigy_img">看不清，换一张</a></div>' +
            '<div class="form-group"><label class="col-xs-4">输入验证码：</label>' +
            '<div class="col-xs-8"><input class="form-input" type="text" name="verifyCode"></div></div></div>',

            function () {
                var verifyCode = document.getElementsByName('verifyCode')[0].value,
                    account = document.getElementsByName('account')[0].value;
                var options = {
                    data: {
                        account: account,//  手机
                        verifyCode: verifyCode
                    },
                    success: function (data) {
                        model.tip(data.message, 2000, null);
                        if (data.status == 0) {
                            var time = 59, timer;
                            timer = setTimeout(function () {
                                if (time >= 0) {
                                    $this.val(time + 's重新发送').attr('disabled', 'disabled').addClass('verification-button-disabled');
                                    time--;
                                    setTimeout(arguments.callee, 1000);
                                } else {
                                    clearTimeout(timer);
                                    $this.val('发送验证码').removeAttr('disabled').removeClass('verification-button-disabled');
                                }
                            }, 1000);
                        }
                    }
                };
                $.ajax({
                    url: URL.SEND_GETPWD_MSG,
                    type: 'post',
                    dataType: 'json',
                    data: options.data,
                    success: options.success
                });
            }, null);
        //点击更换验证码
        $('#change_verigy_img').off().on('click', null, function () {
            $(this).prev('img').attr('src', URL.IMG_VERIFY + '?' + new Date().getTime());
        });
    });
});