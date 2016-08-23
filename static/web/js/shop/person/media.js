require(['jquery', 'base', 'fancybox', 'model'], function ($, base, fancybox, model) {
    base.init();
    //image review
    var $shop_albums = $('#shop_albums');
    $shop_albums.find('a').fancybox({
        'centerOnScroll': true,
        'titlePosition': 'over',
        'cyclic': true,
        'titleFormat': function (title, currentArray, currentIndex, currentOpts) {
            return '<span id="fancybox-title-over">' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
        }
    });
});