
/**
 * self invoking once to load the whole file
 */
(function ($) {

/***********************************************************
* tagify part
**********************************************************/

    Fn._inArray = function (array, val) {
        return Fn._isSameType(array, []) && array.includes(val);
    };

    $.fn.getNodeText = function $_fn_getNodeText() {
        if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {

        });}
        return ($($(this).contents().get(0)).text()).trim();
    };

    $.fn.getNodeName = function $_fn_getNodeName() {
        if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {

        });}
        return $(this)[0].nodeName;
    };

    let _Tagify = {
        debug: false,
        _getCallerStr: function (title) {
            return _Tagify.name + " " + Fn._getCallerStr(title);
        },
        name: 'tagify',
        class: 'ce-tags',
        active: 'active',
        disabled: 'disabled',
        hovered: 'ce-element-hover',
        href: 'href',
        dataHref: 'data-href',
        click: 'click',
        show: 'show',
        hide: 'hide'
    };

    let Tagify = $.fn.Tagify = $.fn.tagify = function $_fn_tagify(options) {


        let _this = this;
        if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
            tagify : _this,
            options : options
        });}

        let _settings = T_Fn._mergeSetting(_this, options);

        let _nodes = [];

        let _selectedNode = null;

        _this._clonedNode = null;

        /** private functions part */

        /**
         *
         */
        function tagifyDraw() {
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: _this
            });}
            _settings.events.onDraw(_this);
            T_Fn._draw(_this, _settings);
        }


        /** api functions part */

        _this.start = function tagifyStart(callback) {
            tagifyDraw();
            TagifyApi.start(_this, _settings);
            if (Fn._isFunction(callback)) {
                callback(_this, _settings);
            }
        };

        _this.stop = function tagifyStop(callback) {
            TagifyApi.stop(_this, _settings);
            if (Fn._isFunction(callback)) {
                callback(_this, _settings);
            }
        };


        _this.node = function tagifyNode() {
            let argsLength = arguments.length;
            let arg1;
            if (argsLength > 0) {
                arg1 = arguments[0];
                if (Fn._isSameType(arg1, 0)) {
                    if (_nodes.length >= arg1) {
                        _selectedNode = $(_nodes[arg1]);
                        _this._clonedNode = _selectedNode.clone();
                    }
                }
            }
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                argsLength: argsLength,
                arg1: arg1,
                _selectedNode: _selectedNode,
                _clonedNode : _this._clonedNode
            });}
            return _selectedNode;
        };


        _this.selectedNode = function tagifyNode() {
            let argsLength = arguments.length;
            let arg1;
            if (argsLength > 0) {
                arg1 = arguments[0];
                if (Fn._isSameType(arg1, 0)) {
                    if (_nodes.length >= arg1) {
                        _selectedNode = $(_nodes[arg1]);
                        _this._clonedNode = _selectedNode.clone();
                    }
                }
            }
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                argsLength: argsLength,
                arg1: arg1,
                _selectedNode: _selectedNode,
                _clonedNode : _this._clonedNode
            });}
            return _this._clonedNode;
        };

        _this.nodes = function tagifyNodes() {
            let returnVal = _nodes;
            let argsLength = arguments.length;
            let arg1;
            if (argsLength > 0) {
                arg1 = arguments[0];
                if (Fn._isSameType(arg1, _nodes)) {
                    returnVal = _nodes = arg1;
                } else if (Fn._isSameType(arg1, 0)) {
                    if (_nodes.length >= arg1) {
                        returnVal = $(_nodes[arg1]);
                    }
                }
            }
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                argsLength: argsLength,
                arg1: arg1,
                _nodes: _nodes
            });}
            return returnVal;
        };

        _this.edit = function tagifyEdit() {
            let argsLength = arguments.length;
            let arg1;
            if (argsLength > 0) {
                arg1 = arguments[0];
                if (Fn._isSameType(arg1, 0)) {
                    if (_nodes.length >= arg1) {
                        _this._clonedNode = _this.node(arg1);
                    }
                }
            }
            if (_this._clonedNode) {
                TagifyApi.edit(_this, _settings);
            }
            if(_Tagify.debug || true){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                argsLength: argsLength,
                arg1: arg1,
                _nodes: _nodes,
                _clonedNode : _this._clonedNode
            });}
        };

        _this.apply = function tagifyApply() {
            if(_selectedNode ){
                let $selectedNode = $(_selectedNode);
                if($selectedNode.length){
                    $selectedNode.replaceWith(_this._clonedNode);
                    TagifyApi.start(_this, _settings);
                    if(_Tagify.debug || true){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        _selectedNode: _selectedNode,
                        _clonedNode: _this._clonedNode,
                        _nodes: _nodes
                    });}
                }
            }
        };





    };

    /** Api part */

    let TagifyApi = {
        start: function TagifyApi_start(tagify, _settings) {
            T_Fn.tags._clear(tagify, _settings);
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: tagify, _settings: _settings
            });}
            // todo clean this
            $("a").each(function () {
                let $elem = $(this);
                let href = $elem.attr(_Tagify.href);
                $elem.removeAttr(_Tagify.href);
                $elem.attr(_Tagify.dataHref, href);
            });
            $(Fn.classSelector(_Tagify.class)+" a").each(function () {
                let $elem = $(this);
                let href = $elem.attr(_Tagify.dataHref);
                $elem.removeAttr(_Tagify.dataHref);
                $elem.attr(_Tagify.href, href);
            });

            T_Fn.initListener(tagify, _settings, T_Fn.listener.content);

        },
        stop: function TagifyApi_stop(tagify, _settings) {
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: tagify, _settings: _settings
            });}
            T_Fn._erase(tagify, _settings);
            let $block = $(Fn.classSelector(_Tagify.class));
            if($block.length){
                $block.remove();
            }


        },
        clear: function TagifyApi_clear(tagify, _settings) {
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: tagify, _settings: _settings
            });}
            T_Fn._erase(tagify, _settings);


        },
        edit: function TagifyApi_edit(tagify, _settings) {
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: tagify, _settings: _settings
            });}

            T_Fn.editor._open(tagify, _settings);
        },
        apply: function TagifyApi_apply(tagify, _settings) {
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: tagify,
                _settings: _settings
            });}
            T_Fn._erase(tagify, _settings);

        },
        node: function TagifyApi_node(tagify, _settings) {
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name),{
                tagify: tagify,
                _settings: _settings
            });}
        },
        nodes: function TagifyApi_nodes(tagify, _settings) {
            if(_Tagify.debug){console.log(_Tagify._getCallerStr(arguments.callee.name),{
                tagify: tagify,
                _settings: _settings
            });}
        }
    };

    let T_Model = Tagify.MODEL = {};

    let T_Fn = Tagify.fn = {};

    let T_Def = Tagify.defaults = {};

    let T_AppBox = Tagify.APP = {};

