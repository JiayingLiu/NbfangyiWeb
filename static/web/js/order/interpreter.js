require(['jquery', 'base', 'model', 'city', 'validate', 'wdatePicker'], function ($, base, model, city, validate, wdatePicker) {
    base.init();
    //行政区划初始化
    city.init();
    //时间框的初始化
    window.WdatePicker = wdatePicker;
    //此订单的单价
    var price = $('#price').val();
    price = price ? price - 0 : 0;
    //服务时长的事件
    $('#service_time').on('keyup', function () {
        var $this = $(this),
            value = $this.val();
        value = value ? value - 0 : 0;
        if (value) {
            //价格的计算
            $.ajax({
                url: '/order/api/order/priceCalculate',
                data: {
                    price: price,
                    number: value
                },
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        //显示的总价
                        $('#total_price').text('￥' + data.data.price);
                        //隐藏域用于提交表单的总价
                        $('#order_price').val(data.data.price);
                    } else {
                        model.tip(data.message, 2000);
                    }
                }
            });
        } else {
            $this.val('');
        }
    });
    //点击事件下一步
    $('#next').on('click', null, function () {
        if (!validate.require(document.getElementsByName('area_id')[0].value)) {
            model.tip('请选择地址', 2000);
            return;
        }
        if (!validate.require($('#address').val())) {
            model.tip('请填写详细地址', 2000);
            return;
        }
        //各种验证
        if (!validate.require($('#estimate_start').val())) {
            model.tip('开始时间为空', 2000);
            return;
        }
        if (!validate.require($('#estimate_end').val())) {
            model.tip('结束时间为空', 2000);
            return;
        }
        if (!validate.require($('#service_time').val())) {
            model.tip('服务时长为空', 2000);
            return;
        }
        //拼地址字符串
        $('#service_address').val($('.city-select-pro').val() + ' ' + $('.city-select-city').val() + ' ' + $('.city-select-area').val() + ' ' + $('#address').val());
        base.eventWithOauthHandler(function () {
            $('#order_form').attr({
                'method': 'POST',
                'action': '/order/order/buy/buyConfirm'
            }).submit();
        });

    });
});