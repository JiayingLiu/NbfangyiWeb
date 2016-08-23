//添加银行卡
require(['jquery', 'base', 'model', 'validate'], function ($, base, model, validate) {
    base.init();
    var URL = {
        SENDMSG: '/pay/user/card/ajaxSendSMS',//发送验证码
        IMG_VERIFY: '/pay/user/card/verify',//图片验证码
        SUBMIT_CARD_FIRST: '/pay/user/card/submitCardFirst',//提交验证
        HREF_TO_SEC: '/pay/user/card/addCardSecond'//跳转到绑定银行卡第二步
    };


    var $validCodeBtn = $('#valid_code_btn');
    $validCodeBtn.on('click', null, function () {
        var $this = $(this),
            tel = $('#add_bank_tel').val();
        if (!validate.phone(tel)) {
            model.tip('手机号码不合法', 2000);
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
                    tel = $('#add_bank_tel').val();
                var options = {
                    data: {
                        verifyCode: verifyCode,
                        mobile: tel
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

    //提交绑定银行卡第一步
    $('#submit_card_fir').on('click', null, function () {
        var bank_num = $('#add_bank_num').val(),
            phone = $('#add_bank_tel').val(),
            code = $('#add_bank_code').val();
        if (!validate.phone(phone)) {
            model.tip('手机号码不合法', 2000);
            return;
        }
        if (!validate.require(code)) {
            model.tip('验证码不能为空', 2000);
            return;
        }
        $.ajax({
            url: URL.SUBMIT_CARD_FIRST,
            type: 'POST',
            dataType: 'json',
            data: {
                'card_num': bank_num,
                'code': code,
                'mobile': phone
            },
            success: function (data) {
                if (data.status == 0) {
                    var html = [];
                    html.push('<input type="text" name="card_num" value="' + data.data['card_num'] + '">');
                    html.push('<input type="text" name="mobile" value="' + data.data['mobile'] + '">');
                    html.push('<input type="text" name="code" value="' + data.data['code'] + '">');
                    model.tip(data.message, 500, function () {
                        var form = document.createElement('form');
                        form.action = URL.HREF_TO_SEC;
                        form.method = 'POST';
                        document.body.appendChild(form)
                        form.innerHTML = html.join('');
                        form.submit();
                    });
                } else {
                    model.tip(data.message, 2000, null);
                }
            }
        });
    });


});