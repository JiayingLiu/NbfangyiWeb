/*
 * 这里是添加评价的页面
 * */
require(['jquery', 'base', 'model', 'uploadimage'], function ($, base, model, uploadimage) {
    base.init();
    var REPLY_FONT_LIMIT = 200,
        ORDER_NUM = base.getUrlParams()['order_num'],
        URL = {
            SCOPE: '/shop/api/comment/shopScore',
            COMMONT: '/shop/api/comment/addUserComment'
        };

    //绑定星星的hover事件，点击事件
    var starHoverHandler = function () {
            var $sp = $('#sp_star'),
                $qu = $('#qu_star'),
                $se = $('#se_star');
            //速度hover时
            $sp.on('mouseover', 'i', function () {
                var $this = $(this),
                    index = $this.attr('data-index') - 0 + 1;
                $sp.find('i:lt(' + index + ')').removeClass('icon-empty-ss').addClass('icon-full-ss');
            });
            //速度离开时
            $sp.on('mouseout', function () {
                $sp.find('i').removeClass('icon-full-ss').addClass('icon-empty-ss');
            });
            //速度点击时
            $sp.on('click', 'i', function () {
                var $this = $(this),
                    index = $this.attr('data-index') - 0 + 1;
                $sp.find('i').removeClass('star-selected');
                $sp.find('i:lt(' + index + ')').removeClass('star-selected').addClass('star-selected');
            });
            //质量hover时
            $qu.on('mouseover', 'i', function () {
                var $this = $(this),
                    index = $this.attr('data-index') - 0 + 1;
                $qu.find('i:lt(' + index + ')').removeClass('icon-empty-ss').addClass('icon-full-ss');
            });
            //质量离开时
            $qu.on('mouseout', function () {
                $qu.find('i').removeClass('icon-full-ss').addClass('icon-empty-ss');
            });
            //质量点击时
            $qu.on('click', 'i', function () {
                var $this = $(this),
                    index = $this.attr('data-index') - 0 + 1;
                $qu.find('i').removeClass('star-selected');
                $qu.find('i:lt(' + index + ')').addClass('star-selected');
            });
            //服务hover时
            $se.on('mouseover', 'i', function () {
                var $this = $(this),
                    index = $this.attr('data-index') - 0 + 1;
                $se.find('i:lt(' + index + ')').removeClass('icon-empty-ss').addClass('icon-full-ss');
            });
            //服务离开时
            $se.on('mouseout', function () {
                $se.find('i').removeClass('icon-full-ss').addClass('icon-empty-ss');
            });
            //服务点击时
            $se.on('click', 'i', function () {
                var $this = $(this),
                    index = $this.attr('data-index') - 0 + 1;
                $se.find('i').removeClass('star-selected');
                $se.find('i:lt(' + index + ')').removeClass('star-selected').addClass('star-selected');
            });
        },
        textareaHandler = function () {
            $('#text_area').on('keyup', function () {
                var $this = $(this),
                    value = $this.val(),
                    len = value.length;
                if (len >= REPLY_FONT_LIMIT) {
                    $this.val(value.substr(0, REPLY_FONT_LIMIT));
                    $this.next('.js-size').text(REPLY_FONT_LIMIT + '/' + REPLY_FONT_LIMIT);
                } else {
                    $this.next('.js-size').text(len + '/' + REPLY_FONT_LIMIT);
                }
            });
        },
        submitData = function () {
            //评分的提交
            $('#submit_star').on('click', null, function () {
                var $sp = $('#sp_star'),
                    $qu = $('#qu_star'),
                    $se = $('#se_star'),
                    sp_value = $sp.find('.star-selected').length,
                    qu_value = $qu.find('.star-selected').length,
                    se_value = $se.find('.star-selected').length;
                if (sp_value < 1) {
                    model.tip('请选择速度评分', 2000);
                    return;
                }
                if (qu_value < 1) {
                    model.tip('请选择质量评分', 2000);
                    return;
                }
                if (se_value < 1) {
                    model.tip('请选择服务评分', 2000);
                    return;
                }
                $.ajax({
                    url: URL.SCOPE,
                    type: 'POST',
                    data: {
                        'order_num': ORDER_NUM,
                        'speed_num': sp_value,
                        'quality_num': qu_value,
                        'service_star_num': se_value
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 1000, function () {
                                window.location.reload();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });


            });
            //评价内容的提交
            $('#submit_content').on('click', null, function () {
                var value = $('#text_area').val(),
                    images_url = $('#upload_img_hidden').val(),
                    type = $('[name=type]:checked').val();
                if (!type) {
                    model.tip('请选择评价类型！', 2000);
                    return;
                }
                if (value.length < 10) {
                    model.tip('评价内容不能少于10个字哦～～～', 2000);
                    return;
                }
                $.ajax({
                    url: URL.COMMONT,
                    type: 'POST',
                    data: {
                        'order_num': ORDER_NUM,
                        'type': type,
                        'comment_images': images_url,
                        'comment_content': value
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 1000, function () {
                                window.location.reload();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
        };
    textareaHandler();
    starHoverHandler();
    submitData();
    //图片上传
    uploadimage.init({
        'id': 'upload_img',
        'multi': 5
    });
});