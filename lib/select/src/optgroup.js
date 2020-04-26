"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _tools = require("../../tools");

var _default = {
  name: 'VxeOptgroup',
  props: {
    label: {
      type: [String, Number, Boolean],
      default: ''
    },
    disabled: Boolean,
    size: String
  },
  provide: function provide() {
    return {
      $xeoptgroup: this
    };
  },
  inject: {
    $xeselect: {
      default: null
    }
  },
  computed: {
    vSize: function vSize() {
      return this.size || this.$parent.size || this.$parent.vSize;
    }
  },
  render: function render(h) {
    return h('div', {
      class: ['vxe-optgroup', {
        'is--disabled': this.disabled
      }]
    }, [h('div', {
      class: 'vxe-optgroup--title'
    }, _tools.UtilTools.getFuncText(this.label)), h('div', {
      class: 'vxe-optgroup--wrapper'
    }, this.$slots.default)]);
  }
};
exports.default = _default;