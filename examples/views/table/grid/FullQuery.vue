<template>
  <div>
    <p class="tip">数据代理<a class="link" href="https://github.com/xuliangzhan/vxe-table-demo/tree/master/vxe-table-by-vue-grid-proxy">（配置式代理项目示例）</a>、固定列、服务端排序、服务端筛选、服务端分页，对于分页场景下，如果想要保留选中状态，可以通过设置 <table-api-link prop="radio-config"/> 的 <table-api-link prop="reserve"/> 属性</p>

    <vxe-grid
      resizable
      form-config
      show-overflow
      export-config
      border="inner"
      ref="xGrid"
      height="548"
      row-id="id"
      :sort-config="{trigger: 'cell', defaultSort: {field: 'name', order: 'desc'}}"
      :filter-config="{remote: true}"
      :pager-config="tablePage"
      :toolbar="tableToolbar"
      :columns="tableColumn"
      :proxy-config="tableProxy"
      :radio-config="{labelField: 'id', reserve: true, highlight: true}">

      <template v-slot:buttons>
        <vxe-form :data="formData" @submit="searchEvent">
          <vxe-form-item field="name" :item-render="{name: 'input', attrs: {placeholder: '请输入名称'}}"></vxe-form-item>
          <vxe-form-item :item-render="{name: 'input', attrs: {type: 'submit', value: $t('app.body.label.search')}}"></vxe-form-item>
        </vxe-form>
      </template>

      <template v-slot:empty>
        <span style="color: red;">
          <img src="static/other/img1.gif">
          <p>没有更多数据了！</p>
        </span>
      </template>
    </vxe-grid>

    <p class="demo-code">{{ $t('app.body.button.showCode') }}</p>

    <pre>
      <code class="xml">{{ demoCodes[0] }}</code>
      <code class="javascript">{{ demoCodes[1] }}</code>
    </pre>
  </div>
</template>

<script>
import XEAjax from 'xe-ajax'
import hljs from 'highlight.js'

export default {
  data () {
    return {
      formData: {
        name: ''
      },
      tablePage: {
        pageSize: 15,
        pageSizes: [5, 15, 20, 50, 100, 200, 500, 1000]
      },
      tableProxy: {
        seq: true, // 启用动态序号代理
        sort: true, // 启用排序代理
        filter: true, // 启用筛选代理
        ajax: {
          // 任何支持 Promise API 的库都可以对接（fetch、jquery、axios、xe-ajax）
          query: ({ page, sort, filters }) => {
            // 处理排序条件
            const queryParams = Object.assign({
              sort: sort.property,
              order: sort.order
            }, this.formData)
            // 处理筛选条件
            filters.forEach(({ field, values }) => {
              queryParams[field] = values.join(',')
            })
            return XEAjax.get(`/api/user/page/list/${page.pageSize}/${page.currentPage}`, queryParams)
          }
        }
      },
      tableToolbar: {
        export: true,
        custom: true
      },
      tableColumn: [
        { type: 'seq', width: 60, fixed: 'left' },
        { type: 'radio', title: 'ID', width: 120, fixed: 'left' },
        { field: 'name', title: 'Name', minWidth: 300, remoteSort: true },
        { field: 'nickname', title: 'Nickname', remoteSort: true, minWidth: 300 },
        { field: 'age', title: 'Age', visible: false, remoteSort: true, width: 100 },
        {
          field: 'role',
          title: 'Role',
          visible: false,
          remoteSort: true,
          width: 200,
          filters: [
            { label: '前端开发', value: '前端' },
            { label: '后端开发', value: '后端' },
            { label: '测试', value: '测试' },
            { label: '程序员鼓励师', value: '程序员鼓励师' }
          ],
          filterMultiple: false
        },
        { field: 'describe', title: 'Describe', minWidth: 300, showOverflow: true }
      ],
      demoCodes: [
        `
        <vxe-grid
          resizable
          form-config
          show-overflow
          export-config
          border="inner"
          ref="xGrid"
          height="548"
          row-id="id"
          :sort-config="{trigger: 'cell', defaultSort: {field: 'name', order: 'desc'}}"
          :filter-config="{remote: true}"
          :pager-config="tablePage"
          :toolbar="tableToolbar"
          :columns="tableColumn"
          :proxy-config="tableProxy"
          :radio-config="{labelField: 'id', reserve: true, highlight: true}">

          <template v-slot:buttons>
            <vxe-form :data="formData" @submit="searchEvent">
              <vxe-form-item field="name" :item-render="{name: 'input', attrs: {placeholder: '请输入名称'}}"></vxe-form-item>
              <vxe-form-item :item-render="{name: 'input', attrs: {type: 'submit', value: $t('app.body.label.search')}}"></vxe-form-item>
            </vxe-form>
          </template>

          <template v-slot:empty>
            <span style="color: red;">
              <img src="static/other/img1.gif">
              <p>没有更多数据了！</p>
            </span>
          </template>
        </vxe-grid>
        `,
        `
        export default {
          data () {
            return {
              formData: {
                name: ''
              },
              tablePage: {
                pageSize: 15,
                pageSizes: [5, 15, 20, 50, 100, 200, 500, 1000]
              },
              tableProxy: {
                seq: true, // 启用动态序号代理
                sort: true, // 启用排序代理
                filter: true, // 启用筛选代理
                ajax: {
                  // 任何支持 Promise API 的库都可以对接（fetch、jquery、axios、xe-ajax）
                  query: ({ page, sort, filters }) => {
                    // 处理排序条件
                    let queryParams = Object.assign({
                      sort: sort.property,
                      order: sort.order
                    }, this.formData)
                    // 处理筛选条件
                    filters.forEach(({ column, property, values }) => {
                      queryParams[property] = values.join(',')
                    })
                    return XEAjax.get(\`/api/user/page/list/\${page.pageSize}/\${page.currentPage}\`, queryParams)
                  }
                }
              },
              tableToolbar: {
                export: true,
                custom: true
              },
              tableColumn: [
                { type: 'seq', width: 60, fixed: 'left' },
                { type: 'radio', title: 'ID', width: 120, fixed: 'left' },
                { field: 'name', title: 'Name', minWidth: 300, remoteSort: true },
                { field: 'nickname', title: 'Nickname', remoteSort: true, minWidth: 300 },
                { field: 'age', title: 'Age', visible: false, remoteSort: true, width: 100 },
                {
                  field: 'role',
                  title: 'Role',
                  visible: false,
                  remoteSort: true,
                  width: 200,
                  filters: [
                    { label: '前端开发', value: '前端' },
                    { label: '后端开发', value: '后端' },
                    { label: '测试', value: '测试' },
                    { label: '程序员鼓励师', value: '程序员鼓励师' }
                  ],
                  filterMultiple: false
                },
                { field: 'describe', title: 'Describe', minWidth: 300, showOverflow: true }
              ]
            }
          },
          methods: {
            searchEvent () {
              this.$refs.xGrid.commitProxy('reload')
            }
          }
        }
        `
      ]
    }
  },
  mounted () {
    Array.from(this.$el.querySelectorAll('pre code')).forEach((block) => {
      hljs.highlightBlock(block)
    })
  },
  methods: {
    searchEvent () {
      this.$refs.xGrid.commitProxy('reload')
    }
  }
}
</script>
