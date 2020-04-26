import XEUtils from 'xe-utils/methods/xe-utils'
import { UtilTools, DomTools } from '../../tools'

const getAllColumns = (columns) => {
  const result = []
  columns.forEach((column) => {
    if (column.visible) {
      if (column.children && column.children.length && column.children.some(column => column.visible)) {
        result.push(column)
        result.push(...getAllColumns(column.children))
      } else {
        result.push(column)
      }
    }
  })
  return result
}

const convertToRows = (originColumns) => {
  let maxLevel = 1
  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1
      if (maxLevel < column.level) {
        maxLevel = column.level
      }
    }
    if (column.children && column.children.length && column.children.some(column => column.visible)) {
      let colSpan = 0
      column.children.forEach((subColumn) => {
        if (subColumn.visible) {
          traverse(subColumn, column)
          colSpan += subColumn.colSpan
        }
      })
      column.colSpan = colSpan
    } else {
      column.colSpan = 1
    }
  }

  originColumns.forEach((column) => {
    column.level = 1
    traverse(column)
  })

  const rows = []
  for (let i = 0; i < maxLevel; i++) {
    rows.push([])
  }

  const allColumns = getAllColumns(originColumns)

  allColumns.forEach((column) => {
    if (column.children && column.children.length && column.children.some(column => column.visible)) {
      column.rowSpan = 1
    } else {
      column.rowSpan = maxLevel - column.level + 1
    }
    rows[column.level - 1].push(column)
  })

  return rows
}

