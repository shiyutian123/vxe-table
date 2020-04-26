"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

var _conf = _interopRequireDefault(require("../../conf"));

var _tools = require("../../tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var inputEventTypes = ['input', 'textarea', '$input', '$textarea'];
var defaultCompProps = {
  transfer: true
};

function getModelProp() {
  return 'value';
}

function getModelEvent() {
  return 'input';
}

function getChangeEvent(renderOpts) {
  return inputEventTypes.indexOf(renderOpts.name) > -1 ? 'input' : 'change';
}

function parseDate(value, props) {
  return value && props.valueFormat ? _xeUtils.default.toStringDate(value, props.valueFormat) : value;
}

function getFormatDate(value, props, defaultFormat) {
  var _props$dateConfig = props.dateConfig,
      dateConfig = _props$dateConfig === void 0 ? {} : _props$dateConfig;
  return _xeUtils.default.toDateString(parseDate(value, props), dateConfig.labelFormat || defaultFormat);
}

function getLabelFormatDate(value, props) {
  return getFormatDate(value, props, _conf.default.i18n("vxe.input.date.labelFormat.".concat(props.type)));
}

function getDefaultComponentName(_ref) {
  var name = _ref.name;
  return "vxe-".concat(name.replace('$', ''));
}

function handleConfirmFilter(params, checked, option) {
  var $panel = params.$panel;
  $panel.changeOption({}, checked, option);
}

function getNativeAttrs(_ref2) {
  var name = _ref2.name,
      attrs = _ref2.attrs;

  if (name === 'input') {
    attrs = Object.assign({
      type: 'text'
    }, attrs);
  }

  return attrs;
}

function getCellEditFilterProps(renderOpts, params, value, defaultProps) {
  var vSize = params.$table.vSize;
  return _xeUtils.default.assign(vSize ? {
    size: vSize
  } : {}, defaultCompProps, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value));
}

function getItemProps(renderOpts, params, value, defaultProps) {
  var vSize = params.$form.vSize;
  return _xeUtils.default.assign(vSize ? {
    size: vSize
  } : {}, defaultCompProps, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value));
}

function getOns(renderOpts, params, inputFunc, changeFunc) {
  var events = renderOpts.events;
  var modelEvent = getModelEvent(renderOpts);
  var changeEvent = getChangeEvent(renderOpts);
  var isSameEvent = changeEvent === modelEvent;
  var ons = {};

  _xeUtils.default.objectEach(events, function (func, key) {
    ons[key] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      func.apply(void 0, [params].concat(args));
    };
  });

  if (inputFunc) {
    ons[modelEvent] = function (value) {
      inputFunc(value);

      if (events && events[modelEvent]) {
        events[modelEvent](value);
      }

      if (isSameEvent && changeFunc) {
        changeFunc();
      }
    };
  }

  if (!isSameEvent && changeFunc) {
    ons[changeEvent] = function () {
      changeFunc();

      if (events && events[changeEvent]) {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        events[changeEvent].apply(events, [params].concat(args));
      }
    };
  }

  return ons;
}

function getEditOns(renderOpts, params) {
  var $table = params.$table,
      row = params.row,
      column = params.column;
  return getOns(renderOpts, params, function (value) {
    // 处理 model 值双向绑定
    _xeUtils.default.set(row, column.property, value);
  }, function () {
    // 处理 change 事件相关逻辑
    $table.updateStatus(params);
  });
}

function getFilterOns(renderOpts, params, option) {
  return getOns(renderOpts, params, function (value) {
    // 处理 model 值双向绑定
    option.data = value;
  }, function () {
    handleConfirmFilter(params, !_xeUtils.default.eqNull(option.data), option);
  });
}

function getItemOns(renderOpts, params) {
  var $form = params.$form,
      data = params.data,
      property = params.property;
  return getOns(renderOpts, params, function (value) {
    // 处理 model 值双向绑定
    _xeUtils.default.set(data, property, value);
  }, function () {
    // 处理 change 事件相关逻辑
    $form.updateStatus(params);
  });
}

