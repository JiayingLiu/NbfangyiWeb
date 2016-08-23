/**
 * Created by nbang on 16/3/25.
 */
require(['jquery', 'base', 'model', 'validate'], function ($, base, model, validate) {
    base.init();
    var URL = {
        SEND: '/user/index/message/sendMessage',
        VERIMG :'/user/index/message/sendMsgVerify'
    };
    var FONT_CONUT = 500;

    //发送短信
    $('#send_msg').on('click', null, function () {
        var tel = $('#tel').val(),
            title = $('#title').val(),
            text = $('#text').val(),
            code = $('#code').val();
        if (!validate.phone(tel)) {
            model.tip('收件人必须为手机号', 2000);
            return;
        }
        if (!validate.require(title)) {
            model.tip('标题不能为空', 2000);
            return;
        }
        if (!validate.require(text)) {
            model.tip('短息内容不能为空', 2000);
            return;
        }
        if(!validate.require(code)){
            model.tip('验证码不能为空',2000);
            return;
        }

        $.ajax({
            url: URL.SEND,
            data: $('#msg_form').serialize(),
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 500, function () {
                        location.reload();
                    });
                } else {
                    model.tip(data.message, 2000);
                }
                $('#verify_img').find('img').attr('src',URL.VERIMG+'?'+new Date().getTime());
            }
        });

    });

    //字数 的统计
    $('#text').on('keyup', function () {
        var $count = $('#font_count'),
            $this = $(this),
            oldval = $this.val(),
            len = oldval.length;

        if (len > FONT_CONUT) {
            $this.val(oldval.substr(0, FONT_CONUT));
            $count.text(FONT_CONUT + '/' + FONT_CONUT);
        } else {
            $count.text(len + '/' + FONT_CONUT);
        }
    });
});