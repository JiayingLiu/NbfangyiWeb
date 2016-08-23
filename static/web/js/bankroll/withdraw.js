require(['jquery', 'base', 'model'], function ($, base, model) {
    base.init();
    var URL = {
        WITHDRAW: '/pay/user/withdraw/submitWithdraw',//提现
    };
    //整数金额的输入事件
    $('#money_inter').on('keyup', function (e) {
        var $this = $(this),
            old_value = $this.val() - 0;
        //输入为数字 或者 .小数点
        if (!isNaN(old_value) && old_value < 10000000 && old_value > 0) {
        } else {
            $this.val('');
        }
    });
    //小数金额的输入事件 必须是俩位小数
    $('#money_float').on('keyup', function (e) {
        var $this = $(this),
            old_value = $this.val() - 0;
        //输入为数字 或者 .小数点
        if (!isNaN(old_value) && old_value < 99 && old_value > 0) {
        } else {
            $this.val('');
        }
    });
    //绑定按钮的点击事件
    $('#withdraw').on('click', null, function () {
        //金额判断
        var integer_value =$('#money_inter').val()? $('#money_inter').val() + '': '0',
            decimal_value =$('#money_float').val()? '.'+ $('#money_float').val() + '': '',
            momey_all = integer_value + decimal_value,
            withdraw = $('#withdraw_money').attr('data-number') - 0;
        if(momey_all > 0 && momey_all <= withdraw){
            if($(this).attr('data-is-set-pwd') == 1){
                var html = '<div class="row text-center">请输入交易密码</div>' +
                    '<div class="form-group text-center"><input type="password" id="trade_pwd" class="form-input" style="width: 100px;"></div>';
                model.confirm(html, function () {
                    var money_inter = $('#money_inter').val(),//整数
                        money_float = $('#money_float').val()//小数
                    if (!isNaN(money_inter) && money_inter < 10000000 && money_inter > 0) {
                    }else{
                        model.tip('提现金额在0到100万之间', 2000);
                        return;
                    }
                    $.ajax({
                        url: URL.WITHDRAW,
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            amount: money_inter + '.' + money_float,
                            pwd: $('#trade_pwd').val()
                        },
                        success: function (data) {
                            if (data.status == 0) {
                                model.tip(data.message, 1000, function () {
                                    location.reload();
                                });
                            } else {
                                model.tip(data.message, 2000);
                            }
                        }
                    });
                }, null);
            }else{
                var html = '<div class="row text-center">您还没有设置交易密码，请设置交易密码</div>' +
                    '<div class="form-group text-center"></div>';
                model.confirm(html, function () {
                    window.location.href="/user/customer/account/dealPassword";
                });
            }
        }else{
            model.tip('提现金额不足或超出提现金额', 2000);
            return;
        };
    });
});