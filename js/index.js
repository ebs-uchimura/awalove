/**
 * index.js
 *
 * function： LP画面用
 **/

"use strict";

(function ($) {
    // トグル用フラグ
    let menuFlg = false;

    // 文字数制限関数
    const regulateText = function (max, selector) {
        // 指定文字数以上になったら
        if (selector.text().length > max) {
            // 文字数-3文字まで表示する、という設定
            selector.text(selector.text().substr(0, max - 3));
            // 文字数-3以降に表示する代替テキスト
            selector.append("...");
        }
    };

    $(function () {
        // windowロード時
        $(window).on("load", function () {
            // iframeを非表示
            $(".framearea").addClass("display-none");
        });

        // メッセージ受信時
        window.addEventListener("message", function (e) {
            // ウィンドウを閉じる
            if (e.data == "ack") {
                // iframeを非表示
                $(".framearea").addClass("display-none");
            }
        });

        // ハンバーガークリック時
        $(".hamburger").on("click", function () {
            // トグル
            menuFlg = !menuFlg;

            // 画面最上部に位置をずらす
            $(".menu-base").scrollTop($(window).scrollTop());

            // フラグON
            if (menuFlg) {
                // メニューを非表示
                $(".menuarea").removeClass("display-none");
            } else {
                // メニューを表示
                $(".menuarea").addClass("display-none");
            }
        });

        // メニュークリック時
        $(".menu-text li").on("click", function () {
            // トグル
            menuFlg = !menuFlg;

            // フラグON
            if (menuFlg) {
                // メニューを表示
                $(".menuarea").removeClass("display-none");
            } else {
                // メニューを表示
                $(".menuarea").addClass("display-none");
            }
        });

        // メニュー×ボタンクリック時
        $(".menuarea .batsu").on("click", function () {
            // トグル
            menuFlg = !menuFlg;
            // メニューを非表示
            $(".menuarea").addClass("display-none");
        });

        // チャット開始ボタンクリック時
        $(".p-chatbase__ignite-button").on("click", function () {
            // iframe本体
            const win = window.frames[0];
            // iframeを表示
            $(".framearea").removeClass("display-none");
            // 最下部までスクロール
            $("#chat_base").scrollTop(9999);
            // iframeにフローIDを送付
            win.postMessage(this.value, "*");
        });

        // 文字数制限
        $(".news-text").each(function () {
            // 115文字以上になったら
            regulateText(115, $(this));
        });
    });
})(window.jQuery);
