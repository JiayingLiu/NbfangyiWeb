require(['jquery', 'base', 'model', 'validate', 'wdatePicker'], function ($, base, model, validate, wdatePicker) {
    base.init();
    //时间插件
    window.WdatePicker = wdatePicker;
    var URL = {
            ADD: '/shop/index/experience/submitExperience',
            DEL: '/shop/index/experience/deleteExperience'
        },
        FONT_NUM = 1000;

    var $add_form = $('#add_form'),//新建form
        $exp_list = $('#exp_list'),//经历列表
        $edit_form_wrap = $('#edit_form_wrap'),
        $edit = $edit_form_wrap.clone(true);//获取编辑
    //删除内部的编辑form
    $edit_form_wrap.remove();
    //绑定新建form的click事件，应用事件代理
    $add_form.on('click', '.btn', function () {
        var $this = $(this);
        if ($this.hasClass('btn-submit')) {
            saveExp();
        } else {
            formClear();
        }
    });
    //列表的点击事件
    $exp_list.on('click', '.exp-btn,.btn', function () {
        var $this = $(this);
        if ($this.hasClass('js-exp-edit')) {
            showExpEdit($this);
        } else if ($this.hasClass('js-exp-update')) {
            updateExp();
        } else if ($this.hasClass('btn-cancel')) {
            formClear();
        } else {
            deleteExp($this.attr('data-id'));
        }
    });

    //显示编辑的事件
    function showExpEdit($this) {
        //其父级的exp-item
        var $exp_item = $this.closest('.exp-item'),
            id = $this.attr('data-id');
        $exp_item.after($edit);
        //隐藏这个item
        $exp_item.hide();
        //拿取数据
        $('#edit_id').val(id);
        $('#edit_start_time').val($exp_item.attr('data-st'));
        $('#edit_end_time').val($exp_item.attr('data-et'));
        $('#edit_type').find('option[value=' + $exp_item.attr('data-type') + ']').attr('selected', 'selected');
        $('#edit_content').val($exp_item.attr('data-ct'));
        //算文本框的统计字符数量
        var $info = $('#edit_content').parent().next('.js-font-num'),
            value = $exp_item.attr('data-ct'),
            num = value ? value.length : 0;
        if (num < FONT_NUM) {
            $info.text(num + '/' + FONT_NUM);
        } else {
            $info.html('<span style="color: red;">' + FONT_NUM + '/' + FONT_NUM + '</span>');
            $('#edit_content').val(value.substr(0, FONT_NUM));
        }
        //显示编辑
        $('#edit_form').show();
        //禁用其它编辑按钮
        $exp_list.find('.js-exp-edit').hide();
    }

    //编辑的文本框字符统计
    $exp_list.on('keyup', '#edit_content', function () {
        var $this = $(this),
            $info = $this.parent().next('.js-font-num'),
            value = $this.val(),
            num = value ? value.length : 0;
        if (num < FONT_NUM) {
            $info.text(num + '/' + FONT_NUM);
        } else {
            $info.html('<span style="color: red;">' + FONT_NUM + '/' + FONT_NUM + '</span>');
            $this.val(value.substr(0, FONT_NUM));
        }
    });

    //新建的文本框字符统计
    $('#add_content').on('keyup', function () {
        var $this = $(this),
            $info = $this.parent().next('.js-font-num'),
            value = $this.val(),
            num = value ? value.length : 0;
        if (num < FONT_NUM) {
            $info.text(num + '/' + FONT_NUM);
        } else {
            $info.html('<span style="color: red;">' + FONT_NUM + '/' + FONT_NUM + '</span>');
            $this.val(value.substr(0, FONT_NUM));
        }
    });

    //编辑事件
    function updateExp() {
        if (!validate.require($('#edit_start_time').val())) {
            model.tip('开始时间不能为空', 2000);
            return;
        }
        if (!validate.require($('#edit_end_time').val())) {
            model.tip('结束时间不能为空', 2000);
            return;
        }
        if (!validate.require($('#edit_type').val())) {
            model.tip('请选择描述经历类型', 2000);
            return;
        }
        if (!validate.require($('#edit_content').val())) {
            model.tip('描述经历不能为空', 2000);
            return;
        }
        $.ajax({
            url: URL.ADD,
            type: 'post',
            dataType: 'json',
            data: $('#edit_form').serialize(),
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 500, function () {
                        window.location.reload();
                    });
                } else {
                    model.tip(data.message, 1000);
                }
            }
        });
    }

    //删除事件
    function deleteExp(id) {
        model.confirm('删除此条过往经历吗？', function () {
            $.ajax({
                url: URL.DEL,
                data: {
                    'id': id
                },
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        model.tip(data.message, 500, function () {
                            window.location.reload();
                        });
                    } else {
                        model.tip(data.message, 1000);
                    }
                }
            });
        });
    }

    //保存方法
    function saveExp() {
        if (!validate.require($('#start_time').val())) {
            model.tip('开始时间不能为空', 2000);
            return;
        }
        if (!validate.require($('#end_time').val())) {
            model.tip('结束时间不能为空', 2000);
            return;
        }
        if (!validate.require($('#add_type').val())) {
            model.tip('请选择描述经历类型', 2000);
            return;
        }
        if (!validate.require($('#add_content').val())) {
            model.tip('描述经历不能为空', 2000);
            return;
        }
        $.ajax({
            url: URL.ADD,
            type: 'post',
            dataType: 'json',
            data: $add_form.serialize(),
            success: function (data) {
                if (data.status == 0) {
                    model.tip(data.message, 500, function () {
                        window.location.reload();
                    });
                } else {
                    model.tip(data.message, 1000);
                }
            }
        });
    }

    //清空事件
    function formClear() {
        window.location.reload();
    }
});