function isSyncCell(renderOpts, params) {
  return renderOpts.immediate || renderOpts.type === 'visible' || params.$type === 'cell';
}

function getNativeEditOns(renderOpts, params) {
  var $table = params.$table,
      row = params.row,
      column = params.column;
  var model = column.model;
  return getOns(renderOpts, params, function (evnt) {
    // 处理 model 值双向绑定
    var cellValue = evnt.target.value;

    if (isSyncCell(renderOpts, params)) {
      _tools.UtilTools.setCellValue(row, column, cellValue);
    } else {
      model.update = true;
      model.value = cellValue;
    }
  }, function () {
    // 处理 change 事件相关逻辑
    $table.updateStatus(params);
  });
}

function getNativeFilterOns(renderOpts, params, option) {
  return getOns(renderOpts, params, function (evnt) {
    // 处理 model 值双向绑定
    option.data = evnt.target.value;
  }, function () {
    handleConfirmFilter(params, !_xeUtils.default.eqNull(option.data), option);
  });
}

function getNativeItemOns(renderOpts, params) {
  var $form = params.$form,
      data = params.data,
      property = params.property;
  return getOns(renderOpts, params, function (evnt) {
    // 处理 model 值双向绑定
    var itemValue = evnt.target.value;

    _xeUtils.default.set(data, property, itemValue);
  }, function () {
    // 处理 change 事件相关逻辑
    $form.updateStatus(params);
  });
}
/**
 * 单元格可编辑渲染-原生的标签
 * input、textarea、select
 */


function nativeEditRender(h, renderOpts, params) {
  var row = params.row,
      column = params.column;
  var name = renderOpts.name;
  var attrs = getNativeAttrs(renderOpts);
  var cellValue = isSyncCell(renderOpts, params) ? _tools.UtilTools.getCellValue(row, column) : column.model.value;
  return [h(name, {
    class: "vxe-default-".concat(name),
    attrs: attrs,
    domProps: {
      value: cellValue
    },
    on: getNativeEditOns(renderOpts, params)
  })];
}

function defaultEditRender(h, renderOpts, params) {
  var row = params.row,
      column = params.column;

  var cellValue = _tools.UtilTools.getCellValue(row, column);

  return [h(getDefaultComponentName(renderOpts), {
    props: getCellEditFilterProps(renderOpts, params, cellValue),
    on: getEditOns(renderOpts, params)
  })];
}

function defaultButtonEditRender(h, renderOpts, params) {
  return [h('vxe-button', {
    props: getCellEditFilterProps(renderOpts, params),
    on: getOns(renderOpts, params)
  })];
}

function defaultButtonsEditRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonEditRender(h, childRenderOpts, params)[0];
  });
}

function renderNativeOptgroups(h, renderOpts, params, renderOptionsMethods) {
  var optionGroups = renderOpts.optionGroups,
      _renderOpts$optionGro = renderOpts.optionGroupProps,
      optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
  var groupOptions = optionGroupProps.options || 'options';
  var groupLabel = optionGroupProps.label || 'label';
  return optionGroups.map(function (group) {
    return h('optgroup', {
      domProps: {
        label: group[groupLabel]
      }
    }, renderOptionsMethods(h, group[groupOptions], renderOpts, params));
  });
}

function renderDefaultOptgroups(h, renderOpts, params, renderOptionsMethods) {
  var optionGroups = renderOpts.optionGroups,
      _renderOpts$optionGro2 = renderOpts.optionGroupProps,
      optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
  var groupOptions = optionGroupProps.options || 'options';
  var groupLabel = optionGroupProps.label || 'label';
  return optionGroups.map(function (group) {
    return h('vxe-optgroup', {
      props: {
        label: group[groupLabel]
      }
    }, renderOptionsMethods(h, group[groupOptions], renderOpts, params));
  });
}
/**
 * 渲染原生的 option 标签
 */


