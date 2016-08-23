require(['jquery', 'base', 'model', 'validate', 'uploadfile'], function ($, base, model, validate, uploadfile) {
    base.init();
    var URL = {
        ACCEPT: '/user/translate/order/translatorAgreedOrder',
        REFUSE: '/user/translate/order/translatorRefuseOrder',
        SUBMIT_FILE: '/user/translate/order/uploadOrderTranslateFile',
        SUBMIT_ONLINE: '/user/translate/order/uploadOrderTranslateOnlinedoc',
        REFUND: '/user/translate/order/translateRefund'
    };
    if (document.getElementById('upload')) {
        //绑定上传事件
        uploadfile.init({
            id: 'upload',
            completeUploadHandler: function (data) {
                $.ajax({
                    url: URL.SUBMIT_FILE,
                    data: {
                        'order_num': $('#upload').attr('data-order'),
                        'file_name': $('#upload_name_hidden').val(),
                        'file_url': $('#upload_hidden').val()
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
            }
        });
    }


    //点击事件
    var $toolbar = $('#detatis_toolbar');
    $toolbar.on('click', '.btn', function () {
        var $this = $(this),
            flag = $this.attr('data-value'),
            num = $this.attr('data-order'),
            total = $this.attr('data-total'),
            favo = $this.attr('data-favo');
        /*
         *0 接单, 1拒绝接单, 2提交译稿,3处理退款
         * */
        if (flag == 0) {
            acceptOrderHandler(num);
        } else if (flag == 1) {
            refuseOrderHandler(num);
        } else if (flag == 2) {
            submitHandler(num);
        } else if (flag == 3) {
            refundDealHandler(total, favo);
        } else {

        }
    });
    //事件的回调
    var refund_html = $('#refundhtml_container').html(),
        acceptOrderHandler = function (num) {
            model.confirm('是否确认接单？', function () {
                $.ajax({
                    url: URL.ACCEPT,
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
        }, refuseOrderHandler = function (num) {
            model.confirm('是否拒绝接单？', function () {
                $.ajax({
                    url: URL.REFUSE,
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
        submitHandler = function (num) {
            model.confirm('是否提交译稿？', function () {
                $.ajax({
                    url: URL.SUBMIT_ONLINE,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        'order_num': num,
                        'translation_content': $('#submit_trans_text').val()
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
        refundDealHandler = function (total, favo) {
            var value;
            total = total - 0;
            favo = favo ? favo - 0 : 0;
            value = total - favo;
            model.window(338, 480, '申请退款处理', refund_html);
            $('#refundhtml_container').html('');
            $('#refund_input').val(value);
        };
    //金钱的keyup事件
    window.moneyValidate = function (that, total, favo) {
        var $this = $(that),
            value = $this.val() - 0,
            max;
        total = total - 0;
        favo = favo ? favo - 0 : 0;
        max = total - favo;
        if (typeof value == 'number') {
            if(value > max){
                $this.val(max)
            }
        }else{
            $this.val(max);
        }
    }
    //退款的提交的点击事件
    window.submitRefundData = function (num) {
        if (!validate.require($('#refund_input').val())) {
            model.tip('退款金额不能为空！', 2000);
            return;
        }
        $.ajax({
            url: URL.REFUND,
            data: {
                'order_num': num,
                'money': $('#refund_input').val()
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