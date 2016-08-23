/**
 * Created by nbang on 16/3/30.
 */
//添加银行卡
require(['jquery', 'base', 'model', 'validate'], function ($, base, model, validate) {
    base.init();
    var URL = {
        SENDMSG: '/user/customer/account/ajaxSendSMS',//发送验证码
        IMG_VERIFY: '/pay/user/card/verify',//图片验证码
        SUBMIT: '/user/customer/account/modifyDealPassword'//提交验证
    };

    var $validCodeBtn = $('#valid_code_btn');
    $validCodeBtn.on('click', null, function () {
        var $this = $(this);
//短信验证框
        model.confirm(
            '<div style="overflow: hidden"><div class="form-group"><img class="pull-left" src="' + URL.IMG_VERIFY + '" height="35"><a href="javascript:;" ' +
            'style="text-decoration: underline;" id="change_verigy_img">看不清，换一张</a></div>' +
            '<div class="form-group"><label class="col-xs-4">输入验证码：</label>' +
            '<div class="col-xs-8"><input class="form-input" type="text" name="verifyCode"></div></div></div>',
            function () {
                var verifyCode = document.getElementsByName('verifyCode')[0].value;
                var options = {
                    data: {
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
    //验证码 下一步
    $('#js_submit_code').on('click', function () {
        var code = $('#code').val();
        if (!validate.require(code)) {
            model.tip('验证码为空', 2000);
            return;
        }
        $.ajax({
            url: 'ajaxCheckCode',
            type: 'POST',
            dataType: 'json',
            data: {
                'code': code
            },
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 1000, function () {
                        $('.show_pwd').show();
                        $('.show_code').hide();
                    });
                } else {
                    model.tip(data.message, 2000);
                }
            }
        })
    });
    //重置按钮
    $('#js_submit').on('click', function () {
        var pwd = $('#new_password').val(),
            repeat_pwd = $('#repeat_pwd').val(),
            code = $('#code').val(),
            pwd = $('#new_password').val();
        if (isNaN(pwd) || pwd.length != 6) {
            model.tip('密码为6位数字', 2000);
            return;
        }
        if(pwd != repeat_pwd){
            model.tip('两次输入的密码不一致', 2000);
            return;
        }
        $.ajax({
            url: URL.SUBMIT,
            type: 'POST',
            dataType: 'json',
            data: {
                'code': code,
                'new_password': pwd
            },
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 1000, function () {
                        //跳到个人中心聚焦页

                        window.location.href= nbfy.user.url;
                    });
                } else {
                    model.tip(data.message, 2000);
                }
            }
        })
    });
});

