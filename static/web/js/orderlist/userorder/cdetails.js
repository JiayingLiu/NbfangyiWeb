require(['jquery', 'base', 'model', 'validate'], function ($, base, model, validate) {
    base.init();
    var URL = {
            CANC: '/user/customer/order/cancelOrder',
            PAY: '/pay/index/pay/index',
            COMPLETE: '/user/customer/order/orderDone',
            REFUND: '/user/customer/order/userApplyRefund'
        },
        FONT_NUM = 100;//退款的字数限制
    //点击事件
    var $toolbar = $('#detatis_toolbar');
    $toolbar.on('click', '.btn', function () {
        var $this = $(this),
            flag = $this.attr('data-value'),
            num = $this.attr('data-order');
        /*
         *0 取消订单, 1立即支付, 2申请退款 3确认完成
         * */
        if (flag == 0) {
            cancelHandler(num);
        } else if (flag == 1) {
            payHandler(num);
        } else if (flag == 2) {
            refundHandler(num);
        } else if (flag == 3) {
            completeHandler(num);
        } else {
        }
    });
    //事件的回调
    var refund_html = $('#refundhtml_container').html(),
        cancelHandler = function (num) {
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
        },
        refundHandler = function () {
            model.window(338, 640, '申请退款原因', refund_html);
            $('#refundhtml_container').html('');
        },
        completeHandler = function (num) {
            model.confirm('是否完成这个订单', function () {
                $.ajax({
                    url: URL.COMPLETE,
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
        };

    //退款文本框字符统计
    window.fontCountLimit = function (that) {
        var $this = $(that),
            $info = $this.parent().find('.js-font-num'),
            value = $this.val(),
            num = value ? value.length : 0;
        if (num < FONT_NUM) {
            $info.text(num + '/' + FONT_NUM);
        } else {
            $info.html('<span style="color: red;">' + FONT_NUM + '/' + FONT_NUM + '</span>');
            $this.val(value.substr(0, FONT_NUM));
        }
    };
    //退款的提交的点击事件
    window.submitRefundData = function (num) {
        if (!validate.require($('#refund_textarea').val())) {
            model.tip('退款原因不能为空！', 2000);
            return;
        }
        var ids = [];
        $.each($('#refund_checkbox').find('input:checked'), function (i, v) {
            var $this = $(this);
            ids.push($this.val());
        });
        $.ajax({
            url: URL.REFUND,
            data: {
                'order_num': num,
                'refund_type_ids': ids.join(','),
                'desc': $('#refund_textarea').val()
            },
            type: 'POST',
            dataType: 'json',
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
        model.window('hide');
    }
});