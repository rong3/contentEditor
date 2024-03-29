var _separator = {
    array: "|",
    date: "/",
    time: ':'
};

var _timeHelper = {
    minSec: 60,
    month: 12,
    hours: 24,
    min: 60,
    sec: 60,
    type: {
        year: "year",
        month: "month",
        hour: "hour",
        day: "day",
        min: "min",
        sec: "sec"
    }
};

var _DataTable = {
    _data: "data-",
    tableId: "dataTable",
    debug : false,
    _language: {
        en: "en",
        de: "de",
        fr: "fr",
        nl: "nl"
    },
    ajaxUrl: "/admin/_api/datatable/",
    _const: {
        attrFilterHead: "data-filterHead",
        attrRowReOrder: "data-rowreorder",
        attrLanguage: "data-lang",
        attrIdSrc: "data-idsrc",
        attrTable: "data-table",
        attrTitle: "data-title",
        attrEdit: "data-edit",
        attrEditType: "data-edittype",
        attrCreate: "data-create",
        attrRemove: "data-remove",
        attrPrint: "data-print",
        attrImageSrc: "data-imagesrc",
        attrExcel: "data-excel",
        attrPdf: "data-pdf",
        attrControlColumn: "data-controlcolumn"
    },
    format: {
        date: "DD" + _separator.date + "MM" + _separator.date + "YYYY",
        time: "HH:mm",
        datetime: "DD" + _separator.date + "MM" + _separator.date + "YYYY - HH:mm",
        hours: "HH",
        minutes: "mm",
        days: "DD",
        timeStamp: 'X',
        dayHoursMinute: "DD HH:mm"
    },

    /**
     *
     * @param tableId
     * @returns {null | Table}
     * @private
     */
    _init: function (tableId) {
        if (_DataTable.debug) {
            console.log("_DataTable._init() called", {tableId: tableId})
        }

        if (typeof tableId !== typeof "") {
            tableId = _DataTable.tableId;
        }
        var $table = $('#' + tableId);
        if ($table.length > 0) {
            var tableIndex = _DataTable._getAttribute($table, _DataTable._const.attrTable);
            if (tableIndex !== "") {
                var table = new Table();
                table
                    .setIdSelector(tableId)
                    .setTableIndex(tableIndex)
                    .setIdSrc(_DataTable._getAttribute($table, _DataTable._const.attrIdSrc))
                    .setCreate(_DataTable._getBooleanAttribute($table, _DataTable._const.attrCreate))
                    .setEdit(_DataTable._getBooleanAttribute($table, _DataTable._const.attrEdit))
                    .setEditType(_DataTable._getAttribute($table, _DataTable._const.attrEditType))
                    .setRemove(_DataTable._getBooleanAttribute($table, _DataTable._const.attrRemove))
                    .setPrint(_DataTable._getBooleanAttribute($table, _DataTable._const.attrPrint))
                    .setPdf(_DataTable._getBooleanAttribute($table, _DataTable._const.attrPdf))
                    .setExcel(_DataTable._getBooleanAttribute($table, _DataTable._const.attrExcel))
                    .setTitle(_DataTable._getAttribute($table, _DataTable._const.attrTitle))
                    .setLanguage(_DataTable._getAttribute($table, _DataTable._const.attrLanguage))
                    .setFilterHead(_DataTable._getBooleanAttribute($table, _DataTable._const.attrFilterHead))
                    .setImageSrc(_DataTable._getAttribute($table, _DataTable._const.attrImageSrc, []))
                    .setRowReorder(_DataTable._getAttribute($table, _DataTable._const.attrRowReOrder))
                    .setControlColumn(_DataTable._getBooleanAttribute($table, _DataTable._const.attrControlColumn))
                    .setArrayColumn(_Column._getColumns(tableId))
                ;
                return table.draw();
            }
        }
        return null;
    },

    /**
     *
     * @param $element
     * @param attr
     * @param defaultValue
     * @returns {string}
     * @public
     */
    _getAttribute: function ($element, attr, defaultValue) {
        if ($element.length > 0) {
            var attribute = $element.attr(attr);
            if (typeof attribute !== "undefined") {
                defaultValue = attribute;
            } else {
                defaultValue = "";
            }
        }

        return defaultValue;
    },

    /**
     *
     * @param $element
     * @param attr
     * @returns {boolean}
     * @public
     */
    _getBooleanAttribute: function ($element, attr) {
        var attribute = _DataTable._getAttribute($element, attr, "false");
        return attribute === "true";
    },

    /**
     *
     * @param tableId
     * @param dataTable
     * @param columns
     */
    _displayFilterHead: function (tableId, dataTable, columns) {
        dataTable
            .on("init.dt", function () {
                var tableHead = $("#" + tableId + ' thead');
                tableHead.append('<tr></tr>');
                var filterRow = tableHead.find('tr:eq(1)');

                var columnsApi = dataTable.columns();

                columnsApi.every(function () {
                    var colApi = this;

                    var index = colApi.index();
                    var responsiveHidden = colApi.responsiveHidden();
                    var visible = colApi.visible();

                    if (visible) {

                        var display = responsiveHidden ? "" : "none";

                        var $th = $("<th></th>");
                        $th.css("display", display);
                        filterRow.append($th);


                        var col = columns[index];

                        if (col !== null && col instanceof Column && col.isSearchable()) {
                            var columnOptions = col.options;
                            if (Fn._isNotUndefined(columnOptions)) {
                                _DataTable._showSelectFilter($th, dataTable, index, columnOptions);
                            } else {
                                _DataTable._showInputFilter($th, dataTable, index);
                            }
                        }

                    }
                });
            })
            .on('responsive-resize', function () {

                var fixedHeader = dataTable.fixedHeader;
                fixedHeader.enable(false);

                var firstRow = $('#' + tableId + ' thead tr:eq(0)');

                var secondRow = $('#' + tableId + ' thead tr:eq(1)');
                if (secondRow.length > 0) {
                    firstRow.find("th").each(function (index, element) {
                        var firstRowDisplay = $(element).css("display");
                        var $secondRowTd = secondRow.find("th:eq(" + index + ")");
                        if ($secondRowTd.length > 0) {
                            $secondRowTd.css("display", firstRowDisplay);
                        }
                    });
                }
                fixedHeader.adjust();
            })
        ;
    },


    /**
     *
     * @param td
     * @param dataTable
     * @param index
     * @private
     */
    _showInputFilter: function (td, dataTable, index) {
        var $inputHtml = $('<input class="iconify" type="text" placeholder="&#xf002;">');
        $(td).html($inputHtml);
        $inputHtml.on('keyup change', function () {
            if (dataTable.columns(index).search() !== this.value) {
                dataTable.columns(index).search(this.value).draw();
            }
        });
    },

    /**
     *
     * @param td
     * @param dataTable
     * @param index
     * @param options
     * @private
     */
    _showSelectFilter: function (td, dataTable, index, options) {
        var $select = $('<select class="filter"><option value="">' + dataTable.i18n("menuText.all") + '</option></select>');
        $.each(options, function (index) {
            $select.append(
                '<option value="' + index + '">' + index + '</option>'
            );

        });
        $(td).append($select);

        $select.on('change', function () {
            var value = $(this).val();
            var val = $.fn.dataTable.util.escapeRegex(
                value
            );
            dataTable.column(index)
                .search(val ? '' + val + '' : '', true, false)
                .draw();
        });
    }
};

var _Table = {
    _tableTitleDef: "tableTitle",

    debug : false,

    /**

     * @type {object}
     */
    _defOptions: {
        lengthMenu: [[25, 50, 100], [25, 50, 100]],
        fixedHeader: {
            headerOffset: 52
        },
        searching: true,
        select: true,
        responsive: true,
        autoWidth: true
    },

    /**
     *
     * @type {string}
     * @public
     */
    _defIdSelector: "dataTable",

    /**
     *
     * @type {{def: number, inline: number, bubble: number}}
     * @private
     */
    _editType: {
        def: 0,
        inline: 1,
        bubble: 2
    },

    /**
     *
     * @public
     */
    _language: {
        def: _DataTable._language.fr
    },

    _clearHeadHtml: function (idSelector) {
        if (_Table.debug) {
            console.log("_Table._clearHeadHtml() called");
        }
        $("#" + idSelector + " thead").html("");
    },

    /**
     *
     * @private
     */
    _event: [
        'column-sizing.dt',
        'column-visibility.dt',
        'destroy.dt',
        'draw',
        'error.dt',
        'init.dt',
        'length.dt',
        'order.dt',
        'page.dt',
        'preDraw',
        'preInit.dt',
        'preXhr.dt',
        'processing.dt',
        'search.dt',
        'stateLoadParams.dt',
        'stateSaveParams.dt',
        'xhr.dt',
        'responsive-display',
        'responsive-resize'
    ],

    /**
     *
     * @param dataTable
     * @private
     */
    _initDataTableEvent: function (dataTable) {
        var arrayEvent = _Table._event;
        if (_Table.debug) {
            console.log("_Table._initDataTableEvent() called", arrayEvent);
        }
        if (_Table.debug) {
            $.each(arrayEvent, function (index, event) {
                dataTable.on(event, function () {
                    console.log("");
                    console.log("dataTable " + event);
                });
            });
        }
    },

    /**
     *
     * @param tableId
     * @param translation
     * @private
     */
    _editableCellTooltip: function (tableId, translation) {
        if (_Table.debug) {
            console.log(Table.name + " " + _Table._editableCellTooltip.name + "() called");
        }
        var $table = $('table#' + tableId + ' tbody');
        var tdEditable = 'tr td.editable';

        $table
            .on('mouseenter', tdEditable, function () {
                var title = translation._custom.tooltip.clickToEdit;
                if ($('div.DTE_Inline', this).length > 0) {
                    title = translation._custom.tooltip.enterToSave;
                }
                $(this)
                    .tooltip("dispose")
                    .tooltip({
                        title: title
                    })
                    .tooltip("show")
                ;
            })
            .on('click', tdEditable, function () {
                $(this).tooltip("dispose");
                $(this).tooltip({
                    title: translation._custom.tooltip.enterToSave
                }).tooltip("show");
            })
            .on('mouseleave', tdEditable, function () {
                $(this).tooltip("dispose");
            })
        ;
    },

    /**
     *
     * @param tableId
     * @param dataTable
     * @public
     */
    _collapseAllRow: function (tableId, dataTable) {
        var tr = $("#" + tableId + ' tbody tr');
        tr.each(function () {
            var row = dataTable.row($(this));
            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
        });
    },

    /**
     *
     */
    _printTableTitle: function (title, tableTitleId) {
        if (typeof tableTitleId === "undefined") {
            tableTitleId = _Table._tableTitleDef;
        }
        var $tableTitle = $("#" + tableTitleId);
        if ($tableTitle.length > 0) {
            if (title !== "") {
                $tableTitle.html(title);
            }
        }
    }
};

