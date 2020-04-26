"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _input = _interopRequireDefault(require("../../input/src/input"));

var _conf = _interopRequireDefault(require("../../conf"));

var _tools = require("../../tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function findOffsetOption(groupList, optionValue, isUpArrow) {
  var prevOption;
  var firstOption;
  var isMatchOption = false;

  for (var gIndex = 0; gIndex < groupList.length; gIndex++) {
    var group = groupList[gIndex];

    if (group.options) {
      for (var index = 0; index < group.options.length; index++) {
        var option = group.options[index];

        if (!firstOption) {
          firstOption = option;
        }

        if (isUpArrow) {
          if (optionValue === option.value) {
            return {
              offsetOption: prevOption,
              firstOption: firstOption
            };
          }
        } else {
          if (isMatchOption) {
            return {
              offsetOption: option,
              firstOption: firstOption
            };
          }

          if (optionValue === option.value) {
            isMatchOption = true;
          }
        }

        prevOption = option;
      }
    } else {
      if (!firstOption) {
        firstOption = group;
      }

      if (isUpArrow) {
        if (optionValue === group.value) {
          return {
            offsetOption: prevOption,
            firstOption: firstOption
          };
        }
      } else {
        if (isMatchOption) {
          return {
            offsetOption: group,
            firstOption: firstOption
          };
        }

        if (optionValue === group.value) {
          isMatchOption = true;
        }
      }

      prevOption = group;
    }
  }

  return {
    firstOption: firstOption
  };
}

function findOption(groupList, optionValue) {
  for (var gIndex = 0; gIndex < groupList.length; gIndex++) {
    var group = groupList[gIndex];

    if (group.options) {
      for (var index = 0; index < group.options.length; index++) {
        var option = group.options[index];

        if (optionValue === option.value) {
          return option;
        }
      }
    } else {
      if (optionValue === group.value) {
        return group;
      }
    }
  }
}

function renderOption(h, _vm, options) {
  var _vm$optionProps = _vm.optionProps,
      optionProps = _vm$optionProps === void 0 ? {} : _vm$optionProps;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  return options ? options.map(function (option, cIndex) {
    return h('vxe-option', {
      key: cIndex,
      props: {
        label: option[labelProp],
        value: option[valueProp],
        disabled: option[disabledProp]
      }
    });
  }) : [];
}

function renderOptgroup(h, _vm) {
  var optionGroups = _vm.optionGroups,
      _vm$optionGroupProps = _vm.optionGroupProps,
      optionGroupProps = _vm$optionGroupProps === void 0 ? {} : _vm$optionGroupProps;
  var groupOptions = optionGroupProps.options || 'options';
  var groupLabel = optionGroupProps.label || 'label';
  return optionGroups ? optionGroups.map(function (group, gIndex) {
    return h('vxe-optgroup', {
      key: gIndex,
      props: {
        label: group[groupLabel]
      }
    }, renderOption(h, _vm, group[groupOptions]));
  }) : [];
}