export default {
  name: 'VxeTableHeader',
  props: {
    tableData: Array,
    tableColumn: Array,
    visibleColumn: Array,
    collectColumn: Array,
    fixedColumn: Array,
    size: String,
    fixedType: String,
    isGroup: Boolean
  },
  data () {
    return {
      headerColumn: []
    }
  },
  watch: {
    tableColumn () {
      this.uploadColumn()
    }
  },
  created () {
    this.uploadColumn()
  },
  mounted () {
    const { $parent: $xetable, $el, $refs, fixedType } = this
    const { elemStore } = $xetable
    const prefix = `${fixedType || 'main'}-header-`
    elemStore[`${prefix}wrapper`] = $el
    elemStore[`${prefix}table`] = $refs.table
    elemStore[`${prefix}colgroup`] = $refs.colgroup
    elemStore[`${prefix}list`] = $refs.thead
    elemStore[`${prefix}xSpace`] = $refs.xSpace
    elemStore[`${prefix}repair`] = $refs.repair
  },
  render (h) {
    const { _e, $parent: $xetable, fixedType, headerColumn, fixedColumn } = this
    let { tableColumn } = this
    const {
      $listeners: tableListeners,
      id,
      resizable,
      border,
      columnKey,
      headerRowClassName,
      headerCellClassName,
      headerRowStyle,
      headerCellStyle,
      showHeaderOverflow: allColumnHeaderOverflow,
      headerAlign: allHeaderAlign,
      align: allAlign,
      highlightCurrentColumn,
      currentColumn,
      mouseConfig,
      mouseOpts,
      scrollXLoad,
      overflowX,
      scrollbarWidth,
      getColumnIndex,
      sortOpts
    } = $xetable
    const isMouseSelected = mouseConfig && mouseOpts.selected
    // 在 v3.0 中废弃 mouse-config.checked
    const isMouseChecked = mouseConfig && (mouseOpts.range || mouseOpts.checked)
    // 横向滚动渲染
    if (scrollXLoad) {
      if (fixedType) {
        tableColumn = fixedColumn
      }
    }
    return h('div', {
      class: ['vxe-table--header-wrapper', fixedType ? `fixed-${fixedType}--wrapper` : 'body--wrapper'],
      attrs: {
        'data-tid': id
      }
    }, [
      fixedType ? _e() : h('div', {
        class: 'vxe-body--x-space',
        ref: 'xSpace'
      }),
      h('table', {
        class: 'vxe-table--header',
        attrs: {
          'data-tid': id,
          cellspacing: 0,
          cellpadding: 0,
          border: 0
        },
        ref: 'table'
      }, [
        /**
         * 列宽
         */
        h('colgroup', {
          ref: 'colgroup'
        }, tableColumn.map((column, columnIndex) => {
          const isColGroup = column.children && column.children.length
          return h('col', {
            attrs: {
              name: column.id
            },
            key: columnKey || isColGroup ? column.id : columnIndex
          })
        }).concat(scrollbarWidth ? [
          h('col', {
            attrs: {
              name: 'col_gutter'
            }
          })
        ] : [])),
        /**
         * 头部
         */
        h('thead', {
          ref: 'thead'
        }, headerColumn.map((cols, $rowIndex) => {
          return h('tr', {
            class: ['vxe-header--row', headerRowClassName ? XEUtils.isFunction(headerRowClassName) ? headerRowClassName({ $table: $xetable, $rowIndex, fixed: fixedType }) : headerRowClassName : ''],
            style: headerRowStyle ? (XEUtils.isFunction(headerRowStyle) ? headerRowStyle({ $table: $xetable, $rowIndex, fixed: fixedType }) : headerRowStyle) : null
          }, cols.map((column, $columnIndex) => {
            const { showHeaderOverflow, headerAlign, align, headerClassName } = column
            const isColGroup = column.children && column.children.length
            const fixedHiddenColumn = fixedType ? column.fixed !== fixedType && !isColGroup : column.fixed && overflowX
            const headOverflow = XEUtils.isUndefined(showHeaderOverflow) || XEUtils.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow
            const headAlign = headerAlign || align || allHeaderAlign || allAlign
            let showEllipsis = headOverflow === 'ellipsis'
            const showTitle = headOverflow === 'title'
            const showTooltip = headOverflow === true || headOverflow === 'tooltip'
            let hasEllipsis = showTitle || showTooltip || showEllipsis
            const thOns = {}
            const hasFilter = column.filters && column.filters.some(item => item.checked)
            // 确保任何情况下 columnIndex 都精准指向真实列索引
            const columnIndex = getColumnIndex(column)
            const params = { $table: $xetable, $rowIndex, column, columnIndex, $columnIndex, fixed: fixedType, isHidden: fixedHiddenColumn, hasFilter }
            // 虚拟滚动不支持动态高度
            if (scrollXLoad && !hasEllipsis) {
              showEllipsis = hasEllipsis = true
            }
            if (showTitle || showTooltip) {
              thOns.mouseenter = evnt => {
                if ($xetable._isResize) {
                  return
                }
                if (showTitle) {
                  DomTools.updateCellTitle(evnt)
                } else if (showTooltip) {
                  $xetable.triggerHeaderTooltipEvent(evnt, params)
                }
              }
            }
            if (showTooltip) {
              thOns.mouseleave = evnt => {
                if ($xetable._isResize) {
                  return
                }
                if (showTooltip) {
                  $xetable.handleTargetLeaveEvent(evnt)
                }
              }
            }
            if (highlightCurrentColumn || tableListeners['header-cell-click'] || isMouseChecked || sortOpts.trigger === 'cell') {
              thOns.click = evnt => $xetable.triggerHeaderCellClickEvent(evnt, params)
            }
            if (tableListeners['header-cell-dblclick']) {
              thOns.dblclick = evnt => $xetable.triggerHeaderCellDBLClickEvent(evnt, params)
            }
            // 按下事件处理
            if (isMouseSelected || isMouseChecked) {
              thOns.mousedown = evnt => $xetable.triggerHeaderCellMousedownEvent(evnt, params)
            }
            const type = column.type === 'seq' || column.type === 'index' ? 'seq' : column.type
            return h('th', {
              class: ['vxe-header--column', column.id, {
                [`col--${headAlign}`]: headAlign,
                [`col--${type}`]: type,
                'col--last': $columnIndex === cols.length - 1,
                'col--fixed': column.fixed,
                'col--group': isColGroup,
                'col--ellipsis': hasEllipsis,
                'fixed--hidden': fixedHiddenColumn,
                'is--sortable': column.sortable,
                'is--filter': !!column.filters,
                'filter--active': hasFilter,
                'col--current': currentColumn === column
              }, UtilTools.getClass(headerClassName, params), UtilTools.getClass(headerCellClassName, params)],
              attrs: {
                'data-colid': column.id,
                colspan: column.colSpan,
                rowspan: column.rowSpan
              },
              style: headerCellStyle ? (XEUtils.isFunction(headerCellStyle) ? headerCellStyle(params) : headerCellStyle) : null,
              on: thOns,
              key: columnKey || isColGroup ? column.id : columnIndex
            }, [
              h('div', {
                class: ['vxe-cell', {
                  'c--title': showTitle,
                  'c--tooltip': showTooltip,
                  'c--ellipsis': showEllipsis
                }]
              }, column.renderHeader(h, params)),
              /**
               * 列宽拖动
               */
              !fixedHiddenColumn && !isColGroup && (XEUtils.isBoolean(column.resizable) ? column.resizable : resizable) ? h('div', {
                class: ['vxe-resizable', {
                  'is--line': !border || border === 'none'
                }],
                on: {
                  mousedown: evnt => this.resizeMousedown(evnt, params)
                }
              }) : null
            ])
          }).concat(scrollbarWidth ? [
            h('th', {
              class: 'col--gutter'
            })
          ] : []))
        }))
      ]),
      /**
       * 其他
       */
      h('div', {
        class: 'vxe-table--header-border-line',
        ref: 'repair'
      })
    ])
  },
  methods: {
    uploadColumn () {
      this.headerColumn = this.isGroup ? convertToRows(this.collectColumn) : [this.$parent.scrollXLoad && this.fixedType ? this.fixedColumn : this.tableColumn]
    },
    resizeMousedown (evnt, params) {
      const { column } = params
      const { $parent: $xetable, $el, fixedType } = this
      const { tableBody, leftContainer, rightContainer, resizeBar: resizeBarElem } = $xetable.$refs
      const { target: dragBtnElem, clientX: dragClientX } = evnt
      const cell = dragBtnElem.parentNode
      let dragLeft = 0
      const tableBodyElem = tableBody.$el
      const pos = DomTools.getOffsetPos(dragBtnElem, $el)
      const dragBtnWidth = dragBtnElem.clientWidth
      const dragBtnOffsetWidth = Math.floor(dragBtnWidth / 2)
      const minInterval = column.getMinWidth() - dragBtnOffsetWidth // 列之间的最小间距
      let dragMinLeft = pos.left - cell.clientWidth + dragBtnWidth + minInterval
      let dragPosLeft = pos.left + dragBtnOffsetWidth
      const domMousemove = document.onmousemove
      const domMouseup = document.onmouseup
      const isLeftFixed = fixedType === 'left'
      const isRightFixed = fixedType === 'right'

      // 计算左右侧固定列偏移量
      let fixedOffsetWidth = 0
      if (isLeftFixed || isRightFixed) {
        const siblingProp = isLeftFixed ? 'nextElementSibling' : 'previousElementSibling'
        let tempCellElem = cell[siblingProp]
        while (tempCellElem) {
          if (DomTools.hasClass(tempCellElem, 'fixed--hidden')) {
            break
          } else if (!DomTools.hasClass(tempCellElem, 'col--group')) {
            fixedOffsetWidth += tempCellElem.offsetWidth
          }
          tempCellElem = tempCellElem[siblingProp]
        }
        if (isRightFixed && rightContainer) {
          dragPosLeft = rightContainer.offsetLeft + fixedOffsetWidth
        }
      }

      // 处理拖动事件
      const updateEvent = function (evnt) {
        evnt.stopPropagation()
        evnt.preventDefault()
        const offsetX = evnt.clientX - dragClientX
        let left = dragPosLeft + offsetX
        const scrollLeft = fixedType ? 0 : tableBodyElem.scrollLeft
        if (isLeftFixed) {
          // 左固定列（不允许超过右侧固定列、不允许超过右边距）
          left = Math.min(left, (rightContainer ? rightContainer.offsetLeft : tableBodyElem.clientWidth) - fixedOffsetWidth - minInterval)
        } else if (isRightFixed) {
          // 右侧固定列（不允许超过左侧固定列、不允许超过左边距）
          dragMinLeft = (leftContainer ? leftContainer.clientWidth : 0) + fixedOffsetWidth + minInterval
          left = Math.min(left, dragPosLeft + cell.clientWidth - minInterval)
        }
        dragLeft = Math.max(left, dragMinLeft)
        resizeBarElem.style.left = `${dragLeft - scrollLeft}px`
      }
      $xetable._isResize = true
      DomTools.addClass($xetable.$el, 'c--resize')
      resizeBarElem.style.display = 'block'
      document.onmousemove = updateEvent
      document.onmouseup = function () {
        document.onmousemove = domMousemove
        document.onmouseup = domMouseup
        column.resizeWidth = column.renderWidth + (isRightFixed ? dragPosLeft - dragLeft : dragLeft - dragPosLeft)
        resizeBarElem.style.display = 'none'
        $xetable._isResize = false
        $xetable._lastResizeTime = Date.now()
        $xetable.analyColumnWidth()
        $xetable.recalculate(true)
        DomTools.removeClass($xetable.$el, 'c--resize')
        if ($xetable.$toolbar) {
          $xetable.$toolbar.updateResizable()
        }
        $xetable.$emit('resizable-change', Object.assign({ $event: evnt }, params))
      }
      updateEvent(evnt)
    }
  }
}
