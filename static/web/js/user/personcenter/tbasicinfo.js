require(['jquery', 'base', 'model', 'validate', 'uploadimage', 'fancybox'], function ($, base, model, validate, uploadimage, fancybox) {
    base.init();
    var URL = {
        SAVE : '/shop/index/shop/submitBasicInfo'
    };
    //图片上传
    uploadimage.init({
        id: 'upload',
        multi: 2,
    });
    //最高父级dom，使用事件代理
    var $person = $('#person_center');
    $person.on('click', '.js-personcenter-btn', function () {
        var $this = $(this),
            btn_type = $this.attr('data-type');
        switch (btn_type) {
            case 'edit' :
                editHandle.call(this);
                break;
            case 'cancel' :
                cancelHandle.call(this);
                break;
            case 'save' :
                saveHandle.call(this);
                break;
            default :
                break;
        }
    });
    //图片
    $(".js-image").fancybox({
        'centerOnScroll': true,
        'titlePosition': 'over',
        'cyclic': true,
        'titleFormat': function (title, currentArray, currentIndex, currentOpts) {
            return '<span id="fancybox-title-over">' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
        }
    });
    //编辑事件
    var editHandle = function () {
            var $this = $(this),
                $show = $this.closest('.label-content-show');
            $show.hide();
            $show.next('.label-content-edit').show();
        },
        cancelHandle = function () {
            var $this = $(this),
                $edit = $this.closest('.label-content-edit');
            $edit.hide();
            $edit.prev('.label-content-show').show();
        },
        saveHandle = function () {
            $.ajax({
                url: URL.SAVE,
                type: 'post',
                data: $('#basic_form').serialize(),
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        model.tip(data.message, 1000, function () {
                            //window.location.reload();
                            window.location.href='/shop/index/shop/editShopDetail';
                        })
                    } else {
                        model.tip(data.message, 1000, function () {
                        })
                    }
                }
            });
        };

});
