
var Fn = {
    Debug: false,
    Trace: false
};

var FnJquery = {
    debug: false
};

var Log = {
    Debug: false,
    Trace: false
};

var _Animation = {
    debug: false,
    trace: false
};

var _BootstrapNotify = {
    debug: false,
    iconCheck: "fas fa-check ",
    iconNone: " ",
    iconTime: "fas fa-times-circle ",
    iconMinus: "fas fa-minus-circle ",
    iconExclamation: "fas fa-exclamation-triangle ",
    defaultIcon : this.iconCheck,

    animationEnter: "fadeInDown ",
    animationExit: "fadeOutUpBig ",

    vertAlignTop: "top",
    vertAlignBottom: "bottom",

    horAlignLeft: "left",
    horAlignCenter: "center",
    horAlignRight: "right",

    defaultZIndex: 10000,

    elemUrl: "",
    elemMouseOver: true,
    elemType: {
        success: "success",
        danger: "danger",
        warning: "warning",
        info: "info",
        primary: "primary",
        secondary: "secondary",
        light: "light",
        dark: "dark"
    },
    elemAllowDismiss: true,
    elemTimer: 1000,
    elemNewestOnTop: true,
    elemProgressBar: false,
    elemDelay: 500
};

var _Header = {
    hrefVoid: "javascript:void(0)",
    quotationButtonId: "quotationButton",
    active: "active",
    debug: false
};

var _Form = {
    Debug: false,
    hideSubmitButtonIfSuccess: false,
    inputErrorAnimation: "animated pulse ",
    hiddenAnimationClass: "bounceOutUp animated "
};


var Animation = {
    debug: false,
    trace: false
};

var BootstrapNotify = {
    debug: false,
    iconCheck: "fas fa-check ",
    iconNone: " ",
    iconTime: "fas fa-times-circle ",
    iconMinus: "fas fa-minus-circle ",
    iconExclamation: "fas fa-exclamation-triangle ",

    animationEnter: "fadeInDown ",
    animationExit: "fadeOutUpBig ",

    vertAlignTop: "top",
    vertAlignBottom: "bottom",

    horAlignLeft: "left",
    horAlignCenter: "center",
    horAlignRight: "right",

    defaultZIndex: 10000,

    elemUrl: "",
    elemMouseOver: true,
    elemType: {
        success: "success",
        danger: "danger",
        warning: "warning",
        info: "info",
        primary: "primary",
        secondary: "secondary",
        light: "light",
        dark: "dark"
    },
    elemAllowDismiss: true,
    elemTimer: 5000,
    elemNewestOnTop: true,
    elemProgressBar: false,
    elemDelay: 500
};


var Form = {
    Debug: false,
    hideSubmitButtonIfSuccess : false,
    inputErrorAnimation : "animated pulse ",
    hiddenAnimationClass : "bounceOutUp animated "
};




