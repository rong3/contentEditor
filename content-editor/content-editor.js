/**
 * define utility function object
 * @type Object
 */
// let Fn = {
//     Debug: false,
//     Trace: false
// };


/**
 *  define constant variable _Prop
 *  variable used to get object property by name
 *  ex : obj[_Prop._test]  = obj["test"];
 * @type Object
 * @private
 */
let _Prop = {
    action : "action",
    events: "events",
    templatesUrl : "templatesUrl",
    jquerySelector : "jquerySelector",
    title : "title",
    className : "className"
};


/**
 * TODO no need to do a lot of self invoking function, only one is enough!
 * self invoking once to load the whole file
 */
(function ($) {

    Fn._getCallerStr = function (title) {
        return title +  '() called';
    };

    Fn._clearWhiteSpace = function (str) {
        return str.replace(/\s\s+/g, ' ').trim();
    };

    Fn._SpaceToNewLine = function (str) {
        // return str.replace(/\s\s\s\s+/g, '\n').trim();
        return str;
    };

    Fn._eventListener = function ($elem, listenerName, listenerFn) {
        if( $elem.length && Fn._isStringNotEmpty(listenerName) && Fn._isFunction(listenerFn)){
            $elem.unbind(listenerName).bind(listenerName, listenerFn);
        }
        return $elem;
    };

/**********************************************************
* Utilities functions part
**********************************************************/
    Fn.classSelector = function classSelector(selectClass) {
        return '.'+selectClass;
    };
    Fn.idSelector = function classSelector(selectClass) {
        return '#'+selectClass;
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
                let returnValue = Fn._isNotUndefined(defValue) ? defValue : null;
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
    Fn._inObject = function (value, object) {
        let exist = false;
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
    Fn._intToPrice = function (integer, currency) {
        currency = Fn._isSameType(currency, "") ? currency : '€';
        return Fn._intToDec(parseInt(integer)) + " " + currency;
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


/**********************************************************
* constant variable part
**********************************************************/


    /**
     * define constant variable _ContentEditor
     * @type Object
     * @private
     */
    let _ContentEditor = {
        /**
         * define debugging variable, if true -> console.log(...)
         * @type {boolean}
         */
        _debug : false,
        _getCallerStr: function (title) {
            return _ContentEditor.name + " " + Fn._getCallerStr(title);
        },
        name : 'ce'
    };


/***********************************************************
* contentEditor Plugin part
**********************************************************/

    /**
     * define contentEditor jquery plugins
     * @param options options passed to the function
     */
    let ContentEditor = $.fn.ContentEditor = $.fn.contentEditor = function (options) {
        /**
         * define this let to use it easy
         */
        let _this = this;

        /**
         * merge options parameter with the _mergeSetting's function
         */
        let _settings = ContentEditorFn._mergeSetting(options, _this);

        _settings[_Prop.jquerySelector] = this[0];


    /** private functions part */

        /**
         *
         */
        function draw() {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: Fn._getCallerStr(arguments.callee.name),
                    contentEditor: _this
                });
            }
            _settings.events.onDraw(_this);
            MODEL.fn.draw(_this, _settings);
        }

        /**
         * ajax promise calling
         * @returns Promise||null
         */
        function ajaxPromise() {

            if(_ContentEditor._debug ){console.log(_ContentEditor._getCallerStr(arguments.callee.name), {
                contentEditor: _this,
                _settings: _settings
            });}
            let ajaxUrl = Fn._getObjByProp(_settings, _Prop.templatesUrl, "");
            if(
                Fn._isStringNotEmpty(ajaxUrl)
            ){
                return $.ajax( {
                    url: ajaxUrl,
                    method: "POST",
                    async: false
                });
            }
            return null;
        }

        /**
         * function to initialize the jquery plugin
         */
        function init() {
            if (_ContentEditor._debug){console.log({
                    _caller: Fn._getCallerStr(arguments.callee.name),
                    contentEditor: _this
            });}
            _settings.events.onInit(_this);
            ajaxPromise().done( function done(response) {
                if (_ContentEditor._debug) {
                    console.log({
                        _caller: Fn._getCallerStr(arguments.callee.name),
                        response : response
                    });
                }

            });
        }



    /** api functions part */

        let tagify = new $.fn.tagify(_settings);

        let ckEdit = new $.fn.CkEdit(_settings);

        _this.tagify = {
            start : function (callback) {
                API.tagify.start(_this, _settings, tagify);
                API.ckEditor.stop(_this, _settings, ckEdit);
                if (_ContentEditor._debug) {
                    console.log({
                        tagify : tagify,
                        ckEdit: ckEdit
                    });
                }
                if(Fn._isFunction(callback)){
                    callback(tagify);
                }
            },
            stop : function (callback) {
                API.tagify.stop(_this, _settings, tagify);
                if(Fn._isFunction(callback)){
                    callback(tagify);
                }
            }
        };

        _this.ckEditor = {
            start : function (callback) {
                API.ckEditor.start(_this, _settings, ckEdit);
                API.tagify.stop(_this, _settings, tagify);
                if(Fn._isFunction(callback)){
                    callback(ckEdit);
                }
            },
            stop : function (callback) {
                API.ckEditor.stop(_this, _settings, tagify);
                if(Fn._isFunction(callback)){
                    callback(ckEdit);
                }
            }
        };

        _this.start = function (callback) {
            API.tools.start(_this, _settings);
            _this.tagify.start();
            if(Fn._isFunction(callback)){
                callback(_this, _settings);
            }
        };

        _this.stop = function () {
            API.tools.stop(_this, _settings);
            _this.tagify.stop();
        };

        _this.reset = function () {
            API.tools.reset(_this, _settings);
        };

        _this.save = function () {
            API.tools.save(_this, _settings);
        };



    /** plugin start */

        _settings.events.preDraw(_this);
        draw();
        _settings.events.postDraw(_this);

        _settings.events.preInit(_this);
        init();
        _settings.events.postInit(_this);


        //TODO remove this part
        let arrayBtn = OBJ.tools.arrayBtn;
        $.each(arrayBtn, function (index, element) {

            let className = Fn._getObjByProp(element, _Prop.className, "");
            if(Fn._isStringNotEmpty(className)){
                let $btn = $('.'+className, '.'+MODEL.tools.container.attr.class);
                if($btn.length){
                    let title = Fn._getObjByProp(element, _Prop.title, "");
                    let action = Fn._getObjByProp(element, _Prop.action, null);
                    Fn._eventListener($btn, 'click', function () {
                        let domElement = this;
                        $(this).tooltip('hide');
                        action(_this, _settings, domElement);
                    } );
                    Fn._eventListener($btn, 'mouseenter', function () {
                        $(this)
                            .tooltip({
                                placement : 'top',
                                title: title
                            }).tooltip('show')
                        ;
                    } );
                    Fn._eventListener($btn, 'mouseout', function () {
                        $(this).tooltip('hide');
                    } );
                    if(Fn._isStringNotEmpty(title)){
                        $btn.bind('mouseenter', function () {
                            $(this)
                                .tooltip({
                                    placement : 'top',
                                    title: title
                                }).tooltip('show')
                            ;
                        });
                    }
                }
            }
        });
        _this.start();

    };




/***********************************************************
* contentEditor properties part
**********************************************************/


    /***********************************************************
     * contentEditor MODEL part
     **********************************************************/

    /** tools */

    let MODEL = ContentEditor.MODEL = {
        tools : {},
        panels : {}
    };

    MODEL.tools = {
        "class" : _ContentEditor.name+"-tools",
        container : {
            attr : {
                "class" : _ContentEditor.name+"-tools-container"
            }
        },
        btn : {
            attr : {
                "class" : _ContentEditor.name+"-tool-btn"
            },
            edit : {

            }
        }
    };

    MODEL.tools.block =
        '<div class="'+MODEL.tools.class+'">' +
            '<div class="'+MODEL.tools.container.attr.class+'"></div>' +
            '<div class="'+MODEL.tools.class+'-btn"><a href="javascript:void(0)"><i class="fas fa-angle-right"></i></a></div>' +
        '</div>';

    /** panels */

    MODEL.panels = {
        "class" : _ContentEditor.name+"-panels",
        container : {
            attr : {
                "class" : _ContentEditor.name+"-panels-container"
            }
        }
    };

    MODEL.panels.block =
        '<div class="'+MODEL.panels.class+'">' +
            '<div class="'+MODEL.panels.container.attr.class+'"></div>' +
            '<div class="'+MODEL.panels.class+'-btn"><a href="javascript:void(0)"><i class="fas fa-angle-left"></i></a></div>' +
        '</div>';
    /** listener */

    MODEL.listener = {

    };

    /** functions */

    MODEL.fn = {
        tools : {
            _getBlock : function () {
                return $(MODEL.tools.block);
            },
            _draw : function _drawTools(contentEditor, _settings) {
                let $block = MODEL.fn.tools._getBlock();
                let $container = $(Fn.classSelector(MODEL.tools.container.attr.class), $block).attr(MODEL.tools.container.attr);
                if (_ContentEditor._debug) {console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings,
                    $container : $container
                });}

                $.each(OBJ.tools.arrayBtn, function (index, element) {
                    let btn = $.extend({}, OBJ.tools.btn, element);
                    let $btn = MODEL.fn.tools._btnElement(btn);
                    if(Fn._isStringNotEmpty(btn.text)){
                        $btn.append("<span>"+btn.text   +"</span>");
                    }
                    if(Fn._isStringNotEmpty(btn.icon)){
                        $btn.prepend($(btn.icon));
                    }
                    if(Fn._isFunction(btn.render)){
                        $btn = btn.render();
                    }
                    $btn.addClass(btn.className);
                    $container.append($btn);
                });
                $("body").append($block);
            },
            _btnElement :function _toolBtnElementfunction () {
                return $('<button/>').attr(MODEL.tools.btn.attr);

            }
        },
        panels : {
            _getBlock : function () {
                return $(MODEL.panels.block);
            },
            _draw : function _drawTagContainer(contentEditor, _settings) {
                let $block = MODEL.fn.panels._getBlock();
                let $container = $(Fn.classSelector(MODEL.panels.container.attr.class), $block).attr(MODEL.panels.container.attr);
                if (_ContentEditor._debug) {
                    console.log({
                        _caller: arguments.callee.name + '() called',
                        contentEditor: contentEditor,
                        _settings : _settings,
                        $container : $container
                    });
                }
                $("body").append($block);
            }
        },
        draw : function (contentEditor, _settings) {
            MODEL.fn.tools._draw(contentEditor, _settings);
            MODEL.fn.panels._draw(contentEditor, _settings);
        }

    };


    /***********************************************************
     * MODEL objects part
     **********************************************************/

    let OBJ = ContentEditor.OBJ = {};
    OBJ._debug = false;

    OBJ.tools = {
        btn : {
            name : "",
            title : "",
            text : "",
            action : function (contentEditor, _settings, domElement) {

            },
            className : "",
            icon : "",
            render : null
        }
    };

    OBJ.tools.edit  = {
        name : "edit",
        title : "edit",
        action : function (contentEditor, _settings, domElement) {
            contentEditor.start();
        },
        className : "edit",
        icon : '<i class="fa fa-edit"></i>'
    };

    OBJ.tools.tags  = {
        name : "tags",
        title : "tags",
        action : function (contentEditor, _settings, domElement) {
            contentEditor.tagify.start();
        },
        className : "edit",
        icon : '<i class="fa fa-edit"></i>'
    };

    OBJ.tools.view  = {
        name : "view",
        title : "view",
        action : function (contentEditor, _settings, domElement) {
            contentEditor.stop();
        },
        className : "view",
        icon : '<i class="fa fa-eye"></i>'
    };

    OBJ.tools.reset  = {
        name : "reset",
        title : "reset",
        action : function (contentEditor, _settings, domElement) {
            contentEditor.reset();
        },
        className : "reset",
        icon : '<i class="fas fa-broom"></i>'
    };

    OBJ.tools.save  = {
        name : "save",
        title : "save",
        action : function (contentEditor, _settings, domElement) {
            contentEditor.save();
        },
        className : "save",
        icon : '<i class="fas fa-check"></i>'
    };

    OBJ.tools.ckEdit  = {
        name : "ckEdit",
        title : "ckEdit",
        action : function ContentEditor_OBJ_tools_ckEdit(contentEditor, _settings, domElement) {
            if(_ContentEditor._debug || OBJ._debug){console.log(_ContentEditor._getCallerStr(arguments.callee.name), {
                contentEditor: contentEditor,
                _settings: _settings,
                domElement : domElement
            });}
            contentEditor.ckEditor.start();
        },
        className : "ckEdit",
        icon : '<i class="fas fa-trash"></i>'
    };

    OBJ.tools.arrayBtn = [OBJ.tools.edit, OBJ.tools.view, OBJ.tools.reset, OBJ.tools.save, OBJ.tools.ckEdit];

    OBJ.panels = {
        btn : {
            name : "",
            action : function (contentEditor) {

            },
            "class" : "",
            icon : '<i class="fas fa-broom"></i>',
            render : null
        }
    };



    /***********************************************************
     * contentEditor options part
     **********************************************************/



    /**
     * define Defaults let as all the defaults property of the jquery's contentEditor plugins
     * @type Object
     */
    let Defaults = $.fn.ContentEditor.defaults = {};

    /**
     * Define defaults classes for the plugin
     * -> easier to change later for theme
     * @type Object
     */
    Defaults.classes = {

    };

    /**
     * set default options properties
     * @type Object
     */
    Defaults.options = {
        /**
         * default ajax link to retrieve blocks
         */
        blocks: [],
        templatesUrl: 'templates.html',
        events: {}
    };



    /***********************************************************
     * events part
     **********************************************************/

    Defaults.options.events = {
        /***********************************************************
         * drawing part
         **********************************************************/
        preDraw: function preDraw(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        onDraw: function onDraw(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        postDraw: function postDraw(contentEditor, settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },

        /***********************************************************
         * initialization part
         **********************************************************/
        preInit: function preInit(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        onInit: function onInit(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        postInit: function postInit(contentEditor, settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },

        /***********************************************************
         * loading part
         **********************************************************/
        preLoad: function preLoad(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        onLoad: function onLoad(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        postLoad: function postLoad(contentEditor, settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },

        /***********************************************************
         * CKEditor initialization part
         **********************************************************/
        preStartCKEditor: function preStartCKEditor(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        onStartCKEditor: function onStartCKEditor(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        postStartCKEditor: function postStartCKEditor(contentEditor, settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        preStopCKEditor: function preStopCKEditor(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        onStopCKEditor: function onStopCKEditor(contentEditor) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        },
        postStopCKEditor: function postStopCKEditor(contentEditor, settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor
                });
            }
        }
    };



    /***********************************************************
     * contentEditor functions part
     **********************************************************/


    let ContentEditorFn = $.fn.contentEditor.functions = {};



    /**
     *
     * @param options
     * @param contentEditor
     * @returns Object
     * @private
     */
    ContentEditorFn._mergeSetting = function _mergeSetting(options, contentEditor) {
        /**
         * use defaults jquery function to merge objects together
         * merge contentEditor's default options with passed options to a new object
         */
        let mergedSettings = $.extend(true, {}, Defaults.options, options);

        if (_ContentEditor._debug) {
            console.log({
                _caller: arguments.callee.name + '() called',
                options: options,
                contentEditor: contentEditor,
                mergedSettings: mergedSettings
            });
        }
        return mergedSettings;
    };

    ContentEditorFn.listener = {

    };


    // todo correct this
    ContentEditorFn.initListener = function (contentEditor, _settings) {
        let listeners = ContentEditorFn.listener;
        if(arguments.length > 2){
            listeners = arguments[2];
        }
        $.each(listeners, function (index, element) {
            if(Fn._isFunction(element)){
                element(dataCard, editor);
            }
            else if(Fn._isSameType(element, {})){
                ContentEditorFn.initListener(dataCard, editor, element);
            }
        });
    };


    /***********************************************************
     * contentEditor API part
     **********************************************************/
    /**
     * define Api object
     * Api object has 4 part ( tool, panel,
     * @type Object
     * @private
     */
    let API = ContentEditor.API ={
        tools : {},
        panels : {},
        ckEditor : {}
    };

    /** tool part */

    API.tools = {
        start : function apiToolsStart(contentEditor, _settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }

        },
        stop : function apiToolsStop(contentEditor, _settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }

        },
        reset : function apiToolsReset(contentEditor, _settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }

        },
        save : function apiToolsSave(contentEditor, _settings) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }

        }
    };

    /** CKEditor part */

    API.ckEditor = {
        start : function apiCkEditoStart(contentEditor, _settings, ckEdit) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }
            ckEdit.start();

        },
        stop : function apiCkEditoStop(contentEditor, _settings, ckEdit) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }

            ckEdit.stop();
        }
    };

    /** CKEditor part */

    API.tagify = {
        start : function apiCkEditoStart(contentEditor, _settings, tagify) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }
            tagify.start();

        },
        stop : function apiCkEditoStop(contentEditor, _settings, tagify) {
            if (_ContentEditor._debug) {
                console.log({
                    _caller: arguments.callee.name + '() called',
                    contentEditor: contentEditor,
                    _settings : _settings
                });
            }
            tagify.stop();

        }
    };


}(jQuery));
