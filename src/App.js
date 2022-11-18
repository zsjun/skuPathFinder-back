import React, { Component } from "react";
import { Button } from "antd";
import { getPrime, PathFinder, descartes } from "./components/";
import "antd/dist/antd.css";
export default class Demo extends Component {
  state = {
    // type: 规格类型,每个规格是指type中的一个值，比如男裤，女裤，黑色，白色等
    type: [
      ["男裤", "女裤"],
      ["黑色", "白色"],
      ["S", "L"],
    ],
    // 规格
    // 已经选中的规格
    selected: [],
    // 可选规格，就是可以选择的规格,比如当前是否可以选择黑裤
    unDisabled: [],
    // 可选规格，这里是指当前可选sku的质数的乘积
    canUseSku: [],
    // 质数，规格枚举值,规格对应的质数，比如
    // {
    //   "L": 13,
    //   "S":11,
    //   "女裤":3,
    //   "男裤":2,
    //   "白色":7,
    //   "黑色":5
    // }
    valueInLabel: {},
  };
  // 预留sku工具包
  pathFinder;

  componentDidMount() {
    // 获取全部规格
    const { type } = this.state;
    // 抹平规格内容
    const types = type.flat();
    // 通过抹平规格，获取规格对应质数
    const prime = getPrime(types.length);
    console.log(123, prime);
    // 质数对应规格数 枚举值处理
    const valueInLabel = {};
    // 质数对应的规格数
    types.forEach((item, index) => {
      valueInLabel[item] = prime[index];
    });

    // 根据规格坐标，排序质数坐标
    // 规格对应的每个质数,类似下面这种
    // [[2,3],
    //  [5,7],
    //  [11,13]
    // ]
    const way = type.map((i) => {
      return i.map((ii) => valueInLabel[ii]);
    });
    // 使用笛卡尔积计算下sku
    const sku = descartes(type).map((item) => {
      return {
        // 随机库存数量
        stock: Math.floor(Math.random() * 10) > 5 ? 0 : 1,
        // sku中保存的规格
        skuName: item,
        // 规格对应质数
        skuPrime: item.map((ii) => valueInLabel[ii]),
      };
    });

    // console.log(
    //   1122,
    //   sku.filter((item) => item.stock)
    // );

    const canUseSku = [
      {
        // 当前SKU的可选数量
        stock: 1,
        // 当前SKU包含的规格
        skuName: ["男裤", "黑色", "S"],
        // 当前SKU包含的规格对应的质数
        skuPrime: [2, 5, 11],
      },
      {
        stock: 1,
        skuName: ["男裤", "白色", "L"],
        skuPrime: [2, 7, 13],
      },
      {
        stock: 1,
        skuName: ["女裤", "黑色", "L"],
        skuPrime: [3, 5, 13],
      },
      // {
      //   stock: 1,
      //   skuName: ["女裤", "白色", "S"],
      //   skuPrime: [3, 7, 11],
      // },
      // {
      //   stock: 1,
      //   skuName: ["女裤", "白色", "L"],
      //   skuPrime: [3, 7, 13],
      // },
    ];

    // 筛选可选的 SKU
    // const canUseSku = sku.filter((item) => item.stock);

    // 初始化规格展示内容,初始化pathFinder方法
    this.pathFinder = new PathFinder(
      way,
      canUseSku.map((item) => item.skuPrime)
    );
    // 获取可选规格内容，拍平变成质数数组
    const unDisabled = this.pathFinder.getWay().flat();
    this.setState({
      canUseSku,
      unDisabled,
      valueInLabel,
    });
  }

  /**
   * 点击选择规格
   * @param {String} type 表示选择的是什么规格，比如是黑裤，还是女裤，还是S或者L
   * @param {Number} prime 规格对应的质数
   *  @param {primeIndex} primeIndex 规格对应的类型，比如黑裤在第几行
   */
  onClickSelType = (type, prime, primeIndex) => {
    // 获取已经选中的规格,质数，规格枚举值,以及原本规格名称
    const { selected, valueInLabel, type: stateType } = this.state;
    // 检查此次选择是否在已选内容中
    const index = selected.indexOf(type);
    // 获取已经有的矩阵值，也就是如果某个位置是2，说明规格被选中
    const light = this.pathFinder.light;
    console.log(333, light);
    // 如果未选中则提供选中，如果选中移除
    if (index > -1) {
      this.pathFinder.remove(prime);
      selected.splice(index, 1);
      // 当前同一行中已经有被选择的了，比如如果你已经选择了男裤，那么再点击女裤的时候，就进入到这里，2表示已经被选中
    } else if (light[primeIndex].includes(2)) {
      // 如果同类型中，有规格被选中，则先移除选中的规格，
      // 获取需要移除的同行规格
      const removeType = stateType[primeIndex][light[primeIndex].indexOf(2)];
      // 获取需要得到需要删除的规格对应的质数
      const removePrime = valueInLabel[removeType];
      // 移除已经被选中的规格
      this.pathFinder.remove(removePrime);
      selected.splice(selected.indexOf(removeType), 1);
      //移除同行后，添加当前选择规格
      this.pathFinder.add(prime);
      selected.push(type);
    } else {
      this.pathFinder.add(prime);
      selected.push(type);
    }

    // 更新不可选规格
    const unDisabled = this.pathFinder.getWay().flat();

    this.setState({
      selected,
      unDisabled,
    });
  };

  render() {
    const { type, selected, unDisabled, canUseSku, valueInLabel } = this.state;

    const typeBtns = type.map((item, index) => {
      return (
        <div style={{ margin: 10 }} key={index}>
          {item.map((btn, index) => {
            return (
              <Button
                key={index}
                style={{ margin: "0 10px" }}
                type={selected.includes(btn) ? "primary" : ""}
                disabled={!unDisabled.includes(valueInLabel[btn])}
                onClick={() => {
                  console.log(1223, btn, valueInLabel[btn]);
                  // btn选择的规格的值，比如黑色，valueInLabel[btn]对应的质数，index是表示类型索引
                  this.onClickSelType(btn, valueInLabel[btn], index);
                }}
              >
                {btn}
              </Button>
            );
          })}
        </div>
      );
    });

    const canUseSkuNode = canUseSku.map((item, index) => {
      return (
        <Button style={{ margin: "0 10px" }} key={`${index}${item}`}>
          {item.skuName}
        </Button>
      );
    });
    return (
      <div>
        <h3>React SKU 展示模版</h3>
        {/* 此处引入设计的业务组件 */}
        <div>
          规格：
          {typeBtns}
          可选的SKU：
          {canUseSkuNode}
        </div>
      </div>
    );
  }
}
