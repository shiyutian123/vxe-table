import { TableRenderParams } from '../table'
import { ColumnConfig } from '../column'

/**
 * 表尾
 */
export declare class Footer {}

export interface ColumnFooterSlotParams extends ColumnFooterRenderParams {}

/**
 * 表尾渲染参数
 */
export interface ColumnFooterRenderParams extends TableRenderParams {
  /**
     * 列对象
     */
    column: ColumnConfig;
    /**
     * 相对于 columns 中的索引
     */
    columnIndex: number;
    /**
     * 相对于可视区渲染中的列索引
     */
    $columnIndex: number;
    /**
     * 相对于表尾行数据的索引
     */
    $rowIndex: number;
    /**
     * 表尾项列表
     */
    items: any[];
    /**
     * 表尾项索引
     */
    itemIndex: number;
    /**
     * 表尾数据集
     */
    data: any[][];
  }
