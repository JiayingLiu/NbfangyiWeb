require(['jquery', 'base', 'ajaxPage', 'model', 'fancybox'], function ($, base, ajaxPage, model) {
    base.init();
    var URL = {
        PRODUCT: '/shop/index/shop/productDetail?id=',//产品详情页
        INFO: '/shop/api/comment/getShopCommentInfo',//拿取店铺的星级评价
        GETSHOP: '/shop/api/comment/getCommentList',//拿取店铺的所有评价
        GETREPLY: '/shop/api/comment/getCommentReplyInfo',//拿取评价的回复信息
        SUBMIT: '/shop/api/comment/shopReplyCommentInfo'//提交回复的信息
    };
    var REPLY_FONT_LIMIT = 100,
        $select = $('#eva_select'),
        $table = $('#eval_list'),
        shop_id = base.getUrlParams()['shop_id'];
    //拿取店铺的星级评价
    getShopEvalInfo = function () {
        $.ajax({
            url: URL.INFO,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.status == 0) {
                    setShopInfo(data.data);
                }
            }
        });
    },
        //设置店铺的信息
        setShopInfo = function (data) {
            var count = data['comment_count'],
                list = data['comment_type_list'],
                star = data['shop_star'];
            //设置总数
            $('#star_num').text(star['star_num']);
            //总评分星星
            $('#total_star').empty().append(createStarHtml('b', star['star_num']));
            //速度星星
            $('#sp_star').empty().append(createStarHtml('s', star['speed_star_num']));
            //质量星星
            $('#qu_star').empty().append(createStarHtml('s', star['quality_star_num']));
            //服务星星
            $('#se_star').empty().append(createStarHtml('s', star['service_star_num']));
            //好评数量
            $('#good').text(count.good);
            //中评数量
            $('#normal').text(count.normal);
            //差评数量
            $('#poor').text(count.poor);
            //构建type选择栏
            $select.empty().append(createTypeHtml(list));
        },
        //构建typedom
        createTypeHtml = function (data) {
            var html = [];
            $.each(data, function (i, v) {
                html.push('<li><a href="javascript:;" data-type="' + i + '" class="' + (i == 0 ? 'evaluate-type-selected' : '' ) + '">' + v + '</a></li>');
            });
            return html;
        },
        //构建星星的dom
        createStarHtml = function (type, num) {
            var count = 5,
                html = [],
                num_arr,
                num_full,
                temp_full,
                num_half,
                num_empty,
                html_full = type == 'b' ? '<i class="icon-eavl-b icon-full-bs"></i>' : '<i class="icon-eavl-s icon-full-ss"></i>',
                html_half = type == 'b' ? '<i class="icon-eavl-b icon-half-bs"></i>' : '<i class="icon-eavl-s icon-half-ss"></i>',
                html_empt = type == 'b' ? '<i class="icon-eavl-b icon-empty-bs"></i>' : '<i class="icon-eavl-s icon-empty-ss"></i>';
            num = num + '';
            //计算星星
            num_arr = num.split('.');
            //全星星，半星星
            num_full = temp_full = num_arr[0] - 0;
            num_half = num_arr[1] ? num_arr[1] - 0 : 0;
            //如果有全的
            if (temp_full) {
                while (temp_full--) {
                    html.push(html_full);
                }
            }
            //如果有半的
            if (num_half) {
                html.push(html_half);
                num_empty = count - num_full - 1;
                while (num_empty--) {
                    html.push(html_empt);
                }
            } else {
                num_empty = count - num_full;
                while (num_empty--) {
                    html.push(html_empt);
                }
            }
            return html;
        },
        //获取店铺列评价列表
        getEvaluateList = function (data) {
            ajaxPage.init({
                url: URL.GETSHOP,
                length: 11,
                data: data,
                tableBuilderHandler: function (data) {
                    var html = [];
                    $.each(data, function (i, v) {
                        html.push('<tr><td width="60%" align="left"><p>' + v['comment_content'] + '</p><p>');
                        var images = v['img_list'],
                            len = images.length;
                        while (len--) {
                            html.push('<a href="' + BASE_FILE_URL + images[len]['big_thumb'] + '" rel="g_' + i + '" title="' + v['create_time'] +
                                '" class="js-review"><img src="' + BASE_FILE_URL + images[len]['small_thumb'] + '" height="80" width="80"></a>');
                        }
                        html.push('<p>评价时间：' + v['create_time'] + '</p></td>');
                        html.push('<td><a href="javascript:void(0);" class="link">' + v['priduct_title']);
                        html.push('<br>' + v['shop_title'] + '</a></td><td>' + v['tname'] + '</td>');
                        html.push('<td><a href="javascript:void(0);" class="link js-reply" data-id="' + v['id'] + '">回复</a></td></tr>');
                        //这里是编辑的dom html
                        html.push('<tr class="eval-edit js-edit"><td colspan="4"><div><textarea class="form-textarea" placeholder="请输入您的回复！"></textarea>');
                        html.push('</div><div class="text-right js-re-font">0/' + REPLY_FONT_LIMIT + '</div>');
                        html.push('<div class="text-right"><a class="btn btn-cancel js-close" href="javascript:void(0);">取消</a>');
                        html.push('<a class="btn btn-submit js-re-submit" href="javascript:void(0);" ');
                        html.push('data-id="' + v['id'] + '" data-num="' + v['order_num'] + '">提交</a></div></td></tr>');
                        //这里是查看的dom html
                        html.push('<tr class="eval-view js-view" class="eval-view"><td colspan="4"><div class="text-left">我的回复：</div>');
                        html.push('<div><textarea class="form-textarea" readonly></textarea></div>');
                        html.push('<div class="text-right"><a class="btn btn-cancel js-close" href="javascript:void(0);">关闭</a></div></td></tr>');
                    });
                    $table.empty().append(html.join(''));
                    //图片绑定fancybox,反复绑定造成的内存和事件运行问题暂时没有进行处理
                    $table.find('.js-review').fancybox({
                        'centerOnScroll': true,
                        'titlePosition': 'over',
                        'cyclic': true,
                        'titleFormat': function (title, currentArray, currentIndex, currentOpts) {
                            title = '';
                            return '<span id="fancybox-title-over">' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
                        }
                    });
                }
            });
        },
        //绑定事件
        bindEvents = function () {
            $table.on('click', '.js-reply', function () {
                var $this = $(this),
                    $tr = $this.parent().parent(),
                    $edit = $tr.next(),
                    $view = $edit.next(),
                    id = $this.attr('data-id');
                $.ajax({
                    url: URL.GETREPLY + '?id=' + id,
                    dataType: 'json',
                    success: function (data) {
                        console.info(data)
                        if (data.status == 0) {
                            var list = data.data.list;
                            //如果有参数，说明是view
                            if (list && list.length > 0) {
                                var str = list[0]['comment_content'];
                                $view.find('textarea').val(str);
                                $edit.hide();
                                $view.show();
                            } else {
                                $view.hide()
                                $edit.show();
                            }
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
            $table.on('keyup', '.form-textarea', function () {
                var $this = $(this),
                    value = $this.val(),
                    len = value.length;
                if (len >= REPLY_FONT_LIMIT) {
                    $this.val(value.substr(0, REPLY_FONT_LIMIT));
                    $this.parent().next('.js-re-font').text(REPLY_FONT_LIMIT + '/' + REPLY_FONT_LIMIT);
                } else {
                    $this.parent().next('.js-re-font').text(len + '/' + REPLY_FONT_LIMIT);
                }
            });

            //回复提交
            $table.on('click', '.js-re-submit', function () {
                var $this = $(this),
                    id = $this.attr('data-id'),
                    num = $this.attr('data-num'),
                    content = $this.parent().parent().find('textarea').val();
                if (content.length < 10) {
                    model.tip('回复内容在10至100个字符之间', 2000);
                    return;
                }
                $.ajax({
                    url: URL.SUBMIT,
                    dataType: 'json',
                    data: {
                        'id': id,
                        'order_num': num,
                        'comment_images': '',
                        'comment_content': content
                    },
                    type: 'POST',
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 2000, function () {
                                $table.find('.js-rpedit').hide();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
            //取消按钮
            //回复提交
            $table.on('click', '.js-close', function () {
                $(this).closest('tr').hide();
            });
        };
    //初始化页面的数据，初始化星星
    getShopEvalInfo();
    getEvaluateList();
    bindEvents();
});