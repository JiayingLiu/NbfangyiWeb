/**
 * Created by nbang on 16/4/5.
 */
require(['jquery', 'base', 'model', 'page'], function ($, base, model, page) {
    base.init();
    var URL = {
        MAIN: '/user/shop/mark/getMarkList',
        DEL: '/user/shop/mark/delMarkInfo'
    };//分页处理
    page_config.length = 11;
    page_config.url = URL.MAIN;
    page.init(page_config);

    //删除事件
    $('#collect_list').on('click', '.js-del', function () {
        var id = $(this).attr('data-id');
        model.confirm('确定要删除这个收藏吗？', function () {
            $.ajax({
                url: URL.DEL,
                data: {
                    id: id
                },
                type: 'post',
                dataType: 'json',
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
    });
});