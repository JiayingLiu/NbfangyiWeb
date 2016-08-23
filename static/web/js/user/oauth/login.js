require(['jquery', 'base', 'validate'], function ($, base, validate) {
    base.init();
    var URL = {
        LOGIN: '/usercore/api/member/login',//登陆
        IMG_VERIFY: '/usercore/api/member/verify',//登陆验证图片
        PAGE_LOGIN_URL: '/user/oauth/user/login',//登录页的url
        PAGE_REG_URL: '/user/oauth/user/regShow',//注册hello页的url
        PAGE_PASSWORD_URL: '/user/oauth/user/getPasswd'//找回密码的url
    };
    var login = function () {
        var dom = document,
            account = dom.getElementsByName('account')[0].value,
            password = dom.getElementsByName('password')[0].value,
            verifyCode = dom.getElementsByName('verifyCode')[0].value;
        if (!validate.phone(account)) {
            $('#login_tip').show().find('strong').text('手机号码不合法');
            return;
        }

        if (!validate.require(verifyCode)) {
            $('#login_tip').show().find('strong').text('验证码不能为空');
            return;
        }
        $.ajax({
            url: URL.LOGIN,
            type: 'post',
            dataType: 'json',
            data: {
                verifyCode: verifyCode,
                account: account,
                password: password,
                dataType: 'json', //数据返回类型，web登陆有效(非必须)，如果需要返回json，直接dataType = json即可
                url: ''//跳转地址, DataType不为json时传递要跳转的地址
            },
            success: loginHandler
        });
    };
    //地址的跳转
    var loginHandler = function (data) {
        if (data.status == 0) {
            //获取当前的地址
            var params = base.getUrlParams();
            if (params.baseUrl.match(URL.PAGE_LOGIN_URL)) {
                if (params.backUrl) {
                    window.top.location.href = window.decodeURIComponent(params.backUrl);
                } else {
                    window.top.location.href = '/';
                }
            } else {
                base.closeMiniLoginWin();
                base.setUser(data.data);
            }
        } else {
            $('#login_tip').show().find('strong').text(data.message);
            document.getElementById('verifyImg').src = URL.IMG_VERIFY + '?' + new Date().getTime();
        }
    };
    //点击注册按钮
    $('#to_reg').on('click', null, function () {
        window.top.location.href = URL.PAGE_REG_URL;
    });
    //点击找回密码按钮
    $('#to_password').on('click', null, function () {
        window.top.location.href = URL.PAGE_PASSWORD_URL;
    });
    //登陆事件
    $('#login').on('click', null, function () {
        login();
    });
    $(window).on('keydown', function (e) {
        if (e.keyCode == 13) {
            login();
        }
    });
    //第三方登录
    $('#third_login').on('click', 'a', function () {
        var $this = $(this),
            url = $this.attr('data-href');
        window.top.location.href = url;
    });
    //清除事件
    $('#login_form').on('keyup', '.js-input', function () {
        var $this = $(this),
            $close = $this.parent().next('.close');
        if ($this.val()) {
            $close.show();
        } else {
            $close.hide();
        }
    });
    $('#login_form').on('click', '.close', function () {
        var $this = $(this);
        $this.prev('div').find('input').val('');
        $this.hide();
    });
});
