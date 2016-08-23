/**
 * Created by cuihongquan on 2016/5/11.
 */
require(['jquery', 'base', 'model', 'validate', 'uploadfile', 'wdatePicker'], function ($, base, model, validate, uploadfile, wdatePicker) {
    base.init();
    var URL = {
        NEXT: '/order/order/buy/buyConfirm',
        CACULATE: '/order/api/order/orderPriceSum'//计算手动输入的字数
    };
    //时间插件
    window.WdatePicker = wdatePicker;

    caculateFonts();
    //手动输入计算价格
    function caculateFonts() {
        var $data = $('#data_review');
        $data.find('input').eq(0).on('change', function () {
            $.ajax({
                url: URL.CACULATE,
                type: 'POST',
                data: {
                    'product_id': base.getUrlParams()['product_id'],
                    'price': $data.find('input').eq(1).val(),
                    'num': $data.find('input').eq(0).val()
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        $data.find('input').eq(2).val(data.data['total_price']);
                    } else {
                        model.tip('data.message', 2000);
                    }
                }
            });
        });
    }

    //回显字数操作
    function dataReview(data) {
        var $data = $('#data_review'),
            $inputs = $data.find('input');
        if (data.status == 0) {
            var list = data.data;
            //字数
            $inputs.eq(0).val(list.font_count);
            //总价
            $inputs.eq(2).val(list.total_price);
        } else {
            model.tip(data.message, 2000, null);
        }
    }

    //提交
    $('#place_order').on('click', null, function () {
        //各种验证
        if (!validate.require($('#file_or_str').val())) {
            model.tip('没有提交内容', 2000);
            return;
        }
        if (!validate.require($('#estimate_start').val())) {
            model.tip('开始时间为空', 2000);
            return;
        }
        if (!validate.require($('#estimate_end').val())) {
            model.tip('结束时间为空', 2000);
            return;
        }
        if (!validate.require($('[name=doc_format]:checked').val())) {
            model.tip('回稿格式为空', 2000);
            return;
        }
        base.eventWithOauthHandler(function () {
            $('#data_form').attr({
                'method': 'POST',
                'action': URL.NEXT
            }).submit();
        });
    });
    //上传绑定
    uploadfile.init({
        id: 'upload',                           //绑定上传事件的dom id,
        multi: 1,                               //是否多文件上传，
        completeUploadHandler: function (data) {
            if (data.status == 0) {
                //放地址
                $('#file_name').val(data.data.name);
                $('#file_or_str').val(data.data.url);
            } else {
                model.tip(data.message, 2000, null);
            }
        }
    });
});

