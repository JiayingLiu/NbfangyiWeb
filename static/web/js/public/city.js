define(['jquery'], function ($) {
    //获取绑定事件的dom
    var $combox = $('.city-select'),
        url = '/index/common/city/getCityList',//从省到区
        url_ = '/index/common/city/getCityInfo',//从区到省
        $pro,
        $city,
        $area,
        methods = {
            init: function () {
                this.createDom();
                this.initData();
                this.bindEvent();
            },
            createDom: function () {
                $combox.append(' <div class="city-select-wrap"><select class="city-select-pro"><option selected value="">请选择</option></select></div>' +
                    '<div class="city-select-wrap"><select class="city-select-city" disabled><option selected value="">请选择</option></select></div>' +
                    '<div class="city-select-wrap"><select class="city-select-area" disabled><option selected value="">请选择</option></select></div>');
                $pro = $combox.find('.city-select-pro');
                $city = $combox.find('.city-select-city');
                $area = $combox.find('.city-select-area');
                var name = $combox.attr('name');
                //获取name属性,生成隐藏域
                $combox.append('<input type="hidden" name="' + name + '" value="' + ($combox.attr('data-init') || '') + '">');
                $combox.attr('name', name + '_wrap');
            },
            initData: function () {
                var are_id = $combox.attr('data-init'), html = [], that = this;
                $.ajax({
                    url: url + '?pid=0',
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        $.each(data.data, function (i, v) {
                            html.push('<option data-id="' + v.id + '">' + v.title + '</option>');
                        });
                        $pro.append(html.join(''));
                        are_id && that.setCheckedNode(are_id);
                    }
                });
            },
            bindEvent: function () {
                var that = this;
                $combox.on('change', 'select', function () {
                    that.ajaxChildrenNode.call(this);
                });
            },
            ajaxChildrenNode: function () {
                var $this = $(this),
                    id = $this.find('option:selected').attr('data-id'),
                    html = ['<option>请选择</option>'];
                //请求数据
                $.ajax({
                    url: url + '?pid=' + id,
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        if (data.status == 0) {
                            //封装数据
                            data.data && data.data.length && $.each(data.data, function (i, v) {
                                html.push('<option data-id="' + v.id + '">' + v.title + '</option>');
                            });
                            if ($this.hasClass('city-select-pro')) {
                                $city.removeAttr('disabled').empty().append(html.join(''));
                            } else if ($this.hasClass('city-select-city')) {
                                $area.removeAttr('disabled').empty().append(html.join(''));
                            } else {
                                $combox.find('input').val(id);
                            }
                        } else {
                            console.error('没找到子集');
                        }
                    }
                });
            },
            setCheckedNode: function (id) {
                $.ajax({
                    url: url_ + '?id=' + id,
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        if (data.status == 0) {
                            data && data.data && $.each(data.data, function (i, v) {
                                switch (v.level) {
                                    case '1' :
                                        $pro.find('option[data-id=' + v.id + ']').attr('selected', 'selected');
                                        break;
                                    case '2' :
                                        $city.append('<option data-id="' + v.id + '" selected>' + v.title + '</option>');
                                        break;
                                    case '3' :
                                        $area.append('<option data-id="' + v.id + '" selected>' + v.title + '</option>');
                                        break;
                                    default :
                                        break;
                                }
                            });
                        } else {
                            console.error('没找到父级');
                        }
                    }
                });
            }
        };
    return {
        init: function () {
            methods.init();
        }
    };
})
;