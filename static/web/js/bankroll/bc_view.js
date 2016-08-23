require(['jquery', 'base', 'model'], function ($, base, model) {
    base.init();
    var URL = {
        DELETE: '/pay/user/card/deleteCard'//删除
    };
    $('#bk_del').click(function () {
        var $this = $(this),
            id = $this.attr('data-id');
        var html = '<div class="row text-center">请输入交易密码</div>' +
            '<div class="form-group text-center"><input type="password" id="trade_pwd"  class="form-input" style="width: 100px;"></div>';
        model.confirm(html, function () {
            var pwd = $('#trade_pwd').val();
            if(!pwd){
                model.tip('交易密码为空',2000);
                return;
            }
            $.ajax({
                url: URL.DELETE,
                type: 'POST',
                dataType: 'json',
                data: {
                    id: id,
                    pwd: pwd
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
    });
});