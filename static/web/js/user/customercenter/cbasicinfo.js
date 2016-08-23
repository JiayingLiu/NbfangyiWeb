require(['jquery', 'base', 'model'], function ($, base, model) {
    base.init();
    var URL = {
        SUBMIT: '/usercore/api/member/modifyUserExtInfo'  //用户提交地址
    };
    //最高父级dom，使用事件代理
    var $person = $('#person_center');
    $person.on('click', '.js-personcenter-btn', function () {
        var $this = $(this),
            btn_type = $this.attr('data-type');
        switch (btn_type) {
            case 'edit' :
                editHandle.call(this);
                break;
            case 'cancel' :
                cancelHandle.call(this);
                break;
            case 'save' :
                saveHandle.call(this);
                break;
            default :
                break;
        }
    });
    //编辑事件
    var editHandle = function () {
            var $this = $(this),
                $show = $this.closest('.label-content-show');
            $show.hide();
            $show.next('.label-content-edit').show();
        },
        cancelHandle = function () {
            var $this = $(this),
                $edit = $this.closest('.label-content-edit');
            $edit.hide();
            $edit.prev('.label-content-show').show();
        },
        saveHandle = function () {
            $.ajax({
                url: URL.SUBMIT,
                type: 'post',
                data: $('#basic_form').serialize(),
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        model.tip(data.message, 1000, function () {
                            window.location.reload();
                        })
                    } else {
                        model.tip(data.message, 1000, function () {
                        })
                    }
                }
            });
        };

});