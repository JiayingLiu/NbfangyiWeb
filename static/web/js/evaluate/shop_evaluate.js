require(['jquery', 'base', 'ajaxPage', 'model', 'fancybox'], function ($, base, ajaxPage, model, fancybox) {
    base.init();
    var URL = {
        GETSHOP: '/shop/api/shopComment/browse',//获取某个店铺的评论信息
        GETREPLY: '/shop/api/shopComment/getCommentReplyInfo',//获取某条评论下的回复
        GETALLINFO: '/shop/api/shopComment/getShopStarInfo'//获取好、中、差评数量、店铺星级
    };
    var $select = $('#eva_select'),
        $table = $('#eval_list'),
        shop_id = base.getUrlParams()['shop_id'];
    //获取好、中、差评数量、店铺星级
    var getShopInfo = function () {
            $.ajax({
                url: URL.GETALLINFO + '?shop_id=' + shop_id,
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        setShopInfo(data.data);
                    } else {
                    }
                }
            });
        },
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
                            len = images ? images.length : 0;
                        while (len--) {
                            images[len]['big_thumb'] && images[len]['small_thumb'] && html.push('<a href="' + BASE_FILE_URL + images[len]['big_thumb'] + '" rel="g_' + i + '" title="' + v['create_time'] +
                                '" class="js-review"><img src="' + BASE_FILE_URL + images[len]['small_thumb'] + '" height="80" width="80"></a>');
                        }
                        html.push('<p>评价时间：' + v['create_time'] + '</p></td>');
                        html.push('<td><span>' + v['product_title']);
                        html.push('</span></td><td>' + v['tname'] + '</td></tr>');
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
    //绑定点击事件
        bindEvents = function () {
            $select.on('click', 'a', function () {
                var $this = $(this),
                    type = $this.attr('data-type');
                $select.find('.evaluate-type-selected').removeClass('evaluate-type-selected');
                $this.addClass('evaluate-type-selected');
                getEvaluateList({
                    'shop_id': shop_id,
                    type: type
                });

            });
        };
    //获取好、中、差评数量、店铺星级
    getShopInfo();
    //获取店铺列评价列表
    getEvaluateList({
        'shop_id': shop_id,
        type: 0
    });
    //绑定点击事件
    bindEvents();
});