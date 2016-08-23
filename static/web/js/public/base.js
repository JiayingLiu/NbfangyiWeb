/*
 * 功能：公共组件操作
 * 作者：崔洪泉
 * 说明：页面的初始化，事件的绑定等
 * */
define(['jquery'], function ($) {
    /*
     * 地址
     * */
    var URL = {
        MINI_LOGIN: '/user/oauth/user/miniLogin',//mini登录
        USER_INFO: '/usercore/api/member/getUserLoginInfo',//登陆者信息
        FUZZY_SEARCH: '/search/index/index/suggest?q=',//模糊搜索提示
        SEARCH_PAGE: '/search/',//搜索列表页
        GETHOT: '/search/index/index/getHotWord',
        ADDCOLLECT: '/user/shop/mark/addMarkInfo',//添加收藏
        PAGE_LOGIN: '/user/oauth/user/login'//登陆者页面
        /*
         * 暂时不用了：ajax全局搜索的地址是：/search/index/index/query
         * */
    };
    /*
     * 触发事件按钮的 id 或者 class
     * */
    var EVENT_SELECTOR = {
            IM: '.im-openbtn',
            MINI_WIN: '#mnl_win',
            MINI_IFRAME: '.mini-ifame'
        },
    /*
     * 公共参数
     * */
        AJAX_STATUS_SUCCESS = 0;
    /*
     * 主要是防止mini登录页面的window 初始化，保证只有一个window初始化
     * 保证下面方法操作的所有对象，都是最高级window的对象
     * */
    var win = window.self === window.top ? window : window.top;

    var nbfy = win.nbfy = {},
        user = nbfy.user = {};
    var nbfy_methods = {
        /*
         * 页面的初始化操作，仅限于最高级的window对象，对于mini login页面不参与初始化
         * */
        init: function (settings) {
            var that = this;
            //初始化搜索栏
            that.initSearch();
            //检验用户是否登录
            if (window.self === window.top) {
                that._checkUserStatus(function (data) {
                    if (data.status == AJAX_STATUS_SUCCESS) {
                        that.setUser(data.data);
                        that.setStatusBar(that.getUser());
                        settings.afterLoginHandler && settings.afterLoginHandler.call(this, that.getUser());
                    }
                    that.imLoad(data.status);
                });
                that._bindEvents();
            }
        },
        /*
         * im页面绑定
         * */
        imLoad: function (status) {
            var user = this.getUser();
            if (status == AJAX_STATUS_SUCCESS) {
                require(['im'], function (im) {
                    im.init(user);
                });
            } else {
                $('.js-im-trigger').off().on('click', null, function () {
                    top.location.href = URL.PAGE_LOGIN;
                });
            }
        },
        /*
         * 注册用户信息
         * */
        setUser: function (value) {
            user.imname = value['_user_chat_name'];
            user.impwd = value['_user_chat_pwd'];
            user.uid = value['_user_uid'];
            user.type = value['_user_type'];
            user.realname = value['_user_real_name'];
            user.phone = value['_user_phone'];
            user.logo = value['_user_logo'];
            user.nick = value['_user_nick'];
            user.nickname = value['_show_nick_name'];
            user.url = value['_user_url'];
            user.logintime = new Date().getTime();//最晚一次验证登录的时间
        },
        //拿到USER的信息
        getUser: function () {
            return user;
        },
        setStatusBar: function (user) {
            var $header = $('#pub_hsb'),
                $li = $header.find('li'),
                $reg = $li.eq(4),
                $login = $li.eq(5),
                $logout = $li.eq(6),
                $user = $li.eq(7);
            //走进方法为登录状态
            $reg.hide();
            $logout.show();
            $login.hide();
            $user.find('a').attr('href', user['url']).html('<i class="iconfont icon-user font-remind"></i>' + user['nickname']);
            $user.show();
        },
        /*
         * 搜索栏事件
         * */
        initSearch: function () {
            var $search = $('#nb_sear'),
                $result = $('#nbs_result');
            var searMethod = {
                init: function () {
                    this.bindEvents();
                },
                bindEvents: function () {
                    var that = this;
                    //绑定input btn 的点击事件
                    $search.on('click', '.js-sear-tab,.js-search-input', function () {
                        var $this = $(this);
                        if ($this.hasClass('js-sear-tab')) {
                            $search.find('.js-sear-selected').removeClass('js-sear-selected');
                            $this.addClass('js-sear-selected');
                        } else {
                            if ($this.val()) {
                                that.requestFuzzyData($this.val());
                            } else {
                                that.requestHotWord();
                            }
                        }
                    });
                    //input框onblur的模拟
                    $('body').on('click', null, function (e) {
                        e.target.className.match('js-sear-keep') || that.hideResultLabel();
                    });
                    //input keyup事件
                    $search.on('keyup', '.js-search-input', function (e) {
                        var $this = $(this),
                            value = $this.val();
                        if(e.keyCode == 13){
                            window.location.href = URL.SEARCH_PAGE + '?q=' + $search.find('.js-search-input').val() +
                                '&t=' + $search.find('.js-sear-selected').attr('data-type');
                        }else{
                            value = $.trim(value);
                            value ? that.requestFuzzyData(value) : that.requestHotWord();
                        }
                    });
                    //绑定result 点击搜索结果的事件
                    $result.on('click', '.result-item', function () {
                        var $this = $(this),
                            select_text = $this.children().eq(0).text();
                        window.location.href = URL.SEARCH_PAGE + '?q=' + select_text +
                            '&t=' + $search.find('.js-sear-selected').attr('data-type');
                    });
                    //全局搜索按钮
                    $('#nb_global_search').on('click', null, function () {
                        window.location.href = URL.SEARCH_PAGE + '?q=' + $search.find('.js-search-input').val() +
                            '&t=' + $search.find('.js-sear-selected').attr('data-type');
                    });
                },
                requestHotWord: function () {
                    var that = this;
                    $.ajax({
                        url: URL.GETHOT + '?t=' + $search.find('.js-sear-selected').attr('data-type'),
                        type: 'GET',
                        dataType: 'json',
                        success: function (data) {
                            if (data.status == 0) {
                                that.createHotWordDom(data.data);
                            } else {
                                model.tip(data.message, 2000);
                            }
                        }
                    });
                },
                requestFuzzyData: function (value) {
                    var that = this;
                    $.ajax({
                        url: URL.FUZZY_SEARCH + value + '&t=' + $search.find('.js-sear-selected').attr('data-type'),
                        type: 'GET',
                        dataType: 'json',
                        success: function (data) {
                            if (data.status == 0) {
                                that.createFuzzyDom(data.data);
                            } else {
                                model.tip(data.message, 2000);
                            }
                        }
                    });
                },
                createHotWordDom: function (result) {
                    var html = [];
                    $.each(result, function (i, v) {
                        html.push(' <div class="result-item js-sear-keep"><span>' + i + '</span><span class="pull-right">&gt;</span></div>');
                    });
                    $result.empty().append(html.join(''));
                    this.showResultLabel();
                },
                createFuzzyDom: function (result) {
                    var html = [],
                        len = result && result.length ? result.length : 0;
                    if (len) {
                        while (len--) {
                            html.push(' <div class="result-item js-sear-keep"><span>' + result[len] + '</span><span class="pull-right">&gt;</span></div>');
                        }
                        $result.empty().append(html.join(''));
                        this.showResultLabel();
                    } else {
                        this.hideResultLabel();
                    }
                },
                showResultLabel: function () {
                    var sear = $search.offset(),
                        sear_top = sear.top,
                        sear_left = sear.left,
                        sear_height = $search.outerHeight(),
                        sear_width = $search.find('.sear-input').outerWidth();
                    //设置type的位置
                    $result.css({
                        top: sear_top + sear_height + 'px',
                        left: sear_left + 'px',
                        width: sear_width + 'px'
                    }).show();
                },
                hideResultLabel: function () {
                    $result.hide();
                },
                buttonClickHandlrer: function () {

                }
            };
            return searMethod.init();
        },
        /*
         * 事件，添加权限处理（必须登录状态下有效）
         * */
        eventWithOauthHandler: function (eventHandler) {
            var that = this;
            that._checkUserStatus(function (data) {
                if (data.status == AJAX_STATUS_SUCCESS) {
                    eventHandler.call();
                } else {
                    that.openMiniLoginWin();
                }
            });
        },
        /*
         * 操作需要检验是否登录，那么所有的操作都在callback进行处理,确保方法不被其他代码污染。
         * */
        _checkUserStatus: function (callback) {
            if (callback && callback instanceof Function) {
                callback = callback;
            } else {
                callback = null;
            }
            $.ajax({
                url: URL.USER_INFO,
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    callback.call(this, data);
                }
            });
        },
        /*
         * 获取浏览器地址栏中的参数
         * 返回数组
         * */
        getUrlParams: function () {
            var url,
                tempArr = [],
                base_url,
                params,
                obj = {};
            url = win.location.href;
            //判断是否有参数
            if (url.match(/[\?]/g)) {
                tempArr = url.split('?');
                //原始的地址
                base_url = tempArr[0];
                //将原始地址添加进参数对象
                obj['baseUrl'] = base_url;
                //参数
                params = tempArr[1] ? tempArr[1] : '';
                if (params.match(/[\&]/g)) {
                    tempArr = params.split('&');
                    var len = tempArr.length,
                        tempParam;
                    while (len--) {
                        tempParam = tempArr[len].split('=');
                        obj[tempParam[0]] = tempParam[1];
                    }
                } else {
                    tempParam = params.split('=');
                    obj[tempParam[0]] = tempParam[1];
                }
            } else {
                //将原始地址添加进参数对象
                obj['baseUrl'] = url;
            }
            return obj;
        },
        /*
         * 打开mini login窗口
         * */
        openMiniLoginWin: function () {
            var $win = win.$(EVENT_SELECTOR.MINI_WIN);
            $win.find(EVENT_SELECTOR.MINI_IFRAME).attr('src', URL.MINI_LOGIN);
            $win.show();
        },
        /*
         * 关闭mini login窗口
         * */
        closeMiniLoginWin: function () {
            win.$(EVENT_SELECTOR.MINI_WIN).hide();
        },
        /*
         * 绑定事件，im和mini登录的时间绑定
         *
         * */
        _bindEvents: function () {
            var that = this;
            //个人中心左侧树的聚焦
            var $sider_menu = $('#siderbar_menu');
            if ($sider_menu.length) {
                $sider_menu.find('a').each(function () {
                    var $this = $(this);
                    if (that.getUrlParams()['baseUrl'].match($this.attr('href'))) {
                        $this.css('color', '#ef8200');
                    }
                });
            }

            //主页的导航栏
            var $pub_nav = $('#pub_nav');
            if ($pub_nav.length) {
                if (location.href == 'http://am.nbangfanyi.com/index/') {
                    $pub_nav.find('a').eq(0).css('color', '#ef8200');
                } else if (location.href == 'http://am.nbangfanyi.com/search/?sst=1&q=&t=1') {
                    $pub_nav.find('a').eq(1).css('color', '#ef8200');
                } else if (location.href == 'http://am.nbangfanyi.com/search/?sst=2&q=&t=1') {
                    $pub_nav.find('a').eq(2).css('color', '#ef8200');
                } else {

                }
            }


            //mini登录的事件绑定
            $(EVENT_SELECTOR.MINI_WIN).on('click', '.win-close', function () {
                that.closeMiniLoginWin();
            });
            /*
             * 收藏事件
             * */
            $('#pub_collect').on('click', null, function () {
                var $this = $(this),
                    type = $this.attr('data-type'),
                    id = $this.attr('data-id');
                that.eventWithOauthHandler(function () {
                    if (that.getUser() && that.getUser().type == 1) {
                        $.ajax({
                            url: URL.ADDCOLLECT,
                            type: 'post',
                            data: {
                                'mark_id': id,
                                type: type
                            },
                            dataType: 'json',
                            success: function (data) {
                                require(['model'], function (model) {
                                    if (data.status == 0) {
                                        model.tip(data.message, 500, function () {
                                            $this.addClass('font-remind');
                                        });
                                    } else {
                                        model.tip(data.message, 2000);
                                    }
                                });
                            }
                        });
                    } else {
                        require(['model'], function (model) {
                            model.tip('只有用户才可以收藏店铺或商品', 2000);
                        });
                    }
                });
            });
        }
    };
    return {
        init: function (params) {
            var defaults = {
                afterLoginHandler: null
            };
            var settings = $.extend({}, defaults, params);
            nbfy_methods.init(settings);
        },
        eventWithOauthHandler: function (callback) {
            return nbfy_methods.eventWithOauthHandler(callback);
        },
        getUser: function () {
            return nbfy_methods.getUser();
        },
        setUser: function (value) {
            return nbfy_methods.setUser(value);
        },
        getUrlParams: function () {
            return nbfy_methods.getUrlParams();
        },
        closeMiniLoginWin: function () {
            return nbfy_methods.closeMiniLoginWin();
        }
    }
});