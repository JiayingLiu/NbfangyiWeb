define(['jquery'], function ($) {
    return {
        init: function (config) {
            //数据转换
            var offset = config.offset - 0,
                total = config.total - 0,
                limit = config.limit - 0,
                url = config.url,
                length = config.length,
                showPages = config.showPages == false ? config.showPages : true;
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
            $('#pagination').empty().append(html.join(''));
            showPages && $('#pagination').after('<p class="text-center"><input style="width: 40px;" type="text" id="pagination_page"><span>/' + btns + '页</span>,<span>共' + total + '条</span></p>');

            var halfNum = (length - 1) / 2;

            if (cur <= halfNum) {
                $('#pagination').find('.pagination-item:gt(' + halfNum * 2 + ')').hide();
            } else if (cur > halfNum && btns - cur > (halfNum + 1)) {
                $('#pagination').find('.pagination-item:lt(' + (cur - halfNum) + ')').hide();
                $('#pagination').find('.pagination-item:gt(' + (cur + halfNum) + ')').hide();
            } else if (btns - cur >= 1) {
                $('#pagination').find('.pagination-item:lt(' + (1 - length) + ')').hide();
            } else {
            }
            $('#pagination').on('click', '.pagination-item', function () {
                var index = $(this).attr('data-index') - 0;
                offset = index * limit;
                if (url.match(/\?/)) {
                    window.location.href = url + '&offset=' + offset;
                } else {
                    window.location.href = url + '?offset=' + offset;
                }
            });
            $('#pagination_page').on('change', function () {
                var value = $(this).val() - 0;
                if (value && typeof value === 'number' && value > 0) {
                    value = value < btns ? value : btns;
                    offset = (value - 1) * limit;
                    if (url.match(/\?/)) {
                        window.location.href = url + '&offset=' + offset;
                    } else {
                        window.location.href = url + '?offset=' + offset;
                    }
                } else {
                    $(this).val('');
                }
            });
        }
    }
});