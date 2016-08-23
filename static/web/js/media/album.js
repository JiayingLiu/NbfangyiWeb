require(['jquery', 'base', 'model', 'validate', 'uploadimage', 'fancybox','page'], function ($, base, model, validate, uploadimage, fancybox,page) {
    base.init();
    //分页
    page_config.length = 11;
    page_config.url = '/shop/index/album/getAlbumDetailList?1=1' ;
    page.init(page_config);
    //image preview
    $("#image_show .js-image-item").fancybox({
        'centerOnScroll': true,
        'titlePosition': 'over',
        'cyclic': true,
        'titleFormat': function (title, currentArray, currentIndex, currentOpts) {
            return '<span id="fancybox-title-over">' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
        }
    });

    //上传绑定
    uploadimage.init({
        id: 'upload',
        multi: 5,
    });

    //删除方法
    var $albums = $('#image_show');
    $albums.on('click', '.js-image-del', function () {
        var $this = $(this),
            id = $this.attr('data-id');
        model.confirm('是否要删除这张照片', function () {
            $.ajax({
                url: '/shop/index/album/deleteAlbumDetail',
                data: {
                    id: id
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
        });
    });

    //点击事件
    var $form = $('#album_form');
    $form.on('click', '.btn', function () {
        var $this = $(this);
        if ($this.hasClass('btn-submit')) {
            $.ajax({
                url: '/shop/index/album/submitAlbumDetail',
                data: $form.serialize(),
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
        } else {
            window.location.reload();
        }

    });


});