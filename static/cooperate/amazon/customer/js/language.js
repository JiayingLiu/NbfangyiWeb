CommonUtils.language = function () {
    var $this = $(arguments[2].target),
        $source = $('#sourceLanguage'),
        $target = $('#targetLanguage'),
        source_val = $source.val(),
        target_val = $target.val(),
    //语言对象
        language = {
            0: "请选择",
            135: "中文",
            136: "英语",
            137: "日语",
            138: "韩语",
            139: "法语",
            140: "俄语",
            141: "德语",
            142: "西班牙语",
            143: "葡萄牙语",
            144: "阿拉伯语",
            153: "意大利语"
        },
    //组建dom的方法
        createHtml = function (obj) {
            var html = [];
            $.each(obj, function (i, v) {
                html.push('<option value="' + i + '" class="js-language">' + v + '</option>');
            });
            return html.join('');
        };

    //条件判断,如果是源语言
    if ($this.attr('id') == 'sourceLanguage') {
        if ($this.val() == 0) {
            $source.empty().append(createHtml(language));
        } else if ($this.val() == '135') {//如果是中文
            delete language[135];
        } else if ($this.val() == '136') {//如果是英文
            delete language[136];
            delete language[143];
            delete language[144];
        } else if ($.inArray($this.val(), ['139', '141', '142', '153', '137', '138', '140']) > -1) {
            delete language[137];
            delete language[138];
            delete language[139];
            delete language[140];
            delete language[141];
            delete language[142];
            delete language[143];
            delete language[144];
            delete language[153];
        }else {//如果是其他
            delete language[136];
            delete language[137];
            delete language[138];
            delete language[139];
            delete language[140];
            delete language[141];
            delete language[142];
            delete language[143];
            delete language[144];
            delete language[153];
        }
        $target.empty().append(createHtml(language));
        if ($target.val() != $this.val()) {
            $target.find('option[value=' + target_val + ']').prop('selected', 'selected');
        }
    } else {
        if ($this.val() == 0) {
            $target.empty().append(createHtml(language));
        } else if ($this.val() == '135') {//如果是中文
            delete language[135];
        } else if ($this.val() == '136') {//如果是英文
            delete language[136];
            delete language[143];
            delete language[144];
        } else if ($.inArray($this.val(), ['139', '141', '142', '153', '137', '138', '140']) > -1) {
            delete language[137];
            delete language[138];
            delete language[139];
            delete language[140];
            delete language[141];
            delete language[142];
            delete language[143];
            delete language[144];
            delete language[153];
        } else {//如果是其他
            delete language[136];
            delete language[137];
            delete language[138];
            delete language[139];
            delete language[140];
            delete language[141];
            delete language[142];
            delete language[143];
            delete language[144];
            delete language[153];
        }
        $source.empty().append(createHtml(language));
        if ($source.val() != $this.val()) {
            $source.find('option[value=' + source_val + ']').attr('selected', 'selected');
        }
    }
}