function renderNativeOptions(h, options, renderOpts, params) {
  var _renderOpts$optionPro = renderOpts.optionProps,
      optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro;
  var row = params.row,
      column = params.column;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  var cellValue = isSyncCell(renderOpts, params) ? _tools.UtilTools.getCellValue(row, column) : column.model.value;
  return options.map(function (item) {
    return h('option', {
      attrs: {
        value: item[valueProp],
        disabled: item[disabledProp]
      },
      domProps: {
        /* eslint-disable eqeqeq */
        selected: item[valueProp] == cellValue
      }
    }, item[labelProp]);
  });
}
/**
 * 渲染内置组件的下拉选项
 */

/* eslint-disable @typescript-eslint/no-unused-vars */


function renderDefaultOptions(h, options, renderOpts, params) {
  var _renderOpts$optionPro2 = renderOpts.optionProps,
      optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  return options.map(function (item) {
    return h('vxe-option', {
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item[disabledProp]
      }
    });
  });
}

function nativeFilterRender(h, renderOpts, params) {
  var column = params.column;
  var name = renderOpts.name;
  var attrs = getNativeAttrs(renderOpts);
  return column.filters.map(function (option) {
    return h(name, {
      class: "vxe-default-".concat(name),
      attrs: attrs,
      domProps: {
        value: option.data
      },
      on: getNativeFilterOns(renderOpts, params, option)
    });
  });
}

function defaultFilterRender(h, renderOpts, params) {
  var column = params.column;
  return column.filters.map(function (option) {
    var optionValue = option.data;
    return h(getDefaultComponentName(renderOpts), {
      props: getCellEditFilterProps(renderOpts, renderOpts, optionValue),
      on: getFilterOns(renderOpts, params, option)
    });
  });
}

function handleFilterMethod(_ref3) {
  var option = _ref3.option,
      row = _ref3.row,
      column = _ref3.column;
  var data = option.data;

  var cellValue = _xeUtils.default.get(row, column.property);
  /* eslint-disable eqeqeq */


  return cellValue == data;
}

function nativeSelectEditRender(h, renderOpts, params) {
  return [h('select', {
    class: 'vxe-default-select',
    attrs: getNativeAttrs(renderOpts),
    on: getNativeEditOns(renderOpts, params)
  }, renderOpts.optionGroups ? renderNativeOptgroups(h, renderOpts, params, renderNativeOptions) : renderNativeOptions(h, renderOpts.options, renderOpts, params))];
}

function defaultSelectEditRender(h, renderOpts, params) {
  var row = params.row,
      column = params.column;

  var cellValue = _tools.UtilTools.getCellValue(row, column);

  return [h(getDefaultComponentName(renderOpts), {
    props: getCellEditFilterProps(renderOpts, params, cellValue),
    on: getEditOns(renderOpts, params)
  }, renderOpts.optionGroups ? renderDefaultOptgroups(h, renderOpts, params, renderDefaultOptions) : renderDefaultOptions(h, renderOpts.options, renderOpts, params))];
}

function getSelectCellValue(renderOpts, _ref4) {
  var row = _ref4.row,
      column = _ref4.column;
  var options = renderOpts.options,
      optionGroups = renderOpts.optionGroups,
      _renderOpts$optionPro3 = renderOpts.optionProps,
      optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3,
      _renderOpts$optionGro3 = renderOpts.optionGroupProps,
      optionGroupProps = _renderOpts$optionGro3 === void 0 ? {} : _renderOpts$optionGro3;

  var cellValue = _xeUtils.default.get(row, column.property);

  var selectItem;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';

  if (optionGroups) {
    var groupOptions = optionGroupProps.options || 'options';

    for (var index = 0; index < optionGroups.length; index++) {
      /* eslint-disable eqeqeq */
      selectItem = _xeUtils.default.find(optionGroups[index][groupOptions], function (item) {
        return item[valueProp] == cellValue;
      });

      if (selectItem) {
        break;
      }
    }

    return selectItem ? selectItem[labelProp] : cellValue;
  }
  /* eslint-disable eqeqeq */


  selectItem = _xeUtils.default.find(options, function (item) {
    return item[valueProp] == cellValue;
  });
  return selectItem ? selectItem[labelProp] : cellValue;
}
/**
 * 渲染表单-项
 * 用于渲染原生的标签
 */


