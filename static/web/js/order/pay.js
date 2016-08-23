require(['jquery', 'base', 'model'], function ($, base, model) {
    base.init();
    var URL = {
        ALIPAY: '/pay/index/pay/payment?pay_type=1&order_num=',//支付宝支付地址
        UNION: '/pay/index/pay/payment?pay_type=6&order_num=',//银联支付地址
        YUE: '/pay/index/pay/balancePay',//余额支付地址
        CHECK_PAY: '/pay/index/pay/ajaxIsSuccess',//检查是否支付
        ORDER_DETAIL: '/user/customer/order/details?order_num=',//订单详情
        SUCCESS: '/pay/index/pay/success',//支付成功
        ZB:'/pay/index/pay/paySuccess?order_num='
    };
    //大的支付方式的选择
    var $pay_type = $('#pay_type'),
    //检验是否的定时器
        timer;
    $pay_type.on('click', 'a', function () {
        var $this = $(this), index = $this.attr('data-index');
        //选择的样式切换
        $pay_type.find('.pay-type-selected').removeClass('pay-type-selected');
        $this.addClass('pay-type-selected');
        //小的支付方式的显示和隐藏
        switch (index) {
            case '1'://支付宝、微信、银联
                $('#wallet_pay').hide();
                $('#fast_pay').show();
                break;
            case '2'://余额支付
                $('#fast_pay').hide();
                $('#wallet_pay').show();
                break;
            default :
                break;
        }
    });
    //快速支付点击事件
    $('#fast_pay').on('click', 'li', function () {
        var $this = $(this);
        $('#fast_pay').find('.fast-pay-selected').removeClass('fast-pay-selected');
        $this.find('a').addClass('fast-pay-selected');
    });

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
                        if(data.data.type ==1){
                            location.href = URL.SUCCESS;
                        }else{
                            location.href = URL.ZB + data.data['order_num'];
                        }
                    } else {
                    }
                }
            });
            timer = setTimeout(arguments.callee, 1000);
        }, 1000);

    };

    //绑定支付事件
    $('#pay').on('click', null, function () {
        //清除定时器
        clearTimeout(timer);
        var $this = $(this),
            order_num = $this.attr('data-order'),
            index = $('#pay_type').find('.pay-type-selected').attr('data-index'),
            type = $('#fast_pay').find('.fast-pay-selected').attr('data-type');
        //微信的请求
        var weixinHtml = '<p class="text-center" style="margin-top: 30px;"><img src="' + werxin_url + '" height="200" width="200"></p>' +
            '<p class="text-center" style="margin-top: 15px;color: #008000;font-weight: bold;">请使用微信扫一扫，扫描二维码进行支付</p>';

        //支付遇到问题页面
        var questionHtml = '<div class="text-center"><p style="padding: 20px;font-size: 16px;">支付遇到问题</p><p>' +
            '<a href="' + URL.ORDER_DETAIL + order_num + '" class="order-btn btn-success">支付遇到问题</a></p></div>';

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
        } else {//余额支付
            var pwd = $('#pay_pwd').val();
            if (!pwd) {
                model.tip('请输入支付密码', 2000);
                return;
            }
            //避免多次提交
            $this.attr('data-yue') != '0' && $.ajax({
                url: URL.YUE,
                type: 'POST',
                data: {
                    'order_num': order_num,
                    pwd: pwd
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        checkPaySuccess(order_num);
                    } else {
                        model.tip(data.message, 2000);
                    }
                    $this.text('立即支付').css('background-color', '#ef8200').attr('data-yue', '1');
                }
            });
            $this.text('支付中...').css('background-color', '#ddd').attr('data-yue', '0');
        }

    });
});
