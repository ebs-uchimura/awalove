/**
 * plugin.js
 *
 * function： chat用プラグイン(iframe用)
 **/

(function ($) {
    // 認証キー
    let globalAuthenticationKey;
    // セッションキー
    let globalSessionKey;
    // タグ
    let globalMsgTag;
    // フローID
    let globalFlowId;
    // 次のフローID
    let globalNextFlowId;
    // 最新メッセージ
    let globalNewMessage;
    // シナリオID
    let globalScenarioId = 0;
    // 端末判定フラグ
    let globalAgentFlg = 0;
    // キャンセルフラグ
    let cancelFlag = 0;

    // 種類コード
    const globalGeneralCode = "1";
    const globalRadioCode = "2";
    const globalSelectCode = "3";
    const globalUserMessageCode = "4";
    const globalTemplateCode = "5";

    // 回答タイプ
    const globalSelectAnswerType = "1";
    const globalMessageAnswerType = "2";
    const globalNoAnswerType = "3";
    const globalTemplateAnswerType = "4";
    const globalCompleteAnswerType = "5";

    // 担当者名
    const globalUserName = "お客様";

    // サーバaddress
    const globalUpdateServerUrl = "https://shop.suijinclub.com";

    // ユーザエージェント取得
    const agent = navigator.userAgent;

    // 端末・ブラウザ取得
    const result = detectInAppBrowser(agent);
    // 端末判定
    if (result[0] == "iOS") {
        globalAgentFlg = 1;
    } else if (result[0] == "android") {
        globalAgentFlg = 2;
    } else {
        globalAgentFlg = 3;
    }

    // ■ イベントメソッド
    let methods = {
        // 次メッセージ受信メソッド
        sendNextMessage: function (tag, nextid) {
            // 送付JSON
            const jsonObject = {
                key: globalAuthenticationKey, // 認証キー
                tag: tag, // 会話タグ
                scenarioId: globalScenarioId, // シナリオID
                flowId: nextid, // 次のフローID
                session: globalSessionKey, // セッションキー
            };

            // html入力
            setHtml(jsonObject);
        },

        // 送信ボタン押下時
        clickSendButton: function () {
            // クリック時
            this.on("click", function (e) {
                // 最下部までスクロール
                $("#chat_base").scrollTop(9999);

                // メッセージ
                let errorMsg = "";

                // フラグOFF
                if (cancelFlag == 0) {
                    // ダブルクリック禁止フラグ
                    cancelFlag = 1;
                    // テキストボックス入力値
                    const inputValue = $(".p-chat__input--shape")
                        .text()
                        .replace(/\s+/g, "");

                    // 空欄の場合やり直し
                    if (inputValue == "") {
                        errorMsg = "空欄です。";
                        errFunction(errorMsg);
                    } else {
                        // htmlの差し込み（ユーザメッセージ）
                        $("#chat_base").append(
                            setJson(globalUserMessageCode, inputValue)
                        );
                        // 消去
                        $(".p-chat__input--shape").empty();
                    }

                    // DB登録
                    switch (globalMsgTag) {
                        // 店名
                        case "shopname":
                            // 文字数制限
                            if (inputValue.length > 30) {
                                errorMsg =
                                    "店名の文字数が制限を超えています(30文字以内)。";
                                globalNewMessage =
                                    "お届け先の店名を教えてください。";
                                // エラー処理
                                errFunction(errorMsg);
                            } else {
                                // 通常処理
                                normalFunction(inputValue);
                            }
                            break;

                        // ユーザ名
                        case "staffname":
                            // 文字数制限
                            if (inputValue.length > 30) {
                                errorMsg =
                                    "担当者名の文字数が制限を超えています(30文字以内)。";
                                globalNewMessage =
                                    "担当スタッフのお名前を教えてください。";
                                // エラー処理
                                errFunction(errorMsg);
                            } else {
                                // 通常処理
                                normalFunction(inputValue);
                            }
                            break;

                        // 電話番号
                        case "telephone":
                            // 電話形式
                            const reg =
                                /^(0{1}\d{1,4}-{0,1}\d{1,4}-{0,1}\d{4})$/;

                            // 電話形式でない
                            if (!reg.test(inputValue)) {
                                errorMsg =
                                    "電話番号の形式が異なります。(例:099-259-551)";
                                globalNewMessage =
                                    "お電話番号を教えてください。(例:099-259-551)";
                                // エラー処理
                                errFunction(errorMsg);

                                // 文字数制限
                            } else if (inputValue.length > 13) {
                                errorMsg =
                                    "電話番号の文字数が制限を超えています(13文字以内)。";
                                globalNewMessage =
                                    "お電話番号を教えてください。(例:099-259-551)";
                                // エラー処理
                                errFunction(errorMsg);
                            } else {
                                // 通常処理
                                normalFunction(inputValue);
                            }
                            break;

                        // 番地（建物名・階数）
                        case "address":
                        case "zipaddress":
                            // 文字数制限
                            if (inputValue.length > 100) {
                                errorMsg =
                                    "住所の文字数が制限を超えています(100文字以内)。";
                                globalNewMessage =
                                    "お届け先の番地（建物名・階数）を教えてください。(例:宇宿2-23-3)";
                                // エラー処理
                                errFunction(errorMsg);
                            } else {
                                // 通常処理
                                normalFunction(inputValue);
                            }
                            break;

                        // メールアドレス
                        case "mailaddress":
                            // メール形式
                            const mailReg =
                                /^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

                            // メール形式でない
                            if (!mailReg.test(inputValue)) {
                                errorMsg =
                                    "半角英数文字で〇〇@〇〇.〇〇の形式で入力してください。";
                                globalNewMessage =
                                    "メールアドレスを教えてください。(例:info@suijinclub.com)";
                                // エラー処理
                                errFunction(errorMsg);

                                // 文字数制限
                            } else if (inputValue.length > 255) {
                                errorMsg =
                                    "メールアドレスの文字数が制限を超えています(255文字)。";
                                globalNewMessage =
                                    "メールアドレスを教えてください。(例:info@suijinclub.com)";
                                // エラー処理
                                errFunction(errorMsg);
                            } else {
                                // 通常処理
                                normalFunction(inputValue);
                            }
                            break;

                        // ラベル文字
                        case "label_text":
                            // 文字数制限
                            if (inputValue.length > 30) {
                                errorMsg =
                                    "ラベル文字の文字数が制限を超えています(30文字)。";
                                globalNewMessage =
                                    "ありがとうございます。ラベルに入れたい文字を教えてください。(例:誕生日おめでとう)";
                                // エラー処理
                                errFunction(errorMsg);
                            } else {
                                // 通常処理
                                normalFunction(inputValue);
                            }
                            break;

                        // 郵便番号
                        case "zipcode":
                            const range = document.createRange();
                            const chatbox = document.querySelector(
                                ".p-chat__input--shape"
                            );
                            const selection = window.getSelection();
                            // 住所取得リクエスト
                            getZipCode(inputValue)
                                .done(function (add) {
                                    // チャットに差し込み
                                    $(".p-chat__input--shape").text(add);
                                    // 通常処理
                                    normalFunction(inputValue);
                                    // カーソル位置を末尾に
                                    range.setStart(
                                        chatbox.firstChild,
                                        add.length
                                    );
                                    range.setEnd(
                                        chatbox.firstChild,
                                        add.length
                                    );
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                })

                                .fail(function () {
                                    // エラーメッセージ
                                    errorMsg = "郵便番号が存在しません";
                                    // 元のメッセージ
                                    globalNewMessage =
                                        "ご自宅の郵便番号を入れてください";
                                    // エラーフラグ
                                    errFunction(errorMsg);
                                    // テキストボックス有効化
                                    $(".p-chat__input").css(
                                        "pointer-events",
                                        "auto"
                                    );
                                });

                            break;

                        default:
                            // 初期化
                            errorMsg = "";
                            // 通常処理
                            normalFunction(inputValue);
                            break;
                    }
                }

                // 0.5秒後に実行
                setTimeout(function () {
                    // キャンセルフラグOFF
                    cancelFlag = 0;
                }, 1000);
            });
        },

        // 選択肢選択完了メソッド
        radioOptions: function () {
            // クリック時
            this.on("click", function (e) {
                // 対象ID
                let fixedChecked = 0;
                // 送信用
                let jsonObject = {};

                // 最下部までスクロール
                $("#chat_base").scrollTop(9999);
                // チェック値
                const checked = $(this).children("input").val();

                // フラグOFF
                if (cancelFlag == 0) {
                    // ダブルクリック禁止フラグ
                    cancelFlag = 1;

                    // ジャンル選択に戻るの場合は
                    if (checked == "back") {
                        // タグ
                        globalMsgTag = "choose";
                        // フローID
                        globalNextFlowId = "21";
                        // シナリオID
                        globalScenarioId--;
                        // 一時データ
                        receivedJsonData = {
                            flowId: "20",
                            tag: globalMsgTag,
                            message: "ジャンルを選択してください",
                            answerType: "1",
                            answerList: [
                                {
                                    answerId: "1",
                                    answerText: "クラシック",
                                    nextFlowId: "21",
                                },
                                {
                                    answerId: "2",
                                    answerText: "キュート",
                                    nextFlowId: "22",
                                },
                                {
                                    answerId: "3",
                                    answerText: "エレガント",
                                    nextFlowId: "23",
                                },
                                {
                                    answerId: "4",
                                    answerText: "ナイト",
                                    nextFlowId: "24",
                                },
                            ],
                        };

                        // htmlの差し込み（オプションリスト）
                        $("#chat_base").append(
                            setJson(globalRadioCode, receivedJsonData)
                        );
                        // 最下部までスクロール
                        $("#chat_base").scrollTop(9999);
                        // キャンセル初期化
                        cancelFlag = 0;
                        // メソッド初期化
                        updateMethods();
                    } else {
                        // チェックメッセージ
                        const checkeMessage = $(this).children("label").text();
                        // 背景を黄色に
                        $(this).css("background", "#F6CA00");
                        // 文字色を白に
                        $(this).css("color", "#FFF");

                        // テンプレートモード
                        if (receivedJsonData.imageList) {
                            // インデックス補正
                            fixedChecked = checked - 1;
                            // 次のフローID
                            globalNextFlowId =
                                receivedJsonData.imageList[checked - 1]
                                    .nextFlowId;
                        } else {
                            // インデックス補正
                            fixedChecked = checked;
                            // 次のフローID
                            globalNextFlowId =
                                receivedJsonData.answerList[checked].nextFlowId;
                        }

                        // 送付用データ
                        jsonObject = {
                            key: globalAuthenticationKey, // 認証キー
                            tag: globalMsgTag, // 会話タグ
                            scenarioId: globalScenarioId, // シナリオID
                            flowId: globalNextFlowId, // 次のフローID
                            no: fixedChecked, // チェックフラグ
                            message: checkeMessage, // メッセージ
                            session: globalSessionKey, // セッションキー
                            error: "", // エラー
                        };

                        // html入力
                        setHtml(jsonObject);
                    }

                    // 1秒後に実行
                    setTimeout(function () {
                        // キャンセルフラグOFF
                        cancelFlag = 0;
                    }, 1000);
                }
            });
        },

        // 選択肢選択完了メソッド
        selectOptions: function () {
            // クリック時
            this.on("click", function (e) {
                // 最下部までスクロール
                $("#chat_base").scrollTop(9999);

                // フラグOFF
                if (cancelFlag == 0) {
                    // ダブルクリック禁止フラグ
                    cancelFlag = 1;
                    // 選択値
                    // チェック値
                    const selected = Number(
                        $(
                            `[name='select${globalScenarioId}'] option:selected`
                        ).val()
                    );
                    // 選択メッセージ
                    const selectMessage = $(
                        `[name='select${globalScenarioId}'] option:selected`
                    ).text();

                    // フローIDセット
                    globalNextFlowId =
                        receivedJsonData.answerList[selected].nextFlowId;

                    // 送付用データ
                    const jsonObject = {
                        key: globalAuthenticationKey, // 認証キー
                        tag: globalMsgTag, // 会話タグ
                        scenarioId: globalScenarioId, // シナリオID
                        flowId: globalNextFlowId, // 次のフローID
                        no: selected, // 選択フラグ
                        message: selectMessage, // 選択メッセージ
                        session: globalSessionKey, // セッションキー
                    };
                    // html入力
                    setHtml(jsonObject);

                    // 0.5秒後に実行
                    setTimeout(function () {
                        // キャンセルフラグOFF
                        cancelFlag = 0;
                    }, 500);
                }
            });
        },

        // 再起動ボタンクリックメソッド
        clickReloadButton: function () {
            // クリック時
            this.on("click", function (e) {
                // フラグOFF
                if (cancelFlag == 0) {
                    // ダブルクリック禁止フラグ
                    cancelFlag = 1;
                    // テキストボックス有効化
                    $(".p-chat__input").css("pointer-events", "auto");

                    // 初期化
                    initializeApp();
                    // 最下部までスクロール
                    $("#chat_base").scrollTop(9999);

                    // 0.5秒後に実行
                    setTimeout(function () {
                        // キャンセルフラグOFF
                        cancelFlag = 0;
                    }, 500);
                }
            });
        },

        // ×ボタンクリックメソッド
        clickExitButton: function () {
            // クリック時
            this.on("click", function (e) {
                // フラグOFF
                if (cancelFlag == 0) {
                    // ダブルクリック禁止フラグ
                    cancelFlag = 1;
                    // iframe以外を表示
                    parent.postMessage("ack", "https://ebisu.love/");
                    // iframe以外を表示
                    parent.postMessage("ack", "https://www.ebisu.love/");
                    // 最下部までスクロール
                    $("#chat_base").scrollTop(9999);
                    // 0.5秒後に実行
                    setTimeout(function () {
                        // キャンセルフラグOFF
                        cancelFlag = 0;
                    }, 500);
                }
            });
        },

        // テキストボックスメソッド
        focusSendButton: function () {
            // フォーカス時
            this.on("focus", function (e) {
                // フラグOFF
                if (cancelFlag == 0) {
                    // ダブルクリック禁止フラグ
                    cancelFlag = 1;

                    // 最下部までスクロール
                    $("#chat_base").scrollTop(9999);
                    // 0.5秒後に実行
                    setTimeout(function () {
                        // キャンセルフラグOFF
                        cancelFlag = 0;
                    }, 500);
                }
            });
        },
    };

    // メソッド適用関数
    $.fn.tcChatBot = function (method) {
        // 対象メソッド存在
        if (methods[method]) {
            // メソッド全部を適用
            return methods[method].apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );

            // メソッドがオブジェクトかnull
        } else if (typeof method === "object" || !method) {
            // 初期値返し
            return methods.init.apply(this, arguments);

            // それ以外はエラー
        } else {
            $.error("Method " + method + " does not exist on jQuery.tcChatBot");
        }
    };

    // 親からのメッセージ受信
    window.addEventListener("message", function (_) {
        // シナリオID加算
        globalScenarioId++;
        // 500msウェイト
        sleep(500);
        // テキストボックス有効化
        $(".p-chat__input").css("pointer-events", "auto");

        // 初期化
        initializeApp();
    });

    // ■ 汎用関数
    // * 名称： ajaxアクセス用関数
    // * 引数： url-送信先URL json-送信JSONオブジェクト
    // * 返り値： 実行結果
    const ajaxAccess = function (url, json) {
        // 同期処理用
        const defer = $.Deferred();

        // ajaxアクセス
        $.ajax(globalUpdateServerUrl + "/" + url, {
            type: "post", // POST
            data: json, // 送付データ
            dataType: "json", // JSON
            cache: false, // キャッシュなし
            async: true, // 非同期
        })

            // 完了
            .done(function (data) {
                defer.resolve(data);
            })

            // エラー
            .fail(function () {
                window.alert("正しい結果を得られませんでした。");
            });

        // 実行結果を戻す
        return defer.promise();
    };

    // * 名称： 初期化関数
    // * 返り値： 実行結果
    const initializeApp = function () {
        // ajaxアクセス（初期化）
        ajaxAccess("getinitjson", { id: 1 }).done(function (data) {
            // 受信データのパース
            const receivedInitData = JSON.parse(data);
            // 認証キーを保存
            globalAuthenticationKey = receivedInitData.authkey;
            // 現在のタグを保存
            globalMsgTag = receivedInitData.tag;
            // 現在の次のフローIDを保存
            globalNextFlowId = receivedInitData.flowId;
            // セッションIDを保存
            globalSessionKey = receivedInitData.session;
            // 最下部までスクロール
            $("#chat_base").scrollTop(9999);

            // メソッド初期化
            updateMethods();

            // 初期メッセージ受信
            methods.sendNextMessage(globalMsgTag, globalNextFlowId);
        });
    };

    // * 名称： メッセージセット関数
    // * 引数： data-代入オブジェクト
    const setHtml = function (jsonObj) {
        // タグ避難
        const tmpMsgTag = globalMsgTag;
        // タグ初期化
        globalMsgTag = "";
        // ポインタ有効化
        $(".p-chat__input").css("pointer-events", "auto");
        // 全DOM
        const allChatboxDom = $("#owner_content *");

        // サーバ送信
        ajaxAccess("getjson", jsonObj).done(function (json) {
            // 認証キーチェック
            if (globalAuthenticationKey == json.authkey) {
                // エラーの時
                if (json.error != "") {
                    // 前のメッセージ受信
                    methods.sendNextMessage(tmpMsgTag, globalNextFlowId--);
                } else {
                    // セッション維持
                    globalSessionKey = json.usrkey;
                    // シナリオID
                    globalScenarioId = json.scenarioId;
                    // データ本体
                    receivedJsonData = json.dataList;
                    // フローID
                    globalFlowId = receivedJsonData.flowId;
                    // タグ
                    globalMsgTag = receivedJsonData.tag;
                    // 次のフローID
                    globalNextFlowId = receivedJsonData.nextFlowId;

                    globalScenarioId++;

                    // 住所のとき
                    if (globalMsgTag == "address") {
                        // チャット入力可能
                        $(".p-chat__input--shape").text(
                            receivedJsonData.answerString
                        );
                    }

                    // 回答タイプがあれば
                    if (receivedJsonData.answerType) {
                        // 回答タイプで分岐
                        switch (receivedJsonData.answerType) {
                            // 回答タイプ：単一選択
                            case globalSelectAnswerType:
                                // 回答リストが10個以上
                                if (receivedJsonData.answerList.length > 9) {
                                    // htmlの差し込み（セレクトボックス）
                                    $("#chat_base").append(
                                        setJson(
                                            globalSelectCode,
                                            receivedJsonData
                                        )
                                    );

                                    // 回答リストが10個未満
                                } else {
                                    // htmlの差し込み（オプションリスト）
                                    $("#chat_base").append(
                                        setJson(
                                            globalRadioCode,
                                            receivedJsonData
                                        )
                                    );
                                }
                                // ポインタ無効化
                                $(".p-chat__input").css(
                                    "pointer-events",
                                    "none"
                                );
                                break;

                            // 回答タイプ：メッセージ
                            case globalMessageAnswerType:
                                // htmlの差し込み（通常メッセージ）
                                $("#chat_base").append(
                                    setJson(globalGeneralCode, receivedJsonData)
                                );
                                // テキストボックス有効化
                                $(".p-chat__input").css(
                                    "pointer-events",
                                    "auto"
                                );
                                break;

                            // 回答タイプ：なし
                            case globalNoAnswerType:
                                // htmlの差し込み（通常メッセージ）
                                $("#chat_base").append(
                                    setJson(globalGeneralCode, receivedJsonData)
                                );
                                // 次のメッセージ受信
                                methods.sendNextMessage(
                                    globalMsgTag,
                                    globalNextFlowId
                                );
                                break;

                            // 回答タイプ：テンプレート
                            case globalTemplateAnswerType:
                                // htmlの差し込み（テンプレート画像）
                                $("#chat_base").append(
                                    setJson(
                                        globalTemplateCode,
                                        receivedJsonData
                                    )
                                );
                                // ポインタ無効化
                                $(".p-chat__input").css(
                                    "pointer-events",
                                    "none"
                                );
                                // 1000msウェイト
                                sleep(1000);
                                break;

                            // 回答タイプ：完了
                            case globalCompleteAnswerType:
                                // 転送
                                window.open(json.dataList.url, "_parent");
                                break;

                            // それ以外
                            default:
                                console.log("out of answerType, break");
                                break;
                        }
                    }

                    // 最下部までスクロール
                    $("#chat_base").scrollTop(9999);

                    // 1000msウェイト
                    sleep(1000);
                    // メソッド初期化
                    updateMethods();
                    // 全要素無効化
                    allChatboxDom.not().prop("disabled", true);
                    // キャンセル初期化
                    cancelFlag = 0;
                }
            } else {
                // 認証エラー
                console.log("Authentication Error");
            }
        });
    };

    // * 名称： jsonセット関数
    // * 引数： mode- モード番号, json-代入オブジェクト
    // * 返り値： セット後html文字列
    const setJson = function (mode, json) {
        // 除外ID
        const removeIdArray = ["1", "14", "15", "16", "24", "31", "33"];
        // 最新メッセージを格納
        globalNewMessage = json.message;

        // 管理者メッセージ
        const generalTags = `<div id='owner_content'><div class='p-chat__message'><div class='p-chat__message--position'><div class='p-chat__message-header'><div class='p-chat__message-header-wrapper'><div class='p-chat__message-header-avater'><div src='#.jpg' class='p-chat__message-header-avater--size'></div></div></div></div><div class='p-chat__message-wrapper bg-white c-green bd-gray'><div class='p-chat__message-wrapper--border'><div class='p-chat__message-wrapper--padding'><div class='p-chat__message-wrapper--wrap'>`;
        // ユーザメッセージ
        const userTags = `<div id='user_content'><div class='p-chat__message-user'><div class='p-chat__message--position'><div class='p-chat__message-header'><div class='p-chat__message-header-wrapper'><div class='p-chat__message-header-avater'><div src='#.jpg' class='p-chat__message-header-avater--user-size'></div></div></div><div class='p-chat__message-header-name'><small class='p-chat__message-header-name-txt c-blue'><strong>${globalUserName}</strong></small></div></div><div class='p-chat__message-wrapper bg-white c-green bd-gray'><div class='p-chat__message-wrapper--border'><div class='p-chat__message-wrapper--padding'><div class='p-chat__message-wrapper--wrap'>`;

        // モードにより分岐
        switch (mode) {
            // 通常メッセージ
            case globalGeneralCode:
                // テンプレート作成
                const ownerPlaneTemplate = `${generalTags}<div aria-label='エージェントメッセージ：'>${json.message}</div></div></div></div></div></div></div></div>`;
                return ownerPlaneTemplate;

            // ラジオボタンメッセージ
            case globalRadioCode:
                // テンプレート作成
                const ownerRadioTemplate1 = `${generalTags}<div aria-label='エージェントメッセージ：'><div>${json.message}</div></div></div></div></div> <div class='p-chat__message-optionlist'><div class='p-chat__message-optionlist-wrapper bg-lightgray'><group class='inline-radio p-chat__message-optionlist-option'>`;
                // ラジオボタン生成
                let ownerRadioTemplate2 = "";
                json.answerList.forEach(function (asw, index) {
                    ownerRadioTemplate2 += `<div><input type='radio' name='radio${globalScenarioId}' value='${index}'><label>${asw.answerText}</label></div>`;
                });
                ownerRadioTemplate2 += `</group></div></div></div></div>`;
                return ownerRadioTemplate1 + ownerRadioTemplate2;

            // 選択リストメッセージ
            case globalSelectCode:
                // テンプレート作成
                const ownerSelectTemplate1 = `${generalTags}<div aria-label='エージェントメッセージ：'><div>${json.message}</div></div></div></div></div><div class='p-chat__message-selectbox'><div class='p-chat__message-selectbox-wrapper bg-lightgray'><select name ='select${globalScenarioId}' class='p-chat__message-selectbox-select'>`;
                // 選択リスト生成
                let ownerSelectTemplate2 = "";
                // 一時テキスト
                let tmpAnswerText = "";
                json.answerList.forEach(function (asw) {
                    if (asw.answerText.indexOf(":") != -1) {
                        tmpAnswerText = asw.answerText.split(":")[1];
                    } else {
                        tmpAnswerText = asw.answerText;
                    }
                    ownerSelectTemplate2 += `<option value='${asw.answerId}'>${tmpAnswerText}</option>`;
                });
                ownerSelectTemplate2 += `</select></div><div class='p-chat__message-footer'><button class='p-chat__message-select-button p-chat__message-footer-button c-yellow bg-white bd-yellow'><div>完了</div></button></div></div></div></div></div></div>`;
                return ownerSelectTemplate1 + ownerSelectTemplate2;

            // ユーザメッセージ
            case globalUserMessageCode:
                // テンプレート作成
                const visitorPlaneTemplate = `${userTags}<div aria-label='クライアントメッセージ：'>${json}</div></div></div></div></div></div></div></div>`;
                return visitorPlaneTemplate;

            // テンプレートメッセージ
            case globalTemplateCode:
                // テンプレート作成
                const ownerImageTemplate1 = `${generalTags}<div aria-label='エージェントメッセージ：'><div>${json.message}</div></div></div></div></div> <div class='p-chat__message-optionlist'><div class='p-chat__message-optionlist-wrapper bg-lightgray'><group class='image-inline-radio p-chat__message-optionlist-option'>`;
                // 画像ボタン生成
                let ownerImageTemplate2 = "";
                // テンプレートループ
                json.imageList.forEach(function (asw) {
                    // 前に戻る
                    if (removeIdArray.indexOf(asw.imageId) == -1) {
                        if (asw.imageId != "999") {
                            ownerImageTemplate2 += `<div><input type='radio' name='radio${globalScenarioId}' value='${asw.answerId}'><label><img src='img/label/${asw.imageUrl}' alt='${asw.imageName}'></label></div>`;
                        } else {
                            ownerImageTemplate2 += `<div><input type='radio' name='radio${globalScenarioId}' value='back'><label class='disable'>${asw.answerText}</label></div>`;
                        }
                    }
                });
                ownerImageTemplate2 += `</group></div></div></div></div>`;
                return ownerImageTemplate1 + ownerImageTemplate2;

            // デフォルト
            default:
                console.log("out of mode, break");
                break;
        }
    };

    // * 名称： メソッド発火用関数
    const updateMethods = function () {
        // キークリック時
        $(".p-chat__input--shape").keypress(function (e) {
            // エンターのとき自動送信
            if (e.which == 13) {
                e.preventDefault();
                // クリック処理
                $(".p-chat__input-send-button").click();
            }
        });
        // 各メソッド発火
        $(".p-chat__input-send-button").tcChatBot("clickSendButton");
        $(".p-chat__message-optionlist-option div").tcChatBot("radioOptions");
        $(".p-chat__message-select-button").tcChatBot("selectOptions");
        $(".p-chat__header-exit").tcChatBot("clickExitButton");
        $(".p-chat__header-reload").tcChatBot("clickReloadButton");
        $(".p-chat__header-button--shape").tcChatBot("clickExitButton");

        // スマホの場合
        if (globalAgentFlg < 3) {
            $(".p-chat__input--shape").tcChatBot("focusSendButton");
        }
    };

    // * 名称： スリープ関数
    const sleep = function (waitMsec) {
        // 現在日時
        const startMsec = new Date();

        // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
        while (new Date() - startMsec < waitMsec);
    };

    // * 名称： 郵便番号取得関数
    // 郵便番号取得リクエスト
    const getZipCode = function (input) {
        const defer = new $.Deferred();
        // 郵便番号検索
        ZA.request(input, function (data, err) {
            // エラーがあったか見つからない
            if (err) {
                // エラー
                defer.reject("error");
            } else {
                // 結果を返す
                defer.resolve(data.fullAddress);
            }
        });
        // 結果を返す
        return defer.promise();
    };

    // * 名称： 通常処理関数
    // 通常処理
    const normalFunction = function (inputValue) {
        // サーバ送付用データ
        const jsonObject = {
            key: globalAuthenticationKey, // 認証キー
            tag: globalMsgTag, // 会話タグ
            scenarioId: globalScenarioId, // シナリオID
            flowId: globalNextFlowId, // 次のフローID
            message: inputValue, // メッセージ
            session: globalSessionKey, // セッションキー
        };
        // html入力
        setHtml(jsonObject);
        // 最下部までスクロール
        $("#chat_base").scrollTop(9999);
    };

    // * 名称： エラー処理関数
    // エラー処理
    const errFunction = function (errMsg) {
        // シナリオID
        globalScenarioId--;
        // メッセージ
        alert(errMsg);

        // 一時データ
        const receivedJsonData = {
            flowId: globalFlowId, // フローID
            tag: globalMsgTag, // 会話タグ
            message: globalNewMessage, // メッセージ
            answerType: "2", // 回答タイプ
            nextFlowId: globalNextFlowId, // 次のフローID
        };

        // テキストボックス有効化
        $(".p-chat__input").css("pointer-events", "auto");
        // htmlの差し込み（オプションリスト）
        $("#chat_base").append(setJson(globalGeneralCode, receivedJsonData));
        // メソッド初期化
        updateMethods();
        // 最下部までスクロール
        $("#chat_base").scrollTop(9999);
    };
})(window.jQuery);
