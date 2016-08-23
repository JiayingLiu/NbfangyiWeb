require(['jquery', 'base', 'model', 'validate', 'uploadfile', 'wdatePicker'], function ($, base, model, validate, uploadfile, wdatePicker) {
    base.init();
    var URL = {
        NEXT: '/order/order/buy/buyConfirm',
        FONT_COUNT: '/order/api/order/getWordFontInfo',
        CACULATE: '/order/api/order/orderPriceSum'//计算手动输入的字数
    };
    //时间插件
    window.WdatePicker = wdatePicker;
    //选择dom
    var $fast_area = $('#translation_fast'),
        $file_area = $('#translation_file'),
        $choose_type = $('#choose_type');
    //点击事件-选择翻译类型
    $choose_type.on('click', 'a', function () {
        var $this = $(this),
            $hover = $choose_type.find('.trans-type-selected');
        $hover.removeClass('trans-type-selected');
        $this.addClass('trans-type-selected');
        if ($this.attr('data-id') == 2) {//2为快速翻译 ， 4为文件翻译
            $fast_area.show();
            $file_area.hide();
            $('#data_review').find('input').eq(0).attr('readonly','readonly');
            $('#data_review').find('input').eq(0).attr('placeholder','系统计算的字数');
        } else {
            $fast_area.hide();
            $file_area.show();
            $('#data_review').find('input').eq(0).removeAttr('readonly');
            $('#data_review').find('input').eq(0).attr('placeholder','填写你计算的字数');
        }
    });
    //点击事件-输入字数的统计
    var timer;
    $('#fast_input').on('keyup', function () {
        var $this = $(this),
            value = $this.val();
        if (value && $.trim(value)) {
            window.clearTimeout(timer);
            //500毫秒自动计算
            timer = setTimeout(function () {
                ajaxCalculate(value);
            }, 500);
            //放地址
            $('#file_or_str').val(value);
        }
    });
    //请求字数数据
    function ajaxCalculate(value) {
        $.ajax({
            url: URL.FONT_COUNT,
            data: {
                'translate_content_type': $choose_type.find('.trans-type-selected').attr('data-id'),//待翻译类型： 2-在线翻译，4-文件翻译
                'product_id': $('#product_id').val(),
                'file_or_str': value //文件地址或内容字符串
            },
            type: 'POST',
            dataType: 'json',
            success: dataReview
        });
    }

    caculateFonts();
    //手动输入计算价格
    function caculateFonts() {
        var $data = $('#data_review');
        $data.on('change', function () {
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
                    if(data.status == 0){
                        $data.find('input').eq(2).val(data.data['total_price']);
                    }else{
                        model.tip('data.message',2000);
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
        //是快速翻译还是文件翻译
        $('#translate_content_type').val($choose_type.find('.trans-type-selected').attr('data-id'));
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
            var font = $('#data_review').find('input').eq(0).val();
            if(font > 99){
                $('#data_form').attr({
                    'method': 'POST',
                    'action': URL.NEXT
                }).submit();
            }else{
                model.tip('下单字数必须大于100', 2000);
            }
        });
    });
    //上传绑定
    uploadfile.init({
        id: 'upload',                           //绑定上传事件的dom id,
        multi: 1,                               //是否多文件上传，
        completeUploadHandler: function (data) {
            if (data.status == 0) {
                ajaxCalculate(data.data.url);
                //放地址
                $('#file_name').val(data.data.name);
                $('#file_or_str').val(data.data.url);
            } else {
                model.tip(data.message, 2000, null);
            }
        }
    });
});