var _Column = {
    debug : false,
    _type: {
        boolean: "boolean",
        checkbox: "checkbox",
        color: "color",
        date: "date",
        daterange: "daterange",
        datetime: "datetime",
        flag: "flag",
        float: "float",
        icon: "icon",
        image: "image",
        integer: "integer",
        password: "password",
        price: "price",
        select: "select",
        textarea: "textarea",
        text: "text",
        time: "time",
        timestep: "timestep",
        upload: "upload",
        uploadMany: "uploadMany"
    },
    _editableClass: "editable ",
    _const: {
        attrColumnIndex: _DataTable._data + "column",
        attrDefaultValue: _DataTable._data + "def",
        attrDefContent: _DataTable._data + "content",
        attrEditable: _DataTable._data + "edit",
        attrCreate: _DataTable._data + "create",
        attrOptions: _DataTable._data + "options",
        attrOrderDataType: _DataTable._data + "orderDataType",
        attrOrderable: _DataTable._data + "orderable",
        attrOrderSequence: _DataTable._data + "orderSequence",
        attrSearchable: _DataTable._data + "searchable",
        attrImageSrc: _DataTable._data + "imagesrc",
        attrTitle: _DataTable._data + "title",
        attrType: _DataTable._data + "type",
        attrWidth: _DataTable._data + "width",
        attrVisible: _DataTable._data + "visible",
        attrClassName: _DataTable._data + "classname"
    },
    render: {
        boolean: function () {
            return function render(data, type, row, meta) {
                var check = data === "1" || data === true || data === "true" ? "checked" : "";
                return '<div class="text-center" style="width:auto;">' +
                    '<label class="p-switch p-switch-sm v-a-m m-auto">' +
                    '<input type="checkbox" name="switch" ' + check + ' disabled><span class="p-switch-style"></span>' +
                    '</label>' +
                    '</div>';
            }
        },
        color: function () {
            return function render(data, type, row, meta) {
                var color = _Column._validColor(data) ? data : "";
                var backgroundColor = color !== "" ? 'style="background-color : ' + color + ';" ' : "";
                return '<span class="color-circle"' + backgroundColor + '></span> <span>' + data + '</span>';
            }
        },
        checkbox: function (options) {
            return function checkbox(data, type, row, meta) {
                if(_DataTable.debug){
                    console.log({
                        options : options, data : data, type : type, row : row, meta : meta
                    });

                }
                var arrayData = data.split("|");
                var optionsArray = [];
                $.each(arrayData, function (index, dataElement) {
                    if (Fn._isSameType(options, {})) {
                        var badge = "";
                        $.each(options, function (key, element) {
                            if (dataElement === element) {
                                badge += '<span class="badge badge-pill badge-secondary">'+key+'</span>';
                                optionsArray.push(badge);
                            }
                        });
                    }
                });
                return optionsArray.join("");
            }

        },
        daterange : function () {
            //TODO daterange
            return null;
        },
        date: function () {
            return function render(data, type, row, meta) {
                if (moment) {
                    var mom = moment(data, _DataTable.format.timeStamp);
                    if (mom.isValid()) {

                        return mom.format(_DataTable.format.date);
                    } else {
                        return "";
                    }
                } else {
                    return Fn._intToDate(data);
                }
            }
        },
        time: function () {
            return function render(data, type, row, meta) {
                if (moment) {
                    var mom = moment(data, _DataTable.format.timeStamp);
                    if (mom.isValid()) {
                        return mom.utc().format(_DataTable.format.time);
                    } else {
                        return "";
                    }
                } else {

                    return Fn._intToDate(data);
                }
            }
        },
        datetime: function () {
            return function render(data, type, row, meta) {
                if (moment) {
                    var mom = moment(data, _DataTable.format.timeStamp);
                    if (mom.isValid()) {
                        return mom.format(_DataTable.format.datetime);
                    } else {
                        return "";
                    }
                } else {

                    return Fn._intToDate(data);
                }
            }
        },
        day_of_week : function (options) {
            return _Column.render.checkbox(options);
        },
        flag: function () {
            return function render(data, type, row, meta) {
                var arrayDebug = [];
                arrayDebug.data = data;
                arrayDebug.type = type;
                arrayDebug.row = row;
                arrayDebug.meta = meta;
                return '<div class="text-center"><span class="flag-icon ' + row['_col_icon'] + '"></span></div>';
            }
        },
        float: function () {
            return function render(data, type, row, meta) {
                data = Fn._isStringNotEmpty(data) && Fn._isNumeric(data) ? parseInt(data) : 0;
                return Fn._intToDec(data);
            }
        },
        icon: function () {
            return function render(data, type, row, meta) {
                if(_DataTable.debug || true){
                    console.log({
                        data : data, type : type, row : row, meta : meta
                    });

                }
                return '<div class="text-center text-light social-icons social-icons-rounded social-icons-small social-icons-colored d-block">' +
                    '<ul>' +
                    '<li>' +
                    '<a href="javascript:void(0)" style="background-color: ' + row['_col_color'] + '; cursor: default;" class="elevation">' +
                    '<i class="' + row['_col_icon'] + '"></i>' +
                    '</a>' +
                    '</li>' +
                    '</ul>' +
                    '</div>';
            }
        },
        image: function (options, editor, field) {
            return function render(fileId, type, row, meta) {
                if(fileId){
                    var filePath = "";
                    var imageSrc = Fn._getObjByProp(field, "imageSrc");
                    var dataSrc = "";
                    var filePathSrc = "";
                    if(Fn._isSameType(imageSrc, [])){
                        if(imageSrc.length > 0 && Fn._isStringNotEmpty(imageSrc[0])){
                            dataSrc = imageSrc[0];
                        }
                        if(imageSrc.length > 1 && Fn._isStringNotEmpty(imageSrc[1])){
                            filePathSrc = imageSrc[1];
                        }
                    }

                    var file = editor.file(dataSrc, fileId);
                    if(Fn._isStringNotEmpty(filePathSrc) && file !== null && Fn._isSameType( file, {} ) ){
                        filePath = Fn._getObjByProp(file, filePathSrc, "");
                    }
                    if(_DataTable.debug){

                        console.log({
                            file_id : fileId, type : type, row : row, meta : meta, editor : editor, imageSrc : imageSrc, file : file, field :field
                        });
                    }
                    if (file) {
                        return fileId ?
                            '<img class="img-fluid" src="' + filePath + '"/>' :
                            null;
                    }
                }

                return null;
            }
        },
        integer: function () {
            return function render(data, type, row, meta) {
                data = Fn._isStringNotEmpty(data) ? parseInt(data) : 0;
                console.log({
                    data :data
                });
                // return parseInt(data);
                return data;
            }
        },
        password : function () {
            //TODO password
            return function (data) {
                return "*****";
            };
        },
        price: function () {
            return function render(data, type, row, meta) {
                data = Fn._isStringNotEmpty(data) ? parseInt(data) : 0;
                return Fn._intToPrice(data);
            }
        },
        select: function (options) {
            return _Column._renderOption(options);
        },
        textarea : function () {
            //TODO textarea
            return null;
        },
        timestep: function (options, editor) {

            return function render(data, type, row, meta) {

                var translation = editor.i18n;
                var returnVal = data;
                if (returnVal !== "" && returnVal.includes(_separator.array) && translation) {
                    var val = returnVal.split(_separator.array);
                    if (val.length === 2) {
                        var inputVal = val[0];
                        var selectVal = val[1];
                        switch (selectVal) {
                            case _timeHelper.type.hour :
                                selectVal = translation.datetime.hour;
                                break;
                            case _timeHelper.type.min :
                                selectVal = translation.datetime.minute;
                                break;
                            case _timeHelper.type.day :
                                selectVal = translation.datetime.day;
                                break;
                            default :
                                selectVal = '';
                                break;
                        }

                        if (Fn._isStringNotEmpty(inputVal) && Fn._isStringNotEmpty(selectVal)) {
                            returnVal = inputVal + " " + selectVal;
                        }

                    }
                }
                return returnVal;
            }
        },
        uploadMany : function (options, editor, field) {
            return function ( fileId, counter ) {
                var filePath = "";
                var imageSrc = Fn._getObjByProp(field, "imageSrc");
                var dataSrc = "";
                var filePathSrc = "";
                if(Fn._isSameType(imageSrc, [])){
                    if(imageSrc.length > 0 && Fn._isStringNotEmpty(imageSrc[0])){
                        dataSrc = imageSrc[0];
                    }
                    if(imageSrc.length > 1 && Fn._isStringNotEmpty(imageSrc[1])){
                        filePathSrc = imageSrc[1];
                    }
                }

                var file = editor.file(dataSrc, fileId);
                if(Fn._isStringNotEmpty(filePathSrc)){
                    filePath = Fn._isStringNotEmpty(file[filePathSrc]) ? file[filePathSrc] : "";
                }
                if (file) {
                    return fileId ?
                        '<img class="img-fluid" src="' + filePath + '"/>' :
                        null;
                } else {
                    return null;
                }
            }
        }
        //TODO upload
    },


    _getColumnRender: function (type, options, editor, field) {
        var allRender = _Column.render;
        if ( allRender.hasOwnProperty(type) && Fn._isFunction(allRender[type]) ) {
            return allRender[type](options, editor, field);
        } else {
            return null;
        }
    },

    _getColumns: function (tableId) {
        var arrayColumn = [];

        $("#" + tableId + " thead tr:first th").each(function (index, element) {
            var $element = $(element);
            var columnIndex = _DataTable._getAttribute($element, _Column._const.attrColumnIndex);
            if (columnIndex !== "") {
                var column = null;
                if (columnIndex === "NULL") {
                    column = _Column._getSpecialColumn(_DataTable._getAttribute($element, _Column._const.attrClassName).trim());
                    column
                        .setCreate(false)
                        .setEditable(false)
                        .setOrderable(false)
                        .setSearchable(false)
                        .setVisible(_DataTable._getBooleanAttribute($element, _Column._const.attrVisible))
                    ;
                } else {

                    var dataOptions = _DataTable._getAttribute($element, _Column._const.attrOptions), options = null;
                    if (dataOptions !== "") {

                        options = JSON.parse(dataOptions);
                    }

                    var dataImageSrc = _DataTable._getAttribute($element, _Column._const.attrImageSrc), imageSrc = [];

                    if (Fn._isStringNotEmpty(dataImageSrc)) {

                        imageSrc = JSON.parse(dataImageSrc);
                    }
                    column = new Column(columnIndex, _DataTable._getAttribute($element, _Column._const.attrTitle));

                    column
                        .addClass(_DataTable._getAttribute($element, _Column._const.attrClassName))
                        .setClassName(_DataTable._getAttribute($element, _Column._const.attrClassName))
                        .setEditable(_DataTable._getBooleanAttribute($element, _Column._const.attrEditable))
                        .setCreate(_DataTable._getBooleanAttribute($element, _Column._const.attrCreate))
                        .setOrderable(_DataTable._getBooleanAttribute($element, _Column._const.attrOrderable))
                        .setOrderSequence(_DataTable._getAttribute($element, _Column._const.attrOrderSequence))
                        .setSearchable(_DataTable._getBooleanAttribute($element, _Column._const.attrSearchable))
                        .setImageSrc(imageSrc)
                        .setVisible(_DataTable._getBooleanAttribute($element, _Column._const.attrVisible))
                        .setType(
                            _DataTable._getAttribute($element, _Column._const.attrType),
                            options,
                            _DataTable._getAttribute($element, _Column._const.attrDefaultValue)
                        )
                    ;
                    var width = _DataTable._getAttribute($element, _Column._const.attrWidth);
                    if (Fn._isStringNotEmpty(width)) {
                        column.setWidth(
                            _DataTable._getAttribute($element, _Column._const.attrWidth)
                        );
                    }
                }
                if (column instanceof Column) {

                    arrayColumn.push(column);
                }
            }
        });
        if(_DataTable.debug){
            console.log(arrayColumn);
        }
        return arrayColumn;
    },

    _validColor: function (color) {
        return /^#[0-9A-F]{6}$/i.test(color);
    },

    _renderOption: function (options) {
        return function render(data) {
            var returnValue = data;
            if (options !== null && typeof options === typeof {}) {

                $.each(options, function (key, element) {
                    if (options[key] === data) {
                        returnValue = key;
                    }
                });
            }
            return returnValue;
        }
    },

    _getSpecialColumn: function (columnClass) {
        switch (columnClass.trim()) {
            case "details":
                return _Column._getDetailColumn(columnClass);
            case "editRemove":
                return _Column._getEditRemoveColumn();
            default :
                return new Column(columnClass);
        }
    },

    _getEditRemoveColumn: function () {
        var col = _Column._initSpecialColumn();
        return col
            .addClass("editRemove")
            .setDefaultContent('<i class="far fa-edit edit text-confirm text-sm"></i><i class="far fa-trash-alt remove text-confirm text-sm"></i>')
            .setOrderable(false)
            ;
    },

    _getDetailColumn: function (className) {
        var col = _Column._initSpecialColumn();
        return col.addClass(className).setWidth("30px").setOrderable(false);
    },

    _initSpecialColumn: function () {
        return new Column("NULL");
    },

    _editRemoveControlInit: function (tableId, editor, translation) {
        var $table = $('#' + tableId + ' tbody');
        if ($table.length > 0) {
            $table
                .on('click', 'tr td i.edit', function (e) {
                    e.preventDefault();
                    editor.edit($(this).closest('tr'), {
                        title: translation.edit.title,
                        buttons: translation.edit.submit
                    });
                })
                .on('mouseenter', "td i.edit", function () {

                    $(this).tooltip({
                        title: translation.edit.button
                    }).tooltip('show');
                })
            ;

            // Delete a record
            $table
                .on('click', 'i.remove', function (e) {
                    e.preventDefault();
                    editor.remove($(this).closest('tr'), {
                        title: translation.remove.title,
                        message: translation.remove.confirm[1],
                        buttons: translation.remove.submit,
                        submit: translation.remove.submit
                    });
                })
                .on('mouseenter', "td i.remove", function () {
                    $(this).tooltip({
                        title: translation.remove.button
                    }).tooltip('show');
                })
            ;
        }
    },

    _detailControlInit: function (tableId, dataTable, translation) {
        var shownClass = "shown";
        var $table = $('#' + tableId + ' tbody');
        $table
            .on('click', "tr td.details", function (e) {
                e.preventDefault();
                var tr = $(this).closest('tr');
                var row = dataTable.row(tr);

                if (row.child.isShown()) {
                    row.child.remove();
                    tr.removeClass(shownClass);
                    _Table._collapseAllRow(tableId, dataTable);
                }
                else {
                    var ajaxData = {
                        _t: dataTable.ajax.params()._t,
                        _lang: dataTable.ajax.params()._lang,
                        data: row.data()
                    };

                    $.post("/admin/_api/details/", ajaxData)
                        .done(function (data) {
                            if (data !== "") {
                                _Table._collapseAllRow(tableId, dataTable);
                                row.child(data).show();
                                tr.addClass(shownClass);
                            }
                        });
                }
            })
            .on('mouseenter', "td.details", function () {
                $(this).tooltip("dispose");
                $(this).tooltip({
                    title: translation._custom.tooltip.details
                }).tooltip('show');
            })
        ;
    }
};

