require(['jquery', 'base', 'model', 'validate'], function ($, base, model, validate) {
    base.init();
    var URL = {
        BIND: '/pay/user/card/submitCard',//绑定
        VIEW: '/pay/user/card/userCardList'//跳回银行卡管理页面
    };

    //绑定按钮的点击事件
    $('#submit_bank').on('click', null, function () {
        var doc = document,
            card_num = doc.getElementsByName('card_num')[0].value,
            real_name = doc.getElementsByName('real_name')[0].value,
            id_card_num = doc.getElementsByName('id_card_num')[0].value,
            bank_name = doc.getElementsByName('bank_name')[0].value,
            bank_address = doc.getElementsByName('bank_address')[0].value;
        if (!validate.require(real_name)) {
            model.tip('真实姓名不能为空', 2000);
            return;
        }
        if (!validate.require(id_card_num)) {
            model.tip('身份证号码不合法', 2000);
            return;
        }
        if (!validate.require(bank_name)) {
            model.tip('请选择开户银行', 2000);
            return;
        }
        if (!validate.require(bank_address)) {
            model.tip('请填写开户支行', 2000);
            return;
        }
        $.ajax({
            url: URL.BIND,
            type: 'POST',
            dataType: 'json',
            data: $('#add_bc_form').serialize(),
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 1000, function () {
                        location.href = URL.VIEW;
                    });
                } else {
                    model.tip(data.message, 2000);
                }
            }
        });
    });
});