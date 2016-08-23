require(['jquery', 'base', 'model', 'page', 'wdatePicker'], function ($, base, model, page, wdatePicker) {
    base.init();
    var URL = {
            MAIN: '/user/customer/order/index',
            CANC: '/user/customer/order/cancelOrder',
            PAY: '/pay/index/pay/index'
        },
        $search_form = $('#search_form');
    //初始化时间选择器
    window.WdatePicker = wdatePicker;
    //订单状态的的初始化
    var url_obj = base.getUrlParams(),
        url_obj_status = url_obj.status ? url_obj.status : 0;
    $search_form.find('.js-order-status[data-id=' + url_obj_status + ']').addClass('order-status-selected');
    //分页处理
    page_config.length = 11;
    page_config.url = URL.MAIN + '?' + $search_form.serialize() + '&status=' + $search_form.find('.order-status-selected').attr('data-id') + '&is_comment=0';
    page.init(page_config);
    //查询事件
    $('#search').on('click', null, function () {
        window.location.href = URL.MAIN + '?' + $search_form.serialize() + '&status=' + $search_form.find('.order-status-selected').attr('data-id') + '&is_comment=0';
    });
    //订单状态的点击事件
    $search_form.on('click', '.js-order-status', function () {
        $search_form.find('.order-status-selected').removeClass('order-status-selected');
        $(this).addClass('order-status-selected');
        if ($(this).attr('data-id') == 0) {
            window.location.href = URL.MAIN;
        } else {
            window.location.href = URL.MAIN + '?' + $search_form.serialize() + '&status=' + $search_form.find('.order-status-selected').attr('data-id') + '&is_comment=0';
        }
    });
    //各种点击事件
    var $list = $('#order_list');
    $list.on('click', '.js-btn', function () {
        var $this = $(this),
            type = $this.attr('data-type'),
            order_num = $this.attr('data-order');
        switch (type) {
            case 'cancel':
                cancelHandler(order_num);
                break;
            case 'pay':
                payHandler(order_num);
                break;
            default :
                break;
        }

    });
    //取消事件
    var cancelHandler = function (num) {
            model.confirm('是否取消这个订单', function () {
                $.ajax({
                    url: URL.CANC,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        'order_num': num
                    },
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 500, function () {
                                window.location.reload();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
        },
        payHandler = function (num) {
            var form = document.createElement('form');
            form.action = URL.PAY;
            form.method = 'POST';
            form.style.display = 'none';
            form.innerHTML = '<input type="hidden" name="order_num" value="' + num + '">';
            document.getElementsByTagName('body')[0].appendChild(form);
            form.submit();
        };
});