var _Editor = {
    debug : false,
    _event: {
        read: "read",
        preOpen: "preOpen",
        open: "open",
        initSubmit: "initSubmit",
        preSubmit: "preSubmit",
        postSubmit: "postSubmit",
        preClose: "preClose",
        close: "close",
        submitSuccess: "submitSuccess",
        processing: "processing",
        submitComplete: "submitComplete",
        submitError : "submitError",
        submitUnsuccessful : "submitUnsuccessful",
        initCreate: "initCreate",
        preCreate: "preCreate",
        create: "create",
        postCreate: "postCreate",
        initEdit: "initEdit",
        preEdit: "preEdit",
        edit: "edit",
        postEdit: "postEdit",
        initRemove: "initRemove",
        preRemove: "preRemove",
        remove: "remove",
        postRemove: "postRemove",
        initEditor: "initEditor",
        preUpload: "preUpload",
        preUploadCancelled: "preUploadCancelled",
        uploadXhrError: "uploadXhrError",
        uploadXhrSuccess: "uploadXhrSuccess",
        postUpload: "postUpload"
    },

    /**
     *
     * @param dataTableEditor
     * @param arrayFields
     * @public
     */
    _enableField: function (dataTableEditor, arrayFields) {
        if (dataTableEditor instanceof $.fn.DataTable.Editor) {
            dataTableEditor
                .on(_Editor._event.initCreate, function () {
                    arrayFields.forEach(function (item) {
                        var create = true;
                        if (item.hasOwnProperty("create")) {
                            create = Boolean((item["create"]));
                        }
                        if (create) {
                            dataTableEditor.field(item.name).enable().show();
                        } else {
                            dataTableEditor.field(item.name).disable().hide();
                        }
                    });
                })
                .on(_Editor._event.initEdit, function () {
                    arrayFields.forEach(function (item) {
                        var edit = true;
                        if (item.hasOwnProperty("edit")) {
                            edit = Boolean((item["edit"]));
                        }
                        if (edit) {
                            dataTableEditor.field(item.name).enable().show();
                        } else {
                            dataTableEditor.field(item.name).disable().hide();
                        }
                    });
                })
            ;
        }
    },

    /**
     *
     * @param tableId
     * @param editor
     * @public
     */
    _inlineEdit: function (tableId, editor) {
        var arrayDebug = [];
        var $table = $('#' + tableId);
        arrayDebug.editor = editor;
        if ($table.length > 0 && editor !== null) {
            $table.on('click', 'tbody td.editable', function () {
                arrayDebug.elem = this;
                editor.inline(this);
            });
        }
    },

    /**
     *
     * @param tableId
     * @param editor
     * @public
     */
    _bubbleEdit: function (tableId, editor) {
        var arrayDebug = [];
        var $table = $('#' + tableId);
        arrayDebug.editor = editor;
        if ($table.length > 0 && editor !== null) {
            $table.on('click', 'tbody td.editable', function () {
                arrayDebug.elem = this;
                editor.bubble(this);
            });
        }
    }
};

var _Field = {
    debug : false
};

var _Button = {
    /**
     *
     * @type {{cog: string, list: string, magic: string}}
     * @private
     */
    _icon: {
        cog: '<i class="fa fa-cog"></i>',
        list: '<i class="fab fa-searchengin"></i>',
        magic: '<i class="fas fa-magic"></i>'
    },

    /**
     *
     * @param editor
     * @param extend
     * @param text
     * @param title
     * @param className
     * @returns {{}}
     * @public
     */
    _extend: function (editor, extend, text, title, className) {
        var obj = {};
        obj.editor = editor;
        obj.extend = extend;
        obj.text = text;
        obj.attr = {
            "data-toggle": "tooltip",
            "data-placement": "top",
            "data-original-title": title
        };
        obj.className = className;
        return obj;
    },

    /**
     *
     * @param text
     * @param action
     * @param title
     * @param className
     * @returns {{}}
     * @private
     */
    _create: function (text, action, title, className) {
        var obj = {};
        obj.text = text;
        if ( Fn._isFunction(action) ) {
            obj.action = action;
        }
        obj.className = className;
        obj.attr = {
            "data-toggle": "tooltip",
            "data-placement": "top",
            "data-original-title": title
        };
        return obj;
    },

    /**
     *
     */
    _list: function () {
        return _Button._create(
            _Button._icon.magic,
            function (event, dataTable, node, config) {
                var arrayDebug = [];
                arrayDebug.event = event;
                arrayDebug.dataTable = dataTable;
                arrayDebug.node = node;
                arrayDebug.config = config;
            },
            "lister"
        );
    },
    _appendControlButton: function (dataTable, buttons) {
        new $.fn.DataTable.Buttons(dataTable, buttons);
        dataTable.buttons().container()
            .appendTo($('div.dt-btn-container'));
    }
};

var _Translation = {
    /**
     *
     * @param language
     * @returns {*}
     * @public
     */
    _get: function (language) {
        switch (language) {
            case _DataTable._language.fr :
                return _Translation.fr;
            case _DataTable._language.nl :
                return _Translation.nl;
            case _DataTable._language.de :
                return _Translation.de;
            default :
                return _Translation.en;
        }
    },

    en: {
        "sEmptyTable": "No data available in table",
        "sInfo": "_START_ to _END_ / _TOTAL_ entries",
        "sInfoEmpty": "Showing 0 to 0 of 0 entries",
        "sInfoFiltered": "(_MAX_ total entries)",
        "sInfoPostFix": "",
        "sInfoThousands": ",",
        "sLengthMenu": "Show _MENU_ entries",
        "sLoadingRecords": "Loading...",
        "sProcessing": "Processing...",
        "sSearch": "Search :",
        "sZeroRecords": "No matching records found",
        "oPaginate": {
            "sFirst": "First",
            "sLast": "Last",
            "sNext": "Next",
            "sPrevious": "Previous"
        },
        "oAria": {
            "sSortAscending": ": activate to sort column ascending",
            "sSortDescending": ": activate to sort column descending"
        },

        "locale": "en",

        "cancel": "cancel",
        "apply": "apply",
        "select": {
            "rows": {
                "_": "(%d elements selected)",
                "0": "0 element selected",
                "1": "1 element selected"
            }
        },
        "menuText": {
            "all": "All"
        },


        "selectPlaceHolder": "please select",


        "create": {
            "button": "Add",
            "title": "Add item",
            "submit": "Add"
        },
        "reorder" : {
            "button" : "Reorder"
        },

        "edit": {
            "button": "Edit",
            "title": "Edit item",
            "submit": "Save"
        },

        "remove": {
            "button": "Delete",
            "title": "Delete item",
            "submit": "Delete",
            "confirm": {
                "_": "Delete %d item(s)?",
                "1": "Delete 1 Delete?"
            }
        },
        "print": {
            "button": "Print"
        },
        "excel": {
            "button": "Excel"
        },
        "pdf": {
            "button": "Pdf"
        },

        "error": {
            "system": "Une erreur est survenue (Plus d'informations)"
        },

        "multi": {
            "title": "Valeur multiple",
            "info": "Les éléments sélectionnés contiennent des valeurs différentes pour ce champ. " +
            "Pour éditer et définir tous les éléments de ce champ avec la même valeur, cliquez ou tapez ici, sinon ils conserveront leurs valeurs individuelles.",
            "restore": "Annuler les changements",
            "noMulti": "Cet élément peut être modifiée individuellement, mais ne fait pas partie d'un groupe."
        },

        "datetime": {
            "day": "day(s)",
            "hour": "hour(s)",
            "minute": "minute(s)",
            "previous": "Précédent",
            "next": "Suivant",
            "months": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
            "weekdays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "amPm": ["am", "pm"],
            "unknown": "-"
        },
        "clickToEdit": "click to edit",
        "enterToSave": "press enter to save",
        "upload": {
            "uploadText": "Choose file",
            "clearText": "Clear",
            "dragDropText": "Drag and drop a file here to upload",
            'noImageText': "No image",
            'noFileText': "No file",
            "fileReadText" : "uploading file"
        },

        "_custom": {
            "tooltip": {
                "clickToEdit": "click to edit",
                "enterToSave": "press enter to save",
                "details": "details",
                "clickToSelect": "click to select",
                "clickToUnSelect": "click to deselect"
            },
            "button": {
                "selectAll": 'select all',
                "selectNone": 'select none'
            }
        }
    },


    fr: {
        "sEmptyTable": "Aucune donnée disponible dans le tableau",
        "sInfo": " _START_ à _END_ / _TOTAL_ éléments",
        "sInfoEmpty": "0 à 0 sur 0 élément",
        "sInfoFiltered": "(_MAX_ éléments au total)",
        "sInfoPostFix": "",
        "sInfoThousands": ",",
        "sLengthMenu": "Afficher _MENU_ éléments",
        "sLoadingRecords": "Chargement...",
        "sProcessing": "Traitement...",
        "sSearch": "Rechercher :",
        "sZeroRecords": "Aucun élément correspondant trouvé",
        "oPaginate": {
            "sFirst": "Premier",
            "sLast": "Dernier",
            "sNext": "Suivant",
            "sPrevious": "Précédent"
        },
        "oAria": {
            "sSortAscending": ": activer pour trier la colonne par ordre croissant",
            "sSortDescending": ": activer pour trier la colonne par ordre décroissant"
        },

        "locale": "fr",
        "cancel": "annuler",
        "apply": "appliquer",
        "select": {
            "rows": {
                "_": "(%d éléments sélectionnés)",
                "0": "Aucun élément sélectionné",
                "1": "1 élément sélectionné"
            }
        },


        "menuText": {
            "all": "Tout"
        },
        "selectPlaceHolder": "veuillez sélectionner",


        "create": {
            "button": "Ajouter",
            "title": "Ajouter élément",
            "submit": "Ajouter"
        },
        "reorder" : {
            "button" : "Réorganiser"
        },

        "edit": {
            // "button": "Éditer",
            "button": "Éditer",
            "title": "Éditer élément",
            "submit": "Sauvegarder"
        },

        "remove": {
            "button": "Supprimer",
            "title": "Suppression élément",
            "submit": "Supprimer",
            "confirm": {
                "_": "Supprimer %d élément(s)?",
                "1": "Supprimer 1 élément?"
            }
        },
        "print": {
            "button": "Imprimer"
        },
        "excel": {
            "button": "Excel"
        },
        "pdf": {
            "button": "Pdf"
        },

        "error": {
            "system": "Une erreur est survenue (Plus d'informations)"
        },

        "multi": {
            "title": "Valeur multiple",
            "info": "Les éléments sélectionnés contiennent des valeurs différentes pour ce champ. " +
            "Pour éditer et définir tous les éléments de ce champ avec la même valeur, cliquez ou tapez ici, sinon ils conserveront leurs valeurs individuelles.",
            "restore": "Annuler les changements",
            "noMulti": "Cet élément peut être modifiée individuellement, mais ne fait pas partie d'un groupe."
        },

        "datetime": {
            "day": "jour(s)",
            "hour": "heure(s)",
            "minute": "minute(s)",
            "previous": "Précédent",
            "next": "Suivant",
            "months": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
            "weekdays": ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
            "amPm": ["am", "pm"],
            "unknown": "-"
        },
        "clickToEdit": "Cliquer pour éditer",
        "enterToSave": "Appuyer sur 'entrer' pour sauvegarder",
        "upload": {
            "uploadText": "choisir fichier",
            "clearText": "effacer",
            "dragDropText": "déposez un fichier ici pour le télécharger",
            'noImageText': "pas d'image",
            'noFileText': "pas de fichier",
            "fileReadText" : "chargement"
        },

        "_custom": {
            "tooltip": {
                "clickToEdit": "Cliquer pour éditer",
                "enterToSave": "Appuyer sur 'entrer' pour sauvegarder",
                "details": "Détail",
                "clickToSelect": "cliquer pour sélectionner",
                "clickToUnSelect": "cliquer pour désélectionner"
            },
            "button": {
                "selectAll": 'Tout sélectionner',
                "selectNone": 'Tout désélectionner'
            }
        }

    },

    nl: {

        "sProcessing": "Bezig...",
        "sLengthMenu": "_MENU_ resultaten weergeven",
        "sZeroRecords": "Geen resultaten gevonden",
        "sInfo": "_START_ tot _END_ / _TOTAL_ resultaten",
        "sInfoEmpty": "Geen resultaten om weer te geven",
        "sInfoFiltered": " (_MAX_ resultaten)",
        "sInfoPostFix": "",
        "sSearch": "Zoeken:",
        "sEmptyTable": "Geen resultaten aanwezig in de tabel",
        "sInfoThousands": ".",
        "sLoadingRecords": "Een moment geduld aub - bezig met laden...",
        "oPaginate": {
            "sFirst": "Eerste",
            "sLast": "Laatste",
            "sNext": "Volgende",
            "sPrevious": "Vorige"
        },
        "oAria": {
            "sSortAscending": ": activeer om kolom oplopend te sorteren",
            "sSortDescending": ": activeer om kolom aflopend te sorteren"
        },


        "locale": "nl",

        "cancel": "cancel",
        "apply": "apply",
        "select": {
            "rows": {
                "_": "(%d resultat sélectionnées)",
                "0": "Aucune ligne sélectionnée",
                "1": "1 ligne sélectionnée"
            }
        },

        "menuText": {
            "all": "Alles"
        },
        "selectPlaceHolder": "please select",


        "reorder" : {
            "button" : "Reorder"
        },

        "create": {
            "button": "Ajouter",
            "title": "Ajouter nouveau élément",
            "submit": "Ajouter"
        },

        "edit": {
            "button": "Bewerk",
            "title": "Bewerk item(s)",
            "submit": "Bewerk"
        },

        "remove": {
            "button": "verwijderen",
            "title": "verwijderen item(s)",
            "submit": "verwijderen",
            "confirm": {
                "_": "Are you sure you wish to delete %d rows?",
                "1": "Are you sure you wish to delete 1 row?"
            }
        },
        "print": {
            "button": "Print"
        },
        "excel": {
            "button": "Excel"
        },
        "pdf": {
            "button": "Pdf"
        },

        "error": {
            "system": "A system error has occurred (More information)"
        },

        "multi": {
            "title": "Multiple values",
            "info": "The selected items contain different values for this input. To edit and set all items for this input to the same value, click or tap here, otherwise they will retain their individual values.",
            "restore": "Undo changes",
            "noMulti": "This input can be edited individually, but not part of a group."
        },

        "datetime": {
            "day": "day(s)",
            "hour": "hour(s)",
            "minute": "minute(s)",
            "previous": "Previous",
            "next": "Next",
            "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "weekdays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "amPm": ["am", "pm"],
            "unknown": "-"
        },
        "clickToEdit": "click to edit",
        "enterToSave": "press enter to save",
        "upload": {
            "uploadText": "Choose file",
            "clearText": "Clear",
            "dragDropText": "Drag and drop a file here to upload",
            'noImageText': "No image",
            'noFileText': "No file",
            "fileReadText" : "uploading file"
        },

        "_custom": {
            "tooltip": {
                "clickToEdit": "click to edit",
                "enterToSave": "press enter to save",
                "details": "details",
                "clickToSelect": "click to select",
                "clickToUnSelect": "click to deselect"
            },
            "button": {
                "selectAll": 'select all',
                "selectNone": 'select none'
            }
        }
    },

    de: {
        "sEmptyTable": "Keine Daten in der Tabelle vorhanden",
        "sInfo": "_START_ bis _END_ / _TOTAL_ Einträgen",
        "sInfoEmpty": "Keine Daten vorhanden",
        "sInfoFiltered": "(_MAX_ Einträgen)",
        "sInfoPostFix": "",
        "sInfoThousands": ".",
        "sLengthMenu": "_MENU_ Einträge anzeigen",
        "sLoadingRecords": "Wird geladen ..",
        "sProcessing": "Bitte warten ..",
        "sSearch": "Suchen",
        "sZeroRecords": "Keine Einträge vorhanden",
        "oPaginate": {
            "sFirst": "Erste",
            "sPrevious": "Zurück",
            "sNext": "Nächste",
            "sLast": "Letzte"
        },
        "oAria": {
            "sSortAscending": ": aktivieren, um Spalte aufsteigend zu sortieren",
            "sSortDescending": ": aktivieren, um Spalte absteigend zu sortieren"
        },

        "locale": "de",
        "select": {
            "rows": {
                "_": "%d Zeilen ausgewählt",
                "0": "",
                "1": "1 Zeile ausgewählt"
            }
        },

        "apply": "apply",
        "cancel": "cancel",

        "buttons": {
            "print": "Drucken",
            "colvis": "Spalten",
            "copy": "Kopieren",
            "copyTitle": "In Zwischenablage kopieren",
            "copyKeys": "Taste <i>ctrl</i> oder <i>\u2318</i> + <i>C</i> um Tabelle<br>in Zwischenspeicher zu kopieren.<br><br>Um abzubrechen die Nachricht anklicken oder Escape drücken.",
            "copySuccess": {
                "_": "%d Zeilen kopiert",
                "1": "1 Zeile kopiert"
            },
            "pageLength": {
                "-1": "Zeige alle Zeilen",
                "_": "Zeige %d Zeilen"
            }
        },


        "menuText": {
            "all": "Alle"
        },
        "selectPlaceHolder": "please select",


        "reorder" : {
            "button" : "Reorder"
        },

        "create": {
            "button": "Add",
            "title": "Ajouter nouveau élément",
            "submit": "Ajouter"
        },

        "edit": {
            "button": "Éditer",
            "title": "Éditer élément(s)",
            "submit": "Éditer"
        },

        "remove": {
            "button": "supprimer",
            "title": "Supprimer élément(s)",
            "submit": "supprimer",
            "confirm": {
                "_": "Are you sure you wish to delete %d rows?",
                "1": "Are you sure you wish to delete 1 row?"
            }
        },
        "print": {
            "button": "Print"
        },
        "excel": {
            "button": "Excel"
        },
        "pdf": {
            "button": "Pdf"
        },

        "error": {
            "system": "A system error has occurred (More information)"
        },

        "multi": {
            "title": "Multiple values",
            "info": "The selected items contain different values for this input. To edit and set all items for this input to the same value, click or tap here, otherwise they will retain their individual values.",
            "restore": "Undo changes",
            "noMulti": "This input can be edited individually, but not part of a group."
        },

        "datetime": {
            "day": "day(s)",
            "hour": "hour(s)",
            "minute": "minute(s)",
            "previous": "Previous",
            "next": "Next",
            "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "weekdays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "amPm": ["am", "pm"],
            "unknown": "-"
        },
        "clickToEdit": "click to edit",
        "enterToSave": "press enter to save",
        "upload": {
            "uploadText": "Choose file",
            "clearText": "Clear",
            "dragDropText": "Drag and drop a file here to upload",
            'noImageText': "No image",
            'noFileText': "No file",
            "fileReadText" : "uploading file"
        },

        "_custom": {
            "tooltip": {
                "clickToEdit": "click to edit",
                "enterToSave": "press enter to save",
                "details": "details",
                "clickToSelect": "click to select",
                "clickToUnSelect": "click to deselect"
            },
            "button": {
                "selectAll": 'select all',
                "selectNone": 'select none'
            }
        }


    }
};


