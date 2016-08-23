/**
 * Created by cuihongquan on 16/4/7.
 */
//搜索列表页
require(['jquery', 'base', 'model', 'page', 'validate'], function ($, base, model, page, validate) {
    base.init();
    var URL = {
        MAIN: '/search/',
        APPM: '/index/index/guestBook/addGuestBook'
    };
    var createUrl = function (key, value) {
        var url_obj = base.getUrlParams();
        //删除offset
        url_obj.offset && delete url_obj.offset;

        //如果存在
        if(key){
            if (url_obj.hasOwnProperty(key)) {
                url_obj[key] = value;
            } else {
                url_obj[key] = value;
            }
        }

        var url_arr = [];
        url_arr.push(url_obj['baseUrl']);
        for (var i in url_obj) {
            if (url_obj.hasOwnProperty(i) && i !== 'baseUrl') {
                url_arr.push(i + '=' + url_obj[i]);
            }
        }
        var url_str = url_arr.join('&');
        return url_str.replace(/\&{1}/, '?');
    };
    //筛选的导航
    var $search_filter = $('#search_filter'),
        $nav = $('#search_nav'),
        $sort = $('#sear_sort');
    //绑定更多和收起的按钮
    $search_filter.on('click', '.js-more', function () {
        var $this = $(this);
        $this.find('.fil-ext-more,.fil-ext-up').toggle();
        $this.parent().prev('.fil-value').toggleClass('expand');
    });

    //分页处理
    page_config.length = 7;
    page_config.url = createUrl();
    page_config.showPages = false;
    page.init(page_config);

    //点击查询事件
    $search_filter.on('click', '.js-btn', function () {
        var $this = $(this),
            id = $this.attr('data-id');
        if ($this.hasClass('js-sl')) { //如果是源语言
            location.href = createUrl('sl', id);
        } else if ($this.hasClass('js-tl')) {//如果是目标语言
            location.href = createUrl('tl', id);
        } else if ($this.hasClass('js-clt')) {//技能分类
            location.href = createUrl('clt', id);
        } else if ($this.hasClass('js-st')) {//身份
            location.href = createUrl('st', id);
        } else if ($this.hasClass('js-cl')) {//技能小分类
            location.href = createUrl('cl', id);
        } else if ($this.hasClass('js-sx')) {//性别
            //location.href = createUrl('sx', id);
        } else if ($this.hasClass('js-sf')) {//领域
            location.href = createUrl('sf', id);
        } else if ($this.hasClass('js-ct')) {//城市
        } else {
        }
    });
    //面包屑删除
    $nav.on('click', '.search-nav-item', function () {
        var $this = $(this),
            type = $this.attr('data-type');
        location.href = createUrl(type, '');
    });

    var SORT = {
        Z: 'shop_comprehensive_count',//总分
        P: 'shop_comment_count',//评价
        F: 'shop_service_time',//服务次数
        J: 'product_price'//价格
    };
    //排序展示
    var showSorticon = function () {
        var $i = $sort.find('i'),
            s = base.getUrlParams()['s'];
        if (s && s.match(SORT.Z)) {
            $i = $i.eq(0);
        } else if (s && s.match(SORT.P)) {
            $i = $i.eq(1);
        } else if (s && s.match(SORT.F)) {
            $i = $i.eq(2);
        } else if (s && s.match(SORT.J)) {
            $i = $i.eq(3);
        } else {
            $i = $i.eq(0);
        }
        if (s && s.match('desc')) {
            $i.removeClass('icon-arrow-up').addClass('icon-arrow-down');
        } else {
            $i.removeClass('icon-arrow-down').addClass('icon-arrow-up');
        }
        $i.parent().addClass('a-selected');
    }
    showSorticon();
    //绑定排序事件
    $sort.on('click', 'a', function () {
        var $this = $(this),
            $i = $this.find('i'),
            s;
        if ($this.hasClass('js-z')) {//综合
            s = SORT.Z;
        } else if ($this.hasClass('js-p')) {//评价
            s = SORT.P;
        } else if ($this.hasClass('js-f')) {//服务次数
            s = SORT.F;
        } else if ($this.hasClass('js-j')) {//价格
            s = SORT.J;
        } else {
        }
        if ($i.hasClass('icon-arrow-up')) {
            location.href = createUrl('s', s + '-desc');
        } else {
            location.href = createUrl('s', s + '-asc');
        }
    });
    //选择城市
    var cityFilter = function () {
        var $box = $('#area_box'),
            $select = $('#area_select'),
            $box_title = $box.find('.box-title'),
            $box_text = $box.find('.box-text');
        //克隆一份省份列表
        var pro_html = $box_text.html();
        //展开城市列表
        $select.on('click', null, function () {
            $(this).parent().addClass('expand');
        });
        //选择省份点击事件
        $box_text.on('click', '.js-ct', function () {
            var $this = $(this),
                level = $this.attr('data-level'),
                id = $this.attr('data-id'),
                name = $this.text();
            //如果是省份
            if (level == 1) {
                $box_title.empty().append('<li>当前选择省份：</li><li><a href="javascript:void(0);" data-pro="'+name+'">' + name +
                    '<span><i class="iconfont icon-close"></i></span></a></li>')
                $.ajax({
                    url: '/index/common/city/getCityList/?pid=' + id,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == 0) {
                            var html = [];
                            data.data && $.each(data.data, function (i, v) {
                                html.push('<a href="javascript:void(0);" class="js-ct" data-level="' + v['level'] +
                                    '" data-id="' + v['id'] + '">' + v['title'] + '</a>');
                            });
                            $box_text.empty().append(html.join(''));

                        } else {


                        }
                    }
                })
            } else {//如果是城市
                location.href = createUrl('ct', $box_title.find('a').attr('data-pro') + name);
            }
        });
        //重新选择省份
        $box_title.on('click', 'a', function () {
            var $this = $(this),
                $li = $this.parent();
            $li.remove();
            $box_text.empty().append(pro_html);
        });
    };
    cityFilter();

    //绑定预约事件
    $('#appm_submit').on('click', null, function () {
        var phone = $('#appm_phone').val();
        if (!validate.phone(phone)) {
            model.tip('手机为空或格式不正确', 2000);
            return;
        }
        $.ajax({
            url: URL.APPM,
            dataType: 'json',
            data: $('#appm_form').serialize(),
            type: 'POST',
            success: function (data) {
                if (data.status == 0) {
                    $('#pub_appm').removeClass('pub-appointment-show');
                    model.tip('稍后会有译员联系您', 2000);
                } else {
                    model.tip(data.message, 2000);
                }
            }
        });
    });
});
