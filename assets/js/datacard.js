
(function($) {
    /**
     * function to create an jquery element by it's tag name and attribute
     * @param tag
     * @param attr
     * @returns {*|HTMLElement}
     * @private
     */
    function _createJqueryElement (tag, attr) {
        var $elem = $('<' + tag + '/>');
        if(Fn._isSameType(attr, {})){
            $elem.attr(attr);
        }
        return $elem;
    }

    function classSelector(selector) {
        return '.'+selector;
    }

    /**
     * DataCard _prop
     * used for get object property
     */
    var _prop = {
        action : "action",
        buttons : "buttons",
        cardButtons : 'cardButtons',
        caseInsensitive : "caseInsensitive",
        className : "className",
        columnDisplay : "columnDisplay",
        controlPanel : "controlPanel",
        create : "create",
        data : "data",
        dataSrc : "dataSrc",
        direction : "direction",
        edit : "edit",
        editorTemplate : 'editorTemplate',
        fields : "fields",
        files : "files",
        filterHiddenGroup : 'filterHiddenGroup',
        fixedControl : "fixedControl",
        icon : "icon",
        idSrc : "idSrc",
        imageSrc : "imageSrc",
        itemSrc : "itemSrc",
        jquerySelector : "jquerySelector",
        language : "language",
        lengthMenu : "lengthMenu",
        multiFields : "multiFields",
        name : "name",
        offSet : "offSet",
        options : "options",
        ordering : "ordering",
        pageLength : "pageLength",
        render : "render",
        remove : "remove",
        rowReorder : "rowReorder",
        search : "search",
        select : "select",
        template : "template",
        title : "title",
        titleSrc : "titleSrc",
        fieldItemOptions : {
            className : "className",
            name : "name",
            data : "data",
            id : "id",
            label : "label",
            type : "type",
            visible : "visible",
            search : "search",
            options : "options"
        }
    };


    /**
     * _DataCard const
     */
    var _DataCard = {
        debug : false,
        button : {
            create : "create",
            edit : "edit",
            remove : "remove",
            selectAll : "selectAll",
            selectNone : "selectNone",
            select1 : "select1",
            edit1 : "edit1",
            remove1 : "remove1",
            reOrder : "reOrder"
        },
        _ordering : {
            asc : "ASC",
            desc : "DESC"
        },
        _searchableType  : [
            _Column._type.select,
            _Column._type.date,
            _Column._type.time,
            _Column._type.datetime,
            _Column._type.checkbox,
            _Column._type.integer,
            _Column._type.price,
            _Column._type.daterange,
            _Column._type.float,
            _Column._type.textarea,
            _Column._type.text
        ],
        _sortableType : [
            _Column._type.select,
            _Column._type.date,
            _Column._type.time,
            _Column._type.datetime,
            _Column._type.checkbox,
            _Column._type.integer,
            _Column._type.price,
            _Column._type.daterange,
            _Column._type.float,
            _Column._type.textarea,
            _Column._type.text
        ]
    };


    /**
     *
     * @param options {object}
     * @returns {jQuery}
     * @constructor
     */
    $.fn.dataCard = function (options) {
        var dataCardInitTime = Date.now();

        /**
         * define this var to use it easy
         */
        var _this = this;
        /**
         * merge options with default options
         */
        var _settings = DataCardFn.card._mergeSetting(options, _this);
        if(_DataCard.debug){
            console.log("$.fn.DataCard(options) called", {options : options, _settings : _settings});
        }
        /**
         * set the jquerySelector
         */
        _settings[_prop.jquerySelector] = this[0];
        _settings.event.onStart(_this);

        var
            _lastSearchValue = "",
            _editor = null,
            _files = [],
            _options = [],
            _data = [],
            _displayData = [],
            _pageLength = _settings.pageLength,
            _currentPage = 1,
            _i18n = _Translation._get(Fn._getObjByProp(_settings, _prop.language, "")),
            _jqueryTemplate = null,
            _selectedElements = [],
            _editorFields = [],
            _fields = _settings.fields,
            _multiFields = _settings.multiFields.fields,
            _filterArguments = [],
            _sortArguments = []
        ;

        /**
         * @private functions
         */

        /**
         *
         */
        function ajaxPromise() {
            var
                ajaxUrl = _settings.ajax,
                dataSrc = _settings.dataSrc,
                dataSrcMulti = _settings.multiFields.dataSrc
            ;
            if(
                Fn._isStringNotEmpty(ajaxUrl) && Fn._isStringNotEmpty(dataSrc)
            ){
                return $.ajax( {
                    url: ajaxUrl,
                    method: "POST",
                    async: false,
                    data: { _t: dataSrc, dataSrc : dataSrc, dataSrcMulti : dataSrcMulti, action : _Editor._event.read/*, _lang : _settings.language*/}
                });
            }
        }

        function initialize() {
            _settings.event.initLoad(_this);
            _settings.event.preLoad(_this);
            _settings.event.onLoad(_this);

            ajaxPromise().done(function (response) {

                _this.ajax.initData(response);

                processEditorFields();

                _settings.event.postLoad(_this);

                _this.template(DataCardFn.card._createCardTemplate(_this));

                DataCardFn.control._createControlPanel(_this);

                DataCardFn.card._createRowContainer(_this);

                DataCardFn.control._createPageInfoRow(_this);

                var $select = $("select", "."+models.control.filterClass);
                var drawItem = -1;
                if($select.length){
                    drawItem = parseInt($select.val());
                }

                if(Fn._isSameType(_settings.pageLength, 1)){
                    drawItem = _settings.pageLength;
                    var selectedOption = $("option[value='"+drawItem+"']", $select);
                    selectedOption.attr(models.selectedAttr, true);
                }

                _editor = new $.fn.dataTable.Editor( {
                    ajax: {
                        url :_settings.ajax+"?_lang="+_settings.language,
                        data: function ( data ) {
                            data._t = _settings.dataSrc;
                            data._lang = _settings.language;
                        }
                    },
                    template : Fn._getObjByProp(_settings, _prop.editorTemplate, DataCardDefaults.options.editorTemplate),
                    idSrc : _settings.idSrc,
                    i18n : _i18n,
                    fields : _editorFields
                } );

                EditorFn.init(_this, _editor, _editorFields);

                var ordering = Fn._getObjByProp(_settings, _prop.ordering, []);
                if(Fn._isSameType(ordering, [])){
                    var caseInsensitive = Fn._getObjByProp(_settings, _prop.caseInsensitive, true);
                    $.each(ordering, function (index, element) {

                        var columnName = Fn._getObjByProp(element, _prop.name, "");
                        var isMultiField = Fn._getObjByProp(element, _prop.multiFields, false);
                        var asc = Fn._getObjByProp(element, _prop.direction, _DataCard._ordering.asc) === _DataCard._ordering.asc;
                        if(Fn._isStringNotEmpty(columnName)){
                            _this.sort(columnName, asc, isMultiField, caseInsensitive);
                        }
                    });
                }

                _this.draw();

                DataCardFn.initListener(_this, _editor);
            });
        }

        function processEditorFields() {
            $.each(_fields, function (index, element) {
                var fieldElement = $.extend(true, {}, element);
                fieldElement.data = fieldElement.name;
                fieldElement.indexes = Fn._isStringNotEmpty(fieldElement.data) ?  fieldElement.data.split(".") : [];

                fieldElement = processEditorFieldsType(fieldElement);

                if(Fn._isStringNotEmpty(fieldElement.data)){
                    _editorFields.push(fieldElement);
                }
            });

            var
                multiField = _settings.hasOwnProperty(_prop.multiFields) ?  _settings[_prop.multiFields] : {},
                dataSrc = multiField.hasOwnProperty(_prop.dataSrc) ?  multiField[_prop.dataSrc] : "",
                multiItemSrc = multiField.hasOwnProperty(_prop.itemSrc) ?  multiField[_prop.itemSrc] : []
            ;
            $.each(multiItemSrc, function (index, itemSrc) {
                $.each(_multiFields, function (multiFieldIndex, element) {
                    var
                        multiFieldElement = $.extend(true, {}, element),
                        multiDataSrc = typeof dataSrc === typeof "" && dataSrc !== "" ? dataSrc+ '.' : ""
                    ;

                    multiFieldElement.data = multiFieldElement.name;
                    var src = Fn._isObject(itemSrc) && itemSrc.hasOwnProperty(_prop.data) ? itemSrc[_prop.data]+ '.' : "";
                    if(Fn._isStringNotEmpty(multiFieldElement.data)){

                        multiFieldElement.name = multiDataSrc + src + multiFieldElement.name;
                        multiFieldElement.data =  multiFieldElement.name;
                        multiFieldElement.indexes = multiFieldElement.name.split(".");
                        multiFieldElement._uniqueId = src+multiFieldElement._uniqueId;
                        _editorFields.push(multiFieldElement);
                    }
                });
            });

            if ( _DataCard.debug  ) {
                console.log({
                    _event : "processEditorFields() called",
                    _settings: _settings,
                    _fields: _fields,
                    _multiFields: _multiFields,
                    _editorFields : _editorFields
                });
            }

        }

        function processEditorFieldsType(fieldElement) {
            var dataSrc = _settings.dataSrc;
            var fieldDataSrc = fieldElement.indexes[0];
            var imageSrc = Fn._getObjByProp(fieldElement, _prop.imageSrc, []);
            var filePathSrc = "";
            if(Fn._isSameType(imageSrc, [])){
                if(imageSrc.length > 0 && Fn._isStringNotEmpty(imageSrc[0])){
                    fieldDataSrc = imageSrc[0];
                }
                if(imageSrc.length > 1 && Fn._isStringNotEmpty(imageSrc[1])){
                    filePathSrc = imageSrc[1];
                }
            }
            switch (fieldElement.type) {
                case _Column._type.image:
                    fieldElement.clearText = _i18n.upload.clearText;
                    fieldElement.noImageText = _i18n.upload.noImageText;
                    fieldElement.dragDropText = _i18n.upload.dragDropText;
                    fieldElement.uploadText = _i18n.upload.uploadText;
                    fieldElement.noFileText = _i18n.upload.noFileText;
                    fieldElement.fileReadText = _i18n.upload.uploadText;
                    fieldElement.ajax = _settings.ajax+'?_lang='+_settings.language+'&_t='+dataSrc+'&fieldName='+fieldElement.name;

                    fieldElement.display = function (file_id) {
                        var file = _this.file(fieldDataSrc, file_id);
                        var filePath = Fn._isStringNotEmpty(file[filePathSrc]) ? file[filePathSrc] : "";
                        if (Fn._isStringNotEmpty(filePath)) {
                            return file_id ?
                                '<img class="img-fluid" src="' + filePath + '"/>' :
                                null;
                        }
                    };
                    break;
                case _Column._type.select :
                    fieldElement.placeholder = _i18n.selectPlaceHolder;
                    break;
            }
            return fieldElement;
        }

        function processOptions(ajaxOption) {
            if(!$.isEmptyObject(ajaxOption)){
                _options = ajaxOption;
                _fields.forEach(function (field) {
                    var fieldOptions = Fn._getObjByArrayProp(_options, field.indexes, null);
                    if(fieldOptions !== null){
                        field.options = Fn._getObjByArrayProp(_options, field.indexes, {});
                        field.render = DataCardFn.field._getFieldRender(field.type, field.options, _this, field);
                    }
                });
                var multiDataSrc = _settings.multiFields.dataSrc;
                var multiFieldOptions = Fn._getObjByProp(_options, multiDataSrc, {});
                if(multiFieldOptions && Fn._getObjectLength(_settings.multiFields)>0 && _settings.multiFields.fields.length> 0){
                    _multiFields.forEach(function (multiField) {
                        multiField.options = Fn._getObjByArrayProp(multiFieldOptions, multiField.indexes, {});
                        multiField.render = DataCardFn.field._getFieldRender(multiField.type, multiField.options, _this, multiField);
                    });
                }
            }

            if(_DataCard.debug){
                console.log({
                    _event : "DataCard.processOptions() called",
                    ajaxOption : ajaxOption,
                    options : _options,
                    _fields : _fields,
                    _multiFields : _multiFields
                });
            }
        }

        function getDataByIndex(index) {
            var dataElement = null;
            if(index > -1 && index < _data.length){
                var dataItem = _data[index];
                if(Fn._isObject(dataItem)){
                    dataElement = dataItem;
                }
            }
            console.log({
                _event : "getDataByIndex(index) called",
                index : index,
                dataElement : dataElement
            });
            return dataElement;
        }

        function getDataById(id) {
            var dataElement = null;
            if(Fn._isStringNotEmpty(id)){
                dataElement  = _data.find(function (_d) {
                    return Object.keys(_d)[0] === id;
                })
            }
            console.log({
                _event : "getDataById(id) called",
                id : id,
                dataElement : dataElement
            });
            return dataElement;
        }

        function getDataIndexById(id) {
            var index = -1;
            if(Fn._isStringNotEmpty(id)){
                index = _data.findIndex(function (_d) {
                    return Object.keys(_d)[0] === id;
                });
            }

            if ( _DataCard.debug ) {
                console.log({
                    _event: "getDataIndexById(id) called",
                    id: id,
                    index: index
                });
            }
            return index;
        }

        /**
         * first function to be called
         * load data from the ajax url
         * @returns [] segmentedData
         */
        function segmentData() {
            var data = _displayData.slice();
            var dataLength = data.length;
            var segmentedData = [];
            if(_pageLength > 0 && dataLength > 0){
                var pageQty = Math.ceil(dataLength / _pageLength);
                var start = 0, end = _pageLength;
                for(var i = 1; i <= pageQty; i++){
                    segmentedData.push(data.slice(start, end));
                    start = start + _pageLength;
                    end = end + _pageLength;
                }
            }else {
                segmentedData[0] = data;
            }

            if(_DataCard.debug ){
                console.log({
                    _event : "segmentData() called",
                    pageLength : _pageLength,
                    currentPage : _currentPage,
                    _data : _data,
                    _displayData : _displayData,
                    segmentedData : segmentedData
                });
            }
            return segmentedData;
        }

        /**
         * END @private functions
         */

        /**
         * API functions
         */

        /**
         *
         * @returns {Array}
         */
        _this.file = function () {
            var argsLength = arguments.length;
            var returnVal  = null ;
            var type = "get";
            if(argsLength === 1){
                var arg1 = arguments[0];
                if(Fn._isSameType(arg1, [])){
                    _files = arg1;
                    returnVal = _this;
                    type = "set";
                }
            }else if(argsLength > 1){
                var dataSrc = arguments[0], file_id = arguments[1];
                if(Fn._isStringNotEmpty(dataSrc) && Fn._isStringNotEmpty(file_id)){
                    returnVal = Fn._getObjByArrayProp(_files, [dataSrc, file_id], null);
                }
            }
            if(_DataCard.debug) {
                console.log({
                    _event: "DataCard API file() called ->"+type,
                    arguments: arguments,
                    files: _files,
                    returnVal: returnVal
                });
            }
            return returnVal;
        };

        /**
         * get ajax data
         * @returns []||$
         */
        _this.data = function () {
            var argsLength = arguments.length;
            var ReturnVal = _data;
            var type = "get";
            if(argsLength === 1){
                var arg1 = arguments[0];
                if( Fn._isSameType(arg1, {}) && ! $.isEmptyObject(arg1)){
                    _data = arg1;
                    _displayData = _data.slice();
                    type = "set";
                    ReturnVal = _this;
                }
                if(Fn._isStringNotEmpty(arg1)){
                    ReturnVal = getDataById(arg1);
                }
                if( Fn._isSameType(arg1, 1) && arg1 > 0){
                    ReturnVal = getDataByIndex(arg1);
                }
            }else if (argsLength === 2){
                var start = arguments[0], end = arguments[1];
                if(
                    Fn._isSameType(start, 1) && Fn._isSameType(end, 1) &&
                    Fn._isSameType(_data, []) &&
                    start <= _data.length && end <= _data.length
                ){
                    end++;
                    ReturnVal = _data.slice(start, end);
                }
            }
            if(_DataCard.debug){
                console.log({
                    _event : "DataCard API data() called ->"+type,
                    datas : _data,
                    arguments : arguments
                });
            }
            return ReturnVal;
        };

        /**
         * draw the dataCard plugin from the array data
         * @returns jQuery
         */
        _this.draw = function () {
            var segmentedData = segmentData();
            if(_currentPage > segmentedData.length){
                _currentPage = segmentedData.length;
            }
            var elements = segmentedData[ _currentPage-1 ];

            var processTime = Date.now();
            DataCardFn.card._displayCards(_this, elements);
            processTime = Date.now() - processTime;
            _this.updateInfo();
            _settings.event.initDraw(_this);
            _settings.event.preDraw(_this);
            _settings.event.onDraw(_this);

            _Editor._enableField(_editor, _editorFields);
            DataCardFn.initListener(_this, _editor);

            _settings.event.postDraw(_this);
            var page = _this.page();
            var length = _this.length();
            if(_DataCard.debug){
                console.log({
                    _event : "DataCard API draw() called",
                    segmentedData : segmentedData,
                    elements : elements,
                    currentPage : _currentPage,
                    processTime : processTime,

                    page : page,
                    length : length
                });
            }
            return _this;
        };

        /**
         * destroy the dataCard plugin from the array data
         * @returns jQuery
         */
        _this.destroy = function () {
            var panelSelector = $(_settings[_prop.jquerySelector]);
            if(panelSelector !== null && panelSelector instanceof jQuery){
                panelSelector.html("");
            }
            var btnPanelSelector = $(_settings.controlPanel);
            if(btnPanelSelector !== null && btnPanelSelector instanceof jQuery){
                btnPanelSelector.html("");
            }
            return _this;
        };

        /**
         * get the options
         * @returns {*}
         */
        _this.settings = function () {
            return _settings;
        };

        /**
         * get translation
         * @returns {*}
         */
        _this.i18n = _i18n;

        _this.template = function () {
            if(arguments.length > 0){
                var $jqueryElement = arguments[0];
                if( $jqueryElement instanceof jQuery){
                    _jqueryTemplate = $jqueryElement;
                }
            }
            return _jqueryTemplate;
        };

        _this.element = function () {
            if(arguments.length === 1){
                var arg0 = arguments[0];
                if(Fn._isStringNotEmpty(arg0)){
                    return getDataById(arg0);
                }else if (Fn._isNumeric(arg0)){
                    return getDataByIndex(parseInt(arg0));
                }
            }
            return null;
        };

        _this.elements = function (selector) {
            if(Fn._isNotUndefined(selector)){
                switch (typeof selector){
                    case typeof "" :
                        if(Fn._isStringNotEmpty(selector)){
                            if(FnJquery.isValidSelector(selector)){
                                _selectedElements = $(selector);
                            }else {
                                _selectedElements = $("#"+selector);
                            }
                        }
                        _selectedElements = [];
                        break;

                    case typeof 1 :
                        break;

                }
            }else {
                _selectedElements = $("."+models.card.item.attr.class, "."+models.card.rowCardContainer.attr.class);
            }

            if(_DataCard.debug){
                console.log({
                    _event : "DataCard API elements() called",
                    selector : selector,
                    _selectedElements : _selectedElements
                });
            }
            return _this;
        };

        function _getFieldByUniqueId() {
            var returnVal = null;

            if(arguments.length > 1){
                var fieldId = arguments[0];
                var arrayField = arguments[1];
                if(Fn._isSameType(fieldId, "")){

                    var field = arrayField.find(function (element) {
                        return element._uniqueId === fieldId;
                    });
                    returnVal =  Fn._isNotUndefined(field) ? field : null;
                }

            }
            return returnVal;

        }

        /**
         * get array editorFields
         */
        _this.fields = function () {
            var returnVal = _fields;
            if(arguments.length > 0){
                var searchFieldName = arguments[0];
                if(Fn._isSameType(searchFieldName, "")){

                    var field = _fields.find(function (element) {
                        return element.name === searchFieldName;
                    });
                    returnVal =  Fn._isNotUndefined(field) ? field : null;
                }
            }
            if(_DataCard.debug){
                console.log({
                    _event : "DataCard API fields() called",
                    arguments : arguments,
                    returnVal : returnVal,
                    _fields : _fields
                });
            }
            return returnVal;
        };

        /**
         * get array editorFields
         */
        _this.multiFields = function () {
            var returnVal = _multiFields;
            if(arguments.length > 0){
                var searchFieldName = arguments[0];
                if(Fn._isSameType(searchFieldName, "")){
                    var multiField = _multiFields.find(function (element) {
                        return element.name === searchFieldName;
                    });
                    returnVal =  Fn._isNotUndefined(multiField) ? multiField : null;
                }
            }
            if(_DataCard.debug){
                console.log({
                    _event : "DataCard API multiFields() called",
                    arguments : arguments,
                    returnVal : returnVal,
                    _multiFields : _multiFields
                });
            }
            return returnVal;
        };

        /**
         * get array editorFields
         */
        _this.editorFields = function () {
            return _editorFields;
        };

        function getMultiDataCompareVal(sortField, data, arrayItemSrcData, multiFieldDataSrc, asc, caseInsensitive) {
            var compareValue = "";
            var dataRow = data[Object.keys(data)[0]];
            var multiData = Object.entries(Fn._getObjByProp(dataRow, multiFieldDataSrc, []));

            multiData = multiData.filter(function (item) {
                return arrayItemSrcData.includes(item[0]);
            });

            if(_DataCard.debug) {
                console.log({
                    sortField: sortField,
                    multiData: multiData,
                    data: data,
                    dataRow: dataRow
                });
            }
            multiData.sort(function (multiData_1, multiData_2) {
                var multiData_1_val = Fn._getObjByProp(multiData_1[1], sortField.name, "");
                var multiData_2_val = Fn._getObjByProp(multiData_2[1], sortField.name, "");
                var
                    compareVal_1 = multiData_1_val,
                    compareVal_2 = multiData_2_val
                ;
                var renderFn = Fn._getObjByProp(sortField, _prop.render, null);
                if(Fn._isFunction(renderFn)){
                    compareVal_1 = renderFn(multiData_1_val, sortField.type, dataRow, _settings);
                    compareVal_2 = renderFn(multiData_2_val, sortField.type, dataRow, _settings);

                }
                var orderFn = Fn._getObjByProp(DataCard._ext.order, sortField.type, null);
                if(Fn._isFunction(sortField.order)){
                    orderFn = sortField.order;
                }
                if(Fn._isFunction(orderFn)){
                    compareVal_1 = orderFn(_settings, sortField, multiData_1_val, dataRow);
                    compareVal_2 = orderFn(_settings, sortField, multiData_2_val, dataRow);
                }

                if(Fn._isStringNotEmpty(compareVal_1)){
                    compareVal_1 = multiData_1_val.trim();
                }

                if(Fn._isStringNotEmpty(compareVal_2)){
                    compareVal_2 = multiData_2_val.trim();
                }


                var a_1_val = compareVal_1, a_2_val = compareVal_2;
                if(!asc){
                    a_1_val = compareVal_2;
                    a_2_val = compareVal_1;
                }
                if( caseInsensitive && Fn._isSameType(a_1_val, "") && Fn._isSameType(a_2_val, "") ){
                    a_1_val = a_1_val.toLowerCase();
                    a_2_val = a_2_val.toLowerCase();
                }

                if(a_1_val < a_2_val){
                    return -1;
                }
                if(a_1_val > a_2_val){
                    return  1;
                }
                return 0;
            });


            if(multiData.length > 0){
                multiData = multiData[0];
                compareValue = Fn._getObjByProp(multiData[1], sortField.name, "");
                compareValue = compareValue.trim();
            }

            return compareValue;
        }

        function generalSearch(data, searchValue) {
            var caseInsensitive = Fn._getObjByProp(_settings, _prop.caseInsensitive, DataCardDefaults.options.caseInsensitive);
            var returnData = data.slice();
            var allFields = _fields.concat(_multiFields);
            if( Fn._isStringNotEmpty(searchValue)){
                returnData = returnData.filter(function (element) {
                    var elementId = Object.keys(element)[0];
                    var dataElement = element[elementId];
                    for (var i = 0; i < allFields.length; i++){
                        var field = allFields[i];

                        if(field.search && field.visible){
                            var fieldValue = "";
                            if(field._isMultiField){

                            }else {

                                fieldValue = Fn._getObjByArrayProp(dataElement, field.indexes, "");
                            }
                            var render = field.render;
                            if(Fn._isFunction(render)){
                                fieldValue = render(fieldValue, field.type, dataElement, _settings);
                            }
                            if(caseInsensitive){
                                fieldValue = fieldValue.toLowerCase();
                            }
                            if(fieldValue.includes(searchValue)){
                                return true;
                            }
                        }
                    }
                    return false;
                });
            }
            if(_DataCard.debug || true) {
                console.log({
                    _event : "generalSearch() called",
                    _editorFields : _editorFields,
                    allFields : allFields,
                    fields : _fields,
                    multiFields : _multiFields,
                    returnData: returnData,
                    setting: _settings
                });
            }
            return returnData;
        }

        _this.filter = function () {
            if(arguments.length > 0){
                _filterArguments = arguments;
            }
            var debug = {
                _event: "DataCard API filter() called",
                _data : _data,
                _filterArguments: _filterArguments,
                arguments: arguments
            };


            if(Fn._isNotUndefined(_filterArguments) && _filterArguments.length > 0){

                DataCardFn.editor._disableSortable(_this, '.' + models.card.rowCardContainer.attr.class);

                var processTime = Date.now();
                var search = _filterArguments[0];
                if(Fn._isSameType(search, "")){

                    search = search.toLowerCase().trim();

                    if(search !== _lastSearchValue && Fn._isStringNotEmpty(search)){

                        DataCardFn.editor._disableSortable(_this, '.' + models.card.rowCardContainer.attr.class);

                        _displayData = generalSearch(_data, search);

                    }else {
                        _displayData = _data.slice();
                    }
                    _lastSearchValue = search;
                }
                else if(Fn._isSameType(search, {}) && ! $.isEmptyObject(search)){
                    var genSearch = Fn._getObjByProp(search, _prop.search, "");
                    _displayData = generalSearch(_data, genSearch);
                    var
                        fields = Fn._getObjByProp(search, _prop.fields, []),
                        arraySearchFields = [],
                        arraySearchValue = []
                    ;
                    $.each(fields, function (fieldsName, searchVal) {
                        // var field = _this.fields(fieldsName);
                        var field = _getFieldByUniqueId(fieldsName, _fields);
                        searchVal = searchVal.trim().toLowerCase();
                        if(field !== null && Fn._isStringNotEmpty(searchVal)){
                            arraySearchFields.push(field);
                            arraySearchValue.push(searchVal);
                        }
                    });
                    if(arraySearchFields.length > 0){
                        for (var i = 0; i < arraySearchFields.length; i++){

                            var field = arraySearchFields[i];
                            var searchVal  = arraySearchValue[i];
                            if(field.search && field.visible){
                                _displayData = _displayData.filter(function (element) {
                                    element = element[Object.keys(element)[0]];
                                    var
                                        fieldVal = Fn._getObjByArrayProp(element, field.indexes, ""),
                                        render = field.render
                                    ;
                                    if(Fn._isFunction(render)){
                                        fieldVal = render(fieldVal, field.type, element, _settings);
                                    }
                                    fieldVal = fieldVal.toLowerCase();

                                    if(_DataCard.debug ) {
                                        console.log({
                                            _event: "DataCard API filter() called",
                                            searchVal: fieldVal,
                                            searchNormal: searchVal,
                                            field: field,
                                            element: element
                                        });
                                    }
                                    return fieldVal.includes(searchVal);
                                });

                            }
                        }

                    }

                    var
                        multiFields = Fn._getObjByProp(search, _prop.multiFields, {}),
                        arraySearchMultiFields = [],
                        arraySearchMultiValue = []
                    ;
                    $.each(multiFields, function (multiFieldsName, multiSearchVal) {
                        // var multiField = _this.multiFields(multiFieldsName);
                        var multiField = _getFieldByUniqueId(multiFieldsName, _multiFields);
                        multiSearchVal = multiSearchVal.trim().toLowerCase();
                        if(multiField !== null && Fn._isStringNotEmpty(multiSearchVal)){
                            arraySearchMultiFields.push(multiField);
                            arraySearchMultiValue.push(multiSearchVal);
                        }
                    });

                    if(arraySearchMultiFields.length > 0){
                        var multiFieldDataSrc = Fn._getObjByArrayProp(_settings, [_prop.multiFields, _prop.dataSrc], "");
                        var arrayItemSrc = Fn._getObjByArrayProp(_settings, [_prop.multiFields, _prop.itemSrc], []);
                        arrayItemSrc = arrayItemSrc.filter(function (itemSrc) {
                            return itemSrc.search && Fn._isStringNotEmpty(itemSrc.data) && itemSrc.visible;
                        });

                        if(_DataCard.debug ) {
                            console.log({
                                _event: "DataCard API filter() called",
                                arrayItemSrc: arrayItemSrc,
                                multiFieldDataSrc: multiFieldDataSrc,
                                arraySearchMultiFields: arraySearchMultiFields,
                                arraySearchMultiValue: arraySearchMultiValue
                            });
                        }
                        if(Fn._isStringNotEmpty(multiFieldDataSrc)){
                            for (var i_m = 0; i_m < arraySearchMultiFields.length; i_m++){

                                var fieldMulti = arraySearchMultiFields[i_m];
                                var searchMulti  = arraySearchMultiValue[i_m];

                                if(Fn._isStringNotEmpty(searchMulti) && fieldMulti.search){
                                    _displayData = _displayData.filter(function (element) {
                                        element = element[Object.keys(element)[0]];


                                        for(var i_itemSrc = 0; i_itemSrc < arrayItemSrc.length; i_itemSrc ++){
                                            var itemSrc = arrayItemSrc[i_itemSrc];
                                            var
                                                fieldValue = Fn._getObjByArrayProp(element, [multiFieldDataSrc, itemSrc.data, fieldMulti.name], ""),
                                                renderMulti = fieldMulti.render
                                            ;
                                            if(Fn._isFunction(renderMulti)){
                                                fieldValue = renderMulti(fieldValue, fieldMulti.type, element, _settings);
                                            }
                                            fieldValue = fieldValue.toLowerCase().toString();

                                            if(fieldValue.includes(searchMulti)){
                                                return true;
                                            }
                                        }
                                        return false;
                                    });
                                }

                            }

                        }

                    }

                    if(_DataCard.debug){
                        console.log({
                            _event: "DataCard API filter() called",
                            search : search,
                            _displayData : _displayData,
                            _data : _data,
                            fields : fields,
                            searchFields : arraySearchFields,
                            searchValue : arraySearchValue
                        });
                    }
                }else {
                    _displayData = _data.slice();
                }

                if(_displayData.length === _data.length){
                    DataCardFn.editor._enableSortable(_this, '.' + models.card.rowCardContainer.attr.class);
                }

                processTime = Date.now() - processTime;
                debug.processTime = processTime;
                debug.endData = _displayData;
                debug._data = _data;
                debug._filterArguments = _filterArguments;
                debug._lastSearchValue = _lastSearchValue;

                if(_DataCard.debug){
                    console.log(debug);
                }
            }
            return _this;

        };
        /**
         *
         * @returns {jQuery} dataCard
         */
        _this.sort = function () {
            if(arguments.length > 2){
                _sortArguments = arguments;
            }
            if(Fn._isNotUndefined(_sortArguments) && _sortArguments.length > 2){
                var
                    sortFieldId =     Fn._isSameType(_sortArguments[0], "") ? _sortArguments[0] : "",
                    asc =               Fn._isSameType(_sortArguments[1], true) ? _sortArguments[1] : true ,
                    isMultiField =      Fn._isSameType(_sortArguments[2], false) ?  _sortArguments[2] : false,
                    caseInsensitive =   Fn._isSameType(_sortArguments[3], true) ?  _sortArguments[3] : true,
                    processTime =       Date.now()
                ;

                if( Fn._isStringNotEmpty(sortFieldId) ){
                    var sortField = null;
                    if(isMultiField){
                        sortField = _getFieldByUniqueId(sortFieldId, _multiFields);
                        var
                            arrayItemSrc = Fn._getObjByArrayProp(_settings, [_prop.multiFields, _prop.itemSrc], []),
                            multiFieldDataSrc = Fn._getObjByArrayProp(_settings, [_prop.multiFields, _prop.dataSrc], ""),
                            arrayItemSrcData = []
                        ;

                        if(
                            sortField !== null && !$.isEmptyObject(sortField) &&
                            Fn._isStringNotEmpty(multiFieldDataSrc) && arrayItemSrc.length > 0
                        ){
                            arrayItemSrc.forEach(function (item) {
                                if(Fn._isStringNotEmpty(item.data) && item.sort && !arrayItemSrcData.includes(item.data) && item.visible){
                                    arrayItemSrcData.push(item.data);
                                }
                            });

                            if(arrayItemSrcData.length > 0){
                                _displayData = _displayData.sort(function (a, b) {
                                    a = getMultiDataCompareVal(sortField, a, arrayItemSrcData, multiFieldDataSrc, asc, caseInsensitive);
                                    b = getMultiDataCompareVal(sortField, b, arrayItemSrcData, multiFieldDataSrc, asc, caseInsensitive);

                                    var position = 0, a_value = a, b_value = b;
                                    if(!asc){
                                        a_value = b;
                                        b_value = a;
                                    }
                                    if(caseInsensitive){
                                        a_value = a_value.toLowerCase();
                                        b_value = b_value.toLowerCase();
                                    }
                                    if ( _DataCard.debug) {
                                        console.log({
                                            a : a,
                                            b : b,
                                            arrayItemSrc : arrayItemSrc,
                                            arrayItemSrcData : arrayItemSrcData,
                                            position : position
                                        });
                                    }
                                    if(a_value < b_value){
                                        position = -1;
                                    }
                                    if(a_value > b_value){
                                        position =  1;
                                    }
                                    return position;
                                });
                            }
                        }
                    }
                    else {
                        sortField = _getFieldByUniqueId(sortFieldId, _fields);
                        if(sortField !== null && !$.isEmptyObject(sortField)){

                            _displayData = _displayData.sort(function (a, b) {
                                var a_data = a[Object.keys(a)[0]];
                                var b_data = b[Object.keys(b)[0]];
                                a = Fn._getObjByArrayProp(a_data, sortField.indexes, "");
                                b = Fn._getObjByArrayProp(b_data, sortField.indexes, "");
                                var
                                    compareVal_a = a,
                                    compareVal_b = b
                                ;
                                var renderFn = Fn._getObjByProp(sortField, _prop.render, null);
                                if(Fn._isFunction(renderFn)){
                                    compareVal_a = renderFn(a, sortField.type, a_data, _settings);
                                    compareVal_b = renderFn(b, sortField.type, b_data, _settings);
                                }

                                var orderFn = Fn._getObjByProp(DataCard._ext.order, sortField.type, null);

                                if(Fn._isFunction(sortField.order)){
                                    orderFn = sortField.order;
                                }
                                if(Fn._isFunction(orderFn)){
                                    compareVal_a = orderFn(_settings, sortField, a, a_data);
                                    compareVal_b = orderFn(_settings, sortField, b, b_data);
                                }

                                if(Fn._isStringNotEmpty(compareVal_a)){
                                    compareVal_a = compareVal_a.trim();
                                }
                                if(Fn._isStringNotEmpty(compareVal_b)){
                                    compareVal_b = compareVal_b.trim();
                                }

                                var position = 0, value1 = compareVal_a, value2 = compareVal_b;

                                if(!asc){
                                    value1 = compareVal_b;
                                    value2 = compareVal_a;
                                }
                                if(caseInsensitive && Fn._isStringNotEmpty(value1) && Fn._isStringNotEmpty(value2)){
                                    value1 = value1.toLowerCase();
                                    value2 = value2.toLowerCase();
                                }
                                if(value1 < value2){
                                    position = -1;
                                }
                                if(value1 > value2){
                                    position = 1;
                                }

                                if ( _DataCard.debug){
                                    console.log({
                                        _event: "DataCard API sort() called",
                                        orderFn : orderFn,
                                        a : a,
                                        b : b,
                                        value1 : value1,
                                        value2 : value2,
                                        position : position,
                                        sortField : sortField
                                    });
                                }
                                return position;
                            });
                        }
                    }

                }

                if ( _DataCard.debug) {
                    processTime = Date.now() - processTime;
                    console.log({
                        _event: "DataCard API sort() called",
                        _sortArguments: _sortArguments,
                        asc : asc,
                        arguments: arguments,
                        processTime : processTime,
                        _displayData : _displayData
                    })
                }
            }
            return _this;
        };

        _this.length = function () {
            var returnVal = _pageLength;
            if(arguments.length > 0) {
                var length = arguments[0];
                if(Fn._isNumeric(length)){
                    _pageLength = _settings.pageLength = parseInt(length);
                    returnVal =  _this;
                }
            }
            if(_DataCard.debug){
                console.log({
                    _event: "DataCard API length() called",
                    arguments : arguments,
                    returnVal : returnVal,
                    pageLength : _pageLength
                });
            }
            return returnVal;
        };

        _this.page = function () {
            var returnVal = _currentPage;
            if(arguments.length > 0) {
                var index = arguments[0];
                if(Fn._isNumeric(index)){
                    _currentPage = parseInt(index);
                    returnVal = _this;
                }
            }
            if(_DataCard.debug){
                console.log({
                    _event: "DataCard API page() called",
                    arguments : arguments,
                    returnVal : returnVal,
                    _currentPage : _currentPage
                });
            }
            return returnVal;
        };

        /**
         * return the editor instance
         * @returns {Editor|*}
         */
        _this.editor = function () {
            return _editor;
        };

        _this.updateInfo = function () {
            var segmentedData = segmentData();
            DataCardFn.control._drawPagination(
                _this, segmentedData, _currentPage, _pageLength, _displayData, _data
            );
            return _this;
        };

        _this.ajax = {
            initData : function (ajaxResponse) {
                if(Fn._isJsonString(ajaxResponse)){
                    ajaxResponse = JSON.parse(ajaxResponse)
                }else {
                    ajaxResponse = {}
                }
                _this.data(Fn._getObjByProp(ajaxResponse, _prop.data, []));
                _this.file(Fn._getObjByProp(ajaxResponse, _prop.files, []));
                processOptions(Fn._getObjByProp(ajaxResponse, _prop.options, {}));
                if(_DataCard.debug){
                    console.log({
                        _event: "DataCard API ajax.initData() called",
                        ajaxResponse : ajaxResponse
                    });
                }
            },
            reload : function () {
                var callBack;
                var isRedraw = false;
                if(arguments.length > 0){
                    isRedraw = Fn._isSameType(arguments[0], true) ? arguments[0] : isRedraw;
                }
                if(arguments.length > 1){
                    callBack = arguments[1];
                }
                ajaxPromise().done(function (response) {
                    response = JSON.parse(response);
                    processOptions(Fn._getObjByProp(response, _prop.options, {}));
                    _this.data( Fn._getObjByProp(response, _prop.data, []) );
                    _this.file(Fn._getObjByProp(response, _prop.files, []));
                    _this.filter().sort().updateInfo()
                    ;
                    if(isRedraw){
                        _this.draw();
                    }
                    if(Fn._isFunction(callBack)){
                        callBack();
                    }
                });
                if(_DataCard.debug) {
                    console.log({
                        _event: "DataCard API ajax.reload() called",
                        _data: _data,
                        _this : _this,
                        arguments : arguments,
                        callBack : callBack,
                        redraw : isRedraw
                    });
                }
                return _this;
            },
            loadFiles : function () {
                ajaxPromise().done(function (response) {
                    response = JSON.parse(response);
                    var files = Fn._getObjByProp(response, _prop.files, []);
                    _this.file(files);
                    console.log({
                        _event: "DataCard API ajax.loadFiles() called",
                        _files : _files,
                        response : response
                    });
                });
                return _this;
            }
        };

        /**
         * END API functions
         */

        TemplateFn._createEditorTemplate(_settings);

        initialize();

        _settings.event.started(_this);

        dataCardInitTime = Date.now() - dataCardInitTime;

        if( _DataCard.debug ){
            console.log({
                _event : "$.fn.DataCard() called",
                dataCardInitTime : dataCardInitTime,
                dataCard : _this,
                settings : _settings
            });
        }
        return _this;

    };


    $.fn.dataCard._ext = {
        order : {
            datetime : function (settings, field, data, rowData) {
                return parseInt(data);
            },
            time : function (settings, field, data, rowData) {
                return parseInt(data);
            },
            date : function (settings, field, data, rowData) {
                return parseInt(data);
            }
        }
    };


    /**
     * DataCard functions
     */

    var DataCard = $.fn.DataCard = $.fn.dataCard;

    /**
     * DataCard Models
     */
    var models = DataCard.model = {
        hideClass : "hide",
        highlightClass : "highlight",
        active : "active",
        selectedClass : "selected",
        selectedAttr : "selected",
        disabledClass : "disabled",
        disabledAttr : "disabled",
        btnXsClass : "btn-xs",
        dataIdAttr : "data-id",
        dataTitleSrcAttr : "data-title-src",
        dataPageIndexAttr : "data-page-index",
        editorField : "editor-field",
        dataEditorIdAttr : "data-editor-id",
        dataEditorFieldAttr : "data-editor-field",
        dataEditorAttr : "data-editor",
        dataMultiFieldAttr : "data-multi-field",
        dataCardButtonsAttr : "data-card-buttons",
        dataCardBtnAttr : "data-card-btn",
        dataCardFieldAttr : "data-card-field",
        dataCardMultiFieldAttr : "data-card-multi-field"
    };

    models.control = {
        controlPanelContainer : {
            attr : {
                'class' : "dc-control-container"
            }
        },
        btnPanel : {
            attr : {
                'class' : 'dc-btn-panel'
            }
        },
        btn : {
            btnGroup : {
                attr : {
                    "class" : "dc-btn-group btn-group flex-wrap"
                }
            },
            item : {
                attr : {
                    "class" : "dc-button btn  m-b-0",
                    "data-toggle" : "tooltip",
                    "data-placement" : "bottom",
                    title : ''
                }
            },
            reOrder : {
                attr : {
                    "class" : "dc-reOrder"
                }

            },
            edit : {
                attr : {
                    "class" : "dc-edit"
                }
            },
            select : {
                attr : {
                    "class" : "dc-select"
                }
            },
            remove : {
                attr : {
                    "class" : "dc-remove"
                }
            },
            create : {
                attr : {
                    "class" : "dc-create"
                }
            },
            selectAll : {
                attr : {
                    "class" : "dc-select-all"
                }
            },
            selectNone : {
                attr : {
                    "class" : "dc-select-none"
                }
            }
        },
        clone : {
            attr : {
                "class" : "dc-control-clone"
            },
            stickyClass : "sticky bg-light elevation"
        },
        filterClass : "dc-control-filter",
        selectLength : {
            attr : {
                'class' : 'dc-select-length'
            }
        },
        inputSearch : {
            attr : {
                type : 'search',
                'class' : 'dc-input-search'
            }
        },
        pagination : {
            aBtn : {
                attr : {'class' : 'page-link'}
            },
            liBtn : {
                attr : {"class" : "page-item"}
            }
        },
        sort : {
            fieldNameAttr  : "sort-field-name",
            fieldIdAttr  : "sort-field-id",
            'class' : "dc-sort",
            asc : 'sort_asc',
            desc : "sort_desc"
        },
        search : {
            fieldNameAttr  : "search-field-name",
            fieldIdAttr  : "search-field-id",
            'class' : "dc-search"
        }
    };

    models.card = {
        rowCardContainer : {
            attr : {
                "class" : 'dc-row-container'
            }
        },
        rowPageLengthContainer : {
            attr : {
                "class" : 'dc-row-length-container'
            }
        },
        pageInfo : {
            attr : {
                "class" : 'dc-page-info col-lg-6 col-md-12',
                "id" : 'dc-page-info'
            }
        },
        pagination : {
            attr : {
                "class" : 'dc-pagination col-lg-6 col-md-12',
                "id" : 'dc-pagination'
            }
        },
        item : {
            attr : {
                "class" : "dc-card"
            }
        },
        container : {
            attr: {
                "class": "dc-card-container",
                "data-toggle" : "tooltip",
                "data-placement" : "top",
                "title" : ''
            },
            className : 'elevation p-10 m-b-10 m-t-10'
        },
        btnContainer : {
            attr : {
                "class" : "dc-card-btn-container"
            }
        }

    };

    models.field = {
        fieldContainer : {
            attr : {
                "class" : "dc-field-container"
            }
        },
        multiFieldContainer : {
            attr : {
                "class" : "dc-multi-field-container"
            }
        },
        item : {
            attr : {
                "class" : "dc-field"
            },
            multi : {
                attr : {
                    "class" : "dc-multi-field"
                }
            },
            legend : {
                attr : {
                    "class" : "dc-field-title"
                }
            },
            fieldSet : {
                attr : {
                    "class" : "dc-field-set"
                }
            },
            label : {
                attr : {
                    "class" : "dc-field-label"
                }
            },
            display : {
                attr : {
                    "class" : "dc-field-display"
                }
            },
            value : {
                attr : {
                    "class" : "dc-field-value"
                }
            }
        }
    };

    models.editor = {
        template : {
            attr : {
                "class" : "dc-editor-template",
                id : "dc-editor-template"
            }
        }
    };

    DataCard.button = {
        _arrayButtons : [
            _DataCard.button.selectAll, _DataCard.button.selectNone, _DataCard.button.remove, _DataCard.button.edit, _DataCard.button.create
        ],
        _arrayCardButtons : [
            _DataCard.button.remove1, _DataCard.button.edit1, _DataCard.button.reOrder, _DataCard.button.select1
        ],
        control : {
            create : {
                name : "create",
                title : "",
                className : models.control.btn.create.attr.class,
                icon : '<i class="fa fa-plus"></i>',
                action : function (event, dataCard, editor) {
                    var translation = dataCard.i18n;
                    editor
                        .title(translation.create.title)
                        .buttons(translation.create.button)
                        .create();
                }
            },
            edit : {
                name : "edit",
                title : "",
                className : models.control.btn.edit.attr.class,
                icon : '<i class="fas fa-edit"></i>',
                action : function (event, dataCard, editor) {

                    var i18n = dataCard.i18n;
                    var settings = dataCard.settings();
                    var arrayId = [];
                    var arrayTitle = [];
                    var $selectedCard = DataCardFn.jqElement._getSelectedCards(settings[_prop.jquerySelector]);
                    $selectedCard.each(function () {
                        var
                            $elem = $(this),
                            id = $elem.attr(models.dataEditorIdAttr),
                            title = $elem.attr(models.dataTitleSrcAttr)
                        ;
                        if(Fn._isStringNotEmpty(title)){
                            title = "'"+title+"'";
                            arrayTitle.push(title);
                        }

                        if(Fn._isStringNotEmpty(id)){
                            arrayId.push(id);
                        }
                    });

                    if(_DataCard.debug ){
                        console.log({
                            selectedCard : $selectedCard,
                            arrayId : arrayId,
                            arrayTitle : arrayTitle
                        });
                    }

                    if(arrayId.length > 0 ){
                        var title = i18n.edit.title;
                        if(arrayId.length === arrayTitle.length){
                            title += ' : ' + arrayTitle.join(', ');
                        }
                        editor
                            .title(title)
                            .buttons(i18n.edit.button)
                            .edit(arrayId);

                    }
                }
            },
            selectAll : {
                name : "selectAll",
                title : "",
                className : models.control.btn.selectAll.attr.class,
                icon : '<span class="fa-stack fa-xs text-sm">' +
                '<i class="far fa-square fa-stack-2x"></i><i class="fas fa-check-double fa-inverse"></i>' +
                '</span>',
                action : function (event, dataCard, editor) {
                    var settings = dataCard.settings();
                    var $cards = $("."+models.card.item.attr.class, settings[_prop.jquerySelector]);
                    if($cards !== null && $cards instanceof jQuery){
                        $cards.addClass(models.selectedClass);
                        DataCardFn.listener.enableDisableBtn(dataCard, editor);
                    }
                    DataCardFn.pagination._updateSelectedItemInfo(dataCard);
                }
            },
            selectNone : {
                name : "selectNone",
                title : "",
                className : models.control.btn.selectNone.attr.class,
                icon : '<i class="far fa-square"></i>',
                action : function (event, dataCard, editor) {
                    var settings = dataCard.settings();
                    var $cards = $("."+models.card.item.attr.class, settings[_prop.jquerySelector]);
                    if($cards !== null && $cards instanceof jQuery){
                        $cards.removeClass(models.selectedClass);
                        DataCardFn.listener.enableDisableBtn(dataCard, editor);
                    }
                    DataCardFn.pagination._updateSelectedItemInfo(dataCard);
                }
            },
            remove : {
                name : "remove",
                title : "",
                className : models.control.btn.remove.attr.class,
                icon : '<i class="far fa-trash-alt"></i>',
                action : function (event, dataCard, editor) {
                    var i18n = dataCard.i18n;
                    var settings = dataCard.settings();
                    var
                        arrayId = [],
                        arrayTitle = [],
                        $selectedCard = DataCardFn.jqElement._getSelectedCards(settings[_prop.jquerySelector])
                    ;
                    $selectedCard.each(function () {
                        var
                            $elem = $(this),
                            id = $elem.attr(models.dataEditorIdAttr),
                            title = $elem.attr(models.dataTitleSrcAttr)
                        ;

                        if(Fn._isStringNotEmpty(title)){
                            title = "'"+title+"'";
                            arrayTitle.push(title);
                        }
                        if(Fn._isStringNotEmpty(id)){
                            arrayId.push(id);
                        }
                    });

                    if(_DataCard.debug ){
                        console.log({
                            selectedCard : $selectedCard,
                            arrayId : arrayId,
                            arrayTitle : arrayTitle
                        });
                    }

                    if(arrayId.length > 0 ){
                        var title = i18n.remove.title;
                        if(arrayId.length === arrayTitle.length){
                            title += ' : ' + arrayTitle.join(', ');
                        }
                        editor
                            .title(title)
                            .buttons(i18n.remove.button)
                            .message(i18n.remove.confirm["_"].replace("%d", arrayId.length))
                            .remove(arrayId);

                    }
                }
            }
        },
        card : {
            select1 : {
                name : "select1",
                title : "",
                className : models.control.btn.select.attr.class,
                icon : '<i class="fas fa-check"></i>',
                action : function (event, dataCard, editor, node, dataId) {
                    var i18n = dataCard.i18n;
                    var $element = $(node).closest("."+models.card.item.attr.class);
                    $element.toggleClass(models.selectedClass);
                    var title = i18n._custom.tooltip.clickToSelect;
                    if($element.hasClass(models.selectedClass)){
                        title = i18n._custom.tooltip.clickToUnSelect;
                    }
                    $(node).tooltip( "hide" )
                        .attr('data-original-title', title)
                        .tooltip('show')
                    ;

                    DataCardFn.listener.enableDisableBtn(dataCard, editor);
                    DataCardFn.pagination._updateSelectedItemInfo(dataCard);
                }
            },
            edit1 : {
                name : "edit1",
                title : "",
                className : models.control.btn.edit.attr.class,
                icon : '<i class="fas fa-edit"></i>',
                action : function (event, dataCard, editor, node, dataId, rowData) {
                    var
                        i18n = dataCard.i18n,
                        $elem = $(node)
                    ;
                    if( Fn._isStringNotEmpty(dataId)) {
                        var
                            title = i18n.edit.title,
                            elementTitle = $elem.closest('.'+models.card.item.attr.class).attr(models.dataTitleSrcAttr)
                        ;
                        if(Fn._isStringNotEmpty(elementTitle)){
                            title = title + " : " + elementTitle;
                        }
                        editor
                            .title(title)
                            .buttons(i18n.edit.button)
                            .edit( dataId );
                    }
                }
            },
            remove1 : {
                name : "remove1",
                title : "",
                className : models.control.btn.remove.attr.class,
                icon : '<i class="far fa-trash-alt"></i>',
                action : function (event, dataCard, editor, node, dataId) {
                    event.stopPropagation();
                    var i18n = dataCard.i18n;
                    var $elem = $(node);

                    if( Fn._isStringNotEmpty(dataId) ){
                        var title = i18n.remove.title;
                        var elementTitle = $elem.closest('.'+models.card.item.attr.class).attr(models.dataTitleSrcAttr);
                        if(Fn._isStringNotEmpty(elementTitle)){
                            title = title + " : " + elementTitle;
                        }
                        editor
                            .title(title)
                            .buttons(i18n.remove.button)
                            .message(i18n.remove.confirm["1"])
                            .remove( dataId)
                        ;
                    }
                }
            },
            reOrder : {
                name : "reOrder",
                title : "",
                className : models.control.btn.reOrder.attr.class,
                icon : '<i class="fas fa-arrows-alt"></i>',
                action : null
            }
        }

    };

    var TemplateFn = {};

    /**
     * create a custom template for the editor
     * @param settings
     * @private
     */
    TemplateFn._createEditorTemplate = function (settings) {
        var templateSelector = Fn._getObjByProp(settings, _prop.editorTemplate, DataCardDefaults.options.editorTemplate);
        var $editorTemplate = $(templateSelector);
        if(!$editorTemplate.length ){
            $editorTemplate = _createJqueryElement("div", models.editor.template.attr);
            var
                arrayFields = Fn._getObjByProp(settings, _prop.fields, []),
                dataSrc = Fn._getObjByProp(settings, _prop.dataSrc, "")
            ;
            if(arrayFields.length>0){
                var $fieldSetNormal = TemplateFn._createEditorFieldSet(arrayFields);
                $editorTemplate.append($fieldSetNormal);
            }
            $editorTemplate = TemplateFn._createEditorFieldSetMulti(settings, dataSrc, $editorTemplate);
            $editorTemplate.appendTo("body");

            if(_DataCard.debug){
                console.log({
                    _event : "TemplateFn._createEditorTemplate(settings)",
                    settings : settings,
                    $editorTemplate : $editorTemplate
                });
            }
        }

    };

    TemplateFn._createEditorFieldSet = function (arrayFields) {
        var $fieldSetNormal = _createJqueryElement("div", {"class" : "col-lg-12"});
        $.each(arrayFields, function (index, element) {
            var field = $.extend(true, {}, element);
            field.data = element.name;
            var $editorField = _createJqueryElement(DataCard.model.editorField, {"name" : field.name});

            $fieldSetNormal.append($editorField);
        });
        return $fieldSetNormal;
    };

    TemplateFn._createEditorFieldSetMulti = function (settings, dataSrc, $templateContainer) {

        var
            multiField = Fn._getObjByProp(settings, _prop.multiFields, {}),
            multiDataSrc = Fn._getObjByProp(multiField, _prop.dataSrc, ""),
            multiItemSrc = Fn._getObjByProp(multiField, _prop.itemSrc, []),
            arrayMultiFields = Fn._getObjByProp(multiField, _prop.fields, [])
        ;
        var fieldSetMultiClass = "col-lg-12";
        if(multiItemSrc.length > 1){
            fieldSetMultiClass = "col-lg-6";
        }
        $.each(multiItemSrc, function (index, itemSrc) {
            var
                $fieldSetMulti = $('<div/>').attr({"class" : fieldSetMultiClass}),
                $fieldSet = _createJqueryElement("fieldset", models.field.item.fieldSet.attr),
                $legend = _createJqueryElement("legend", models.field.item.legend.attr).text(itemSrc.title)
            ;
            $fieldSet.append($legend);
            $.each(arrayMultiFields, function (multiFieldIndex, element) {
                var field = $.extend(true, {}, element);
                var dataSrcMulti = Fn._isSameType(dataSrc, '') && multiDataSrc !== "" ? multiDataSrc+ '.' : "";
                var src = Fn._isObject(itemSrc) && Fn._isStringNotEmpty(Fn._getObjByProp(itemSrc, _prop.data, "")) ? itemSrc.data + '.' : "";

                field.name = dataSrcMulti + src + field.name;
                var $editorField = _createJqueryElement(DataCard.model.editorField, {"name" : field.name});
                $editorField.appendTo($fieldSet);
            });
            $fieldSetMulti.append($fieldSet);
            $templateContainer.append($fieldSetMulti);
        });

        if(_DataCard.debug){
            console.log({
                _event : "TemplateFn._createEditorFieldSetMulti() called",
                settings : settings,
                $templateContainer : $templateContainer,
                dataSrc : dataSrc
            });
        }
        return $templateContainer;
    };

    TemplateFn._getBsColClass = function (itemPerRow) {
        itemPerRow = Fn._isInteger(itemPerRow) && itemPerRow > 1 && itemPerRow < 12 ? itemPerRow : DataCardDefaults.options.columnDisplay;
        itemPerRow = Math.round(12/itemPerRow);
        var
            colClass = ' col-',
            xsClass = colClass+'sm-',
            smClass = colClass+'sm-',
            mdClass = colClass+'md-',
            lgClass = colClass+'lg-',
            xlClass = colClass+'xl-'
        ;
            return xsClass + 12 + smClass + 6 + mdClass + itemPerRow + lgClass + itemPerRow + xlClass + itemPerRow;
    };

    TemplateFn._createCardTemplate = function (dataCard) {
        var
            settings = dataCard.settings(),
            columnDisplay = Fn._getObjByProp(settings, _prop.columnDisplay, DataCardDefaults.options.columnDisplay)
        ;
        console.log({
            settings : settings
        });
        var
            $cardTemplate = $("<div/>")
            .attr(models.card.item.attr)
            .addClass(TemplateFn._getBsColClass(columnDisplay))
        ;
        var
            $cardContainer = $("<div/>")
            .attr(models.card.container.attr)
            .addClass(models.card.container.className)
        ;

        var arrayCardButtons = Fn._getObjByProp(settings, _prop.cardButtons, []);
        if(arrayCardButtons.length > 0){
            var $btnContainer = $('<div/>').attr(models.card.btnContainer.attr);
            var $cardButtons = $('<'+models.dataCardButtonsAttr+'/>');
            $.each(arrayCardButtons, function (index, element) {
                $cardButtons.append(
                    $('<'+models.dataCardBtnAttr+'/>').attr('name', element.className)
                );
            });
            $cardButtons.appendTo($btnContainer);
            $cardContainer.append($btnContainer);
        }

        var arrayFields = dataCard.fields();
        if(arrayFields.length > 0){
            var $fieldContainer = $('<div/>').attr(models.field.fieldContainer.attr);
            $.each(arrayFields, function (index, field) {
                var label = Fn._getObjByProp(field, _prop.fieldItemOptions.label, "");
                var $fieldLabel = $('<div/>').attr(models.field.item.label.attr).text(Fn._ucFirst(label));
                var $valContainer = $('<div/>');
                $valContainer
                    .append($fieldLabel)
                    .append(
                        $('<'+models.dataCardFieldAttr+'/>').attr('name', field.name)
                    )
                ;
                if( !field.visible ){
                    $valContainer.addClass(models.hideClass);
                }
                $fieldContainer.append($valContainer)
            });
            $cardContainer.append($fieldContainer);
        }

        var multiField = Fn._getObjByProp(settings, _prop.multiFields, {});
        var itemSrc = Fn._getObjByProp(multiField, _prop.itemSrc, []);
        if(itemSrc.length > 0){
            var
                arrayMultiFields = Fn._getObjByProp(multiField, _prop.fields, []),
                multiFieldDataSrc = Fn._getObjByProp(multiField, _prop.dataSrc, {}),
                $multiFieldContainer = $('<div/>').attr(models.field.multiFieldContainer.attr)
            ;
            $.each(itemSrc, function (i, item) {
                var
                    itemData = Fn._getObjByProp(item, _prop.data, ""),
                    title = Fn._getObjByProp(item, _prop.title, "")
                ;
                var $panelMulti = $('<fieldset/>').attr(models.field.item.fieldSet.attr).attr('name', itemData);
                var $titleLegend = $('<legend/>').attr(models.field.item.legend.attr).text(Fn._ucFirst(title));
                $panelMulti.append($titleLegend).appendTo($multiFieldContainer);
                var visibleMultiFields = 0;
                $.each(arrayMultiFields, function (index, multiField) {
                    var fieldData = Fn._getObjByProp(multiField, _prop.fieldItemOptions.name, "");
                    var label = Fn._getObjByProp(multiField, _prop.fieldItemOptions.label, "");
                    var $fieldLabel = $('<div/>').attr(models.field.item.label.attr).text(Fn._ucFirst(label));
                    var $valContainer = $('<div/>');
                    if(Fn._isStringNotEmpty(fieldData)){
                        var
                            itemDataSrc = "",
                            fieldUniqueId = multiField._uniqueId
                        ;

                        if( Fn._isStringNotEmpty(itemData) ){
                            itemDataSrc = itemData+".";
                        }

                        var dataEditorField = multiFieldDataSrc + '.' + itemDataSrc + fieldData;
                        var $fieldMultiElement = $('<'+models.dataCardMultiFieldAttr+'/>').attr('name', dataEditorField);
                        $fieldMultiElement.attr(models.dataEditorAttr, itemDataSrc+fieldUniqueId);
                        $valContainer.append($fieldLabel).append($fieldMultiElement);
                        if( !multiField.visible ){
                            $valContainer.addClass(models.hideClass);
                        }else {
                            visibleMultiFields++;
                        }
                        $panelMulti.append($valContainer);
                    }
                });
                $cardContainer.append($multiFieldContainer);

                if(visibleMultiFields < 1 || !item.visible ){
                    $panelMulti.addClass(models.hideClass);
                }
            });
        }


        console.log({
            arrayFields : arrayFields,
            arrayMultiFields : arrayMultiFields,
            settings : settings,
            arrayCardButtons : arrayCardButtons,
            itemSrc : itemSrc
        });

        $cardTemplate.append($cardContainer).appendTo('body');
    };

    var DataCardFn = DataCard.functions = {};

    /**
     * All the listener for the plugin
     */
    DataCardFn.listener = {
        card : {
            btn : function (dataCard, editor) {
                var settings = dataCard.settings();
                var arrayBtn = Fn._getObjByProp(settings, _prop.cardButtons, []);
                $.each(arrayBtn, function (index, element) {

                    var className = Fn._getObjByProp(element, _prop.className, "");
                    if(Fn._isStringNotEmpty(className)){
                        var $btn = $('.'+className, settings[_prop.jquerySelector]);
                        if($btn.length){
                            var title = Fn._getObjByProp(element, _prop.title, "");
                            var action = Fn._getObjByProp(element, _prop.action, null);
                            $btn
                                .unbind('click')
                                .unbind('mouseenter')
                            ;
                            if(Fn._isFunction(action)){
                                $btn.bind('click', function (event) {
                                    $(this).tooltip('hide');
                                    var $card = $(this).closest("."+models.card.item.attr.class);
                                    var dataId = $card.attr(models.dataEditorIdAttr);
                                    var rowData = dataCard.data(dataId);
                                    action(event, dataCard, editor, this, dataId, rowData);
                                });
                            }
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
            }
        },
        control : {
            btn : function (dataCard, editor) {
                var settings = dataCard.settings();
                var arrayBtn = Fn._getObjByProp(settings, _prop.buttons, []);
                $.each(arrayBtn, function (index, element) {
                    var className = Fn._getObjByProp(element, _prop.className, "");
                    if(Fn._isStringNotEmpty(className)){
                        var $btn = $('.'+className, '.'+models.control.controlPanelContainer.attr.class+'.'+models.active);
                        if($btn.length){
                            var title = Fn._getObjByProp(element, _prop.title, "");
                            var action = Fn._getObjByProp(element, _prop.action, null);
                            $btn
                                .unbind('click')
                                .unbind('mouseenter')
                            ;
                            if(Fn._isFunction(action)){
                                $btn.bind('click', function (event) {
                                    action(event, dataCard, editor, this);
                                });
                            }
                            if(Fn._isStringNotEmpty(title)){
                                $btn.bind('mouseenter', function () {
                                    $(this)
                                        .tooltip({
                                            title: title
                                        })
                                        .tooltip('show')
                                    ;
                                });
                            }
                        }
                    }
                });

            },
            generalSearch : function (dataCard) {
                if(_DataCard.debug){
                    console.log({
                        _event : "DataCardFn.listener.generalSearch"
                    });
                }
                $('.'+ models.control.inputSearch.attr.class , '.'+models.control.controlPanelContainer.attr.class).unbind('keyup');

                $('.'+models.control.inputSearch.attr.class , '.'+models.control.controlPanelContainer.attr.class+'.'+models.active)
                    .bind("keyup", function () {
                        DataCardFn.field._fieldsFilter(dataCard);
                    })
                ;

            },
            /**
             * select data length
             */
            selectLengthMenu : function (dataCard) {
                if(_DataCard.debug){
                    console.log({
                        _event : "DataCardFn.listener.selectLengthMenu"
                    });
                }
                $('.'+ models.control.selectLength.attr.class, '.'+ models.control.controlPanelContainer.attr.class).unbind('change');
                $('.'+ models.control.selectLength.attr.class, '.'+ models.control.controlPanelContainer.attr.class+'.'+models.active)
                    .bind('change', function () {
                    var $this = $(this);
                    var selectValue = parseInt($this.val());
                    $('option', $this).removeAttr( models.selectedAttr, false);
                    $('option[value='+selectValue+']', $this).attr(models.selectedAttr, models.selectedAttr);
                    $this.val(selectValue);
                    dataCard.length(selectValue).draw();
                    if(_DataCard.debug) {
                        console.log({
                            selectValue : selectValue
                        });
                    }
                });
            },
            /**
             * select page
             */
            pageSelect : function (dataCard) {
                var $pageBtn = $('.'+models.control.pagination.liBtn.attr.class);
                if(_DataCard.debug){
                    console.log({
                        _event : "DataCardFn.listener.pageSelect",
                        $pageBtn : $pageBtn
                    });
                }
                $pageBtn
                    .unbind("click")
                    .bind('click', function () {
                        var $thisBtn = $(this);
                        if(!$thisBtn.hasClass(models.active)){
                            var pageIndex = $thisBtn.attr(models.dataPageIndexAttr);
                            if(Fn._isNumeric(pageIndex)){
                                dataCard.page(parseInt(pageIndex)).draw();
                            }
                            console.log(pageIndex);
                        }
                    })
                ;
                var $pagePrevious = $("#previous").not('.'+models.disabledClass);
                $pagePrevious
                    .unbind("click")
                    .bind('click', function () {
                        var $pageActive = $('.'+models.control.pagination.liBtn.attr.class+'.'+models.active);
                        var activePage = parseInt($pageActive.attr(models.dataPageIndexAttr));
                        if(_DataCard.debug){
                            console.log({
                                activePage : activePage,
                                $pageActive : $pageActive
                            });
                        }
                        dataCard.page(activePage-1).draw();
                    })
                ;
                var $pageNext = $("#next").not('.'+models.disabledClass);
                $pageNext
                    .unbind("click")
                    .bind('click', function () {
                        var $pageActive = $('.'+models.control.pagination.liBtn.attr.class+'.'+models.active);
                        var activePage = parseInt($pageActive.attr(models.dataPageIndexAttr));
                        console.log({
                            activePage : activePage,
                            $pageActive : $pageActive
                        });
                        dataCard.page(activePage+1).draw();
                    })
                ;

            }
        },
        field : {
            fieldFilter : function (dataCard) {
                $('['+models.control.search.fieldIdAttr+']').unbind('keyup').unbind('change');
                $('['+models.control.search.fieldIdAttr+']', '.'+models.control.controlPanelContainer.attr.class+'.'+models.active).each(function () {
                    var $this = $(this);
                    var tagName = $this.prop("tagName");
                    if(tagName.toLowerCase() === "input"){
                        $this.bind("keyup", function () {
                            DataCardFn.field._fieldsFilter(dataCard);
                        });
                    }else if(tagName.toLowerCase() === "select"){
                        $this.bind("change", function () {
                            var selectedVal = $this.val();
                            $('option', $this).removeAttr(models.selectedAttr);
                            $('option[value="'+selectedVal+'"]', $this).attr(models.selectedAttr, models.selectedAttr);
                            DataCardFn.field._fieldsFilter(dataCard);
                        });
                    }
                });
            },
            fieldSort : function (dataCard) {
                var $fieldFilter = $('['+models.control.sort.fieldIdAttr+']', '.'+models.control.controlPanelContainer.attr.class+'.'+models.active);
                $fieldFilter.each(function (index, element) {
                    var $this = $(element);
                    $this.unbind('click').bind('click', function () {
                        var $_this = $(this);
                        var fieldId = $_this.attr(models.control.sort.fieldIdAttr);
                        var isMultiField = ($_this.attr(models.dataMultiFieldAttr)) === "true";
                        if(Fn._isStringNotEmpty(fieldId)){
                            var asc = true;
                            if( $_this.hasClass(models.control.sort.asc) || $_this.hasClass(models.control.sort.desc) ){
                                asc = $_this.hasClass(models.control.sort.desc);
                            }
                            $fieldFilter.removeClass(models.control.sort.desc).removeClass(models.control.sort.asc);
                            if(asc){
                                $_this.removeClass(models.control.sort.desc).addClass(models.control.sort.asc);
                            }else {
                                $_this.removeClass(models.control.sort.asc).addClass(models.control.sort.desc);
                            }
                            dataCard.sort(fieldId, asc, isMultiField, true).draw();

                        }
                    });
                });
            }
        },


        /**
         * if fixedControl option is true, clone control panel and make sticky
         * @param dataCard
         * @param editor
         */
        fixedControl : function (dataCard, editor) {
            if(_DataCard.debug){
                console.log({
                    _event : "DataCardFn.listener.fixedControl"
                });
            }
            var settings = dataCard.settings();
            if(settings.fixedControl){
                $(window).scroll(function () {
                    DataCardFn.control._fixedControl(dataCard, editor);
                });

            }
        },


        /**
         * enable or disable button (edit, remove, select all, select none
         * @param dataCard
         */
        enableDisableBtn : function (dataCard) {
            if(_DataCard.debug){
                console.log({
                    _event : "DataCardFn.listener.enableDisableBtn"
                });
            }
            var settings = dataCard.settings();
            if( Fn._isStringNotEmpty(settings.controlPanel) ){
                var $editBtn = $(classSelector(models.control.btn.edit.attr.class), settings.controlPanel);
                var $removeBtn = $(classSelector(models.control.btn.remove.attr.class), settings.controlPanel);

                var $selectNoneBtn = $(classSelector(models.control.btn.selectNone.attr.class));

                var $selectedCards = DataCardFn.jqElement._getSelectedCards(settings[_prop.jquerySelector]);
                if($selectedCards.length > 0 ){
                    $editBtn.prop(models.disabledAttr, false).removeClass(models.disabledClass);
                    $removeBtn.prop(models.disabledAttr, false).removeClass(models.disabledClass);
                    $selectNoneBtn.prop(models.disabledAttr, false).removeClass(models.disabledClass);
                }else {
                    $editBtn.prop(models.disabledAttr, true).addClass(models.disabledClass);
                    $removeBtn.prop(models.disabledAttr, true).addClass(models.disabledClass);
                    $selectNoneBtn.prop(models.disabledAttr, true).addClass(models.disabledClass);
                }
            }
        },
        windowResise : function (dataCard, editor) {
            $(window).resize(function () {
                setTimeout(function () {
                    DataCardFn.control._resizeFixedControl(dataCard, editor);
                }, 100);
            });
        }
    };

    /**
     * initialize all the listener
     * @param dataCard
     * @param editor
     */
    DataCardFn.initListener = function (dataCard, editor) {
        var listeners = DataCardFn.listener;
        if(arguments.length > 2){
            listeners = arguments[2];
        }
        $.each(listeners, function (index, element) {
            if(Fn._isFunction(element)){
                element(dataCard, editor);
            }
            else if(Fn._isObject(element)){
                DataCardFn.initListener(dataCard, editor, element);
            }
        });
    };

        /**
     * DataCard functions card
     */
        DataCardFn.jqElement = {
            /**
             * get all the selected card from the panel
             * @param jquerySelector
             * @returns {*|HTMLElement}
             * @private
             */
            _getSelectedCards : function (jquerySelector) {
                return $('.' + models.card.item.attr.class + '.' + models.selectedClass, jquerySelector);
            }
        };

        /**
         * DataCard functions card
         */
        DataCardFn.card = {
            debug : false,
            _closeAllTooltip : function () {
                $('[data-toggle="tooltip"]').tooltip('hide');
            },
            _getUniqueId : function (length) {
                if(!Fn._isInteger(length) || parseInt(length) < 8){
                    length = 8;
                }
                var result           = '';
                var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                var charactersLength = characters.length;
                for ( var i = 0; i < length; i++ ) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            },
            /**
             * merge settings with default options
             * @param settings
             * @param dataCard
             * @private
             */
            _mergeSetting : function (settings, dataCard) {
                var
                    mergedSettings =  $.extend(true, {}, DataCardDefaults.options, settings),
                    arraySettingsFields = mergedSettings[_prop.fields] ,
                    ordering = mergedSettings[_prop.ordering],
                    dataSrc = Fn._getObjByProp(mergedSettings, _prop.dataSrc, "")
                ;
                mergedSettings[_prop.fields]    = DataCardFn.card._mergeField(mergedSettings, arraySettingsFields, dataCard);
                mergedSettings[_prop.ordering]    = DataCardFn.card._mergeOrdering(mergedSettings, ordering);
                if( Fn._isStringNotEmpty(mergedSettings.rowReorder) ){
                    var rowReorderSrc = mergedSettings.rowReorder;
                    if( dataSrc !== "" ){
                        rowReorderSrc = rowReorderSrc.includes(dataSrc) ? rowReorderSrc : dataSrc + "." + rowReorderSrc;
                    }
                    mergedSettings.rowReorder = rowReorderSrc;
                }
                mergedSettings[_prop.multiFields] = DataCardFn.card._mergeMultiField(mergedSettings, dataCard);
                mergedSettings[_prop.buttons]   = DataCardFn.control._mergeButton(mergedSettings);
                mergedSettings[_prop.cardButtons]   = DataCardFn.card._mergeCardButtons(mergedSettings);
                return mergedSettings;
            },
            _mergeCardButtons : function (mergedSettings) {
                var arrayButtons = Fn._getObjByProp(mergedSettings, _prop.cardButtons, []);

                DataCard.button._arrayCardButtons.forEach(function (item) {
                    if(!arrayButtons.includes(item)){
                        arrayButtons.unshift(item);
                    }

                });
                var returnButtons = [];
                $.each(arrayButtons, function (index, btnElement) {
                    if(Fn._isSameType(btnElement, "")){
                        var btn = DataCardFn.control._getBtn(mergedSettings, btnElement);
                        if(Fn._isObject(btn)){
                            returnButtons.push( btn );
                        }
                    }else if(Fn._isSameType(btnElement, {})){
                        returnButtons.push( $.extend({}, DataCardDefaults.buttons.options, btnElement) );
                    }
                });
                return returnButtons;
            },
            /**
             * merge the multiField setting with default options
             * @param mergedSettings
             * @param arrayFields
             * @param dataCard
             * @returns {*}
             * @private
             */
            _mergeField : function (mergedSettings, arrayFields, dataCard) {
                var
                    returnFields = [],
                    dataSrc = Fn._getObjByProp(mergedSettings, _prop.dataSrc, "")
                ;

                $.each(arrayFields, function (index, field) {
                    field = $.extend({}, DataCardDefaults.field.options, field);
                    if( ! Fn._isFunction(field.render)){
                        field.render = DataCardFn.field._getFieldRender(field.type, field.options, dataCard, field);
                    }
                    if(! _DataCard._sortableType.includes(field.type)){
                        field.sort = false;
                    }
                    if(! _DataCard._searchableType.includes(field.type)){
                        field.search = false;
                    }
                    field.indexes = [];
                    if(Fn._isStringNotEmpty(field.name)){
                        field.indexes = field.name.split('.');
                        if(dataSrc !== "" && !field.name.includes(dataSrc) && field.indexes.length === 1){
                            field.name = dataSrc + "."+field.name;
                            field.indexes = field.name.split('.');
                        }
                    }
                    var uniqueId = DataCardFn.card._getUniqueId();
                    while (mergedSettings._ids.includes(uniqueId)){
                        uniqueId = DataCardFn.card._getUniqueId();
                    }
                    mergedSettings._ids.push(uniqueId);
                    field._uniqueId = uniqueId;
                    returnFields[index] = field;
                });
                return returnFields;
            },
            /**
             * merge the multiField setting with default options
             * @param mergedSettings
             * @param ordering
             * @returns {*}
             * @private
             */
            _mergeOrdering : function (mergedSettings, ordering) {
                var returnOrdering = [];
                $.each(ordering, function (index, order) {
                    order = $.extend({}, DataCardDefaults.ordering.options, order);
                    returnOrdering[index] = order;
                });
                return returnOrdering;
            },
            /**
             * merge the multiField setting with default options
             * @param mergedSettings
             * @param dataCard
             * @returns {*}
             * @private
             */
            _mergeMultiField : function (mergedSettings, dataCard) {

                var multiField = Fn._getObjByProp(mergedSettings, _prop.multiFields, {});
                if(multiField.hasOwnProperty(_prop.itemSrc)){
                    var itemSrc = multiField[_prop.itemSrc];
                    var fieldsMulti = Fn._getObjByProp(multiField, _prop.fields, []);
                    if(typeof fieldsMulti === typeof []){
                        var arrayItemSrc = [];
                        var isSearchable = false;
                        var isSortable = false;
                        var isVisible = false;
                        $.each(itemSrc, function (index, item){

                            item =  $.extend(true, {}, DataCardDefaults.itemSrc.options, item);
                            if(item.search){
                                isSearchable = true;
                            }
                            if(item.sort){
                                isSortable = true;
                            }
                            if(item.visible){
                                isVisible = true;
                            }
                            if(Fn._isStringNotEmpty(item.data)){
                                arrayItemSrc.push(item);
                            }
                        });
                        multiField[_prop.itemSrc] = arrayItemSrc;
                        if(Fn._isSameType(fieldsMulti, [])){
                            var arrayFieldsMulti = [];
                            $.each(fieldsMulti, function (index, fieldMulti){
                                fieldMulti.indexes = [];
                                if(Fn._isStringNotEmpty(fieldMulti.name)){
                                    fieldMulti =  $.extend(true, {}, DataCardDefaults.field.options, fieldMulti);
                                    fieldMulti.render =     DataCardFn.field._getFieldRender(fieldMulti.type, fieldMulti.options, dataCard, fieldMulti);
                                    fieldMulti.indexes =    fieldMulti.name.split('.');
                                }
                                if(! _DataCard._sortableType.includes(fieldMulti.type)){
                                    fieldMulti.sort = false;
                                }
                                if(! _DataCard._searchableType.includes(fieldMulti.type)){
                                    fieldMulti.search = false;
                                }
                                fieldMulti.sort = (fieldMulti.sort && isSortable);
                                fieldMulti.search = (fieldMulti.search && isSearchable);
                                fieldMulti.visible = (fieldMulti.visible && isVisible);
                                fieldMulti._isMultiField = true;
                                var uniqueId = DataCardFn.card._getUniqueId();
                                while (mergedSettings._ids.includes(uniqueId)){
                                    uniqueId = DataCardFn.card._getUniqueId();
                                }
                                mergedSettings._ids.push(uniqueId);
                                fieldMulti._uniqueId = uniqueId;
                                arrayFieldsMulti.push(fieldMulti);
                            });
                            multiField.fields = arrayFieldsMulti;
                        }
                    }
                }else {
                    multiField[_prop.itemSrc] = [];
                    multiField[_prop.fields] = [];
                }
                multiField = $.extend({}, DataCardDefaults.multiFields.options, multiField);

                return multiField;
            },
            /**
             * process the response from the ajax data
             * @param arrayData
             * @param dataCard
             * @private
             */
            _displayCards : function (dataCard, arrayData) {
                $('.'+models.card.container.attr.class).tooltip( "hide" );
                var
                    settings = dataCard.settings(),
                    arrayFields = dataCard.fields(),
                    multiField = Fn._getObjByProp(settings, _prop.multiFields, []),
                    multiFieldDataSrc = Fn._getObjByProp(multiField, _prop.dataSrc, ""),
                    arrayFieldsMulti = dataCard.multiFields(),
                    itemSrc = Fn._getObjByProp(multiField, _prop.itemSrc, []),
                    $rowContainer = $('.'+models.card.rowCardContainer.attr.class, settings[_prop.jquerySelector]),
                    $template = dataCard.template()
                ;
                if(DataCardFn.card.debug){
                    console.log({
                        _event : "DataCardFn._displayCards(arrayData, dataCard) called",
                        dataCard : dataCard,
                        arrayData : arrayData
                    });
                }
                $rowContainer.empty();
                if($rowContainer.length){
                    $.each(arrayData, function (index, dataRow) {
                        $rowContainer.append(
                            DataCardFn.card._updateCardData(
                                settings, dataRow, $template, arrayFields, multiFieldDataSrc, arrayFieldsMulti, itemSrc, dataCard
                            )
                        );

                    });
                }

                DataCardFn.pagination._updateSelectedItemInfo(dataCard);

                var
                    page = dataCard.page(),
                    dataLength = dataCard.data().length,
                    length = dataCard.length()
                ;
                if(_DataCard.debug){
                    console.log({
                        page : page,
                        dataLength : dataLength,
                        length : length
                    });
                }
                if(DataCardFn.editor._isRowReorderValid(settings)){
                    DataCardFn.editor.sortable(dataCard, '.' + models.card.rowCardContainer.attr.class);
                }
            },
            _createCardTemplate : function (dataCard) {
                var settings = dataCard.settings(),
                    columnDisplay = Fn._getObjByProp(settings, _prop.columnDisplay, DataCardDefaults.options.columnDisplay)
                ;
                var cardTemplateSelector = Fn._getObjByProp(settings, _prop.template, "");
                var cardButtons = Fn._getObjByProp(settings, _prop.cardButtons, []);
                var $cardTemplate = null;
                if(Fn._isStringNotEmpty(cardTemplateSelector)){
                    $cardTemplate = $(cardTemplateSelector);
                }
                var arrayFields = dataCard.fields();
                var $cardContainer = null;

                if($cardTemplate === null){
                    $cardTemplate = $("<div/>")
                        .attr(models.card.item.attr)
                        .addClass(TemplateFn._getBsColClass(columnDisplay))
                    ;
                    $cardContainer = $("<div/>").attr(models.card.container.attr).addClass('elevation p-10 m-b-10 m-t-10');
                    if(cardButtons.length > 0){
                        var $btnContainer = $('<div/>').attr(models.card.btnContainer.attr);
                        $.each(cardButtons, function (index, element) {
                            var $btn = $('<span/>')
                                .attr(models.control.btn.item.attr )
                                .addClass(element.className)
                                .addClass(models.btnXsClass)
                                .append($(element.icon))
                            ;
                            $btnContainer.append($btn);
                        });

                        $cardContainer.prepend($btnContainer);
                    }
                    var
                        $fieldContainer = DataCardFn.card._createFieldTemplate(arrayFields),
                        $multiFieldContainer = DataCardFn.card._createMultiFieldTemplate(dataCard)
                    ;
                    $cardContainer.append( $fieldContainer ).append( $multiFieldContainer ).appendTo($cardTemplate);
                }

                if(DataCardFn.card.debug) {
                    console.log({
                        arrayFields : arrayFields,
                        $cardTemplate : $cardTemplate
                    });
                }
                return $cardTemplate;
            },
            _createFieldTemplate : function (arrayFields) {

                if(Fn._isSameType(arrayFields, []) && arrayFields.length > 0){
                    var $fieldContainer = $('<div/>').attr(models.field.fieldContainer.attr);
                    $.each(arrayFields, function (index, field) {
                        var
                            fieldLabel = field.label,
                            fieldData = field.name,
                            fieldUniqueId = field._uniqueId,
                            $fieldElement = $('<div/>').attr(models.field.item.attr).attr(models.dataEditorAttr, fieldUniqueId)
                        ;
                        if( !field.visible ){
                            $fieldElement.addClass(models.hideClass);
                        }
                        var $fieldLabel = $('<div/>').attr(models.field.item.label.attr).text(Fn._ucFirst(fieldLabel));
                        var $fieldDisplay = $('<div/>').attr(models.field.item.display.attr).html("&nbsp;");
                        var $fieldValue = $('<div/>').attr(models.field.item.value.attr).attr(models.dataEditorFieldAttr, fieldData);
                        $fieldElement
                            .append($fieldLabel)
                            .append($fieldDisplay)
                            .append($fieldValue)
                            .appendTo($fieldContainer)
                        ;



                    });
                    return $fieldContainer;

                }
                return null;
            },
            _createMultiFieldTemplate : function (dataCard) {
                var settings = dataCard.settings(),
                    multiField = multiFieldDataSrc = Fn._getObjByProp(settings, _prop.multiFields, {}),
                    multiFieldDataSrc = Fn._getObjByProp(multiField, _prop.dataSrc, {}),
                    itemSrc = Fn._getObjByProp(multiField, _prop.itemSrc, []),
                    arrayFieldsMulti = dataCard.multiFields()
                ;

                if(
                    Fn._isSameType(arrayFieldsMulti, []) && arrayFieldsMulti.length > 0 &&
                    Fn._isSameType(itemSrc, []) && itemSrc.length > 0 &&
                    Fn._isStringNotEmpty(multiFieldDataSrc)
                ){
                    var $multiFieldContainer = $('<div/>').attr(models.field.multiFieldContainer.attr);
                    $.each(itemSrc, function (index, src) {
                        var
                            itemData = Fn._getObjByProp(src, _prop.data, ""),
                            title = Fn._getObjByProp(src, _prop.title, "")
                        ;
                        if(Fn._isStringNotEmpty(itemData)){
                            var $panelMulti = $('<fieldset/>').attr(models.field.item.fieldSet.attr);
                            var $titleLegend = $('<legend/>').attr(models.field.item.legend.attr).text(Fn._ucFirst(title));
                            var visibleMultiFields = 0;
                            $panelMulti.append($titleLegend).appendTo($multiFieldContainer);
                            $.each(arrayFieldsMulti, function (index, fieldMulti) {
                                var
                                    fieldLabel = Fn._getObjByProp(fieldMulti, _prop.fieldItemOptions.label, ""),
                                    fieldData = Fn._getObjByProp(fieldMulti, _prop.fieldItemOptions.name, ""),
                                    $fieldMultiElement = $('<div/>').attr(models.field.item.multi.attr)
                                ;
                                if(Fn._isStringNotEmpty(fieldData)){
                                    var
                                        itemDataSrc = "",
                                        fieldUniqueId = fieldMulti._uniqueId
                                    ;
                                    if( Fn._isStringNotEmpty(itemData) ){
                                        itemDataSrc = itemData+".";
                                    }

                                    var dataEditorField = multiFieldDataSrc + '.' + itemDataSrc + fieldData;
                                    $fieldMultiElement.attr(models.dataEditorAttr, itemDataSrc+fieldUniqueId);
                                    var $fieldLabel = $('<div/>').attr(models.field.item.label.attr).text(Fn._ucFirst(fieldLabel));
                                    var $fieldDisplay = $('<div/>').attr(models.field.item.display.attr).html("&nbsp;");
                                    var $fieldValue = $('<div/>').attr(models.field.item.value.attr).attr(models.dataEditorFieldAttr, dataEditorField);
                                    $fieldMultiElement
                                        .append($fieldLabel)
                                        .append($fieldDisplay)
                                        .append($fieldValue)
                                    ;
                                    $panelMulti.append($fieldMultiElement);
                                    if( !fieldMulti.visible ){
                                        $fieldMultiElement.addClass(models.hideClass);
                                    }else {
                                        visibleMultiFields++;
                                    }
                                }

                            });
                            if(visibleMultiFields < 1 || !src.visible ){
                                $panelMulti.addClass(models.hideClass);
                            }
                        }

                    });
                    return $multiFieldContainer;
                }
                return null;
            },
            _updateCardData : function (settings, dataRow, $template, arrayFields, multiFieldDataSrc, arrayFieldsMulti, itemSrc, dataCard) {
                var
                    $newTemplate = $template.clone(),
                    id = Object.keys(dataRow)[0],
                    titleSrc = Fn._getObjByProp(settings, _prop.titleSrc, ""),
                    title = ""
                ;
                dataRow = dataRow[id];
                if(Fn._isStringNotEmpty(titleSrc)){
                    title = Fn._getObjByArrayProp(dataRow, titleSrc.split('.'), "");
                }
                $newTemplate.attr(models.dataEditorIdAttr, id).attr(models.dataTitleSrcAttr, title);
                $('.'+models.control.btn.edit.attr.class, $newTemplate).attr(models.dataIdAttr, id);
                $('.'+models.control.btn.remove.attr.class, $newTemplate).attr(models.dataIdAttr, id);
                $newTemplate = DataCardFn.card._updateFieldData(settings, dataRow, $newTemplate, arrayFields, dataCard);
                $newTemplate = DataCardFn.card._updateFieldMultiData(settings, dataRow, $newTemplate, multiFieldDataSrc, arrayFieldsMulti, itemSrc, dataCard);


                return $newTemplate;
            },
            _updateFieldData : function (settings, dataRow, $newTemplate, arrayFields, dataCard) {
                if(DataCardFn.field.debug) {
                    console.log({
                        _event : "_updateFieldData",
                        settings: settings,
                        dataRow: dataRow,
                        $newTemplate: $newTemplate,
                        arrayFields: arrayFields,
                        dataCard : dataCard
                    });
                }
                $.each(arrayFields, function (index, field) {
                    var
                        data = dataRow,
                        fieldUniqueId = field._uniqueId,
                        $field = $("["+models.dataEditorAttr+"='"+fieldUniqueId+"']", $newTemplate),
                        $fieldValue = $('.'+models.field.item.value.attr.class, $field),
                        $fieldDisplay
                    ;

                    data = Fn._getObjByArrayProp(data, field.indexes, "");
                    data = data.trim();
                    if(Fn._isStringNotEmpty(data)){
                        $fieldValue.text(data);
                    }
                    if(field.visible){
                        $fieldDisplay = $('.'+models.field.item.display.attr.class, $field);
                        var renderData = data;
                        if(Fn._isFunction(field.render)){
                            renderData = field.render(renderData, field.type, dataRow, settings, dataCard);
                        }
                        if( !Fn._isSameType(renderData, "") || Fn._isStringNotEmpty(renderData)){
                            $fieldDisplay.html(renderData);
                        }
                    }
                    if(DataCardFn.field.debug) {
                        console.log({
                            field: field,
                            renderData: renderData,
                            $field: $field,
                            $fieldValue: $fieldValue,
                            $fieldDisplay: $fieldDisplay,
                            displayClass: models.field.item.display.attr.class
                        });
                    }

                });
                return $newTemplate;
            },
            _updateFieldMultiData : function (settings, dataRow, $newTemplate, multiFieldDataSrc, arrayFieldsMulti, itemSrc, dataCard) {
                if(DataCardFn.field.debug) {
                    console.log({
                        _event : "_updateFieldData",
                        settings: settings,
                        dataRow: dataRow,
                        multiFieldDataSrc: multiFieldDataSrc,
                        arrayFieldsMulti: arrayFieldsMulti,
                        itemSrc : itemSrc,
                        dataCard : dataCard
                    });
                }

                if(
                    Fn._isSameType(arrayFieldsMulti, []) && arrayFieldsMulti.length > 0 &&
                    Fn._isSameType(itemSrc, []) && itemSrc.length > 0 &&
                    Fn._isStringNotEmpty(multiFieldDataSrc)
                ){
                    var dataMulti = Fn._getObjByProp(dataRow, multiFieldDataSrc, {});
                    $.each(itemSrc, function (index, src) {
                        var itemSrcData = Fn._getObjByProp(src, _prop.data, "");
                        if(Fn._isStringNotEmpty(itemSrcData)){
                            var dataMultiItem = Fn._getObjByProp(dataMulti, itemSrcData, {});
                            $.each(arrayFieldsMulti, function (index, fieldMulti) {
                                var
                                    itemDataSrc = "",
                                    fieldUniqueId = fieldMulti._uniqueId,
                                    data = Fn._getObjByArrayProp(dataMultiItem, fieldMulti.indexes, "")
                                ;
                                if( Fn._isStringNotEmpty(itemSrcData) ){
                                    itemDataSrc = itemSrcData+".";
                                }
                                var $fieldElement = $("["+models.dataEditorAttr+"='"+itemDataSrc+fieldUniqueId+"']", $newTemplate);
                                data = data.trim();
                                if(Fn._isStringNotEmpty(data)){
                                    var $fieldValue = $('.'+models.field.item.value.attr.class, $fieldElement);
                                    $fieldValue.text(data);
                                }

                                if(fieldMulti.visible){
                                    var $fieldDisplay = $('.'+models.field.item.display.attr.class, $fieldElement);
                                    var renderData = data;
                                    if(Fn._isFunction(fieldMulti.render)){
                                        renderData = fieldMulti.render(renderData, fieldMulti.type, dataRow, settings);
                                    }

                                    if( !Fn._isSameType(renderData, "") || Fn._isStringNotEmpty(renderData)){
                                        $fieldDisplay.html(renderData);
                                    }
                                }

                            });
                        }

                    });

                }

                return $newTemplate;
            },
            _createRowContainer : function (dataCard) {
                var settings = dataCard.settings();
                var $rowContainer = $('<div/>').attr(models.card.rowCardContainer.attr).addClass("row");
                $rowContainer.appendTo(settings[_prop.jquerySelector]);
            },
            _getCardById : function (id) {
                var $card = null;
                if(Fn._isNotUndefined(id)){
                    $card = $('['+models.dataEditorIdAttr+'='+id+']');
                }
                return $card;
            },
            _animateCard : function ($card) {
                if($card instanceof jQuery){
                    var $item = $(".dc-card-container ", $card);
                    $item.addClass(models.highlightClass);
                    setTimeout(function () {
                        $item.removeClass(models.highlightClass);
                    }, 300);
                }
            }
        };

        /**
         * DataCard functions control
         */
        DataCardFn.control = {
            /**
             * merge buttons setting with default options
             * @param mergedSettings
             * @returns {*}
             * @private
             */
            _mergeButton : function (mergedSettings) {
                var arrayButtons = Fn._getObjByProp(mergedSettings, _prop.buttons, []);
                DataCard.button._arrayButtons.forEach(function (item) {
                    if(!arrayButtons.includes(item)){
                        arrayButtons.unshift(item);
                    }
                });
                var returnButtons = [];
                $.each(arrayButtons, function (index, btnElement) {
                    if(Fn._isSameType(btnElement, "")){
                        var btn = DataCardFn.control._getBtn(mergedSettings, btnElement);
                        if(Fn._isObject(btn)){
                            returnButtons.push( btn );
                        }
                    }else if(Fn._isSameType(btnElement, {})){
                        returnButtons.push( $.extend({}, DataCardDefaults.buttons.options, btnElement) );
                    }
                });
                return returnButtons;
            },
            _getBtn : function (settings, btnName) {
                var i18n = _Translation._get(settings.language);
                var btn = $.extend({}, DataCardDefaults.buttons.options);
                switch (btnName){
                    case _DataCard.button.create :
                        if(settings.create){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.control.create);
                            btn[_prop.title] = i18n.create.button;
                            return btn;
                        }
                        break;
                    case _DataCard.button.edit :
                        if(settings.select && settings.edit){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.control.edit);
                            btn[_prop.title] = i18n.edit.button;
                            return btn;
                        }
                        break;
                    case _DataCard.button.remove :
                        if(settings.select && settings.remove){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.control.remove);
                            btn[_prop.title] = i18n.remove.button;
                            return btn;
                        }
                        break;
                    case _DataCard.button.selectNone :
                        if(settings.select && (settings.edit || settings.remove)){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.control.selectNone);
                            btn[_prop.title] = i18n._custom.button.selectNone;
                            return btn;
                        }
                        break;
                    case _DataCard.button.selectAll :
                        if(settings.select && (settings.edit || settings.remove)){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.control.selectAll);
                            btn[_prop.title] = i18n._custom.button.selectAll;
                            return btn;
                        }
                        break;
                    case _DataCard.button.edit1 :
                        if(settings.edit){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.card.edit1);
                            btn[_prop.title] = i18n.edit.button;
                            return btn;
                        }
                        break;
                    case _DataCard.button.remove1 :
                        if(settings.remove){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.card.remove1);
                            btn[_prop.title] = i18n.remove.button;
                            return btn;
                        }
                        break;
                    case _DataCard.button.select1 :
                        if(settings.select && (settings.edit || settings.remove)){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.card.select1);
                            btn[_prop.title] = i18n._custom.tooltip.clickToSelect;
                            return btn;
                        }
                        break;
                    case _DataCard.button.reOrder :
                        if(DataCardFn.editor._isRowReorderValid(settings)){
                            btn = $.extend({}, DataCardDefaults.buttons.options, DataCard.button.card.reOrder);
                            btn[_prop.title] = i18n.reorder.button;
                            return btn;
                        }
                        break;
                }
                return null;
            },
            _getDefBtn : function (settings, btn) {
                return $('<button/>')
                    .attr(models.control.btn.item.attr)
                    .addClass(btn.className)
                    .append($(btn.icon))
                ;
            },
            _fixedControl : function (dataCard, editor) {
                var settings = dataCard.settings();
                if(settings.fixedControl){
                    var winOffSetY = window.pageYOffset;
                    var $controlPanel = $("#"+models.control.controlPanelContainer.attr.class);
                    if($controlPanel.length){
                        var fixedControlOffSet = Fn._getObjByArrayProp(dataCard.settings(), [_prop.fixedControl, _prop.offSet], 0);
                        var elemTop = $controlPanel.offset().top;
                        if(winOffSetY > elemTop-fixedControlOffSet){
                            DataCardFn.control._displayClone(dataCard, editor);
                        }else {
                            DataCardFn.control._hideClone(dataCard, editor);
                        }
                    }

                    var $rowContainer = $('.'+models.card.rowCardContainer.attr.class);
                    if($rowContainer.length){
                        if(winOffSetY > $rowContainer.height()){
                            DataCardFn.control._hideClone(dataCard, editor);
                        }
                    }
                }
            },
            _resizeFixedControl : function (dataCard) {
                var $controlPanel = $("#"+models.control.controlPanelContainer.attr.class);
                if($controlPanel.length){
                    var $clone = $('.'+models.control.clone.attr.class);
                    if($clone.length){
                        var fixedControlOffSet = Fn._getObjByArrayProp(dataCard.settings(), [_prop.fixedControl, _prop.offSet], 0);
                        var elemLeft = $controlPanel.offset().left;
                        $clone
                            .width($controlPanel.width())
                            .height($controlPanel.height())
                            .css({top : fixedControlOffSet, left : elemLeft})
                        ;
                    }
                }
            },
            _displayClone : function (dataCard, editor) {

                if(_DataCard.debug){
                    console.log({
                        _event : "DataCardFn.control._displayClone"
                    });
                }
                var $controlPanel = $("#"+models.control.controlPanelContainer.attr.class);
                if($controlPanel.length){
                    var settings = dataCard.settings();
                    var $clone = $('.'+models.control.clone.attr.class);
                    if(!$clone.length){
                        var fixedControlOffSet = Fn._getObjByArrayProp(settings, [_prop.fixedControl, _prop.offSet], 0);
                        var elemLeft = $controlPanel.offset().left;
                        $clone = $controlPanel.clone(true, true, true);
                        $clone
                            .addClass(models.control.clone.attr.class)
                            .addClass(models.active)
                            .addClass("sticky bg-light elevation ")
                            .removeAttr('id')
                            .css({top : fixedControlOffSet, left : elemLeft})
                            .width($controlPanel.outerWidth())
                            .height($controlPanel.outerHeight())
                            .appendTo("body")
                        ;

                        var focusIndex = null;
                        var $focus = $('.form-control', $controlPanel);
                        var tmpVal = null;
                        if($focus.length){
                            $focus.each(function (index, element) {
                                var $this = $(element);
                                if($this.is(':focus')){
                                    focusIndex = index;
                                    tmpVal = $this.val();
                                }
                            });
                        }
                        $controlPanel.removeClass(models.active);



                        if(Fn._isSameType(focusIndex, 1)){
                            var $focus2 = $('.form-control', $clone);
                            $focus2.each(function (index, element) {
                                if(index === focusIndex){
                                    var $this = $(element);
                                    $this.val("").focus().val(tmpVal);
                                }
                            });
                        }
                    }
                }


                DataCardFn.initListener(dataCard, editor, DataCardFn.listener.field);
                DataCardFn.initListener(dataCard, editor, DataCardFn.listener.control);


            },
            _hideClone : function (dataCard, editor) {

                var $controlPanel = $("#"+models.control.controlPanelContainer.attr.class);

                var $clone = $('.'+models.control.clone.attr.class);
                if($clone.length && $controlPanel.length){
                    var $replace = $clone.clone(true, true, true);
                    $replace
                        .removeClass(models.control.clone.attr.class)
                        .addClass(models.control.controlPanelContainer.attr.class)
                        .removeClass("sticky bg-light elevation")
                        .removeAttr("style")
                    ;
                    $controlPanel.replaceWith($replace);
                    $replace.attr('id', models.control.controlPanelContainer.attr.class);
                    var focusIndex = null;
                    var $focus = $('.form-control', $clone);
                    var tmpVal = null;
                    if($focus.length){
                        $focus.each(function (index, element) {
                            var $this = $(element);
                            if($this.is(':focus')){
                                focusIndex = index;
                                tmpVal = $this.val();
                            }
                        });
                    }

                    $clone.detach();

                    DataCardFn.initListener(dataCard, editor, DataCardFn.listener.field);
                    DataCardFn.initListener(dataCard, editor, DataCardFn.listener.control);

                    if(Fn._isSameType(focusIndex, 1)){
                        var $focus2 = $('.form-control', $replace);
                        $focus2.each(function (index, element) {
                            if(index === focusIndex){
                                var $this = $(element);
                                $this.val("");
                                $this.focus();
                                $this.val(tmpVal);
                            }
                        });
                    }
                }
            },
            _createControlPanel : function (dataCard) {
                if(dataCard !== null){
                    var settings = dataCard.settings();
                    if( Fn._isStringNotEmpty(settings.controlPanel) ){
                        var $controlPanel = $(settings.controlPanel);
                        if(!$controlPanel.hasClass(models.control.controlPanelContainer.attr.class)){
                            $controlPanel.addClass(models.control.controlPanelContainer.attr.class);
                        }
                        $controlPanel.attr('id', models.control.controlPanelContainer.attr.class).addClass(models.active);
                        var $btnRow = DataCardFn.control._createBtnRow(dataCard);
                        var $filterRow = DataCardFn.control._createFilterRow(dataCard);
                        var $filterSortPanel = DataCardFn.control._createFilterSort(dataCard);
                        $controlPanel
                            .append($btnRow)
                            .append($filterRow)
                            .append($filterSortPanel)
                        ;
                    }
                }
            },
            _createBtnRow : function (dataCard) {
                var settings = dataCard.settings();
                var $btnPanel = $("<div/>")
                    .attr(models.control.btnPanel.attr)
                    .addClass(models.control.btn.btnGroup.attr.class)
                    .addClass("col-lg-6 col-md-12")
                ;
                var arrayBtn = Fn._getObjByProp(settings, _prop.buttons, []);
                $.each(arrayBtn, function (index, btn) {
                    if( !$.isEmptyObject(btn)){
                        $btnPanel.append(DataCardFn.control._getDefBtn(settings, btn));
                    }
                });

                return $("<div/>").addClass("row").append($btnPanel);

            },
            _createFilterRow : function (dataCard) {
                var $lengthPanel = DataCardFn.control._createLengthMenu(dataCard);
                var $generalSearchPanel = DataCardFn.control._createGeneralSearch(dataCard);

                return $("<div/>").addClass("row m-t-10")
                    .append($lengthPanel)
                    .append($generalSearchPanel)
                ;
            },
            _createGeneralSearch : function (dataCard) {
                var settings = dataCard.settings();
                var i18n = dataCard.i18n;
                var $searchPanel = $("<div/>")
                    .addClass(models.control.filterClass)
                    .addClass("col-lg-6 col-md-12")
                ;
                var $searchFilter = null;
                if(settings.search){
                    $searchFilter = $ ('<div/>')
                        .css({textAlign : "right"})
                    ;
                    var $input = $('<input/>').attr(models.control.inputSearch.attr)
                        .addClass('form-control form-control-sm');
                    var $label = $('<label/>').text(i18n.sSearch).append($input);
                    $searchFilter.append($label);
                }
                return $searchPanel.append($searchFilter);
            },
            _createFilterSort : function (dataCard) {
                var $filterSortContainer = $('<div/>')
                    .addClass("col-xs-12 table-responsive");
                $filterSortContainer = DataCardFn.control._createSortFilterField($filterSortContainer, dataCard);
                return $filterSortContainer;
            },
            _createSortFilterField : function ($filterSortContainer, dataCard) {
                var settings = dataCard.settings();
                var isSortable = !DataCardFn.editor._isRowReorderValid(settings);
                if(settings.search || settings.sort){
                    var arrayField = [];
                    dataCard.fields().forEach(function (element) {
                        if( (element.search || ( element.sort && isSortable ) ) && element.visible) {
                            arrayField.push(element);
                        }
                    });
                    dataCard.multiFields().forEach(function (element) {
                        if( (element.search || ( element.sort && isSortable ) ) && element.visible) {
                            arrayField.push(element);
                        }
                    });

                    if(arrayField.length > 0){
                        var $trSort = $('<tr/>').attr("role", "row");
                        var $trFilter = $('<tr/>').attr("role", "row");
                        arrayField.forEach(function (element) {
                            if((element.search || element.sort) && element.visible ) {
                                var $thSort = $('<th/>');
                                var $thFilter = $('<th/>');
                                var options = element.options;
                                $thSort.text(element.label);
                                if(element.search){
                                    var $search = null;
                                    if (Fn._isNotUndefined(options) && ! $.isEmptyObject(options)) {
                                        $search = DataCardFn.control._drawSelectFilter(dataCard, dataCard.i18n["menuText"]['all'], options);
                                    } else {
                                        $search = DataCardFn.control._drawInputFilter(dataCard);
                                    }
                                    $search
                                        .attr(models.dataMultiFieldAttr, element._isMultiField )
                                        .attr(models.control.search.fieldNameAttr, element.name )
                                        .attr(models.control.search.fieldIdAttr, element._uniqueId)
                                        .appendTo($thFilter)
                                    ;
                                }
                                if(element.sort && isSortable && element.visible){
                                    $thSort
                                        .addClass(models.control.sort.class)
                                        .attr(models.dataMultiFieldAttr, element._isMultiField )
                                        .attr(models.control.sort.fieldNameAttr, element.name)
                                        .attr(models.control.sort.fieldIdAttr, element._uniqueId)
                                    ;
                                }
                                $trSort.append($thSort);
                                $trFilter.append($thFilter);
                            }
                        });
                        var $tHead = $("<thead/>")
                            .append($trSort)
                            .append($trFilter)
                        ;
                        var $table = $("<table/>").addClass('table table-bordered');
                        $table.append($tHead);
                        $filterSortContainer.append($table);
                    }
                }
                return $filterSortContainer;
            },
            _drawSelectFilter : function (dataCard, title, options) {
                var $select = $('<select class="filter form-control"/>');
                $select.append('<option value="">' + title + '</option>');
                $.each (options, function (index, element){
                    $select.append(
                        '<option value="' + index + '">' + index + '</option>'
                    );
                });
                return $select;
            },
            _drawInputFilter : function () {
                var $input = $('<input/>');
                $input.addClass('form-control');
                return $input;
            },
            _createLengthMenu : function (dataCard) {
                var settings = dataCard.settings();

                var $lengthPanel = null;
                if(settings.lengthMenu){
                    $lengthPanel = $("<div/>")
                        // .css({textAlign : "right"})
                        .addClass(models.control.filterClass)
                        .addClass("col-lg-6 col-md-12")
                    ;
                    var $lengthMenu = null;

                    if(settings.lengthMenu.length > 0){
                        var $select =
                            $('<select/>')
                                .attr(models.control.selectLength.attr)
                                .addClass('form-control form-control-sm')
                        ;


                        var isArrayOfArray = true;
                        var isArrayOfInteger = true;
                        var lengthMenu = Fn._getObjByProp(settings, _prop.lengthMenu, []);
                        $.each(lengthMenu, function (index, element) {
                            if( typeof element !== typeof []){
                                isArrayOfArray = false;
                            }
                            if(typeof element !== typeof 1){
                                isArrayOfInteger = false;
                            }
                        });

                        if(isArrayOfArray){
                            var arrayVal = lengthMenu[0];
                            var arrayText = lengthMenu.length > 1 ? lengthMenu[1] : null;

                            $.each(arrayVal, function (index, element) {
                                var text = "";
                                if(arrayText !== null && typeof arrayText[index] !== 'undefined'){
                                    text = arrayText[index];
                                }else {

                                    text = element;
                                }
                                var option = $('<option/>').val(element).text(text);
                                $select.append(option);
                            });

                        }
                        if(isArrayOfInteger){
                            $.each(lengthMenu, function (index, element) {
                                var translation = dataCard.i18n;
                                var text = element === -1 ? translation.menuText.all : element;
                                var option = $('<option/>').val(element).text(text);
                                $select.append(option);
                            });
                        }
                        $lengthMenu =
                            $('<div>' +
                                '<label>Afficher ' +
                                $select[0].outerHTML +
                                ' éléments'+
                                '</label>' +
                                '</div>');
                    }
                    $lengthPanel.append($lengthMenu);
                }
                return $lengthPanel;
            },
            _createPageInfoRow : function (dataCard) {
                var settings = dataCard.settings();

                if(settings.pageLength !== false){

                    var $infoRow = $('<div/>').addClass("row");
                    var $info = $('<div/>').attr(models.card.pageInfo.attr);
                    var $infoItem = $('<span/>').attr({'class' : 'info-item'});
                    var $infoSelected = $('<span/>').attr({'class' : 'selected-item'}).addClass("m-l-5");
                    var text = dataCard.i18n.select.rows["0"];
                    $infoSelected.text(text);

                    $info.append($infoItem).append($infoSelected);
                    $infoRow.append($info).appendTo(settings[_prop.jquerySelector]);
                    $('<div/>').attr(models.card.pagination.attr).appendTo($infoRow);
                }
            },
            _drawPagination : function (dataCard, segmentedData, currentPage, pageLength, displayData, data) {
                if(_DataCard.debug){
                    console.log({
                        dataCard : dataCard,
                        segmentedData : segmentedData,
                        currentPage : currentPage,
                        pageLength : pageLength,
                        displayData : displayData,
                        data : data

                    });
                }
                DataCardFn.pagination._drawPageList(dataCard, segmentedData, currentPage);
                var elementLength = segmentedData[currentPage-1].length;
                var start = 0;
                if(elementLength>0){
                    start =1;
                }
                var end = elementLength;
                start += (currentPage-1)*pageLength;
                end += (currentPage-1)*pageLength;
                DataCardFn.pagination._updateInfo(dataCard, start, end, displayData, data);


            }
        };

        /**
         * DataCard functions field
         */
        DataCardFn.field = {
            debug : false,
            _getFieldRender : function (type, options, editor, field) {
                return _Column._getColumnRender(type, options, editor, field);
            },
            _fieldsFilter : function (dataCard) {
                var settings = dataCard.settings();
                var caseInsensitive = Fn._getObjByProp(settings, _prop.caseInsensitive, DataCardDefaults.options.caseInsensitive);
                var debug = {
                    _event: 'DataCardFn.field._fieldsFilter',
                    dataCard : dataCard
                };

                var searchVal = "";
                var $fieldFilter =
                    $('['+models.control.search.fieldIdAttr+']', '.'+models.control.controlPanelContainer.attr.class+'.'+models.active);
                var arraySearch = {};
                arraySearch[_prop.fields] = {};
                arraySearch[_prop.multiFields] = {};
                arraySearch[_prop.search] = "";

                var $generalSearch =
                    $('.'+models.control.inputSearch.attr.class , '.'+models.control.controlPanelContainer.attr.class+'.'+models.active);
                if($generalSearch.length){
                    var inputVal = $generalSearch.val();
                    if(Fn._isStringNotEmpty(inputVal)){
                        searchVal = inputVal;
                        if(caseInsensitive){
                            searchVal = searchVal.toLowerCase();
                        }
                    }
                    arraySearch[_prop.search] = searchVal;
                }

                $fieldFilter.each(function (index, element) {
                    var $elem = $(this);
                    var val = $elem.val();
                    val = val.toString();
                    var fieldName = $elem.attr(models.control.search.fieldNameAttr);
                    var fieldId = $elem.attr(models.control.search.fieldIdAttr);
                    var isMultiField = ($elem.attr(models.dataMultiFieldAttr)) === "true";
                    if(Fn._isStringNotEmpty(fieldId) && Fn._isStringNotEmpty(val)){
                        if(isMultiField){
                            arraySearch[_prop.multiFields][fieldId] = val;
                        }else {
                            arraySearch[_prop.fields][fieldId] = val;
                        }
                    }
                    debug["$elem ["+(index+1)+"]"] = {
                        elem : element,
                        fieldId : fieldId,
                        val : val,
                        isMultiField : isMultiField,
                        fieldName : fieldName
                    };
                });
                debug.arraySearch = arraySearch;

                if(_DataCard.debug) {
                    console.log(debug);
                }

                dataCard.filter(arraySearch).draw();



                $.each(arraySearch[_prop.fields], function (fieldId, fieldSearchVal) {
                    var $fieldDisplay = $("."+models.field.item.display.attr.class, '['+models.dataEditorAttr+'="'+fieldId+'"]');
                    if($fieldDisplay.length){

                        var text = $fieldDisplay.text();
                        if(caseInsensitive){
                            text = text.toLowerCase();
                        }
                        if(text.includes(searchVal)){
                            $fieldDisplay.addClass(models.highlightClass);
                        }
                    }
                    if(_DataCard.debug) {
                        console.log({
                            fieldId: fieldId,
                            fieldSearchVal: fieldSearchVal,
                            $fieldDisplay: $fieldDisplay
                        });
                    }
                });
                $.each(arraySearch[_prop.multiFields], function (fieldId, fieldSearchVal) {
                    var $multiFieldGroup  = $("."+models.field.item.multi.attr.class);
                    $multiFieldGroup.each(function () {
                        var $elem = $(this);
                        var dataId = $elem.attr(models.dataEditorAttr);
                        if(dataId.includes('.'+fieldId)){
                            var $fieldDisplay = $("."+models.field.item.display.attr.class, $elem);
                            if($fieldDisplay.length){
                                var text = $elem.text();
                                if(caseInsensitive){
                                    text = text.toLowerCase();
                                }
                                if(text.includes(searchVal)){
                                    $fieldDisplay.addClass(models.highlightClass);
                                }
                            }
                        }
                    });
                    if(_DataCard.debug) {
                        console.log({
                            fieldId: fieldId,
                            fieldSearchVal: fieldSearchVal,
                            $multiFieldGroup: $multiFieldGroup
                        });
                    }
                });

                if(Fn._isStringNotEmpty(searchVal)){
                    $("."+models.field.item.display.attr.class).each(function () {
                        var $elem = $(this);
                        var text = $elem.text();
                        if(caseInsensitive){
                            text = text.toLowerCase();
                        }
                        if(text.includes(searchVal)){
                            $elem.addClass(models.highlightClass);
                        }
                        if(_DataCard.debug) {
                            console.log({
                                $elem : $elem,
                                text : text,
                                searchVal : searchVal
                            })
                        }
                    })
                }
            }

        };

        /**
         * DataCard functions pagination
         */
        DataCardFn.pagination = {
            _drawPageList : function (dataCard, processedData, currentPage) {
                var pageQty = processedData.length;
                var $paginationContainer = $('#'+models.card.pagination.attr.id);
                $paginationContainer.empty();
                if(Fn._isInteger(pageQty) && pageQty > 0){
                    var i18n = dataCard.i18n;
                    var $pagination = DataCardFn.pagination._getPageBtnContainer();
                    if(pageQty > 1){
                        var $btnPrevious = DataCardFn.pagination._getPageBtn(i18n.oPaginate.sPrevious);
                        $btnPrevious.attr({
                            id : "previous"
                        });
                        if(currentPage === 1){
                            $btnPrevious.addClass(models.disabledClass);
                        }
                        $pagination.append($btnPrevious);
                    }
                    for (var i = 1; i <= pageQty; i++){
                        var selectedPage = currentPage === i;
                        var $btn = DataCardFn.pagination._getPageBtn(i, selectedPage)
                            .attr(models.dataPageIndexAttr, i);
                        $pagination.append($btn);
                    }

                    if(pageQty > 1){
                        var $btnNext = DataCardFn.pagination._getPageBtn(i18n.oPaginate.sNext);
                        $btnNext.attr({
                            id : "next"
                        });
                        if(pageQty <= currentPage){
                            $btnNext.addClass(models.disabledClass);
                        }
                        $pagination.append($btnNext);
                    }
                    if(_DataCard.debug){
                        console.log($pagination);
                    }
                }
                $paginationContainer.append($pagination);

            },
            _updateInfo : function (dataCard, start, end, displayData, data) {
                var i18n = dataCard.i18n;
                var infoText = i18n.sInfo;
                var displayDataLength = displayData.length;
                var dataLength = data.length;
                infoText = infoText.replace("_START_", start).replace("_END_", end).replace("_TOTAL_", displayDataLength);
                if(displayDataLength < dataLength){
                    var filterText = i18n.sInfoFiltered;
                    filterText = filterText.replace('_MAX_', dataLength );
                    infoText = infoText+' ' + filterText;
                }
                var $pageInfo = $(".info-item", '#'+models.card.pageInfo.attr.id);
                $pageInfo.text(infoText);
            },
            _updateSelectedItemInfo : function (dataCard) {
                var i18n = dataCard.i18n;
                var settings = dataCard.settings();
                var $selectedItemInfo = $(".selected-item", '#'+models.card.pageInfo.attr.id);
                var $selectedCard = DataCardFn.jqElement._getSelectedCards(settings[_prop.jquerySelector]);
                var text = i18n.select.rows["_"];
                text = text.replace("%d", $selectedCard.length);
                $selectedItemInfo.text(text);

            },
            _getPageBtnContainer : function () {
                return $("<ul/>").attr({"class" : "pagination"});
            },
            _getPageBtn : function (btnText, selected) {
                var $btnContainer = null;
                if(Fn._isStringNotEmpty(btnText) || Fn._isInteger(btnText)){
                    var $btnIndex = $('<a/>')
                        .attr(models.control.pagination.aBtn.attr)
                        .text(btnText);
                    $btnContainer = $('<li/>')
                        .attr(models.control.pagination.liBtn.attr)
                        .append($btnIndex);

                    if(Fn._isSameType(selected, true) && selected){
                        $btnContainer.addClass(models.active);
                    }
                }
                return $btnContainer;
            }
        };

        /**
         * DataCard functions editor
         */
        DataCardFn.editor = {
            _isRowReorderValid : function (settings) {
                var inArrayField = false;
                var arrayFields = Fn._getObjByProp(settings, _prop.fields, []);
                var rowReorder = Fn._getObjByProp(settings, _prop.rowReorder , "");
                if(Fn._isStringNotEmpty(rowReorder) && Fn._isSameType(arrayFields, []) && arrayFields.length > 0){
                    arrayFields.forEach(function (field) {
                        if(Fn._isStringNotEmpty(field.name)){
                            if(field.name === rowReorder){
                                inArrayField = true;
                            }
                        }
                    });
                }
                if(_DataCard.debug){
                    console.log({
                        settings : settings,
                        inArrayField : inArrayField,
                        arrayFields : arrayFields,
                        rowReorder : rowReorder
                    })
                }
                return inArrayField
            },
            _enableSortable : function (dataCard, jquerySelector) {

                if(EditorFn.debug ) {
                    console.log("_enableSortable() called");
                }
                if (jQuery.ui ){
                    var sortableInstance = $(jquerySelector).sortable("instance");
                    if(Fn._isNotUndefined(sortableInstance)){
                        sortableInstance.enable();
                    }
                }
            },
            _disableSortable : function (dataCard, jquerySelector) {
                if(EditorFn.debug ) {
                    console.log("_disableSortable() called");
                }
                if (jQuery.ui ){
                    var sortableInstance = $(jquerySelector).sortable("instance");
                    if(Fn._isNotUndefined(sortableInstance)){
                        sortableInstance.disable();
                    }
                }
            },
            _revertSortable : function (dataCard, jquerySelector) {
                if(EditorFn.debug ) {
                    console.log("_disableSortable() called");
                }
                if (jQuery.ui ){
                    var sortableInstance = $(jquerySelector).sortable("instance");
                    if(Fn._isNotUndefined(sortableInstance)){
                        sortableInstance.cancel();
                        _BootstrapNotify.danger("une erreur est survenue");
                    }
                }
            },
            sortable : function (dataCard, jquerySelector) {
                var settings = dataCard.settings();
                if (jQuery.ui && DataCardFn.editor._isRowReorderValid(settings)){
                    var originalIndex = -1;
                    var editor = dataCard.editor();
                    var pageIndex = dataCard.page();
                    var selectLength = dataCard.length();
                    var rowReorderSrc = settings.rowReorder;
                    /**
                     *make jquerySelector sortable
                     */
                    $(jquerySelector).sortable({
                        tolerance: "pointer",
                        handle: '.'+models.control.btn.reOrder.attr.class,
                        placeholder: "ui-state-highlight",
                        start: function(event, ui) {
                            DataCardFn.card._closeAllTooltip();
                            ui.placeholder.height(ui.item.innerHeight());
                            ui.placeholder.width(ui.item.innerWidth());
                            originalIndex = (ui.item.index());
                        },
                        stop : function (event, ui) {

                            var addIndex = 1 + ( ( pageIndex - 1 ) * selectLength );
                            var
                                newIndex = (ui.item.index()),
                                begin = originalIndex,
                                end = newIndex,
                                arrayUpdateOrder = {},
                                arrayId = []
                            ;

                            if(end <= begin){
                                begin = newIndex;
                                end = originalIndex;
                            }

                            var $selectedCard = $("."+models.card.item.attr.class, "."+models.card.rowCardContainer.attr.class).slice(begin, end+1);
                            if($selectedCard.length > 1){
                                $selectedCard.each(function () {
                                    var $this = $(this);
                                    var id = $this.attr(models.dataEditorIdAttr);
                                    if(Fn._isStringNotEmpty(id)){
                                        arrayUpdateOrder[id] = $this.index()+addIndex;

                                        arrayId.push(id);
                                    }
                                });
                                var multiSet = {};
                                multiSet[rowReorderSrc] = arrayUpdateOrder;
                                editor.one(_Editor._event.submitUnsuccessful, function (e, json) {
                                    DataCardFn.editor._revertSortable(dataCard, '.' + models.card.rowCardContainer.attr.class);
                                    console.log({
                                        _event : _Editor._event.submitUnsuccessful,
                                        dataCard: dataCard,
                                        editor: editor,
                                        json : json,
                                        e: e
                                    });
                                });
                                editor.one(_Editor._event.submitSuccess, function (e, json) {
                                    editor.off(_Editor._event.submitUnsuccessful);
                                });
                                editor.edit(arrayId, false).multiSet(multiSet).submit();
                            }

                            if( EditorFn.debug ){
                                console.log({
                                    _event : "jQuery.ui.sortable()",
                                    _begin : begin,
                                    _end : end,
                                    $selectedCard : $selectedCard,
                                    addIndex : addIndex,
                                    event : event,
                                    multiSet : multiSet,
                                    originalIndex : originalIndex,
                                    newIndex : newIndex,
                                    ui : ui,
                                    settings : settings,
                                    page : pageIndex,
                                    arrayId : arrayId,
                                    jquerySelector : jquerySelector,
                                    arrayUpdateOrder : arrayUpdateOrder,
                                    editor : editor,
                                    selectLength : selectLength
                                });
                            }
                        }
                    });
                }
            }
        };

    /**
     * DataCard options
     */

    var DataCardDefaults = $.fn.DataCard.defaults = {
        options : {},
        cardButtons : {},
        field : {},
        multiFields: {},
        buttons : {},
        template : "",
        events : {},
        itemSrc : {},
        ordering : {}
    };

        DataCardDefaults.options = {
            ajax : "/admin/_api/datacard/",
            _ids : [],
            ordering : [],
            dataSrc : "",
            idSrc : "",
            titleSrc : "",
            editorTemplate : "#"+models.editor.template.attr.id,
            columnDisplay : 3,
            pageLength : 30,
            lengthMenu : [ 30, 60, 120, -1],
            fields : [],
            multiFields : {},
            controlPanel : '.'+models.control.controlPanelContainer.attr.class,
            buttons : [],
            cardButtons : [],
            caseInsensitive : true,
            filterHiddenGroup : true,
            language : _Table._language.def,
            rowReorder: "",
            search : true,
            select : true,
            edit : true,
            create : true,
            remove : true,
            fixedControl : {
                offSet : 52
            }
        };

        DataCardDefaults.options.event = {
            onStart : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard onStart() called", {
                        dataCard :dataCard
                    });
                }
            },
            started : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard started(settings) called", {
                        dataCard : dataCard
                    });
                }
            },
            initLoad : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard initLoad() called", {
                        dataCard :dataCard
                    });
                }
            },
            preLoad : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard preLoad() called", {
                        dataCard : dataCard
                    });
                }
            },
            onLoad : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard onLoad() called", {
                        dataCard : dataCard
                    });
                }
            },
            postLoad : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard postLoad() called", {
                        dataCard : dataCard
                    });
                }
            },
            initDraw : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard initDraw() called", {
                        dataCard : dataCard
                    });
                }
            },
            preDraw : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard preDraw() called", {
                        dataCard : dataCard
                    });
                }
            },
            onDraw : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard onDraw() called", {
                        dataCard : dataCard
                    });
                }
            },
            postDraw : function (dataCard) {
                if(_DataCard.debug){
                    console.log("DataCard postDraw() called", {
                        dataCard : dataCard
                    });
                }
            }
        };

        DataCardDefaults.multiFields.options = {
            dataSrc : "",
            idSrc : "",
            titleSrc : "",
            itemSrc : [],
            fields : []
        };

        DataCardDefaults.itemSrc.options = {
            title : "",
            data : "",
            visible : true,
            search : true,
            sort : true
        };

        /**
         * content editor settings
         */
        DataCardDefaults.field.options = {
            className : "",
            name : "",
            label : "",
            fieldInfo : "",
            type : _Column._type.text,
            sort : true,
            order : null,
            search : true,
            visible : true,
            create : true,
            edit : true,
            display : false,
            _isMultiField : false
        };

        /**
         * content editor settings
         */
        DataCardDefaults.buttons.options  = {
            name : "",
            title : "",
            className : "",
            icon : "",
            action : function(event, dataCard, editor){

            }
        };

        /**
         * content editor settings
         */
        DataCardDefaults.ordering.options  = {
            name : '',
            multiFields : false,
            direction : _DataCard._ordering.asc
        };




    var EditorFn = {
        debug : true
    };

    EditorFn.listener = {
        editorListener : function (dataCard, editor, editorFields) {
            editor
                .on( _Editor._event.preOpen, function ( e, node, data, items, type ) {
                    if(EditorFn.debug) {
                        console.log({
                            _event : _Editor._event.preOpen, editorFields: editorFields, editor: editor,
                            e: e, node: node, data: data, items: items, type: type
                        });
                    }
                    editorFields.forEach(function (field) {
                        if (field.display === true) {
                            editor.field(field.name).show();
                        }
                    });
                })
                .on( _Editor._event.postRemove, function (e) {
                    if(EditorFn.debug) {
                        console.log({
                            _event : _Editor._event.initCreate,
                            editorFields: editorFields,
                            editor: editor,
                            e: e
                        });
                    }
                    dataCard.ajax.reload(false);
                })
                .on(_Editor._event.uploadXhrSuccess, function (e, fieldName, json) {
                    if(EditorFn.debug) {
                        console.log({
                            eventName: _Editor._event.uploadXhrSuccess, e: e, json: json, fieldName: fieldName
                        });
                    }
                    dataCard.ajax.loadFiles();
                })
                .on(_Editor._event.postUpload, function (e, fieldName, json) {
                    if(EditorFn.debug) {
                        console.log({
                            eventName: _Editor._event.postUpload, e: e, json: json, fieldName: fieldName
                        });
                    }
                    dataCard.ajax.loadFiles();
                })
                .on(_Editor._event.preUpload, function (e, fieldName, file, formData) {
                    formData.append("uploadField", fieldName);
                    if(EditorFn.debug) {
                        console.log({
                            eventName: _Editor._event.preUpload, e: e, file: file, formData: formData
                        });
                    }
                    return true;
                })
                .on(_Editor._event.uploadXhrError, function (e, fieldName, xhr) {
                    if(EditorFn.debug) {
                        console.log({
                            eventName: _Editor._event.uploadXhrError, e: e, xhr: xhr, fieldName: fieldName
                        });
                    }
                })
                .on(_Editor._event.postSubmit, function ( e, json, data, action, xhr) {
                    var arrayData = Fn._getObjByProp(json, _prop.data, []);

                    if(action !== _Editor._event.remove){
                        if(arrayData.length > 0){
                            dataCard.ajax.reload(true, function () {
                                var processTime = Date.now();
                                DataCardFn.card._closeAllTooltip();
                                $.each(arrayData, function (index, element) {
                                    if(EditorFn.debug) {
                                        console.log({
                                            data: element
                                        });
                                    }
                                    var elementId = Object.keys(element)[0];
                                    DataCardFn.card._animateCard(DataCardFn.card._getCardById(elementId));
                                });
                                processTime = Date.now() - processTime;
                                DataCardFn.initListener(dataCard, editor, DataCardFn.listener.card);
                                if(EditorFn.debug) {
                                    console.log({
                                        arrayData: arrayData,
                                        processTime: processTime
                                    });
                                }
                            });
                        }
                    }
                    if(EditorFn.debug) {
                        console.log({
                            _event: _Editor._event.postSubmit, e: e, json: json, data: data,
                            action: action, xhr: xhr
                        });
                    }
                })
            ;
        }
    };

    EditorFn.init = function (dataCard, editor, editorFields) {
        var allListener = EditorFn.listener;
        $.each(allListener, function (index, listener) {
            if(Fn._isFunction(listener)){
                listener(dataCard, editor, editorFields);
            }
        });

        /*var allEditorListener = _Editor._event;
        $.each(allEditorListener, function (index, elem) {
            editor.on(elem, function (e) {
                console.log({
                    _event : elem,
                    editorFields: editorFields,
                    editor: editor,
                    e: e
                });
            })
        });*/

    };


}( jQuery));
