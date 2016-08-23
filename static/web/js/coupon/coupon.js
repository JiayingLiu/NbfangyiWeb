require(['jquery', 'base', 'model', 'page'], function ($, base, model, page) {
    base.init();
    var URL = {
        LIST: '/pay/user/coupon/couponList',
        ADD: '/pay/user/coupon/receiveCoupon'
    };
    //分页处理
    page_config.length = 11;
    page_config.url = URL.LIST;
    page.init(page_config);
    //点击选择优惠券状态的事件
    var $type_select = $('#coupon_type'),
        $add_coupon = $('#add_coupon');
    $type_select.on('click', 'a', function () {
        location.href = URL.LIST + '?status=' + $(this).attr('data-id');
    });
    //点击显示添加优惠券的表单
    $('#show_add_coupon').click(function () {
        $('#add_form_wrap').slideToggle();
    });
    //添加优惠券
    $add_coupon.on('click', null, function () {
        $.ajax({
            url: URL.ADD,
            type: 'POST',
            dataType: 'json',
            data: $('#add_form').serialize(),
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 500, function () {
                        location.reload();
                    });
                } else {
                    model.tip(data.message, 2000);
                }
            }
        })
    });
});