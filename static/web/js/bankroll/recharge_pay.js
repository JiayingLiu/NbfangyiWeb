require(['jquery', 'base', 'model'], function ($, base, model) {
    base.init();
    var timer;
    var URL = {
        ALIPAY: '/pay/user/recharge/payment?pay_type=1&order_num=',//支付宝支付地址
        UNION: '/pay/user/recharge/payment?pay_type=6&order_num=',//银联支付地址
        CHECK_PAY: '/pay/user/recharge/ajaxIsSuccess',//检验支付是否成功
        SUCCESS: '/pay/user/recharge/paySuccess',//成功的页面
        PAY_ERROR: '/index/index/help/detail?id=27'//支付遇到问题
    };
    //检查是否支付
    var checkPaySuccess = function (num) {
        timer = setTimeout(function () {
            $.ajax({
                url: URL.CHECK_PAY,
                type: 'POST',
                dataType: 'json',
                data: {
                    'order_num': num
                },
                success: function (data) {
                    if (data.status == 0) {
                        clearTimeout(timer);
                        location.href = URL.SUCCESS;
                    } else {
                    }
                }
            });
            timer = setTimeout(arguments.callee, 2000);
        }, 2000);

    };

    //快速支付点击事件
    $('#fast_pay').on('click', 'li', function () {
        var $this = $(this);
        $('#fast_pay').find('.fast-pay-selected').removeClass('fast-pay-selected');
        $this.find('a').addClass('fast-pay-selected');
    });


    //绑定支付事件
    $('#pay').on('click', null, function () {
        var $this = $(this),
            order_num = $this.attr('data-order'),
            index = $('#pay_type').find('.pay-type-selected').attr('data-index'),
            type = $('#fast_pay').find('.fast-pay-selected').attr('data-type');

        var questionHtml = '<div class="text-center"><p style="padding: 20px;font-size: 16px;">支付遇到问题</p><p>' +
            '<a href="' + URL.PAY_ERROR + '" class="btn btn-submit">支付遇到问题</a></p></div>';

        var weixinHtml = '<p class="text-center" style="margin-top: 30px;"><img src="' + werxin_url + '" height="200" width="200"></p>' +
            '<p class="text-center" style="margin-top: 15px;color: #008000;font-weight: bold;">请使用微信扫一扫，扫描二维码进行支付</p>';


        if (index == 1) {//第三方支付
            if (type == 'alipay') {//ali的支付
                window.open(URL.ALIPAY + order_num);
                model.window(150, 300, '支付提示', questionHtml);
            } else if (type == 'weixin') {//微信支付
                model.window(300, 300, '微信支付', weixinHtml);
            } else if (type == 'union') {//银联支付
                window.open(URL.UNION + order_num);
                model.window(150, 300, '支付提示', questionHtml);
            } else {
            }
            checkPaySuccess(order_num);
        }
    });
});
