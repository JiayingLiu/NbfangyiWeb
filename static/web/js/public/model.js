define(['jquery'], function ($) {
    var $confirm = $('#nbfy_confirm'),
        $window = $('#nbfy_window'),
        $mask = $('#nbfy_mask'),
        $tip = $('#nbfy_tip'),
        tip_timer;

    return {
        confirm: function (html, confirmHandle, cancelhandle) {
            $confirm.find('.cfm-content').html(html);
            $confirm.show();
            $mask.show();
            $confirm.off().on('click', '.cfm-btn', function () {
                if ($(this).hasClass('cfm-confirm')) {
                    confirmHandle && confirmHandle.call(this);
                } else if ($(this).hasClass('cfm-cancel')) {
                    cancelhandle && cancelhandle.call(this);
                } else {
                }
                $mask.hide();
                $confirm.hide();
            });
        },
        tip: function (html, time, callback) {
            var that = this;
            $tip.find('p').html(html);
            $tip.show();
            tip_timer && clearTimeout(tip_timer);
            tip_timer = setTimeout(function () {
                $tip.hide();
                callback && callback.call(that);
            }, time);
        },
        window: function (height, width, title, html) {
            if (typeof height == 'number') {
                $window.find('.win-title span').html(title);
                var $cnt = $window.find('.win-content');
                $cnt.css({
                    height: height + 'px',
                    width: width + 'px'
                }).html(html);
                var win_h = $window.outerHeight(),
                    win_w = $window.outerWidth();
                $window.css({
                    'margin-left': '-' + (win_w / 2) + 'px',
                    'margin-top': '-' + (win_h / 2) + 'px'
                });
                $window.show();
                $window.find('.win-close').off().on('click', null, function () {
                    $window.hide();
                });
            } else if (typeof height == 'string' && height == 'hide') {
                $window.hide();
            } else {

            }
        }
    }
});