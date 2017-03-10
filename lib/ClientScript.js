define(['jquery', paths['common-strings'], paths['SettingsConsumer-strings']], function ($, commonstrings, setingconsumeratrings) {
    String.format = function () {
        var str = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            str = str.replace(reg, arguments[i + 1]);
        }

        return str;
    }

    $.cookie = function (name, value, options) {
        if (typeof value != 'undefined') { // name and value given, set cookie
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            var path = options.path ? '; path=' + options.path : '';
            var domain = options.domain ? '; domain=' + options.domain : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    };

    $.ajaxSetup({ timeout: 180000, cache: false });

    $(window).on("error", function (err) {
        if ($('#modal-loading').css('display') == 'block') {
            clientScript.hideLoading();
        }
        var error = err.originalEvent.error,
            activeElement;
        if (document.activeElement) {
            activeElement = document.activeElement;
            //The default activeElement is body, it too large for the outerHTML of body. So it's only a string 'body'.
            activeElement = activeElement.tagName === "BODY" ? "body" : activeElement.outerHTML;
        }
        clientScript.logException("Active Element: " + activeElement + "\n" +
            "Error Stack: " + error.stack + "\n" + "Active URL: " + location.href);
        return true;
    }).ajaxError(function (e) {
        var target = e.target,
            activeElement = target.activeElement,
            activeURL = target.documentURI;
        //The default activeElement is body, it too large for the outerHTML of body. So it's only a string 'body'.
        activeElement = activeElement.tagName === "BODY" ? "body" : activeElement.outerHTML;
        clientScript.logException("Error Type:" + e.type + "\n" + "Active Element: " + activeElement + "\n" +
            "Active URL: " + activeURL);
    });
    //If there only one input element in form element. The form will submit when click enter key.
    $('body').on('submit.prevent', 'form', function () {
        return false;
    });

    $('body').on('click.tab', '[data-tab] a[href*=#]', function () {
        var element = $(this);
        var elementParent = element.parent('dd');
        elementParent.prevAll().removeClass('active');
        elementParent.nextAll().removeClass('active');
        elementParent.addClass('active');

        var contentElement = $(element.attr('href'));
        contentElement.nextAll().removeClass('active');
        contentElement.prevAll().removeClass('active');
        contentElement.addClass('active');
        return false;
    });

    $.fn.isValid = function () {
        var $element = this instanceof jQuery ? this : $(this);
        if (!$element.is(':visible')) {
            // The element is not visiable.
            return true;
        }
        else {
            if ($element.parent().hasClass("error") || $element.next().hasClass("error-msg")) {
                return false;
            }
            else {
                return true;
            }
        }
    };

    Date.prototype.pattern = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
            "H+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    Date.prototype.timeZoneOffSet = function () {
        var offSet = this.getTimezoneOffset() / 60;
        var offSetMin = offSet - Math.floor(offSet);

        return (offSet < 0 ? " +" : " -") + Math.floor(Math.abs(offSet)) + (offSetMin > 0 ? ":" + offSetMin * 60 : "");
    }

    var clientScript = {
        IFrameTokenServiceUrl: "",
        PaymentProvider: {EPayments:1, GoToBilling: 2},
        TransactionType: { All: 0, MoneyTransferToCard: 1, BillPayChiocePay: 2, BillPayStandard: 5, BillPay: 11, TopUp: 12, EPin: 13, MoneyTransferToCash: 14, CheckCashing: 17, PrepaidDebit: 18 },
        PaymentMethodType: { CreditCard: 1, DebitCard: 2, Checking: 3, Savings: 4 },
        BankAccountTypeEnum: {InternationalChecking: 1, MoneyMarket: 2, NotUsed: 3, RegularChecking: 4, Savings: 5, AccountNumber: 6, CardNumber: 7},
        PaymentType: {AccountDeposit: 1, Cash: 2, CashToAgent: 3, HomeDelivery: 4, UnidosCard: 5, CashToBranch: 6, CardNumberDeposit: 7},
        sortByDate: function (a, b, isAscending, c, d) {
            if (a.length == 0) {
                a = "0/1/1970";
            }
            if (b.length == 0) {
                b = "0/1/1970";
            }

            var aDate = new Date(a);
            var bDate = new Date(b);

            if (isAscending) {
                return aDate.getTime() > bDate.getTime() ? 1 : aDate.getTime() == bDate.getTime() ? c > d ? 1 : 0 : -1;
            } else {
                return aDate.getTime() > bDate.getTime() ? aDate.getTime() == bDate.getTime() ? c < d ? 1 : 0 : -1 : 1;
            }
        },
        sortByString: function (a, b, isAscending, c, d) {
            a = a == null ? "" : a.toLowerCase();
            b = b == null ? "" : b.toLowerCase();

            if (isAscending) {
                return a > b ? 1 : a == b ? c > d ? 1 : 0 : -1;
            } else {
                return b > a ? 1 : a == b ? d > c ? 1 : 0 : -1;
            }
        },
        sortByNumber: function (a, b, isAscending, c, d) {
            a = (a.length > 0) ? a.replace(",", "") : Number.MAX_VALUE;
            b = (b.length > 0) ? b.replace(",", "") : Number.MAX_VALUE;

            a = isNaN(a) ? 0 : parseFloat(a);
            b = isNaN(b) ? 0 : parseFloat(b);
            if (isAscending) {
                return a > b ? 1 : a == b ? c > d ? 1 : 0 : -1;
            } else {
                return a > b ? a == b ? c < d ? 1 : 0 : -1 : 1;
            }
        },
        count: 0,
        //Customer
        handleAjaxError: function (errorObj) {
            try {
                var tempError = $.parseJSON(errorObj);

                if ((tempError.Priority != null && tempError.Priority == 1) || clientScript.isSpecialError(tempError.Message)) {// error message is html not json.
                    try {
                        if (require('app')) {
                            ModelSessionTimeOut$RevealAndLogout();
                        }
                    } catch (e) {
                        clientScript.showError(tempError);
                    }
                }
                else {
                    clientScript.showError(tempError);
                }
            } catch (e) {
            }
        },
        isSpecialError: function (errorMessage) {
            return errorMessage.indexOf("Unauthorized. Please contact Unidos Support for further assistance.") != -1 ||
              errorMessage.indexOf("Your token has been expired") != -1 ||
              errorMessage.indexOf("You do not have permission to access Unidos.REST") != -1 ||
              errorMessage.indexOf("The device validation code does not match") != -1 ||
              errorMessage.indexOf("The selfservice account is not active") != -1 ||
              errorMessage.indexOf("Client found response content type of 'text/html; charset=utf-8', but expected 'text/xml'.") != -1;// error message is html not json.
        },
        isCancelCloseModalCallBack: false,
        showError: function (errorObj, callback) {
            var openPrevious = clientScript.isOpenPrevious();
            $("#ErrorOk").html(commonstrings.buttons.ok);
            $("#ErrorOk").off("click");
            $("#ErrorOk").one("click", function () {
                if (typeof callback === 'function') {
                    callback();
                } else {
                    clientScript.closeModal(openPrevious);
                }
            });

            try{
                var errorObject = $.parseJSON(errorObj.Message);
                errorObj.Message = errorObject.reason;
            } catch (e) {
            }

            $("#ErrorCaption").html(errorObj.Caption);
            $("#ErrorMessage").html(errorObj.Message);

            if (!clientScript.IsIOS()) {
                $("#modal-error").data('css-top', $(window).scrollTop() > 100 ? 100 - $(window).scrollTop() : 100);
                $("#modal-error").data('offset', $(window).scrollTop());
                $("#modal-error").css("position", "Fixed");
            }

            clientScript.isCancelCloseModalCallBack = openPrevious;
            return $.when(clientScript.openModal("modal-error"))
            .done(function () {
                var element = document.activeElement;
                if (clientScript.IsIOS()) {
                    setTimeout(function () {
                        $('.reveal-modal-bg').addClass('position-reveal-modal-bg');
                    });
                }

                clientScript.isCancelCloseModalCallBack = false;

                setTimeout(function () {
                    if (element != null) {
                        element.blur();
                    }
                }, 70);
            });
        },
        showFistLevelError: function (errorObj, callback) {
            var openPrevious = clientScript.isOpenPrevious();
            $("#ErrorOkLevelFirst").off("click");
            $("#ErrorOkLevelFirst").one("click", function () {
                if (typeof callback === 'function') {
                    callback();
                } else {
                    clientScript.closeModal(openPrevious);
                }
            });

            $("#ErrorCaptionLevelFirst").html(errorObj.Caption);
            $("#ErrorMessageLevelFirst").html(errorObj.Message);

            $("#modal-error-level-first").data('css-top', $(window).scrollTop() > 100 ? 100 - $(window).scrollTop() : 100);
            $("#modal-error-level-first").data('offset', $(window).scrollTop());
            $("#modal-error-level-first").css("position", "Fixed");

            return clientScript.openModal("modal-error-level-first");
        },
        showErrorMessage: function (caption, message, callback) {
            return clientScript.showError({ Caption: caption, Message: message }, callback);
        },
        showContinue: function (errorObj, callback) {
            var deferred = clientScript.showError(errorObj, callback);
            $("#ErrorOk").html(commonstrings.buttons.continue);
            return deferred;
        },
        showContinueMessage: function (errorObj, callback) {
            return clientScript.showContinue({ Caption: caption, Message: message }, callback);
        },
        showCustomerCareMessage: function () {
            //Inline message
            clientScript.showError({ Caption: commonstrings.commonmessagebox.error, Message: commonstrings.clientscriptjsmessagebox.showcustomercaremessage });
        },
        showTransactionNotFoundError: function (message) {
            var errorObj = { Caption: commonstrings.commonmessagebox.error, Message: "" };
            if (typeof message === "string") {
                errorObj.Message = message;
            } else {
                errorObj.Message = message.Message;
            }
            clientScript.showError(errorObj, function () {
                location.replace("/SelfService/CustomerDashboard");
            });
        },
        isOpenPrevious: function () {
            var openPrevious = false;
            if ($("[data-reveal].open").length > 0) {
                var currentModalId = clientScript.modalStack[clientScript.modalStack.length - 1];
                openPrevious = ["#modal-loading", "#modal-session-timeout", "#modal-error", "#modal-error-level-first", "#modal-remove", "#modal-confirm"].indexOf(currentModalId) == -1;
            }

            return openPrevious;
        },
        isOpenPreviousByBankSpace: function () {
            var openPrevious = false;
            if ($("[data-reveal].open").length > 0) {
                var currentModalId = clientScript.modalStack[clientScript.modalStack.length - 1];
                openPrevious = ["#modal-update-additional-info", "#modal-add-additional-info"].indexOf(currentModalId) != -1;
            }

            return openPrevious;
        },
        showConfirm: function (confirmObj, okButtonCallback) {
            var openPrevious = clientScript.isOpenPrevious();

            $("#ConfirmOk").off("click");
            $("#ConfirmOk").html("<span class='button-text'>" + commonstrings.buttons.yesuppercase + "</span><span class='loading tiny light'></span></a>");
            $("#ConfirmCancel").html("<span class='button-text'>" + commonstrings.buttons.nouppercase + "</span><span class='loading tiny light'></span></a>");
            $("#ConfirmOk").one("click", function () {
                if (typeof okButtonCallback == "function") {
                    $("#ConfirmOk").addClass('now-loading');
                    $.when(okButtonCallback())
                    .done(function () {
                        $("#ConfirmOk").removeClass('now-loading');
                    })
                }
                else {
                    clientScript.closeModal(openPrevious);
                }
            });

            $("#ConfirmCancel").one("click", function () {
                clientScript.closeModal(openPrevious);
            });

            $("#ConfirmCaption").html(confirmObj.Caption);
            $("#ConfirmMessage").html(confirmObj.Message);
            return clientScript.openModal("modal-confirm", true);
        },
        showConfirmMessage: function (caption, message, callback) {
            clientScript.showConfirm({ Caption: caption, Message: message }, callback);
        },

        showNotification: function (notificationObj, callback) {
            var openPrevious = clientScript.isOpenPrevious();
            $('#NotificationHead').text(notificationObj.Caption);
            $('#NotificationMessage').text(notificationObj.Message);
            $('#NotificationConfirmOK').unbind('click');
            $('#NotificationConfirmOK').click(function () {
                if (typeof callback === 'function') {
                    callback();
                } else {
                    clientScript.closeModal(openPrevious);
                }
            });

            return clientScript.openModal("modal-notification");
        },
        getNotificationMessages: function (footnotes, dpvFootnotes, oldStreet, oldStreet2,
    oldCity, oldState, oldZipcode, newStreet, newStreet2, newCity, newState, newZipcode) {
            var validateMessages = "";

            var footnotesSource = {
                A: 'Corrected ZIP code', B: 'Fixed city/state spelling', C: 'Invalid city/state/zip',
                D: 'No ZIP+4 assigned', E: 'Same ZIP for multiple', F: 'Address not found', G: 'Firm data used',
                H: 'Missing secondary number', I: 'Insufficient data', J: 'Dual address', L: 'Address component was changed',
                LL: 'Flagged for LACS<sup>Link</sup>', M: 'Fixed street spelling', N: 'Fixed abbreviations',
                O: 'Multiple ZIP+4; lowest used', P: 'Better address exists', Q: 'Unique ZIP match', R: 'No match; EWS: Match soon',
                S: 'Bad secondary address', T: 'Magnet street syndrome', U: 'Unofficial PO name', V: 'Unverifiable city/state',
                W: 'Invalid delivery address', X: 'Unique ZIP default', Y: 'Military match', Z: 'Matched with ZIPMOVE'
            };

            if (dpvFootnotes == "ZZ") {
                //Inline message
                validateMessages += commonstrings.clientscriptjsmessagebox.addressnotmatchresults +
                "<li style = 'padding: 4px 6px'>" + commonstrings.clientscriptjsmessagebox.wrongprimarynumber + "</li>" +
                "<li style = 'padding: 4px 6px'>"+commonstrings.clientscriptjsmessagebox.cityandstate+"</li>" +
                "<li style = 'padding: 4px 6px'>" + commonstrings.clientscriptjsmessagebox.notenoughinput+"</li>" +
                commonstrings.clientscriptjsmessagebox.addressidentifiable;
            }
            else {
                var hasValidateAddress = false;
                var hasValidateAddress2 = false;

                if (footnotes != null) {
                    var notes = footnotes.split("#");
                    notes = notes.slice(0, notes.length - 1);
                    for (var i in notes) {
                        if (!clientScript.filter(notes[i])) {
                            validateMessages += "<li> " + footnotesSource[notes[i]] + "</li>";
                            if (notes[i] == "A") {
                                validateMessages += clientScript.valueChangedMessage(oldZipcode, newZipcode, commonstrings.clientscriptjsmessagebox.zipcode + ": ");
                            }
                            else if (notes[i] == "L" || notes[i] == "M" || notes[i] == "N" || notes[i] == "P") {
                                validateMessages += clientScript.valueChangedMessage(oldStreet, newStreet, commonstrings.clientscriptjsmessagebox.address + ": ");
                                hasValidateAddress = true;
                            }
                            else if (notes[i] == "J") {
                                validateMessages += clientScript.valueChangedMessage(oldStreet, newStreet, commonstrings.clientscriptjsmessagebox.address + ": ");
                                hasValidateAddress = true;
                                if (newStreet2 != null) {
                                    validateMessages += clientScript.valueChangedMessage(oldStreet2, newStreet2, commonstrings.clientscriptjsmessagebox.addres2 + ": ");
                                    hasValidateAddress2 = true;
                                }
                            }
                            else if (notes[i] == "U") {
                                validateMessages += clientScript.valueChangedMessage(oldCity, newCity, commonstrings.clientscriptjsmessagebox.city + ": ");
                            }
                            else if (notes[i] == "B" || notes[i] == "V") {
                                validateMessages += clientScript.valueChangedMessage(oldCity, newCity, commonstrings.clientscriptjsmessagebox.city + ": ");
                                validateMessages += clientScript.valueChangedMessage(oldState, newState, commonstrings.clientscriptjsmessagebox.state + ": ");
                            }
                            else if (notes[i] == "I" || notes[i] == "T") {
                                validateMessages += clientScript.valueChangedMessage(oldStreet, newStreet, commonstrings.clientscriptjsmessagebox.address + ": ");
                                hasValidateAddress = true;
                                if (newStreet2 != null) {
                                    validateMessages += clientScript.valueChangedMessage(oldStreet2, newStreet2, commonstrings.clientscriptjsmessagebox.addres2 + ": ");
                                    hasValidateAddress2 = true;
                                }
                                validateMessages += clientScript.valueChangedMessage(oldCity, newCity, commonstrings.clientscriptjsmessagebox.city + ": ");
                                validateMessages += clientScript.valueChangedMessage(oldState, newState, commonstrings.clientscriptjsmessagebox.state + ": ");
                                validateMessages += clientScript.valueChangedMessage(oldZipcode, newZipcode, commonstrings.clientscriptjsmessagebox.zipcode + ": ");
                            }
                        }
                    }
                }

                if (!hasValidateAddress) {
                    if (oldStreet != newStreet) {
                        validateMessages += "<li> " + commonstrings.clientscriptjsmessagebox.addresscomponentwaschanges + "</li>";
                        validateMessages += clientScript.valueChangedMessage(oldStreet, newStreet, commonstrings.clientscriptjsmessagebox.address + ": ");
                    }
                }
                if (!hasValidateAddress2) {
                    if (newStreet2 != null && newStreet2 != oldStreet2) {
                        validateMessages += "<li> " + commonstrings.clientscriptjsmessagebox.address2componentwaschanged + "</li>";
                        validateMessages += clientScript.valueChangedMessage(oldStreet2, newStreet2, commonstrings.clientscriptjsmessagebox.addres2 + ": ");
                    }
                }
            }

            return validateMessages;
        },
        valueChangedMessage: function (oldValue, newValue, valueType) {
            var validateMessage = "";

            if (newValue != oldValue) {
                validateMessage = "<p>" + valueType + oldValue + "->" + newValue + "</p>";
            }

            return validateMessage;
        },
        RemoveBorderAndMessage: function (addressList, errorMessageElement) {
            errorMessageElement.css("display", "none");
            errorMessageElement.html("");
            $.each(addressList, function (index, element) {
                $(element).off("input.smartystreetAddress")
                .on("input.smartystreetAddress", function () {
                    for (var i = 0; i < addressList.length; i++) {
                        $(addressList[i]).css("border", "");
                    }
                    errorMessageElement.css("display", "none");
                    errorMessageElement.html("");
                });

                //element.off("change.smartystreetAddress");
                //element.on("change.smartystreetAddress", function () {
                //    for (var i = 0; i < addressList.length; i++) {
                //        addressList[i].css("border", "");
                //    }
                //    errorMessageElement.css("display", "none");
                //    errorMessageElement.html("");
                //});
            });
        },
        filter: function (footnote) {
            var exsit = false;

            var filteredFootnotes = ["D", "E", "F", "G", "H", "K", "LL", "LI", "O", "Q", "R", "S", "W", "X", "Y", "Z"];
            for (var i in filteredFootnotes) {
                if (filteredFootnotes[i] == footnote) {
                    exsit = true;
                    break;
                }
            }

            return exsit;
        },
        //*************************************
        //Logger
        logData: function (logLevel, message, data) {
            var minLevel = $.cookie("LogMinLevel");
            if (minLevel != null && minLevel != "") {
                minLevel = parseInt($.cookie("LogMinLevel"));
            }
            else {
                minLevel = logLevel;
            }

            if (!(logLevel < minLevel)) {
                var ajaxUrl = "/logurl.jslog";

                var json = JSON.stringify({
                    level: logLevel,
                    msg: message,
                    data: JSON.stringify(data)
                });

                var xhr = new XMLHttpRequest();
                xhr.open('POST', ajaxUrl);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(json);
            }
        },
        logException: function (message, data) {
            clientScript.logData(5, message, data);
        },
        //*********************************************************************************
        //cascade foundation reveal modal
        modalStack: [],
        windowScrollTop: null,
        modalStackLength: 10,
        loadingCount: 0, // have opened loading modal count.  
        IBVStatus: { Normal: 0, AddingPrompt: 1, NoWork: 2, Verifying: 3 },
        setStyleForOpenModal: function (revealId) {
            if ($('body').width() > 640) {// if it is not mobile will add modalOpen style
                $("html").addClass('modalOpen');
                $('#wrapper').addClass('modalOpen');
                $(revealId).css("top", 200);
            }

            if (!clientScript.IsMobileDevice()) {
                $(revealId).css("position", "fixed");
            }
            //if (clientScript.IsIOS()) {
            //    $("body").addClass('modalOpen');
            //}

            $("body *").each(function (idx, element) {
                var $el = $(element),
                 tabIndex = parseInt($el.attr('tabindex'));
                if (!isNaN(tabIndex)) {
                    element._tabIndex = tabIndex;
                }
                $el.attr('tabindex', '-1');
            });

            $(revealId).removeAttr('tabindex')
            $(revealId).find("*").removeAttr('tabindex', '-1');
            $('.reveal-modal-bg').removeAttr('tabindex');
        },
        openModal: function (revealId, isUnfocused) {
            var element = document.activeElement;
            if (clientScript.modalStack[clientScript.modalStack.length - 1] == "#modal-error-level-first") {
                return;
            }

            var deferred = $.Deferred();
            setTimeout(function () {
                clientScript.ShowQuickButtonForMobile(false);

                require(['foundation.extended'], function () {
                    if (revealId.indexOf("#") == -1) {
                        revealId = "#" + revealId;
                    }

                    // Workarount to block transaction modal to open if cookie gonna disabled.
                    if (!clientScript.CheckEnabledCookie() && revealId != "#modal-error-level-first") {
                        return;
                    }

                    if ($("div[data-open]").length > 0) {
                        var modalId = "#" + $("[data-reveal].open").attr("id");
                        // supress multiple modal errors
                        if (modalId == revealId) {
                            return;
                        }
                    }

                    window.history.pushState({ time: new Date().getTime() }, '', '#modal');

                    clientScript.setStyleForOpenModal(revealId);

                    if (revealId == "#modal-loading") {
                        if (clientScript.loadingCount > 0) {// loading modal have been opened, so we don't need open it.
                            clientScript.loadingCount++;
                            return;
                        }
                    }

                    if ($("div[data-open]").length > 0) {
                        var modalId = $("[data-reveal].open").attr("id");
                        // For open modal which contains iframe.
                        if (clientScript.isIframeModal(modalId)) {
                            $("[data-reveal].open").removeAttr("data-open");
                            $("[data-reveal].open").css("visibility", "hidden");
                            $("[data-reveal].open").removeClass("open");
                            $.when(clientScript.openModal(revealId, isUnfocused))
                            .done(function () {
                                deferred.resolve();
                            });
                        }
                        else {
                            $.when(clientScript.closeModal())
                            .done(function () {
                                $.when(clientScript.openModal(revealId, isUnfocused))
                                .done(function () {
                                    deferred.resolve();
                                });
                            });
                        }
                    }
                    else {
                        if (revealId == "#modal-loading") {
                            clientScript.loadingCount = 1;
                        }
                        if (clientScript.windowScrollTop == null) {// record window scroll value, and restore it when close modal
                            clientScript.windowScrollTop = window.scrollY;
                        }
             
                        if ($('body').width() <= 640) {//Modal in mobile should scroll to top
                            clientScript.SlideToTop();
                        }
                        $(revealId).one('opened.current', function () {
                            $('html').addClass('not-show-div');
                            deferred.resolve();
                        });
                        $(revealId).attr("data-open", "true").foundation('reveal', 'open');


                        clientScript.modalStack.push(revealId);
                        if (clientScript.modalStack.length > clientScript.modalStackLength) {
                            clientScript.modalStack.shift();
                        }
                    }

                    switch (revealId) {
                        case "#modal-loading":
                        case "#modal-session-timeout":
                        case "#modal-error":
                            if (isUnfocused == undefined) {
                                isUnfocused = true;
                            }
                            break;
                    }
                    if ($('body').hasClass('open') && $('body').hasClass('disable-overflow-x')) {
                        $(revealId).addClass('over-flag');
                        clientScript.RemoveOpen();
                    }
                    if (clientScript.IsIOS()) {
                        //ModifyModalSize();
                        setTimeout(function () {
                            if (element != null) {
                                element.blur();
                            }
                        }, 70);
                    }
                });
            });
            return deferred;
        },
        closeModal: function (openPrevious) {
            var deferred = $.Deferred();
            setTimeout(function () {
                require(['foundation.extended'], function () {
                    clientScript.ShowQuickButtonForMobile(true);

                    var modal = $("[data-reveal].open");
                    $("html").removeClass('modalOpen');
                    $('#wrapper').removeClass('modalOpen');
                    if (clientScript.IsIOS()) {
                        $("body").removeClass('modalOpen');
                    }
                    $("body *").each(function (idx, element) {
                        $(element).removeAttr('tabindex');
                    });

                    if (modal.attr("id") == "modal-loading") {
                        if (clientScript.loadingCount > 1) {// It isn't the last close loading modal, so we don't need close it.
                            clientScript.loadingCount--;
                            return;
                        }

                        clientScript.loadingCount = 0;
                    }

                    if (openPrevious == true) {
                        modal.one('closed.close.modal', function () {
                            setTimeout(function () {
                                clientScript.setStyleForOpenModal(clientScript.modalStack[clientScript.modalStack.length - 1]);
                                var modalId = $(clientScript.modalStack[clientScript.modalStack.length - 1]).attr("id");
                                // For close modal which contains iframe.
                                if (clientScript.isIframeModal(modalId)) {
                                    $(clientScript.modalStack[clientScript.modalStack.length - 1]).attr("data-open", "true");
                                    $(clientScript.modalStack[clientScript.modalStack.length - 1]).css("visibility", "visible");
                                    $(clientScript.modalStack[clientScript.modalStack.length - 1]).addClass("open");
                                    $(".reveal-modal-bg").show();
                                }
                                else {
                                    $(clientScript.modalStack[clientScript.modalStack.length - 1]).attr("data-open", "true").foundation('reveal', 'open');
                                }

                                deferred.resolve();
                            });
                        });
                        clientScript.modalStack.pop();
                        modal.removeAttr("data-open").foundation('reveal', 'close');
                    } else {
                        modal.one('closed.close.modal', function () {
                            deferred.resolve();

                            if (typeof clientScript.windowScrollTop === 'number') {
                                scrollTo(0, clientScript.windowScrollTop);
                                clientScript.windowScrollTop = null;
                            }
                        });

                        $('html').removeClass('not-show-div');
                        modal.removeAttr("data-open").foundation('reveal', 'close');
                        if (modal.attr("id") == "modal-error-level-first") {
                            clientScript.modalStack.pop();
                        }
                    }
                    if (modal.hasClass('over-flag')) {
                        modal.removeClass('over-flag');
                        clientScript.disableOverFlow();
                    }
                    $('.reveal-modal-bg').removeClass('position-reveal-modal-bg');
                });
            });

            return deferred;
        },
        isOpeningModal: function (revealId) {
            var id = "[data-reveal].open";
            if (revealId) {
                if (revealId.indexOf("#") != 0) {
                    revealId = "#" + revealId;
                }

                id = revealId + id;
            }

            return $(id).length > 0;
        },
        //*********************************************************************************
        // City look up
        setCityValidateType: function (cityValidate, autocompleteElement, cities) {
            if (!cities) {
                if (autocompleteElement.val() == "") {
                    cityValidate(1);
                } else {
                    cityValidate(2);
                }
                return [false, 1];
            }
            var isValid = false;
            var matchedCityId = -1;
            if (autocompleteElement.val() == "") {
                cityValidate(1);
            }
            else {
                var inputValue = clientScript.removeDiacritics(autocompleteElement.val()).toLowerCase();
                for (var j = 0; j < cities.length; j++) {
                    if (clientScript.removeDiacritics(cities[j].value).toLowerCase() == inputValue) {
                        autocompleteElement.val(cities[j].value);
                        matchedCityId = cities[j].data.Value;
                        isValid = true;
                        break;
                    }
                }
                if (!isValid) {
                    cityValidate(2);
                }
                else {
                    cityValidate(0);
                }
            }

            return [isValid, matchedCityId];
        },
        removeDiacritics: function (s) {
            var diacritics = [
            [/[\300-\306]/g, 'A'],
            [/[\340-\346]/g, 'a'],
            [/[\310-\313]/g, 'E'],
            [/[\350-\353]/g, 'e'],
            [/[\314-\317]/g, 'I'],
            [/[\354-\357]/g, 'i'],
            [/[\322-\330]/g, 'O'],
            [/[\362-\370]/g, 'o'],
            [/[\331-\334]/g, 'U'],
            [/[\371-\374]/g, 'u'],
            [/[\321]/g, 'N'],
            [/[\361]/g, 'n'],
            [/[\307]/g, 'C'],
            [/[\347]/g, 'c'],
            ];
            for (var i = 0; i < diacritics.length; i++) {
                s = s.replace(diacritics[i][0], diacritics[i][1]);
            }
            return s;
        },
        getValue: function (value) {
            return typeof value === 'function' ? value() : value;
        },
        compare: function (sortType, serviceType, isAscending, secondSortType) {
            var sortPattern;

            switch (sortType) {
                case "default":
                case "sortby":
                    sortPattern = function (a, b) {
                        return 0;
                    };
                    break;
                case "Date":
                case "LastTransactionDate":
                case "TransactionDateCreated":
                case "InquiryLastUpdated":
                    sortPattern = function (a, b) {
                        if (secondSortType == null || secondSortType == undefined) {
                            return clientScript.sortByDate(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending);
                        }
                        else {
                            return clientScript.sortByDate(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending, clientScript.getValue(a[secondSortType]), clientScript.getValue(b[secondSortType]));
                        }
                    };
                    break;
                case "Rate":
                case "ReceiptNumber":
                    sortPattern = function (a, b) {
                        if (secondSortType == null || secondSortType == undefined) {
                            return sortByString(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending);
                        }
                        else {
                            return clientScript.sortByNumber(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending, clientScript.getValue(a[secondSortType]), clientScript.getValue(b[secondSortType]));
                        }
                    };
                    break;
                case "TotalFunds":
                case "LastTransactionAmount":
                    sortPattern = function (a, b) {
                        if (secondSortType == null || secondSortType == undefined) {
                            return clientScript.sortByString(clientScript.getValue(a[sortType].Value), clientScript.getValue(b[sortType].Value), isAscending);
                        }
                        else {
                            return clientScript.sortByNumber(clientScript.getValue(a[sortType].Value), clientScript.getValue(b[sortType].Value), isAscending, clientScript.getValue(a[secondSortType]), clientScript.getValue(b[secondSortType]));
                        }
                    };
                    break;
                case "AccountName":
                case "DisplayAccountNumber":
                    sortPattern = function (a, b) {
                        if (secondSortType == null || secondSortType == undefined) {
                            if (serviceType == "TopUp") {
                                return clientScript.sortByString(clientScript.getValue(a.CarrierBasic[sortType]), clientScript.getValue(b.CarrierBasic[sortType]), isAscending);
                            }
                            else {
                                return clientScript.sortByString(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending);
                            }
                        }
                        else {
                            if (serviceType == "TopUp") {
                                return clientScript.sortByString(clientScript.getValue(a.CarrierBasic[sortType]), clientScript.getValue(b.CarrierBasic[sortType]), isAscending, clientScript.getValue(a.CarrierBasic[secondSortType]), clientScript.getValue(b.CarrierBasic[secondSortType]));
                            }
                            else {
                                return clientScript.sortByString(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending, clientScript.getValue(a[secondSortType]), clientScript.getValue(b[secondSortType]));
                            }
                        }
                    };
                    break;
                default:
                    sortPattern = function (a, b) {
                        if (secondSortType == null || secondSortType == undefined) {
                            return clientScript.sortByString(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending);
                        }
                        else {
                            return clientScript.sortByString(clientScript.getValue(a[sortType]), clientScript.getValue(b[sortType]), isAscending, clientScript.getValue(a[secondSortType]), clientScript.getValue(b[secondSortType]));
                        }
                    };
                    break;
            }

            return sortPattern;
        },
        isAmountValid: function (value) {
            if (!value) {
                return false;
            }

            if (typeof (value) == "string") {
                value = value.replace(/,/g, "");
                return !isNaN(value) && value.trim() != '' && parseFloat(value) > 0;
            } else {
                return value > 0;
            }
        },
        LimitNumber: function (element, isSend, originalAmount, rate) {

            amount = $(element).val().replace(/[^\d\.\,]/g, "");

            if (clientScript.IsMobileDevice()) {
                var selectionEnd = $(element).val().length - $(element)[0].selectionEnd;

                originalAmount = clientScript.getFormatFloat(originalAmount);

                //if changedChar is only one letter,judge if is "," and "." ;
                if (originalAmount != null && amount.length == (originalAmount.length - 1)) {
                    var end = $(element)[0].selectionEnd;
                    var start = $(element)[0].selectionStart;
                    var changedChar = originalAmount.substring(start, end + 1);
                    if (changedChar == "," || changedChar == ".") {
                        amount = originalAmount.substring(0, start - 1) + originalAmount.substring(start, originalAmount.length);
                    }
                }

                amountValue = amount;

                //Dynamic change maximum length
                if (amount != "") {
                    amount = (parseInt(amount.toString().replace(/[^0-9]*/g, '')) * 0.01).toFixed(2);
                } else {
                    amount = 0;
                    amount = amount.toFixed(2);
                }

                var start = $(element)[0].selectionEnd;
                //distinguish Several digits between before and after
                if (isSend) {
                    //according to the cursor position,decide where to delete
                    for (var i = amountValue.length; i > 0; i--) {
                        DispensedAmount = (1.0 * amount * rate).toFixed(2);
                        if (/^\d{0,7}?\.?\d{0,2}$/.test(DispensedAmount) && /^\d{0,5}?\.?\d{0,2}$/.test(parseFloat(amount).toFixed(2))) {
                            $(element).val(amount.replace(/(\d{1,3})(?=(?:\d{3})+\.)/g, '$1,'));
                            break;
                        } else {
                            amountValue = amountValue.substring(0, start - 1) + amountValue.substring(start, amountValue.length);
                            amount = amountValue.replace(/\,/g, "");
                            start = start - 1;
                        }
                    }
                } else {
                    for (var i = amountValue.length; i > 0; i--) {
                        SendAmount = (1.0 * amount / rate).toFixed(2);
                        if (/^\d{0,5}?\.?\d{0,2}$/.test(SendAmount) && /^\d{0,7}?\.?\d{0,2}$/.test(parseFloat(amount).toFixed(2))) {
                            $(element).val(amount.replace(/(\d{1,3})(?=(?:\d{3})+\.)/g, '$1,'));
                            break;
                        } else {
                            amountValue = amountValue.substring(0, start - 1) + amountValue.substring(start, amountValue.length);
                            amount = amountValue.replace(/\,/g, "");
                            start = start - 1;
                        }
                    }
                }

                amountValue = amount.replace(/(\d{1,3})(?=(?:\d{3})+\.)/g, '$1,');
                $(element).val(amountValue);
                $(element)[0].selectionEnd = clientScript.keepAmountDecimalPlaces(amount).length - selectionEnd;
            } else {
                //Filter the data(add Decimal)
                if (!(/^\d{0,7}?\.?\d{0,2}$/.test(amount))) {
                    amount = originalAmount;
                    $(element).val(originalAmount);
                }

                var start = $(element)[0].selectionEnd;
                var length = amount.length;
                if (isSend) {
                    //according to the cursor position,decide where to delete
                    for (var i = length; i > 0; i--) {
                        DispensedAmount = (1.0 * amount * rate).toFixed(2);
                        if (/^\d{0,7}?\.?\d{0,2}$/.test(DispensedAmount) && /^\d{0,5}?\.?\d{0,2}$/.test(parseFloat(amount).toFixed(2))) {
                            $(element).val(amount);
                            break;
                        } else {
                            amount = amount.substring(0, start - 1) + amount.substring(start, amount.length);
                            start = start - 1;
                        }
                    }
                } else {
                    for (var i = length; i > 0; i--) {
                        SendAmount = (1.0 * amount / rate).toFixed(2);
                        if (/^\d{0,5}?\.?\d{0,2}$/.test(SendAmount) && /^\d{0,7}?\.?\d{0,2}$/.test(parseFloat(amount).toFixed(2))) {
                            $(element).val(amount);
                            break;
                        } else {
                            amount = amount.substring(0, start - 1) + amount.substring(start, amount.length);
                            start = start - 1;
                        }
                    }
                }
                if (amount == "") {
                    $(element).val("");
                }
                $(element)[0].selectionEnd = start;
            }
            return amount;
        },
        getFormatFloat: function (value) {
            if (value == null || value.length <= 3) {
                return value;
            }

            if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(value)) {
                return value;
            }

            var sign = RegExp.$1,
                integerPart = RegExp.$2,
                decimalPart = RegExp.$3;

            var reg = new RegExp();
            reg.compile("(\\d)(\\d{3})(,|$)");
            while (reg.test(integerPart)) {
                integerPart = integerPart.replace(reg, "$1,$2$3");
            }

            return sign + "" + integerPart + "" + decimalPart;
        },
        GetOriginalNumber: function (number) {
            if (typeof number == "string") {
                number = number.replace(/,/g, "");
            }

            return number;
        },
        getAmountToSend: function (amountDestination, rate) {
            var amountToSend = "";
            if (amountDestination == "" || amountDestination == null || amountDestination == '0.00') {
                if (clientScript.IsMobileDevice()) {
                    amountToSend = "0.00";
                } else {
                    amountToSend = "";
                }
            } else {
                if (rate) {
                    var amountToSend = (parseFloat(clientScript.GetOriginalNumber(amountDestination)) / rate).toFixed(2);
                    amountToSend = clientScript.keepAmountDecimalPlaces(amountToSend);
                }
            }

            return amountToSend;
        },
        initAmountEvents: function (element, isEffectOtherAmount) {
            var self = $(element);

            //Dynamic change maximum length(mobile format and computer format)
            if (clientScript.IsMobileDevice()) {
                length = 12;
            } else {
                length = 10;
            }

            self.attr("maxlength", length);

            var quickpayStr = self.attr("id").indexOf("quick-pay") > -1 ? "quick-pay-" : "";
            self.off('paste.number');
            self.on('paste.number', function (e) {
                var clipboardContent = clientScript.getClipboardContent(e);
                var selectionStart = 0;
                var selectionEnd = 0;
                var tempVal = "";
                if (self.val() == "0.00" && (self.attr("id") == "input-amount-to-send" || self.attr("id") == "input-amount-to-be-dispensed" ||self.attr("id") == "input-quick-pay-amount-to-send" || self.attr("id") == "input-quick-pay-amount-to-be-dispensed")) {
                    self.val("");
                    clientScript.removeClassForAmountToSend(quickpayStr);
                } else if (self.val() == "0.00" && (self.attr("id") == "input-lcr-send-amount" || self.attr("id") == "input-amount"
                    || self.attr("id") == "quickpay-input-amount" || self.attr("id") == "send-amount-input" || self.attr("id") == "input-quickpay-lcr-send-amount")) {
                    self.val("");
                    self.removeClass("placeholder-color");
                } else if (self.val() != "0.00") {
                    selectionStart = self[0].selectionStart;
                    selectionEnd = self[0].selectionEnd;
                    tempVal = self.val();
                }
                var selectionLength = selectionEnd - selectionStart;
                var maxLength = parseInt(isNaN(self.attr('maxlength')) ? '2147483647' : self.attr('maxlength'));

                if (tempVal.length - selectionLength + clipboardContent.length > maxLength) {
                    clipboardContent = clipboardContent.substr(0, maxLength - (tempVal.length - selectionLength));
                }

                tempVal = tempVal.substr(0, selectionStart) + clipboardContent + tempVal.substr(selectionEnd);

                var reg = new RegExp(/[^(0-9)]/g);
                if (self.attr('amount') == "") {
                    reg = new RegExp(/[^(0-9|.)]/g);
                    if (tempVal.indexOf('.') == 0 || tempVal.indexOf(".") != tempVal.lastIndexOf(".")) {// contains more then one dot or the dot is at the beginning.
                        return false;
                    }
                }

                if (reg.test(clipboardContent)) {
                    return false;
                }
            });

            if (self.val() == "0.00" && !clientScript.IsMobileDevice() && (self.attr("id") == "input-lcr-send-amount" || self.attr("id") == "input-amount")) {
                self.addClass("placeholder-color");
            } else if ((self.val() != "0.00") && !clientScript.IsMobileDevice() && (self.attr("id") == "input-lcr-send-amount" || self.attr("id") == "input-amount")) {
                self.removeClass("placeholder-color");
            }
            if (clientScript.IsMobileDevice()) {
                self.off("keypress.attribute.amount");
                self.on("keypress.attribute.amount", function (e) {
                    return clientScript.checkInputKeycode(e);
                });
                if (!isEffectOtherAmount) {
                    element = $(element);
                    var oldValue = element.val();

                    self.off("input.attribute.amount");
                    self.on("input.attribute.amount", function () {
                        clientScript.formatAmountForInput(element, oldValue);
                        if (oldValue != element.val()) {
                            oldValue = element.val();
                        }
                    });

                    self.off("focus.attribute.amount");
                    self.on("focus.attribute.amount", function (e) {
                        oldValue = element.val();
                    });
                }
            } else {
                self.on('keypress.attribute.amount', function (event) {
                    if (!clientScript.validateKeyPressPositiveNumeric(event, element)) {
                        return false;
                    }
                });

                self.on('focus.attribute.amount', function (event) {
                    var amount = self.val().replace(/,/g, '');
                    if (!self.hasClass("placeholder-color") && /\.00$/.test(amount)) {
                        amount = amount.replace(/\.00/, '');
                    }
                    clientScript.fitTextAmountField(self, amount);
                });

                self.on('blur.attribute.amount', function (event) {
                    clientScript.fitTextAmountField(self, clientScript.keepAmountDecimalPlaces(self.val()));
                });
            }

            self.on('keydown.attribute.amount', function (event, element) {
                var amount = self.val().replace(/,/g, '');
                if (!clientScript.IsMobileDevice() && (event.keyCode == 8 || event.keyCode == 46) && !self.hasClass("placeholder-color") && (amount === "0.00" && amount.length > ($(this)[0].selectionEnd - $(this)[0].selectionStart)) && (self.attr("id") == "input-amount-to-send" || self.attr("id") == "input-quick-pay-amount-to-send")) {
                    var subValue = clientScript.getSubValue(this, amount);
                    $("#input-" + quickpayStr + "amount-to-send").val(subValue);
                    $("#input-" + quickpayStr + "amount-to-be-dispensed").val("0.00");
                    return false;
                } else if (!clientScript.IsMobileDevice() && (event.keyCode == 8 || event.keyCode == 46) && !self.hasClass("placeholder-color") && (amount === "0.00" && amount.length > ($(this)[0].selectionEnd - $(this)[0].selectionStart)) && (self.attr("id") == "input-amount-to-be-dispensed" || self.attr("id") == "input-quick-pay-amount-to-be-dispensed")) {
                    var subValue = clientScript.getSubValue(this, amount);
                    $("#input-" + quickpayStr + "amount-to-send").val("0.00");
                    $("#input-" + quickpayStr + "amount-to-be-dispensed").val(subValue);
                    return false;
                } else if (!clientScript.IsMobileDevice() && (event.keyCode == 8 || event.keyCode == 46) && (amount === "0.00" || (amount.length == 1 && $(this)[0].selectionEnd == 1) || amount.length == ($(this)[0].selectionEnd - $(this)[0].selectionStart)) && (self.attr("id") == "input-amount-to-send" || self.attr("id") == "input-amount-to-be-dispensed" || self.attr("id") == "input-quick-pay-amount-to-be-dispensed" || self.attr("id") == "input-quick-pay-amount-to-send")) {
                    $("#input-" + quickpayStr + "amount-to-send").val("0.00");
                    $("#input-" + quickpayStr + "amount-to-be-dispensed").val("0.00");
                    clientScript.addClassForAmountToSend(quickpayStr);
                    return false;
                } else if (!clientScript.IsMobileDevice() && event.keyCode == 8 && !self.hasClass("placeholder-color") && (amount === "0.00" && amount.length > ($(this)[0].selectionEnd - $(this)[0].selectionStart)) && (self.attr("id") == "input-lcr-send-amount" || self.attr("id") == "input-amount")) {
                    var subValue = clientScript.getSubValue(this, amount);
                    $("#" + self.attr("id")).val(subValue);
                    return false;
                } else if (!clientScript.IsMobileDevice() && (event.keyCode == 8 || event.keyCode == 46) && (amount === "0.00" || (amount.length == 1 && $(this)[0].selectionEnd == 1) || amount.length == ($(this)[0].selectionEnd - $(this)[0].selectionStart)) && (self.attr("id") == "input-lcr-send-amount" || self.attr("id") == "input-amount")) {
                    $("#" + self.attr("id")).val("0.00");
                    $("#input-send-amount").val("0.00");
                    $("#" + self.attr("id")).addClass("placeholder-color");
                    return false;
                }
            });

            self.on('change.attribute.amount', function (event) {
                if ($("#NextButton").length > 0) {
                    $("#NextButton")[0].className = "button radius disabled";
                    $("#NextButton")[0].href = "#";
                    $("#NextButton").removeAttr("onclick");
                }
            });

            self.off("change.attribute.amounttosend")
            self.on("change.attribute.amounttosend", function (element, isInputValue) {
                if (quickpayStr != "" && isInputValue == false) {
                    self.val("0.00");
                }
                if (!clientScript.IsMobileDevice() && (self.val() == "0.00" || self.val() == "") && isInputValue == false && (self.attr("id") == "input-amount-to-send" || self.attr("id") == "input-amount-to-be-dispensed" || self.attr("id") == "input-quick-pay-amount-to-be-dispensed" || self.attr("id") == "input-quick-pay-amount-to-send")) {
                    self.val("0.00");
                    clientScript.addClassForAmountToSend(quickpayStr);
                } else if (!clientScript.IsMobileDevice() && (self.val() == "" || self.hasClass("placeholder-color")) && (self.attr("id") == "quickpay-input-amount" || self.attr("id") == "send-amount-input" || self.attr("id") == "input-quickpay-lcr-send-amount")) {
                    self.val("0.00");
                    self.addClass("placeholder-color");
                } else if (!clientScript.IsMobileDevice() && isInputValue) {
                    clientScript.removeClassForAmountToSend(quickpayStr);
                } 
            });
        },

        /* Start about Amount To Send's placeholder "0.00" */
        getSubValue: function(thisObject, amount){
            var subValue = "";
            if ($(thisObject)[0].selectionEnd == $(thisObject)[0].selectionStart) {
                subValue = amount.substring(0, $(thisObject)[0].selectionStart - 1) + "" + amount.substring($(thisObject)[0].selectionStart, amount.length);
            } else {
                subValue = amount.substring(0, $(thisObject)[0].selectionStart) + "" + amount.substring($(thisObject)[0].selectionEnd, amount.length);
            }
            return subValue;
        },

        addClassForAmountToSend: function(quickpay){
            $("#input-" + quickpay + "amount-to-send").addClass("placeholder-color");
            $("#input-" + quickpay + "amount-to-be-dispensed").addClass("placeholder-color");
        },
        removeClassForAmountToSend: function (quickpay) {
            $("#input-" + quickpay + "amount-to-send").removeClass("placeholder-color");
            $("#input-" + quickpay + "amount-to-be-dispensed").removeClass("placeholder-color");

        },
        /*End about Amount To Send's placeholder "0.00" */

        initCustomAttributes: function () {
            $('form[auto-slide-input], div[auto-slide-input]').find('[autoslide!=false]').each(function () {
                var self = $(this);
                self.find('input[type=number],input[type=tel]').each(function () {
                    var tempInput = $(this);

                    tempInput.off('keypress.number');
                    tempInput.on('keypress.number', function (event) {
                        if (tempInput.attr('amount') == undefined) {
                            var keyCode = event.which;
                            if (event.ctrlKey == true && clientScript.isKeyPressInArray(keyCode, new Array('C', 'V', 'X', 'Z', 'Y'))) {
                                return true;
                            }
                            else if (clientScript.isKeyPressAlpha(keyCode) || clientScript.isKeyPressPunctuationMark(keyCode)) {
                                return false;
                            }
                        }
                    });

                    tempInput.off('paste.number');
                    tempInput.on('paste.number', function (e) {
                        var clipboardContent = clientScript.getClipboardContent(e);               
                        var selectionStart = tempInput[0].selectionStart;
                        var selectionEnd = tempInput[0].selectionEnd;
                        var selectionLength = selectionEnd - selectionStart;
                        var maxLength = parseInt(isNaN(tempInput.attr('maxlength')) ? '2147483647' : tempInput.attr('maxlength'));
                        var tempVal = tempInput.val();

                        if (tempVal.length - selectionLength + clipboardContent.length > maxLength) {
                            clipboardContent = clipboardContent.substr(0, maxLength - (tempVal.length - selectionLength));
                        }

                        tempVal = tempVal.substr(0, selectionStart) + clipboardContent + tempVal.substr(selectionEnd);

                        var reg = new RegExp(/[^(0-9)]/g);
                        if (tempInput.attr('amount') == "") {
                            reg = new RegExp(/[^(0-9|.)]/g);
                            if (tempVal.indexOf('.') == 0 || tempVal.indexOf(".") != tempVal.lastIndexOf(".")) {// contains more then one dot or the dot is at the beginning.
                                return false;
                            }
                        }

                        if (reg.test(clipboardContent)) {
                            return false;
                        }
                    });
                });

                self.find('input[type=tel][phoneformat=true]').each(function () {
                    var tempInput = $(this);

                    tempInput.off('focus.format.number');
                    tempInput.on('focus.format.number', function () {
                        if (!(tempInput.val())) {
                            return;
                        }

                        tempInput.val(tempInput.val().replace(/-/g, ''));
                    });

                    tempInput.off('blur.format.number');
                    tempInput.on('blur.format.number', function () {
                        var value = tempInput.val();
                        if (!value) {
                            return;
                        }

                        if (value.length == 10) {
                            var reg = new RegExp("(\\d{3})(\\d{3})(\\d{4})")
                            tempInput.val(value.replace(reg, "$1-$2-$3"));
                        } else if (value.length == 8) {
                            var reg = new RegExp("(\\d{4})(\\d{4})")
                            tempInput.val(value.replace(reg, "$1-$2"));
                        }
                    });
                });
            });
            $('.not-editable').off('focus.readonly');
            $('.not-editable').on('focus.readonly', function () {
                if ($(this).attr('readonly') == 'readonly') {
                    $(this).blur();
                }
            });

            $('input[type=text]').each(function () {
                var element = $(this);
                element.attr("spellcheck", false);
            });

            $('input[type=tel]').each(function () {
                var element = $(this);
                if (element.attr("Amount") == "")
                {
                    return;
                }
                var newAttr = element.attr("data-bind") + ", validateInteger: null";
                element.attr("data-bind", newAttr);
            });

            clientScript.enterToNext.init();
        },
        getClipboardContent: function (event) {
            if (window.clipboardData) {
                return window.clipboardData.getData('Text');
            }
            else {
                return event.originalEvent.clipboardData.getData('Text');
            }
        },

        isKeyPressNumber: function (keyCode) {
            return keyCode >= 48 && keyCode <= 57;
        },

        isKeyPressAlpha: function (keyCode) {
            return (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122);  //a-zA-Z
        },

        isKeyPressPunctuationMark: function (keyCode) {
            return (keyCode >= 32 && keyCode <= 47)
                || (keyCode >= 58 && keyCode <= 64)
                || (keyCode >= 91 && keyCode <= 96)
                || (keyCode >= 123 && keyCode <= 126);
        },

        isKeyDownSpaceBar: function (keyCode) {
            return keyCode == 32;
        },

        isKeyPressInArray: function (keyCode, alphaArray) {
            var result = false;

            var keyChar = String.fromCharCode(keyCode).toUpperCase();

            for (var index in alphaArray) {
                if (keyChar == alphaArray[index].toUpperCase()) {
                    result = true;
                }
            }

            return result;
        },

        isKeyPressEnter: function (keyCode) {
            return keyCode == 13;
        },

        isKeyPressControlOrSelect: function (keyCode) {
            return (keyCode >= 16 && keyCode <= 27)
                || (keyCode >= 33 && keyCode <= 40)
                || (keyCode >= 44 && keyCode <= 45)
                || (keyCode >= 91 && keyCode <= 93)
                || (keyCode >= 112 && keyCode <= 123);
        },

        validateKeyPressPositiveNumeric: function (e, element) {
            element = $(element);
            var content = $(element).val();
            var keyCode = e.which;

            if (!content) {
                content = "";
            }

            if (e.ctrlKey == true && clientScript.isKeyPressInArray(keyCode, new Array('C', 'V', 'X', 'Z', 'Y'))) {
                return true;
            }
            else if (clientScript.isKeyPressAlpha(keyCode) || clientScript.isKeyPressPunctuationMark(keyCode)) {
                if (keyCode == 46 && content.trim().length != 0 && content.indexOf('.') < 0 && element[0].selectionStart > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {

                if (!element.hasClass("placeholder-color") && content.indexOf('.') > 0 && content.split('.')[1].length == 2
                    && element[0].selectionStart == element[0].selectionEnd && element[0].selectionStart > content.indexOf(".")
                            && (clientScript.isKeyPressNumber(keyCode) || clientScript.isKeyPressDot(keyCode))) {
                    return false;
                  } else if (content == "0.00" && element.hasClass("placeholder-color") && content.indexOf('.') > 0 && content.split('.')[1].length == 2
                    && (clientScript.isKeyPressNumber(keyCode) || clientScript.isKeyPressDot(keyCode))) {
                    $(element).val("");
                    $(element).removeClass("placeholder-color");
                    return true;
                } else {
                    return true;
                }
            }
        },
        
        formatAmountForInput: function (element, oldValue) {
            element = $(element);
            var validationReg = new RegExp(/^\d+\.{0,2}\d*$/);
            if (!validationReg.test(element.val().replace(/,/g, '')))
            {
                var totleValue = oldValue.replace(".", "").replace(/,/g, '');
                var leftValue = totleValue.substring(1, totleValue.length);
                var formatedValue = parseFloat(leftValue.substring(0, leftValue.length - 2) + "." + leftValue.substring(leftValue.length - 2, leftValue.length)).toFixed(2);
                element.val(formatedValue);
                element[0].selectionStart = element[0].selectionEnd = 1;
            }

            // Validate input value.
            var selectionStart = element[0].selectionStart;
            var selectionEnd = element[0].selectionEnd;
            var selectionLength = selectionEnd - selectionStart;
            var maxLength = parseInt(isNaN($(element).attr('maxlength')) ? '2147483647' : $(element).attr('maxlength'));
            var tempVal = $(element).val().replace(/,/g, '');

            if (tempVal.length > maxLength) {
                tempVal = tempVal.substr(0, maxLength);
            }

            var reg = new RegExp(/[^(0-9)]/g);
            if ($(element).attr('amount') == "") {
                reg = new RegExp(/[^(0-9|.)]/g);
                if (tempVal.indexOf(".") != tempVal.lastIndexOf(".")) {// contains more then one dot or the dot is at the beginning.
                    $(element).val(oldValue);
                }
            }

            if (reg.test(tempVal)) {
                $(element).val(oldValue);
            }

            var value = element.val().replace(".", "").replace(/,/g, '');
            var length = element.val().length - element[0].selectionEnd;

            if (value.length == 0) {
                $(element).val("0.00");
            } else if (value.length == 1) {
                $(element).val("0.0" + value);
            } else if (value.length == 2) {
                $(element).val("0." + value);
            } else {
                $(element).val(parseFloat(value.substring(0, value.length - 2) + "." + value.substring(value.length - 2, value.length)).toFixed(2));
            }
            var changedChar = oldValue.substring(selectionStart, selectionEnd + 1);
            if (parseFloat(element.val().replace(/,/g, '')) <= parseFloat(oldValue.replace(/,/g, '')) && (changedChar == "," || changedChar == ".")) {
                $(element).val((oldValue.substring(0, selectionStart - 1) + oldValue.substring(selectionStart, oldValue.length)).replace(/,/g, ''));
            }
            $(element).val(clientScript.keepAmountDecimalPlaces($(element).val()));
            element[0].selectionStart = element[0].selectionEnd = $(element).val().length - length;
        },

        checkInputKeycode: function (e) {
            var keyCode = e.which;
            if (e.ctrlKey == true && clientScript.isKeyPressInArray(keyCode, new Array('C', 'V', 'X', 'Z', 'Y'))) {
                return true;
            }
            else if (clientScript.isKeyPressAlpha(keyCode) || clientScript.isKeyPressPunctuationMark(keyCode)) {
                return false;
            }
        },

        isKeyPressDot: function (keyCode) {
            return keyCode == 46;
        },

        dispatchEvent: function (element) {
            var e = document.createEvent('MouseEvents');
            e.initMouseEvent('mousedown', true, true, window);
            element.dispatchEvent(e);
        },
        setFirstModalInputFocus: function (revealId, isUnfocused) {
            $(revealId).off('opened.focusfirstinput');
            $(revealId).off('closed.focusfirstinput');
            $(revealId).on('opened.focusfirstinput', function () {
                var firstInput = $(revealId).find("input:text:visible:enabled, input[type=number]:visible:enabled, input[type=tel]:visible:enabled").eq(0);
                if (firstInput && !firstInput.attr("data-date-format")) {
                    firstInput.focus();
                }
            });
        },
        //************************************
        //Validation for dynamic controls.

        ValidateDate: function (value, validationType) {
            if (value == "" || value == null) {
                return false;
            }

            inputDate = new Date(value);
            inputYear = inputDate.getFullYear();
            if (validationType == "DateOfBirth") {
                if (inputYear < new Date().getFullYear() - 110 || inputYear > new Date().getFullYear() - 18) {
                    return false;
                }
            }
            else if (validationType == "Expiration") {
                if (inputYear < new Date().getFullYear() || inputYear > new Date().getFullYear() + 100) {
                    return false;
                }
            }
            else {
                if (inputDate < new Date("01/01/1900") || inputDate > new Date("12/31/9999")) {
                    return false;
                }
            }

            return true;
        },

        showLoading: function () {
            $("#modal-loading-icon").show();
            return $("#modal-loading").show();
        },
        hideLoading: function () {
            $("#modal-loading-icon").hide();
            return $("#modal-loading").hide();
        },
        BaseAjax: function (jsonParameters, notShowError, allowCrossModule) {
            if (!clientScript.CheckEnabledCookie()) {
                //Inline message
                clientScript.showFistLevelError({ Message: commonstrings.clientscriptjsmessagebox.enableyourbrowsercookie, Caption: commonstrings.clientscriptjsmessagebox.error });
                // Handle null exception, do not return json object(Message in json formate will be shown up).
                //Inline message
                var xhr = { "responseText": commonstrings.clientscriptjsmessagebox.enableyourbrowsercookie };
                return $.Deferred().reject(xhr, commonstrings.clientscriptjsmessagebox.lowercaseerror);
            }
            var moduleName = require('app').uniqueModuleName;
            var uniqueAjaxName = jsonParameters.url.replace(/\//g, '') + jsonParameters.type + moduleName + allowCrossModule || '';
            var uniqueAjax = require('app').uniqueAjax[uniqueAjaxName] = "" + new Date().getTime() + Math.floor(Math.random() * 1000000000);
            var deferred = $.Deferred();
            $.ajax(jsonParameters)
            .done(function (data) {
                if (uniqueAjax != require('app').uniqueAjax[uniqueAjaxName]) {
                    return;
                }

                if (allowCrossModule == true || moduleName == require('app').uniqueModuleName) {
                    deferred.resolve(data);
                }
            })
            .fail(function (xhr, status) {
                if (uniqueAjax != require('app').uniqueAjax[uniqueAjaxName]) {
                    return;
                }

                if (status == 'error' && (xhr.status == 0 || xhr.status == 404) && xhr.statusText != 'Not Found') {
                    clientScript.showInfoWhenInternetUnavailable();
                    return deferred.reject(xhr, status);
                }

                if (!(notShowError && notShowError == true)) {
                    try {
                        clientScript.handleAjaxError(xhr.responseText, false);
                    } catch (e) {
                        console.log(e);
                    }
                }

                if (allowCrossModule == true || moduleName == require('app').uniqueModuleName) {
                    deferred.reject(xhr, status);
                }
            })
            .always(function () {
                if (uniqueAjax == require('app').uniqueAjax[uniqueAjaxName]) {
                    delete require('app').uniqueAjax[uniqueAjaxName];
                }
            });

            return deferred;
        },

        AjaxByLoading: function (jsonParameters, notShowError, allowCrossModule) {
            if (!clientScript.CheckEnabledCookie()) {
                clientScript.showFistLevelError({ Message: commonstrings.clientscriptjsmessagebox.enableyourbrowsercookie, Caption: commonstrings.clientscriptjsmessagebox.error });
                // Handle null exception, do not return json object(Message in json formate will be shown up).
                var xhr = { "responseText": commonstrings.clientscriptjsmessagebox.enableyourbrowsercookie };
                return $.Deferred().reject(xhr, commonstrings.clientscriptjsmessagebox.lowercaseerror);
            }

            var moduleName = require('app').uniqueModuleName;
            var uniqueAjaxName = jsonParameters.url.replace(/\//g, '') + jsonParameters.type + moduleName + allowCrossModule || '';
            var uniqueAjax = require('app').uniqueAjax[uniqueAjaxName] = "" + new Date().getTime() + Math.floor(Math.random() * 1000000000);
            var deferred = $.Deferred();
            $.when(clientScript.showLoading())
            .done(function () {
                $.ajax(jsonParameters)
                  .done(function (data) {
                      clientScript.hideLoading();
                      if (uniqueAjax != require('app').uniqueAjax[uniqueAjaxName]) {
                          return;
                      }

                      if (allowCrossModule == true || moduleName == require('app').uniqueModuleName) {
                          deferred.resolve(data);
                      }
                  })
                  .fail(function (xhr, status) {
                      clientScript.hideLoading();
                      if (uniqueAjax != require('app').uniqueAjax[uniqueAjaxName]) {
                          return;
                      }

                      if (status == 'error' && (xhr.status == 0 || xhr.status == 404) && xhr.statusText != 'Not Found') {
                          clientScript.showInfoWhenInternetUnavailable();
                          return;
                      }

                      if (!(notShowError && notShowError == true)) {
                          if (status == "timeout") {
                              return clientScript.closeModal();
                          }

                          try {
                              clientScript.handleAjaxError(xhr.responseText, false);
                          } catch (e) {
                              console.log(e);
                          }
                      }

                      if (allowCrossModule == true || moduleName == require('app').uniqueModuleName) {
                          deferred.reject(xhr, status);
                      }
                  })
                 .always(function () {
                     if (uniqueAjax == require('app').uniqueAjax[uniqueAjaxName]) {
                         delete require('app').uniqueAjax[uniqueAjaxName];
                     }
                 });
            });

            return deferred;
        },

        AjaxBySpinnerOrLoading: function (jsonParameters, element, notShowError, allowCrossModule) {
            if (!element) {
                return clientScript.AjaxByLoading(jsonParameters, notShowError, allowCrossModule);
            }

            if (typeof element == "string") {
                if (element.indexOf("#") != 0) {
                    element = "#" + element;
                }
            }

            return clientScript.AjaxBySpinner(jsonParameters, element, notShowError, allowCrossModule);
        },

        AjaxBySpinner: function (jsonParameters, element, notShowError, allowCrossModule) {
            $(element).addClass("now-loading");

            return $.when(clientScript.BaseAjax(jsonParameters, notShowError, allowCrossModule))
                    .always(function () {
                        $(element).removeClass("now-loading");
                    });
        },
        AjaxDownload: function (option) {
            var deferred = $.Deferred();
            try {
                var xhr = new XMLHttpRequest();
                option.type = option.type.toUpperCase()
                if (option.type == 'GET') {
                    if (option.data) {
                        var args = '?';
                        for (var arg in option.data) {
                            args += arg + '=' + option.data[arg] + '&';
                        }

                        option.url += args.replace(/&$/, '');
                    }
                }
                xhr.open(option.type, option.url, true);
                xhr.responseType = "blob";

                xhr.onload = function () {
                    if (this.status == 200) {
                        if (option.done) {
                            option.done(this.response);
                        }

                        deferred.resolve(this.response);
                    } else {
                        if (option.fail) {
                            option.fail(this, this.status);
                        }
                        deferred.reject(this, this.status);
                    }
                }

                xhr.onloadstart = function (event) {
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    if (option.start) {// upload start
                        option.start(event);
                    }
                    return xhr;
                };


                xhr.onerror = function (event) {
                    if (option.fail) {
                        option.fail(event);
                    }
                    deferred.reject(event.target, event.target.status);
                };

                if (option.type == 'POST') {
                    var formData = new FormData();
                    for (var key in option.data) {
                        formData.append(key, option.data[key]);
                    }

                    xhr.send(formData);
                } else {
                    xhr.send();
                }

            } catch (e) {
                console.log(e);
                return $.Deferred().reject();
            }

            return deferred;
        },
        AjaxUpload: function (option,element) {
            var option = option || {};
            var deferred = $.Deferred();
            function isNullOrUndefined(obj) {
                return !obj;
            }

            if (isNullOrUndefined(option.data)) {
                throw { message: 'Data field is requred.' };
            }

            if (isNullOrUndefined(option.url)) {
                throw { message: 'Url field is requred.' };
            }

            var formData = new FormData();
            for (var key in option.data) {
                formData.append(key, option.data[key]);
            }


            var xhr = new XMLHttpRequest();
            xhr.open('POST', option.url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            if (option.progress) {
                xhr.upload.onprogress = function (event) {
                    if (event.lengthComputable) {
                        option.progress(event);
                    }
                };
            }

            xhr.onloadstart = function (event) {
                if (option.start) {// upload start
                    option.start(event);
                }
                return xhr;
            };


            xhr.onload = function (event) {
                if (event.target.status === 200) {
                    var res = event.target.responseText;
                    if (option.dataType.toLowerCase() === 'json') {
                        if ((typeof JSON) === 'undefine') {
                            res = eval("(" + res + ")");
                        } else {
                            res = JSON.parse(res);
                        }
                    }
                    if (option.done) {
                        option.done(res);
                    }

                    deferred.resolve(res);
                } else {
                    $(element).removeClass("now-loading");
                    if (option.fail) {
                        option.fail(event.target, event.target.status);
                    }

                    deferred.reject(event.target, event.target.status);
                }
            };

            xhr.onerror = function (event) {
                $(element).removeClass("now-loading");
                deferred.reject(event.target, event.target.status);
                if (option.fail) {
                    option.fail(event.target, event.target.status);
                }
            };

            if (option.abort) {
                xhr.onabort = function (event) {
                    option.abort(event);
                };
            }

            if (option.always) {// upload finish include success or fail.
                xhr.onloadend = function (event) {
                    option.always(event);
                    $(element).removeClass("now-loading");
                };
            }

            $(element).addClass("now-loading");
            xhr.send(formData);

            return deferred;
        },
        CheckEnabledCookie: function () {
            if (!navigator.cookieEnabled) {
                return false;
            }

            if (!clientScript.CookieEnable()) {
                return false;
            }

            return true;
        },
        EmailAddressFormatValidation: function (emailAddress) {
            return /^((".*?[^\\]"@@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)[0-9a-z]@@)|(([0-9a-z]@@)))((\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$/i.test(emailAddress);
        },

        IsLeapYear: function (year) {
            if (isNaN(year)) {
                return null;
            }

            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                return true;
            }

            return false;
        },

        isDisabled: function (element) { //element is id or object
            element = clientScript.GetElementIdWithSymbol(element);

            if ($(element).hasClass('now-loading')) {
                return true;
            }

            if ($(element).attr("disabled") == "disabled") {
                return true;
            }

            if ($(element).hasClass("disabled")) {
                return true;
            }

            if ($(element).find("span").attr('display') == 'block') {
                return true;
            }

            if ($("#modal-loading").is(":visible")) {
                return true;
            }

            return false;
        },

        removeDisable: function (element) { //element is id or object
            element = clientScript.GetElementIdWithSymbol(element);

            $(element).attr("disabled", false)

            if ($(element).hasClass("disabled")) {
                $(element).removeClass("disabled");
            }
        },

        addDisable: function (element) { //element is id or object
            element = clientScript.GetElementIdWithSymbol(element);
            $(element).attr("disabled", "disabled");
            $(element).addClass("disabled");
        },

        enableElements: function (elements) { //elements is an array of element id
            $.each(elements, function (index, element) {
                clientScript.removeDisable(element);
            })
        },

        disableElements: function (elements) {  //elements is an array of element id
            $.each(elements, function (index, element) {
                clientScript.addDisable(element);
            })
        },

        IsInvalidPhoneNumber: function (phoneNumber) {
            if (phoneNumber != null) {
                return !require("knockout").validation.rules.number.validator(phoneNumber.replace(/-/g, ''), true);
            }
            return false;
        },

        IsInvalidEditablePhoneNumberMaxLength: function (phoneNumber) {
            if (phoneNumber != null) {
                return !(require("knockout").validation.rules.maxLength.validator(phoneNumber.replace(/-/g, ''), 10)
                    && require("knockout").validation.rules.minLength.validator(phoneNumber.replace(/-/g, ''), 10));
            }
            return false;
        },

        IsInvalidName: function (name) {
            if (name != null) {
                if (!/^[a-zÁÉÍÓÚÑ]/i.test(name)) {
                    return 1;
                } else if (!/^[a-zÁÉÍÓÚÑ][a-zÁÉÍÓÚÑ\u3000\u0020'-]*$/i.test(name)) {
                    return 2;
                }
            }
            return 0;
        },

        addSearchSpinner: function (element) {
            element = clientScript.GetElementIdWithSymbol(element);

            $(element).find("i").hide();
            $(element).find("span").css({ "display": "block", "margin-top": "0.1rem" });
        },

        removeSearchSpinner: function (element) {
            element = clientScript.GetElementIdWithSymbol(element);
            $(element).find("span").hide();
            $(element).find("i").fadeIn();

        },

        //print 
        prepareToPrint: function (content, nextToDo) {
            var printContent = String.format(content, location.protocol + "//" + location.host);
            var iframe = '<iframe id="frame" style="display:none"></iframe>';
            $("#main").prepend(iframe);

            var winprint = clientScript.setPrintIframeContent("frame", printContent);

            if (!clientScript.IsChrome()) {
                clientScript.showStandardPrintingModal(winprint, nextToDo);
            }
            else {
                clientScript.doStandardPrinting(winprint, nextToDo);
            }
        },

        setPrintIframeContent: function (iframeName, content) {
            var frame = document.getElementById(iframeName);
            var winprint = (frame.contentWindow) ? frame.contentWindow : (frame.contentDocument.document) ? frame.contentDocument.document : frame.contentDocument;

            winprint.document.open();
            winprint.document.write(content);
            winprint.focus();

            return winprint;
        },

        showStandardPrintingModal: function (winprint, nextToDo) {
            clientScript.doStandardPrinting(winprint, nextToDo);
            //cleanIframeContent();
        },

        doStandardPrinting: function (winprint, nextToDo) {
            var browserName = navigator.appName;
            if (browserName == "Microsoft Internet Explorer" || "ActiveXObject" in window || clientScript.IsEdge()) {
                winprint.document.execCommand("print", false, null);
                if (nextToDo) {
                    nextToDo();
                }
            }
            else {
                var wait = 0;
                function Loading(callback) {
                    $("#frame").ready(function () {
                        if (typeof callback === 'function') {
                            callback();
                        }
                        winprint.document.close();
                        window.clearInterval(wait);
                        if (nextToDo) {
                            nextToDo();
                        }
                    });

                    $("#frame").remove();
                }
                var browserName = navigator.appName;
                if (browserName == "Microsoft Internet Explorer" || "ActiveXObject" in window || clientScript.IsEdge()) {
                    wait = window.setInterval(function () {
                        Loading(function () {
                            winprint.document.execCommand("print", true, null);
                        });
                    }, 1000);
                }
                else {
                    wait = window.setInterval(function () {
                        Loading(function () {
                            winprint.print();
                        });
                    }, 1000);
                }
            }
        },

        PrintTransaction: function (reportContent, element) {
            var result = reportContent;
            $(element).addClass('now-loading');
            clientScript.prepareToPrint(result, function () {
                $(element).removeClass('now-loading');
            });
        },

        //When Focus the input box on firefox, the cursor keep on the left of the value, should on the right of value.
        HandleFirefoxFocusIssue: function (element) {
            element = clientScript.GetElementIdWithSymbol(element);
            $(element).focus();
            var value = $(element).val();
            $(element).val("");
            $(element).val(value);
        },

        GetElementIdWithSymbol: function (element) {
            if (typeof element === "string") {
                if (element.indexOf("#") != 0) {
                    return element = "#" + element;
                }
                return element;
            }
            return element;
        },

        GetFormatAmount: function (amount) {
            if (amount == null) {
                return amount;
            }
            if (isNaN(amount.replace(/,/g, ''))) {
                return parseFloat(amount.replace(/,/g, '')).toFixed(2);
            }
            return amount;
        },

        CustomTrim: function (value) {
            if (typeof (value) == "string") {
                return value.trim();
            }

            return value;
        },

        IsChrome: function () {
            return !!(navigator.userAgent.match(/(Chrome)/i) && !navigator.userAgent.match(/(Edge)/i));
        },

        IsEdge: function () {
            return !!navigator.userAgent.match(/(Edge)/i);
        },
        IsIOS: function () {
            return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        },
        IsMobileDevice: function () {
            return !!navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|Windows Phone)/i);
        },
        IsIpad: function () {
            return !!navigator.userAgent.match(/iPad/);
        },
        IsIOS8: function() {
            return Boolean(navigator.userAgent.match(/OS [8]_\d[_\d]* like Mac OS X/i));
        },
        CookieEnable: function () {
            return ("cookie" in document && (document.cookie.length > 0 || (document.cookie = "TestCookie").indexOf.call(document.cookie, "TestCookie") > -1));
        },
        RemoveOpen: function () {
            $('body').removeClass('open');
            $('html').removeClass('open');
            $('html').removeClass('disable-overflow-x');
            $('body').removeClass('disable-overflow-x');

            $('#header').removeClass("blur");
            $('#wrapper').removeClass("blur");

            clientScript.ShowQuickButtonForMobile(true);
        },
        urlTriggerTab: function () {
            var hash = location.hash.replace("/", "");
            if (hash) {
                if (!$(hash).hasClass("active")) {
                    $("a[href=" + hash + "]").click();
                }
            }
        },
        triggerTab: function (hash) {
            hash = clientScript.GetElementIdWithSymbol(hash);
            if (hash) {
                if (!$(hash).hasClass("active")) {
                    $("a[href=" + hash + "]").click();
                }
            }
        },

        SlideToTop: function () {
            scrollTo(0, 0);
        },

        SlideToBottom: function () {
            scrollTo(0, 10000);
        },

        scrollToTab: function (tabName) {
            if ($('[href=#' + tabName + ']').length != 0) {
                scrollTo(0, $('[href=#' + tabName + ']').offset().top - parseInt($('#header').css('height').replace('px', '')));
            }
        },

        // Slide to the element, use the element's top location as browse's top location.
        scrollToElement: function (element) {
            if (element.length != 0) {
                scrollTo(0, element.offset().top - parseInt($('#header').css('height').replace('px', '')));
            }
        },
        getDataCaptureServerUrl: function () {
            return configuration.dataCaptureServerUrl;
        },
        GetSuggestionsLocal: function (options, query) {
            var result;
            var tempResult = new Array();
            var tempResultNotStartWith = new Array();

            query = clientScript.removeDiacritics(query).toLowerCase();

            for (i = 0; i < options.length; i++) {
                var tempValue = clientScript.removeDiacritics(options[i].value).toLowerCase();

                if (tempValue.indexOf(query) !== -1) {

                    if (tempValue.indexOf(query) === 0) {
                        tempResult.push(options[i]);
                    } else {
                        tempResultNotStartWith.push(options[i])
                    }
                }
            }

            // Sorted list alphabetically.
            tempResult.sort(function (a, b) {
                return clientScript.sortByString(a.value, b.value, true)
            });

            tempResultNotStartWith.sort(function (a, b) {
                return clientScript.sortByString(a.value, b.value, true)
            });

            for (i = 0; i < tempResultNotStartWith.length; i++) {
                tempResult.push(tempResultNotStartWith[i]);
            }

            result = {
                suggestions: tempResult
            };

            return result;
        },
        GetAutoCompleteSuggestionsLocal: function (options, query) {
            var result;
            var tempResult = new Array();
            var tempResultNotStartWith = new Array();

            query = clientScript.removeDiacritics(query).toLowerCase();

            for (i = 0; i < options.length; i++) {
                var tempValue = clientScript.removeDiacritics(options[i].value).toLowerCase();

                if (tempValue.indexOf(query) !== -1) {

                    if (tempValue.indexOf(query) === 0) {
                        tempResult.push(options[i]);
                    } else {
                        tempResultNotStartWith.push(options[i])
                    }
                }
            }

            for (i = 0; i < tempResultNotStartWith.length; i++) {
                tempResult.push(tempResultNotStartWith[i]);
            }

            result = {
                suggestions: tempResult
            };

            return result;
        },

        FormatAmountOnFocus: function (element) {
            if (!clientScript.IsMobileDevice()) {
                if (element && $(element).length > 0) {
                    var amount = $(element).val();
                    if (/\.00$/.test(amount)) {
                        $(element).val(amount.replace(/\.00/, ''));
                    }
                }
            }
        },

        // Toggle status in transaction done page.
        RegisterExpandCollapse: function () {
            var $win = $(window);
            var $winWidth = $win.width();
            var $modExpandCollapse = $('.mod-header .expand-collapse');
            $modExpandCollapse.off("click");
            $modExpandCollapse.on("click", function () {
                $(this).parent().parent().toggleClass('closed');
                return false;
            })

            $('.mod-header .expand-collapse').parent().parent().addClass('closed');
        },

        //Post initial Data for Transaction.
        AddTransactionStart: function (transactionInitialPositionId, isQuickPay, transactionTypeId, /*Optional*/ startTime) {
            if (require('app').senderInfo()) {
                if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                    return;
                }

                var transactionInfo = new clientScript.CreateTransacInfo(transactionInitialPositionId, isQuickPay, transactionTypeId, /*Optional*/ startTime);

                clientScript.SetLocalStorage("TransactionUniqueCode", transactionInfo.TransactionUniqueCode);

                clientScript.logData(5, "For DataCapture AddTransactionStart, transaction unique code: " + transactionInfo.TransactionUniqueCode, transactionInfo);

                $.ajax({
                    url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogTransactionInfo',
                    dataType: "json",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(transactionInfo)
                })
                .done(function (result) {
                    //To do nothing.
                })
                .fail(function (xhr, status) {
                    //console.log("Initial Transaction Step Error : " + xhr.message);
                });
            } else {
                setTimeout(function () { clientScript.AddTransactionStart(transactionInitialPositionId, isQuickPay, transactionTypeId, startTime) }, 1000);
            }
        },

        CollapseLeftMenu: function () {
            if ($("#drop-transactions").prev('a').attr('class') == "open") {
                $("#drop-transactions").foundation('dropdown', 'closeall');
            }
        },

        IsTransactionPage: function () {
            var pageName = require('app').page().name;

            return pageName == "MoneyTransferConsumer" ||
                   pageName == "BillPayConsumer" ||
                   pageName == "BillPayLCRConsumer" ||
                   pageName == "TopUpsReloadConsumer" ||
                   pageName == "TopUpsPinlessConsumer" ||
                   pageName == "TopUpsPurchaseConsumer"
        },

        /***************************************************Data Capture Start***********************************************************/

        // Post transaction step data.
        AddTransactionStep: function (stepNameId, label, value, /*Optional*/ startDateTime, /*Optional*/ isAddingNew) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            var transactionStepData = new clientScript.CreateTransactionStepModel();

            transactionStepData.TransactionStepNameId = stepNameId;
            transactionStepData.Label = label;
            transactionStepData.Value = value;

            if (startDateTime != undefined) {
                transactionStepData.EndTime = transactionStepData.OperationTime;
                transactionStepData.OperationTime = startDateTime;

                /*
                    (isAddingNew == undefined) for add recipient, add DeliOption, add payment method.
                    (isAddingNew == true) for edit new amount value.
                    (isAddingnew == false) for not edit new amount value and apply Promo Code.
                 */
                if (isAddingNew == undefined || isAddingNew == true) {
                    transactionStepData.IsAddingNew = true;
                } else {
                    transactionStepData.IsAddingNew = false;
                }
            } else {
                transactionStepData.EndTime = transactionStepData.OperationTime;
                transactionStepData.IsAddingNew = false;
            }

            switch (stepNameId) {
                case 1:
                    new clientScript.UpdateTransactionData({ receiverId: value });
                    break;
                case 2:
                case 5:
                case 8:
                    new clientScript.UpdateTransactionData({ amount: value });
                    break;
                case 3:
                    new clientScript.UpdateTransactionData({ correspondentId: value });
                    break;
                default:
                    break;
            }

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogTransactionStep',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(transactionStepData)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
                //console.log("Add Transaction Step Error : " +xhr.message);
            });
        },

        //Update TransactionData.
        UpdateTransactionData: function (updateTransactionData) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            var transactionDataInfoModel = new clientScript.CreateUpdateTransactionDataModel();

            transactionDataInfoModel.ReceiptNumber = updateTransactionData.receiptNumber;
            transactionDataInfoModel.TransactionTypeId = updateTransactionData.transactionTypeId;
            transactionDataInfoModel.ReceiverId = updateTransactionData.receiverId;
            transactionDataInfoModel.CorrespondentId = updateTransactionData.correspondentId;
            transactionDataInfoModel.Amount = updateTransactionData.amount;
            transactionDataInfoModel.Fee = updateTransactionData.fee;
            transactionDataInfoModel.Tax = updateTransactionData.tax;
            transactionDataInfoModel.Total = updateTransactionData.total;

            clientScript.logData(5, "For DataCapture UpdateTransactionData, transaction unique code: " + transactionDataInfoModel.TransactionUniqueCode, transactionDataInfoModel);

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogTransactionInfo',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(transactionDataInfoModel)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
                //console.log("Initial Transaction Step Error : " + xhr.message);
            });
        },

        //Create transaction info.
        CreateTransacInfo: function (transactionInitialPositionId, isQuickPay, transactionTypeId, /*Optional*/ startTime) {
            var transactionInfo = new Object();

            if (transactionTypeId == 5 && require('app').senderInfo().Customer().HasLCRBillPay() != true) {
                transactionTypeId = 11;
            }

            transactionInfo.CardHolderId = require('app').senderInfo().Customer().CustomerBasic.CardHolderId();
            transactionInfo.TransactionTypeId = transactionTypeId;
            transactionInfo.TransactionUniqueCode = clientScript.newGuid();
            transactionInfo.TransactionInitialPositionId = transactionInitialPositionId;
            transactionInfo.IsMobileDevice = localStorage.getItem("IsMobile") == "true" ? 1 : 0;
            transactionInfo.PlatFormInfo = localStorage.getItem("PlatForm");
            transactionInfo.IsQuickPay = isQuickPay;
            transactionInfo.StartTime = startTime ? startTime : clientScript.GetDateTimeOffset();
            transactionInfo.EndTime = clientScript.GetDateTimeOffset();
            transactionInfo.ReceiptNumber = "";
            transactionInfo.SessionId = localStorage.getItem("SessionId");
            transactionInfo.VersionInfo = $.cookie("Wrapper_App_Version") ? $.cookie("Wrapper_App_Version") : localStorage.getItem("Version");
            transactionInfo.StepNameId = 0;
            transactionInfo.OperationTime = clientScript.GetDateTimeOffset();
            transactionInfo.DeviceId = $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress());
            transactionInfo.GeoPosition = $.cookie("Device_Geo_Position");
            transactionInfo.GeoAddress = $.cookie("Device_Geo_Position_Address");
            transactionInfo.ServiceProvider = $.cookie("Device_Service_Provider");

            return transactionInfo;
        },

        CreateTransactionStepModel: function () {
            var transactionStepInfo = new Object();

            transactionStepInfo.TransactionStepId = 0;
            transactionStepInfo.TransactionUniqueCode = localStorage.getItem("TransactionUniqueCode");
            transactionStepInfo.TransactionStepNameId = 0;
            transactionStepInfo.OperationTime = clientScript.GetDateTimeOffset();
            transactionStepInfo.Label = "";
            transactionStepInfo.Value = "";
            transactionStepInfo.GeoPosition = $.cookie("Device_Geo_Position");
            transactionStepInfo.GeoAddress = $.cookie("Device_Geo_Position_Address");

            return transactionStepInfo;
        },

        CreateUpdateTransactionDataModel: function () {
            var transactionDataInfo = new Object();

            transactionDataInfo.TransactionUniqueCode = localStorage.getItem("TransactionUniqueCode");
            transactionDataInfo.TransactionTypeId = 0;
            transactionDataInfo.ReceiptNumber = "";
            transactionDataInfo.EndTime = clientScript.GetDateTimeOffset();
            transactionDataInfo.ReceiverId = 0;
            transactionDataInfo.CorrespondentId = 0;
            transactionDataInfo.Amount = "";
            transactionDataInfo.Fee = "";
            transactionDataInfo.Tax = "";
            transactionDataInfo.Total = "";
            transactionDataInfo.GeoPosition = $.cookie("Device_Geo_Position");
            transactionDataInfo.GeoAddress = $.cookie("Device_Geo_Position_Address");
            transactionDataInfo.ServiceProvider = $.cookie("Device_Service_Provider");

            return transactionDataInfo;
        },

        //Add activityInfo to DataCapture.
        AddActivityInfo: function (cardHolderActivityTypeId, operationTime, isSuccessful, isFirstLogin, /*Optional For SMS DataCapture*/ phoneValidationModel) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            //cardHolderActivityTypeId :11 related to logout behaviour. Set false to async is for complting loguseractivity and then logout.  
            var isAsync = cardHolderActivityTypeId != '11' ? true : false;

            var activityInfo = new Object();
            activityInfo.EmailAddress = require('app').senderInfo().Customer().CustomerBasic.EmailAddress();
            activityInfo.MemberInfoId = require('app').senderInfo().SenderLevel().SenderLevelId;
            activityInfo.EquipmentId = $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress());
            activityInfo.Message = "";
            activityInfo.OperationTime = operationTime ? operationTime : clientScript.GetDateTimeOffset();
            activityInfo.ActionCode = cardHolderActivityTypeId;
            activityInfo.MemberStatus = require('app').senderInfo().Customer().CustomerBasic.CardHolderStatusCode();
            activityInfo.IsSuccessful = isSuccessful;

            if (isFirstLogin) {
                activityInfo.IsFirstLogin = isFirstLogin;
            }

            if (phoneValidationModel != undefined) {
                activityInfo.PhoneValidationActivity = phoneValidationModel;
            }

            activityInfo.GeoPosition = $.cookie("Device_Geo_Position");
            activityInfo.ServiceProvider = $.cookie("Device_Service_Provider");
            activityInfo.GeoAddress = $.cookie("Device_Geo_Position_Address");

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogUserActivity',
                dataType: "json",
                type: "POST",
                async: isAsync,
                contentType: "application/json",
                data: JSON.stringify(activityInfo)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        /* 
         * Function: 
         *     Capture information of fee calculation.
         * Param: 
         *     @feeCalculationModel: fee calculation information.
         */
        LogFeeCalculation: function (feeCalculationModel) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            var feeCalculationModel = {
                FromCountryCode: feeCalculationModel.FromCurrencyCode,
                ToCountryCode: feeCalculationModel.ToCurrencyCode,
                ExchangeRate: feeCalculationModel.ExchangeRate,
                EmailAddress: require('app').senderInfo().Customer().CustomerBasic.EmailAddress(),

                FromCountryId: "840",  //Defaultsend country is USA.
                ToCountryId: feeCalculationModel.ToCountryId,
                FromCurrencyId: "840",
                ToCurrencyId: feeCalculationModel.ToCurrencyId,
                AmountToSend: feeCalculationModel.AmountToSend.Value,
                AmountToReceive: feeCalculationModel.AmountToBeDispensed.Value,
                AmountToCollected: feeCalculationModel.AmountCollected.Value,
                PaymentTypeId: feeCalculationModel.PaymentMethodTypeId,

                EquipmentId: $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress()),
                GeoPosition: $.cookie("Device_Geo_Position"),
                ServiceProvider: $.cookie("Device_Service_Provider"),
                GeoAddress: $.cookie("Device_Geo_Position_Address"),
                CalculationTime: clientScript.GetDateTimeOffset()
            }

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogFeeCalculation',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(feeCalculationModel)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        //Capture information of address autocomplete search no result.
        LogInformationOfAddressSearch: function (searchedAddress, recordReasonTypeCode, /*optional*/ issue) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            var addressSearchInformationObject = {
                EmailAddress: require('app').senderInfo().Customer().CustomerBasic.EmailAddress(),
                EquipmentId: $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress()),
                SearchedAddress: searchedAddress,
                RecordReasonTypeCode: recordReasonTypeCode,
                Issue: issue ? issue : 'N/A',
                ActionTime: clientScript.GetDateTimeOffset()
            }

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogAddressSearch',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(addressSearchInformationObject)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        /*
         * Function:
         *      Capture the request information of Cancellation.
         * Param:
         *      @cancellationActivityObj: This is a object, which should contain the following fields(ReceiptNumber, TransactionTypeId, TransactionStatusCode, PaymentStatusCode, BatchStatusId, CancellationFlag, CancelRequestTime, CancelProcessedTime).  
        */
        LogRequestInformationOfCancellation: function (cancellationActivityObj) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            if (typeof cancellationActivityObj === 'object') {
                cancellationActivityObj.CancelRequestedCategory = "Consumer";
                cancellationActivityObj.EmailAddress = require('app').senderInfo().Customer().CustomerBasic.EmailAddress();
                cancellationActivityObj.MemberLevel = require('app').senderInfo().SenderLevel().SenderLevelId;
                cancellationActivityObj.EquipmentId = $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress());
                cancellationActivityObj.GeoLocation = ($.cookie("Device_Geo_Position") === null || $.cookie("Device_Geo_Position").trim().length === 0) ?
                    $.cookie("Device_Geo_Position_Address") : $.cookie("Device_Geo_Position_Address") + "(" + $.cookie("Device_Geo_Position") + ")";
            }

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogCancellation',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(cancellationActivityObj)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        /* 
         * Function: 
         *     Capture information of address autocomplete search no result.
         * Param: 
         *     @isSelectYesInMessagePromot: If the address is not valid, it will pop message promot. And user click yes, the value is true.
         */
        LogAddressValidate: function (addressValidateInformation, isSelectYesInMessagePromot) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            addressValidateInformation = clientScript.GenerateAddressValidateObject(addressValidateInformation, isSelectYesInMessagePromot);

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogAddressValidate',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(addressValidateInformation)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        GenerateAddressValidateObject: function (addressValidateInformation, isSelectYesInMessagePromot) {
            var resultAddress = addressValidateInformation.ResultAddress;
            var analysis = resultAddress.Analysis;
            var metadata = resultAddress.Metadata;

            var addressValidateTypeCode = analysis.DpvMatchCode;

            if (analysis.DpvFootnotes == 'ZZ') {
                addressValidateTypeCode = 'IA'; // Indicate that API returned empty array - INVALID ADDRESS.
            }
            else if (!addressValidateTypeCode || addressValidateTypeCode == '[blank]') {
                addressValidateTypeCode = 'BLANK';
            }

            var object = {
                EmailAddress: require('app').senderInfo().Customer().CustomerBasic.EmailAddress(),
                EquipmentId: $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress()),
                AddressValidateTypeCode: addressValidateTypeCode,
                DwellingType: metadata.RedidentialDeliveryIndicator ?metadata.RedidentialDeliveryIndicator : 'Unknown',
                ZipType: metadata.ZipType ? metadata.ZipType : 'Standard',
                AddressValidateDetails: analysis.DpvFootnotes,
                VacantAddress: analysis.DpvVacantCode ? analysis.DpvVacantCode : 'BLANK',
                AddressUspsActive: analysis.Active ? analysis.Active : 'Unknown',
                AddressValidatedManually: isSelectYesInMessagePromot ? 'NO' : 'YES',
                ManualAddressTyped: resultAddress.DeliveryLine1 + ' | ' + resultAddress.Components.CityName + ' | ' + metadata.CountyName,
                ActionTime: clientScript.GetDateTimeOffset(),
                Address1: resultAddress.DeliveryLine1,
                Address2: resultAddress.DeliveryLine2,
                City: resultAddress.Components.CityName,
                StateName: resultAddress.Components.StateAbbreviation,
                ZipCode: resultAddress.Components.Zipcode
            }

            return object;
        },

        /*
         * Function: Capture user referral activity.
         *
         * Param: @referralLinkId 
         *            The referral link id for the referral.
         */
        LogReferralActivty: function(referralUrl){
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            var referralActivity = new Object();
            referralActivity.CardHolderId = require('app').senderInfo().Customer().CustomerBasic.CardHolderId();
            referralActivity.EmailAddress = require('app').senderInfo().Customer().CustomerBasic.EmailAddress();
            referralActivity.ReferralUrl = referralUrl;
            referralActivity.EquipmentId = $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress());
            referralActivity.ActionTime = clientScript.GetDateTimeOffset();

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogReferralActivity',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(referralActivity)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        /*
         * Function: Capture upgrade activity.
         */
        LogUpgradeActivity: function (upgradeActivity) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            delete upgradeActivity.Initialupgrade;

            upgradeActivity.CardHolderId = require('app').senderInfo().Customer().CustomerBasic.CardHolderId();
            upgradeActivity.EquipmentId = $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress());

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogUpgradeInitiated',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(upgradeActivity)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        /*
        * Function: Capture upgrade activity.
        */
        LogUpgradeUpdated: function (upgradeActivity) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }

            delete upgradeActivity.Initialupgrade;

            upgradeActivity.CardHolderId = require('app').senderInfo().Customer().CustomerBasic.CardHolderId();
            upgradeActivity.EquipmentId = $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress());

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogUpgradeUpdated',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(upgradeActivity)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        UpgradeDataCaptureModel: (function () {
            //Upgrade Initiator.
            UpgradeInitiator = null;

            //Count document change.
            numberOfChosenDocumentInPage1: 0;
            numberOfChosenDocumentInPage2: 0;
            chosenDocumentTypeId: 0;

            IndependentUpgradeDataCapture = {};

            //Exprots.
            return {
                //Initial upgrade data.
                InitialUpgradeDataCapture: function () {
                    numberOfChosenDocumentInPage1 = 0;
                    numberOfChosenDocumentInPage2 = 0;
                    chosenDocumentTypeId = 0;

                    return {
                        SourceLevelId: null,
                        TargetLevelId: null,
                        UpgradeInitiator: null,
                        UpgradeInitiatedOn: null,
                        UpgradeMethodToSubmit: "Not Submitted",
                        UpgradeSubmittedOn: null,
                        //Abandoned: null,
                        //RecipientNumber: null,
                        UpgradePromptOn: null,
                        TransactionUniqueCode: null,
                        UpgradeDocumentActivityArray: [],
                        Initialupgrade: function (senderLevelObject, upgradeInitiator, upgradePromptOnDatetime) {
                            this.SourceLevelId = senderLevelObject.SourceLevelId;
                            this.TargetLevelId = senderLevelObject.TargetLevelId;
                            this.UpgradeInitiator = upgradeInitiator;
                            this.UpgradeInitiatedOn = clientScript.GetDateTimeOffset();
                            this.UpgradePromptOn = upgradePromptOnDatetime;

                            if (upgradeInitiator != "Independent") {
                                this.TransactionUniqueCode = localStorage && localStorage.getItem("TransactionUniqueCode");
                            }
                        }
                    }
                },

                //Set value to flag UpgradeInitiator.
                SetUpgradeInitiator: function (value) {
                    UpgradeInitiator = value;
                },

                GetUpgradeInitiator: function () {
                    return UpgradeInitiator;
                },

                InitalIndependentUpgrade: function (senderLevelObject, upgradeInitiator, upgradePromptOnDatetime) {
                    IndependentUpgradeDataCapture = this.InitialUpgradeDataCapture();
                    IndependentUpgradeDataCapture.Initialupgrade(senderLevelObject, upgradeInitiator, upgradePromptOnDatetime);

                    clientScript.LogUpgradeActivity(IndependentUpgradeDataCapture);
                },

                GetIndependentUpgrade: function () {
                    return IndependentUpgradeDataCapture;
                },

                UpdateSubmittedInformation: function () {
                    IndependentUpgradeDataCapture.CompletedOn = IndependentUpgradeDataCapture.UpgradeSubmittedOn = clientScript.GetDateTimeOffset();

                    IndependentUpgradeDataCapture.UpgradeDocumentActivityArray.forEach(function (item) {
                        item.SubmittedOn = IndependentUpgradeDataCapture.CompletedOn;
                    })

                    if (sessionStorage.getItem("IsBrowser")) {
                        IndependentUpgradeDataCapture.UpgradeMethodToSubmit = "In-PC";
                    } else {
                        IndependentUpgradeDataCapture.UpgradeMethodToSubmit = "In-App";
                    }

                    var upgradeUpdatedActivity = {
                        TransactionUniqueCode: localStorage && localStorage.getItem("TransactionUniqueCode"),
                        SourceLevelId: IndependentUpgradeDataCapture.SourceLevelId,
                        TargetLevelId: IndependentUpgradeDataCapture.TargetLevelId,
                        CompletedOn: IndependentUpgradeDataCapture.CompletedOn,
                        UpgradeSubmittedOn: IndependentUpgradeDataCapture.UpgradeSubmittedOn,
                        UpgradeMethodToSubmit: IndependentUpgradeDataCapture.UpgradeMethodToSubmit,
                        UpgradeDocumentActivityArray: IndependentUpgradeDataCapture.UpgradeDocumentActivityArray
                    }

                    clientScript.LogUpgradeUpdated(upgradeUpdatedActivity);
                },

                ResetIndependentUpgrade: function () {
                    IndependentUpgradeDataCapture = null;
                },

                DocumentUploadInformation: function (documentTypeId) {
                    if (documentTypeId == 10) {
                        numberOfChosenDocumentInPage2 += 1;

                        IndependentUpgradeDataCapture.UpgradeDocumentActivityArray[1] = {
                            DocumentTypeId: documentTypeId,
                            InitiatedOn: clientScript.GetDateTimeOffset(),
                            NumberOfChosenDocument: numberOfChosenDocumentInPage2,
                            UploadDocumentMethod: "Upload",
                            PageId: 2
                        }
                    } else {
                        numberOfChosenDocumentInPage1 += 1;

                        IndependentUpgradeDataCapture.UpgradeDocumentActivityArray[0] = {
                            DocumentTypeId: documentTypeId,
                            InitiatedOn: clientScript.GetDateTimeOffset(),
                            NumberOfChosenDocument: numberOfChosenDocumentInPage1,
                            UploadDocumentMethod: "Upload",
                            PageId: 1
                        }
                    }
                },

                ResetDocumentUoloadInformation: function (documentTypeId) {
                    if (chosenDocumentTypeId == 0) {
                        chosenDocumentTypeId = documentTypeId
                    } else if (chosenDocumentTypeId != documentTypeId) {
                            numberOfChosenDocumentInPage1: 0;
                            numberOfChosenDocumentInPage2: 0;
                    }
                },

                AbandonedUpgrade: function () {
                    var upgradeUpdatedActivity = {
                        TransactionUniqueCode: localStorage && localStorage.getItem("TransactionUniqueCode"),
                        SourceLevelId: IndependentUpgradeDataCapture.SourceLevelId,
                        TargetLevelId: IndependentUpgradeDataCapture.TargetLevelId,
                        AbandonedOn: clientScript.GetDateTimeOffset(),
                        AbandonedScreenName: 'N/A',
                        UpgradeDocumentActivityArray: IndependentUpgradeDataCapture.UpgradeDocumentActivityArray
                    }

                    clientScript.LogUpgradeUpdated(upgradeUpdatedActivity);
                }
            }
        })(),

        //Log search activity when search with no result.
        LogSearchActivity: function (searingString, searchSectionTypeId) {
            if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                return;
            }
            var searchActivity = {};

            searchActivity.SearchString = searingString;
            searchActivity.LuSearchSectionTypeId = searchSectionTypeId;
            searchActivity.EmailAddress = require('app').senderInfo().Customer().CustomerBasic.EmailAddress();
            searchActivity.EquipmentId = $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress());
            searchActivity.ActionTime = clientScript.GetDateTimeOffset();

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/LogSearchActivity',
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(searchActivity)
            })
            .done(function (result) {
                //To do nothing.
            })
            .fail(function (xhr, status) {
            });
        },

        //Search section for search activity in data capture.
        LuSearchSectionType: {
            AddBillerInBillPay: 1,
            AddBillerInManagerBillers: 2,
            AddEpinCarrierInTopUp: 3,
            AddPinlessCarrierInManagerCarriers: 4,
            AddPinlessCarrierInTopUp: 5,
            AddReloadCarrierInManagerCarriers: 6,
            AddReloadCarrierInTopUp: 7,
            SearchFromAddedRecipientsInManagerRecipients: 8,
            SearchFromTransactionhistory: 9,
            SearchFromTransactedBillersInManagerBillers: 10,
            SearchFromTransactedCarriersInManagerCarriers: 11
        },

        //DatetimeOffset
        GetDateTimeOffset: function () {
            var date = new Date();
            return date.pattern("yyyy-MM-dd HH:mm:ss.S") + " " + date.timeZoneOffSet();
        },

        //Guid.
        newGuid: function () {
            var guid = "";
            for (var i = 1; i <= 32; i++) {
                var n = Math.floor(Math.random() * 16.0).toString(16);
                guid += n;
                if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
                    guid += "-";
            }
            return guid;
        },

        //Capture Transaction info which start from dashboard or left bar or fee calculator.
        CaptureTransactionInfo: function (startPositionCode, transactionTypeId) {
            if (startPositionCode == "FromLeftBar") {
                clientScript.AddTransactionStart(
                                                    clientScript.TransactionInitialPositions.FromLeftBar,
                                                    clientScript.QuickWays.NormalPay,
                                                    transactionTypeId,
                                                    clientScript.GetDateTimeOffset()
                                                );
            } else if (startPositionCode == "FromFeeCalculator") {
                clientScript.AddTransactionStart(
                                                    clientScript.TransactionInitialPositions.FromFeeCalculator,
                                                    clientScript.QuickWays.NormalPay,
                                                    transactionTypeId,
                                                    clientScript.GetDateTimeOffset()
                                                );
            } else {
                //For queryString is 'FromDashBoard'.
                //For user change url, default behaviour is starting transaction from Dashboard.
                clientScript.AddTransactionStart(
                                                    clientScript.TransactionInitialPositions.FromDashboard,
                                                    clientScript.QuickWays.NormalPay,
                                                    transactionTypeId,
                                                    clientScript.GetDateTimeOffset()
                                                );
            }
        },

        //Position type of starting transaction.
        TransactionInitialPositions: {
            FromDashboard: 1,
            FromLeftBar: 2,
            FromPromotions: 3,
            FromQuickPay: 4,
            FromClickToPay: 5,
            FromTxnHistory: 6,
            FromManageRecipients: 7,
            FromRecentTransaction: 8,
            FromFeeCalculator: 9
        },

        //Transaction type.
        TransactionTypes: {
            MoneyTransfer: 1,
            BillPay: 11,
            BillPayLCR: 5,
            TopUpReloadOrPinless: 12,
            TopUpEpin: 13
        },

        //Quick pay or normal pay.
        QuickWays: {
            QuickPay: 1,
            NormalPay: 0
        },

        //IBV Data Capture.
        IBVDataCaptureMmodel: (function () {
            var IbvCallUniqueCode = null;

            return {
                InitializeIbvActivity: function () {
                    IbvCallUniqueCode = clientScript.newGuid();

                    if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                        return;
                    }

                    var IbvActivityObject = {
                        TransactionUniqueCode: localStorage && localStorage.getItem("TransactionUniqueCode"),
                        IbvCallUniqueCode: IbvCallUniqueCode,
                        DeviceId: $.cookie("EquipmentId") ? $.cookie("EquipmentId") : $.cookie("EquipmentId_" + require('app').senderInfo().Customer().CustomerBasic.EmailAddress())
                    }

                    $.ajax({
                        url: localStorage.getItem("DataCaptureServerUrl") + '/DataCapture/LogTransactionIbvActivity',
                        dataType: "json",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(IbvActivityObject)
                    })
                    .done(function (result) {
                        //To do nothing.
                    })
                    .fail(function (xhr, status) {
                    });
                },
                UpdateIbvActivity: function (paymentMethodId) {
                    if (IbvCallUniqueCode == null) {
                        return;
                    }

                    if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                        return;
                    }

                    var UpdateIbvActivityObject = {
                        TransactionUniqueCode: localStorage && localStorage.getItem("TransactionUniqueCode"),
                        IbvCallUniqueCode: IbvCallUniqueCode,
                        PaymentMethodId: paymentMethodId
                    }

                    $.ajax({
                        url: localStorage.getItem("DataCaptureServerUrl") + '/DataCapture/LogUpdateTransactionIbvActivity',
                        dataType: "json",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(UpdateIbvActivityObject)
                    })
                    .done(function (result) {
                        //To do nothing.
                    })
                    .fail(function (xhr, status) {
                    });
                },
                AddTransactionIbvCardInfo: function ( /*The response from yodlee api call*/ yodleeObject) {
                    if (IbvCallUniqueCode == null || require('app').page().name == "SettingsConsumer") {
                        return;
                    }

                    if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                        return;
                    }

                    var IbvCardInfoObject = {
                        IbvCallUniqueCode: IbvCallUniqueCode,
                        BankAccountHolderName: yodleeObject.AccountName,
                        BankAccountType: yodleeObject.AccountType,
                        BankRoutingName: yodleeObject.AccountId,
                        BankAccountNumber: yodleeObject.AccountNumber,
                        BankBalance: yodleeObject.AvailableBalance.Amount
                    }

                    $.ajax({
                        url: localStorage.getItem("DataCaptureServerUrl") + '/DataCapture/LogTransactionIbvCardInfo',
                        dataType: "json",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(IbvCardInfoObject)
                    })
                    .done(function (result) {
                        //To do nothing.
                    })
                    .fail(function (xhr, status) {
                    });
                },
                AddTransactionIbvCost: function (ibvCostId) {
                    if (IbvCallUniqueCode == null || require('app').page().name == "SettingsConsumer") {
                        return;
                    }

                    if (!(localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled)) {
                        return;
                    }

                    var IbvCostObject = {
                        IbvCallUniqueCode: IbvCallUniqueCode,
                        IbvCostId: ibvCostId
                    }

                    $.ajax({
                        url: localStorage.getItem("DataCaptureServerUrl") + '/DataCapture/LogTransactionIbvCost',
                        dataType: "json",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(IbvCostObject)
                    })
                    .done(function (result) {
                        //To do nothing.
                    })
                    .fail(function (xhr, status) {
                    });
                },

            }
        })(),
        /***************************************************Data Capture End***********************************************************/

        HideSystemProfile: function () {
            if ($('#system-profile').hasClass('open')) {
                $('#toggle-profile').click();
            }
        },
        SessionTimeOut: {
            mcntNoneActivityTimeOut: 0,
            mcntActivityCheckInterval: 0,
            mobjLastActivityDate: null,
            mintActivityCheckHandle: null,

            updateLastActivityCheck: function (event) {
                clientScript.SessionTimeOut.mobjLastActivityDate = new Date();
            },

            setActivityCheckOn: function (intNoneActivityTimeOut, intActivityCheckInterval) {
                var self = clientScript.SessionTimeOut;
                self.mcntNoneActivityTimeOut = Number(intNoneActivityTimeOut) * 1000;
                self.mcntActivityCheckInterval = Number(intActivityCheckInterval) * 1000;

                self.mobjLastActivityDate = new Date();

                $('body').off('click.setTimeout', 'a', self.updateLastActivityCheck);
                $('body').on('click.setTimeout', 'a', self.updateLastActivityCheck);

                self.mintActivityCheckHandle = window.setInterval(function () {
                    if (new Date() - self.mobjLastActivityDate > self.mcntNoneActivityTimeOut) {
                        if (require('app').senderInfo() != null) {
                            self.setActivityCheckOff();
                            ModelSessionTimeOut$RevealAndLogout();
                        }
                    }
                }, self.mcntActivityCheckInterval);

                return self;
            },

            setActivityCheckOff: function () {
                var self = clientScript.SessionTimeOut;

                $('body').off('click.setTimeout', 'a', self.updateLastActivityCheck);

                if (self.mintActivityCheckHandle != null) {
                    window.clearInterval(self.mintActivityCheckHandle);
                }

                return self;
            }
        },

        enterToNext: {
            selectParentHeight: 0,
            selectHeight: 0,
            selectOptionHeight: 0,
            isSelectVisible: false,
            isSaveButton: function (element) {
                var array = [commonstrings.buttons.save, commonstrings.buttons.cancel,
                    setingconsumeratrings.personalsettings.password.buttons.changepassword,
                    setingconsumeratrings.personalsettings.profile.buttons.updateprofile,
                    setingconsumeratrings.personalsettings.address.buttons.updateaddress,
                    setingconsumeratrings.personalsettings.preferences.buttons.updatepreferences];

                return element && (array.indexOf($(element).children("span").text()) >= 0 || array.indexOf($(element).text()) >= 0);
            },
            resetSelectHeight: function () {
                var enterToNext = clientScript.enterToNext;
                enterToNext.selectParentHeight = 0;
                enterToNext.selectHeight = 0;
                enterToNext.selectOptionHeight = 0;
                return enterToNext;
            },
            setSelectHeight: function (element) {
                var enterToNext = clientScript.enterToNext;
                if (!enterToNext.selectParentHeight) {
                    enterToNext.selectParentHeight = $(element).parent().outerHeight();
                }
                if (!enterToNext.selectHeight) {
                    enterToNext.selectHeight = $(element).outerHeight();
                }
                if (!enterToNext.selectOptionHeight) {
                    enterToNext.selectOptionHeight = $(element).height();
                }
                return enterToNext;
            },
            resetSelectSize: function (element) {
                var enterToNext = clientScript.enterToNext;
                enterToNext.setSelectHeight(element);
                element.size = 1;
                $(element).parent().removeAttr("style");
                $(element).removeAttr("style");
                $(element).outerHeight(enterToNext.selectHeight);
                return enterToNext;
            },
            findNextElement: function (element) {
                var parent = $(element).closest("section.mod-wrapper, div.mod-wrapper"),
                    elements = $(parent).find('input:visible:enabled, select:visible:enabled, a:visible'),
                    index = elements.index(element),
                    next = index < elements.length - 1 ? index + 1 : index,
                    nextElement = elements[next];

                if (nextElement && $(nextElement).attr("auto-slide") == "false") {
                    //For add credit/debit card: it need to filter the help image
                    next++;
                }
                return elements[next];
            },
            findPreviousElement: function (element) {
                var parent = $(element).closest("section.mod-wrapper, div.mod-wrapper"),
                 elements = $(parent).find('input:visible:enabled, select:visible:enabled, a:visible'),
                 index = elements.index(element),
                 nextElement = index - 1;
                return elements[nextElement];
            },
            autocompleteCustomEvent: function () {
                var enterToNext = clientScript.enterToNext;
                $("body").off("click.autoNext", ".autocomplete-suggestions")
                .on("click.autoNext", ".autocomplete-suggestions", function () {
                    var element = $(this).parent().children('input')[0];
                    enterToNext.moveToNext(element, enterToNext.findNextElement(element));
                });
                return enterToNext;
            },
            expandSelect: function (element) {
                var enterToNext = clientScript.enterToNext, elementHeight,
                    parent = $(element).parent();
                enterToNext.setSelectHeight(element);

                if ($(element).attr("data-size")) {
                    element.size = $(element).attr("data-size");
                    elementHeight = element.size * enterToNext.selectOptionHeight;
                    $(element).height(elementHeight);
                } else if (element.length > 10) {
                    element.size = 10;
                    elementHeight = 10 * enterToNext.selectOptionHeight;
                    $(element).height(elementHeight);
                } else {
                    var elementSize = element.options.length == 0 ? 1 : element.options.length;
                    element.size = elementSize;
                    elementHeight = elementSize * enterToNext.selectOptionHeight;
                    $(element).height(elementHeight);
                }

                parent.css({ 'max-height': enterToNext.selectParentHeight + 'px', 'z-index': 10000 });

                if ($(element).attr("data-position") == "top") {
                    parent.css({ 'bottom': $(element).outerHeight() - enterToNext.selectParentHeight + 'px' });
                }

                $(element).css({ 'background-position': 'calc(100% - 1rem) -9999px' })
                .hover(function () {
                    if (this.size > 1) {
                        $(this).css({ 'background-position': 'calc(100% - 1rem) -9999px' });
                    }
                });
            },
            shrinkSelect: function () {
                var enterToNext = clientScript.enterToNext;
                if (!clientScript.IsChrome() && !clientScript.IsMobileDevice()) {// For IE and FF
                    $("body").off("click.shrinkSelect", "form[auto-slide-input], div[auto-slide-input]")
                    .on("click.shrinkSelect", "form[auto-slide-input], div[auto-slide-input]", function (e) {
                        var elements = $(this).find("select[size]:visible");
                        if (elements.length > 0) {
                            elements.each(function (index, element) {
                                if ($(element).attr("size") > 1 && !e.isTrigger) {// If there is jquery trigger event, prevent it reset.
                                    clientScript.enterToNext.resetSelectSize(element);
                                }
                            });

                        }
                    });
                }
                return enterToNext;
            },
            templateEvent: function (eventType, callback) {
                var bindEle = 'form[auto-slide-input] input:enabled:visible, form[auto-slide-input] select:enabled:visible[autoslide!=false],' +
                'form[auto-slide-input] a.button:visible, div[auto-slide-input] input:enabled:visible,' +
                'div[auto-slide-input] select:enabled:visible[autoslide!=false], div[auto-slide-input] a.button:visible';

                $('body').off(eventType + ".moveToNext", bindEle)
                .on(eventType + ".moveToNext", bindEle, function (e) {
                    if (typeof callback === "function") {
                        callback(e, this);
                    }
                });
            },
            moveToNext: function (currentElement, nextElement, fn, e) {
                if (!currentElement || !nextElement) {
                    return;
                }

                var enterToNext = clientScript.enterToNext;
                element = $(nextElement)[0];
                $(element, currentElement).on("touchstart.moveToNext", function (e) {
                    var self = this;
                    if ($(currentElement).attr("id") == "input-credit-debit" && !$(currentElement).hasClass("isGTB")) {
                        $(currentElement).blur();
                    } else {
                        if (typeof fn === "function") {
                            $.when(fn(currentElement))
                            .done(function () {
                                if (clientScript.IsIOS() && currentElement.tagName == 'SELECT' && element.tagName == 'INPUT') {
                                    if (!clientScript.IsIOS8()) {
                                        setTimeout(function () {
                                            self.focus();
                                        }, 300);
                                    }
                                }
                                else {
                                    setTimeout(function () {
                                        self.focus();
                                    });
                                }

                            });
                        } else if (self.tagName === "SELECT" && !clientScript.IsIOS() && !clientScript.IsMobileDevice()) {
                            //For FF&IE: the select element need to be focused, or it will no used by up and down key.                         
                            self.focus();
                        } else if (self.tagName != "SELECT") {
                            if (clientScript.IsIOS() && currentElement.tagName == 'SELECT' && element.tagName == 'INPUT') {
                                if (!clientScript.IsIOS8()) {
                                   setTimeout(function () {
                                       self.focus();
                                    }, 300);
                                }
                            }
                            else {
                                setTimeout(function () {
                                    self.focus();
                                });
                            }
                        } else if (currentElement.tagName === "SELECT" && nextElement.tagName === "SELECT" && clientScript.IsIOS()) {
                            $(currentElement).focus();
                        }
                    }

                    $(self).off("touchstart.moveToNext");
                });

                if (($(currentElement).hasClass("isGTB") || $(currentElement).attr("id") != "input-credit-debit") && element && element.tagName == 'SELECT') {
                    if (clientScript.IsMobileDevice()) {
                        if (!clientScript.IsIOS()) {
                            //For android: if the current and next are select element, the next element can not expand.
                            setTimeout(function () {
                                clientScript.dispatchEvent(element);
                            });
                        } else {
                            //For IOS: if add setTimeout, the select element can not shrink in ipad safari.
                            clientScript.dispatchEvent(element);
                        }
                    }
                    else {// In FireFox, IE and Chrome, we can't expand dropdown by dispatchEvent when it is focused, so we use this simulation way.
                        setTimeout(function () { // For ie&FF, when select the current element by click, the next select element will not expand.
                            if (element.tagName == 'SELECT' && currentElement.tagName == 'SELECT') {
                                $(element).focus();
                            }
                            enterToNext.expandSelect(element);
                        })
                    }
                }

                if (currentElement.tagName == 'SELECT') {
                    //If the select is using simulation way to expand its list when foucsed. Then, when leave, restore it to original style.
                    if (!clientScript.IsMobileDevice()) {
                        // Check if the select expanded.
                        // 40 is the height of 2 options.
                        var optionsHeight = 40;
                        if (e && e.which == 9 && $(currentElement).height() > optionsHeight) {
                            return setTimeout(function () { // If there is no setTimeout, the ie browser will crash.
                                enterToNext.resetSelectSize(currentElement);
                            });
                        }
                        else {
                            setTimeout(function () { // If there is no setTimeout, the ie browser will crash.
                                enterToNext.resetSelectSize(currentElement);
                            });
                        }
                    }
                }

                //Only for the last element is input text element, not select or datepicker.
                if (element && element.tagName == 'A' && currentElement.tagName !== "A" && currentElement.tagName !== "SELECT"
                    && !$(currentElement).attr("data-date-format") && (!$(currentElement).attr("autocomplete") || (e && e.which === 13))) {// If the last is autocomplete, it should enter to next, but execpt click.                   
                    $(currentElement).blur();
                    return $(element).blur().trigger("click");
                }

                if (e && e.which === 13 && $(element).attr("type") === "date" && clientScript.IsMobileDevice() && $(nextElement).attr("id") == "input-birth-day") {
                    //Only for Data of Birth in Tab E, when user click "Go" key
                    $(currentElement).blur();
                    return $(".text-placeholder").trigger("focus");
                } else if ($(element).attr("type") === "date") {
                    $(currentElement).blur();
                    return $(element).trigger("click");
                }

                // For press enter button when on save or cencel button.
                if (e && e.which === 13 && enterToNext.isSaveButton(currentElement) && !clientScript.IsMobileDevice()) {
                    return $(currentElement).blur().trigger("click");
                }

                if (element) {
                    $(element).trigger('touchstart.moveToNext');
                }
            },
            init: function () {
                var enterToNext = clientScript.enterToNext;
                enterToNext.isSelectVisible = false;

                enterToNext.templateEvent('click', function (e, element) {
                    enterToNext.isSelectVisible = true;
                    if (element.tagName === "SELECT" && element.size > 1) {
                        enterToNext.moveToNext(element, enterToNext.findNextElement(element));
                    } else {
                        $('body').off("click.moveToNext", "input:enabled:visible");
                    }
                });

                enterToNext.templateEvent('keydown', function (e, element) {
                    enterToNext.isSelectVisible = true;
                    var nextElement = enterToNext.findNextElement(element);
                    //If the last element is save button, focus save button.
                    //But except mobile device, because the next button is 9.
                    if (e.which == 9 && enterToNext.isSaveButton(nextElement) && !clientScript.IsMobileDevice()) {
                        // Check if the select expanded.
                        if (element.tagName == 'SELECT' && $(element).height() > 40) {
                            // No nothing.
                        }
                        else {
                            e.preventDefault();
                            return $(nextElement).focus();
                        }
                    }

                    if (clientScript.isKeyPressEnter(e.which) || e.which == 9) {
                        e.preventDefault();
                        // Stop move to next if element is retype field like confirm account field.
                        if (clientScript.isRetypeField(element.id)) {
                            var value = clientScript.GetRemoveFormatNumber($(element).val());
                            var previousElement = enterToNext.findPreviousElement(element);
                            var previousValue = clientScript.GetRemoveFormatNumber($(previousElement).val());
                            if (value && value.length > 0 && value != previousValue) {
                                return $(element).trigger("change");
                            }
                        }

                        if (element.id == "input-credit-debit" && clientScript.IFrameTokenServiceUrl.length > 0
                            && clientScript.getPaymentProviderId() == clientScript.PaymentProvider.EPayments) {
                            var iframe = document.getElementById('card-number');
                            iframe.contentWindow.postMessage('txtText_Focus', clientScript.IFrameTokenServiceUrl);
                        }
                        else {
                            enterToNext.moveToNext(element, nextElement, undefined, e);
                        }
                    }
                });

                enterToNext.templateEvent('change', function (e, element) {
                    if (enterToNext.isSelectVisible && element.tagName === "SELECT" && element.size < 2) {
                        e.preventDefault();

                        if (element.id == "input-credit-debit" && clientScript.IFrameTokenServiceUrl.length > 0
                            && clientScript.getPaymentProviderId() == clientScript.PaymentProvider.EPayments) {
                            var iframe = document.getElementById('card-number');
                            iframe.contentWindow.postMessage('txtText_Focus', clientScript.IFrameTokenServiceUrl);
                        }
                        else {
                            enterToNext.moveToNext(element, enterToNext.findNextElement(element));
                        }
                    }
                    return true;
                });

                enterToNext.templateEvent('blur', function (e, element) {
                    if (enterToNext.isSelectVisible && element.tagName === "SELECT") {
                        var twoOptionsHeight = 40;
                        if ($(element).height() > twoOptionsHeight) {
                            // If there is no setTimeout, the ie browser will crash.
                            setTimeout(function () {
                                enterToNext.resetSelectSize(element);
                            });
                        }
                    }
                    return true;
                });

                enterToNext.autocompleteCustomEvent().resetSelectHeight().shrinkSelect();
            }
        },
        datepickerFormat: function () {
            var date;
            $("[data-date-format]").off("changeDate.datepickerFormat")
            .on("changeDate.datepickerFormat", function () {
                date = this.value;
            });

            require(['Foundation.DatePicker'], function () {
                $("body").off("input.datepickerFormat", "[data-date-format]")
                .on("input.datepickerFormat", "[data-date-format]", function (e) {
                    var that = $(this);
                    var value = that.val();
                    var formatValue = value.replace(/[^\d]*/g, "");
                    var matchValue = value.replace(/^([\d]{1,2}).?\/([\d]{0,2}).?\/(\d{0,4}).?$/, "$1/$2/$3");
                    var trigger = function () {
                        if (that.parent().next().children(".error-msg").css("display") == "block") {//If there is error message, trigger validation.
                            that.trigger("change");
                        }
                    }

                    date = clientScript.isDate(value) ? value : date;
                    if (value.match(/^\d\d?\/\d{0,2}(\/\d{0,4})?$/) || value.match(/^\/\d{1,2}\/\d{1,4}$/)) {
                        return trigger();
                    }

                    if (matchValue != value) {
                        that.val(matchValue);
                        return trigger();
                    }

                    //Format the input value to date format and remove the last '/' of the result
                    formateValue = formatValue.replace(/^([\d]{2})(\d{1,2})(\d{4})?/g, "$1/$2/$3").replace(/\/$/, "");
                    that.val(formateValue.substr(0, 10))
                }).off("blur.datepickerFormat", "[data-date-format]")
                .on("blur.datepickerFormat", "[data-date-format]", function (e) {
                    var that = $(this);

                    if (date && !that.val().match(/\d{1,2}\/\d{1,2}\/\d{1,4}/) && !clientScript.isDate(that.val())) {
                        that.val(date);
                        return that.trigger("change");
                    }
                    that.fdatepicker("setValue").trigger("change");
                    date = that.val();
                }).off("click.datepickerFormat")
                .on("click.datepickerFormat", "[data-date-format]", function () {
                    $(this).fdatepicker("show");
                });
            })
        },
        isDate: function (date, format) {
            if (date instanceof Date) return true;
            if (!format) format = "mm/dd/yyyy";

            var parts = format.split(/\/|-/);
            var parttern = "^";
            for (var i = 0, j = parts.length - 1; i <= j; i++) {
                if (i == j) {
                    parttern += "[\\d]{" + parts[i].length + "}$";
                } else {
                    parttern += "[\\d]{" + parts[i].length + "}[/|-]";
                }
            }
            parttern = new RegExp(parttern);
            if (clientScript.IsMobileDevice()) return !/Invalid|NaN/.test(new Date(date)); //For h5 date type
            return date.match(parttern) && !/Invalid|NaN/.test(new Date(date)); //For datepicker
        },
        equals: function (str1, str2, isTrim) {
            if (str1 && str2 && isTrim) {
                str1 = str1.trim();
                str2 = str2.trim();
            }

            if (str1 === str2) {
                return true;
            }
            return false;
        },
        executeStatus: function () {
            var self = this;
            self.value = false;

            self.isExecuting = function () {
                return self.value
            }

            self.setExecuting = function () {
                self.value = true;
            }

            self.complete = function () {
                clientScript.modalSetTimeout(function () {
                    self.value = false;
                });
            }

            self.reset = function () {
                self.value = false;
            }

            window.addEventListener("error", function (err) {
                self.value = false;
                return true;
            });
        },
        modalSetTimeout: function (callBack) {
            setTimeout(function () {
                if (typeof callBack == 'function') {
                    callBack();
                }
            }, 300);
        },
        closeModalCallBack: function (modalId, callback) {
            if (!modalId) {
                return;
            }

            modalId = modalId.indexOf('#') == 0 ? modalId : '#' + modalId;
            $(modalId).off('close.modal');
            var func = function () {
                if (clientScript.isCancelCloseModalCallBack) {
                    clientScript.isCancelCloseModalCallBack = false;
                    $(modalId).one('close.modal', func);
                    return;
                }
                if (typeof callback == 'function') {
                    callback();
                }
            }
            $(modalId).one('close.modal', func);
        },
        internetConnectionWhetherAvailable: function () { // Return true if network available, otherwise retrun false.
            var xhr = new XMLHttpRequest();
            var requestFavicon = window.location.origin + "/favicon.ico";
            var randomNum = (new Date()).getTime() + "" + Math.round(Math.random() * 10000);

            xhr.open('HEAD', requestFavicon + "?rand =" + randomNum, false);

            try {
                xhr.send();
                if (xhr.status >= 200 && xhr.status < 304) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        },
        addPlaceHolderToDate: function () {
            $(".text-placeholder").css("display", "block")
            .off("click").on("click", function () {
                if (clientScript.IsIOS()) {
                    $(this).css("display", "none");
                }
                $(this).nextAll(".date-placeholder").removeAttr("title");
                $(this).nextAll(".label-placeholder").click();
            });

            $(".date-placeholder").off("blur").on("blur", function () {
                if (!$(this).val()) {
                    $(this).prevAll(".text-placeholder").css("display", "block");
                }
            }).off("touchstart").on("touchstart", function () {
                $(this).removeAttr("title");
            });
            $(".date-placeholder").off("change.cs").on("change.cs", function () {
                if (!$(this).val()) {
                    $(this).prevAll(".text-placeholder").css("display", "block");
                }
            });
        },
        showInfoWhenInternetUnavailable: function () {
            //if (!clientScript.internetConnectionWhetherAvailable()) {
            //    //The network error
            //    clientScript.showError({ Message: "Please check your network.", Caption: "Error" });
            //}
        },
        fitTextAmountField: function (element, value) {
            var $input = $(element);
            if ($input && $input.length > 0) {
                defaultSize = $input.css('font-size', '').css('font-size');
                var minSize = 1;
                var maxSize = parseFloat(defaultSize || $input.css('font-size'), 10);
                var clone = $input.next("div");
                var width = $input.width();

                clone.html(value);

                var ratio = width / (clone.width() || 1);
                var currentFontSize = parseInt(clone.css('font-size'), 10);
                var fontSize = Math.floor(currentFontSize * ratio);
                if (fontSize > maxSize) { fontSize = maxSize; }
                if (fontSize < minSize) { fontSize = minSize; }

                $input.css('font-size', fontSize);
                clone.css('font-size', fontSize);
                $input.val(value);
            }
        },

        GetRemoveFormatPhoneNumber: function (phoneNumber) {
            if (!phoneNumber) {
                return phoneNumber;
            }

            var regAreaCode = new RegExp(/^\+[\d|/|\s]*-/);
            phoneNumber = phoneNumber.replace(regAreaCode, '');

            phoneNumber = phoneNumber.replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '').replace(/-/g, '');
            if (phoneNumber.length > 17) {
                phoneNumber = phoneNumber.substr((phoneNumber.length - 17), phoneNumber.length - 1);
            }
            return phoneNumber;
        },
        GetRemoveFormatNumber: function (number) {
            if (!number) {
                return number;
            }

            var regAreaCode = new RegExp(/^\+[\d|/|\s]*-/);
            number = number.replace(regAreaCode, '');
            number = number.replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '').replace(/-/g, '');

            return number;
        },
        /* For additional info*/
        setErrorMessage: function (element, errorMessageElement, errorMessage) {
            element.addClass("error");
            errorMessageElement.html(errorMessage);
            errorMessageElement.css("display", "block");
        },
        emptyErrorMessage: function (element, errorMessageElement) {
            element.removeClass("error");
            errorMessageElement.html("");
            errorMessageElement.css("display", "none");
        },
        validateRequiredValue: function (obj) {
            var errorMessageName = obj.attr('name');
            var elementErrorMessage = $("#" + obj.attr('id') + "-error-msg");

            if (obj.val() == "" || obj.val() == null) {
                clientScript.setErrorMessage(obj, elementErrorMessage, errorMessageName + commonstrings.clientscriptjsmessagebox.isrequired);
            } else {
                if (elementErrorMessage.html() == (errorMessageName + commonstrings.clientscriptjsmessagebox.isrequired)) {
                    clientScript.emptyErrorMessage(obj, elementErrorMessage);
                }
            }
        },
        validateLookUpRequired: function (obj) {
            var errorMessageName = obj.attr('name');
            var elementErrorMessage = $("#" + obj.attr('id') + "-error-msg");
            if (obj[0].options.length > 0) {
                var selectedValue = obj.find('option:selected').text();
                if (selectedValue == "" || selectedValue == null || obj.find('option:selected').val() == '') {
                    clientScript.setErrorMessage(obj, elementErrorMessage, errorMessageName +' '+ commonstrings.clientscriptjsmessagebox.isrequired);
                } else {
                    if (elementErrorMessage.html() == errorMessageName + ' ' + commonstrings.clientscriptjsmessagebox.isrequired) {
                        clientScript.emptyErrorMessage(obj, elementErrorMessage);
                    }
                }
            } else {
                if (elementErrorMessage.html() == errorMessageName + ' ' + commonstrings.clientscriptjsmessagebox.isrequired) {
                    clientScript.emptyErrorMessage(obj, elementErrorMessage);
                }
            }
        },
        validateEmailFormat: function (obj) {
            var errorMessageName = obj.attr('name');
            var elementErrorMessage = $("#" + obj.attr('id') + "-error-msg");

            if (obj.val() == "" || obj.val() == null) {
                clientScript.setErrorMessage(obj, elementErrorMessage, errorMessageName + ' ' + commonstrings.clientscriptjsmessagebox.isrequired);
            } else {
                if (clientScript.EmailAddressFormatValidation(tempElement.val())) {
                    clientScript.setErrorMessage(obj, elementErrorMessage, commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + errorMessageName + commonstrings.clientscriptjsmessagebox.enteravalidvalidation);
                } else {
                    clientScript.emptyErrorMessage(obj, elementErrorMessage);
                }
            }
        },
        keepAmountDecimalPlaces: function (value) {
            if ((value && !isNaN(value)) || value === 0) {
                value = parseFloat(value).toFixed(2);
            }

            return clientScript.getFormatFloat(value);
        },
        validateNumberFormat: function (number, length, name) {
            var message = commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + name + commonstrings.clientscriptjsmessagebox.enteravalidvalidation;
            var elementErrorMessage = $("#" + number.attr('id') + "-error-msg");
            if (number.val() == "" || number.val() == null) {
                clientScript.setErrorMessage(number, elementErrorMessage, name + ' ' + commonstrings.clientscriptjsmessagebox.isrequired);
            } else {
                if (isNaN(number.val())) {
                    clientScript.setErrorMessage(number, elementErrorMessage, message);
                } else if (number.val().length != length) {
                    clientScript.setErrorMessage(number, elementErrorMessage, message);
                } else {
                    clientScript.emptyErrorMessage(number, elementErrorMessage);
                }
            }
        },
        validateFullDateTime: function (element) {
            var errorMessageName = element.attr('name');
            var elementErrorMessage = $("#" + element.attr('id') + "-error-msg");
            if (element.val() == "" || element.val() == null) {
                clientScript.setErrorMessage(element, elementErrorMessage, errorMessageName + ' ' + commonstrings.clientscriptjsmessagebox.isrequired);
            } else {
                var inputDate = element.val();

                // Just validate the formate this scenario.
                if (clientScript.ValidateDate(inputDate, 'BillerBirth')) {
                    clientScript.emptyErrorMessage(element, elementErrorMessage);
                } else {
                    clientScript.setErrorMessage(element, elementErrorMessage, errorMessageName + ' ' + commonstrings.clientscriptjsmessagebox.isinvalid);
                }
            }
        },

        bindChange: function (fields) {
            $.each(fields, function (index, field) {
                var element = $("#" + field.ControlId());
                if (field.Type() == 2) {
                    element.on('keypress', function (event) {
                        if (!clientScript.validateKeyPressPositiveNumeric(event, this)) {
                            return false;
                        }
                    });
                    element.on('focus', function () {
                        var tempElement = $(this);
                        var amount = tempElement.val().replace(/,/g, '');
                        if (/\.00$/.test(amount)) {
                            amount = amount.replace(/\.00/, '');
                        }
                        tempElement.val(amount);
                    });
                    element.on('blur', function () {
                        var tempElement = $(this);
                        if (tempElement.val() != null && tempElement.val() != "") {
                            var amount = tempElement.val().replace(/,/g, '');
                            tempElement.val(clientScript.keepAmountDecimalPlaces(amount));
                        }
                    });
                }
                if (field.Type() == 3) {
                    if (!clientScript.IsMobileDevice()) {
                        require(['Foundation.DatePicker'], function () {
                            var enterToNext = clientScript.enterToNext;
                            var tempElement = $(element);
                            var options = {};
                            options.appendElement = tempElement.parents()[1],
                            options.container = tempElement.closest(".reveal-modal"),
                            options.startDate = new Date('01/01/1753')
                            tempElement.fdatepicker(options);
                            $(tempElement).data('datepicker').picker.off("click.moveToNext").on("click.moveToNext", ".day", (function (tempElement) {
                                return function () {
                                    enterToNext.moveToNext($(tempElement)[0], enterToNext.findNextElement($(tempElement)[0]));
                                };
                            })(tempElement));
                            clientScript.datepickerFormat();
                        });
                    }
                }
            });
        },
        applyBillerAdditionalValidation: function (fields) {
            $.each(fields, function (index, field) {
                var options = {};
                if (field.IsRequired()) {
                    options.required = {
                        params: true,
                        message: field.Name().replace(/ \w/g, function (v) { return v.toLowerCase(); }) + ' ' + commonstrings.clientscriptjsmessagebox.isrequired
                    }
                }
                if (field.Type() == 1) {
                    if (field.FieldId() == 27) {
                        options.email = {
                            params: true,
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().toLowerCase() + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                    }
                    else if (field.FieldId() == 6) { // Middle Initial field
                        options.equal = {
                            onlyIf: function () {
                                if (field.Value()) {
                                    return clientScript.IsInvalidName(field.Value()) != 0;
                                }
                                return false;
                            },
                            //Inline message
                            message: field.Name().replace(/ \w/g, function (v) { return v.toLowerCase(); }) + ' ' + commonstrings.clientscriptjsmessagebox.namestartwithletter
                        }
                    }
                } else if (field.Type() == 3) {
                    if (field.FieldId() == 17) {
                        options.isMinDate = {
                            params: 'BillerDateOfBirth',
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().toLowerCase() + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                        options.isValidDate = {
                            params: 'BillerDateOfBirth',
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().toLowerCase() + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                    }
                } else if (field.Type() == 4) {
                    if (field.FieldId() == 12 || field.FieldId() == 13 || field.FieldId() == 25) {
                        options.maxLength = {
                            params: field.MaxLength(),
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().toLowerCase() + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                        options.minLength = {
                            params: field.MaxLength(),
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().toLowerCase() + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                    } else if ([14, 15].indexOf(field.FieldId()) != -1) {
                        options.maxLength = {
                            params: field.MaxLength(),
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().replace(/ \w/g, function (v) { return v.toLowerCase(); }) + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                        options.minLength = {
                            params: field.MaxLength(),
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().replace(/ \w/g, function (v) { return v.toLowerCase(); }) + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                    } else if (field.FieldId() == 16) {
                        options.maxLength = {
                            params: field.MaxLength(),
                            message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().replace(/ \w/g, function (v) { return v.toLowerCase(); }) + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                        }
                    }
                } else if (field.Type() == 5) {
                    options.maxLength = {
                        params: 10,
                        message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().toLowerCase() + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                    }
                    options.minLength = {
                        params: 10,
                        message: commonstrings.clientscriptjsmessagebox.enteravalid + ' ' + field.Name().toLowerCase() + commonstrings.clientscriptjsmessagebox.enteravalidvalidation
                    }
                }

                if (JSON.stringify(options) != '{}') {
                    field.Value.extend(options).isModified(false);
                }
            });
        },
        validateAdditionalFields: function (fields) {
            var isValid = true;
            $.each(fields, function (index, field) {
                if (typeof field.Value.isValid == 'function') {
                    if (!field.Value.isValid()) {
                        field.Value.isModified(true);
                        isValid = false;
                    }
                }
            })

            return isValid;
        },
        closeFoundationDropdown: function () {
            var $doc = $(document),
                $win = $(window),
                $docHeight = $doc.height(),
                $winHeight = $win.height(),
                $docWidth = $doc.width(),
                $winWidth = $win.width();

            var $tableWrappers = $('.table-wrapper');
            if ($tableWrappers.length) {
                require(['foundation.extended'], function () {
                    var getFloat = function (pixelValue) {
                        var offset = parseFloat(pixelValue);
                        return isNaN(offset) ? 0 : offset;
                    };

                    $('.f-dropdown.table-options').each(function (idx, dropdown) {

                        var isOpen = false,
                            $tableWrapper,
                            $dropdown = $(dropdown),
                            presetMarginLeft,
                            presetMarginTop,
                            reposition = function () {
                                if (isOpen && $tableWrapper && $tableWrapper.length) {
                                    var marginLeft = getFloat($tableWrapper.scrollLeft()) * -1 + presetMarginLeft,
                                        positionLeft = getFloat($dropdown.css('left')) * -1;
                                    $dropdown.css({
                                        'margin-left': Math.max(marginLeft, positionLeft) + 'px',
                                        'margin-top': getFloat($tableWrapper.scrollTop()) * -1 + presetMarginTop + 'px'
                                    });
                                }
                            };

                        if ($dropdown.length) {
                            $dropdown.off('opened.fndtn.dropdown').off('closed.fndtn.dropdown');
                            $dropdown.on('opened.fndtn.dropdown', function (e) {
                                var $trigger = $(Foundation.libs.dropdown.S(this).data('target'));
                                $tableWrapper = $trigger.closest('.table-wrapper');
                                if (!isOpen) {
                                    presetMarginLeft = getFloat($dropdown.css('margin-left'));
                                    presetMarginTop = getFloat($dropdown.css('margin-top'));
                                }
                                isOpen = true;
                                reposition();
                            }).on('closed.fndtn.dropdown', function (e) {
                                if (isOpen) {
                                    //reset
                                    $dropdown.css({
                                        'margin-left': '',
                                        'margin-top': ''
                                    });
                                }
                                isOpen = false;
                            });
                            $win.resize(function (e) {
                                reposition();
                                setTimeout(function () {
                                    //fire again incase nav is adjusting
                                    reposition();
                                }, 550);
                            });
                            $tableWrappers.bind('scroll touchmove', function (e) {
                                if (isOpen) {
                                    $dropdown.foundation('dropdown', 'close', $dropdown);
                                }
                            });
                        }
                    });
                });
            }
        },
        isMatchSuggestion: function (suggestions, value, isExact) {
            var matchedIndex = -1;
            if (!suggestions || !suggestions.length) return matchedIndex;

            if (isExact) {
                $.each(suggestions, function (index, suggestion) {
                    if (suggestion.value == value) {
                        matchedIndex = index;
                        return true;
                    }
                });
            } else {
                $.each(suggestions, function (index, suggestion) {
                    if (suggestion.value.toUpperCase().indexOf(value.toUpperCase()) != -1) {
                        matchedIndex = index;
                        return true;
                    }
                });
            }
            return matchedIndex;
        },

        maskAccountNumber: function (accountNumber) {
            if (!accountNumber) {
                return accountNumber;
            }
            else if (accountNumber.trim().length <= 4) {
                return "xxxx-xxxx-xxxx-" + accountNumber.trim();
            }
            else {
                return "xxxx-xxxx-xxxx-" + accountNumber.trim().substr(accountNumber.trim().length - 4, 4);
            }
        },
        deepClone: function (source, target) {
            $.each(source, function (key, value) {
                if (value && typeof value == 'object') {
                    if (typeof target[key] == 'undefined') {
                        target[key] = new Object();
                    }
                    clientScript.deepClone(value, target[key]);
                } else {
                    target[key] = value;
                }
            });
        },
        clone: function (source) {
            var target = {};
            clientScript.deepClone(source, target);

            return target;
        },
        mergeObject: function (source, target) {
            if (typeof target.length === 'number') {
                for (var i = 0, l = target.length; i < l; i++) {
                    clientScript.mergeObject(source[i], target[i]);
                }
            } else {
                for (var key in source) {
                    if (typeof target[key] === 'function') {
                        target[key](source[key]);
                    } else if (source[key] !== null && typeof target[key] === 'object') {
                        if (target[key] === null) {
                            target[key] = {};
                        }
                        clientScript.mergeObject(source[key], target[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        },
        disableOverFlow: function () {
            $('body').addClass('open');
            $('html').addClass('open');
            $('html').removeClass('disable-overflow-x');
            $('body').removeClass('disable-overflow-x');
            $('html').addClass('disable-overflow-x');
            $('body').addClass('disable-overflow-x');
        },
        getClientInformation: function (data) {
            try {
                localStorage.setItem("PlatForm", data.Platform);
                localStorage.setItem("Version", data.Version);
                localStorage.setItem("IsMobile", data.IsMobile);
                localStorage.setItem("DataCaptureServerUrl", data.DataCaptureServerUrl);
                localStorage.setItem("SessionId", data.SessionId);
                dataLayer.push({ 'userID': data.SessionId });

                if (sessionStorage.getItem("IsBrowser") == "true") {
                    if (sessionStorage.getItem("HasLogActivity") != "true") {
                        var func = function (operationTime) {
                            if (require('app').senderInfo() && require('app').senderInfo().SenderLevel()) {
                                if (sessionStorage.getItem("DashboardFromPage") == "Login") {

                                    if (sessionStorage.getItem("IsFirstLogin") == "true") {
                                        //Log user first login behaviour.
                                        clientScript.AddActivityInfo(10, operationTime, true, true);
                                    } else {
                                        //Log user login behaviour (not first login).
                                        clientScript.AddActivityInfo(10, operationTime, true);
                                    }

                                } else if (sessionStorage.getItem("DashboardFromPage") == "Authorization") {
                                    //Log user reauthorize device.
                                    clientScript.AddActivityInfo(8, operationTime, true);
                                }
                                clientScript.SetSessionStorage("HasLogActivity", true);
                            } else {
                                setTimeout(function () {
                                    func(operationTime);
                                }, 1000);
                            }
                        };

                        func(clientScript.GetDateTimeOffset());
                    }
                }
                clientScript.getDataCaptureSetting();
            } catch (e) { }
        },

        getDataCaptureSetting: function () {
            if (localStorage.getItem("DataCaptureConfigure") && JSON.parse(localStorage.getItem("DataCaptureConfigure")).IsEnabled) {
                return;
            }

            $.ajax({
                url: clientScript.getDataCaptureServerUrl() + '/DataCapture/GetClientSettings',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ "ClientIdentity": "SELFSERVICE" }),
                dataType: "json",
            })
            .done(function (result) {
                localStorage.setItem("DataCaptureConfigure", JSON.stringify(result));
            })
            .fail(function (xhr, status) {
                localStorage.setItem("DataCaptureConfigure", '{"IsEnabled":false}');
            });
        },
        ShowCustomMessage: function (callBackOk, callBackCancel, message) {
            var openPrevious = clientScript.isOpenPrevious();

            $('#ConfirmCaption').text('Message');
            $('#ConfirmMessage').html("<p>" + message + "</p>");
            $('#ConfirmOk').text("Yes");
            $('#ConfirmCancel').text('No');
            $('#ConfirmOk').off('click');
            $('#ConfirmOk').one('click', function () {
                $.when(clientScript.closeModal(openPrevious))
                .done(function () {
                    if (typeof callBackCancel === 'function') {
                        callBackOk();
                    }
                });
            });
            $('#ConfirmCancel,.message-modal.close-reveal-modal').off('click').one('click', function () {
                $.when(clientScript.closeModal(openPrevious))
                .done(function () {
                    if (typeof callBackCancel === 'function') {
                        callBackCancel();
                    }
                });
            });


            clientScript.isCancelCloseModalCallBack = openPrevious;
            return $.when(clientScript.openModal("modal-confirm"))
            .done(function () {
                var element = document.activeElement;
                clientScript.isCancelCloseModalCallBack = false;

                setTimeout(function () {
                    if (element != null) {
                        element.blur();
                    }
                }, 70);
            });
        },

        //Set sessionStorage
        SetSessionStorage: function (itemName, value) {
            try {
                sessionStorage.removeItem(itemName);
                sessionStorage.setItem(itemName, value);
            }
            catch (e) {
                console.log(e.message);
                clientScript.logData(5, e.message, e.stack);
            }
        },
        //Cache MoneyTransferPermission to prevent visit without license 
        CacheMoneyTransferPermission: function (moneyTransferPermission) {
            clientScript.SetSessionStorage("HasMoneyTransferPermission", moneyTransferPermission);
        },
        SetLocalStorage: function (itemName, value) {
            window.localStorage.removeItem(itemName);
            try {
                window.localStorage.setItem(itemName, value)
            }
            catch (e) {
                console.log(e.message);
                clientScript.logData(5, e.message, e.stack);
            }
        },
        ShowQuickButton: function () {
            $('body').toggleClass('open');
            $('html').removeClass('open');
            $('#header').removeClass("blur");
            $('#wrapper').removeClass("blur");
            clientScript.ShowQuickButtonForMobile(true);
        },
        RemoveQuickTransactionPage : function(){
            $('#header').removeClass("blur").removeClass("fix-screen");
            $('#wrapper').removeClass("blur").removeClass("fix-screen");
            $('.quick-button').toggleClass("close");
            $('.quick-menu').toggle();
        },
        ToggleQuickReload: function () {
            $('.transactions').toggleClass("drop");
            $('ul#drop-reload').slideToggle();
            $('i.icons-top-ups').toggleClass("select");
            $('i.icons-bill-pay').toggleClass("select");
            $('i.icons-money-transfer').toggleClass("select");
            $('.send-money p, .pay-bills p').toggleClass("select");
        },
        ShowQuickButtonForMobile: function (isShow) {
            // Only mobile device
            if (clientScript.IsMobileDevice() && $('.quick-button')) {
                if (isShow) {
                    $('.quick-button').show();
                }
                else {
                    $('.quick-button').hide();
                }
            }
        },
        cachePreviewSendMoneyTransaction: function (feeCalculator) {
            return sessionStorage && sessionStorage.setItem("PreviewSendMoneyTransaction", JSON.stringify(feeCalculator))
        },
        getPreviewSendMoneyTransaction: function () {
            return sessionStorage && JSON.parse(sessionStorage.getItem("PreviewSendMoneyTransaction"));
        },
        getPreviousPage: function () {
            var previousUrl = {
                prePage: "PersonalInfoConsumer",
                preStartPositionCode: "Other"
            }

            if (!(require("app") && require("app").lastUrl)) {
                return previousUrl;
            }

            var urlArray = require("app").lastUrl.split('/');
            if (urlArray && urlArray.length > 2) {
                previousUrl.prePage = urlArray[2];
                if (urlArray.length > 4) {
                    if ((/StartPositionCode/).test(require("app").lastUrl)) {
                        previousUrl.preStartPositionCode = urlArray[4];
                    }
                }
            }

            return previousUrl;
        },
        getAutoCompleteAddressInvalidMessage: function (address, secondAddress, lastline) {
            var completeaddress = '';
            if (secondAddress && secondAddress != '') {
                completeaddress = String.format('{0}, {1} {2}', address, secondAddress, lastline);
            }
            else {
                completeaddress = String.format('{0}, {1}', address, lastline);
            }

            return String.format(commonstrings.clientscriptjsmessagebox.confirmicorrect, completeaddress);
        },
        getSmartStreetLastLine: function (city, state, zipcode) {
            var lastLine = '';
            if (zipcode && zipcode != '') {
                lastLine = String.format('{0} {1} {2}', city, state, zipcode);
            }
            else {
                lastLine = String.format('{0} {1}', city, state);
            }
            return lastLine;
        },
        getStateOrAbbreviation: function (stateName, needAbbreviation) {
            var state = stateName;
            if (window.localStorage && window.localStorage.states && window.localStorage.states != "undefined") {
                var states = JSON.parse(window.localStorage.states);
                if (states && states.length > 0) {
                    for (var i = 0; i < states.length; i++) {
                        // if nedd abbreviation, the current stateName is full state name.
                        if (clientScript.getValue(needAbbreviation ? states[i].Text : states[i].Code) == stateName) {
                            state = clientScript.getValue(needAbbreviation ? states[i].Code : states[i].Text);
                            break;
                        }
                    }
                }
            }
            return state;
        },
        getShortUrlPath: function () {// The url don't contain location.origin. Sample: /SelfService/AccountConsumer#panel-billers.
            return location.href.replace(location.origin, '');
        },
        isEmptyObject: function (object) {
            if (typeof object.length !== 'undefined') {
                return false;
            }
            for (var property in object)
                return false;
            return true
        },
        Path: {
            getExtension: function (filePath) {
                return filePath.replace(/^.*(\..*)$/, "$1");
            }
        },
        InitialOrUpdateTinyScrollBar: function (isInitial) {
            var $scroll = $('#scrollbar1');
            if (isInitial) {
                $scroll.tinyscrollbar();
            }
            else {
                var scrollData = $scroll.data("plugin_tinyscrollbar");
                if (scrollData) {
                    scrollData.update();
                }
                else {
                    $scroll.tinyscrollbar();
                }
            }

            var $scrollbar = $('#scrollbar1 .scrollbar');
            if ($scrollbar.hasClass('disable')) {
                $('#scrollbar1 .viewport').addClass('portwidth');
            } else {
                $('#scrollbar1 .viewport').removeClass('portwidth');
            }
        },
        SetTinyScrollBarHeight: function (recipientCount) {
            switch (recipientCount) {
                case 0: $("#scrollbar1 .viewport").css('height', '0px'); break;
                case 1: $("#scrollbar1 .viewport").css('height', '42px'); break;
                case 2: $("#scrollbar1 .viewport").css('height', '84px'); break;
                case 3: $("#scrollbar1 .viewport").css('height', '126px'); break;
                case 4: $("#scrollbar1 .viewport").css('height', '168px'); break;
                case 5: $("#scrollbar1 .viewport").css('height', '210px'); break;
                default: $("#scrollbar1 .viewport").css('height', '210px');
            }
        },
        isIframeModal: function (modalId) {
            return ['modal-credit-debit-account'].indexOf(modalId) >= 0;
        },
        getStringFromSource: function (key, source) {
            var array = key.split('.');
            for (var i = 0; i < array.length; i++) {
                if (source[array[i]] != undefined) {
                    source = source[array[i]];
                } else {
                    var error = { message: '"' + array[i] + '" is undefined in the ' + key + '.' };
                    error.toString = function () { return error.message; };
                    throw error;
                }
            }

            return source;
        },
        isRetypeField: function (elementId) {
            return ["input-account-no-retype"].indexOf(elementId) >= 0;
        },
        getLanguage: function () {
            var cookies = document.cookie.split(';');
            var language = '';
            if (cookies) {
                for (var i = 0; i < cookies.length ; i++) {
                    var cookie = cookies[i].replace(/\s/g, '').split('=');
                    if (cookie[0] == 'Language') {
                        language = cookie[1];
                        break;
                    }
                }

                if (!language) {
                    var browserLanguage = navigator.language || navigator.userLanguage;
                    language = browserLanguage.indexOf('es') > -1 ? 'es-MX' : 'en-US';
                    document.cookie = "Language = " + language + ";Path=/";
                }
            }
            return language;
        },
        getPaymentProviderId: function () {
            var senderInfo = require('app').senderInfo();
            return (!!senderInfo ? !!senderInfo.PosPaymentConfig() ? senderInfo.PosPaymentConfig().CreditCardProviderId : 2 : 2);
        },

        collapseManageTransaction: function () {
            $("tbody").children("tr").each(function () {
                if ($(this).hasClass("open")) {
                    $($(this).children("td").first().children("a").children("i")[0]).addClass("hide");
                    $($(this).children("td").first().children("a").children("i")[1]).removeClass("hide");
                    $(this).removeClass("open");
                    $(this).children(".mobile-list-item").removeClass("show");
                }
            });
        },

        collapseDropDowns: function () {
            if (clientScript.IsMobileDevice() && !clientScript.IsIpad() && $(window).width() < 640) {
                $('.add-borders').addClass('closed');
            }
        },
        reRenderedOverflowy: function () { // for ios click save button modal cannot scroll when div overlay the container
            if (clientScript.IsIOS() && !clientScript.IsIpad()) {
                $("div.rerender-scroll").css("cssText", "overflow-y: hidden !important;");
                $("div.rerender-scroll").css("cssText", "overflow-y: scroll !important;");
            }
        }
    }

    var blurTimer = 0;
    var focusTimer = 0;
    if (clientScript.IsIOS()) {// fix ios wrapper issue: header distorted
        $(".layout-icon").css('transform', 'rotate(-90deg)');
        setTimeout(function () {
            $('body').on('focus.topbar', 'input,select', function (event) {
                clearTimeout(blurTimer);
                clearTimeout(focusTimer);
                //$('#header').css("position", 'absolute');
                focusTimer = setTimeout(function () {
                    //$('#member-level').css('position', 'absolute');
                    //$('#sidebar').css('position', 'absolute');
                    $('#sidebar').css('height', $(document).height());
                }, 200);
            });

            $('body').on('blur.topbar', 'input,select', function (event) {
                clearTimeout(blurTimer);
                clearTimeout(focusTimer);
                blurTimer = setTimeout(function () {
                    //$('#header').removeAttr('style');
                    //$('#member-level').removeAttr('style');
                    $('#sidebar').removeAttr('style');
                    $('#nav-main').removeAttr('style');

                }, 800);
            });
        }, 1000);
    }

    //For spanish text
    var language = clientScript.getLanguage();
    if (language == 'es-MX') {
        $('html').addClass('spanish');
    }
    else {
        $('html').removeClass('spanish');
    }

    $('body').on('click.pause-second', 'a', function (event) {
        var element = this;
        if (element.hasAttribute("data-dropdown")) return;

        $(element).addClass("pause-second");
        setTimeout(function () {
            $(element).removeClass('pause-second');
        }, 126);
    });

    if (clientScript.IsMobileDevice()) {
        if (clientScript.IsIOS()) {
            $('html').addClass('ios');
            if (sessionStorage.getItem("IsBrowser") != "true") {
                $('html').addClass('app');
            }
        }
        else {
            $('html').addClass('android');
        }
    } else {
        $('html').addClass('pc');
    }

    if (clientScript.IsIOS()) {
        var orientationTimer = 0;//orientationchange
        $(window).on('orientationchange', function (e) {
            if (clientScript.isOpeningModal()) {
                clearTimeout(orientationTimer);
                //orientationTimer = setTimeout(ModifyModalSize, 50);
            }
            var oldTop = $("body").scrollTop();
            $("body").addClass("body-min-height");
            $("body").scrollTop(oldTop + 2);
            setTimeout(function () {
                if (clientScript.isOpeningModal()) {
                    $("body").css("top", "2px");
                }
                $("body").scrollTop(oldTop);
                $("body").removeClass("body-min-height");
            }, 500);
        });
        $(window).on('resize', function (e) {
            if ($(window).width() >= 1024) {
                clientScript.RemoveOpen();
            }
        });
    }
  
    // Remove for iphone rotate
    function ModifyModalSize(e) {
        setTimeout(function () {
            var element = $('[data-reveal].open .mod-body');
            if (element.attr('data-bind') && element.attr('data-bind').indexOf('calculateHeight:null') != -1) {
                if (require('ClientScript').IsIpad()) {
                    element.css('max-height', $(window).height() - element.offset().top - 138);
                } else {
                    setTimeout(function () {
                        if (element.offset().top > 40) {
                            element.css('max-height', $(window).height() - element.offset().top - 38);
                        } else {
                            element.css('max-height', $(window).height() - element.offset().top);
                        }
                    }, 50);
                }
            }
        }, 30);

    }

    $('body').on('keydown.noNextItem', 'input', function (event) {
        if (event.keyCode == 9 || event.keyCode == 13) {
            var element = this;
            setTimeout(function () {
                if (element === document.activeElement && !clientScript.isRetypeField(element.id)) {
                    $(element).blur();
                }
            }, 100);
        }
        if (clientScript.IsIOS()) {
            var maxLength = $(this).attr("maxlength");
            if (maxLength && maxLength != 0) {
                if (this.value.length >= maxLength && event.keyCode != 8) {
                    $(this).attr("onpaste", "return false");
                    return false;
                } else {
                    $(this).removeAttr("onpaste");
                }
            }
        }
    });

    return clientScript;
});