require(['jquery', 'base', 'model', 'page', 'wdatePicker'], function ($, base, model, page, wdatePicker) {
    base.init();
    var URL = {
            MAIN: '/user/translate/order/index'
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
        if($(this).attr('data-id')== 0){
            window.location.href = URL.MAIN ;
        }else{
            window.location.href = URL.MAIN + '?' + $search_form.serialize() + '&status=' + $search_form.find('.order-status-selected').attr('data-id') + '&is_comment=0';
        }
    });
});