function nativeItemRender(h, renderOpts, params) {
  var data = params.data,
      property = params.property;
  var name = renderOpts.name;
  var attrs = getNativeAttrs(renderOpts);

  var itemValue = _xeUtils.default.get(data, property);

  return [h(name, {
    class: "vxe-default-".concat(name),
    attrs: attrs,
    domProps: attrs && name === 'input' && (attrs.type === 'submit' || attrs.type === 'reset') ? null : {
      value: itemValue
    },
    on: getNativeItemOns(renderOpts, params)
  })];
}

function defaultItemRender(h, renderOpts, params) {
  var data = params.data,
      property = params.property;

  var itemValue = _xeUtils.default.get(data, property);

  return [h(getDefaultComponentName(renderOpts), {
    props: getItemProps(renderOpts, params, itemValue),
    on: getItemOns(renderOpts, params)
  })];
}

function defaultButtonItemRender(h, renderOpts, params) {
  return [h('vxe-button', {
    props: getItemProps(renderOpts, params),
    on: getOns(renderOpts, params)
  })];
}

function defaultButtonsItemRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonItemRender(h, childRenderOpts, params)[0];
  });
}
/**
 * 渲染原生的 select 标签
 */


function renderNativeFormOptions(h, options, renderOpts, params) {
  var data = params.data,
      property = params.property;
  var _renderOpts$optionPro4 = renderOpts.optionProps,
      optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';

  var cellValue = _xeUtils.default.get(data, property);

  return options.map(function (item, index) {
    return h('option', {
      attrs: {
        value: item[valueProp],
        disabled: item[disabledProp]
      },
      domProps: {
        /* eslint-disable eqeqeq */
        selected: item[valueProp] == cellValue
      },
      key: index
    }, item[labelProp]);
  });
}

function createExportMethod(valueMethod, isEdit) {
  var renderProperty = isEdit ? 'editRender' : 'cellRender';
  return function (params) {
    return valueMethod(params.column[renderProperty], params);
  };
}
/**
 * 渲染表单-项中
 * 单选框和复选框
 */


function defaultFormItemRadioAndCheckboxRender(h, renderOpts, params) {
  var options = renderOpts.options,
      _renderOpts$optionPro5 = renderOpts.optionProps,
      optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5;
  var data = params.data,
      property = params.property;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';

  var itemValue = _xeUtils.default.get(data, property);

  var name = getDefaultComponentName(renderOpts);
  return [h("".concat(name, "-group"), {
    props: getItemProps(renderOpts, params, itemValue),
    on: getItemOns(renderOpts, params)
  }, options.map(function (option) {
    return h(name, {
      props: {
        label: option[valueProp],
        content: option[labelProp],
        disabled: option[disabledProp]
      }
    });
  }))];
}
/**
 * 内置的组件渲染
 */


