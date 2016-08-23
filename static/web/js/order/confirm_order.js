require(['jquery', 'base', 'model'], function ($, base, model) {
    base.init();
    //优惠券展开点击事件
    $('#order_coupons_show').on('click', null, function () {
        var $this = $(this),
            $i = $this.find('.iconfont');
        if ($i.hasClass('icon-add-label')) {
            $i.removeClass('icon-add-label').addClass('icon-sub-label');
        } else {
            $i.removeClass('icon-sub-label').addClass('icon-add-label');
        }
        $('#order_coupons').toggle();
    });
    //优惠券的点击事件
    $('#order_coupons').on('click', '.order-coupons-item', function () {
        var $this = $(this);
        //是否选中效果展示代码
        if ($this.hasClass('order-coupons-selected')) {
            $this.removeClass('order-coupons-selected');
        } else {
            $('#order_coupons').find('.order-coupons-selected').removeClass('order-coupons-selected');
            $this.addClass('order-coupons-selected');
        }
        //价格的计算以及展示,如果不为空则转成number类型，如果为空，即为0
        var coupon_money = $('#order_coupons').find('.order-coupons-selected').attr('data-money');
        coupon_money = coupon_money ? coupon_money - 0 : 0;
        //商品价格
        var product_info_price = $('#product_info_price').text();
        product_info_price = product_info_price ? product_info_price - 0 : 0;
        //给优惠价格赋值
        $('#product_caupon_price').text(coupon_money);
        //计算价格
        var pay_price = 0;
        pay_price = product_info_price > coupon_money ? Subtr(product_info_price, coupon_money) : 0;
        //给支付价格赋值
        $('#pay_price,#pay_price_submit').text(pay_price);
    });

    //订单提交事件
    $('#submit_btn').on('click', null, function () {
        var $this = $(this);
        $this.attr('disabled', 'disabled');
        document.getElementsByName('coupon_id')[0].value = $('#order_coupons').find('.order-coupons-selected').attr('data-num') || '';
        base.eventWithOauthHandler(function () {
            $.ajax({
                url: '/order/order/buy/addOrder',
                type: 'POST',
                dataType: 'json',
                data: $('#order_form').serialize(),
                success: function (data) {
                    if (data.status == 0) {
                        var form = document.createElement('form');
                        form.action = '/pay/index/pay/index';
                        form.method = 'POST';
                        form.style.display = 'none';
                        form.innerHTML = '<input type="hidden" name="order_num" value="' + data.data.order_num + '">';
                        document.getElementsByTagName('body')[0].appendChild(form);
                        form.submit();
                    } else {
                        model.tip(data.message, 2000);
                        $this.removeAttr('disabled');
                    }
                }
            });
        });
    });

    //减法函数
    function Subtr(arg1, arg2) {
        var r1, r2, m, n;
        try {
            r1 = arg1.toString().split(".")[1].length;
        }
        catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        }
        catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        //last modify by deeka
        //动态控制精度长度
        n = (r1 >= r2) ? r1 : r2;
        return ((arg1 * m - arg2 * m) / m).toFixed(n);
    }
});