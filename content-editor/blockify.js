
/**
 * TODO no need to do a lot of self invoking function, only one is enough!
 * self invoking once to load the whole file
 */
(function ($) {

    
    /***********************************************************
     * blockify part
     **********************************************************/

    let _Blockify = {
        debug : true,
        _debug : function (obj) {
            let deb = _Blockify.debug;
            if( arguments.length > 1 ){
                if(Fn._isSameType(arguments[1], true)){
                    deb = arguments[1];
                }
            }
            if (deb){
                console.log(obj);
            }
        },
        _getCallerStr : function (title) {
            return _Blockify.name+" "+Fn._getCallerStr(title);
        },
        name : 'blockify',
        class : 'ce-blocks'
    };

    let Blockify = $.fn.Blockify = $.fn.blockify = function (options) {

        let _this = this;

        let _settings = BlockifyFn._mergeSetting(_this, options);

        let _nodes = [];

        /** private functions part */

        /**
         *
         */
        function blockifyDraw() {
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                blockify: _this
            });
            _settings.events.onDraw(_this);
            BlockifyFn._draw(_this, _settings);
        }



        /** api functions part */

        _this.start = function blockifyStart(callback) {
            blockifyDraw();
            BlockifyApi.start(_this, _settings);
            if(Fn._isFunction(callback)){
                callback(_this, _settings);
            }
        };

        _this.stop = function blockifyStop(callback) {
            BlockifyApi.stop(_this, _settings);
            if(Fn._isFunction(callback)){
                callback(_this, _settings);
            }
        };

        _this.nodes = function blockifyNodes() {
            let returnVal = _nodes;
            let argsLength = arguments.length;
            let arg1;
            if(argsLength > 0){
                arg1 = arguments[0];
                if(Fn._isSameType(arg1, _nodes)){
                    returnVal = _nodes = arg1;
                }else if (Fn._isSameType(arg1, 0)){
                    if(_nodes.length >= arg1){
                        returnVal = _nodes[arg1];
                    }
                }
            }
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                argsLength : argsLength,
                arg1 : arg1,
                _nodes : _nodes
            });
            return returnVal;
        };

        _this.edit = function blockifyEdit() {
            let nodeElement = null;
            let argsLength = arguments.length;
            let arg1;
            if(argsLength > 0){
                arg1 = arguments[0];
                if (Fn._isSameType(arg1, 0)){
                    if(_nodes.length >= arg1){
                        nodeElement = _nodes[arg1];
                    }
                }
            }
            if(nodeElement){
                BlockifyApi.tagsEdit(nodeElement);
            }
        };

    };




    let BlocksModel = Blockify.MODEL = {};

    let BlocksDef = Blockify.defaults = {};

    let BlockifyFn = Blockify.fn = {};

    BlocksDef.options = {
        //TODO implement class file from ajax
        classUrl : "",
        editableTag : [
            'section', 'pre',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'div','p',  'a', 'span',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        restrictedAttr : []
    };

    BlocksModel = {
        debug : false,
        attr : {
            "class": _Blockify.class
        },
        container : {
            attr : {
                "class": _Blockify.class + "-container"
            }
        },
        icon : '<i class="fas fa-tag"></i>',
        modal : {
            "class": _Blockify.class + "-modal",
            attr : {
                id : _Blockify.class + "-modal"
            },
            block : '<div class="modal fade " role="dialog">' +
            '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' + '</div>' +
            '<div class="modal-body">' +
            '<div class="tab-content">' +
            '<div id="1" class="tab-pane active">' +
            '<p>Lorem ipsum dolor sit.</p>' +
            '</div>' +
            '<div id="2" class="tab-pane fade">' +
            '<p>Lorem ipsum dolor sit.</p>' +
            '</div>' +
            '<div id="3" class="tab-pane fade">' +
            '<p>Lorem ipsum dolor sit.</p>' +
            '</div>' +
            '</div>'+
            '</div>' +
            '<div class="modal-footer">' + '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        },
        element : {
            attr : {
                "class": _Blockify.name + "-tags-element"
            }
        }
    };

    BlockifyFn = {
        _mergeSetting : function blockifyFnMergeSetting(blockify , options) {
            /**
             * use defaults jquery function to merge objects together
             * merge contentEditor's default options with passed options to a new object
             */
            let mergedSettings = $.extend(true, {}, BlocksDef.options, options);
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                options: options,
                blockify: blockify,
                mergedSettings: mergedSettings
            });
            return mergedSettings;
        },
        _block : function () {
            return $('<div/>').attr(BlocksModel.attr);
        },
        _draw : function _blockifyFnDraw(blockify, _settings) {
            let $block = $(Fn.classSelector(BlocksModel.class));
            if(!$block.length){
                $block = BlockifyFn._block();
                $block.append( BlockifyFn.tags._icon() );
                $block.append( BlockifyFn.tags._container() );
                $("body").append($block).append(BlockifyFn.editor._dialog());
            }
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                blockify: blockify,
                _settings : _settings
            }, BlocksModel.debug);
        },
        _erase : function _blockifyFnErase(blockify, _settings) {
            let $block = $(Fn.classSelector(BlocksModel.attr.class));
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                blockify: blockify,
                _settings : _settings,
                $block : $block
            });
            $block.remove();
        },
        tags : {
            _isEditable : function (blockify, _settings, nodeName) {
                let editableBlocks = _settings.editableTag;
                if( Array.isArray(editableBlocks) ){
                    return editableBlocks.includes(nodeName.toLowerCase());
                }
                return false;
            },
            _icon : function () {
                return $( BlocksModel.icon );
            },
            _container : function () {
                return $('<div/>').attr(BlocksModel.container.attr);
            },
            _fill : function tagsFill(blockify, _settings, $element) {
                let nodes = BlockifyFn.tags._getNodes(blockify, _settings, $element);
                nodes = blockify.nodes(nodes);
                let $container = $( Fn.classSelector(BlocksModel.container.attr.class));
                $container.empty();
                $.each(nodes, function (index, element) {
                    let nodeName = element.nodeName;
                    let $tag = $('<div class="ce-tags-element">'+nodeName+'</div>');
                    $tag.appendTo($container);
                });
                BlockifyFn.initListener(blockify, _settings, BlockifyFn.listener.tags) ;
                _Blockify._debug({
                    _caller: _Blockify._getCallerStr(arguments.callee.name)
                });
            },
            _getNodes : function tagsGetNodes(blockify, _settings, element) {
                let nodes = [];
                let $elem = $(element);
                if($elem.length){
                    $elem.parentsUntil(_settings[_Prop.jquerySelector]).each(function (index, elem) {
                        let nodeName = elem.nodeName;
                        if(BlockifyFn.tags._isEditable(blockify, _settings, nodeName) ){
                            nodes.unshift(elem);
                        }
                    });
                    if(BlockifyFn.tags._isEditable(blockify, _settings, element.nodeName) ){
                        nodes.push(element);
                    }
                }
                _Blockify._debug({
                    _caller: _Blockify._getCallerStr(arguments.callee.name),
                    nodes: nodes
                });
                return nodes;
            }
        },
        editor : {
            _open : function _openEditor() {
                $("#"+BlocksModel.modal.attr.id).modal("show");
            },
            _close : function _closeEditor() {
                $("#"+BlocksModel.modal.attr.id).modal("hide");
            },
            _fill : function _fillEditor(blockify, _settings, $nodeElement) {
                _Blockify._debug({
                    _caller: _Blockify._getCallerStr(arguments.callee.name),
                    blockify: blockify, _settings : _settings, $nodeElement : $nodeElement
                });
                let $editor = $('#'+BlocksModel.modal.attr.id);
                if($editor.length && $nodeElement.length){
                    let nodeName = $nodeElement.prop('nodeName');
                    let $dialogHeader = $(".modal-header", $editor);
                    $dialogHeader.text("<" + nodeName + "/>");
                }
            },
            _dialog : function _getDialogEditor(){
                let $dialog = $( BlocksModel.modal.block );
                $dialog.attr(BlocksModel.modal.attr).addClass(BlocksModel.modal.class);
                return $dialog;
            }
        }
    };

    BlockifyFn.listener = {
        tags : {
            element : function listenerBlocksElem(blockify, _settings) {
                let $tagsContainer = $(Fn.classSelector(BlocksModel.container.attr.class), Fn.classSelector(BlocksModel.attr.class));
                _Blockify._debug({
                    _caller: _Blockify._getCallerStr(arguments.callee.name),
                    $tagsContainer : $tagsContainer
                });
                $('.ce-tags-element', $tagsContainer).click(function tagsElementClick(event) {
                    _Blockify._debug({
                        _caller: _Blockify._getCallerStr(arguments.callee.name),
                        $tagsContainer : $tagsContainer
                    });
                    let $elem = $(this);
                    let index = $elem.index();
                    let nodeElem = blockify.nodes(index);
                    BlockifyApi.tagsEdit(blockify, _settings, nodeElem);
                    console.log({
                        _event : 'clicked', index : index
                    });
                });
            }
        }
    };

    BlockifyFn.initListener = function initListener(blockify, _settings) {
        let listeners = BlockifyFn.listener;
        if(arguments.length > 2){
            listeners = arguments[2];
        }
        _Blockify._debug({
            _caller: _Blockify._getCallerStr(arguments.callee.name),
            listeners : listeners
        });
        $.each(listeners, function (index, element) {
            if(Fn._isFunction(element)){
                element(blockify, _settings);
            } else if(Fn._isObject(element)){
                BlockifyFn.initListener(blockify, _settings, element);
            }
        });
    };

    /** Api part */

    let BlockifyApi = {
        start : function apiStart(blockify, _settings) {
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                blockify: blockify, _settings : _settings
            });
            $("*", _settings[_Prop.jquerySelector]).click(function (event) {
                event.stopPropagation();
                BlockifyFn.tags._fill(blockify, _settings, this);
            });

        },
        stop : function apiStop(blockify, _settings) {
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                blockify: blockify, _settings : _settings
            });
            BlockifyFn._erase(blockify, _settings);

        },
        tagsEdit : function apiBlocksEdit(blockify, _settings, node) {
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                blockify: blockify, _settings : _settings, tagNode : node
            });
            let $node = $(node);
            if($node.length){
                BlockifyFn.editor._fill(blockify, _settings, $node);
                BlockifyFn.editor._open();
            }
        },
        apply : function apiApply(blockify, _settings) {
            _Blockify._debug({
                _caller: _Blockify._getCallerStr(arguments.callee.name),
                blockify: blockify,
                _settings : _settings
            });
            BlockifyFn._erase(blockify, _settings);

        }
    };

}(jQuery));
