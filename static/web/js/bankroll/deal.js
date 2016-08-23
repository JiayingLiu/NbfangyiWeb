require(['jquery', 'base', 'model', 'page'], function ($, base, model, page) {
    base.init();
    var URL = {
            MAIN: '/pay/user/detail/detailList'
        };//分页处理
    page_config.length = 11;
    page_config.url = URL.MAIN;
    page.init(page_config);
});