({
    baseUrl: './',
    dir: '../web_release',
    fileExclusionRegExp: /^(r|build)\.js$/,
    paths: {
        /*
         * 公共模块
         * */
        'baiduTj': 'js/public/baiduTj',
        'jquery': 'js/public/jquery-1.8.3.min',
        'base': 'js/public/base',
        'model': 'js/public/model',
        'validate': 'js/public/validate',
        'tag': 'js/public/tag',
        'checkbox': 'js/public/checkbox',
        'uploadimage': 'js/public/uploadimage',
        'uploadfile': 'js/public/uploadfile',
        'uploadify': 'plugin/uploadify/uploadify',
        'page': 'js/public/page',
        'ajaxPage': 'js/public/ajax_page',
        'city': 'js/public/city',
        'fancybox': 'plugin/fancybox/jquery.fancybox-1.3.1.pack',//图片轮播
        'nb.ueditor': 'plugin/ueditor/nbfy.ueditor',//百度富文本
        'ueditor.lang': 'plugin/ueditor/lang/zh-cn/zh-cn',//百度富文本中文包
        'ueditor.ZeroClipboard': 'plugin/ueditor/third-party/zeroclipboard/ZeroClipboard.min',//百度富文本粘贴
        'wdatePicker': 'plugin/DatePicker/WdatePicker',//时间选择插件
        /*
         * 业务js
         * */
        'aptitude': 'js/aptitude/aptitude',//资质认证
        'bc_add': 'js/bankroll/bc_add',//添加银行卡
        'bc_bind': 'js/bankroll/bc_bind',//绑定银行卡
        'bc_view': 'js/bankroll/bc_view',//银行卡的展示
        'deal': 'js/bankroll/deal',//交易明细
        'recharge': 'js/bankroll/recharge',//充值
        'recharge_pay': 'js/bankroll/recharge_pay',//充值支付
        'withdraw': 'js/bankroll/withdraw',//体现
        'coupon': 'js/coupon/coupon',//优惠券
        'product_evaluate': 'js/evaluate/product_evaluate',//产品的评价
        'reply_evaluate': 'js/evaluate/reply_evaluate',//回复评价
        'shop_evaluate': 'js/evaluate/shop_evaluate',//店铺评论
        'user_evaluate': 'js/evaluate/user_evaluate',//用户的评价
        'past_experience': 'js/experience/past_experience',//过往经历
        'album': 'js/media/album',//相册
        'video': 'js/media/video',//视频
        'message': 'js/message/message',//短信
        'sendmsg': 'js/message/sendmsg',//发送短信
        'confirm_order': 'js/order/confirm_order',//确定订单
        'interpreter': 'js/order/interpreter',//口译
        'pay': 'js/order/pay',//支付
        'written': 'js/order/written',//笔译
        'tdetails': 'js/orderlist/transorder/tdetails',//译者订单详情
        'torderlist': 'js/orderlist/transorder/torderlist',//译者订单列表
        'cdetails': 'js/orderlist/userorder/cdetails',//用户订单详情
        'corderlist': 'js/orderlist/userorder/corderlist',//用户订单列表
        'add_product': 'js/product/add_product',//添加商品
        'edit_product': 'js/product/edit_product',//编辑商品
        'product_list': 'js/product/product_list',//商品列表
        'searchlist': 'js/searchlist/searchlist',//查询列表
        'company_details': 'js/shop/person/company_details',//公司详情
        'index': 'js/shop/person/index',//店铺首页
        'media': 'js/shop/person/media',//店铺风采展示
        'product': 'js/shop/person/product',//店铺产品
        'login': 'js/user/oauth/login',//登陆
        'password': 'js/user/oauth/password',//找回密码
        'perfectinfo': 'js/user/oauth/perfectinfo',//完善资料
        'reg': 'js/user/oauth/reg',//注册
        'cbasicinfo': 'js/user/customercenter/cbasicinfo',//用户中心基本信息
        'tbasicinfo': 'js/user/personcenter/tbasicinfo',//译者中心基本信息
        'detailedinfo': 'js/user/personcenter/detailedinfo'//译者中心的详细信息
    },

    modules: [
        {name: 'aptitude', exclude: ['fancybox']},
        {name: 'bc_add'},
        {name: 'bc_bind'},
        {name: 'bc_view'},
        {name: 'deal'},
        {name: 'recharge'},
        {name: 'recharge_pay'},
        {name: 'withdraw'},
        {name: 'coupon'},
        {name: 'product_evaluate'},
        {name: 'reply_evaluate'},
        {name: 'shop_evaluate'},
        {name: 'user_evaluate'},
        {name: 'past_experience'},
        {name: 'album', exclude: ['fancybox']},
        {name: 'video'},
        {name: 'message'},
        {name: 'sendmsg'},
        {name: 'confirm_order'},
        {name: 'interpreter'},
        {name: 'pay'},
        {name: 'written'},
        {name: 'tdetails'},
        {name: 'torderlist', exclude: ['wdatePicker']},
        {name: 'cdetails'},
        {name: 'corderlist', exclude: ['wdatePicker']},
        {name: 'searchlist'},
        {name: 'add_product'},
        {name: 'edit_product'},
        {name: 'product_list'},
        {name: 'company_details'},
        {name: 'index', exclude: ['fancybox']},
        {name: 'media', exclude: ['fancybox']},
        {name: 'product'},
        {name: 'login'},
        {name: 'password'},
        {name: 'perfectinfo'},
        {name: 'reg'},
        {name: 'cbasicinfo', exclude: ['fancybox']},
        {name: 'tbasicinfo', exclude: ['fancybox']},
        {name: 'detailedinfo', exclude: ['nb.ueditor', 'ueditor.ZeroClipboard', 'ueditor.lang', 'wdatePicker']}
    ],
    stubModules: [],
    removeCombined: true,
    optimizeCss: 'standard',
    skipModuleInsertion: true
})
