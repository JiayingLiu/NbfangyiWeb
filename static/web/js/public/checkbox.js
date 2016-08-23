define(['jquery'], function ($) {
    var defaults = {
            id: '',
            url: ''
        },
        methods = {
            init: function (options) {
                var settings = $.extend(true, {}, defaults, options);
                this.createDom(settings);
                this.bindEvents(settings);
            },
            data: {},
            createDom: function (settings) {
                var id = settings.id,
                    $dom = $('#' + id);
                //给绑定的dom添加样式
                $dom.addClass('checkbox-select');
                //构造隐藏域
                $dom.append('<input type="hidden" name="' + $dom.attr('name') + '" id="' + id + '_hidden">');
                //删除原有name
                $dom.removeAttr('name');
                this.requireData(id, settings.url);
            },
            requireData: function (id, url) {
                var that = this;
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            that.data = data.data;
                            that.initData(id);
                        } else {
                            console.error('没请求到数据');
                        }
                    }
                });
            },
            initData: function (id) {
                var $select = $('#' + id),
                    $hidden = $('#' + id + '_hidden'),
                    list = this.data.selected||[],
                    total = this.data.total,
                    html = [];
                $.each(total, function (i, v) {
                    if ($.inArray(i, list) > -1) {
                        html.push('<a href="javascript:void(0);" data-id="' + i + '" class="checkbox-select-selected"><i class="iconfont icon-full-mark">' + v + '</i></a>');
                    } else {
                        html.push('<a href="javascript:void(0);" data-id="' + i + '"><i class="iconfont icon-empty-mark">' + v + '</i></a>');
                    }
                });
                $select.append(html.join(''))
                $hidden.val(list.join(','));
            },
            bindEvents: function (settings) {
                var that = this,
                    id = settings.id,
                    $select = $('#' + id);
                $select.on('click', 'a', function () {
                    var $this = $(this),
                        type = $this.attr('data-type'),
                        $this_i = $this.find('i');
                    $this.toggleClass('checkbox-select-selected');
                    if($this.hasClass('checkbox-select-selected')){
                        $this_i.removeClass('icon-empty-mark').addClass('icon-full-mark');
                    }else{
                        $this_i.removeClass('icon-full-mark').addClass('icon-empty-mark');
                    }
                    that.setValue($select, $('#' + id + '_hidden'));
                });
            },
            setValue: function ($select, $hidden) {
                var $checks = $select.find('.checkbox-select-selected'),
                    list = [];
                $.each($checks, function () {
                    list.push($(this).attr('data-id'));
                });
                $hidden.val(list.join(','));
            }
        };

    return {
        bind: function (options) {
            methods.init(options);
        }
    };
});