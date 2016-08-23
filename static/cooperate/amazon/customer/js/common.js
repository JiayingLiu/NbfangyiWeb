/**
 * 工具类
 * Created by cuihongquan on 2015/11/17.
 * 依赖jquery.js
 */
var CommonUtils = {
    //检测浏览器
    browserCheck: function () {
        var browser = {}, userAgent = navigator.userAgent.toLowerCase(), browserInfo;//是否符合IM登录条件
        (browserInfo = userAgent.match(/msie ([\d.]+)/)) ? browser.ie = browserInfo[1] : (browserInfo = userAgent.match(/firefox\/([\d.]+)/)) ? browser.firefox = browserInfo[1] : (browserInfo = userAgent.match(/chrome\/([\d.]+)/)) ? browser.chrome = browserInfo[1] : (browserInfo = userAgent.match(/opera.([\d.]+)/)) ? browser.opera = browserInfo[1] : (browserInfo = userAgent.match(/version\/([\d.]+).*safari/)) ? browser.safari = browserInfo[1] : 0;
        return browser;
    },
    //上传
    upload: function (opts) {
        var that = this,
            type = {
                h5Upload: function (opts) {
                    var h5Upload_this = this;
                    $('#upload').on('change', function () {
                        var limitSize = opts.limitSize,
                            limitType = opts.limitType,
                            url = opts.url,
                            size,
                            type,
                            formData,
                            file;
                        file = this.files[0];
                        if (file) {
                            size = file.size;
                            type = file.type;
                            formData = new FormData();
                            formData.append('order_file', file);
                            formData.append('data_type', 'json');
                            //文件类型,h5支持前端的格式过滤。
                            if (type && limitType.match(type)) {
                            } else {
                                that.model('show', {
                                    html: '文件格式不正确',
                                    type: 'tip'
                                });
                                return
                            }
                            //大小小于100M
                            if (size > limitSize) {
                                that.model('show', {
                                    html: '文件大小超过' + limitSize / (1024 * 1024) + 'M',
                                    type: 'tip'
                                });
                                return;
                            }
                            opts.beforeUploadHandler.call(h5Upload_this, null) && $.ajax({
                                url: url,
                                type: 'POST',
                                xhr: function () {
                                    myXhr = $.ajaxSettings.xhr();
                                    if (myXhr.upload) {
                                        myXhr.upload.addEventListener('progress', opts.progressUploadHandler, false);
                                    }
                                    return myXhr;
                                },
                                beforeSend: opts.beforeSendHandler,
                                success: opts.completeUploadHandler,
                                error: opts.errorUploadHandler,
                                data: formData,
                                cache: false,
                                contentType: false,
                                processData: false
                            });
                        }
                    });
                },
                frameUpload: function (opts) {
                    var frameUpload_this = this;
                    $('<iframe>', {
                        'id': 'uploadFrame',
                        'name': 'uploadFrame',
                        'style': 'display:none'
                    }).appendTo($('body'));
                    $('#orderForm').attr({
                        'action': opts.url,
                        'method': 'POST',
                        'target': 'uploadFrame',
                        'enctype': 'multipart/form-data'
                    }).append('<input type="hidden" name="data_type" value="plain">');
                    $('#upload').on('change', function () {
                        var name = $(this).val(),
                            type = name.split('.')[1];
                        if (type && type != 'doc' && opts.limitSuffix.match(type)) {
                            opts.beforeIframeUploadHandler.call(frameUpload_this, null) && $('#orderForm').submit()
                        } else {
                            that.model('show', {
                                html: '文件格式不正确',
                                type: 'tip'
                            });
                        }
                    });
                    var iframe = document.getElementById('uploadFrame');
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            var body = window.frames['uploadFrame'].document.getElementsByTagName('body')[0],
                                text = body.innerText,
                                json = text ? JSON.parse(text) : '';
                            json && opts.completeIframeUploadHandler.call(frameUpload_this, json);
                        }
                    }
                }
            };
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            type.h5Upload(opts);
        } else {
            type.frameUpload(opts);
        }
    },
    //模态框
    model: function () {
        var methods = {
            init: function () {
                var that = this,
                    doc = document,
                    body = doc.getElementsByTagName('body')[0],
                    tags = body.getElementsByTagName('*'),
                    len = tags.length,
                    models = [],
                    tips = [];
                for (var i = 0; i < len; i++) {
                    var temp = tags[i],
                        type = temp.getAttribute('data-model');
                    type == 'model' && models.push(temp);
                    type == 'tip' && tips.push(temp);
                }
                $(tips).on('click', null, function () {
                    var text = $(this).attr('data-msg');
                    that.show({
                        html: text,
                        type: 'tip'
                    });
                });
                $(models).on('click', null, function () {
                    var text = $(this).attr('data-msg');
                    that.show({
                        html: text,
                        type: 'model'
                    });
                });
                $('#model').on('click', '.model-cancel,.model-close', function () {
                    $('#model,#mask').hide();
                });
            },
            show: function (opts) {
                //默认的参数
                var defaluts = {
                        id:'',
                        html: '',
                        type: 'model',//model,tip,window
                        width: 400,
                        time: 1000,
                        btnok:'',
                        btncancel:'',
                        title:''
                    },
                    settings = $.extend(defaluts, opts);
                var $model = $('#model'),
                    $footer = $model.find('.model-footer'),
                    $close = $model.find('.model-close'),
                    html = settings.html,
                    type = settings.type,
                    time = settings.time,
                    width = settings.width,
                    btnok = settings.btnok,
                    btncancel = settings.btncancel,
                    title = settings.title,
                    height;
                html && $model.find('.model-content').html(html);
                btnok && $model.find('.model-ok').html(btnok);
                btncancel && $model.find('.model-cancel').html(btncancel);
                title && $model.find('.model-title').html(title);
                height = $model.height();
                if (type == 'tip') {
                    $footer.hide();
                    $close.hide();
                    $('#model,#mask').show();
                    setTimeout(function () {
                        $('#model,#mask').hide();
                    }, time);
                } else if (type == 'model') {
                    $footer.show();
                    $close.show();
                    $('#model,#mask').show();
                } else {
                    $footer.hide();
                    $close.show();
                    $('#model,#mask').show();
                }
                $model.css({
                    'margin-top': '-' + (height / 2 ) + 'px',
                    'width': width,
                    'margin-left': '-' + (width / 2) + 'px'
                });
            },
            close: function () {
                $('#model,#mask').hide();
            },
            changeContent: function (html) {
                $('#model').find('.model-content').html(html);
            },
            changeTitle: function (html) {
                $('#model').find('.model-title').html(html);
            }
        }, method = arguments[0];
        if (methods[method]) {
            arguments = Array.prototype.slice.call(arguments, 1);
            return methods[method].apply(this, arguments);
        } else {
            return methods.init();
        }
    },
    validate: function () {
        var type = arguments[0], flag;
        if (typeof type === 'string') {
            switch (type) {
                case 'telephone':
                    var param = arguments[1];
                    flag = ($.trim(param) && /^[1][3587][0-9]{9}$/g.test(param));
                    break;
                case 'require':
                    var param = arguments[1];
                    flag = ($.trim(param) && $.trim(param).length);
                    break;
                case 'password':
                    var param = arguments[1];
                    flag = ($.trim(param) && /^[a-z0-9]{8,16}$/i.test(param));
                    break;
                case 'number':
                    var param = arguments[1];
                    flag = ($.trim(param) && /^[0-9]*$/.test(param));
                    break;
                default :
                    break;
            }
            return flag;
        }
    },
    pagination : function(config) {
        //数据转换
        offset = config.offset - 0;
        total = config.total - 0;
        limit = config.limit - 0;
        url = config.url;
        //前页码为偏移量除以一页的数据
        var cur = offset / limit;
        //计算按钮数量
        var btns = Math.ceil(total / limit);

        var html = [];

        for (var i = 0; i < btns; i++) {
            html.push('<a href="javascript:;" class="pagination-item" data-index="' + i + '">' + (i + 1) + '</a>');
        }
        html.push('<span>共' + total + '条</span>');
        $('#pagination').empty().append(html.join('')).find('.pagination-item:eq(' + cur + ')').addClass('pagination-cur');

        if (cur <= 3) {
            $('#pagination').find('.pagination-item:gt(6)').hide();
        } else if (cur > 3 && btns - cur > 4) {
            $('#pagination').find('.pagination-item:lt(' + (cur - 3) + ')').hide();
            $('#pagination').find('.pagination-item:gt(' + (cur + 3) + ')').hide();
        } else if (btns - cur >= 1) {
            $('#pagination').find('.pagination-item:lt(' + (-7) + ')').hide();
        } else {
        }
        $('#pagination').on('click', '.pagination-item', function () {
            var index = $(this).attr('data-index') - 0;
            offset = index * limit;
            window.location.href = url + '&offset=' + offset;
        });
    }
};