/** Default part */

/** Api part */

    T_Model = {
        debug: false,
        attr: {
            'class': _Tagify.class
        },
        container: {
            attr: {
                'class': _Tagify.class + "-container"
            }
        },
        icon: '<i class="fas fa-tag"></i>',
        modal: {
            'class': _Tagify.class + "-modal",
            attr: {
                id: _Tagify.class + "-modal"
            },
            header : {
                'class' : _Tagify.class+"-header"
            },
            applyBtn : {
                'class' : _Tagify.class+"-apply"
            }
        },
        element: {
            attr: {
                "class": _Tagify.class + "-element"
            }
        }
    };

    T_Fn = {
        _debug : false,
        _mergeSetting: function tagifyFnMergeSetting(tagify, options) {
            /**
             * use defaults jquery function to merge objects together
             * merge contentEditor's default options with passed options to a new object
             */
            let mergedSettings = $.extend(true, {}, T_Def.options, options);
            if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                options: options,
                tagify: tagify,
                mergedSettings: mergedSettings
            });}
            return mergedSettings;
        },
        _block: function () {
            return $('<div/>').attr(T_Model.attr);
        },
        _draw: function _tagifyFnDraw(tagify, _settings) {
            let $block = $(Fn.classSelector(_Tagify.class));
            if (!$block.length) {
                $block = T_Fn._block();
                $block.append(T_Fn.tags._icon());
                $block.append(T_Fn.tags._removeBtn());
                $block.append(T_Fn.tags._editBtn());
                $block.append(T_Fn.tags._container());
                $block.append(T_Fn.editor._dialog(tagify, _settings));
                $("body").append($block);
            }
            if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: tagify,
                _settings: _settings
            });}
        },
        _erase: function _tagifyFnErase(tagify, _settings) {
            let $block = $(Fn.classSelector(T_Model.attr.class));
            if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify: tagify,
                _settings: _settings,
                $block: $block
            });}
            $block.remove();
        },
        tags: {
            _isEditable: function (tagify, _settings, nodeName) {
                return Fn._inArray(_settings.editableTag, nodeName.toLowerCase() );
            },
            _icon: function () {
                return $(T_Model.icon).addClass('m-r-10');
            },
            _editBtn: function () {
                return $('<button/>').addClass('btn m-0 edit').append($('<i/>').addClass('fa fa-edit')).attr(_Tagify.disabled, true);
            },
            _removeBtn: function () {
                return $('<button/>').addClass('btn m-0 remove btn-danger').append($('<i/>').addClass('fa fa-times')).attr(_Tagify.disabled, true);
            },
            _container: function () {
                return $('<div/>').attr(T_Model.container.attr);
            },
            _clear: function tagsClear(tagify, _settings) {
                let $container = $(Fn.classSelector(T_Model.container.attr.class));
                $container.empty();
                $(Fn.classSelector('remove'), Fn.classSelector(T_Model.attr.class)).attr(_Tagify.disabled, true);
                $(Fn.classSelector('edit'), Fn.classSelector(T_Model.attr.class)).attr(_Tagify.disabled, true);
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                });}
                return $container;
            },
            _fill: function tagsFill(tagify, _settings, $element) {
                let nodes = T_Fn.tags._getNodes(tagify, _settings, $element);
                nodes = tagify.nodes(nodes);
                let $container = T_Fn.tags._clear(tagify, _settings);
                $.each(nodes, function (index, element) {
                    let nodeElem = $('<div/>')
                        .addClass(T_Model.element.attr.class)
                        .text(element.nodeName)
                    ;
                    nodeElem.appendTo($container);
                    if(index===nodes.length-1){
                        T_Fn.tags._activeTagElement(tagify, _settings, nodeElem);
                    }
                });
                T_Fn.initListener(tagify, _settings, T_Fn.listener.tags);
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    $element : $element
                });}
            },
            _getNodes: function tagsGetNodes(tagify, _settings, element) {
                let nodes = [];
                let $elem = $(element);
                if ($elem.length) {
                    $elem.parentsUntil(_settings[_Prop.jquerySelector]).each(function (index, elem) {
                        if (T_Fn.tags._isEditable(tagify, _settings, elem.nodeName)) {
                            nodes.unshift(elem);
                        }
                    });
                    if (T_Fn.tags._isEditable(tagify, _settings, element.nodeName)) {
                        nodes.push(element);
                    }
                }
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    nodes: nodes
                });}
                return nodes;
            },
            _activeTagElement (tagify, _settings, $tagElem) {
                let $tagsContainer = $(Fn.classSelector(T_Model.container.attr.class), Fn.classSelector(T_Model.attr.class));
                let $contentElements = $(Fn.classSelector('ce-selected-element'));
                $contentElements.removeClass("ce-selected-element");
                let $tagElements = $(Fn.classSelector(T_Model.element.attr.class), $tagsContainer);

                $tagElements.removeClass('active');
                $tagElem.addClass('active');
                let $removeBtn = $(Fn.classSelector('remove'), Fn.classSelector(T_Model.attr.class)).removeAttr(_Tagify.disabled);
                let $editBtn = $(Fn.classSelector('edit'), Fn.classSelector(T_Model.attr.class)).removeAttr(_Tagify.disabled);
                let index = $tagElem.index();
                let node = tagify.nodes(index);
                $(node).addClass("ce-selected-element");
                tagify.selectedNode(index);
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    $tagElem : $tagElem,
                    $removeBtn : $removeBtn,
                    $editBtn : $editBtn
                });}
            }
        },
        editor: {
            _open: function _openEditor(tagify, _settings) {

                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {

                });}

                let $editor = $(Fn.idSelector(T_Model.modal.attr.id));
                if ($editor.length && tagify._clonedNode.length) {
                    let nodeName = tagify._clonedNode.getNodeName();
                    let $dialogHeader = $(".modal-header .title", $editor);
                    $dialogHeader.text("<" + nodeName + "/>");
                    T_Fn.editor._showAppContainer(tagify, _settings);
                    T_Fn.listener.modal.navBtn(tagify, _settings);
                    T_Fn.listener.modal.saveBtn(tagify, _settings);
                    $editor.modal(_Tagify.show);
                }
            },
            _close: function _closeEditor() {
                $(Fn.idSelector(T_Model.modal.attr.id)).modal(_Tagify.hide);
            },
            _showAppContainer: function _showAppContainer(tagify, _settings) {
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    tagify: tagify,
                    _settings: _settings
                });}

                let appBoxes = _settings.appBoxes;
                let foundedApp = null;
                for( let i=0; i<appBoxes.length; i++){
                    let appElement =appBoxes[i];
                    if(appElement._isValid(tagify, _settings, appElement)){
                        appElement._enable(tagify, _settings, appElement);
                        if(foundedApp === null){
                            foundedApp = appElement;
                        }
                    }else {
                        appElement._disable(tagify, _settings, appElement);
                    }
                }

                if(_Tagify.debug || T_Fn._debug){console.log({
                    foundedApp: foundedApp
                });}
                foundedApp._show(tagify, _settings, foundedApp);
            },
            _getModal : function () {
                return $(
                    '<div class="modal fade " role="dialog" >' +
                        '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">' +
                            '<div class="modal-content">' +
                                '<div class="modal-header">' +
                                    '<div class="container">' +
                                        '<span class="title"></span>'+'<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>'+
                                    '</div>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                    '<nav class="nav nav-pills">' + '</nav>'+
                                    '<div class="tab-content">' + '</div>' +
                                '</div>'+
                                '<div class="modal-footer">' +
                                    '<button class="btn '+ T_Model.modal.applyBtn.class+'"> save</button>'+
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );
            },
            _dialog: function _getDialogEditor(tagify, _settings) {
                let $dialog = T_Fn.editor._getModal();
                $dialog.attr(T_Model.modal.attr).addClass(T_Model.modal.class);
                let $navContainer = $('.nav', $dialog), $tabContainer = $('.tab-content', $dialog);
                if($navContainer.length && $tabContainer.length){
                    let appBoxes = _settings.appBoxes;
                    if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        $navContainer : $navContainer,
                        $tabContainer : $tabContainer,
                        appBoxes : appBoxes
                    });}
                    $.each(appBoxes, function (index, appElem) {
                        let appClass = appElem.className;
                        let appId = _Tagify.name+"-"+appElem.name;
                        let $navElem = T_Fn.editor._navElem(appElem)
                            .addClass(appClass)
                            .attr(_Tagify.href, Fn.idSelector(appId))
                        ;
                        let $tabElem = T_Fn.editor._tabElem(tagify, _settings, appElem)
                            .addClass(appClass)
                            .attr('id', appId)
                        ;
                        appElem._blockContent = $tabElem[0];
                        appElem._navElem = $navElem[0];
                        $navContainer.append($navElem);
                        $tabContainer.append($tabElem);
                    });
                }
                return $dialog;
            },
            _navElem : function (appElem) {
                let appIcon = appElem.icon;
                let appName = appElem.name;
                let appText = appElem.text;
                let $li = $('<li/>').addClass('nav-item');
                let $navElem = $('<a/>').attr({
                    // "data-toggle" : "tab",
                    "data-app-name" : appName
                }).addClass('nav-link').html(appIcon+' '+appText);
                $li.append($navElem);
                return $navElem
            },
            _tabElem : function (tagify, _settings, appElem) {
                let appClass = appElem.className;
                let $tab = $('<div/>').addClass('tab-pane fade');
                $tab.html(appClass);
                let render = appElem._create;
                if(Fn._isFunction(render)){
                    let $render = render(tagify, _settings, appElem);
                    if(Fn._isNotUndefined($render) && $render.length){
                        $render.addClass(appClass);
                    }
                    $tab.html($render);
                }
                return $tab;
            }
        }
    };

