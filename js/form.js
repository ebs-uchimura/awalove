/**
 * form.js
 *
 * function： 注文フォーム用
 **/

"use strict";

// サーバaddress
const globalUpdateServerUrl = "https://shop.suijinclub.com";

// 本体
(function ($) {
    $(function () {
        // フラグ
        let classicFlg = false;
        let cuteFlg = false;
        let elegantFlg = false;
        let nightFlg = false;
        // 初期は表示
        $(".labelarea").show();
        $(".classic").hide();
        $(".cute").hide();
        $(".elegant").hide();
        $(".night").hide();

        $(".order_link").click(function () {
            // スロー遷移
            const target = $(".dummy").offset().top - 100;
            $("html,body").animate({ scrollTop: target }, "slow");
            return false;
        });

        // チェックボタン全解除
        $('input[name="original"]').prop("checked", false);
        // チェックボタン変更
        $('input[name="original"]').change(function () {
            // チェックに応じてパターンを表示
            if ($("#original").prop("checked")) {
                $(".labelarea").hide();
            } else {
                $(".labelarea").show();
                //$(".labelarea").get(0).scrollIntoView(true);
            }
        });

        // classic
        $(".classic-label").click(function (e) {
            if (!classicFlg) {
                $(".classic").show();
                $(".classic").get(0).scrollIntoView(true);
            } else {
                $(".classic").hide();
            }
            $(".cute").hide();
            $(".elegant").hide();
            $(".night").hide();
            classicFlg = !classicFlg;
        });

        // cute
        $(".cute-label").click(function (e) {
            if (!cuteFlg) {
                $(".cute").show();
                $(".cute").get(0).scrollIntoView(true);
            } else {
                $(".cute").hide();
            }
            $(".classic").hide();
            $(".elegant").hide();
            $(".night").hide();
            cuteFlg = !cuteFlg;
        });

        // elegant
        $(".elegant-label").click(function (e) {
            if (!elegantFlg) {
                $(".elegant").show();
                $(".elegant").get(0).scrollIntoView(true);
            } else {
                $(".elegant").hide();
            }
            $(".classic").hide();
            $(".cute").hide();
            $(".night").hide();
            elegantFlg = !elegantFlg;
        });

        // night
        $(".night-label").click(function (e) {
            if (!nightFlg) {
                $(".night").show();
                $(".night").get(0).scrollIntoView(true);
            } else {
                $(".night").hide();
            }
            $(".classic").hide();
            $(".cute").hide();
            $(".elegant").hide();
            nightFlg = !nightFlg;
        });

        // フォーム送信時確認
        $("#submit").click(function (e) {
            // エラー有り
            if (!$("#orderform").validate().form()) {
                // メッセージ
                alert("エラーがあります");
                // クリックキャンセル
                e.preventDefault();
                return false;
            } else {
                console.log("ok");
            }

            // 確認ダイアログ
            if (confirm("注文内容を表示します")) {
                // チェック値
                const checked = Number(
                    $(`input:radio[name='contact']:checked`).val()
                );
                // ラベル選択値
                const labelChecked = Number(
                    $(`input:radio[name='imgSelect']:checked`).val()
                );
                // 商品選択値
                const pdChecked = Number(
                    $(`input:radio[name='product']:checked`).val()
                );
                // 送信内容
                const jsonList = {
                    shopname: $("#shopname").val(), // 店舗名
                    username: $("#username").val(), // ユーザ名
                    tel: $("#tel").val(), // 電話番号
                    email: $("#email").val(), // メールアドレス
                    contact: checked, // 連絡方法
                    zip: $("#zip").val(), // 郵便番号
                    pref: $("#pref").val(), // 都道府県
                    city: $("#city").val(), // 市区町村
                    street: $("#street").val(), // 番地
                    comment: $("#comment").val(), // 連絡
                    label_text: $("#label_text").val(), // ラベル文字列
                    template_id: labelChecked, // 選択テンプレート
                    product: pdChecked, // 選択商品
                    original: $("#original").prop("checked"), // オリジナル
                    horns: $("#horns").prop("checked"), // 
                };

                // データ送信
                ajaxAccess("formorder", jsonList);
            } else {
                //キャンセルした場合
                return false;
            }
        });
    });

    // * 名称： ajaxアクセス用関数
    // * 引数： url-送信先URL json-送信JSONオブジェクト
    // * 返り値： 実行結果
    const ajaxAccess = function (url, json) {
        // ajaxアクセス
        $.ajax(globalUpdateServerUrl + "/" + url, {
            type: "post", // POST
            data: json, // 送付データ
            dataType: "json", // JSON
            async: false,
        })

            // 完了
            .done(function (data) {
                // URLを開く
                window.open(data.url, "_parent");
            })

            // エラー
            .fail(function () {
                window.alert("正しい結果を得られませんでした。");
            });
    };
})(window.jQuery);
