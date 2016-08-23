define(['jquery'], function ($) {
    var defaults = {
            id: '',
            url: '',
            limit: -1
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
                $dom.addClass('label-select');
                //给dom添加选择容器和选择库
                $dom.append('<ul class="label-select-checked"></ul><ul class="label-select-library"></ul>');
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
                    $check = $select.find('.label-select-checked'),
                    $library = $select.find('.label-select-library'),
                    list = this.data.selected || [],
                    total = this.data.total,
                    check_html = [],
                    library_html = [];
                $.each(total, function (i, v) {
                    if (list && $.inArray(i, list) > -1) {
                        check_html.push('<li data-id="' + i + '" class="js-select-check" data-type="checked">' + v + '</li>');
                    } else {
                        library_html.push('<li data-id="' + i + '" class="js-select-check" data-type="check">' + v + '</li>');
                    }
                });
                $check.append(check_html.join(''));
                $library.append(library_html.join(''))
                $hidden.val(list.join(','));
            },
            bindEvents: function (settings) {
                var that = this,
                    id = settings.id,
                    limit = settings.limit == -1 ? null : settings.limit - 0,
                    $select = $('#' + id),
                    $checked = $select.find('.label-select-checked'),
                    $library = $select.find('.label-select-library');
                $select.on('click', '.js-select-check', function () {
                    var $this = $(this),
                        type = $this.attr('data-type'),
                        $clone = $this.clone();
                    if (type == 'checked') {//删除
                        $this.remove();
                        $clone.attr('data-type', 'check');
                        $library.append($clone);
                    } else {//添加
                        if(limit && $checked.find('.js-select-check').length > limit - 1 ){
                            return;
                        }
                        $this.remove();
                        $clone.attr('data-type', 'checked');
                        $checked.append($clone);
                    }
                    that.setValue($checked, $('#' + id + '_hidden'));
                });
            },
            setValue: function ($checked, $hidden) {
                var $checks = $checked.find('.js-select-check'),
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