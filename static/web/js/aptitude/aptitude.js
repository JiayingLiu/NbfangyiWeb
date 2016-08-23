require(['jquery', 'base', 'model', 'uploadimage', 'fancybox'], function ($, base, model, uploadimage, fancybox) {
    base.init();
    var URL ={
      SAVE : '/shop/index/shop/submitCertification'
    };
    //上传
    uploadimage.init({
        id: 'upload_education',
        multi: 2
    });
    uploadimage.init({
        id: 'upload_qualification',
        multi: 2
    });
    uploadimage.init({
        id: 'upload_language',
        multi: 2
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
    //编辑点击事件
    $('#aptitude_edit').on('click', null, function () {
        //展示
        $('#aptitude_show_content').hide();
        //编辑
        $('#aptitude_edit_content').show();
    });
    //取消点击事件
    $('#aptitude_cancel').on('click', null, function () {
        //展示
        $('#aptitude_show_content').show();
        //编辑
        $('#aptitude_edit_content').hide();
    });
    //保存事件
    $('#aptitude_submit').on('click', null, function () {
        $.ajax({
            url: URL.SAVE,
            dataType: 'json',
            type: 'POST',
            data: $('#aptitude_form').serialize(),
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
        });
    });
});