var Table = function (idSelector, tableName, title) {
    var thisTable = this;
    thisTable.idSelector = _Table._defIdSelector;
    thisTable.idSrc = "";
    thisTable.title = "";
    thisTable.tableIndex = "";
    thisTable.rowReorder = "";
    thisTable.arrayColumn = [];
    thisTable.arrayButton = [];
    thisTable.ajaxUrl = _DataTable.ajaxUrl;
    thisTable.create = true;
    thisTable.edit = true;
    thisTable.remove = true;
    thisTable.pdf = false;
    thisTable.excel = false;
    thisTable.print = false;
    thisTable.filterHead = false;
    thisTable.controlColumn = false;
    thisTable.editType = _Table._editType.def;
    thisTable.language = _Table._language.def;
    if (Fn._isSameType(idSelector, "")) {
        thisTable.idSelector = idSelector;
    }
    if (Fn._isSameType(tableName, "")) {
        thisTable.tableName = tableName;
    }
    if (Fn._isSameType(title, "")) {
        thisTable.title = title;
    }
    thisTable.editorInstance = null;
    thisTable.dataTableInstance = null;

    /**
     * set the idSrc for DataTable options
     * @param {string} value
     * @returns {Table} Table object for chaining
     */
    thisTable.setIdSrc = function (value) {
        if (_Table.debug) {
            console.log("Table.setIdSrc(value) called", {"value": value});
        }
        thisTable.idSrc = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setIdSelector = function (value) {
        if (_Table.debug) {
            console.log("Table.setIdSelector(value) called", {"value": value});
        }
        thisTable.idSelector = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setTitle = function (value) {
        if (_Table.debug) {
            console.log("Table.setTitle(value) called", {"value": value});
        }
        thisTable.title = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setTableIndex = function (value) {
        if (_Table.debug) {
            console.log("Table.setTableIndex(value) called", {"value": value})
        }
        thisTable.tableIndex = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setArrayButton = function (value) {
        if (_Table.debug) {
            console.log("Table.setArrayButton(value) called", {"value": value})
        }
        thisTable.arrayButton = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setArrayColumn = function (value) {
        if (_Table.debug) {
            console.log("Table.setArrayColumn(value) called", {"value": value})
        }
        thisTable.arrayColumn = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setCreate = function (value) {
        if (_Table.debug) {
            console.log("Table.setCreate(value) called", {"value": value})
        }
        thisTable.create = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setEdit = function (value) {
        if (_Table.debug) {
            console.log("Table.setEdit(value) called", {"value": value})
        }
        thisTable.edit = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setRemove = function (value) {
        if (_Table.debug) {
            console.log("Table.setRemove(value) called", {"value": value})
        }
        thisTable.remove = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setPdf = function (value) {
        if (_Table.debug) {
            console.log("Table.setPdf(value) called", {"value": value})
        }
        thisTable.pdf = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setExcel = function (value) {
        if (_Table.debug) {
            console.log("Table.setExcel(value) called", {"value": value})
        }
        thisTable.excel = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setPrint = function (value) {
        if (_Table.debug) {
            console.log("Table.setPrint(value) called", {"value": value})
        }
        thisTable.print = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setAjaxUrl = function (value) {
        if (_Table.debug) {
            console.log("Table.setAjaxUrl(value) called", {"value": value})
        }
        thisTable.ajaxUrl = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setRowReorder = function (value) {
        if (_Table.debug) {
            console.log("Table.setFilterHead(value) called", {"value": value})
        }
        thisTable.rowReorder = value;
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setFilterHead = function (value) {
        if (_Table.debug) {
            console.log("Table.setFilterHead(value) called", {"value": value})
        }
        thisTable.filterHead = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setControlColumn = function (value) {
        if (_Table.debug) {
            console.log("Table.setControlColumn(value) called", {"value": value})
        }
        thisTable.controlColumn = Boolean(value);
        return thisTable;
    };

    /**
     *
     * @returns {*}
     */
    thisTable.editInline = function () {
        if (_Table.debug) {
            console.log("Table.editInline() called")
        }
        return thisTable.setEditType(_Table._editType.inline);
    };

    /**
     *
     * @returns {*}
     */
    thisTable.editBubble = function () {
        if (_Table.debug) {
            console.log("Table.editBubble() called")
        }
        return thisTable.setEditType(_Table._editType.bubble);
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setEditType = function (value) {
        if (_Table.debug) {
            console.log("Table.setEditType(value) called", {"value": value})
        }
        value = parseInt(value);
        if (Fn._inObject(value, _Table._editType)) {
            thisTable.editType = value;
        }
        return thisTable;
    };

    /**
     *
     * @param value
     * @returns {Table}
     */
    thisTable.setLanguage = function (value) {
        if (Fn._inObject(value, _DataTable._language)) {
            thisTable.language = value;
        } else {
            thisTable.language = _Table._language.def;
        }
        if (_Table.debug) {
            console.log("Table.setLanguage(value) called", {"value": value}, {language: thisTable.language})
        }
        return thisTable;
    };

    /**
     *
     * @param button
     * @returns {Table}
     */
    thisTable.button = function (button) {
        if (_Table.debug) {
            console.log("Table.button() called", {"button": button})
        }
        if (Fn._isFunction(button.action)) {
            return addButton(button);
        }
        return thisTable;
    };

    thisTable.setImageSrc = function (imageSrc) {
        imageSrc = Fn._isStringNotEmpty(imageSrc) ? imageSrc : "";
        thisTable.imageSrc = imageSrc;
        return thisTable;
    };

    /**
     *
     * @param {String} data
     * @param title
     * @param editable
     * @param orderable
     * @param searchable
     * @param visible
     * @param type
     * @param options
     * @param def
     * @param className
     * @returns {Table} return this for chaining
     */
    thisTable.column = function (data, title, editable, orderable, searchable, visible, type, options, def, className) {
        if (_Table.debug) {
            console.log("Table.column() called", {
                "data": data,
                "title": title,
                "editable": editable,
                "orderable": orderable,
                "searchable": searchable,
                "visible": visible,
                "type": type,
                "options": options,
                "def": def,
                "className": className
            })
        }
        var column = new Column(data, title);
        column
            .setOrderable(orderable)
            .setEditable(editable)
            .setSearchable(searchable)
            .setVisible(visible)
            .setType(type, options, def)
            .addClass(className)
        ;
        if (Fn._isNotUndefined(type) && Fn._isNotUndefined(options) && Fn._isNotUndefined(def)) {
            column.setType(type, options, def);
        }
        if (Fn._isNotUndefined(className)) {
            column.addClass(className);
        }
        return addColumn(column);
    };

    /**
     * @returns {number}
     */
    thisTable.getColumnIndexOrder = function () {
        if (_Table.debug) {
            console.log("Table.getColumnIndexOrder() called")
        }
        var columns = thisTable.arrayColumn;
        var found = false;
        for (var index = 0; index < columns.length; index++) {
            var element = columns[index];
            if (element.orderable === true && element.visible === true) {
                found = true;
                return index;
            }
        }
        return -1;
    };

    /**
     *
     * @returns {DataTable}
     */
    thisTable.dataTable = function (editor) {
        if (_Table.debug) {
            console.log("Table.dataTable() called");
        }
        var arrayDebug = [];
        var dataTable = null;
        var tableId = thisTable.idSelector;
        var $table = $("#" + tableId);
        arrayDebug.table = $table;

        var tableIndex = thisTable.tableIndex;
        arrayDebug.tableIndex = tableIndex;

        var columns = thisTable.arrayColumn;
        arrayDebug.columns = columns;


        if (thisTable.controlColumn) {
            var controlColumn = null;
            var controlColumnContent = "";
            if (thisTable.edit) {
                controlColumnContent += "<i class='far fa-edit edit text-confirm text-sm'></i>";
            }
            if (thisTable.remove) {
                controlColumnContent += "<i class='far fa-trash-alt remove text-confirm text-sm'></i>";
            }
            if (thisTable.edit || thisTable.remove) {
                controlColumn = _Column._initSpecialColumn();
                controlColumn.addClass("editRemove").setDefaultContent(controlColumnContent).setWidth("40px");
            }
            if (controlColumn !== null && controlColumn instanceof Column) {
                columns.unshift(controlColumn);
            }
        }

        var language = thisTable.language;
        arrayDebug.language = language;
        if (
            columns.length > 0 &&
            typeof tableIndex === typeof "" &&
            tableIndex !== "" &&
            $table.length > 0
        ) {
            var translation = _Translation._get(language);
            $.each(columns, function (index, element) {
                var columnRender = _Column._getColumnRender(element.type, element.options, editor, element);
                element.setRender(columnRender);
            });
            var options = getOptions(tableIndex, columns, language);
            if (Fn._isStringNotEmpty(thisTable.rowReorder) && editor) {
                options.rowReorder = {
                    dataSrc: thisTable.rowReorder,
                    selector: '.reorder',
                    editor: editor
                };
            }

            _Table._clearHeadHtml(tableId);
            _Table._printTableTitle(thisTable.title);

            dataTable = $table.DataTable(options);
            if (dataTable !== null) {
                _Column._detailControlInit(tableId, dataTable, translation);
                _Table._initDataTableEvent(dataTable);
            }

            if (thisTable.filterHead) {
                _DataTable._displayFilterHead(thisTable.idSelector, dataTable, columns);
            }

        }
        thisTable.dataTableInstance = dataTable;
        return dataTable;
    };

    /**
     * Create data editor with this options
     * @returns {Editor}
     */
    thisTable.editor = function () {
        if (_Table.debug) {
            console.log("Table.editor() called");
        }
        var tableIndex = thisTable.tableIndex;
        var idSrc = thisTable.idSrc;
        var imageSrc = thisTable.imageSrc;
        var idSelector = thisTable.idSelector;
        var url = thisTable.ajaxUrl;
        var language = thisTable.language;
        var arrayColumn = thisTable.arrayColumn;
        var obj = null;
        if (Fn._isStringNotEmpty(tableIndex) && arrayColumn.length > 0) {
            var editor = new Editor(
                tableIndex, idSrc, idSelector, language, url, imageSrc
            );
            obj = editor.dataEditor(arrayColumn);
        }
        if (_Table.debug) {
            console.log("Table.editor() called", {Table: thisTable});
        }
        thisTable.editorInstance = obj;
        return obj;
    };

    thisTable.getEditor = function () {
        return thisTable.editorInstance;
    };

    thisTable.getDataTable = function () {
        return thisTable.dataTableInstance;
    };

    /**
     *
     */
    thisTable.draw = function () {
        if (_Table.debug) {
            console.log("Table.draw() called");
        }
        var create = thisTable.create;

        var edit = thisTable.edit;

        var remove = thisTable.remove;

        var tableId = thisTable.idSelector;

        var translation = _Translation._get(thisTable.language);

        var tableEditType = thisTable.editType;
        var editor = thisTable.editor();
        if (editor !== null) {
            var dataTable = thisTable.dataTable(editor);
            switch (tableEditType) {
                case _Table._editType.inline :
                    _Editor._inlineEdit(tableId, editor);
                    break;
                case _Table._editType.bubble :
                    _Editor._bubbleEdit(tableId, editor);
                    break;
            }
            if (tableEditType !== _Table._editType.def && edit) {
                _Table._editableCellTooltip(tableId, translation);
            }
            editor.on(_Editor._event.initEdit, function (e, json, data, id) {
                console.log(_Editor._event.initEdit + " called()");
                _Table._collapseAllRow(tableId, dataTable);
            });

            var buttons = getButtons(editor);
            if (_Table.debug) {
                console.log({
                    "buttons": buttons
                });
            }

            if (buttons.length > 0) {
                _Button._appendControlButton(dataTable, buttons);
                $('[data-toggle="tooltip"]').tooltip();
            }
            _Column._editRemoveControlInit(tableId, editor, translation);

        }

        if (_Table.debug) {
            console.log("Table() called", {Table: thisTable});
        }
        return thisTable;
    };


    /**
     *
     * @param column
     * @returns {Table}
     */
    function addColumn(column) {
        if (_Table.debug) {
            console.log("Table.addColumn() called")
        }
        if (column instanceof Column) {
            var arrayColumn = thisTable.arrayColumn;
            var found = false;
            arrayColumn.forEach(function (item) {
                if (item instanceof Column) {
                    if (item.data === column.data) {
                        found = true;
                    }
                }
            });
            if (!found) {
                arrayColumn.push(column);
            }
            thisTable.setArrayColumn(arrayColumn);
        }
        return thisTable;
    }

    /**
     *
     * @param {object} button
     * @returns {Table} return this for chaining
     */
    function addButton(button) {
        if (_Table.debug) {
            console.log("Table.addButton() called", {"button": button})
        }
        var arrayButton = thisTable.arrayButton;
        arrayButton.push(button);
        return thisTable.setArrayButton(arrayButton);
    }

    /**
     *
     * @param {Editor} editor
     * @returns {Array}
     */
    function getButtons(editor) {
        if (_Table.debug) {
            console.log("Table.getButtons(editor) called");
            console.log({
                "editor": editor
            });
            console.log("");
        }
        var buttons = [];
        var translation = _Translation._get(thisTable.language);

        if (thisTable.create) {
            buttons.push(_Button._extend(editor, "create", '<i class="fas fa-plus-circle text-confirm text-sm"></i>', translation.create.button));
        }
        if (thisTable.edit) {
            buttons.push(_Button._extend(editor, "edit", '<i class="far fa-edit text-confirm text-sm"></i>', translation.edit.button));
        }
        if (thisTable.remove) {
            buttons.push(_Button._extend(editor, "remove", '<i class="far fa-trash-alt text-confirm text-sm"></i>', translation.remove.button));
        }
        if (thisTable.print) {
            buttons.push(_Button._extend(editor, "print", '<i class="fas fa-print text-confirm text-sm"></i>', translation.print.button));
        }
        if (thisTable.pdf) {
            buttons.push(_Button._extend(editor, "pdf", '<i class="far fa-file-pdf text-confirm text-sm"></i>', translation.pdf.button));
        }
        if (thisTable.excel) {
            buttons.push(_Button._extend(editor, "excel", '<i class="fa fa-file-excel text-confirm text-sm"></i>', translation.excel.button));
        }
        buttons.push(_Button._extend(editor, "selectAll", '<span class="fa-stack fa-xs text-sm">' +
            '  <i class="far fa-square fa-stack-2x"></i>' +
            '  <i class="fas fa-check-double fa-stack-1x fa-inverse"></i>' +
            '</span>', translation._custom.button.selectAll));
        buttons.push(_Button._extend(editor, "selectNone", '<i class="far fa-square text-confirm text-sm"></i>', translation._custom.button.selectNone));
        var arrayButton = thisTable.arrayButton;
        arrayButton.forEach(function (item) {
            buttons.push(item);
        });
        return buttons;
    }

    /**
     * @returns {object}
     */
    function getOptions(tableIndex, columns, language) {
        if (_Table.debug) {
            console.log("Table.getOptions() called")
        }
        var arrayDebug = [];
        var options = _Table._defOptions;

        options.ajax = {
            url: thisTable.ajaxUrl,
            type: "POST",
            data: function (d) {
                d._t = tableIndex;
                d._lang = language;
            }
        };
        options.tableIndex = tableIndex;
        options.columns = columns;
        var orderColumnIndex = thisTable.getColumnIndexOrder();
        if (orderColumnIndex > -1) {
            var orderColumn = columns[orderColumnIndex];
            if(_DataTable.debug){
                console.log(orderColumn);
            }
            var orderSequence = 'asc';
            var orderType = Fn._getObjByProp(orderColumn, "orderType", null);
            if (orderType){
                orderSequence = orderType;
                // orderSequence = orderSequence[0];
                if(_DataTable.debug) {
                    console.log(orderSequence);
                }
            }
            options.order = [[orderColumnIndex, orderSequence]];
        }
        var translation = _Translation._get(language);
        options.language = translation;

        options.lengthMenu = [[25, 50, 100, -1], [25, 50, 100, translation.menuText.all]];
        arrayDebug.tableOptions = options;
        if(_DataTable.debug) {
            console.log(options);
        }
        return options;
    }

    return thisTable;

};

var Column = function (columnIndex, title) {

    var thisColumn = this;
    thisColumn.data = columnIndex;
    var hasIndex = Fn._isStringNotEmpty(columnIndex) && columnIndex !== "NULL";
    if (hasIndex) {
        thisColumn.name = columnIndex;
    }

    var isSpecialIndex = columnIndex === "NULL";
    thisColumn.title = title;


    thisColumn.isSearchable = function () {
        return thisColumn.searchable;
    };

    thisColumn.getData = function () {
        return thisColumn.data;
    };

    thisColumn.setEditable = function (editable) {
        editable = Boolean(editable);
        thisColumn.editable = editable;
        var className = thisColumn.getClassName();
        if (thisColumn.editable) {
            className += _Column._editableClass;
        } else {
            className = className.replace(_Column._editableClass, "");
        }
        return thisColumn.setClassName(className);
    };

    thisColumn.setCreate = function (create) {
        thisColumn.create = Boolean(create);
        return thisColumn;
    };

    thisColumn.setWidth = function (width) {
        thisColumn.width = width;
        return thisColumn;
    };

    thisColumn.setOrderable = function (orderable) {
        thisColumn.orderable = Boolean(orderable);
        return thisColumn;
    };

    thisColumn.setOrderSequence = function (sequence) {
        if(Fn._isStringNotEmpty(sequence)){
            thisColumn.orderType = sequence;
        }
        return thisColumn;
    };

    thisColumn.setSearchable = function (searchable) {
        thisColumn.searchable = Boolean(searchable);
        return thisColumn;
    };

    thisColumn.setImageSrc = function (imageSrc) {
        thisColumn.imageSrc = (imageSrc);
        return thisColumn;
    };

    thisColumn.setVisible = function (visible) {
        thisColumn.visible = Boolean(visible);
        return thisColumn;
    };

    thisColumn.setDefaultContent = function (defaultContent) {
        thisColumn.defaultContent = defaultContent;
        return thisColumn;
    };

    thisColumn.setRender = function (callable) {
        if (Fn._isFunction(callable)) {
            thisColumn.render = callable;
        }
        return thisColumn;
    };

    thisColumn.setDefaultValue = function (def) {
        if (Fn._isStringNotEmpty(def)) {
            thisColumn.defaultValue = def;
        }
        return thisColumn;
    };

    thisColumn.setOptions = function (options) {
        if (Fn._isObject(options)) {
            thisColumn.options = options;
        }
        return thisColumn;
    };

    thisColumn.setType = function (type, options, def) {
        if (Fn._isStringNotEmpty(type) && Fn._inObject(type, _Column._type)) {
            thisColumn.type = type;
            thisColumn.separator = _separator.array;
            thisColumn.setOptions(options);
            thisColumn.setDefaultValue(def);
            var render = _Column._getColumnRender(type, options);
            thisColumn.setRender(render);

            switch (type) {
                case _Column._type.color :
                    thisColumn.setWidth("150px");
                    break;
                case _Column._type.boolean :
                    thisColumn.setWidth("40px");
                    thisColumn.setSearchable(false);
                    break;
                case _Column._type.icon :
                    thisColumn.setWidth("50px");
                    break;
                case _Column._type.flag :
                    thisColumn.setWidth("40px");
                    break;
                case _Column._type.image :
                    thisColumn.setWidth("150px");
                    break;
                case _Column._type.datetime :
                    thisColumn.orderDataType = type;
                    break;
                case _Column._type.time :
                    thisColumn.orderDataType = type;
                    break;
                case _Column._type.date :
                    thisColumn.orderDataType = type;
                    break;
            }
        }

        return thisColumn;
    };

    thisColumn.getClassName = function () {
        return thisColumn.className;
    };

    thisColumn.setClassName = function (className) {
        if (Fn._isSameType(className, "")) {
            thisColumn.className = className;
        }
        return thisColumn;
    };

    thisColumn.addClass = function (className) {
        var columnClassName = thisColumn.getClassName();
        columnClassName = columnClassName !== "" ? columnClassName + " " + className : className;
        return thisColumn.setClassName(columnClassName)
    };


    thisColumn.setClassName("");
    thisColumn.setEditable(hasIndex);
    thisColumn.setOrderable(hasIndex);
    thisColumn.setSearchable(hasIndex);
    thisColumn.setVisible(isSpecialIndex);
    thisColumn.setDefaultContent("");

    return thisColumn;


};

var Editor = function (tableIndex, idSrc, idSelector, language, ajaxUrl, imageSrc) {
    var thisEditor = this;
    if (_Editor.debug) {
        console.log("Editor() called", {
            tableIndex: tableIndex,
            idSrc: idSrc,
            idSelector: idSelector,
            language: language,
            ajaxUrl: ajaxUrl
        })
    }
    thisEditor.tableIndex = tableIndex;
    thisEditor.table = idSelector;
    thisEditor.fields = [];
    thisEditor.imageSrc = Fn._isStringNotEmpty(imageSrc) ? imageSrc : "";
    thisEditor.language = _Table._language.def;
    thisEditor.ajaxUrl = ajaxUrl;
    if (Fn._isStringNotEmpty(idSrc)) {
        thisEditor.idSrc = idSrc;
    }
    if (Fn._inObject(language, _DataTable._language)) {
        thisEditor.language = language;
    }



    /**
     *
     * @returns {*}
     */
    thisEditor.dataEditor = function (arrayColumn) {
        var editor = null;
        if (_Editor.debug) {
            console.log("Editor.dataEditor() called");
        }
        var tableName = thisEditor.tableIndex;

        arrayColumn.forEach(function (item) {
            if (item instanceof Column) {
                if (item.data !== null) {
                    var field = new Field(item.data, item.title, item.editable, item.create, item.type, item.options, item.defaultValue, editor, item.imageSrc);
                    addField(field);
                }
            }
        });
        var arrayFields = thisEditor.fields;
        var idSelector = thisEditor.table;
        var language = thisEditor.language;
        var imageSrc = thisEditor.imageSrc;
        var ajaxUrl = thisEditor.ajaxUrl;
        if (
            tableName !== "" &&
            arrayFields.length > 0 &&
            idSelector !== "" &&
            ajaxUrl !== ""
        ) {
            var options = {
                // ajax: ajaxUrl + tableName + "?" + "action=upload&_lang=" + language,
                ajax: {
                    url: ajaxUrl,
                    type: "POST",
                    data: function (d) {
                        d._t = tableName;
                        d._lang = language;
                    }
                },
                table: "#" + idSelector,
                fields: arrayFields,
                imageSrc: imageSrc
            };
            var translation = _Translation._get(language);
            console.log(options);
            if (Fn._isObject(translation)) {
                options.i18n = translation;
            }
            /**
             *
             * @type {*}
             */
            editor = new $.fn.dataTable.Editor(processOption(options));
            editor.imageSrc = imageSrc;

            function processOption(options) {
                var fields = options.fields;
                $.each(fields, function (index, element) {
                    switch (element.type) {
                        case _Column._type.image:
                            if(_DataTable.debug) {
                                console.log("processOption", element);
                            }
                            var imageSrc = Fn._getObjByProp(element, "imageSrc");
                            var dataSrc = "";
                            var filePathSrc = "";
                            if(Fn._isSameType(imageSrc, [])){
                                if(imageSrc.length > 0 && Fn._isStringNotEmpty(imageSrc[0])){
                                    dataSrc = imageSrc[0];
                                }
                                if(imageSrc.length > 1 && Fn._isStringNotEmpty(imageSrc[1])){
                                    filePathSrc = imageSrc[1];
                                }
                            }
                            if (translation !== null) {
                                element.clearText = translation.upload.clearText;
                                element.noImageText = translation.upload.noImageText;
                                element.dragDropText = translation.upload.dragDropText;
                                element.uploadText = translation.upload.uploadText;
                                element.noFileText = translation.upload.noFileText;
                                element.fileReadText = translation.upload.uploadText;
                            }
                            element.ajax  = "/upload.php";
                            element.display = function (file_id) {
                                console.log(file_id);
                                var file = editor.file(dataSrc, file_id);
                                var filePath = Fn._isStringNotEmpty(file[filePathSrc]) ? file[filePathSrc] : "";
                                if (Fn._isStringNotEmpty(filePath)) {
                                    return file_id ?
                                        '<img class="img-fluid" src="' + filePath + '"/>' :
                                        null;
                                }
                            };
                            break;
                        case _Column._type.uploadMany:
                            if(_DataTable.debug) {
                                console.log("processOption", element);
                            }
                            var src = Fn._getObjByProp(element, "imageSrc");
                            var uploadDataSrc = "";
                            var uploadFilePathSrc = "";
                            if(Fn._isSameType(src, [])){
                                if(src.length > 0 && Fn._isStringNotEmpty(src[0])){
                                    uploadDataSrc = src[0];
                                }
                                if(src.length > 1 && Fn._isStringNotEmpty(src[1])){
                                    uploadFilePathSrc = src[1];
                                }
                            }
                            if (translation !== null) {
                                element.clearText = translation.upload.clearText;
                                element.noImageText = translation.upload.noImageText;
                                element.dragDropText = translation.upload.dragDropText;
                                element.uploadText = translation.upload.uploadText;
                                element.noFileText = translation.upload.noFileText;
                                element.fileReadText = translation.upload.uploadText;
                            }
                            element.display = function (file_id) {
                                var file = editor.file(uploadDataSrc, file_id);
                                var filePath = Fn._isStringNotEmpty(file[uploadFilePathSrc]) ? file[uploadFilePathSrc] : "";
                                if (Fn._isStringNotEmpty(filePath)) {
                                    return file_id ?
                                        '<img class="img-fluid" src="' + filePath + '"/>' :
                                        null;
                                }
                            };
                            break;
                        case _Column._type.select :
                            element.placeholder = translation.selectPlaceHolder;
                            break;
                    }
                    if (_Editor.debug) {
                        console.log(element);
                    }
                });
                return options;
            }

            _Editor._enableField(editor, arrayFields);

            if (_Editor.debug) {
                console.log({editor: editor, thisEditor: thisEditor, arrayFields: arrayFields});
            }
            // var allEvent = _Editor._getAllEvent();
            // console.log(allEvent);
            // $.each(allEvent,function (index, event) {
            //     dataEditor.on(event, function () {
            //         console.log("");
            //         console.log("editor " + event);
            //     });
            // });
            return editor;
        }
        return editor;
    };

    /**
     *
     * @param {Field} field
     * @returns {Editor} return this for chaining
     */
    function addField(field) {
        if (field instanceof Field) {
            var arrayFields = thisEditor.fields;
            var found = false;
            arrayFields.forEach(function (item) {
                if (item instanceof Field) {
                    if (item.name === field.name) {
                        found = true;
                    }
                }
            });
            if (!found) {
                arrayFields.push(field);
            }
            thisEditor.fields = arrayFields;
        }
        return thisEditor;
    }

    return this;

};

var Field = function (name, label, edit, create, type, options, def, editor, imageSrc) {
    var thisField = this;
    thisField.create = Boolean(create);
    thisField.edit = Boolean(edit);
    thisField.name = name;
    thisField.label = label;
    thisField.required = true;
    thisField.imageSrc = imageSrc;
    if (Fn._isStringNotEmpty(type) && Fn._inObject(type, _Column._type)) {
        thisField.type = type;
        thisField.separator = _separator.array;
    }
    if (Fn._isStringNotEmpty(def)) {
        thisField.def = def;
    }
    if (Fn._getObjectLength(options) > 0) {
        thisField.options = options;
    }

    if (_Field.debug) {
        console.log("Field() called", {
            name: name,
            label: label,
            edit: edit,
            type: type,
            options: options,
            def: def
        }, {field: thisField});
    }
    return this;
};


(function ($, DataTable, Log) {

    var _fieldTypesDebug = false;

    var _triggerChange = function (input) {
        var arrayDebug = [];
        arrayDebug[0] = "_triggerChange called";
        arrayDebug.input = input;
        setTimeout(function () {
            input.trigger('change', {editor: true, editorSet: true}); // editorSet legacy
        }, 0);

        Log.trace(arrayDebug, _fieldTypesDebug);
    };

    if (!DataTable.ext.editorFields) {
        DataTable.ext.editorFields = {};
    }

    var Editor = DataTable.Editor;

    var _fieldTypes = DataTable.ext.editorFields;

    var baseFieldType = $.extend(true, {}, Editor.models.fieldType, {
        _debug : false,
        create: function (conf) {
            conf._input = $('<input/>').attr($.extend({
                id: Editor.safeId(conf.id),
                type: 'text'
            }, conf.attr || {}));
            if( _fieldTypesDebug || baseFieldType._debug ){
                console.log("baseFieldType.create(conf)->called", {
                    conf : conf
                });
            }

            return conf._input[0];
        },

        set: function (conf, val) {
            var editable = typeof conf.editable === "undefined" || conf.editable !== "false";
            var content = val;
            if (editable) {
                conf._input.val(val);
            } else {
                var options = conf.options;
                if (content !== "") {
                    if (typeof options === "undefined") {
                        content = val;
                    } else {
                        Object.keys(options).forEach(function (key) {
                            if (options[key] === val) {
                                content = key;
                            }
                        });
                    }
                }
                $(conf._input).html(content);
            }
            if( _fieldTypesDebug || baseFieldType._debug ){
                console.log("baseFieldType.set(conf, val)->called", {
                    conf : conf,
                    val : val,
                    editable : editable,
                    content : content,
                    options : options

                });
            }


            _triggerChange(conf._input);
        },

        get: function (conf) {
            var val = conf._input.val();
            if( _fieldTypesDebug || baseFieldType._debug ){
                console.log("baseFieldType.get(conf)->called", {
                    conf : conf,
                    val : val
                });
            }

            return val;
        },

        hide: function (conf) {
            if( _fieldTypesDebug || baseFieldType._debug ){
                console.log("baseFieldType.hide(conf)->called", {
                    conf : conf
                });
            }
            conf._input.hide();
        },

        show: function () {
            if( _fieldTypesDebug || baseFieldType._debug ){
                console.log("baseFieldType.show()->called");
            }
            conf._input.hide();
        },

        enable: function (conf) {
            conf._input.prop('disabled', false);
            if( _fieldTypesDebug || baseFieldType._debug ){
                console.log("baseFieldType.enable(conf)->called", {
                    conf : conf
                });
            }
        },

        disable: function (conf) {
            conf._input.prop('disabled', true);
            if( _fieldTypesDebug || baseFieldType._debug ){
                console.log("baseFieldType.disable(conf)->called", {
                    conf : conf
                });
            }
        },


        canReturnSubmit: function (conf, node) {
            var arrayDebug = [];
            arrayDebug[0] = "canReturnSubmit called";
            arrayDebug.conf = conf;
            arrayDebug.node = node;
            Log.trace(arrayDebug, _fieldTypesDebug);
            return true;
        }
    });

    _fieldTypes.text = $.extend(true, {}, baseFieldType, {
        _debug : false,
        create: function (conf) {
            conf._input = $('<input/>').attr($.extend({
                id: Editor.safeId(conf.id),
                type: 'text'
            }, conf.attr || {}));
            if( _fieldTypesDebug || _fieldTypes.text._debug ){
                console.log("_fieldTypes.text.create(conf)->called", {
                    conf : conf
                });
            }
            return conf._input[0];
        },
        enable: function (conf) {
            conf._input.prop('disabled', false);

            if( _fieldTypesDebug || _fieldTypes.text._debug ){
                console.log("_fieldTypes.text.enable(conf)->called", {
                    conf : conf
                });
            }
        },

        disable: function (conf) {
            conf._input.prop('disabled', true);
            if( _fieldTypesDebug || _fieldTypes.text._debug ){
                console.log("_fieldTypes.text.disable(conf)->called", {
                    conf : conf
                });
            }
        }
    });

    _fieldTypes.select = $.extend(true, {}, baseFieldType, {
        _debug : false,
        // Locally "private" function that can be reused for the create and update methods
        _addOptions: function (conf, opts, append) {
            var elOpts = conf._input[0].options;
            var countOffset = 0;

            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select._addOptions(conf, opts, append)->called", {
                    conf : conf,
                    opts : opts,
                    append : append,
                    elOpts : elOpts,
                    countOffset : countOffset
                });
            }

            if (opts) {
                Editor.pairs(opts, conf.optionsPair, function (val, label, i, attr) {
                    var option = new Option(label, val);
                    option._editor_val = val;

                    if (attr) {
                        $(option).attr(attr);
                    }

                    elOpts[i + countOffset] = option;
                });
            }
        },

        create: function (conf) {
            conf._enabled = true;
            conf._input = $('<select/>')
                .attr($.extend({
                    required: true,
                    id: Editor.safeId(conf.id),
                    multiple: conf.multiple === true
                }, conf.attr || {}))
                .on('change.dte', function (e, d) {
                    // On change, get the user selected value and store it as the
                    // last set, so `update` can reflect it. This way `_lastSet`
                    // always gives the intended value, be it set via the API or by
                    // the end user.
                    if (!d || !d.editor) {
                        conf._lastSet = _fieldTypes.select.get(conf);
                    }
                });

            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select.create(conf)->called", {
                    conf : conf
                });
            }

            _fieldTypes.select._addOptions(conf, conf.options || conf.ipOpts, false);

            return conf._input[0];
        },

        update: function (conf, options, append) {

            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select.update(conf, opts, append)->called", {
                    conf : conf,
                    opts : opts,
                    append : append
                });
            }
            _fieldTypes.select._addOptions(conf, options, append);

            // Attempt to set the last selected value (set by the API or the end
            // user, they get equal priority)
            var lastSet = conf._lastSet;

            if (lastSet !== undefined) {
                _fieldTypes.select.set(conf, lastSet, true);
            }

            _triggerChange(conf._input);
        },

        get: function (conf) {
            var val = conf._input.find('option:selected').map(function () {
                return this._editor_val;
            }).toArray();

            if (conf.multiple) {
                return conf.separator ?
                    val.join(conf.separator) :
                    val;
            }
            var value  = val.length ? val[0] : null;

            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select.get(conf)->called", {
                    conf : conf,
                    value : value
                });
            }

            return value;
        },

        set: function (conf, val, localUpdate) {
            if (!localUpdate) {
                conf._lastSet = val;
            }

            // Can't just use `$().val()` because it won't work with strong types
            if (conf.multiple && conf.separator && !$.isArray(val)) {
                val = typeof val === 'string' ?
                    val.split(conf.separator) :
                    [];
            }
            else if (!$.isArray(val)) {
                val = [val];
            }

            var i, len = val.length, found, allFound = false;
            var options = conf._input.find('option');

            conf._input.find('option').each(function () {
                found = false;

                for (i = 0; i < len; i++) {
                    // Weak typing
                    if (this._editor_val === val[i]) {
                        found = true;
                        allFound = true;
                        break;
                    }
                }

                this.selected = found;
            });

            // If there is a placeholder, we might need to select it if nothing else
            // was selected. It doesn't make sense to select when multi is enabled
            if (conf.placeholder && !allFound && !conf.multiple && options.length) {
                options[0].selected = true;
            }

            // Update will call change itself, otherwise multiple might be called
            if (!localUpdate) {
                // _triggerChange( conf._input );
            }


            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select.set(conf, val, localUpdate)->called", {
                    conf : conf,
                    val : val,
                    localUpdate : localUpdate
                });
            }
            _triggerChange(conf._input);

            // if(!conf._enabled){
            //
            //     _fieldTypes.select.disable( conf);
            // }else {
            //
            //
            //     _fieldTypes.select.enable( conf);
            // }

            return allFound;
        },

        enable: function (conf) {
            $(conf._input).attr('disabled', false);
            conf._enabled = true;

            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select.enable(conf)->called", {
                    conf : conf
                });
            }
        },

        disable: function (conf) {
            conf._enabled = false;
            $(conf._input).attr('disabled', true);

            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select.disable(conf)->called", {
                    conf : conf
                });
            }
            return conf._input;
        },

        destroy: function (conf) {
            conf._input.off('change.dte');
            if( _fieldTypesDebug || _fieldTypes.select._debug ){
                console.log("_fieldTypes.select.destroy(conf)->called", {
                    conf : conf
                });
            }
        }
    });

    _fieldTypes.checkbox = $.extend(true, {}, baseFieldType, {
        // Locally "private" function that can be reused for the create and update methods
        _addOptions: function (conf, opts, append) {
            var val, label;
            var jqInput = conf._input;
            var offset = 0;

            if (!append) {
                jqInput.empty();
            }
            else {
                offset = $('input', jqInput).length;
            }
            if (opts) {
                Editor.pairs(opts, conf.optionsPair, function (val, label, i, attr) {
                    jqInput.append(
                        '<div class="form-check col-6">' +
                        '<input class="form-check-input" id="' + Editor.safeId(conf.id) + '_' + (i + offset) + '" type="checkbox" />' +
                        '<label class="form-check-label" for="' + Editor.safeId(conf.id) + '_' + (i + offset) + '">' +
                            '<span class="badge badge-pill badge-primary">' + label + '</span>'
                        + '</label>' +
                        '</div>'
                    );
                    $('input:last', jqInput).attr('value', val)[0]._editor_val = val;

                    if (attr) {
                        $('input:last', jqInput).attr(attr);
                    }
                });
            }
        },


        create: function (conf) {
            var container = $('<div />').addClass("container");
            conf._input = $('<div class="row"/>').appendTo(container);
            _fieldTypes.checkbox._addOptions(conf, conf.options || conf.ipOpts);

            return conf._input[0];
        },

        get: function (conf) {
            var out = [];
            var selected = conf._input.find('input:checked');

            if (selected.length) {
                selected.each(function () {
                    out.push(this._editor_val);
                });
            }
            else if (conf.unselectedValue !== undefined) {
                out.push(conf.unselectedValue);
            }
            var separator = conf.separator === undefined ? _separator.array : conf.separator;
            var returnVal = out.join(separator);
            console.log(returnVal);
            return returnVal;
        },

        set: function (conf, val) {
            var jqInputs = conf._input.find('input');
            if (!$.isArray(val) && typeof val === 'string') {
                val = val.split(conf.separator || _separator.array);
            }
            else if (!$.isArray(val)) {
                val = [val];
            }

            var i, len = val.length, found;

            jqInputs.each(function () {
                found = false;

                for (i = 0; i < len; i++) {
                    if (this._editor_val === val[i]) {
                        found = true;
                        break;
                    }
                }

                this.checked = found;
            });

            _triggerChange(jqInputs);
        },

        enable: function (conf) {
            conf._input.find('input').prop('disabled', false);
        },

        disable: function (conf) {
            conf._input.find('input').prop('disabled', true);
        },

        update: function (conf, options, append) {
            // Get the current value
            var checkbox = _fieldTypes.checkbox;
            var currVal = checkbox.get(conf);

            checkbox._addOptions(conf, options, append);
            checkbox.set(conf, currVal);
        }
    });

    _fieldTypes.textarea = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "textrea create called";
            arrayDebug.conf = conf;
            arrayDebug.field = conf.data;
            var editable = conf.editable;
            /*if(typeof editable === "undefined" || editable !== "false"){

                conf._input = $('<textarea/>').attr( $.extend( {
                    id: Editor.safeId( conf.id ),
                    type: 'textarea'
                }, conf.attr || {} ) );
                Log.trace(arrayDebug, _fieldTypesDebug);

                return conf._input[0];
            }
            else {
                conf._input = $('<div></div>').attr( $.extend( {
                    id: Editor.safeId( conf.id )
                }, conf.attr || {} ) );
                Log.trace(arrayDebug, _fieldTypesDebug);

                return conf._input[0];
            }*/


            conf._input = $('<textarea/>').attr($.extend({
                id: Editor.safeId(conf.id)
            }, conf.attr || {}));
            Log.trace(arrayDebug, _fieldTypesDebug);

            return conf._input[0];
        },
        canReturnSubmit: function () {
            return false;
        }
    });

    _fieldTypes.boolean = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "_fieldTypes.boolean boolean create called";


            conf._div =
                $('<div style="width:auto;" class="text-center">' +

                    '<label class="p-switch p-switch-sm v-a-m m-auto">' +
                    '<input type="checkbox" name="switch" id="' + Editor.safeId(conf.id) + '" ><span class="p-switch-style"></span>' +
                    '</label>' +
                    '</div>');

            arrayDebug.conf = conf;
            Log.trace(arrayDebug, _fieldTypesDebug);
            return conf._div;
        },


        set: function (conf, data) {
            var arrayDebug = [];
            arrayDebug[0] = "_fieldTypes.boolean boolean set called";
            arrayDebug.conf = conf;
            arrayDebug.data = data;
            var $input = $("input", conf._div);
            $input.prop('checked', parseInt(data) === 1);

            Log.trace(arrayDebug, _fieldTypesDebug);

            _triggerChange($input);
        },

        get: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "_fieldTypes.boolean boolean get called";
            arrayDebug.conf = conf;
            var $input = $("input", conf._div);
            arrayDebug.$input = $input;

            var checked = $input.prop('checked');
            var value = checked ? '1' : '0';
            arrayDebug.checked = checked;
            arrayDebug.value = value;
            Log.trace(arrayDebug, _fieldTypesDebug);
            return value;
        },

        canReturnSubmit: function (conf, node) {
            return true;
        },

        enable: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "_fieldTypes.boolean enable called";
            arrayDebug.conf = conf;
            arrayDebug.field = conf.data;
            var $input = $("input", conf._div);
            $input.prop('disabled', false);
            Log.trace(arrayDebug, _fieldTypesDebug);
        },

        disable: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "disable called";
            arrayDebug.conf = conf;
            arrayDebug.field = conf.data;
            var $input = $("input", conf._div);
            $input.prop('disabled', true);
            Log.trace(arrayDebug, _fieldTypesDebug);
        }


    });

    _fieldTypes.color = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "color create called";
            arrayDebug.conf = conf;
            conf._enabled = true;
            var group =
                '<div class="input-group ">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text color-value">' +

                '</span>' +
                '</div>' +
                '<input class="form-control colorPicker" value="" id="' + Editor.safeId(conf.id) + '">' +
                '</div>';
            conf._input = $(group);
            Log.trace(arrayDebug, _fieldTypesDebug);
            return conf._input;
        },

        get: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "color get called";
            Log.trace(arrayDebug, _fieldTypesDebug);
            return $('input', conf._input).val();
        },

        set: function (conf, val) {

            var arrayDebug = [];
            var $input = $('input', conf._input);
            $input.val(val);
            arrayDebug.conf = conf;

            if (val === "") {
                // val = "transparent";
            }
            var $colorValue = $('.color-value', conf._input);
            $colorValue.css('background-color', val);
            $input.colorpicker({

                color: val,
                format: 'hex',
                debug : false

            })
                .on('colorpickerCreate', function (e) {
                    e.preventDefault();
                    e.colorpicker.setValue(val);

                })
                .on('colorpickerShow', function (e) {
                    e.colorpicker.setValue($input.val());
                })
                .on('colorpickerHide', function (e) {
                    var value = $input.val();
                    arrayDebug.event = 'colorpickerHide';
                    arrayDebug.colorToString = e.color.toString();
                    arrayDebug.e = e;
                    if (_Column._validColor(value)) {
                        e.colorpicker.setValue(value);
                        $colorValue.css('background-color', e.color.toString());
                    }
                    Log.trace(arrayDebug, _fieldTypesDebug);
                })
                .on('colorpickerChange', function (e) {
                    e.preventDefault();
                    var inputValue = $input.val();
                    if (_Column._validColor(inputValue)) {
                        $colorValue.css('background-color', e.color.toString());
                    }
                })
            ;

            Log.trace(arrayDebug, _fieldTypesDebug);
        },

        canReturnSubmit: function () {
            return false;
        }
    });

    _fieldTypes.integer = $.extend(true, {}, baseFieldType, {
        _debug : false,
        create: function (conf) {
            if(_fieldTypes.integer._debug){
                console.log(conf);
            }
            conf._enabled = true;
            conf._input = $(
                '<input id="' + Editor.safeId(conf.id) + '" type="number" step="1" class="" min="0" value="0">');
            return conf._input;
        },

        set: function (conf, val) {
            val = Fn._isStringNotEmpty(val) ? parseInt(val) : 0;
            $(conf._input).val(val);
        },

        get: function (conf) {
            return parseInt($(conf._input).val());
        }
    });

    _fieldTypes.password = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            console.log(conf);
            conf._enabled = true;
            conf._input = $(
                '<input id="' + Editor.safeId(conf.id) + '" type="password" class="form-control" value="">');
            return conf._input;
        },

        set: function (conf, val) {
            $(conf._input).val(val);
        },

        get: function (conf) {
            return $(conf._input).val();
        }
    });

    _fieldTypes.price = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            conf._enabled = true;
            conf._input = $(
                '<input id="' + Editor.safeId(conf.id) + '" type="number" step="0.01" class="" value="">');
            return conf._input;
        },

        set: function (conf, val) {
            val = Fn._isStringNotEmpty(val) ? parseInt(val) : 0;
            val = Fn._intToDec(val);
            $(conf._input).val(val);
        },

        get: function (conf) {
            var val = $(conf._input).val();
            val = Math.round((parseFloat(val) * 100));
            return val;
        }
    });

    _fieldTypes.float = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            // console.log(conf);
            conf._enabled = true;
            conf._input = $('<input id="' + Editor.safeId(conf.id) + '" type="number" step="0.1" class="" value="0">');
            return conf._input;
        },

        set: function (conf, val) {
            val = Fn._isStringNotEmpty(val) ? parseInt(val) : 0;
            $(conf._input).val(Fn._intToDec(val));
        },

        get: function (conf) {
            var val = $(conf._input).val();
            val = Fn._isStringNotEmpty(val) ? (val) * 100 : 0;
            return val;
        }
    });

    _fieldTypes.email = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            console.log(conf);
            conf._enabled = true;
            conf._input = $(
                '<input id="' + Editor.safeId(conf.id) + '" type="email" value="" required>');

            return conf._input;
        },

        get: function (conf) {
            return $(conf._input).val();
        },

        set: function (conf, val) {

            $(conf._input).val(val);

        }
    });

    _fieldTypes.icon = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "icon create called";
            arrayDebug.conf = conf;
            conf._enabled = true;
            var group =
                '<div class="input-group ">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text">' +

                '<i class=""></i>' +
                '</span>' +
                '</div>' +
                '<input class="form-control" value="" id="' + Editor.safeId(conf.id) + '">' +
                '</div>';
            conf._input = $(group);
            Log.trace(arrayDebug, _fieldTypesDebug);
            return conf._input;
        },

        get: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "color get called";
            Log.trace(arrayDebug, _fieldTypesDebug);
            return $('input', conf._input).val();
        },

        set: function (conf, val) {

            var arrayDebug = [];
            var $input = $('input', conf._input);
            $input.val(val);
            arrayDebug.conf = conf;

            if (val === "") {
                // val = "transparent";
            }
            var $icon = $('i', conf._input);
            $icon.removeClass();
            $icon.addClass(val);

            Log.trace(arrayDebug, _fieldTypesDebug);
        },

        canReturnSubmit: function () {
            return true;
        }
    });

    _fieldTypes.flag = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "icon create called";
            arrayDebug.conf = conf;
            conf._enabled = true;
            var group =
                '<div class="input-group ">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text">' +
                '<div class="text-center"><span class="flag-icon "></span></div>' +
                '</span>' +
                '</div>' +
                '<input class="form-control" value="" id="' + Editor.safeId(conf.id) + '">' +
                '</div>';
            conf._input = $(group);
            Log.trace(arrayDebug, _fieldTypesDebug);
            return conf._input;
        },

        get: function (conf) {
            var arrayDebug = [];
            arrayDebug[0] = "color get called";
            Log.trace(arrayDebug, _fieldTypesDebug);
            return $('input', conf._input).val();
        },

        set: function (conf, val) {
            var className = 'flag-icon';
            var arrayDebug = [];
            var $input = $('input', conf._input);
            $input.val(val);
            arrayDebug.conf = conf;

            if (val === "") {
                // val = "transparent";
            }
            var $icon = $('.' + className, conf._input);
            $icon.removeClass();
            $icon.addClass(className);
            $icon.addClass(val);

            Log.trace(arrayDebug, _fieldTypesDebug);
        },

        canReturnSubmit: function () {
            return true;
        }
    });

    _fieldTypes.image = _fieldTypes.upload;

    _fieldTypes.daterange = $.extend(true, {}, baseFieldType, {//TODO check this
        create: function (conf) {
            var editor = this;
            var translation = editor.i18n;
            console.log("_fieldTypes.datetime create called", $.fn.daterangepicker);
            conf._input = $('<input />').attr($.extend({
                id: Editor.safeId(conf.id),
                type: 'text'
            }, conf.attr));

            if ($.fn.daterangepicker) {
                $(conf._input).daterangepicker($.extend({
                    // singleDatePicker: true,
                    showDropdowns : true,
                    startDate: moment(),
                    "locale": {
                        "applyLabel": translation.apply,
                        "cancelLabel": translation.cancel,
                        "format": _DataTable.format.date,
                        "monthNames": translation.datetime.months,
                        "daysOfWeek": translation.datetime.weekdays,
                        "firstDay": 1
                    }
                }, conf.opts));
            }
            else {
                // HTML5 (only Chrome and Edge on the desktop support this atm)
                conf._input.attr('type', 'date');
            }

            return conf._input[0];
        },

        // use default get method as will work for all

        set: function (conf, val) {
            if ($.fn.daterangepicker && moment) {
                var date;
                var mom = val !== "" ? moment(val, _DataTable.format.timeStamp) : moment();
                if (mom.isValid()) {
                    date = mom.format(_DataTable.format.date);
                } else {
                    date = moment().format(_DataTable.format.date);
                    console.log("date is not valid", date);
                }
                $(conf._input).data("daterangepicker").setStartDate(date);

            }
            else {

                $(conf._input).val(Fn._intToDate(val));
            }
        },

        get: function (conf) {
            var val = $(conf._input).val();
            console.log(val);
            if (moment) {
                var mom = moment(val, _DataTable.format.date);
                if (mom.isValid()) {
                    val = mom.format(_DataTable.format.timeStamp);
                }
            }
            return val;
        },

        enable: function (conf) {
            $(conf._input).prop('disabled', false);
        },

        disable: function (conf) {
            $(conf._input).prop('disabled', true);
        }
    });

    _fieldTypes.date = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var editor = this;
            var translation = editor.i18n;
            var id = Editor.safeId(conf.id);
            var input =
                '<div class="input-group date " data-target-input="nearest">' +
                '<input type="text" class="form-control datetimepicker-input"  data-toggle="datetimepicker" data-target="#' + id + '" ' +
                'placeholder="Select date &amp; time">' +
                '</div>';
            conf._input = $(input).attr($.extend({
                id: id
            }, conf.attr));
            if ($.fn.datetimepicker) {
                $(conf._input).datetimepicker($.extend({
                    locale: translation.locale,
                    format: _DataTable.format.date,
                    widgetPositioning: {
                        horizontal: 'left'
                    }
                }, conf.opts));
                setTimeout(function () {


                }, 10);
            }
            else {
                $('input', conf._input).attr('type', 'date');
            }

            return conf._input[0];
        },

        // use default get method as will work for all

        set: function (conf, val) {
            if ($.fn.datetimepicker && moment) {
                var mom = val !== "" ? moment(val, _DataTable.format.timeStamp) : moment();
                var date = val;
                mom = moment(mom);
                if (mom.isValid()) {
                    date = mom.format(_DataTable.format.date);
                } else {
                    date = moment().format(_DataTable.format.date);
                }
                $('input', conf._input).val(date);

            }
            else {

                $('input', conf._input).val(Fn._intToDate(val));
            }
        },

        get: function (conf) {
            var val = $('input', conf._input).val();
            if (moment) {
                var mom = moment(val, _DataTable.format.datetime);
                if (mom.isValid()) {
                    val = mom.format(_DataTable.format.timeStamp);
                }
            }
            return val;
        },

        enable: function (conf) {
            $(conf._input).prop('disabled', false);
        },

        disable: function (conf) {
            $(conf._input).prop('disabled', true);
        }
    });

    _fieldTypes.time = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var editor = this;
            var translation = editor.i18n;
            var id = Editor.safeId(conf.id);
            var input =
                '<div class="input-group date " data-target-input="nearest">' +
                '<input type="text" class="form-control datetimepicker-input"  data-toggle="datetimepicker" data-target="#' + id + '" ' +
                'placeholder="Select date &amp; time">' +
                '</div>';
            conf._input = $(input).attr($.extend({
                id: id
            }, conf.attr));
            if ($.fn.datetimepicker) {
                console.log('_fieldTypes.time called', { datetimepicker : $.fn.datetimepicker } );
                setTimeout(function () {
                    $(conf._input).datetimepicker($.extend({
                        format: _DataTable.format.time,
                        locale: translation.locale,
                        stepping: 5,
                        widgetPositioning: {
                            horizontal: 'left'
                        }
                    }, conf.opts));

                }, 10);
            }
            else {
                $('input', conf._input).attr('type', 'date');
            }

            return conf._input[0];
        },

        // use default get method as will work for all

        set: function (conf, val) {
            if ($.fn.datetimepicker && moment) {
                var mom = val !== "" ? moment(val, _DataTable.format.timeStamp) : moment();
                var date = val;
                if (mom.isValid()) {
                    date = mom.utc().format(_DataTable.format.time);
                }
                $('input', conf._input).val(date);

            }
            else {

                $('input', conf._input).val(Fn._intToDate(val));
            }
        },

        get: function (conf) {
            var val = $('input', conf._input).val();
            if (moment) {
                var mom = moment(val, _DataTable.format.time);
                if (mom.isValid()) {
                    var min = mom.minutes();
                    var hour = mom.hours();
                    var newDate = moment(0, _DataTable.format.timeStamp).utc().hours(hour).minutes(min);
                    // val = newDate.format(_DataTable.format.timeStamp);
                    val = newDate.format(_DataTable.format.timeStamp);
                    console.log({
                        min : min,
                        hour : hour,
                        val : val,
                        mom : mom
                    });
                }
            }
            return val;
        },

        enable: function (conf) {
            $(conf._input).prop('disabled', false);
        },

        disable: function (conf) {
            $(conf._input).prop('disabled', true);
        }
    });

    _fieldTypes.datetime = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            var editor = this;
            var translation = editor.i18n;
            var id = Editor.safeId(conf.id);
            var input =
                '<div class="input-group date " data-target-input="nearest">' +
                '<input type="text" class="form-control datetimepicker-input"  data-toggle="datetimepicker" data-target="#' + id + '" ' +
                'placeholder="Select date &amp; time">' +
                '</div>';
            conf._input = $(input).attr($.extend({
                id: id
            }, conf.attr));
            if ($.fn.datetimepicker) {
                $(conf._input).datetimepicker($.extend({
                    locale: translation.locale,
                    format: _DataTable.format.datetime,
                    widgetPositioning: {
                        horizontal: 'left'
                    }
                }, conf.opts));

            }
            else {
                $('input', conf._input).attr('type', 'date');
            }

            return conf._input[0];
        },

        // use default get method as will work for all

        set: function (conf, val) {
            if ($.fn.datetimepicker && moment) {
                var mom = val !== "" ? moment(val, _DataTable.format.timeStamp) : moment();
                var date = val;
                mom = moment(mom);
                if (mom.isValid()) {
                    date = mom.format(_DataTable.format.datetime);
                } else {
                    date = moment().format(_DataTable.format.datetime);
                }
                $('input', conf._input).val(date);

            }
            else {

                $('input', conf._input).val(Fn._intToDate(val));
            }
        },

        get: function (conf) {
            var val = $('input', conf._input).val();
            if (moment) {
                var mom = moment(val, _DataTable.format.datetime);
                if (mom.isValid()) {
                    val = mom.format(_DataTable.format.timeStamp);
                }
            }
            return val;
        },

        enable: function (conf) {
            $(conf._input).prop('disabled', false);
        },

        disable: function (conf) {
            $(conf._input).prop('disabled', true);
        }
    });

    _fieldTypes.timestep = $.extend(true, {}, baseFieldType, {
        create: function (conf) {
            console.log("_fieldTypes.timestep create called", conf);
            var translation = this.i18n;
            var id = Editor.safeId(conf.id);
            var css = {
                width: "initial",
                display: "inline"
            };
            var $input = $('<input/>')
                .attr({
                    type: "number",
                    'class': 'form-control',
                    min: 0
                })
                .css(css)
            ;
            var $select = $('<select/>')
                .attr({
                    'class': 'form-control'
                })
                .css(css)
            ;
            $select
                .append(new Option(translation.datetime.minute, _timeHelper.type.min))
                .append(new Option(translation.datetime.hour, _timeHelper.type.hour))
                .append(new Option(translation.datetime.day, _timeHelper.type.day))
            ;
            var inputGroup = $('<div/>').addClass('input-group').append($input).append($select);
            conf._input = inputGroup.attr($.extend({
                id: id
            }, conf.attr));

            return conf._input[0];
        },

        // use default get method as will work for all

        set: function (conf, val) {
            var inputVal = 0;
            var selectVal;
            if (val !== "" && val.includes(_separator.array)) {
                val = val.split(conf.separator || _separator.array);
                if (val.length === 2) {
                    inputVal = val[0];
                    selectVal = val[1];
                }
            }
            if (selectVal) {
                $('select', conf._input).val(selectVal);
            }
            $('input', conf._input).val(inputVal);
        },

        get: function (conf) {
            var inputVal = $('input', conf._input).val();
            var selectVal = $('select', conf._input).val();
            return inputVal + _separator.array + selectVal;
        },

        enable: function (conf) {
            $('select', conf._input).prop('disabled', false);
            $('input', conf._input).prop('disabled', false);
        },

        disable: function (conf) {
            $('input', conf._input).prop('disabled', true);
            $('select', conf._input).prop('disabled', true);
        }
    });


    // If there are field types available on DataTables we copy them in (after the
    // built in ones to allow overrides) and then expose the field types object.
    if (DataTable.ext.editorFields) {
        $.extend(_fieldTypes, DataTable.ext.editorFields);
    }

    DataTable.ext.editorFields = _fieldTypes;






    $.fn.dataTable.ext.order['datetime'] = function  ( settings, col ) {
        return this.api().column( col, {order:'index'}).nodes().map( function ( td, i ) {
            var d =  $(td).text();

            var timeStamp = (moment( d, _DataTable.format.datetime).format(_DataTable.format.timeStamp));
            if(_fieldTypesDebug){
                console.log({
                    i : i, d : d, timeStamp : timeStamp
                });
            }
            return (timeStamp);
        } );
    };

    $.fn.dataTable.ext.order['date'] = function  ( settings, col ) {
        return this.api().column( col, {order:'index'}).nodes().map( function ( td, i ) {
            if(_fieldTypesDebug) {
                console.log({
                    settings: settings, col: col, td: td, i: i
                });
            }
            var d =  $(td).text();
            return moment( d, _DataTable.format.date).format(_DataTable.format.date);
        } );
    };

    $.fn.dataTable.ext.order['time'] = function  ( settings, col ) {
        return this.api().column( col, {order:'index'}).nodes().map( function ( td, i ) {
            if(_fieldTypesDebug) {
                console.log({
                    settings: settings, col: col, td: td, i: i
                });
            }
            var d =  $(td).text();
            return moment( d, _DataTable.format.datetime).format(_DataTable.format.time);
        } );
    };






})(jQuery, jQuery.fn.dataTable, Log);
