define(['jquery'], function ($) {
    /*
     * ajax 分页方法
     * */
    var method = {
        init: function (config) {
            //配置的参数
            var defaults = {
                url: '',//请求数据的地址
                length: 11,//按钮的数量
                data: {},//请求的参数
                tableBuilderHandler: null//构造表格的回调函数
            }
            var settings = $.extend({}, defaults, config);
            this.requestData(settings, 0);
        },
        requestData: function (settings, offset) {
            var that = this,
                url = settings.url,
                data = settings.data,
                len = settings.length;
            url = url + '?offset=' + offset;
            $.ajax({
                url: url,
                type: 'GET',
                data: data,
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        var data_list = data.data,
                            request = data_list['request_param'],
                            list = data_list.list,
                            total = data_list['total_count'],
                            limit = request['limit'];
                        offset = request['offset'];
                        settings.tableBuilderHandler && settings.tableBuilderHandler.call(this, list);
                        that.createPage(offset, limit, total, len);
                        that.bindEvents(total, limit, settings);
                    } else {
                        console.info('请求数据出错了！');
                    }
                }
            });
        },
        createPage: function (offset, limit, total, length) {
            //当前页码为偏移量除以一页的数据
            var cur = offset / limit;
            //计算按钮数量
            var btns = Math.ceil(total / limit);

            var html = [];

            for (var i = 0; i < btns; i++) {
                if (i == cur) {
                    html.push('<li class="active"><a href="javascript:;" class="pagination-item" data-index="' + i + '">' + (i + 1) + '</a></li>');
                } else {
                    html.push('<li><a href="javascript:;" class="pagination-item" data-index="' + i + '">' + (i + 1) + '</a></li>');
                }
            }

            var $page = $('#pagination');
            $page.empty().append(html.join(''));
            $page.next('.text-center').empty().append('<input style="width: 40px;" type="text" id="pagination_page">' +
                '<span>/共' + btns + '页</span>,<span>共' + total + '条</span>');
            var halfNum = (length - 1) / 2;

            if (cur <= halfNum) {
                $page.find('.pagination-item:gt(' + halfNum * 2 + ')').hide();
            } else if (cur > halfNum && btns - cur > (halfNum + 1)) {
                $page.find('.pagination-item:lt(' + (cur - halfNum) + ')').hide();
                $page.find('.pagination-item:gt(' + (cur + halfNum) + ')').hide();
            } else if (btns - cur >= 1) {
                $page.find('.pagination-item:lt(' + (1 - length) + ')').hide();
            } else {
            }
        },
        bindEvents: function (total, limit, settings) {
            var that = this;
            $('#pagination').off().on('click', '.pagination-item', function () {
                var index = $(this).attr('data-index') - 0,
                    offset = index * limit;
                that.requestData(settings, offset);
            });
            $('#pagination_page').off().on('change', function () {
                var value = $(this).val() - 0,
                    btns = Math.ceil(total / limit);
                if (value && typeof value === 'number' && value > 0) {
                    value = value < btns ? value : btns;
                    offset = (value - 1) * limit;
                    that.requestData(settings, offset);
                } else {
                    $(this).val('');
                }
            });
        }
    };
    return {
        init: function (config) {
            method.init(config);
        }
    }
});