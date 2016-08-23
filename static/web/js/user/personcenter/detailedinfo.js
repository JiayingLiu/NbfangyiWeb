require(['jquery', 'base', 'model', 'validate', 'uploadfile', 'tag', 'checkbox', 'city', 'wdatePicker'],
    function ($, base, model, validate, uploadfile, tag, checkbox, city, wdatePicker) {
        base.init();
        var URL = {
            SAVE_1: '/shop/index/shop/setShopDetail',//第一块
            SAVE_2: '/shop/index/shop/setShopService',//第二块
            SAVE_3: '/shop/index/shop/submitShopDetail',//富文本编辑
            TAGS: '/shop/index/shop/ajaxGetTags',//个人标签
            LANGUAGE: '/shop/index/shop/ajaxGetLanguage',//语言标签
            FIELD: '/shop/index/shop/ajaxGetField', //服务领域标签
            TYPE: '/shop/index/shop/ajaxGetServiceType'////服务类型
        };
        //时间插件
        window.WdatePicker = wdatePicker;
        //表单
        var $form = $('#data_form'),
        //最高父级dom，使用事件代理
            $person = $('#person_center'),
        //编辑事件
            editHandle = function () {
                var $this = $(this),
                    $show = $this.closest('.label-content-show');
                $show.hide();
                $show.next('.label-content-edit').show();
            },
        //取消事件
            cancelHandle = function () {
                var $this = $(this),
                    $edit = $this.closest('.label-content-edit');
                $edit.hide();
                $edit.prev('.label-content-show').show();
            },
        //保存事件
            saveHandle = function () {
                var html = [], url = '';//地址的路径
                //如果是第一块
                if ($(this).attr('data-flag') == '1') {
                    url = URL.SAVE_1;
                    $form = $('#fir_form');
                    //第二块
                } else if ($(this).attr('data-flag') == '2') {
                    url = URL.SAVE_2;
                    $form = $('#sec_form');
                    $person.find('.js-time-input').each(function (i, v) {
                        html.push(v.value);
                    });
                    $('#work_time_hidden').val(html.join(','));
                    //第三块
                } else if ($(this).attr('data-flag') == '3') {
                    url = URL.SAVE_3;
                    $form = $('#thi_form');
                    // 取得HTML内容
                    editor.sync();
                    $('#detail_content_hidden').val(editor.html());
                } else {

                }
                $.ajax({
                    url: url,
                    type: 'post',
                    data: $form.serialize(),
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
        //绑定事件
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
                case 'save':
                    saveHandle.call(this);
                    break;
                default :
                    break;
            }
        });
        //个人标签
        tag.bind({
            id: 'tag_person',
            url: URL.TAGS,
            limit: 6
        });
        //语言标签
        tag.bind({
            id: 'tag_language',
            url: URL.LANGUAGE
        });
        //服务领域标签
        tag.bind({
            id: 'tag_service',
            url: URL.FIELD,
            limit: 10
        });
        //服务类型
        checkbox.bind({
            id: 'checkbox_type',
            url: URL.TYPE
        });
        //上传绑定
        uploadfile.init({
            id: 'upload',
            multi: 1
        });
        //地区初始化
        city.init();
    });