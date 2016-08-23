require(['jquery', 'base', 'model', 'page'], function ($, base, model, page) {
    base.init();
    page_config.length = 11;
    page_config.url = '/shop/index/product/productList?type=' + $('#table_type').val();
    page.init(page_config);
    //选择type的事件
    $('#table_type').on('change',function () {
        window.location.href = '/shop/index/product/productList?type=' + $('#table_type').val();
    });
    //点击事件
    var $list = $('#product_list');
    $list.on('click', '.table-delete-btn', function () {
        var $this = $(this),
            id = $this.attr('data-id');
        model.confirm('是否删除这件商品？', function () {
            $.ajax({
                url: '/shop/index/product/deleteProduct?id=' + id,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        model.tip(data.message, 1000, function () {
                            window.location.reload();
                        });
                    } else {
                        model.tip(data.message, 1000, function () {
                        });
                    }
                }
            })
        });
    });
});