/**
 * Created by cuihongquan on 2015/12/10.
 */
/**
 * 工具类
 * Created by cuihongquan on 2015/11/17.
 * 依赖jquery.js
 */
$(function () {
    //构建tip
    var modelHtml = ['<div class="modal" id="tip"><div class="modal-dialog modal-sm">'];
    modelHtml.push('<div class="modal-content"><div class="modal-header">');
    modelHtml.push('<h4 class="modal-title">提示</h4>');
    modelHtml.push('</div><div class="modal-body"></div></div></div></div>');
    //构建confirm
    modelHtml.push('<div class="modal" id="confirm" ><div class="modal-dialog modal-sm"><div class="modal-content">');
    modelHtml.push('<div class="modal-header"><h4 class="modal-title">提示</h4></div><div class="modal-body">');
    modelHtml.push('</div><div class="modal-footer"><button type="button" class="btn btn-default">取消</button>');
    modelHtml.push('<button type="button" class="btn btn-primary">确定</button></div></div></div></div>');
    var doc = document,
        fragment = doc.createDocumentFragment(),
        con = doc.createElement('div');
    con.innerHTML = modelHtml.join('');
    fragment.appendChild(con.firstChild);
    fragment.appendChild(con.lastChild);
    doc.body.appendChild(fragment);
});
CommonUtils = {
    //检测浏览器
    browserCheck: function () {
        var browser = {}, userAgent = navigator.userAgent.toLowerCase(), browserInfo;
        (browserInfo = userAgent.match(/msie ([\d.]+)/)) ? browser.ie = browserInfo[1] : (browserInfo = userAgent.match(/firefox\/([\d.]+)/)) ? browser.firefox = browserInfo[1] : (browserInfo = userAgent.match(/chrome\/([\d.]+)/)) ? browser.chrome = browserInfo[1] : (browserInfo = userAgent.match(/opera.([\d.]+)/)) ? browser.opera = browserInfo[1] : (browserInfo = userAgent.match(/version\/([\d.]+).*safari/)) ? browser.safari = browserInfo[1] : 0;
        return browser;
    },
    //上传
    upload: function (method) {
        var that = this,
            defaults = {
                id: '',//绑定上传事件的dom id,
                url: '',//文件上传的地址，
                fileName: 'order_file',//后台拿取问件时的key值
                limitSize: 1024,//上传文件的大小
                limitType: '',//上传文件的MIME类型
                limitSuffix: '',//上传文件的后缀名称
                extData: null,//上传文件同时附加的参数
                beforeUploadHandler: function () {
                    return true;
                },//上传文件之前回调函数
                progressUploadHandler: null,//进度回调函数h5有效
                beforeSendHandler: null,//文件发送之前回调函数
                completeUploadHandler: function () {
                },//完成上传时回调函数
                errorUploadHandler: null//失败时候的回调函数
            };
        methods = {
            init: function (opts) {
                var settings = $.extend(true, {}, defaults, opts);
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    methods.h5Upload(settings);
                } else {
                    methods.frameUpload(settings);
                }
            },
            h5Upload: function (settings) {
                var $upload = $('#' + settings.id),
                    $queue = $('<div>',{
                        class : 'upload-queue'
                    });
                $upload.after($queue);
                //构建file input的accept属性
                $upload.attr('accept', settings.limitType);
                $upload.off().on('change', function () {
                    var url = settings.url,
                        formData,
                        file;
                    file = this.files[0];
                    if (file) {
                        formData = new FormData();
                        formData.append(settings.fileName, file);
                        settings.extData && $.each(settings.extData, function (i, v) {
                            formData.append(i, v);
                        });
                        var html = ['<div class="alert" role="alert"><a class="link pull-left">' + file.name + '</a>'];
                        html.push('<button type="button"><span aria-hidden="true">&times;</span></button>');
                        html.push('<div class="col-md-8"><div class="progress">');
                        html.push('<div class="progress-bar progress-bar-info progress-bar-striped active"');
                        html.push('role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"');
                        html.push(' style="width: 0" data-id="' + file.lastModified + '">0%</div></div></div></div>');
                        $queue.append(html.join(''));
                        settings.beforeUploadHandler.call(this, file) && $.ajax({
                            url: url,
                            type: 'POST',
                            xhr: function () {
                                myXhr = $.ajaxSettings.xhr();
                                if (myXhr.upload) {
                                    myXhr.upload.addEventListener('progress', function (e) {
                                        var per = e.loaded / e.total,
                                        perText = (per * 100 + '').split('.')[0] + '%';
                                        $queue.find('.progress-bar[data-id='+file.lastModified+']').css('width',perText).text(perText);
                                    }, false);
                                }
                                return myXhr;
                            },
                            beforeSend:null,
                            success: settings.completeUploadHandler,
                            error: settings.errorUploadHandler,
                            data: formData,
                            cache: false,
                            contentType: false,
                            processData: false
                        });
                    }
                });
            },
            frameUpload: function (settings) {
                var id = settings.id,
                    that = document.getElementById(id),
                    $upload = $('#' + id),
                    $form,
                    extHtml = [];

                //构建iframe
                $('<iframe>', {
                    'id': id + '_uploadFrame',
                    'name': id + '_uploadFrame',
                    'style': 'display:none'
                }).appendTo($('body'));
                //构建form表单
                $form = $upload.closest('form').attr({
                    'action': settings.url,
                    'method': 'POST',
                    'target': id + '_uploadFrame',
                    'enctype': 'multipart/form-data'
                });
                settings.extData && $.each(settings.extData, function (i, v) {
                    extHtml.push('<input type="hidden" name=' + i + ' value="' + v + '">');
                });
                $form.append(extHtml.join(''));
                $upload.off().on('change', function () {
                    var name = $(this).val(),
                        type = name.split('.')[1];
                    if (type && type != 'doc' && settings.limitSuffix.match(type)) {
                        settings.beforeUploadHandler.call(this, null) && $form.submit();
                    } else {
                        that.tips('文件格式不正确', 2000, false);
                    }
                });
                var iframe = document.getElementById(id + '_uploadFrame');
                iframe.onreadystatechange = function () {
                    if (iframe.readyState == "complete") {
                        var body = window.frames[id + '_uploadFrame'].document.getElementsByTagName('body')[0],
                            text = body.innerText,
                            json = text ? JSON.parse(text) : '';
                        json && settings.completeUploadHandler.call(that, json);
                    }
                }
            }
        };
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('方法-' + method + '不存在');
        }

    },
    //提示框
    tips: function (message, time, refresh) {
        $('#tip').find('.modal-body').html('<p>' + message + '</p>');
        $('#tip').show();
        setTimeout(function () {
            $('#tip').hide();
            refresh && window.location.reload();
        }, time);
    },
    //确认框
    confirm: function (message, agreeHandle, disagreeHandle) {
        $('#confirm').find('.modal-body').html('<p>' + message + '</p>');
        $('#confirm').show();
        $('#confirm').off().on('click', '.btn', function () {
            var $this = $(this);
            if ($this.hasClass('btn-primary')) {
                agreeHandle && agreeHandle.apply(this, null);
            } else {
                disagreeHandle && disagreeHandle.apply(this, null);
            }
            $('#confirm').hide();
        });
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
                case 'email':
                    var param = arguments[1];
                    flag = ($.trim(param) && /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(param));
                    break;
                case 'card':
                    var param = arguments[1];
                    flag = ($.trim(param) && /^(\d{15}|\d{17}[\dx])$/i.test(param));
                    break;
                default :
                    break;
            }
            return flag;
        }
    },
    pagination: function (config) {
        //数据转换
        var offset = config.offset - 0,
            total = config.total - 0,
            limit = config.limit - 0,
            url = config.url,
            length = config.length;
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
        $('#pagination').empty().append(html.join('')).after('<p class="text-center"><input style="width: 40px;" type="number" id="pagination_page"><span>/' + btns + '页</span>,<span>共' + total + '条</span></p>');
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
            window.location.href = url + '&offset=' + offset;
        });
        $('#pagination_page').on('change', function () {
            var value = $(this).val() - 0;
            value = value < btns ? value : btns;
            offset = (value - 1) * limit;
            window.location.href = url + '&offset=' + offset;
        });
    }
};

