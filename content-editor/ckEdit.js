/**
 * self invoking once to load the whole file
 */
(function($) {



    let _CkEdit = {
        debug: true,
        name: 'ckEdit',
        _getCallerStr: function(title) {
            return _CkEdit.name + " " + Fn._getCallerStr(title);
        },
        class: 'ckEdit',
        active: 'active',
        disabled: 'disabled',
        hovered: 'ckEdit-element-hover',
        href: 'href',
        dataHref: 'data-href',
        click: 'click',
        show: 'show',
        hide: 'hide'
    };

    let CkEdit = $.fn.CkEdit = $.fn.ckEdit = function $_fn_ckEdit(options) {


        let _this = this;

        if (_CkEdit.debug) {
            console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                _this: _this,
                options: options
            });
        }

        let _settings = Ck_Fn._mergeSetting(_this, options);

        _this.selectedDom = null;

        _this.editor = null;

        /** private functions part */


        /** api functions part */

        _this.start = function ckEdit_start(callback) {
            CkApi.start(_this, _settings);
            if (Fn._isFunction(callback)) {
                callback(_this, _settings);
            }
        };

        _this.stop = function ckEdit_stop(callback) {
            CkApi.stop(_this, _settings);
            if (Fn._isFunction(callback)) {
                callback(_this, _settings);
            }
        };

        _this.edit = function ckEdit_edit() {
            let argsLength = arguments.length;
            let arg1;
            if (argsLength > 0) {
                arg1 = arguments[0];
            }
            if (_CkEdit.debug || true) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    argsLength: argsLength,
                    arg1: arg1
                });
            }
        };





    };

    let Ck_Model = CkEdit.MODEL = {};

    let Ck_Fn = CkEdit.fn = {};

    let Ck_Def = CkEdit.defaults = {};



    let CkApi = {
        start: function CkApi_start(ckEdit, _settings) {
            if (_CkEdit.debug || Ck_Fn._debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {

                });
            }
            var element = $('[data-ck-edit]');
            Fn._eventListener(element, 'click', function() {
                Ck_Fn._editText(ckEdit, _settings, this);
                console.log('clicked')
            });
            if (_CkEdit.debug || Ck_Fn._debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    element: element
                });
            }

            // Ck_Fn.initListener(ckEdit, _settings, Ck_Fn.listener.content);

        },
        stop: function CkApi_stop(ckEdit, _settings) {
            if (_CkEdit.debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    ckEdit: ckEdit,
                    _settings: _settings
                });
            }

        },
        edit: function CkApi_edit(ckEdit, _settings) {
            if (_CkEdit.debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    ckEdit: ckEdit,
                    _settings: _settings
                });
            }

            Ck_Fn.editor._open(ckEdit, _settings);
        }
    };


    Ck_Def.options = {
        debug: false,
    };
    Ck_Model = {
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', 'class': 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', 'class': '' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', 'class': '' },
                { model: 'heading3', view: 'h3', title: 'Heading 3', 'class': '' },
                { model: 'heading4', view: 'h4', title: 'Heading 4', 'class': '' },
                { model: 'heading5', view: 'h5', title: 'Heading 5', 'class': '' },
                { model: 'heading6', view: 'h6', title: 'Heading 6', 'class': '' }
            ]
        },
        mediaOption: {

            toolbar: {
                items: [
                    'imageUpload',
                    'mediaEmbed',
                    'undo',
                    'redo',
                    'CKFinder'
                ]
            },
            language: 'fr',
            image: {
                toolbar: [
                    'imageTextAlternative',
                    'imageStyle:full',
                    'imageStyle:side'
                ]
            }
        }
    };
    Ck_Model.contentOption = {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'link',
                '|',
                'indent',
                'outdent',
                '|',
                'imageUpload',
                'mediaEmbed',
                'undo',
                'redo',
                'alignment',
                'CKFinder',
                'fontColor',
                'fontSize',
                'fontFamily'
            ]
        },
        heading: Ck_Model.heading,
        restrictedEditing: {
            allowedCommands: ['p']
        },
        language: 'fr',
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:full',
                'imageStyle:side'
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableCellProperties',
                'tableProperties'
            ]
        }
    };
    Ck_Model.textOption = {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'link',
                '|',
                'indent',
                'outdent',
                '|',
                'undo',
                'redo',
                'alignment',
                'fontColor',
                'fontSize',
                'fontFamily'
            ]
        },
        heading: Ck_Model.heading,
        restrictedEditing: {
            allowedCommands: ['p']
        },
        language: 'fr',
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableCellProperties',
                'tableProperties'
            ]
        }
    };
    Ck_Model.mediaOption = {

        toolbar: {
            items: [
                'imageUpload',
                'mediaEmbed',
                'undo',
                'redo',
                'CKFinder'
            ]
        },
        language: 'fr',
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:full',
                'imageStyle:side'
            ]
        }
    };



    Ck_Fn = {
        _debug: false,
        _mergeSetting: function Ck_Fn_mergeSetting(ckEdit, options) {
            /**
             * use defaults jquery function to merge objects together
             * merge contentEditor's default options with passed options to a new object
             */
            let mergedSettings = $.extend(true, {}, Ck_Def.options, options);
            if (_CkEdit.debug || Ck_Fn._debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    options: options,
                    ckEdit: ckEdit,
                    mergedSettings: mergedSettings
                });
            }
            return mergedSettings;
        },
        _inlineEditor: function Ck_Fn_inlineEditor(ckEdit, _settings, editorOption, domElement) {
            if (_CkEdit.debug || Ck_Fn._debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    ckEdit: ckEdit,
                    _settings: _settings,
                    editorOption: editorOption,
                    domElement: domElement
                });
            }
            if (ckEdit.selectedDom !== domElement) {


                if (ckEdit.editor !== null) {
                    console.log('destroy');
                    ckEdit.editor.destroy()
                        .catch(error => {
                            console.log(error);
                        });
                    ckEdit.editor = null;
                }
                InlineEditor
                    .create(domElement, $.extend(true, {}, editorOption, {
                        extraPlugins: [Ck_Fn.ckEditor._ConvertDiv],
                        autoParagraph: false
                    }))
                    .then(inlineEditor => {
                        //TODO implement ckeditor conversion function for architecture
                        inlineEditor.setData(domElement.innerHTML);
                        ckEdit.editor = inlineEditor;
                        Ck_Fn.ckEditor._removeDefClass(ckEdit, _settings, ckEdit.editor);
                        // Ck_Fn.ckEditor._conversionUp(ckEdit, _settings, ckEdit.editor);
                        // Ck_Fn.ckEditor._conversionDown(ckEdit, _settings, ckEdit.editor);
                        // Ck_Fn.ckEditor._schemaRegister(ckEdit, _settings, ckEdit.editor);
                        ckEdit.selectedDom = domElement;


                    })
                    .catch(error => {
                        console.error('Oops, something went wrong!');
                        console.error('Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:');
                        console.warn('Build id: y2rzo0f34zg-re8crceyj9q2');
                        console.error(error);
                    });
            }
        },

        _editText: function Ck_Fn_editText(ckEdit, _settings, domElement) {
            if (_CkEdit.debug || Ck_Fn._debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    ckEdit: ckEdit,
                    _settings: _settings,
                    domElement: domElement,
                    options: Ck_Model.textOption
                });
            }
            Ck_Fn._inlineEditor(ckEdit, _settings, Ck_Model.textOption, domElement);
        },
        _editMedia: function Ck_Fn_editMedia(ckEdit, _settings, domElement) {
            if (_CkEdit.debug || Ck_Fn._debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    ckEdit: ckEdit,
                    _settings: _settings,
                    domElement: domElement
                });
            }
            Ck_Fn._inlineEditor(ckEdit, _settings, Ck_Model.mediaOption, domElement);
        },
        _editContent: function Ck_Fn_editContent(ckEdit, _settings, domElement) {
            if (_CkEdit.debug || Ck_Fn._debug) {
                console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                    ckEdit: ckEdit,
                    _settings: _settings,
                    domElement: domElement
                });
            }
            Ck_Fn._inlineEditor(ckEdit, _settings, Ck_Model.contentOption, domElement);
        },
        ckEditor: {
            _ConvertDiv: function ConvertDiv(editor) {
                const exception = ['strong'];

                let element = ($.map($(editor.sourceElement).find('*'), function(x) { return x.nodeName.toLowerCase(); })).filter((item, i, ar) => ar.indexOf(item) === i && exception.indexOf(item) === -1);

                for (let i = 0; i < element.length; i++) {

                    // Allow <div> elements in the model.
                    editor.model.schema.register(element[i], i > 0 ? { inheritAllFrom: '$block' } : {
                        allowWhere: '$block',
                        allowContentOf: '$root',
                    });

                    // Allow <div> elements in the model to have all attributes.
                    editor.model.schema.addAttributeCheck(context => {
                        if (context.endsWith(element[i])) {
                            return true;
                        }
                    });

                    // The view-to-model converter converting a view <div> with all its attributes to the model.
                    editor.conversion.for('upcast').elementToElement({
                        view: element[i],
                        model: (viewElement, { writer: modelWriter }) => {
                            return modelWriter.createElement(element[i], viewElement.getAttributes());
                        }
                    });

                    // The model-to-view converter for the <div> element (attributes are converted separately).
                    editor.conversion.for('downcast').elementToElement({
                        model: element[i],
                        view: element[i]
                    });
                };


                // // Allow <div> elements in the model.
                // editor.model.schema.register('div', {
                //     allowWhere: '$block',
                //     allowContentOf: '$root',
                // });


                // // Allow <div> elements in the model to have all attributes.
                // editor.model.schema.addAttributeCheck(context => {
                //     if (context.endsWith('div')) {
                //         return true;
                //     }
                // });
                // // The view-to-model converter converting a view <div> with all its attributes to the model.
                // editor.conversion.for('upcast').elementToElement({
                //     view: 'div',
                //     model: (viewElement, { writer: modelWriter }) => {
                //         return modelWriter.createElement('div', viewElement.getAttributes());
                //     }
                // });

                // // The model-to-view converter for the <div> element (attributes are converted separately).
                // editor.conversion.for('downcast').elementToElement({
                //     model: 'div',
                //     view: 'div'
                // });

                // The model-to-view converter for <div> attributes.
                // Note that a lower-level, event-based API is used here.
                editor.conversion.for('downcast').add(dispatcher => {
                    dispatcher.on('attribute', (evt, data, conversionApi) => {
                        // Convert <div> attributes only.
                        if (element.indexOf(data.item.name) === -1) { return; }
                        // if (data.item.name !== 'div') { return; }
                        const viewWriter = conversionApi.writer;
                        const viewDiv = conversionApi.mapper.toViewElement(data.item);

                        // In the model-to-view conversion we convert changes.
                        // An attribute can be added or removed or changed.
                        // The below code handles all 3 cases.
                        if (data.attributeNewValue) {
                            viewWriter.setAttribute(data.attributeKey, data.attributeNewValue, viewDiv);
                        } else {
                            viewWriter.removeAttribute(data.attributeKey, viewDiv);
                        }
                    });
                });
            },
            _removeDefClass: function Ck_Fn_ckEditor_removeDefClass(ckEdit, _settings, ckEditor) {
                if (_CkEdit.debug || Ck_Fn._debug) {
                    console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                        ckEdit: ckEdit,
                        _settings: _settings,
                        ckEditor: ckEditor
                    });
                }
                ckEditor.editing.view.change(writer => {
                    let viewEditableRoot = ckEditor.editing.view.document.getRoot();
                    writer.removeClass('ck-content', viewEditableRoot);
                    writer.removeClass('ck-editor__editable_inline', viewEditableRoot);
                    writer.removeClass('ck-editor__editable', viewEditableRoot);
                });

                return ckEditor;
            },
            _conversionDown: function Ck_Fn_ckEditor_conversionDown(ckEdit, _settings, ckEditor) {
                if (_CkEdit.debug || Ck_Fn._debug) {
                    console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                        ckEdit: ckEdit,
                        _settings: _settings,
                        ckEditor: ckEditor
                    });
                }
                // The model-to-view converter for the <div> element (attributes are converted separately).
                ckEditor.conversion.for('downcast').elementToElement({
                    model: 'div',
                    view: 'div'
                });

                // The model-to-view converter for <div> attributes.
                // Note that a lower-level, event-based API is used here.
                ckEditor.conversion.for('downcast').add(dispatcher => {
                    dispatcher.on('attribute', (evt, data, conversionApi) => {
                        // Convert <div> attributes only.
                        if (data.item.name !== 'div') {
                            return;
                        }

                        let viewWriter = conversionApi.writer;
                        let viewDiv = conversionApi.mapper.toViewElement(data.item);

                        // In the model-to-view conversion we convert changes.
                        // An attribute can be added or removed or changed.
                        // The below code handles all 3 cases.
                        if (data.attributeNewValue) {
                            viewWriter.setAttribute(data.attributeKey, data.attributeNewValue, viewDiv);
                        } else {
                            viewWriter.removeAttribute(data.attributeKey, viewDiv);
                        }
                    });
                });
            },
            _conversionUp: function Ck_Fn_ckEditor_conversionUp(ckEdit, _settings, ckEditor) {
                if (_CkEdit.debug || Ck_Fn._debug) {
                    console.log(_CkEdit._getCallerStr(arguments.callee.name), {
                        ckEdit: ckEdit,
                        _settings: _settings,
                        ckEditor: ckEditor
                    });
                }


                // The view-to-model converter converting a view <div> with all its attributes to the model.
                ckEditor.conversion.for('upcast').elementToElement({
                    view: 'div',
                    model: (viewElement, { writer: modelWriter }) => {
                        return modelWriter.createElement('div', viewElement.getAttributes());
                    }
                });

                // The model-to-view converter for the <div> element (attributes are converted separately).
                ckEditor.conversion.for('downcast').elementToElement({
                    model: 'div',
                    view: 'div'
                });
                return ckEditor;
            },
            _schemaRegister: function Ck_Fn_ckEditor_schemaRegister(ckEdit, _settings, ckEditor) {

                // Allow <div> elements in the model.
                ckEditor.model.schema.register('div', {
                    allowWhere: '$block',
                    allowContentOf: '$root'
                });
                return ckEditor;
            }
        }
    };

}(jQuery));