var renderMap = {
  input: {
    autofocus: 'input',
    renderEdit: nativeEditRender,
    renderDefault: nativeEditRender,
    renderFilter: nativeFilterRender,
    filterMethod: handleFilterMethod,
    renderItem: nativeItemRender
  },
  textarea: {
    autofocus: 'textarea',
    renderEdit: nativeEditRender,
    renderItem: nativeItemRender
  },
  select: {
    renderEdit: nativeSelectEditRender,
    renderDefault: nativeSelectEditRender,
    renderCell: function renderCell(h, renderOpts, params) {
      return getSelectCellValue(renderOpts, params);
    },
    renderFilter: function renderFilter(h, renderOpts, params) {
      var column = params.column;
      return column.filters.map(function (option) {
        return h('select', {
          class: 'vxe-default-select',
          attrs: getNativeAttrs(renderOpts),
          on: getNativeFilterOns(renderOpts, params, option)
        }, renderOpts.optionGroups ? renderNativeOptgroups(h, renderOpts, params, renderNativeOptions) : renderNativeOptions(h, renderOpts.options, renderOpts, params));
      });
    },
    filterMethod: handleFilterMethod,
    renderItem: function renderItem(h, renderOpts, params) {
      return [h('select', {
        class: 'vxe-default-select',
        attrs: getNativeAttrs(renderOpts),
        on: getNativeItemOns(renderOpts, params)
      }, renderOpts.optionGroups ? renderNativeOptgroups(h, renderOpts, params, renderNativeFormOptions) : renderNativeFormOptions(h, renderOpts.options, renderOpts, params))];
    },
    editCellExportMethod: createExportMethod(getSelectCellValue, true),
    cellExportMethod: createExportMethod(getSelectCellValue)
  },
  $input: {
    autofocus: '.vxe-input--inner',
    renderEdit: defaultEditRender,
    renderCell: function renderCell(h, renderOpts, params) {
      var _renderOpts$props = renderOpts.props,
          props = _renderOpts$props === void 0 ? {} : _renderOpts$props;
      var row = params.row,
          column = params.column;

      var cellValue = _xeUtils.default.get(row, column.property);

      if (cellValue) {
        switch (props.type) {
          case 'date':
          case 'week':
          case 'month':
          case 'year':
            cellValue = getLabelFormatDate(cellValue, props);
            break;

          case 'float':
            cellValue = _xeUtils.default.toFixedString(cellValue, _xeUtils.default.toNumber(props.digits || _conf.default.input.digits));
            break;
        }
      }

      return cellValue;
    },
    renderDefault: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: handleFilterMethod,
    renderItem: defaultItemRender
  },
  $textarea: {
    autofocus: '.vxe-textarea--inner',
    renderItem: defaultItemRender
  },
  $button: {
    renderDefault: defaultButtonEditRender,
    renderItem: defaultButtonItemRender
  },
  $buttons: {
    renderDefault: defaultButtonsEditRender,
    renderItem: defaultButtonsItemRender
  },
  $select: {
    renderEdit: defaultSelectEditRender,
    renderDefault: defaultSelectEditRender,
    renderCell: function renderCell(h, renderOpts, params) {
      return getSelectCellValue(renderOpts, params);
    },
    renderFilter: function renderFilter(h, renderOpts, params) {
      var column = params.column;
      return column.filters.map(function (option) {
        var optionValue = option.data;
        return h(getDefaultComponentName(renderOpts), {
          props: getCellEditFilterProps(renderOpts, params, optionValue),
          on: getFilterOns(renderOpts, params, option)
        }, renderOpts.optionGroups ? renderDefaultOptgroups(h, renderOpts, params, renderDefaultOptions) : renderDefaultOptions(h, renderOpts.options, renderOpts, params));
      });
    },
    filterMethod: handleFilterMethod,
    renderItem: function renderItem(h, renderOpts, params) {
      var data = params.data,
          property = params.property;

      var itemValue = _xeUtils.default.get(data, property);

      return [h(getDefaultComponentName(renderOpts), {
        props: getItemProps(renderOpts, params, itemValue),
        on: getItemOns(renderOpts, params)
      }, renderOpts.optionGroups ? renderDefaultOptgroups(h, renderOpts, params, renderDefaultOptions) : renderDefaultOptions(h, renderOpts.options, renderOpts, params))];
    },
    editCellExportMethod: createExportMethod(getSelectCellValue, true),
    cellExportMethod: createExportMethod(getSelectCellValue)
  },
  $radio: {
    renderItem: defaultFormItemRadioAndCheckboxRender
  },
  $checkbox: {
    renderItem: defaultFormItemRadioAndCheckboxRender
  }
};
/**
 * 全局渲染器
 */

var renderer = {
  mixin: function mixin(map) {
    _xeUtils.default.each(map, function (options, name) {
      return renderer.add(name, options);
    });

    return renderer;
  },
  get: function get(name) {
    return renderMap[name] || null;
  },
  add: function add(name, options) {
    if (name && options) {
      var renders = renderMap[name];

      if (renders) {
        Object.assign(renders, options);
      } else {
        renderMap[name] = options;
      }
    }

    return renderer;
  },
  delete: function _delete(name) {
    delete renderMap[name];
    return renderer;
  }
};
var _default = renderer;
exports.default = _default;