/** Listener part */

    T_Fn.listener = {
        tags: {
            listener_tagsElemClick(tagify, _settings) {
                let $tagsContainer = $(Fn.classSelector(T_Model.container.attr.class), Fn.classSelector(T_Model.attr.class));
                let $tagElement = $(Fn.classSelector(T_Model.element.attr.class), $tagsContainer);
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    $tagsContainer: $tagsContainer,
                    $tagElement: $tagElement
                });}
                Fn._eventListener($tagElement, _Tagify.click, function tagsElementClick() {
                    let $elem = $(this);
                    T_Fn.tags._activeTagElement(tagify, _settings, $elem);
                });
            },
            listener_tagsElementHover(tagify, _settings) {
                let $tagsContainer = $(Fn.classSelector(T_Model.container.attr.class), Fn.classSelector(T_Model.attr.class));
                let $tagElement = $(Fn.classSelector(T_Model.element.attr.class), $tagsContainer);
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    $tagsContainer: $tagsContainer
                });}
                let nodes = tagify.nodes();
                Fn._eventListener($tagElement, 'mouseenter', function tagsElementMouseEnter(event) {

                    let $elem = $(this);
                    let index = $elem.index();
                    if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        $tagsContainer: $tagsContainer, $elem: $elem, index: index, node : nodes
                    });}
                    $.each(nodes, function (i, elem) {
                        if(i === index){

                            $(elem).addClass(_Tagify.hovered);
                        }
                    });
                });
                Fn._eventListener($tagElement, 'mouseout', function tagsElementMouseOut(event) {
                    let $elem = $(this);
                    let index = $elem.index();
                    if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        $tagsContainer: $tagsContainer, $elem: $elem, index: index, node : nodes
                    });}
                    $.each(nodes, function (i, elem) {
                        $(elem).removeClass(_Tagify.hovered);
                    });
                });
            },
            listener_removeBtn (tagify, _settings) {
                let $removeBtn = $(Fn.classSelector('remove'), Fn.classSelector(T_Model.attr.class));
                if(_Tagify.debug || T_Fn.debug ){console.log(_Tagify._getCallerStr(arguments.callee.name), {

                });}
                Fn._eventListener($removeBtn, _Tagify.click, function removeBtnClick(e) {
                    let node = tagify.node();
                    if(_Tagify.debug || T_Fn.debug || true){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        node : node
                    });}

                    $(node).remove();
                    T_Fn.tags._clear(tagify, _settings);
                });
            },
            listener_editBtn (tagify, _settings) {
                if(_Tagify.debug || T_Fn.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {

                });}
                let $editBtn = $(Fn.classSelector('edit'), Fn.classSelector(T_Model.attr.class));
                Fn._eventListener($editBtn, _Tagify.click, function editBtnClick(e) {
                    if(_Tagify.debug || T_Fn.debug || true){console.log(_Tagify._getCallerStr(arguments.callee.name), {

                    });}

                    tagify.edit();
                });
            }
        },
        modal : {
            navBtn : function listenerModalNavClick(tagify, _settings) {
                let appBoxes = _settings.appBoxes;
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    tagify : tagify,
                    _settings : _settings
                });}
                $.each(appBoxes, function (index, appElement) {
                    Fn._eventListener($(appElement._navElem), _Tagify.click, function (e) {
                        e.preventDefault();
                        appElement._show(tagify, _settings, appElement);
                    });
                });
            },
            saveBtn : function listenerModalSaveClick( tagify, _settings) {
                if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    tagify : tagify,
                    _settings : _settings
                });}
                let $editor = $(Fn.idSelector(T_Model.modal.attr.id));
                if ($editor.length && tagify._clonedNode.length) {
                    let $saveBtn = $('.ce-tags-apply', $editor);
                    if($saveBtn.length){
                        Fn._eventListener($saveBtn, _Tagify.click, function modalApplyClick(e) {
                            if(_Tagify.debug || T_Fn._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {

                            });}
                            tagify.apply();
                            T_Fn.editor._close();
                            
                        })
                    }
                }
            }
        },
        content : {
            contentElemClick(tagify, _settings) {
                let $elements = $("*", $( _settings[_Prop.jquerySelector] ) );
                Fn._eventListener($elements, _Tagify.click, function (event) {
                    let _this = this;
                    event.stopPropagation();
                    T_Fn.tags._fill(tagify, _settings, _this);
                });
            },
            contentElementHover(tagify, _settings){
                if (_Tagify.debug || T_Fn.debug) {
                    console.log(_Tagify._getCallerStr(arguments.callee.name), {});
                }
                let $elements = $("*", $(_settings[_Prop.jquerySelector]));
                Fn._eventListener($elements, 'mouseenter', function (event) {
                    event.stopPropagation();
                    $(this).addClass(_Tagify.hovered);
                });
                Fn._eventListener($elements, 'mouseout', function (event) {
                    event.stopPropagation();
                    let $elem = $(this);
                    $elem.removeClass(_Tagify.hovered);
                    let classList = $elem.attr("class");
                    if (classList === "") {
                        $elem.removeAttr('class');
                    }
                });

            }
        }
    };

    T_Fn.initListener = function T_fn_initListener(tagify, _settings) {
        let listeners = T_Fn.listener;
        if (arguments.length > 2) {
            listeners = arguments[2];
        }
        if(_Tagify.debug || T_Fn.debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
            listeners: listeners
        });}
        $.each(listeners, function (index, element) {
            if (Fn._isFunction(element)) {
                element(tagify, _settings);
            } else if (Fn._isObject(element)) {
                T_Fn.initListener(tagify, _settings, element);
            }
        });
    };

    T_AppBox._debug = false;

    T_AppBox._base = {
        name : "",
        title : "",
        text : "",
        className : "",
        icon : "",
        _navElem : null,
        _blockContent : null,
        _create : function appBox_base_create( tagify, _settings, appElem ) {
            if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {

            });}

        },
        _isValid : function appBox_base_isValid(tagify, _settings, appElem) {
            let isValid = true;
            if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                isValid : isValid
            });}
            return isValid;
        },
        _set : function appBox_base_set(tagify, _settings, appElem) {

        },
        _clear : function appBox_base_clear(tagify, _settings, appElem) {

        },
        _show : function appBox_base_show(tagify, _settings, appElem) {
            if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}
            appElem._clear(tagify, _settings, appElem);
            appElem._set(tagify, _settings, appElem);
            $(appElem._navElem).tab(_Tagify.show);

        },
        _enable : function appBox_base_enable(tagify, _settings, appElem) {
            let $navElem = $(appElem._navElem);
            $navElem.removeClass(_Tagify.disabled);
            return appElem;
        },
        _disable : function appBox_base_disable(tagify, _settings, appElem) {
            let $navElem = $(appElem._navElem);
            $navElem.addClass(_Tagify.disabled);
            return appElem;
        }
        ,
        _start : function appBox_base_start(tagify, _settings, appElem) {
            if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}
        },
        _stop : function appBox_base_stop(tagify, _settings, appElem) {
            if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}

        }
    };

    T_AppBox._textArea = $.extend(true, {}, T_AppBox._base, {
        name : "",
        title : "",
        text : "",
        className : "",
        icon : '',
        _create : function appBox_textArea_create() {
            return $('<textarea/>').attr({
                placeHolder : "..."
            });
        },
        _clear : function appBox_textArea_clear(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length){
                let $textArea = $("textarea", $blockContent);
                if($textArea.length){
                    $textArea.val('');
                }
                if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    appElem : appElem
                });}
                return appElem;
            }
        },
        _enable : function appBox_textArea_enable(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            let $navElem = $(appElem._navElem);
            $navElem.removeClass(_Tagify.disabled);
            if($blockContent.length){
                let $textArea = $("textarea", $blockContent);
                if($textArea.length){
                    $textArea.attr(_Tagify.disabled, false);
                }
                if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    appElem : appElem
                });}
                return appElem;
            }
        },
        _disable : function appBox_textArea_disable(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            let $navElem = $(appElem._navElem);
            $navElem.addClass(_Tagify.disabled);
            if($blockContent.length){
                let $textArea = $("textarea", $blockContent);
                if($textArea.length){
                    $textArea.attr(_Tagify.disabled, true);
                }
                if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    appElem : appElem
                });}
                return appElem;
            }
        }
    });

    T_AppBox.classEditor = $.extend(true, {}, T_AppBox._base, {
        name : "classEditor",
        title : "classEditor",
        text : "",
        className : "class-editor",
        _restrictedClass : ["ce-selected-element", "ce-element-hover"],
        icon : '<span class="fa-stack fa-1x">' +
        '<i class="far fa-square fa-stack-2x"></i>' +
        '<i class="far fa-star fa-stack-1x"></i>' +
        '</span>',
        _create : function appBox_attribute_create() {
            return $(
                '<div class="container-fluid">' +
                '<div class="add-container">' +
                '<div class="input-group m-b-5">' +
                '<span class="input-group-prepend">' +
                '<span class="input-group-text">Class</span>' +
                '</span>' +
                '<input type="text" class="form-control class-name" placeholder="name">' +
                '<span class="input-group-append">' +
                '<a type="submit" class="btn m-b-0 add"><i class="fa fa-plus"></i></a>' +
                '</span>' +
                '</div>'+
                '</div>' +
                '<div class="class-container"></div>' +
                '</div>'
            );
        },
        _showError : function appAttrEditor_showError(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $addContainer = $(Fn.classSelector('add-container'), $blockContent);
                let $inputClass = $('input.class-name', $addContainer);
                $inputClass.addClass('is-invalid');
            }
        },
        _clearError : function appAttrEditor_showError(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $addContainer = $(Fn.classSelector('add-container'), $blockContent);
                let $inputClass = $('input.class-name', $addContainer);
                $inputClass.removeClass('is-invalid');
            }
        },
        _classGroup : function (className) {
            let $group = null;
            if (Fn._isStringNotEmpty(className)){
                $group = $('<span class="badge badge-pill badge-secondary" data-class-name="'+className+'">'+className+' <i class="fa fa-times"></i></span>');
            }
            return $group;
        },
        _addClass : function appAttrEditor_addOptions(tagify, _settings, appElem, className) {
            if( !Fn._inArray(appElem._restrictedClass, className) ){
                let $blockContent = $(appElem._blockContent);
                if($blockContent.length) {
                    let $classContainer = $(Fn.classSelector('class-container'), $blockContent);
                    if($classContainer.length && Fn._isStringNotEmpty(className) ){
                        let $opt = appElem._classGroup(className);
                        if($opt !== null){
                            $opt.appendTo($classContainer);
                        }
                    }
                }
            }

        },
        _set : function appAttrEditor_set(tagify, _settings, appElem) {
            appElem._clear(tagify, _settings, appElem);
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length){
                let classList = tagify._clonedNode.attr('class');
                if(Fn._isStringNotEmpty(classList)){
                    classList = classList.split(' ');
                    $.each(classList, function (index, className) {
                        appElem._addClass(tagify, _settings, appElem, className.trim());
                    });
                }
                if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    classList : classList
                });}
                appElem._start(tagify, _settings, appElem);

            }
        },
        _clear : function appBox_attribute_clear(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $attrContainer = $(Fn.classSelector('class-container'), $blockContent);
                if($attrContainer.length){
                    $attrContainer.empty();
                }
            }
        },
        _start : function appAttrEditor_start(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $classContainer = $(Fn.classSelector('class-container'), $blockContent);
                Fn._eventListener($('span[data-class-name]', $classContainer), _Tagify.click, function removeClassClick() {
                    let $this = $(this);
                    let className = $this.attr('data-class-name');
                    tagify._clonedNode.removeClass(className);
                    $this.remove();
                    if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        className : className
                    });}
                });
                let $addContainer = $(Fn.classSelector('add-container'), $blockContent);
                Fn._eventListener($('a.btn.add', $addContainer), _Tagify.click, function btnAddClicked() {
                    appElem._clearError(tagify, _settings, appElem);
                    let $inputClass = $('input.class-name', $addContainer);
                    if($inputClass.length){
                        let className = ($inputClass.val().trim());
                        if(Fn._isStringNotEmpty(className)){
                            if( !tagify._clonedNode.hasClass(className) ){
                                tagify._clonedNode.addClass(className);
                                appElem._addClass(tagify, _settings, appElem, className);
                            }else {
                                appElem._showError(tagify, _settings, appElem);
                            }
                            $inputClass.val("");
                            appElem._start(tagify, _settings, appElem);
                            if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                                className : className
                            });}

                        }
                    }
                });
            }
            if(_Tagify.debug || T_AppBox._debug ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}
        },
        _stop : function appAttrEditor_stop(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $classContainer = $(Fn.classSelector('class-container'), $blockContent);
                $('span[data-class-name]', $classContainer).unbind(_Tagify.click);
                let $addContainer = $(Fn.classSelector('add-container'), $blockContent);
                $('a.btn.add', $addContainer).unbind(_Tagify.click);
            }
            if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}
        }
    });

    T_AppBox.attrEditor = $.extend(true, {}, T_AppBox._base, {
        name : "attrEditor",
        title : "attrEditor",
        text : "",
        className : "attr-editor",
        _restrictedAttr : ['id', "data-ce-editor", "style", "class"],
        _defAttr : ['id'],
        icon : '<span class="fa-stack fa-1x">' +
            '<i class="far fa-square fa-stack-2x"></i>' +
            '<i class="fas fa-cogs fa-stack-1x"></i>' +
        '</span>',
        _validateUnique : function appAttrEditor_validateUnique(tagify, _settings, appElem, attrName) {
            let valid = !Fn._isNotUndefined(tagify._clonedNode.attr(attrName));
            if(!valid){
                appElem._showError(tagify, _settings, appElem, 'this attribute already exist');
            }
            return valid;
        },
        _validateRestriction : function (tagify, _settings, appElem, attrName) {
            let valid= !Fn._inArray(appElem._restrictedAttr, attrName);
            if(!valid){
                appElem._showError(tagify, _settings, appElem, 'restricted attribute');
            }
            return valid;
        },
        _validateNotEmpty : function (tagify, _settings, appElem, val) {
            let valid= Fn._isStringNotEmpty(val);
            if(!valid){
                appElem._showError(tagify, _settings, appElem, 'Empty value');
            }
            return valid;
        },
        _addAttr : function appAttrEditor_addOptions(tagify, _settings, appElem, attr) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $attrContainer = $(Fn.classSelector('attr-container'), $blockContent);
                if($attrContainer.length){
                    let $opt = appElem._inputGroup(attr);
                    $opt.appendTo($attrContainer);
                    appElem._start(tagify, _settings, appElem);
                }
            }

        },
        _showError : function appAttrEditor_showError(tagify, _settings, appElem, errorText) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $addContainer = $(Fn.classSelector('add-container'), $blockContent);
                // $('input.name', $addContainer).addClass('is-invalid');
                $('.input-group', $addContainer).addClass('is-invalid');
                $('.invalid-feedback', $addContainer).text(errorText);
            }
        },
        _clearError : function appAttrEditor_showError(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $addContainer = $(Fn.classSelector('add-container'), $blockContent);
                $('.input-group', $addContainer).removeClass('is-invalid');
                $('input.name', $addContainer).removeClass('is-invalid');
                $('input.value', $addContainer).removeClass('is-invalid');
            }
        },
        _set : function appAttrEditor_set(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length){
                let arrayAttributes = [];
                $.each(appElem._defAttr, function(index, attrName) {
                    let attrVal = tagify._clonedNode.attr(attrName);
                    let attr = {
                        name : attrName,
                        value : Fn._isStringNotEmpty(attrVal) ? attrVal : ""
                    };
                    appElem._addAttr(tagify, _settings, appElem, attr);
                });
                $.each(tagify._clonedNode[0].attributes, function() {
                    if( !Fn._inArray(appElem._restrictedAttr, this.name) ){
                        let attr = {
                            name : this.name,
                            value : this.value
                        };
                        appElem._addAttr(tagify, _settings, appElem, attr);
                        arrayAttributes.push(attr);
                    }
                });
                appElem._start(tagify, _settings, appElem);
                if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    appElem : appElem,
                    arrayAttributes : arrayAttributes
                });}
            }
        },
        _inputGroup : function appAttrEditor_inputGroup(attr) {
            return $(
                '<div class="input-group m-b-5">' +
                    '<span class="input-group-prepend">' +
                '<button class="btn btn-success m-0 save" data-attr-name="'+attr.name+'"><i class="fa fa-check"></i></button>'+
                '<button class="btn btn-danger m-0 remove" data-attr-name="'+attr.name+'"><i class="fa fa-times"></i></button>'+
                    '</span>' +
                    '<input type="text" class="form-control text-right col-xs-12 col-sm-4" disabled value="'+attr.name+'">' +
                    '<input type="text" class="form-control value" placeholder="value" value="'+attr.value+'">' +
                '</div>'
            );
        },
        _create : function appAttrEditor_create() {
            return $(
                '<div class="container-fluid">' +
                    '<div class="add-container">' +
                        '<div class="input-group ">' +
                            '<span class="input-group-prepend">' +
                                '<button class="btn m-0 add"><i class="fa fa-plus"></i></button>' +
                                '<span class="input-group-text">Attr</span>' +
                            '</span>' +
                            '<input type="text" class="form-control name col-xs-12 col-sm-4" placeholder="name">' +
                            '<input type="text" class="form-control value" placeholder="value">' +
                        '</div>'+
                        '<div class="invalid-feedback"></div>' +
                    '</div>' +
                    '<div class="attr-container"></div>' +
                '</div>'
            );
        },
        _clear : function appAttrEditor_clear(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $attrContainer = $(Fn.classSelector('attr-container'), $blockContent);
                if($attrContainer.length){
                    $attrContainer.empty();
                }
            }
        },
        _start : function appAttrEditor_Start(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $attrContainer = $(Fn.classSelector('attr-container'), $blockContent);
                Fn._eventListener($('button.remove[data-attr-name]', $attrContainer), _Tagify.click, function () {
                    let $this = $(this);
                    let attrName = $this.attr('data-attr-name');
                    tagify._clonedNode.removeAttr(attrName);
                    $this.closest('.input-group').remove();
                    if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        attrName : attrName
                    });}
                });
                Fn._eventListener($('button.save[data-attr-name]', $attrContainer), _Tagify.click, function () {
                    let $this = $(this);
                    let attrName = $this.attr('data-attr-name');
                    let $inputAttr = $('input.value', $attrContainer );
                    if($inputAttr.length) {
                        let attrVal = $inputAttr.val();
                        tagify._clonedNode.attr(attrName, attrVal);
                    }
                    if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        attrName : attrName
                    });}
                });
                let $addContainer = $(Fn.classSelector('add-container'), $blockContent);
                Fn._eventListener($('button.add', $addContainer), _Tagify.click, function () {
                    appElem._clearError(tagify, _settings, appElem);
                    let $inputAttr = $('input.name', $addContainer );
                    let $inputVal = $('input.value', $addContainer );
                    let attrName, attrVal;
                    if($inputAttr.length && $inputVal.length) {
                        attrName = $inputAttr.val();
                        attrVal = $inputVal.val();
                        if(
                            appElem._validateRestriction(tagify, _settings, appElem, attrName) &&
                            appElem._validateUnique(tagify, _settings, appElem, attrName) &&
                            appElem._validateNotEmpty(tagify, _settings, appElem, attrName) &&
                            appElem._validateNotEmpty(tagify, _settings, appElem, attrVal)
                        ){
                            appElem._addAttr(tagify, _settings, appElem, {
                                name : attrName, value : attrVal
                            });
                            $inputAttr.val('');
                            $inputVal.val('');
                            tagify._clonedNode.attr(attrName, attrVal);
                        }
                        // if( !Fn._isNotUndefined(tagify._clonedNode.attr(attrName)) ){
                        //     appElem._addAttr(tagify, _settings, appElem, {
                        //         name : attrName, value : attrVal
                        //     });
                        //     $inputAttr.val('');
                        //     $inputVal.val('');
                        //     tagify._clonedNode.attr(attrName, attrVal);
                        // }else {
                        //     appElem._showError(tagify, _settings, appElem);
                        // }
                    }
                    if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                        attrName : attrName
                    });}
                });
            }
            if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}
        }
    });

    T_AppBox.codeEditor = $.extend(true, {}, T_AppBox._textArea, {
        name : "codeEditor",
        title : "codeEditor",
        text : "",
        className : "code-editor",
        icon : '<span class="fa-stack fa-1x">' +
            '<i class="far fa-square fa-stack-2x"></i>' +
            '<i class="fa fa-code fa-stack-1x"></i>' +
        '</span>',
        _editableTags : ["section", "div", "aside", "b", 'img'],
        _isValid : function appCodeEditor_isValid(tagify, _settings, appElem) {
            let isValid = Fn._inArray(appElem._editableTags, (tagify._clonedNode.getNodeName()).toLowerCase()) ;
            if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                isValid : isValid
            });}
            return isValid;
        },
        _set : function appCodeEditor_set(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length){
                let $textArea = $("textarea", $blockContent);
                let html = Fn._SpaceToNewLine(tagify._clonedNode[0].outerHTML);
                if($textArea.length){
                    $textArea.val(html);
                }
                if(_Tagify.debug || T_AppBox._debug){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    appElem : appElem,
                    html : html
                });}
            }
            appElem._start(tagify, _settings, appElem);
        },
        _start : function appAttrEditor_start(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $textArea = $("textarea", $blockContent);
                Fn._eventListener($textArea, 'keyup', function textAreaKeyUp() {
                    let $this = $(this);
                    let htmlCode = ($this.val().trim());
                    try {
                        let $html = $(htmlCode);
                        tagify._clonedNode = $html;
                        if(_Tagify.debug || T_AppBox._debug  || true){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                            $html : $html
                        });}

                    }catch (error){
                        if(_Tagify.debug || T_AppBox._debug  || true){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                            htmlCode : htmlCode,
                            error : error
                        });}
                    }
                });
            }
            if(_Tagify.debug || T_AppBox._debug ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}
        },
        _stop : function appAttrEditor_stop(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length) {
                let $textArea = $("textarea", $blockContent);
                $textArea.val('').unbind('keyup');
            }
            if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                tagify : tagify,
                _settings : _settings,
                appElem : appElem
            });}
        }
    });

    T_AppBox.textEditor = $.extend(true, {}, T_AppBox._textArea, {
        name : "textEditor",
        title : "textEditor",
        text : "",
        className : "text-editor",
        icon : '<span class="fa-stack fa-1x">' +
            '<i class="far fa-square fa-stack-2x"></i>' +
            '<i class="fas fa-pencil-alt fa-stack-1x"></i>' +
        '</span>',
        _editableTags : ["h1", "h2", "h3", "h4", "h5", "h6", "span", "p", "b", "a", "li", 'bold', 'strong'],
        _set : function appTextEditor_set(tagify, _settings, appElem) {
            let $blockContent = $(appElem._blockContent);
            if($blockContent.length){
                let $textArea = $("textarea", $blockContent);
                if($textArea.length){
                    let text = tagify._clonedNode.getNodeText();
                    $textArea.val(text);
                }
                if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                    appElem : appElem,
                    text : text
                });}
                return appElem;
            }
        },
        _isValid : function appTextEditor_isValid(tagify, _settings, appElem) {
            let isValid = Fn._inArray(appElem._editableTags, (tagify._clonedNode.getNodeName()).toLowerCase() );
            if(_Tagify.debug || T_AppBox._debug  ){console.log(_Tagify._getCallerStr(arguments.callee.name), {
                isValid : isValid
            });}
            return isValid;
        }
    });

    let AppBoxes = [
        // T_AppBox.textEditor,
        T_AppBox.classEditor,
        T_AppBox.attrEditor,
        T_AppBox.codeEditor
    ];


/** Default part */

    T_Def.options = {
        debug: false,
        appBoxes : AppBoxes,
        //TODO implement class file from ajax
        classUrl: "",
        editableTag: [
            'section', 'pre',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'div', 'p', 'a', 'span', 'li', 'li',
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'
        ],
        restrictedAttr: []
    };

}(jQuery));
