/**
 * Created by cuihongquan on 16/4/6.
 */
define(['jquery', 'easemob', 'uploadfile'], function ($, Easemob, uploadfile) {
    /*
     * im 静态常量
     * */

    var IM_BOX_MAX = 0,//im容器最大化
        IM_BOX_MID = 1,//im容器中间大小
        IM_BOX_MIN = 2,//im容器最小化
        IM_BOX_HISTORY = 1,//im容器尺寸上次的操作,初始化为mid大小
        INTERVAL_CVS_TIME = 60 * 1000,//会话时间线时间间隔1分钟,单位毫秒
        STORAGE_TIME = 30 * 24 * 60 * 60,//本地缓存30天
        JS_TRIGGER_IM = '.js-im-trigger',//触发im聊天的按钮js表示样式
        AJAX_SUCCESS_STATUS = 0, //ajax成功的状态码
        FILE_URL = BASE_FILE_URL,//图片的服务器地址
        CSS_URL = BASE_CSS_URL,//样式的服务器地址
        MESSAGE_TIP_TITLE = ['新消息', '　　　'],//标题新消息提示，数组俩个值进行闪烁
        ROSTER_EMPTY_HTML = '<p class="text-center">没有任何好友</p>',//好友列表为空时的展示
        URL = {
            GET_CHAT_INFO: '/usercore/api/chat/getUserListInfo',//拿取好友的头像，名称信息
            DEFAULT_IMG_URL: CSS_URL + 'web/plugin/im/image/custom_ser.jpg',//联系人默认的头像地址
            AUTO_REG: '/usercore/api/chat/autoRegImUser',//im自动注册接口，服务器端请求im服务器
            ADD_FRIEND: '/usercore/api/chat/addFriend'//添加好友 服务器端请求im服务器
        },
        FILE_TYPE_FLAG = 'c631da6d1c0f3568916a54d6f453cb863b47cb74',//根据这个sha1 hash值来判断是不是文件信息
        CUSTOM_SERVICE = {
            id: 'robinlee',
            name: '在线客服',
            logo: URL.DEFAULT_IMG_URL
        };//设置服务人员名称
    //针对于图片的滚动
    nbfy.imHistoryScroll = function () {
        $(this).parents('.js-history').scrollTop($(this).closest('.js-chat-user').outerHeight());
    };

    /*
     * Easemob全局对象
     * */
    window.Easemob = Easemob;
    window.Easemob.im.config = {
        xmppURL: 'im-api.easemob.com',//The global value set for xmpp server
        apiURL: 'https://a1.easemob.com',//聊天服务器的地址
        appkey: "nbfy#nbfyunbounded",//appkey
        https: true,//是否使用https
        multiResources: false//同时登陆数量
    };
    /*
     * dom jquery 对象
     * */

    var $title = $('title'),//当前页面的title
        $pub_im = $('#pub_im'),//im box 容器
        $im_header = $pub_im.find('.js-header'),//im header 容器
        $im_title = $im_header.find('.js-title'),//im title 信息
        $im_roster = $pub_im.find('.js-roster'),//im 联系人聊天 容器
        $cur_user_name = $pub_im.find('.js-cur-name'),//im 登陆者聊天者面板nickname
        $cur_user_logo = $pub_im.find('.js-cur-logo'),//im 登陆者聊天者面板头像
        $im_setting = $pub_im.find('.js-setting'),//设置面板
        $im_start_label = $im_setting.find('.js-start-label'),//当前联系人的数量
        $contact_info = $pub_im.find('.js-contact-info'),//当前聊天者的面板信息
        $im_history = $pub_im.find('.js-history'),//聊天历史消息框
        $im_textarea = $pub_im.find('.js-im-input'),//聊天输入框
        $im_emotion = $pub_im.find('.js-emotion'),//表情框
        $im_custom_ser = $pub_im.find('.js-custom-ser'),//客服人员
        $im_image_box = $pub_im.find('.js-image'),//发送图片的box
        $im_file_box = $pub_im.find('.js-file'),//发送文件的box
        $im_send_image = $('#im_upload_image'),//发送图片的dom
    //$im_send_file = $('#im_upload_file'),//发送文件的dom
        $cur_chat_history;//当前聊天者的区域

    /*
     * 全局变量
     * */
    var cur_user = {},//当前登陆者
        chat_user = {},//当前聊天者
        conn,//im 连接对象
        all_rosters = [],//好友数组
        all_rosters_ids = [], //好友id数组
        last_cvs_time,//上次会话时间戳
        message_tip_timer,//消息闪烁定时器
        document_title = $title.text();//当前页面的title的文本，消息闪烁会替换它

    /*
     * im 对象
     * */

    var im = {
        /*
         * im初始化
         * */
        init: function (user) {
            //初始化当前登陆者的信息
            cur_user.id = user['imname'];
            cur_user.pwd = user['impwd'];
            cur_user.name = user['nickname'];
            cur_user.logo = user['logo'];
            cur_user.url = user['url'];
            this.initLoginInfo(cur_user);
            //初始化主方法
            _easemob.init();
            //检验当前的用户是否有im账号
            this.autoLogin();
            //绑定事件
            this.bindEvents();
            //初始化客服
            common.initCustomService();
            //初始化聊天窗口为最小化
            common.setBoxSize(IM_BOX_MIN);
        },
        /*
         * 初始化当前登陆者的信息
         * */
        initLoginInfo: function (user) {
            //设置登录者nickname
            $cur_user_name.text(user.name);
            //设置登录者look
            $cur_user_logo.attr('src', FILE_URL + user.logo);
        },
        /*
         * 自动化登录方法
         * 服务器端操作:检验当前的用户是否有im账号，如果没有服务器端进行注册，然后在进行登录操作
         * 主要是减少js请求的次数，如果在im服务器有这个用户，那么进行登录，如果没有这个用户，在服务
         * 器端进行im用户的注册，理论上是完全返回true的。
         * */
        autoLogin: function () {
            //登录方法
            var suc = function () {
                var params = {
                    name: cur_user.id,
                    pwd: cur_user.pwd
                };
                _easemob.login(params);

            };
            common.ajax(URL.AUTO_REG, suc);
        },
        /*
         * 添加好友的方法
         * 服务器端操作：在服务器端首先判断当前要加为好友的这个用户是否注册过，如果没有那么首先进行
         * 注册操作，然后在进行两者的添加好友的操作
         * */
        addFriend: function (uid) {
            var suc = function (data) {
                if (data.status == AJAX_SUCCESS_STATUS) {
                    //成功之后不做处理
                } else {
                    //设置提示
                    $im_start_label.text(data.message);
                }
            };
            //如果当前的好友id数组里面没有这个好友才进行添加
            if (all_rosters_ids.indexOf(uid) == -1) {
                //设置提示
                $im_start_label.text('正在建立好友关系...');
                common.ajax(URL.ADD_FRIEND, suc, 'POST', {'tuid': uid});
            } else {
                common.setCurChat();
            }
        },
        /*
         * 事件的绑定
         *
         * */
        bindEvents: function () {
            var that = this;
            //绑定页面触发im聊天的按钮
            $('body').on('click', JS_TRIGGER_IM, function () {
                var $this = $(this);
                //设置此人为当前联系人
                chat_user = {
                    id: $this.attr('data-chat-id'),
                    name: $this.attr('data-chat-name'),
                    logo: $this.attr('data-chat-logo')
                };
                that.addFriend(chat_user.id);
            });
            //发送图片事件
            $im_send_image.on('change', function () {
                common.sendImgHandler();
            });
            //发送文件的方法初始化
            common.sendFileEvent();
            //检测回车进行信息的发送
            $im_textarea.keydown(function (event) {
                if (event.altKey && event.keyCode == 13) {
                    var e = $(this).val();
                    $(this).val(e + '\n');
                } else if (event.ctrlKey && event.keyCode == 13) {
                    event.returnValue = false;
                    _easemob.sendText();
                    return false;
                } else if (event.keyCode == 13) {
                    event.returnValue = false;
                    _easemob.sendText();
                    return false;
                } else {
                }
            });
            //主容器绑定事件
            $pub_im.on('click', '.js-cli', function () {
                var $this = $(this),
                    cli_ele = $this.attr('data-cli-ele');
                switch (cli_ele) {
                    //设置box为最小化
                    case 'arrow' :
                        common.headerArrowClick();
                        break;
                    //打开im box
                    case 'open_box' :
                        common.openImBoxClick();
                        break;
                    //设置当前聊天者
                    case 'chat_to':
                        //设置当前聊天者信息
                        chat_user = {
                            id: $this.attr('data-chat-id'),
                            name: $this.attr('data-chat-name'),
                            logo: $this.find('img').attr('src')
                        };
                        common.setCurChat();
                        break;
                    //发送信息
                    case 'send_msg':
                        _easemob.sendText();
                        break;
                    //打开表情框
                    case 'open-emotion':
                        common.openEmotion(_easemob.getEmotion());
                        break;
                    //选择表情
                    case 'select-emotion':
                        common.selectEmotion($this);
                        break;
                    //点击设置按钮
                    case 'setting':
                        common.toggleDelBtn();
                        break;
                    //删除好友
                    case 'ci-del':
                        var uid = $this.parent().attr('data-chat-id');
                        common.delFriend(uid);
                        return false;
                        break;
                    //发送图片
                    case 'open-send-img':
                        common.toggleSendImg();
                        break;
                    //发送文件
                    case 'open-send-file':
                        common.toggleSendFile();
                        break;
                    default :
                        break;
                }
            });
            //去除消息提示的事件，点击的时候去除提示效果
            $pub_im.on('click', '.im-message-tip', function () {
                $(this).removeClass('im-message-tip');
            });
        }
    };
    /*
     *
     * 公共方法
     *
     * */
    var common = {
        /*
         *
         * ajax 封装
         * */
        ajax: function (url, success, type, data) {
            $.ajax({
                url: url || '',
                data: data || null,
                type: type || 'GET',
                dataType: 'json',
                success: success
            });
        },
        /*
         * 显示删除按钮,因为roster里面是动态数据，所以只能每次都遍历一遍
         * */
        toggleDelBtn: function () {
            $im_roster.find('.js-del').toggle();
        },
        /*
         * 初始化客服人员
         * */
        initCustomService: function () {
            //修改面板信息
            $im_custom_ser.addClass('js-ci-' + CUSTOM_SERVICE.id);
            $im_custom_ser.attr({
                'data-chat-id': CUSTOM_SERVICE.id,
                'data-chat-name': CUSTOM_SERVICE.name
            });
            $im_custom_ser.find('img').attr('src', CUSTOM_SERVICE.logo);
            $im_custom_ser.find('span').text(CUSTOM_SERVICE.name);
        },
        /*
         * 打开图片发送的方法
         * */
        toggleSendImg: function () {
            $im_image_box.toggle();
            $im_file_box.hide();

        },
        /*
         * 打开文件发送的方法
         * */
        toggleSendFile: function () {
            $im_file_box.toggle();
            $im_image_box.hide();
        },
        /*
         * 发送文件的回调函数
         * */
        sendFileEvent: function () {
            var that = this;
            uploadfile.init({
                id: 'im_upload_file',
                completeUploadHandler: function (data) {
                    if (data.status == AJAX_SUCCESS_STATUS) {
                        var data_obj = data.data;
                        var file = {
                            filename: data_obj.name,
                            data: data_obj.url,
                            size: data_obj.size,
                            type: 'file',
                            'sha1': FILE_TYPE_FLAG
                        };
                        _easemob.sendFile(JSON.stringify(file));
                        uploadfile.clear();
                        that.toggleSendFile();
                    } else {
                        $im_file_box.find('.js-file-info').text(data.message);
                    }
                }
            });
        },
        /*
         * 发送图片的回调函数
         * */
        sendImgHandler: function () {
            var that = this;
            //fileInputId：文件选择输入框的Id，sdk自动根据id自动获取文件对象（含图片，或者其他类型文件）
            var fileObj = Easemob.im.Helper.getFileUrl('im_upload_image');
            if (fileObj.url == null || fileObj.url == '') {
                $im_send_image.next('span').text('请选择发送图片');
                return;
            }
            var filetype = fileObj.filetype;
            if (filetype in  {
                    "jpg": true,
                    "gif": true,
                    "png": true,
                    "bmp": true
                }) {
                var opt = {
                    fileInputId: 'im_upload_image',
                    to: chat_user.id,
                    onFileUploadError: function (error) {

                    },
                    onFileUploadComplete: function (data) {
                        $im_send_image.next('span').text('');
                        //成功之后关闭窗口
                        that.toggleSendImg();
                        //封装返回信息
                        var img = {
                            'data': data.uri + '/' + data.entities[0].uuid,
                            'type': 'img'
                        };
                        that.appendMsg(cur_user.id, img);
                    }
                };
                //发送中
                $im_send_image.next('span').text('发送中...');
                _easemob.sendPic(opt);
                return;
            } else {
                $im_send_image.next('span').text('图片格式只能为jpg,gif,png,bmp');
            }
        },
        /*
         * 显示或者隐藏im,参数
         * */
        setBoxSize: function (type) {
            switch (type) {
                case IM_BOX_MAX :
                    IM_BOX_HISTORY = IM_BOX_MAX;
                    $pub_im.removeClass('im-box-mid').removeClass('im-box-min').addClass('im-box-max');
                    break;
                case IM_BOX_MID :
                    IM_BOX_HISTORY = IM_BOX_MID;
                    $pub_im.removeClass('im-box-max').removeClass('im-box-min').addClass('im-box-mid');
                    break;
                case IM_BOX_MIN :
                    $pub_im.removeClass('im-box-max').removeClass('im-box-mid').addClass('im-box-min');
                    break;
                default :
                    break;
            }
        },
        /*
         * 标题头部的按钮
         * */
        headerArrowClick: function () {
            this.setBoxSize(IM_BOX_MIN);
        },
        /*
         * im box 形态的记录
         * */
        openImBoxClick: function () {
            this.setBoxSize(IM_BOX_HISTORY);
        },
        /*
         * 打开emotion头像框
         * */
        openEmotion: function (emotion) {
            var path = emotion.path,
                map = emotion.map,
                html = [];
            $.each(map, function (i, v) {
                html.push('<img class="emotion-item js-cli" data-cli-ele="select-emotion" data-value="' +
                    i + '" src="' + path + v + '">');
            });

            $im_emotion.find('img').length || $im_emotion.append(html.join(''));

            $im_emotion.toggleClass('emotion-box-open');
        },
        /*
         * 选择表情的事件回调
         */
        selectEmotion: function ($this) {
            var value = $this.attr('data-value'),
                textarea_value = $im_textarea.val();
            $im_textarea.val(textarea_value + value);
            $im_emotion.toggleClass('emotion-box-open');
        },
        /*
         * 过滤发送的信息
         * */
        textFilter: function () {
            var value = $im_textarea.val();
            value = $.trim(value);
            return value ? value : 0;
        },
        /*
         * 发送完消息之后textarea的处理
         * */
        textareaClear: function () {
            //清空textarea
            $im_textarea.val('');
            //设为选中状态
            $im_textarea.select();
        },
        /*
         * 接收消息的回调函数
         * */
        textMsgHandler: function (message) {
            var from = message.from;
            this.appendMsg(from, message.data);
            this.messageTip(from);
        },
        /*
         * 接收图片的回调函数
         * */
        imageMsgHandler: function (message) {
            var from = message.from;
            //封装数据
            var img = {
                'data': message.url,
                'type': 'img'
            };
            this.appendMsg(from, img);
            this.messageTip(from);
        },
        /*
         * 接收文件的回调函数
         * */
        fileMsgHandler: function (message) {
            var from = message.from;
            //封装数据
            var img = {
                'data': message.url,
                'type': 'file',
                'filename': message.filename
            };
            this.appendMsg(from, img);
            this.messageTip(from);
        },
        /*
         * 接收表情的回调函数
         * */
        emotionMsgHandler: function (message) {
            var from = message.from;
            this.appendMsg(from, message.data);
            this.messageTip(from);
        },
        /*
         * 消息提示方法
         * */
        messageTip: function (form) {
            //如果im box是最小化
            if ($pub_im.hasClass('im-box-min')) {
                $im_setting.addClass('im-message-tip');
            }

            $pub_im.find('.js-ci-' + form).addClass('im-message-tip');

            //首先清除定时器
            clearTimeout(message_tip_timer);
            //标题的变化
            var $dom_title = $('title'),
                times = 0;
            message_tip_timer = setTimeout(function () {
                if (times % 2 == 0) {
                    $dom_title.text('[' + MESSAGE_TIP_TITLE[0] + ']' + document_title);
                } else {
                    $dom_title.text('[' + MESSAGE_TIP_TITLE[1] + ']' + document_title);
                }
                if (times > 4) {
                    clearTimeout(message_tip_timer);
                    $dom_title.text(document_title);
                } else {
                    message_tip_timer = setTimeout(arguments.callee, 500);
                    times++;
                }
            }, 500);
        },
        /*
         * 构建聊天文本内容html片段
         * */
        createMsgHtml: function (from, msg) {
            /*
             * 如果from是自己当前的用户，则说明当前是自己在编辑的信息回显，那么把from设置长当前的chat_user
             * */
            //class的名称是from-msg,还是to-msg
            var class_name,
                result = [], //声明一个拼接字符串的数组
                msg_obj,
                msg_obj_body;
            //判断消息来源
            if (from == cur_user.id) {
                class_name = 'from-msg';
                from = chat_user.id;
            } else {
                class_name = 'to-msg';
            }

            //如果是字符串的时候
            if (typeof msg === 'string') {
                if (msg.match(FILE_TYPE_FLAG)) {
                    msg_obj_body = [JSON.parse(msg)];
                } else {
                    msg_obj = Easemob.im.Helper.parseTextMessage(msg);
                    msg_obj_body = msg_obj.body;
                }
            } else if (msg instanceof Array) {
                msg_obj_body = msg;
            } else if (msg instanceof Object) {
                msg_obj_body = [msg];
            } else {

            }
            //构建消息html片段
            result.push('<div class="' + class_name + '"><div class="text">');

            for (var i = 0; i < msg_obj_body.length; i++) {
                //如果是文本
                if (msg_obj_body[i].type === 'txt') {

                    result.push(msg_obj_body[i].data);
                    //如果是表情
                } else if (msg_obj_body[i].type === 'emotion') {
                    result.push('<img class="em-emotion" src="' + msg_obj_body[i].data + '" alt="表情" height="32">');
                } else if (msg_obj_body[i].type === 'img') {
                    result.push('<a href="' + msg_obj_body[i].data + '" target="_blank">' +
                        '<img class="js-monitor-load" src="' + msg_obj_body[i].data + '" alt="图片" width="100%" ' +
                        'onload="nbfy.imHistoryScroll.call(this);"></a>');
                } else if (msg_obj_body[i].type === 'file') {
                    result.push('<a href="' + FILE_URL + msg_obj_body[i].data + '" class="link" target="_blank">' +
                        '<i class="iconfont icon-files"></i>' + msg_obj_body[i]['filename'] + '</a>')
                } else {

                }
            }
            result.push('</div><div class="arrow"></div></div>');
            //构建消息html片段结束
            return {
                html: result,
                from: from
            };
        },
        /*
         * 向history添加条件内容,html_arr消息html片段 数组 ，from 来源于谁的信息
         *
         * */
        appendMsg: function (from, msg) {
            var that = this,
                msgObj = that.createMsgHtml(from, msg),
                html_arr = msgObj['html'],
                cur_time = new Date().getTime(),
                result_html;
            from = msgObj['from'];

            //判断是否添加时间线
            if (!last_cvs_time || (cur_time - last_cvs_time > INTERVAL_CVS_TIME)) {
                html_arr.unshift('<div class="time">' + that.getFormatTime() + '</div>');
            }
            //重置上次交谈时间
            last_cvs_time = cur_time;

            result_html = html_arr.join('');

            //写入本地数据库
            this._storageDB.insert(from, result_html);

            //把内容写在页面上
            $im_history.find('.js-chat-' + from).append(result_html);

            //滚到最底部
            $im_history.scrollTop($im_history.find('.js-chat-' + from).outerHeight());
        },
        /*
         * 删除好友方法
         * */
        delFriend: function (id) {
            _easemob.delFriend(id);
            this.setCurChat();
        },
        /*
         * 初始化当前聊天窗口
         * */
        setCurChat: function () {
            //样式的修改
            $pub_im.find('.cur-contact').removeClass('cur-contact');
            $pub_im.find('.js-ci-' + chat_user.id).addClass('cur-contact');

            //设置当前title
            $im_title.text('与' + chat_user.name + '聊天');
            //设置面板信息
            $contact_info.find('img').attr('src', chat_user.logo);
            $contact_info.find('span').text(chat_user.name);

            //im box 最大化
            this.setBoxSize(IM_BOX_MAX);
            //隐藏所有的历史框
            $im_history.find('.js-chat-user').hide();

            //查找当前联系人的聊天历史框
            $cur_chat_history = $im_history.find('.js-chat-' + chat_user.id);
            //显示当前
            $cur_chat_history.show();
            //滚到最底部
            $im_history.scrollTop($cur_chat_history.outerHeight());
        },
        /*
         *构建聊天历史框
         *
         * */
        createChatHistory: function (ids) {
            //添加客服人员
            ids.push(CUSTOM_SERVICE.id);
            var that = this;
            var length = ids.length,
                html = [];
            while (length--) {
                var temp = ids[length];
                html.push('<div class="js-chat-user js-chat-');
                html.push(temp);
                html.push('">' + that._storageDB.select(temp) + '</div>');
            }
            $im_history.empty().append(html.join(''));
        },
        /*
         * 本地缓存数据
         * 数据格式 cur_usr_chat_user:{ time : html }
         *
         * */
        _storageDB: {
            insert: function (chat_user_id, msg) {
                var cur_key,
                    msg_history,
                    msg_history_str,
                    cur_time = new Date().getTime();
                //设置当前key
                cur_key = [cur_user.id, '_', chat_user_id].join('');
                //拿取历史内容字符串
                msg_history_str = localStorage.getItem(cur_key);
                if (msg_history_str) {
                    msg_history = JSON.parse(msg_history_str);
                    //消息超时删除处理
                    for (var i in msg_history) {
                        if (msg_history.hasOwnProperty(i) && (i - 0 - cur_time > STORAGE_TIME)) {
                            delete msg_history[i];
                        }
                    }
                } else {
                    msg_history = {};
                }
                msg_history[cur_time] = msg;
                localStorage.setItem(cur_key, JSON.stringify(msg_history));
            }
            ,
            select: function (chat_user_id) {
                var cur_key,
                    msg_history,
                    msg_history_str,
                    result_html = [];
                //设置当前key
                cur_key = [cur_user.id, '_', chat_user_id].join('');
                //拿取历史内容字符串
                msg_history_str = localStorage.getItem(cur_key);
                msg_history = JSON.parse(msg_history_str);

                //消息超时删除处理
                for (var i in msg_history) {
                    if (msg_history.hasOwnProperty(i)) {
                        result_html.push(msg_history[i]);
                    }
                }
                return result_html.join('');
            }
        },
        /*
         * 添加 删除 联系人的回调，
         * 删除的操作，对象里面的subscribtion会变成remove但是数组里面还存在这个对象，所以当
         * v['subscription'] = person['subscription'] 就是删除的回调
         * */
        onRosterHandler: function (roster) {
            var person = roster[0],
                flag = true;

            $.each(all_rosters, function (i, v) {
                if (person['name'] === v['name']) {
                    v['subscription'] = person['subscription'];
                    flag = false;
                    //这个是删除的时候把当前联系人设置成客服人员
                    chat_user = CUSTOM_SERVICE;
                }
            });
            if (flag) {
                all_rosters = all_rosters.concat(roster);
            }
            this.createRosterDom(all_rosters);
        },
        /*
         * 构建好友列表方法
         * param :[]
         * */
        createRosterDom: function (roster) {
            var roster_html = [];
            //清除数组
            all_rosters_ids = [];
            //判断好友数组的长度
            if (roster.length) {
                $.each(roster, function (i, v) {
                    var temp_name = v['name'];
                    if (v['subscription'] === 'both') {
                        //全局朋友列表
                        all_rosters_ids.push(temp_name);
                        //push html 片段
                        roster_html.push('<div class="contact-item js-cli js-ci-' + temp_name + '" data-chat-id="' + temp_name);
                        roster_html.push('" data-chat-name="" data-cli-ele="chat_to">');
                        roster_html.push('<a href="javascript:void(0);" class="contact-look">');
                        roster_html.push('<img src="' + URL.DEFAULT_IMG_URL + '" height="32" width="32"></a>');
                        roster_html.push('<span>加载中...</span>');
                        roster_html.push('<a href="javascript:void(0);" class="contact-del js-cli js-del" data-cli-ele="ci-del"><i class="iconfont icon-close"></i></a></div>');
                    }
                });
                if (!all_rosters_ids.length) {
                    roster_html.push(ROSTER_EMPTY_HTML);
                }
            } else {
                roster_html.push(ROSTER_EMPTY_HTML);
            }
            //加载联系人
            $im_roster.empty().append(roster_html.join(''));
            //构建联系人的数量
            $im_start_label.text('联系人[' + all_rosters_ids.length + ']');
            //显示正常头像名称
            this.beautyRosterDom(all_rosters_ids);
            //构建聊天历史窗口
            this.createChatHistory(all_rosters_ids);
            //设置当前联系人,如果没有chat_user,那么就不设置当前联系人
            chat_user.id && this.setCurChat();
        },
        /*
         * 展示头像名称
         * params Array
         * 返回一个 对象 里面有头像 名称的信息
         * */
        beautyRosterDom: function (uids) {
            var suc = function (data) {
                var ext_obj = data.data;
                $im_roster.find('.contact-item').each(function () {
                    var $cur = $(this),
                        uid = $cur.attr('data-chat-id'),
                        tmp_obj = ext_obj[uid];
                    if (tmp_obj) {
                        //设置头像信息
                        $cur.find('img').attr('src', FILE_URL + tmp_obj['logo']);
                        //设置名称
                        $cur.attr('data-chat-name', tmp_obj['show_name']);
                        $cur.find('span').text(tmp_obj['show_name']);
                    }
                });
            };
            common.ajax(URL.GET_CHAT_INFO, suc, 'POST', {'uids': uids.join(',')});
        },
        /*
         *Encodes a string in base64
         * */
        encode: function (str) {
            if (!str || str.length === 0) return "";
            var s = '';
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/<(?=[^o][^)])/g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            //s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            s = s.replace(/\n/g, "<br>");
            return s;
        },
        /*
         * 拿到一个yyyy-mm-dd hh:min:ss的时间字符串
         * */
        getFormatTime: function () {
            var date = new Date(),
                year = date.getFullYear(),
                mon = date.getMonth() + 1,
                day = date.getDate(),
                hh = date.getHours(),
                min = date.getMinutes(),
                sec = date.getSeconds();
            return [year, '/', mon, '/', day, ' ', hh, ':', min, ':', sec].join('');
        }
    };
    /*
     * Easemob方法
     * */
    var _easemob = {
        init: function () {
            var that = this;
            conn = new Easemob.im.Connection({
                multiResources: Easemob.im.config.multiResources,
                https: Easemob.im.config.https,
                url: Easemob.im.config.xmppURL
            });
            //初始化连接
            conn.listen({
                //当连接成功时的回调方法
                onOpened: function () {
                    //设置上线必须
                    conn.setPresence();
                    //启动心跳
                    if (conn.isOpened()) {
                        conn.heartBeat(conn);
                    }
                    //获取当前的好友列表
                    that.getRoster();
                },
                //当连接关闭时的回调方法
                onClosed: function () {
                },
                //收到文本消息时的回调方法
                onTextMessage: function (message) {
                    common.textMsgHandler(message);
                },
                //收到表情消息时的回调方法
                onEmotionMessage: function (message) {
                    common.emotionMsgHandler(message);
                },
                //收到图片消息时的回调方法
                onPictureMessage: function (message) {
                    common.imageMsgHandler(message);
                },
                //收到音频消息的回调方法
                onAudioMessage: function (message) {
                },
                //收到文件消息的回调方法
                onFileMessage: function (message) {
                    common.fileMsgHandler(message);
                },
                //收到联系人订阅请求的回调方法
                onPresence: function (message) {
                },
                //收到联系人信息的回调方法
                onRoster: function (message) {
                    common.onRosterHandler(message);
                },
                //异常时的回调方法
                onError: function (message) {
                    conn.stopHeartBeat(conn);
                }
            });
        },
        /*
         * 登录方法
         * 参数：params = {name:'',pwd :''}
         * */
        login: function (params) {
            conn.open({
                apiUrl: Easemob.im.config.apiURL,
                user: params.name,
                pwd: params.pwd,
                appKey: Easemob.im.config.appkey
            });
        },
        /*
         * 删除好友
         * */
        delFriend: function (name) {
            conn.removeRoster({
                to: name,
                groups: ['default'],
                success: function () {
                    conn.unsubscribed({
                        to: name
                    });
                }
            });
        },
        /*
         *
         * */
        getEmotion: function () {
            return Easemob.im.EMOTIONS;
        },
        /*
         * 拿取联系人的信息
         * */
        getRoster: function () {
            conn.getRoster({
                success: function (roster) {
                    //设置当前friend数组,这里是数组的初始化
                    all_rosters = roster.concat();
                    common.createRosterDom(all_rosters);
                }
            });
        },
        /*
         * 发送图片
         * */
        sendPic: function (opt) {
            conn.sendPicture(opt);
        },
        /*
         * 发送文件
         * */
        sendFile: function (msg) {
            var options = {
                to: chat_user.id,
                msg: msg,
                type: "chat"
            };
            conn.sendTextMessage(options);
            common.appendMsg(cur_user.id, msg);
        },
        /*
         * 发送文本表情消息
         * */
        sendText: function () {
            var msg = common.textFilter();
            if (msg) {
                var options = {
                    to: chat_user.id,
                    msg: msg,
                    type: "chat"
                };
                conn.sendTextMessage(options);
                //当前登录人发送的信息在聊天窗口中原样显示
                var msgtext = Easemob.im.Utils.parseEmotions(common.encode(msg));
                common.appendMsg(cur_user.id, msgtext);
                common.textareaClear();
            }
        }
    };
//数组的遍历 该元素是否存在
    Array.prototype.indexOf = function (val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val)
                return i;
        }
        return -1;
    };

    return im;
})