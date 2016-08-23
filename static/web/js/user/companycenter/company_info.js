/**
 * Created by cuihongquan on 16/5/3.
 */
require(['jquery', 'base', 'fancybox'], function ($, base, fancybox) {
    base.init();
    var URL = {
        LOGO_UPLOAD: '/index/common/uploadFile/uploadBase64File', //logo上传地址
        LOGO_SWF: BASE_CSS_URL + 'web/css/style/user/look/FaustCplus.swf',//logo上传swf
        SAVE_LOOK: '/shop/index/shop/setLogo',//头像的保存
        SAVE_BASIC: '/shop/index/shop/submitBasicInfo',//基本信息
        SAVE_DETAIL: '/shop/index/shop/setShopDetail',//详细信息
        SAVE_SERVICE: '/shop/index/shop/setShopService',//服务设置
        SAVE_CUSTOM: '/shop/index/shop/submitShopDetail',//自定义编辑
        TAGS: '/shop/index/shop/ajaxGetTags',//个人标签
        LANGUAGE: '/shop/index/shop/ajaxGetLanguage',//语言标签
        FIELD: '/shop/index/shop/ajaxGetField', //服务领域标签
        TYPE: '/shop/index/shop/ajaxGetServiceType',//服务类型
        IS_SHOP: '/shop/index/shop/isShopInfo'//查看店铺是否申请
    };

    var details_step = 1,//资料的进度
        details_obj = {//资料的进度对象
            1: '店铺logo',
            2: '基本资料',
            3: '详细资料',
            4: '服务设置',
            5: '自定义设置',
            0: '资料完成'
        };

    //绑定事件
    var $person = $('#person_center');
    $person.on('click', '.js-pc-btn', function () {
        var $this = $(this),
            ele_type = $this.attr('data-ele');
        $.ajax({
            url: URL.IS_SHOP,
            success: function (data) {
                //当前的第几部
                details_step = data.status - 0;
                switch (ele_type) {
                    case 'edit' :
                        open_edit($this);
                        break;
                    case 'cancel' :
                        close_edit($this);
                        break;
                    default :
                        break;
                }
            }
        });
    });

    /*
     * 图片的预览
     * */
    //图片
    $(".js-image").fancybox({
        'centerOnScroll': true,
        'titlePosition': 'over',
        'cyclic': true,
        'titleFormat': function (title, currentArray, currentIndex, currentOpts) {
            return '<span id="fancybox-title-over">' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
        }
    });

    /*
     * 关闭编辑
     * */
    var close_edit = function () {
        location.reload();
    };
    /*
     * 打开编辑
     * */
    var open_edit = function ($this) {
        var index = $this.attr('data-index') - 0,
            $show = $this.parents('.label-content-show'),
            $edit = $show.next('.label-content-edit');
        if (details_step == 0 || details_step >= index) {
            $show.hide();
            $edit.show();
            switch (index) {
                case 1:
                    init_look();
                    break;
                case 2:
                    init_basic();
                    break;
                case 3:
                    init_details();
                    break;
                case 4:
                    init_service();
                    break;
                case 5:
                    init_custom();
                    break;
                case 0:
                    break;
                default :
                    break;
            }

        } else {
            require(['model'], function (model) {
                model.tip('请先填写' + details_obj[details_step], 2000);
            });
        }
    };
    /*
     * 加载look
     * */
    var init_look = function () {
        var config = {
            flashvars: {
                "jsfunc": "uploadCallback",
                "imgUrl": BASE_FILE_URL + nbfy.user.logo,
                "uploadSrc": true,
                "showBrow": true,
                "showCame": true,
                "uploadUrl": URL.LOGO_UPLOAD
            },
            params: {
                menu: "false",
                scale: "noScale",
                allowFullscreen: "true",
                allowScriptAccess: "always",
                wmode: "transparent",
                bgcolor: "#FFFFFF"
            },
            attributes: {
                id: "look_flash"
            }

        };
        //上传回调，必须是window的作用域
        uploadCallback = function (data) {
            var data = JSON.parse(data);
            //如果是上传取消或者上传失败
            if (data == '-1' || data == '-2') {
                //如果是上传成功
            } else if (typeof data === 'object' && data.status == 0) {
                $.ajax({
                    url: URL.SAVE_LOOK,
                    type: 'POST',
                    data: {
                        logo: data.data
                    },
                    success: function (data) {
                        if (data.status == 0) {
                            location.reload();
                        } else {

                        }
                    }
                });
                //如果是调用上传事件
            } else if (data == 2) {
                return 1;
            } else {
            }
        };
        require(['swfobject'], function (swfobject) {
            swfobject.embedSWF(URL.LOGO_SWF, "look_wrap", "800", "400", "9.0.0", "expressInstall.swf", config.flashvars, config.params, config.attributes);
            //注册提交头像的事件
            $('#submit_look').on('click', null, function () {
                swfobject.getObjectById('look_flash').jscall_updateAvatar();
            });
        });
    };
    /*
     *初始化基本资料
     * */
    var init_basic = function () {
        require(['uploadimage'], function (uploadimage) {

            //图片上传
            uploadimage.init({
                id: 'upload_image',
                multi: 2,
            });
        });
        $('#submit_basic').on('click', null, function () {
            require(['model'], function (model) {
                $.ajax({
                    url: URL.SAVE_BASIC,
                    type: 'post',
                    data: $('#basic_form').serialize(),
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 1000, function () {
                                location.reload();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
        });
    };
    /*
     * 初始化详细资料
     * */
    var init_details = function () {
        require(['city', 'tag', 'wdatePicker'], function (city, tag, wdatePicker) {
            //时间插件
            window.WdatePicker = wdatePicker;
            //地区初始化
            city.init();
            //个人标签
            tag.bind({
                id: 'tag_person',
                url: URL.TAGS,
                limit: 6
            });
        });
        $('#submit_details').on('click', null, function () {
            require(['model'], function (model) {
                $.ajax({
                    url: URL.SAVE_DETAIL,
                    type: 'post',
                    data: $('#detail_form').serialize(),
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 1000, function () {
                                location.reload();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
        });
    };
    /*
     * 初始化服务设置
     * */
    var init_service = function () {
        require(['checkbox', 'tag', 'wdatePicker'], function (checkbox, tag, wdatePicker) {
            //时间插件
            window.WdatePicker = wdatePicker;
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
        });
        $('#submit_service').on('click', null, function () {
            var html = [];
            $('#service_form').find('.js-time-input').each(function (i, v) {
                html.push(v.value);
            });
            $('#work_time_hidden').val(html.join(','));
            require(['model'], function (model) {
                $.ajax({
                    url: URL.SAVE_SERVICE,
                    type: 'post',
                    data: $('#service_form').serialize(),
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 1000, function () {
                                location.reload();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
        });
    };
    /*
     * 初始化自定义
     * */
    var init_custom = function () {
        $('#submit_custom').on('click', null, function () {
            // 取得HTML内容
            editor.sync();
            $('#detail_content_hidden').val(editor.html());
            require(['model'], function (model) {
                $.ajax({
                    url: URL.SAVE_CUSTOM,
                    type: 'post',
                    data: $('#custom_form').serialize(),
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            model.tip(data.message, 1000, function () {
                                location.reload();
                            });
                        } else {
                            model.tip(data.message, 2000);
                        }
                    }
                });
            });
        });
    }
});