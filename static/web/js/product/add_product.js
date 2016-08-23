require(['jquery', 'base', 'model', 'validate', 'tag'],
    function ($, base, model, validate, tag) {
        base.init();
        //笔译的
        tag.bind({
            id: 'tag_category_id',
            url: '/shop/index/product/ajaxGetCategory?type=1',
            limit: 1
        });
        //口译的
        tag.bind({
            id: 'tag_category_id_k',
            url: '/shop/index/product/ajaxGetCategory?type=2',
            limit: 1
        });
        //服务领域标签
        tag.bind({
            id: 'tag_field_id',
            url: '/shop/index/product/ajaxGetField',
            limit: 3
        });
        //服务承诺
        tag.bind({
            id: 'tag_service_commitment',
            url: '/shop/index/product/ajaxGetServiceCommitment',
            limit: 6
        });

        units = units.replace(/&quot;/g, '"');
        units = JSON.parse(units);

        var $form = $('#product_form'),
            $price_type = $('#change_price_type'),
            createPriceType = function (type) {
                var option_str = '<option value="">请选择价格单位</option>';
                $.each(units[type], function (i, v) {
                    option_str += ('<option value="' + i + '">' + v + '</option>');
                });
                $price_type.empty().append(option_str);
            };
        //初始化价格单位
        createPriceType($form.find('.js-type').val());

        //类型改变事件
        $form.on('change', '.js-type', function () {
            //如果是笔译
            if (this.value == 1) {
                $form.find('.js-price-b').show();
                $form.find('.js-price-k').hide();
            } else if (this.value == 2) {
                $form.find('.js-price-k').show();
                $form.find('.js-price-b').hide();
            } else {
            }
            createPriceType(this.value);
        });

        // 目标语言和源语言不冲突 目标语言
        var $language_id = $('#language_id'),
            $to_language_id = $('#to_language_id'),
            language_html = $language_id.html(),
            to_language_html = $to_language_id.html();
        $form.on('change', '.js-language', function () {
            var id = this.id,
                value = this.value;

            //如果是目标语言
            if (id == 'language_id') {
                var to_language_id_value = $to_language_id.val();
                $to_language_id.empty().append(to_language_html);
                value && $to_language_id.find('option[value=' + value + ']').remove();
                $to_language_id.val(to_language_id_value);
            } else if (id == 'to_language_id') {//否则
                var language_id_value = $language_id.val();
                $language_id.empty().append(language_html);
                value && $language_id.find('option[value=' + value + ']').remove();
                $language_id.val(language_id_value);
            } else {

            }
        });
        randomImg(1, 1);
        //获取随机图片
        $('#random_img_btn').on('click', function () {
            var type = $('#product_form').find('.js-type').val(),
                id;
            //如果选择的是笔译
            if (type == 1) {
                id = $('#tag_category_id_hidden').val();
            } else if (type == 2) {
                id = $('#tag_category_id_k_hidden').val();
            } else {
            }
            randomImg(id, type);
        });
        function randomImg(id, type) {
            $.ajax({
                url: '/shop/index/product/ajaxGetProductPicture',
                type: 'post',
                data: {
                    id: id,
                    type: type
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        //给图片地址
                        $('#random_img').attr('src', BASE_FILE_URL + data.data['small_img']);
                        //给隐藏域值
                        $('#random_img_btn').next().val(data.data['img']);
                    } else {
                        model.tip(data.message, 1000, function () {
                        });
                    }
                }
            });
        }

        //保存
        $('#save').on('click', null, function () {
            var doc = document,
                type = $('#product_form').find('.js-type').val();
            //如果选择的是笔译
            if (type == 1) {
                doc.getElementsByName('category_id')[0].value = $('#tag_category_id_hidden').val();
            } else if (type == 2) {
                doc.getElementsByName('category_id')[0].value = $('#tag_category_id_k_hidden').val();
            } else {
            }
            if (!$price_type.val()) {
                model.tip('请选择价格单位', 2000);
                return;
            }
            // 取得HTML内容
            editor.sync();
            $('#editor').val(editor.html());

            $.ajax({
                url: '/shop/index/product/submitProduct',
                type: 'post',
                data: $form.serialize(),
                dataType: 'json',
                success: function (data) {
                    if (data.status == 0) {
                        model.tip(data.message, 1000, function () {
                            window.location.href = '/shop/index/product/productList';
                        })
                    } else {
                        model.tip(data.message, 1000, function () {
                        })
                    }
                }
            });
        });
    });