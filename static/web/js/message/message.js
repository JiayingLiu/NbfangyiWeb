/**
 * Created by nbang on 16/3/25.
 */
require(['jquery', 'base', 'model', 'page'], function ($, base, model, page) {
    base.init();
    var URL = {
        LIST: '/user/index/message/index',
        READ: '/user/index/message/updateMsg'
    };
    //分页处理
    page_config.length = 11;
    page_config.url = URL.LIST + '?status='+ $('#message_nav').find('.msg-type-selected').attr('data-id');
    page.init(page_config);

    $('#message_box').on('click', '.js-toggle-ext', function () {
        var $this = $(this),
            id = $this.attr('data-id'),
            flag = $this.attr('data-read');
        //当flag为1 时 说明是未读
        if (flag == 1) {
            $.ajax({
                url: URL.READ,
                data: {
                    id: id
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    $this.attr('data-read',2);
                }
            });
        }
        $this.next('.msg-ext').slideToggle();
    });
});