(function ($) {

// $ = jQuery.noConflict();
    // your page initialization code here
    // the DOM will be available here

    Fn._inObject = function (value, object) {
        var exist = false;
        if (object !== null && typeof object === typeof {}) {
            Object.keys(object).forEach(function (keyObject) {
                if (object[keyObject] === value) {
                    exist = true;
                }
            });
        }
        return exist;
    };
    Fn._isFloat = function (number) {
        return Number(number) === number && number % 1 !== 0;
    };
    Fn._isInteger = function (number) {
        return Number(number) === number && number % 1 === 0;
    };
    Fn._intToDec = function (val) {
        return (parseInt(val) / 100).toFixed(2);
    };
    Fn._minToSec = function (val) {
        return parseInt(val) * 60;
    };
    Fn._hoursToSec = function (val) {
        return Fn._minToSec(parseInt(val) * 60);
    };
    Fn._dayToSec = function (val) {
        return Fn._hoursToSec(parseInt(val) * 24);
    };
    Fn._secToMin = function (val) {
        return Math.floor(parseInt(val / 60));
    };
    Fn._secToHours = function (val) {
        return Math.floor(parseInt(Fn._secToMin(val)) / 60);
    };
    Fn._secToDay = function (val) {
        return Math.floor(parseInt(Fn._secToHours(val)) / 60);
    };
    Fn._secToDay = function (val) {
        return Math.floor(parseInt(Fn._secToHours(val)) / 60);
    };
    Fn._secToTime = function (val) {
        var second = parseInt(val);
        var days = Fn._secToDay(second);
        second = second - Fn._dayToSec(days);
        var hours = Fn._secToHours(second);
        second = second - Fn._hoursToSec(hours);
        var minutes = Fn._secToMin(second);
        second = second - Fn._minToSec(minutes);
        var hourString = hours < 10 ? '0' + hours : hours.toString();
        var minutesString = minutes < 10 ? '0' + minutes : minutes.toString();
        return hourString + _separator.time + minutesString;

    };
    Fn._intToPrice = function (integer, currency) {
        currency = Fn._isSameType(currency, "") ? currency : '€';
        return Fn._intToDec(parseInt(integer)) + " " + currency;
    };
    Fn._intToDate = function (time) {
        time = time * 1000;
        var date = new Date(time);
        return date.toLocaleString("fr-BE", {
            dateStyle: "short"
        });
    };
    Fn._isSameType = function (value, compare) {
        return typeof value === typeof compare;
    };
    Fn._isStringNotEmpty = function (value) {
        return Fn._isSameType(value, "") && value !== "";
    };
    Fn._isNotUndefined = function (value) {
        return typeof value !== "undefined";
    };
    Fn._isFunction = function (callable) {
        return Fn._isSameType(callable, function () {
        });
    };
    Fn._isObject = function (value) {
        return value !== null && Fn._isSameType(value, {});
    };
    Fn._isNumeric = function (value) {
        return !isNaN(value);
    };
    Fn._getObjByProp = function (obj, property, defValue) {
        if (Fn._isSameType(obj, {}) && Fn._isStringNotEmpty(property)) {
            return obj.hasOwnProperty(property) ? obj[property] : defValue;
        } else {
            return Fn._isNotUndefined(defValue) ? defValue : null;
        }
    };
    Fn._getObjByArrayProp = function (obj, property, defValue) {
        if (Fn._getObjectLength(obj) > 0) {
            if (Fn._isStringNotEmpty(property)) {
                return Fn._getObjByProp(obj, property, defValue);
            } else if (Fn._isSameType(property, [])) {
                var returnValue = Fn._isNotUndefined(defValue) ? defValue : null;
                if (property.length > 0) {
                    $.each(property, function (index, element) {
                        if (obj !== null && Fn._isNotUndefined(obj[element])) {
                            obj = obj[element];
                        } else {
                            obj = null;
                        }
                    });
                    returnValue = obj !== null ? obj : returnValue;
                }
                return returnValue;
            }
        }

        return Fn._isNotUndefined(defValue) ? defValue : null;
    };
    Fn._getObjectLength = function (obj) {
        if (Fn._isObject(obj)) {
            return Object.keys(obj).length;
        } else {
            return 0;
        }
    };
    Fn._convertToBoolean = function (value) {
        switch (typeof value) {
            case  typeof "" :
                return value === "true";
                break;
            case typeof 1 :
                return value > 0;
                break;
            case typeof true :
                return value;
                break;
            case typeof {} :
                return Fn._isStringNotEmpty(value) > 0;
                break;
            default :
                return false;

        }
    };
    Fn._isJsonString = function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };
    Fn._ucFirst = function (str) {

        return str.charAt(0).toUpperCase() + str.slice(1);
    };


    Log.stringToJson = function (str) {
        if (Fn._isJsonString(str)) {
            return JSON.parse(str);
        } else {
            return str;
        }
    };
    Log.debug = function (str, debug, trace) {
        if (debug) {
            if (debug) {
                console.log(Log.stringToJson(str));
            }
            if (trace) {
                console.trace(Log.stringToJson(str));
            }
        }
    };
    Log.trace = function (str, trace) {
        if (trace) {
            console.trace(Log.stringToJson(str));
        }
    };
    Log.printPhp = function (str) {
        console.log(Log.stringToJson(str));
    };


    _BootstrapNotify.notify = function (title, message, icon, type) {
        Log.debug("_BootstrapNotify.notify() called", _BootstrapNotify.debug);
        var content = {};
        content.message = Fn._isStringNotEmpty(message) ? message : "";
        content.title = title;
        content.icon = icon;
        $.notify(content, {
            // spacing: elemSpacing.val(),
            mouse_over: _BootstrapNotify.elemMouseOver,
            type: type,
            allowDismiss: true,
            timer: _BootstrapNotify.elemTimer,
            newest_on_top: _BootstrapNotify.elemNewestOnTop,
            showProgressbar: _BootstrapNotify.elemProgressBar,
            placement: {
                from: _BootstrapNotify.vertAlignTop,
                align: _BootstrapNotify.horAlignCenter
            },
            template:
            '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="icon-x"></i></button>' +
            '<span data-notify="icon"></span>' +
            '<span data-notify="title">{1}</span>' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="p-progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>',
            offset: {
                x: 0,
                y: 80
            },
            delay: _BootstrapNotify.elemDelay,
            z_index: _BootstrapNotify.defaultZIndex,
            animate: {
                enter: 'animated visible ' + _BootstrapNotify.animationEnter,
                exit: 'animated visible ' + _BootstrapNotify.animationExit
            }

        });
    };
    _BootstrapNotify.success = function (title, message) {
        Log.debug("_BootstrapNotify.success() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, _BootstrapNotify.iconCheck, _BootstrapNotify.elemType.success);
    };
    _BootstrapNotify.warning = function (title, message) {
        Log.debug("_BootstrapNotify.warning() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, _BootstrapNotify.iconExclamation, _BootstrapNotify.elemType.warning);
    };
    _BootstrapNotify.danger = function (title, message) {
        Log.debug("_BootstrapNotify.danger() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, _BootstrapNotify.iconMinus, _BootstrapNotify.elemType.danger);
    };
    _BootstrapNotify.primary = function (title, message, icon) {
        Log.debug("_BootstrapNotify.primary() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, icon, _BootstrapNotify.elemType.primary);
    };
    _BootstrapNotify.info = function (title, message, icon) {
        Log.debug("_BootstrapNotify.info() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, icon, _BootstrapNotify.elemType.info);
    };
    _BootstrapNotify.secondary = function (title, message, icon) {
        Log.debug("_BootstrapNotify.secondary() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, icon, _BootstrapNotify.elemType.secondary);
    };
    _BootstrapNotify.light = function (title, message, icon) {
        Log.debug("_BootstrapNotify.light() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, icon, _BootstrapNotify.elemType.light);
    };
    _BootstrapNotify.dark = function (title, message, icon) {
        Log.debug("_BootstrapNotify.dark() called", _BootstrapNotify.debug);
        _BootstrapNotify.notify(title, message, icon, _BootstrapNotify.elemType.dark);
    };


    FnJquery.isValidSelector = function (selector) {
        if (typeof(selector) !== 'string') {
            return false;
        }
        try {
            var $element = $(selector);
        } catch (error) {
            return false;
        }
        return true;
    };
    FnJquery._disableElem = function ($element, disable) {
        disable = Fn._convertToBoolean(disable);
        if ($element.length) {
            $element.attr("disabled", disable);
        }
    };
    FnJquery._requireElem = function ($element, required) {
        required = Fn._convertToBoolean(required);
        if ($element.length) {
            $element.attr("required", required);
        }
    };


    _Animation._initAnimationHover = function () {
        Log.debug('Animation.initializeAnimationHover() called', _Animation.debug, _Animation.trace);
        $(".hover[data-animate]").mouseenter(function () {
            var elem = $(this);
            Log.debug(elem, _Animation.debug, _Animation.trace);
            var animation = elem.attr('data-animate');
            if (elem.hasClass(animation)) {
                elem.removeClass(animation);
                setTimeout(function () {
                    elem.addClass(animation);
                }, 100);
            }
        });
    };
    _Animation._initAnimationHoverOnly = function () {
        Log.debug('Animation.initializeAnimationHoverOnly() called', _Animation.debug, _Animation.trace);
        $("[data-animate-hover]").mouseenter(function () {
            var elem = $(this);
            Log.debug(elem, _Animation.debug, _Animation.trace);
            var animationClass = elem.attr('data-animate-hover');
            var animation = "animated visible " + animationClass;
            if (elem.hasClass(animation)) {
                elem.removeClass(animation);
            }
            elem.addClass(animation);
            setTimeout(function () {
                elem.removeClass(animation);
            }, 500);
        });
    };
    _Animation._initAnimationRepeat = function () {
        Log.debug('Animation.initializeAnimationRepeat() called', _Animation.debug, _Animation.trace);
        $(".repeat[data-animate]").each(function () {
            var elem = $(this);
            Log.debug(elem, _Animation.debug, _Animation.trace);
            var animation = elem.attr('data-animate');
            Log.debug(animation, _Animation.debug, _Animation.trace);
            setInterval(
                function () {
                    if (elem.hasClass(animation)) {
                        elem.removeClass(animation);
                        setTimeout(function () {
                            elem.addClass(animation);
                        }, 500);
                    }
                },
                3000
            );
        });
    };
    _Animation._animate = function (jqueryElement, animationClass, callback) {
        if (Fn._isStringNotEmpty(animationClass)) {
            var animation = "animated visible " + animationClass;
            jqueryElement.removeClass(animation);
            setTimeout(function () {
                jqueryElement.addClass(animation);
                if (Fn._isSameType(callback, function () {
                    })) {
                    callback();
                }
            }, 2);
        }
    };
    _Animation._animateLoaderBtn = function ($element, animate) {
        animate = Fn._convertToBoolean(animate);
        if ($element.length) {
            var $loader = $('.loader', $element);
            if ($loader.length === 0) {
                $loader = $('<span class="loader spinner-grow spinner-grow-sm" aria-hidden="true"><span/>');
                $element.prepend($loader);
            }
            if (animate) {
                $loader.attr('aria-hidden', "");
            } else {
                $loader.attr('aria-hidden', "true");
            }
            FnJquery._disableElem($element, animate);
        }
    };

    _Animation.functions = function () {
        Log.debug('Animation.initialize() called', _Animation.debug, _Animation.trace);
        _Animation._initAnimationHover();
        _Animation._initAnimationHoverOnly();
        _Animation._initAnimationRepeat();
    };



    _Form._disableSubmit =  function (element, callable) {
        Log.debug('Form.disableSubmit() called', _Form.Debug);
        if (!_Form._isSubmitDisabled(element)) {
            element.attr("disabled", true);
            _Form._displayLoader(element, callable);
        }
    };
    _Form._enableSubmit =  function (element, callable) {
        Log.debug('_Form._enableSubmit() called', _Form.Debug);
        if (_Form._isSubmitDisabled(element)) {
            element.attr("disabled", false);
            _Form._hideLoader(element, callable);
        }
    };
    _Form._isSubmitDisabled =  function (element) {
        Log.debug('Form.isSubmitDisabled() called', _Form.Debug);
        return element.attr("disabled");
    };
    _Form._hideSubmitAnimation =  function (element, callable) {
        Log.debug('Form.hideSubmitAnimation() called', _Form.Debug);
        if (!_Form._isSubmitHidden(element)) {
            element.addClass(Form.hiddenAnimationClass);
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    _Form._displaySubmit =  function (element, callable) {
        Log.debug('Form.displaySubmit() called', _Form.Debug);
        if (_Form._isSubmitHidden(element)) {
            element.removeClass(Form.hiddenAnimationClass);
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    _Form._isSubmitHidden =  function (element) {
        Log.debug('Form.isSubmitHidden() called', _Form.Debug);
        return element.hasClass(Form.hiddenAnimationClass);

    };
    _Form._displayLoader =  function (buttonParent, callable) {
        Log.debug('Form.displayLoader() called', _Form.Debug);
        var loader = $(buttonParent).find('span.loader');
        if (_Form._isLoaderHidden(loader)) {
            _Form._hideSendIcon(buttonParent);
            loader.css("display", "inline-block");
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    _Form._hideLoader =  function (buttonParent, callable) {
        Log.debug('Form.hideLoader() called', _Form.Debug);
        var loader = $(buttonParent).find('span.loader');
        if (!_Form._isLoaderHidden(loader)) {
            loader.css("display", "none");
            _Form._displaySendIcon(buttonParent);
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    _Form._isLoaderHidden = function (loader) {
        Log.debug('Form.isLoaderHidden() called', _Form.Debug);
        var hidden = loader.css("display");
        // alert(hidden);
        return hidden === "none";
    };
    _Form._displaySendIcon = function (buttonParent, callable) {
        Log.debug('Form.displaySendIcon() called', _Form.Debug);
        var sendIcon = $(buttonParent).find('i');
        if (_Form._isSendIcon(sendIcon)) {
            sendIcon.css("display", "inline-block");
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    _Form._hideSendIcon = function (buttonParent, callable) {
        Log.debug('Form.hideSendIcon() called', _Form.Debug);
        var sendIcon = $(buttonParent).find('i');
        if (!_Form._isSendIcon(sendIcon)) {
            sendIcon.css("display", "none");
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    _Form._isSendIcon = function (sendIcon) {
        Log.debug('Form.isSendIcon() called', _Form.Debug);
        var hidden = sendIcon.css("display");
        // alert(hidden);
        return hidden === "none";
    };
    _Form._redirectTo = function (url) {
        if (Fn._isStringNotEmpty(url)) {
            setTimeout(function () {
                window.location.href = url;
            }, 1000);
        }
    };

    _Form.functions = function () {
        Log.debug('Form.initialize() called', _Form.Debug);
    };


    _Header._addActiveClassToLink = function () {
        var pathName = window.location.pathname;
        $("div#mainMenu li a").each(function () {
            var $element = $(this);
            var hrefLink = $element.attr("href");
            if (hrefLink === "#") {
                $element.attr("href", _Header.hrefVoid);
            }
            if (hrefLink === pathName) {
                $element.addClass(_Header.active);
                $element.attr("href", _Header.hrefVoid);
                var $aTagParent = $element.closest('ul').siblings('a');
                $aTagParent.addClass(_Header.active);
                Log.debug({"$element.parent()": $element.closest('ul')}, _Header.debug);
            }
            Log.debug({"$hrefLink": hrefLink}, _Header.debug);
        });
        $("footer#footer a").not("#" + _Header.quotationButtonId).each(function () {
            var $element = $(this);
            var $hrefLink = $element.attr("href");
            if ($hrefLink === pathName) {
                $element.addClass(_Header.active);
                $element.attr("href", _Header.hrefVoid);
                $element.closest('ul').siblings('a').addClass(_Header.active);
                Log.debug({"$element.parent()": $element.closest('ul')}, _Header.debug);
            }
            Log.debug({"$hrefLink": $hrefLink}, _Header.debug);
        });
    };
    _Header._autoHideQuotationButton = function () {
        var pathName = window.location.pathname;
        $("a#" + _Header.quotationButtonId).each(function () {
            var $element = $(this);
            var $hrefLink = $element.attr("href");
            if ($hrefLink === pathName) {
                $element.css("display", "none");
            }
            Log.debug({"$hrefLink": $hrefLink}, _Header.debug);
        });
    };
    _Header._stickyMenu = function () {
        var pageMenu = document.getElementById("pageMenu");
        if (typeof pageMenu !== "undefined" && pageMenu !== null) {
            var sticky = pageMenu.offsetTop;
            window.onscroll = function () {
                if (window.pageYOffset >= sticky) {
                    pageMenu.classList.add("sticky")
                } else {
                    pageMenu.classList.remove("sticky");
                }
            };
        }
    };

    _Header.functions = function () {
        _Header._addActiveClassToLink();
        _Header._autoHideQuotationButton();
        _Header._stickyMenu();
    };


// $ = jQuery.noConflict();
    // your page initialization code here
    // the DOM will be available here


    Fn._inObject =          function (value, object) {
        var exist = false;
        if (object !== null && typeof object === typeof {}) {
            Object.keys(object).forEach(function (keyObject) {
                if (object[keyObject] === value) {
                    exist = true;
                }
            });
        }
        return exist;
    };
    Fn._isFloat =           function (number) {
        return Number(number) === number && number % 1 !== 0;
    };
    Fn._isInteger =         function (number) {
        return Number(number) === number && number % 1 === 0;
    };
    Fn._intToDec =          function (val) {
        return (parseInt(val) / 100).toFixed(2);
    };
    Fn._minToSec =          function (val) {
        return parseInt(val) * 60;
    };
    Fn._hoursToSec =        function (val) {
        return Fn._minToSec(parseInt(val) * 60);
    };
    Fn._dayToSec =          function (val) {
        return Fn._hoursToSec(parseInt(val) * 24);
    };
    Fn._secToMin =          function (val) {
        return Math.floor(parseInt(val / 60));
    };
    Fn._secToHours =        function (val) {
        return Math.floor(parseInt(Fn._secToMin(val)) / 60);
    };
    Fn._secToDay =          function (val) {
        return Math.floor(parseInt(Fn._secToHours(val)) / 60);
    };
    Fn._secToDay =          function (val) {
        return Math.floor(parseInt(Fn._secToHours(val)) / 60);
    };
    Fn._secToTime =         function (val) {
        var second = parseInt(val);
        var days = Fn._secToDay(second);
        var hours = Fn._secToHours(second);
        var minutes = Fn._secToMin(second);
        second = second - Fn._minToSec(minutes)- Fn._hoursToSec(hours) - Fn._dayToSec(days);
        var hourString = hours < 10 ? '0' + hours : hours.toString();
        var minutesString = minutes < 10 ? '0' + minutes : minutes.toString();
        return hourString + _separator.time + minutesString;

    };
    Fn._intToPrice =        function (integer, currency) {
        currency = Fn._isSameType(currency, "") ? currency : '€';
        return Fn._intToDec(parseInt(integer)) + " " + currency;
    };
    Fn._intToDate =         function (time) {
        time = time * 1000;
        var date = new Date(time);
        return date.toLocaleString("fr-BE", {
            dateStyle: "short"
        });
    };
    Fn._isSameType =        function (value, compare) {
        return typeof value === typeof compare;
    };
    Fn._isStringNotEmpty =  function (value) {
        return Fn._isSameType(value, "") && value !== "";
    };
    Fn._isNotUndefined = function (value) {
        return typeof value !== "undefined";
    };
    Fn._isFunction =  function (callable) {
        return Fn._isSameType(callable, function () {});
    };
    Fn._isObject =  function (value) {
        return value !== null && Fn._isSameType(value, {});
    };
    Fn._isNumeric =  function (value) {
        return !isNaN(value);
    };
    Fn._getObjByProp =      function (obj, property, defValue) {
        if (Fn._isSameType(obj, {}) && Fn._isStringNotEmpty(property)) {
            return obj.hasOwnProperty(property) ? obj[property] : defValue;
        } else {
            return defValue;
        }
    };
    Fn._getObjectLength =   function (obj) {
        if (Fn._isObject(obj)) {
            return Object.keys(obj).length;
        } else {
            return 0;
        }
    };
    Fn._convertToBoolean =  function (value) {
        switch (typeof value) {
            case  typeof "" :
                return value === "true";
                break;
            case typeof 1 :
                return value > 0;
                break;
            case typeof true :
                return value;
                break;
            case typeof {} :
                return Fn._isStringNotEmpty(value) > 0;
                break;
            default :
                return false;

        }
    };
    Fn._isJsonString =      function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    Fn._ucFirst = function (str) {

        return str.charAt(0).toUpperCase() + str.slice(1);
    };


    Log.stringToJson =  function (str) {
        if (Fn._isJsonString(str)) {
            return JSON.parse(str);
        } else {
            return str;
        }
    };
    Log.debug =  function (str, debug, trace) {
        if (debug) {
            if (debug) {
                console.log(Log.stringToJson(str));
            }
            if (trace) {
                console.trace(Log.stringToJson(str));
            }
        }
    };
    Log.trace = function (str, trace) {
        if (trace) {
            console.trace(Log.stringToJson(str));
        }
    };
    Log.printPhp =  function (str) {
        console.log(Log.stringToJson(str));
    };


    BootstrapNotify.defaultIcon = BootstrapNotify.iconCheck;
    BootstrapNotify.notify = function (title, message, icon, type) {
        Log.debug("BootstrapNotify.notify() called", BootstrapNotify.debug);
        var content = {};
        content.message = message;
        content.title = title;
        content.icon = icon;
        $.notify(content, {
            // spacing: elemSpacing.val(),
            mouse_over: BootstrapNotify.elemMouseOver,
            type: type,
            allowDismiss: true,
            timer: BootstrapNotify.elemTimer,
            newest_on_top: BootstrapNotify.elemNewestOnTop,
            showProgressbar: BootstrapNotify.elemProgressBar,
            placement: {
                from: BootstrapNotify.vertAlignTop,
                align: BootstrapNotify.horAlignCenter
            },
            template:
            '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="icon-x"></i></button>' +
            '<span data-notify="icon"></span>' +
            '<span data-notify="title">{1}</span>' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="p-progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>',
            offset: {
                x: 0,
                y: 80
            },
            delay: BootstrapNotify.elemDelay,
            z_index: BootstrapNotify.defaultZIndex,
            animate: {
                enter: 'animated visible ' + BootstrapNotify.animationEnter,
                exit: 'animated visible ' + BootstrapNotify.animationExit
            }

        });
    };
    BootstrapNotify.success = function (title, message) {
        Log.debug("BootstrapNotify.success() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, BootstrapNotify.iconCheck, BootstrapNotify.elemType.success);
    };
    BootstrapNotify.warning = function (title, message) {
        Log.debug("BootstrapNotify.warning() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, BootstrapNotify.iconExclamation, BootstrapNotify.elemType.warning);
    };
    BootstrapNotify.danger = function (title, message) {
        Log.debug("BootstrapNotify.danger() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, BootstrapNotify.iconMinus, BootstrapNotify.elemType.danger);
    };
    BootstrapNotify.primary = function (title, message, icon) {
        Log.debug("BootstrapNotify.primary() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, icon, BootstrapNotify.elemType.primary);
    };
    BootstrapNotify.info = function (title, message, icon) {
        Log.debug("BootstrapNotify.info() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, icon, BootstrapNotify.elemType.info);
    };
    BootstrapNotify.secondary = function (title, message, icon) {
        Log.debug("BootstrapNotify.secondary() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, icon, BootstrapNotify.elemType.secondary);
    };
    BootstrapNotify.light = function (title, message, icon) {
        Log.debug("BootstrapNotify.light() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, icon, BootstrapNotify.elemType.light);
    };
    BootstrapNotify.dark = function (title, message, icon) {
        Log.debug("BootstrapNotify.dark() called", BootstrapNotify.debug);
        BootstrapNotify.notify(title, message, icon, BootstrapNotify.elemType.dark);
    };


    FnJquery._disableElem = function ($element, disable) {
        disable = Fn._convertToBoolean(disable);
        if($element.length){
            $element.attr("disabled", disable);
        }
    };
    FnJquery._requireElem = function ($element, required) {
        required = Fn._convertToBoolean(required);
        if($element.length){
            $element.attr("required", required);
        }
    };


    Animation._initAnimationHover = function () {
        Log.debug('Animation.initializeAnimationHover() called', Animation.debug, Animation.trace);
        $(".hover[data-animate]").mouseenter(function () {
            var elem = $(this);
            Log.debug(elem, Animation.debug, Animation.trace);
            var animation = elem.attr('data-animate');
            if (elem.hasClass(animation)) {
                elem.removeClass(animation);
                setTimeout(function () {
                    elem.addClass(animation);
                }, 100);
            }
        });
    };
    Animation._initAnimationHoverOnly = function () {
        Log.debug('Animation.initializeAnimationHoverOnly() called', Animation.debug, Animation.trace);
        $("[data-animate-hover]").mouseenter(function () {
            var elem = $(this);
            Log.debug(elem, Animation.debug, Animation.trace);
            var animationClass = elem.attr('data-animate-hover');
            var animation = "animated visible " + animationClass;
            if (elem.hasClass(animation)) {
                elem.removeClass(animation);
            }
            elem.addClass(animation);
            setTimeout(function () {
                elem.removeClass(animation);
            }, 500);
        });
    };
    Animation._initAnimationRepeat = function () {
        Log.debug('Animation.initializeAnimationRepeat() called', Animation.debug, Animation.trace);
        $(".repeat[data-animate]").each(function () {
            var elem = $(this);
            Log.debug(elem, Animation.debug, Animation.trace);
            var animation = elem.attr('data-animate');
            Log.debug(animation, Animation.debug, Animation.trace);
            setInterval(
                function () {
                    if (elem.hasClass(animation)) {
                        elem.removeClass(animation);
                        setTimeout(function () {
                            elem.addClass(animation);
                        }, 500);
                    }
                },
                3000
            );
        });
    };
    Animation._animate = function (jqueryElement, animationClass, callback) {
        if (Fn._isStringNotEmpty(animationClass)) {
            var animation = "animated visible " + animationClass;
            jqueryElement.removeClass(animation);
            setTimeout(function () {
                jqueryElement.addClass(animation);
                if (Fn._isSameType(callback, function () {
                    })) {
                    callback();
                }
            }, 2);
        }
    };
    Animation._animateLoaderBtn = function ($element, animate) {
        animate = Fn._convertToBoolean(animate);
        if($element.length){
            var $loader = $('.loader', $element);
            if($loader.length === 0){
                $loader = $('<span class="loader spinner-grow spinner-grow-sm" aria-hidden="true"><span/>');
                $element.prepend($loader);
            }
            if(animate){
                $loader.attr('aria-hidden', "");
            }else {
                $loader.attr('aria-hidden', "true");
            }
            FnJquery._disableElem($element, animate);
        }
    };

    Animation.functions = function () {
        Log.debug('Animation.initialize() called', Animation.debug, Animation.trace);
        Animation._initAnimationHover();
        Animation._initAnimationHoverOnly();
        Animation._initAnimationRepeat();
    };



    Form.functions = function (){
        Log.debug('Form.initialize() called', _Form.Debug);
    };


    Form._disableSubmit = function (element, callable){
        Log.debug('Form.disableSubmit() called', _Form.Debug);
        if(!_Form._isSubmitDisabled(element)){
            element.attr("disabled", true);
            _Form._displayLoader(element, callable);
        }
    };
    Form._enableSubmit = function (element, callable){
        Log.debug('_Form._enableSubmit() called', _Form.Debug);
        if(_Form._isSubmitDisabled(element)){
            element.attr("disabled", false);
            _Form._hideLoader(element, callable);
        }
    };
    Form._isSubmitDisabled = function (element){
        Log.debug('Form.isSubmitDisabled() called', _Form.Debug);
        return element.attr("disabled");
    };


    Form._hideSubmitAnimation = function (element, callable){
        Log.debug('Form.hideSubmitAnimation() called', Form.Debug);
        if(!_Form._isSubmitHidden(element)){
            element.addClass(Form.hiddenAnimationClass);
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    Form._displaySubmit = function (element, callable){
        Log.debug('Form.displaySubmit() called', _Form.Debug);
        if(_Form._isSubmitHidden(element)){
            element.removeClass(Form.hiddenAnimationClass);
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    Form._isSubmitHidden = function (element){
        Log.debug('Form.isSubmitHidden() called', _Form.Debug);
        return element.hasClass(Form.hiddenAnimationClass);

    };


    Form._displayLoader = function (buttonParent, callable){
        Log.debug('Form.displayLoader() called', _Form.Debug);
        var loader = $(buttonParent).find('span.loader');
        if(_Form._isLoaderHidden(loader)){
            _Form._hideSendIcon(buttonParent);
            loader.css("display", "inline-block");
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    Form._hideLoader = function (buttonParent, callable){
        Log.debug('Form.hideLoader() called', _Form.Debug);
        var loader = $(buttonParent).find('span.loader');
        if(!_Form._isLoaderHidden(loader)){
            loader.css("display", "none");
            _Form._displaySendIcon(buttonParent);
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    Form._isLoaderHidden = function (loader){
        Log.debug('Form.isLoaderHidden() called', _Form.Debug);
        var hidden  = loader.css("display");
        // alert(hidden);
        return hidden === "none";
    };


    Form._displaySendIcon = function (buttonParent, callable){
        Log.debug('Form.displaySendIcon() called', _Form.Debug);
        var sendIcon = $(buttonParent).find('i');
        if(_Form._isSendIcon(sendIcon)){
            sendIcon.css("display", "inline-block");
            if (typeof callable === "function") {
                callable();
            }
        }
    };
    Form._hideSendIcon = function (buttonParent, callable){
        Log.debug('Form.hideSendIcon() called', _Form.Debug);
        var sendIcon = $(buttonParent).find('i');
        if(!_Form._isSendIcon(sendIcon)){
            sendIcon.css("display", "none");
            if (typeof callable === "function") {
                callable();
            }
        }
    };

    Form._isSendIcon = function (sendIcon){
        Log.debug('Form.isSendIcon() called', _Form.Debug);
        var hidden  = sendIcon.css("display");
        // alert(hidden);
        return hidden === "none";
    };

    Form._redirectTo = function (url){
        if(url !== ""){
            setTimeout(function(){
                window.location.href = url;
            }, 1000);
        }
    };


    Form._validate = function (){
        // this.getElement().validate({ // initialize the plugin
        //     rules: {
        //         name: {
        //             required: true,
        //             minlength : 3
        //         },
        //         email: {
        //             required: true,
        //             email: true
        //         },
        //         company : {
        //
        //         }
        //     }
        // });
    };
    Form._log = function (element, debug) {
        if(debug){
            console.log(element);
        }
    };





    var SalesteckApp = {
        functions : function () {
            Animation.functions();
            _Header.functions();
        }
    };


    var Productify = {
        Debug : false,
        Trace : false,
        functions : function () {
            Log.debug('Productify.functions() called', Productify.Debug, Productify.Trace);
            Productify.loadProduct();
        },
        integerToPrice : function (integer) {
            return ((integer/100).toFixed(2) + " €").replace(/[.]/, ",");
        },
        loadProduct : function () {
            Log.debug('Productify.loadProduct() called', Productify.Debug, Productify.Trace);
            var products = [
                {
                    id : 1,
                    name : "cupcake 1 ",
                    price : 110
                },
                {
                    id : 2,
                    name : "cupcake 2",
                    price : 120
                },
                {
                    id : 3,
                    name : "cupcake 3",
                    price : 130
                },
                {
                    id : 4,
                    name : "cupcake 4",
                    price : 140
                },
                {
                    id : 5,
                    name : "cupcake 5",
                    price : 150
                },
                {
                    id : 6,
                    name : "cupcake 6",
                    price : 160
                }
            ];
            for ( var i=0, ien=products.length ; i<ien ; i++ ) {
                Productify.addProduct( products[i] );
            }
            Productify.addProductListener();
            // $.ajax( {
            //     url: '../php/staff.php',
            //     dataType: 'json',
            //     success: function ( json ) {
            //         for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
            //             Productify.addProduct( json.data[i] );
            //         }
            //     }
            // } );
        },
        addProduct : function (data) {
            var productItem = $(
                '<div class="item">' +
                    '<div class="product elevation">' +
                        '<div class="product-image">' +
                            '<a href="#">' +
                                '<img alt="Shop product image!" src="/assets/images/shop/products/2.jpg">' +
                            '</a>' +
                            '<a href="#">' +
                                '<img alt="Shop product image!" src="/assets/images/shop/products/6.jpg">' +
                            '</a>' +
                            '<span class="product-hot">HOT</span>' +
                            '<span class="product-wishlist">' +
                                '<a href="#"><i class="fa fa-heart"></i></a>' +
                            '</span>' +
                            '<div class="product-overlay">' +
                                '<a href="/all-section.php" data-lightbox="ajax">' +
                                    'Quick View' +
                                '</a>' +
                            '</div>' +
                        '</div>' +
                        '<div class="product-description">' +
                            '<div class="product-category">Women</div>' +
                            '<div class="product-title">' + data.name+ '</div>' +
                            '<div class="product-price-info">' +
                                '<div class="product-price">' + '€ 39.90' + '</div>' +
                                '<div class="product-button">' +
                                    '<button class="btn btn-xs add-product">' +
                                        '<i class="fa fa-plus"></i>' + ' add' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>');
            productItem.appendTo( '.product-list' );
            productItem.data("productItem", data);

        },
        addProductListener : function () {
            $(".add-product").click(function (e) {
                e.preventDefault();
                var elem = $(this);
                var productData = elem.closest(".item").data(Cartify.dataIndex);
                Animation.animate(elem, Cartify.defaultAnimation);
                Cartify.addToCart(productData);
                Cartify.removeProductListener();
            });
        }
    };

    var salesCart = [];

    var Cartify = {
        dataIndex : "productItem",
        defaultAnimation : 'bounceIn',
        Debug : true,
        Trace : false,
        functions : function () {
            Cartify.removeProductListener();
        },
        getItemCartJquery : function (productData) {
            var jqueryElement = $(
                '<div class="cart-item">' +
                    '<div class="cart-product-meta">' +
                        '<a href="#">' + productData.name + '</a>' +
                        '<span>' + productData.qty + '</span>' + " x " +
                        '<span>' + Productify.integerToPrice(productData.price) + '</span>' +
                    '</div>' +
                    '<div class="cart-item-remove">' +
                        '<a href="#"><i class="fa fa-times"></i></a>' +
                    '</div>' +
                '</div>'
            );
            jqueryElement.data(Cartify.dataIndex, productData);
            return jqueryElement;
        },
        addToCart : function (productData) {
            var isItemExist = false;
            if(salesCart.length>0){
                salesCart.forEach(function (item, index) {
                    if(item.id === productData.id){
                        item.qty = item.qty +1;
                        Cartify.updateCartItem(item, index);
                        isItemExist = true;
                    }
                });
            }
            if(!isItemExist){
                productData.qty = 1;
                salesCart.push(productData);
                $("#cart-items").append(Cartify.getItemCartJquery(productData));
            }
            Cartify.updateTotal();
            // Log.trace(salesCart, Cartify.Debug);
        },
        updateCartItem : function (productData, index) {
            var arrayDebug = {};
            var cartItems = $(".cart-item", "#cart-items");
            arrayDebug.cartItems = cartItems;

            var itemAtIndex = cartItems.get(index);
            arrayDebug.itemAtIndex = itemAtIndex;

            var replaceItem = Cartify.getItemCartJquery(productData);
            arrayDebug.replaceItem = replaceItem;

            itemAtIndex.replaceWith(replaceItem[0]);

            // Log.trace(arrayDebug, Cartify.Debug);
        },
        removeProductListener : function () {
            var arrayDebug = {};
            $(".cart-item-remove").click(function (e) {
                var elem = $(this);
                arrayDebug[0] = ('cart-item-remove click()');
                e.preventDefault();
                var itemCart = elem.closest(".cart-item");
                var productData = itemCart.data(Cartify.dataIndex);

                salesCart.forEach(function (item, index) {
                    if(item.id === productData.id){
                        salesCart.splice(index, 1);
                        Animation.animate(itemCart, "bounceOut", function () {
                            itemCart.remove();
                        });
                    }
                });
                arrayDebug.salesCart = salesCart;
                Log.trace(arrayDebug,Cartify.Debug);
                Cartify.updateTotal();
            });
        },
        updateSessionCart : function () {

            $.ajax( {
                url: '../php/staff.php',
                dataType: 'json',
                success: function ( json ) {
                    for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
                        Productify.addProduct( json.data[i] );
                    }
                }
            } );
        },
        getCartTotal : function () {
            var total = 0;
            salesCart.forEach(function (item) {
                total += (item.price * item.qty);
            });
            return Productify.integerToPrice(total);
        },
        updateTotal : function () {
            Log.trace({"salesCart" : salesCart}, Cartify.Debug);
            // Cartify.updateSessionCart();
            $("#cart-total").html(Cartify.getCartTotal());
        }
    };


    SalesteckApp.functions();

})(jQuery);