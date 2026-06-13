# 1:1 方卡比例 2025-06-13

## 变更

### 数据层 (index.js)
- data 新增 `ratios` 数组：`{ 3:4(540×720), 1:1(540×540) }`
- data 新增 `currentRatio` / `activeRatio`
- `onSelectRatio` handler → 同步更新 canvasDisplayW/H

### 渲染层 (index.js + renderer.js)
- `runDrawPipe`: W/H 从 `this.data.activeRatio` 读取，不再硬编码
- `renderer.js`: `maxPhysLines` 从固定 14 → `Math.floor(H/52)` 自适应
  - 3:4(720) → 13 行, 1:1(540) → 10 行

### UI 层 (WXML + WXSS)
- 模板栏上方新增比例选择行：`竖版 3:4` / `方卡 1:1`
- 预览卡 `aspect-ratio: {{w}}/{{h}}` 动态适应
- 选中态：暖橙细框 + 微底 + 600 weight

## 兼容性
- 装饰元件全用百分比坐标 → 1:1 无需改动
- 星空星点 zones 基于 W/H 相对坐标 → 自动适应
- 签注/水印位置用 H-const → 自动上移
