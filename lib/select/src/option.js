"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _tools = require("../../tools");

var optionUniqueId = 0;
var watch = {};
var wProps = ['value', 'label', 'disabled'];
wProps.forEach(function (name) {
  watch[name] = function () {
    this.$xeselect.updateOptions();
  };
});
var _default = {
  name: 'VxeOption',
  props: {
    value: null,
    label: {
      type: [String, Number, Boolean],
      default: ''
    },
    disabled: Boolean,
    size: String
  },
  inject: {
    $xeselect: {
      default: null
    },
    $xeoptgroup: {
      default: null
    }
  },
  data: function data() {
    return {
      id: "option_".concat(++optionUniqueId)
    };
  },
  computed: {
    vSize: function vSize() {
      return this.size || this.$parent.size || this.$parent.vSize;
    },
    isDisabled: function isDisabled() {
      var $xeoptgroup = this.$xeoptgroup,
          disabled = this.disabled;
      return $xeoptgroup && $xeoptgroup.disabled || disabled;
    }
  },
  watch: watch,
  mounted: function mounted() {
    this.$xeselect.updateOptions();
  },
  destroyed: function destroyed() {
    this.$xeselect.updateOptions();
  },
  render: function render(h) {
    var $slots = this.$slots,
        $xeselect = this.$xeselect,
        id = this.id,
        isDisabled = this.isDisabled,
        value = this.value;
    return h('div', {
      class: ['vxe-select-option', {
        'is--disabled': isDisabled,
        'is--checked': $xeselect.value === value,
        'is--hover': $xeselect.currentValue === value
      }],
      attrs: {
        'data-option-id': id
      },
      on: {
        click: this.optionEvent,
        mouseenter: this.mouseenterEvent
      }
    }, $slots.default || _tools.UtilTools.formatText(_tools.UtilTools.getFuncText(this.label)));
  },
  methods: {
    optionEvent: function optionEvent(evnt) {
      if (!this.isDisabled) {
        this.$xeselect.changeOptionEvent(evnt, this.value);
      }
    },
    mouseenterEvent: function mouseenterEvent() {
      if (!this.isDisabled) {
        this.$xeselect.setCurrentOption(this);
      }
    }
  }
};
exports.default = _default;