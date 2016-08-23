require(['jquery', 'model', 'validate'], function ($, model, validate) {
    var URL = {
        OAUTH_USER_REG_INFO: '/usercore/api/member/editOauthUserRegInfo',
        SENDMSG: '/usercore/api/member/regSendSms',//注册短信
        REG_SUCCESS_URL: '/',//注册成功的跳转地址
        IMG_VERIFY: '/usercore/api/member/verify'//图片验证码
    };
    //注册
    $('#next-step').on('click', null, function () {
        var userType = $('#reg_user_type').find('.identity-hover').attr('data-id'),
            account = document.getElementsByName('account')[0].value,
            password = document.getElementsByName('password')[0].value,
            repeatPasswd = document.getElementsByName('repeatPasswd')[0].value,
            code = document.getElementsByName('code')[0].value;
        //验证
        if (!$('#reg_user_type').find('.identity-hover').length) {
            model.tip('请选择身份', 2000, null);
            return;
        }
        if (!validate.phone(account)) {
            model.tip('手机号码不合法', 2000, null);
            return;
        }
        if (!validate.require(code)) {
            model.tip('验证码不能为空', 2000, null);
            return;
        }
        if (!validate.password(password)) {
            model.tip('密码为6到18字母和数字组合', 2000, null);
            return;
        }
        if (!validate.password(repeatPasswd)) {
            model.tip('密码为6到18字母和数字组合', 2000, null);
            return;
        }
        if (repeatPasswd != password) {
            model.tip('两次输入的密码不一致', 2000, null);
            return;
        }
        if (!$('#rules:checked').length) {
            model.tip('请同意平台使用准则', 2000, null);
            return;
        }
        var options = {
            data: {
                userType: userType,//用户类型，1-普通用户，2-个人个译，3-翻译公司，4-翻译机构，5-学生
                accountType: '1',// 账号类型，1-手机注册，2-邮箱注册，3-用户名注册
                account: account,//  注册账号名
                password: password,// 注册密码,注意：密码必须是数字与字母的组合
                repeatPasswd: repeatPasswd,// 重复密码,如果客户端没有重复密码，把passwd值赋给该参数即可
                regFromType: '1',// 注册来源，1-PC网站，2-众包，3-Android用户端，4-android机构端，5-手机网站，6-ios用户端，7-ios机构端
                code: code
            },
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 2000, function () {
                        window.location.href = URL.REG_SUCCESS_URL;
                    });
                } else {
                    model.tip(data.message, 2000, function () {
                    });
                }
            }
        };
        $.ajax({
            url: URL.OAUTH_USER_REG_INFO,
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
                        verifyCode: verifyCode,
                        telephone: account
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
                    url: URL.SENDMSG,
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
    //选择当前的用户类型
    $('#reg_user_type').on('click', '.js-usertype', function () {
        var $this = $(this);
        $('#reg_user_type').find('.identity-hover').removeClass('identity-hover');
        $this.find('.icon-circular').addClass('identity-hover');
    });
});