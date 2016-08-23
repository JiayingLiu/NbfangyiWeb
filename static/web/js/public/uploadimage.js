define(['jquery'], function ($) {
    /*
     * 功能：图片的上传。
     * 作者：崔洪泉
     * 使用：在页面上使用<input type="file" id="upload" data-init="">,js进行绑定即可，配置参数如下，
     *       data-init :[{name:'',url_b:'',url_s:'',url:''},......]；url_s 小图，url_b 大图，url 原图
     * 说明：支持多个文件上传，但不支持多文件同时上传；对于谷歌，火狐，safari, Edge ,ie11 ，ie10高级浏览器支持file api
     *       则进行file api上传，对于低级浏览器ie8 ie9使用 iframe无刷新上传。依赖于 jquery。
     *       未进行数据造成的错误处理。ajax上传返回json，iframe上传返回text/plain(否则浏览器默认打开)
     * */

    //公共参数
    var URL_IMG = BASE_FILE_URL,//图片绝对地址
        COLOR_PROGRESSING = '#ef8200', //进度条进行中颜色
        COLOR_PROGRESSED = 'GREEN',//进度条完成时颜色
        COLOR_PROGRESSERROR = '#F00',//进度条错误时颜色
        AJAX_SUCCESS_STATUS = 0,//成功时状态
        JSON_PARSE_ERROR = 'the string of data-init parsing to JSON is not formatted';//如果出现说明后台返回数据格式不对

    var defaults = {
            id: 'upload',                                                                       //绑定上传事件的dom id,
            url: '/index/common/uploadFile/img',                                                //文件上传的地址，
            multi: 1,                                                                           //是否多文件上传，为>1的数字时多文件，为1时单文件
            fileName: 'file_name',                                                              //后台拿取文件时的key值
            limitType: 'image/gif,image/jpeg,image/jpg,image/png',                              //上传文件的MIME类型
            extData: null,                                                                      //上传文件同时附加的参数
            initUrl: '',                                                                        //ajax初始化数据时需要的地址，与模版data-init，共同存在时首先选择模版初始化，加载较快
            beforeUploadHandler: function () {
                return true;
            },                                                                                  //上传文件之前回调函数
            completeUploadHandler: null,                                                        //完成上传时回调函数
            errorUploadHandler: null                                                            //失败时候的回调函数
        },
        image = {
            //初始化
            init: function (options) {
                //深度拷贝
                var settings = $.extend(true, {}, defaults, options);
                //构造dom对象
                this._createImgDom(settings);
                //绑定事件
                this._bindEvents(settings);
                //初始化数据加载
                this._initData(settings);
            },
            //构建dom
            _createImgDom: function (settings) {
                var id = settings.id,
                    $file = $('#' + id),
                    name = $file.attr('name'),
                    $file_wrap;
                //修改input的上传类型
                $file.attr('accept', settings.limitType);
                //替换input的样式
                $file.attr('class', 'upi-select');
                //更改触发上传input的name
                $file.attr('name', 'image_' + name);
                //生成最高包裹层
                $file.wrap('<div class="upload-image"></div>');
                $file_wrap = $file.parent();
                $file_wrap.wrap('<div class="upload-image-wrap" id="' + id + '_wrap"></div>');
                //向包裹层添加dom元素
                $file_wrap.append('<div class="upi-progress" id="' + id + '_progress"></div>' +//添加进度条
                    '<div class="upi-text">＋</div>' +//按钮上展示的字符
                    '<input type="hidden" name="' + name + '" id="' + id + '_hidden">' +//图片地址拼合字符串
                    '<input type="hidden" name="' + name + '_name" id="' + id + '_name_hidden">');//图片名称拼合字符串
            },
            //绑定事件
            _bindEvents: function (settings) {
                var that = this,
                    id = settings.id,
                    multi = settings.multi,
                    $file = $('#' + id),
                    $wrap = $('#' + id + '_wrap'),
                    name = $file.attr('name');

                //值发生改变，进行上传操作
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    $file.on('change', null, function () {
                        //如果beforeUploadHandler为true，那么进行上传操作
                        settings.beforeUploadHandler.call(this) && that._fileapi_upload.call(that, [this, settings]);
                        this.value = '';
                    });
                } else {
                    var file = document.getElementById(id);
                    file.attachEvent('onchange', function () {
                        settings.beforeUploadHandler.call(this) && that._iframe_upload.call(that, [file, settings]);
                    });
                }

                //修改名称的操作
                $wrap.on('change', '.upi-input', function () {
                    that._setValue(id);
                });

                //删除图片
                $wrap.off('click').on('click', '.upi-del', function () {
                    var $this = $(this);
                    that._multi.call($wrap, ['del', multi]);
                    $this.parent().remove();
                    that._setValue(id);
                });
            },
            _fileapi_upload: function (params) {
                var element = params[0],
                    settings = params[1],
                    id = settings.id,
                    $wrap = $('#' + id + '_wrap'),
                    that = this,
                    file = element.files[0],
                    formData = new FormData();
                //如果file存在，那么将file放入FormData里面
                file && formData.append(settings.fileName, file);
                //如果有附加参数，遍历放入FormData里面
                settings.extData && $.each(settings.extData, function (i, v) {
                    formData.append(i, v);
                });
                //发送ajax
                $.ajax({
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: formData,
                    url: settings.url,
                    type: 'POST',
                    xhr: function () {
                        myXhr = $.ajaxSettings.xhr();
                        //进度条的展示
                        myXhr.upload && myXhr.upload.addEventListener('progress', function (event) {
                            that._progressHandler.call(this, [event, id, settings]);
                        }, false);
                        return myXhr;
                    },
                    //成功的回调
                    success: function (data) {
                        var data_params, pgr_params = {};
                        if (data.status == AJAX_SUCCESS_STATUS) {
                            data_params = data.data;
                            //成功的展示图片
                            that._buildImgItem(id, data_params);
                            that._multi.call($wrap, ['add', settings.multi]);
                            //自定义的处理数据
                            settings.completeUploadHandler && settings.completeUploadHandler.call(this, data);
                        }
                        pgr_params.status = data.status;
                        pgr_params.message = data.message;
                        pgr_params.id = id;
                        that._progressHandler.call(this, pgr_params);
                    },
                    error: settings.errorUploadHandler
                });
            },
            /*
             * 兼容性上传,对于不支持file api的浏览器
             * params [this, settings]
             * */
            _iframe_upload: function (params) {
                var that = this,
                    element = params[0],
                    settings = params[1],
                    pgr_params = {},
                    html = [],
                    iframe,
                    id,
                    dom,
                    form,
                    old_name;
                /*
                 * 以下是整个上传逻辑
                 * */
                //拿取该元素的id
                id = settings.id;
                dom = document;
                //如果不存在
                //构建上传所用的iframe
                html.push('<iframe id="upi_iframe" name="upi_iframe" style="display: none;"></iframe>');
                //构建上传所需要的form表单
                html.push('<form id="upi_iform" method="POST" action="' + settings.url + '" target="upi_iframe" enctype="multipart/form-data">');
                //请求返回数据类型为text/plain
                html.push('<input type="hidden" name="data_type" value="plain">');
                //遍历要传输的参数
                settings.extData && $.each(settings.extData, function (i, v) {
                    html.push('<input type="hidden" name=' + i + ' value="' + v + '">');
                });
                html.push('</form>');
                //添加到dom中
                var temp = dom.createElement('div');
                temp.id = 'upi_iframe_wrap';
                temp.innerHTML = html.join('');
                dom.body.appendChild(temp);
                //获取这个form DOM对象
                form = dom.getElementById('upi_iform');
                //将element 移动到这个新的form中进行提交
                form.appendChild(element);
                //保存旧的名称,并且重新命名它为后台拿取file时所需的key
                old_name = element.getAttribute('name');
                element.setAttribute('name', settings.fileName);
                //提交表单
                form.submit();

                //上传进度展示
                $('#' + id + '_progress').css({
                    'width': '100%',
                    'background-color': COLOR_PROGRESSING
                }).text('上传中');

                //获取这个iframe
                iframe = dom.getElementById('upi_iframe');
                //其回调函数
                iframe.onload = function () {
                    if (iframe.readyState == "complete") {
                        var body = window.frames['upi_iframe'].document.getElementsByTagName('body')[0],
                            data_text = body.innerText,
                            data = data_text ? JSON.parse(data_text) : {status: 1};
                        if (data.status == AJAX_SUCCESS_STATUS) {
                            var data_params = data.data;
                            //成功的展示图片
                            that._buildImgItem(id, data_params);
                            that._multi.call($('#' + id + '_wrap'), ['add', settings.multi]);
                            settings.completeUploadHandler && settings.completeUploadHandler.call(element, data);
                        }
                        pgr_params.status = data.status;
                        pgr_params.message = data.message;
                        pgr_params.id = id;
                        that._progressHandler.call(this, pgr_params);

                        //input file的还原处理
                        element.setAttribute('name', old_name);
                        var progress = dom.getElementById(id + '_progress');
                        //克隆一份新的input file
                        var cloneEle = element.cloneNode(false);

                        //删除上传隐藏域
                        var wrap = dom.getElementById('upi_iframe_wrap');
                        wrap.parentNode.removeChild(wrap);

                        progress.parentNode.appendChild(cloneEle);
                        //清空里面file的内容
                        cloneEle.outerHTML = cloneEle.outerHTML;
                        //重新绑定上传事件
                        dom.getElementById(id).attachEvent('onchange', function () {
                            settings.beforeUploadHandler.call(this) && that._iframe_upload.call(that, [dom.getElementById(id), settings]);
                        });
                    }
                }
            },
            /*
             *  如果params是一个数组，说明是上传中，否则是完成状态
             *  上传中数据格式为[event, id]
             *  完成时数据格式为{status:'',message:'',id:''}
             *  */
            _progressHandler: function (params) {
                var progress,
                    id,
                    message,
                    percent,
                    color;
                if (params instanceof Array) {
                    progress = params[0];
                    id = params[1];
                    percent = message = Math.round((progress.loaded / progress.total) * 100) + '%';
                    color = COLOR_PROGRESSING;
                } else {
                    id = params.id;
                    message = params.message;
                    color = params.status == AJAX_SUCCESS_STATUS ? COLOR_PROGRESSED : COLOR_PROGRESSERROR;
                    percent = '100%';
                }
                $('#' + id + '_progress').css({
                    'width': percent,
                    'background-color': color
                }).text(message);
            },
            /*
             * 调用方法为：that._multi.call($wrap, [ 'add', settings.multi]);
             * 点击按钮调用当前方法，传入 wrap,type类型，可上传数量
             * */
            _multi: function (params) {
                var $file_text = this.find('.upi-text'),
                    type = params[0],
                    multi = params[1],
                    $queue = this.find('.upload-image-item'),
                    len = $queue.length,
                    flag;//如果为true，按钮禁用，为false，按钮可用
                switch (type) {
                    case 'add':
                        flag = multi <= len;//操作完总数会加一个
                        break;
                    case 'del':
                        flag = multi <= len - 1;//操作完总数会少一个
                        break;
                    case 'init':
                        flag = multi <= len;//初始化时
                        break;
                    default :
                        break;
                }
                if (flag) {
                    $file_text.addClass('upload-disabled');
                } else {
                    $file_text.removeClass('upload-disabled');
                }
            },
            /*
             * 构建上传图片的dom加载进document
             * 调用方式为：that._buildImgItem(id,data_params);
             * element是这个file按钮
             * 如果params为数组，则是初始化时候的调用，如果是对象，则是上传成功时候的调用
             * */
            _buildImgItem: function (id, data) {
                var that = this,
                    $wrap = $('#' + id + '_wrap'),
                    html = [];
                if (data instanceof Array) {
                    data.length && $.each(data, function (i, v) {
                        html = that._createItemHtml(html, v);
                    });
                    $wrap.append(html.join(''));
                } else {
                    html = that._createItemHtml(html, data);
                    $wrap.append(html.join(''));
                    //input focus处理
                    $wrap.find('.upi-input').eq(-1).select();
                }
                that._setValue(id);
            },
            /*拼接dom字符串
             *
             * */
            _createItemHtml: function (array, item) {
                var name = item.name,
                    url = item.url,
                    url_b = item['url_b'] ? item['url_b'] : url,
                    url_s = item['url_s'] ? item['url_s'] : url;
                array.push('<div class="upload-image-item" data-src="' + url + '">');
                array.push('<a target="_blank" class="js-image-preview" href="' + URL_IMG + url_b + '">');
                array.push('<img src="' + URL_IMG + url_s + '" height="150" width="150" alt="' + name + '"></a>');
                array.push('<a href="javascript:void(0);" class="upi-del"><i class="iconfont icon-delete"></i></a>');
                array.push('<div class="upi-rename"><span>名称</span>');
                array.push('<input type="text" class="upi-input" value="' + name + '"></div></div>');
                return array;
            },
            /*
             * 初始化数据代码，通过便签data-init加载json字符串（首选）；如果没有，
             * 则进行ajax请求，如果都没有不进行数据初始化
             * */
            _initData: function (settings) {
                var that = this,
                    id = settings.id,
                    $file = $('#' + id),
                    $wrap = $('#' + id + '_wrap'),
                    data_str = $file.attr('data-init'),
                    data;
                if (data_str && data_str != 'undefined') {
                    try {
                        data = JSON.parse(data_str);
                    } catch (e) {
                        console.info(JSON_PARSE_ERROR);
                    }
                    data && that._buildImgItem(id, data);
                    that._multi.call($wrap, ['init', settings.multi]);
                } else {
                    settings.initUrl && $.ajax({
                        url: settings.initUrl,
                        type: 'POST',
                        dataType: 'json',
                        success: function (data) {
                            if (data.status == AJAX_SUCCESS_STATUS) {
                                that._buildImgItem(id, data.data);
                                that._multi.call($wrap, ['init', settings.multi]);
                            }
                        }
                    });
                }
            },
            _setValue: function (id) {
                var $url_hidden = $('#' + id + '_hidden'),      //地址隐藏域
                    $name_hidden = $('#' + id + '_name_hidden'), //名称隐藏域
                    $wrap = $('#' + id + '_wrap'),
                    $items = $wrap.find('.upload-image-item'),
                    url_list = [],
                    name_list = [];
                $items.each(function () {
                    var $this = $(this),
                        url = $this.attr('data-src'),
                        name = $this.find('.upi-input').val();
                    url_list.push(url);
                    name_list.push(name);
                });
                $url_hidden.val(url_list.join(','));
                $name_hidden.val(name_list.join(','));
            }
        };
    return {
        init: function (options) {
            image.init(options);
        }
    }
});