var _default2 = {
  name: 'VxeSelect',
  props: {
    value: null,
    clearable: Boolean,
    placeholder: String,
    disabled: Boolean,
    prefixIcon: String,
    placement: String,
    options: Array,
    optionProps: Object,
    optionGroups: Array,
    optionGroupProps: Object,
    size: String,
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.select.transfer;
      }
    }
  },
  components: {
    VxeInput: _input.default
  },
  provide: function provide() {
    return {
      $xeselect: this
    };
  },
  data: function data() {
    return {
      updateFlag: 0,
      panelIndex: 0,
      optionList: [],
      allOptList: [],
      panelStyle: null,
      panelPlacement: null,
      currentValue: null,
      visiblePanel: false,
      animatVisible: false,
      isActivated: false
    };
  },
  computed: {
    vSize: function vSize() {
      return this.size || this.$parent.size || this.$parent.vSize;
    },
    selectLabel: function selectLabel() {
      var selectOption = findOption(this.allOptList, this.value);

      if (selectOption) {
        return selectOption.label;
      }

      return '';
    }
  },
  watch: {
    updateFlag: function updateFlag() {
      this.updateOptComps();
    }
  },
  created: function created() {
    _tools.GlobalEvent.on(this, 'mousedown', this.handleGlobalMousedownEvent);

    _tools.GlobalEvent.on(this, 'keydown', this.handleGlobalKeydownEvent);

    _tools.GlobalEvent.on(this, 'mousewheel', this.handleGlobalMousewheelEvent);

    _tools.GlobalEvent.on(this, 'blur', this.handleGlobalBlurEvent);
  },
  mounted: function mounted() {
    if (this.transfer) {
      document.body.appendChild(this.$refs.panel);
    }
  },
  beforeDestroy: function beforeDestroy() {
    var panelElem = this.$refs.panel;

    if (panelElem && panelElem.parentNode) {
      panelElem.parentNode.removeChild(panelElem);
    }
  },
  destroyed: function destroyed() {
    _tools.GlobalEvent.off(this, 'mousedown');

    _tools.GlobalEvent.off(this, 'keydown');

    _tools.GlobalEvent.off(this, 'mousewheel');

    _tools.GlobalEvent.off(this, 'blur');
  },
  render: function render(h) {
    var _ref, _ref2;

    var vSize = this.vSize,
        transfer = this.transfer,
        isActivated = this.isActivated,
        disabled = this.disabled,
        clearable = this.clearable,
        placeholder = this.placeholder,
        selectLabel = this.selectLabel,
        animatVisible = this.animatVisible,
        visiblePanel = this.visiblePanel,
        panelStyle = this.panelStyle,
        prefixIcon = this.prefixIcon,
        panelPlacement = this.panelPlacement,
        optionGroups = this.optionGroups;
    return h('div', {
      class: ['vxe-select', (_ref = {}, _defineProperty(_ref, "size--".concat(vSize), vSize), _defineProperty(_ref, 'is--visivle', visiblePanel), _defineProperty(_ref, 'is--disabled', disabled), _defineProperty(_ref, 'is--active', isActivated), _ref)]
    }, [h('vxe-input', {
      ref: 'input',
      props: {
        clearable: clearable,
        placeholder: placeholder,
        readonly: true,
        disabled: disabled,
        type: 'text',
        prefixIcon: prefixIcon,
        suffixIcon: visiblePanel ? _conf.default.icon.selectOpen : _conf.default.icon.selectClose,
        value: selectLabel
      },
      on: {
        clear: this.clearEvent,
        click: this.togglePanelEvent,
        focus: this.focusEvent,
        'suffix-click': this.togglePanelEvent
      }
    }), h('div', {
      ref: 'panel',
      class: ['vxe-dropdown--panel vxe-select--panel', (_ref2 = {}, _defineProperty(_ref2, "size--".concat(vSize), vSize), _defineProperty(_ref2, 'is--transfer', transfer), _defineProperty(_ref2, 'animat--leave', animatVisible), _defineProperty(_ref2, 'animat--enter', visiblePanel), _ref2)],
      attrs: {
        'data-placement': panelPlacement
      },
      style: panelStyle
    }, [h('div', {
      class: 'vxe-select-option--wrapper'
    }, this.$slots.default || (optionGroups ? renderOptgroup(h, this) : renderOption(h, this, this.options)))])]);
  },
  methods: {
    updateOptions: function updateOptions() {
      this.updateFlag++;
    },
    updateOptComps: function updateOptComps() {
      var _this = this;

      return this.$nextTick().then(function () {
        var oList = [];
        var allList = [];

        _this.$children.forEach(function (group) {
          if (group.$xeselect) {
            var optChilds = [];
            var allOptChilds = [];
            var isGroup = group.$children.length;
            group.$children.forEach(function (option) {
              if (option.$xeselect && option.$xeoptgroup) {
                if (!option.isDisabled) {
                  optChilds.push({
                    label: option.label,
                    value: option.value,
                    disabled: option.isDisabled,
                    id: option.id
                  });
                }

                allOptChilds.push({
                  label: option.label,
                  value: option.value,
                  disabled: option.isDisabled,
                  id: option.id
                });
              }
            });

            if (isGroup) {
              if (optChilds.length) {
                oList.push({
                  label: group.label,
                  disabled: group.disabled,
                  options: optChilds
                });
              }

              if (allOptChilds.length) {
                allList.push({
                  label: group.label,
                  disabled: group.disabled,
                  options: allOptChilds
                });
              }
            } else {
              if (!group.disabled) {
                oList.push({
                  label: group.label,
                  value: group.value,
                  disabled: group.disabled,
                  id: group.id
                });
              }

              allList.push({
                label: group.label,
                value: group.value,
                disabled: group.disabled,
                id: group.id
              });
            }
          }
        });

        _this.optionList = oList;
        _this.allOptList = allList;
      });
    },
    setCurrentOption: function setCurrentOption(option) {
      var _this2 = this;

      if (option) {
        this.currentValue = option.value;
        this.$nextTick(function () {
          _tools.DomTools.toView(_this2.$refs.panel.querySelector("[data-option-id='".concat(option.id, "']")));
        });
      }
    },
    clearEvent: function clearEvent(params, evnt) {
      this.clearValueEvent(evnt, null);
      this.hideOptionPanel();
    },
    clearValueEvent: function clearValueEvent(evnt, selectValue) {
      this.changeEvent(evnt, selectValue);
      this.$emit('clear', {
        value: selectValue,
        $event: evnt
      }, evnt);
    },
    changeEvent: function changeEvent(evnt, selectValue) {
      if (selectValue !== this.value) {
        this.$emit('input', selectValue);
        this.$emit('change', {
          value: selectValue,
          $event: evnt
        }, evnt);
      }
    },
    changeOptionEvent: function changeOptionEvent(evnt, selectValue) {
      this.changeEvent(evnt, selectValue);
      this.hideOptionPanel();
    },
    handleGlobalMousedownEvent: function handleGlobalMousedownEvent(evnt) {
      var $refs = this.$refs,
          $el = this.$el,
          disabled = this.disabled,
          visiblePanel = this.visiblePanel;

      if (!disabled) {
        this.isActivated = _tools.DomTools.getEventTargetNode(evnt, $el).flag || _tools.DomTools.getEventTargetNode(evnt, $refs.panel).flag;

        if (visiblePanel && !this.isActivated) {
          this.hideOptionPanel();
        }
      }
    },
    handleGlobalKeydownEvent: function handleGlobalKeydownEvent(evnt) {
      var visiblePanel = this.visiblePanel,
          currentValue = this.currentValue,
          clearable = this.clearable,
          disabled = this.disabled;

      if (!disabled) {
        var keyCode = evnt.keyCode;
        var isTab = keyCode === 9;
        var isEnter = keyCode === 13;
        var isEsc = keyCode === 27;
        var isUpArrow = keyCode === 38;
        var isDwArrow = keyCode === 40;
        var isDel = keyCode === 46;

        if (isTab) {
          this.isActivated = false;
        }

        if (visiblePanel) {
          if (isEsc || isTab) {
            this.hideOptionPanel();
          } else if (isEnter) {
            this.changeOptionEvent(evnt, currentValue);
          } else if (isUpArrow || isDwArrow) {
            evnt.preventDefault();
            var groupList = this.optionList;

            var _findOffsetOption = findOffsetOption(groupList, currentValue, isUpArrow),
                offsetOption = _findOffsetOption.offsetOption,
                firstOption = _findOffsetOption.firstOption;

            if (!offsetOption && !findOption(groupList, currentValue)) {
              offsetOption = firstOption;
            }

            this.setCurrentOption(offsetOption);
          }
        } else if (isEnter && this.isActivated) {
          this.showOptionPanel();
        }

        if (isDel && clearable && this.isActivated) {
          this.clearValueEvent(evnt, null);
        }
      }
    },
    handleGlobalMousewheelEvent: function handleGlobalMousewheelEvent(evnt) {
      if (!_tools.DomTools.getEventTargetNode(evnt, this.$el).flag && !_tools.DomTools.getEventTargetNode(evnt, this.$refs.panel).flag) {
        this.hideOptionPanel();
      }
    },
    handleGlobalBlurEvent: function handleGlobalBlurEvent() {
      this.hideOptionPanel();
    },
    updateZindex: function updateZindex() {
      if (this.panelIndex < _tools.UtilTools.getLastZIndex()) {
        this.panelIndex = _tools.UtilTools.nextZIndex();
      }
    },
    focusEvent: function focusEvent() {
      if (!this.disabled) {
        this.isActivated = true;
      }
    },
    togglePanelEvent: function togglePanelEvent(params, evnt) {
      evnt.preventDefault();

      if (this.visiblePanel) {
        this.hideOptionPanel();
      } else {
        this.showOptionPanel();
      }
    },
    showOptionPanel: function showOptionPanel() {
      var _this3 = this;

      if (!this.disabled) {
        clearTimeout(this.hidePanelTimeout);
        this.isActivated = true;
        this.animatVisible = true;
        setTimeout(function () {
          _this3.visiblePanel = true;

          _this3.setCurrentOption(findOption(_this3.allOptList, _this3.value));
        }, 10);
        this.updateZindex();
        this.updatePlacement();
      }
    },
    hideOptionPanel: function hideOptionPanel() {
      var _this4 = this;

      this.visiblePanel = false;
      this.hidePanelTimeout = setTimeout(function () {
        _this4.animatVisible = false;
      }, 200);
    },
    updatePlacement: function updatePlacement() {
      var _this5 = this;

      this.$nextTick(function () {
        var $refs = _this5.$refs,
            transfer = _this5.transfer,
            placement = _this5.placement,
            panelIndex = _this5.panelIndex;
        var inputElem = $refs.input.$el;
        var panelElem = $refs.panel;
        var inputHeight = inputElem.offsetHeight;
        var inputWidth = inputElem.offsetWidth;
        var panelHeight = panelElem.offsetHeight;
        var panelStyle = {
          zIndex: panelIndex
        };

        var _DomTools$getAbsolute = _tools.DomTools.getAbsolutePos(inputElem),
            boundingTop = _DomTools$getAbsolute.boundingTop,
            boundingLeft = _DomTools$getAbsolute.boundingLeft,
            visibleHeight = _DomTools$getAbsolute.visibleHeight;

        var panelPlacement = 'bottom';

        if (transfer) {
          var left = boundingLeft;
          var top = boundingTop + inputHeight;

          if (placement === 'top') {
            panelPlacement = 'top';
            top = boundingTop - panelHeight;
          } else {
            // 如果下面不够放，则向上
            if (top + panelHeight > visibleHeight) {
              panelPlacement = 'top';
              top = boundingTop - panelHeight;
            } // 如果上面不够放，则向下（优先）


            if (top < 0) {
              panelPlacement = 'bottom';
              top = boundingTop + inputHeight;
            }
          }

          Object.assign(panelStyle, {
            left: "".concat(left, "px"),
            top: "".concat(top, "px"),
            minWidth: "".concat(inputWidth, "px")
          });
        } else {
          if (placement === 'top') {
            panelPlacement = 'top';
            panelStyle.bottom = "".concat(inputHeight, "px");
          } else {
            // 如果下面不够放，则向上
            if (boundingTop + inputHeight + panelHeight > visibleHeight) {
              panelPlacement = 'top';
              panelStyle.bottom = "".concat(inputHeight, "px");
            }
          }
        }

        _this5.panelStyle = panelStyle;
        _this5.panelPlacement = panelPlacement;
      });
    },
    focus: function focus() {
      this.showOptionPanel();
      return this.$nextTick();
    },
    blur: function blur() {
      this.hideOptionPanel();
      return this.$nextTick();
    }
  }
};
exports.default = _default2;