/**
 * Created by nbang on 16/3/25.
 */
require(['jquery', 'base', 'model'], function ($, base, model) {
    base.init();
    var URL = {
        NEXT: '/pay/user/recharge/submitRecharge',//下一步
        PAY: '/pay/user/recharge/pay'//跳到支付页面
    };

    //绑定按钮的点击事件
    $('#recharge_next').on('click', null, function () {
        var money = $('#recharge_money').val();
        if (!money || isNaN(money)){
            model.tip('充值金额不合法',2000);
            return;
        }
        $.ajax({
            url: URL.NEXT,
            type: 'POST',
            dataType: 'json',
            data: {
                amount :money
            },
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 0, function () {
                        location.href = URL.PAY+'?order_num='+data.data;
                    });
                } else {
                    model.tip(data.message, 2000);
                }
            }
        });
    });
});
