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

var _default2 = {
  name: 'VxeButton',
  props: {
    type: String,
    size: String,
    name: [String, Number],
    content: String,
    placement: String,
    status: String,
    icon: String,
    disabled: Boolean,
    loading: Boolean,
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.button.transfer;
      }
    }
  },
  data: function data() {
    return {
      showPanel: false,
      animatVisible: false,
      panelIndex: 0,
      panelStyle: null,
      panelPlacement: null
    };
  },
  computed: {
    vSize: function vSize() {
      return this.size || this.$parent.size || this.$parent.vSize;
    },
    isText: function isText() {
      return this.type === 'text';
    },
    isFormBtn: function isFormBtn() {
      return ['submit', 'reset', 'button'].indexOf(this.type) > -1;
    },
    btnType: function btnType() {
      return this.isText ? this.type : 'button';
    },
    btnStatus: function btnStatus() {
      return this.status || (this.type === 'primary' ? this.type : null);
    }
  },
  created: function created() {
    if (this.type === 'primary') {
      _tools.UtilTools.warn('vxe.error.delProp', ['type=primary', 'status=primary']);
    }
  },
  mounted: function mounted() {
    var panelElem = this.$refs.panel;

    if (panelElem && this.transfer) {
      document.body.appendChild(panelElem);
    }
  },
  beforeDestroy: function beforeDestroy() {
    var panelElem = this.$refs.panel;

    if (panelElem && panelElem.parentNode) {
      panelElem.parentNode.removeChild(panelElem);
    }
  },
  render: function render(h) {
    var _ref,
        _ref2,
        _this = this,
        _ref3,
        _ref4;

    var $scopedSlots = this.$scopedSlots,
        $listeners = this.$listeners,
        type = this.type,
        isFormBtn = this.isFormBtn,
        btnStatus = this.btnStatus,
        btnType = this.btnType,
        vSize = this.vSize,
        name = this.name,
        disabled = this.disabled,
        loading = this.loading,
        showPanel = this.showPanel,
        animatVisible = this.animatVisible;
    return $scopedSlots.dropdowns ? h('div', {
      class: ['vxe-button--dropdown', (_ref = {}, _defineProperty(_ref, "size--".concat(vSize), vSize), _defineProperty(_ref, 'is--active', showPanel), _ref)]
    }, [h('button', {
      ref: 'btn',
      class: ['vxe-button', "type--".concat(btnType), (_ref2 = {}, _defineProperty(_ref2, "size--".concat(vSize), vSize), _defineProperty(_ref2, "theme--".concat(btnStatus), btnStatus), _defineProperty(_ref2, 'is--disabled', disabled || loading), _defineProperty(_ref2, 'is--loading', loading), _ref2)],
      attrs: {
        name: name,
        type: isFormBtn ? type : 'button',
        disabled: disabled || loading
      },
      on: Object.assign({
        mouseenter: this.mouseenterEvent,
        mouseleave: this.mouseleaveEvent
      }, _xeUtils.default.objectMap($listeners, function (cb, type) {
        return function (evnt) {
          return _this.$emit(type, {
            $event: evnt
          }, evnt);
        };
      }))
    }, this.renderContent(h).concat([h('i', {
      class: "vxe-button--dropdown-arrow ".concat(_conf.default.icon.dropdownBtn)
    })])), h('div', {
      ref: 'panel',
      class: ['vxe-button--dropdown-panel', (_ref3 = {}, _defineProperty(_ref3, "size--".concat(vSize), vSize), _defineProperty(_ref3, 'animat--leave', animatVisible), _defineProperty(_ref3, 'animat--enter', showPanel), _ref3)],
      style: this.panelStyle
    }, [h('div', {
      class: 'vxe-button--dropdown-wrapper',
      on: {
        click: this.clickDropdownEvent,
        mouseenter: this.mouseenterEvent,
        mouseleave: this.mouseleaveEvent
      }
    }, $scopedSlots.dropdowns.call(this))])]) : h('button', {
      ref: 'btn',
      class: ['vxe-button', "type--".concat(btnType), (_ref4 = {}, _defineProperty(_ref4, "size--".concat(vSize), vSize), _defineProperty(_ref4, "theme--".concat(btnStatus), btnStatus), _defineProperty(_ref4, 'is--disabled', disabled || loading), _defineProperty(_ref4, 'is--loading', loading), _ref4)],
      attrs: {
        name: name,
        type: isFormBtn ? type : 'button',
        disabled: disabled || loading
      },
      on: _xeUtils.default.objectMap($listeners, function (cb, type) {
        return function (evnt) {
          return _this.$emit(type, {
            $event: evnt
          }, evnt);
        };
      })
    }, this.renderContent(h));
  },
  methods: {
    renderContent: function renderContent(h) {
      var $scopedSlots = this.$scopedSlots,
          content = this.content,
          icon = this.icon,
          loading = this.loading;
      var contents = [];

      if (loading) {
        contents.push(h('i', {
          class: ['vxe-button--loading-icon', _conf.default.icon.btnLoading]
        }));
      } else if (icon) {
        contents.push(h('i', {
          class: ['vxe-button--icon', icon]
        }));
      }

      if ($scopedSlots.default) {
        contents.push(h('span', {
          class: 'vxe-button--content'
        }, $scopedSlots.default.call(this)));
      } else if (content) {
        contents.push(h('span', {
          class: 'vxe-button--content'
        }, [_tools.UtilTools.getFuncText(content)]));
      }

      return contents;
    },
    updateZindex: function updateZindex() {
      if (this.panelIndex < _tools.UtilTools.getLastZIndex()) {
        this.panelIndex = _tools.UtilTools.nextZIndex();
      }
    },
    clickDropdownEvent: function clickDropdownEvent(evnt) {
      var _this2 = this;

      var dropdownElem = evnt.currentTarget;
      var wrapperElem = this.$refs.panel;

      var _DomTools$getEventTar = _tools.DomTools.getEventTargetNode(evnt, dropdownElem, 'vxe-button'),
          flag = _DomTools$getEventTar.flag,
          targetElem = _DomTools$getEventTar.targetElem;

      if (flag) {
        wrapperElem.dataset.active = 'N';
        this.showPanel = false;
        setTimeout(function () {
          if (wrapperElem.dataset.active !== 'Y') {
            _this2.animatVisible = false;
          }
        }, 200);
        this.$emit('dropdown-click', {
          name: targetElem.getAttribute('name'),
          $event: evnt
        }, evnt);
      }
    },
    mouseenterEvent: function mouseenterEvent() {
      var _this3 = this;

      var wrapperElem = this.$refs.panel;
      wrapperElem.dataset.active = 'Y';
      this.animatVisible = true;
      setTimeout(function () {
        if (wrapperElem.dataset.active === 'Y') {
          _this3.showPanel = true;

          _this3.updateZindex();

          _this3.updatePlacement();
        }
      }, 10);
    },
    mouseleaveEvent: function mouseleaveEvent() {
      var _this4 = this;

      var wrapperElem = this.$refs.panel;
      wrapperElem.dataset.active = 'N';
      setTimeout(function () {
        if (wrapperElem.dataset.active !== 'Y') {
          _this4.showPanel = false;
          setTimeout(function () {
            if (wrapperElem.dataset.active !== 'Y') {
              _this4.animatVisible = false;
            }
          }, 200);
        }
      }, 200);
    },
    updatePlacement: function updatePlacement() {
      var _this5 = this;

      this.$nextTick(function () {
        var $refs = _this5.$refs,
            transfer = _this5.transfer,
            placement = _this5.placement,
            panelIndex = _this5.panelIndex;
        var btnElem = $refs.btn;
        var panelElem = $refs.panel;
        var btnHeight = btnElem.offsetHeight;
        var btntWidth = btnElem.offsetWidth;
        var panelHeight = panelElem.offsetHeight;
        var panelWidth = panelElem.offsetWidth;
        var panelStyle = {
          zIndex: panelIndex,
          minWidth: "".concat(btntWidth, "px")
        };

        var _DomTools$getAbsolute = _tools.DomTools.getAbsolutePos(btnElem),
            boundingTop = _DomTools$getAbsolute.boundingTop,
            boundingLeft = _DomTools$getAbsolute.boundingLeft,
            visibleHeight = _DomTools$getAbsolute.visibleHeight;

        var panelPlacement = 'bottom';

        if (transfer) {
          var top = boundingTop + btnHeight;

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
              top = boundingTop + btnHeight;
            }
          }

          panelStyle.left = "".concat(boundingLeft, "px");
          panelStyle.top = "".concat(top, "px");
        } else {
          if (placement === 'top') {
            panelPlacement = 'top';
            panelStyle.bottom = "".concat(btnHeight, "px");
          } else {
            // 如果下面不够放，则向上
            if (boundingTop + btnHeight + panelHeight > visibleHeight) {
              panelPlacement = 'top';
              panelStyle.bottom = "".concat(btnHeight, "px");
            }
          }

          if (panelWidth > btntWidth) {
            panelStyle.left = "".concat((btntWidth - panelWidth) / 2, "px");
          }
        }

        _this5.panelStyle = panelStyle;
        _this5.panelPlacement = panelPlacement;
      });
    }
  }
};
exports.default = _default2;