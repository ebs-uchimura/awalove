/**
 * validate.js
 *
 * function： フォームバリデーション用
 **/

"use strict";

(function ($) {
    $(function () {
        // 標準エラーメッセージの変更
        $.extend($.validator.messages, {
            email: " *正しいメールアドレスの形式で入力して下さい", // メール
            required: " *入力必須です", // 必須
            phone: " *正しい電話番号の形式で入力してください", // 電話番号
        });

        // 追加ルールの定義
        const methods = {
            // 電話番号
            phone: function (value, element) {
                return (
                    this.optional(element) ||
                    /^(0{1}\d{1,4}-{0,1}\d{1,4}-{0,1}\d{4})$/.test(value)
                );
            },
        };

        // メソッドの追加
        $.each(methods, function (key) {
            $.validator.addMethod(key, this);
        });

        // ルール定義（注文）
        const orderRules = {
            shopname: {
                required: true,
            },
            username: {
                required: true,
            },
            tel: {
                phone: true,
                required: true,
            },
            email: {
                email: true,
                required: true,
            },
            pref: {
                required: true,
            },
            city: {
                required: true,
            },
            street: {
                required: true,
            },
            labeltype: {
                required: true,
            },
            label_text: {
                required: true,
            },
        };

        // エラー処理
        $("#orderform").validate({
            // ルール指定
            rules: orderRules,
            // エラーメッセージ出力箇所調整
            errorPlacement: function (error, element) {
                // ラジオボタンなら親要素に
                if (element.is(":radio")) {
                    // 親にアペンド
                    error.appendTo(element.parent());
                } else {
                    // それ以外なら後に
                    error.insertAfter(element);
                }
            },
        });
    });
})(window.jQuery);
