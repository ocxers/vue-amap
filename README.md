# Vue + 高德地图

## Environment

- `Node = 8.10`
- `Vue = ^2.5.16`
- `Element-UI = 2.13.2`

## 安装

Install dependencies:
 
    npm install

## 运行

``` bash
# serve with hot reload at localhost:8903
npm run dev
```

![image](https://github.com/ocxers/vue-amap/blob/master/src/assets/img/screenshot.png?raw=true)

## 功能说明
### 图层管理
+ 该面板的最大高度为window高度的`60%`
+ 点击`+`从本地载入.geojson文件
+ 点击`向下`箭头, 可折叠图层面板
+ 鼠标`hover`在图层列表上, 地图上对应的`marker`会高亮显示
+ 图层列表可以`拖放`改变图层顺序, 最上面的图层的`marker`可以被框选. 拖放操作会清空框选的`marker`列表
+ 可通过点击`眼睛`图标来切换该`图层`的`marker`是否在地图上显示
+ 可通过点击`删除`图标来删除对应的`图层`, 并从地图上移除该图层上的所有`marker`

### 框选Marker
+ 该面板的最大高度为window高度的`60%`
+ 可选择框选的形状`圆形`和`矩形`
+ 点击`向下`箭头, 可折叠该面板
+ 点击列表中的`marker`, 地图会重新设置`marker`为地图中心, 并且该`marker`的图标也会变成不一样的图标
+ 点击底部的`清除`按钮, 将清除所有框选的`marker`, 并清除框选状态
+ 点击底部的`导出`按钮, 将导出所有框选的`marker`为`.geojson`文件
+ 底部右下角的`数字`表示当前选中的`marker`的个数

### 地图
+ 鼠标移到`图标`上, 会显示该图标的`名称`
+ 在地图上点击`鼠标右键`会`清除`所有选中的`marker`, 

