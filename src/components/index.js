/* eslint-disable no-underscore-dangle */
/**
 * support two level array clone
 * @param {*} o
 * @returns
 */
function cloneTwo(o) {
  const ret = [];
  for (let j = 0; j < o.length; j++) {
    const i = o[j];
    ret.push(i.slice ? i.slice() : i);
  }
  return ret;
}

/**
 * 准备质数
 * @param {Int} num 质数范围
 * @returns []
 */
export function getPrime(total) {
  // 从第一个质数2开始
  let i = 2;
  const arr = [];
  /**
   * 检查是否是质数
   * @param {Int} number
   * @returns
   */
  const isPrime = (number) => {
    for (let ii = 2; ii < number; ++ii) {
      if (number % ii === 0) {
        return false;
      }
    }
    return true;
  };
  // 循环判断，质数数量够完成返回
  for (i; arr.length < total; ++i) {
    if (isPrime(i)) {
      arr.push(i);
    }
  }
  // 返回需要的质数
  return arr;
}

/**
 * @param {Array} maps 所有得质数集合，每个质数代表一个规格ID
 * @param {*} openWay 可用的 SKU 组合
 */
export class PathFinder {
  constructor(maps, openWay) {
    // 每个类型的规格质数，
    // 比如[[2,3],[5,7],[11,13]]
    this.maps = maps;
    // 可选的质数数组，同时也就是可选的sku对应的质数组合，比如[[2, 5, 11],[2, 7, 13],[3, 5, 13]]
    this.openWay = openWay;
    // 记录每个质数在类型中的位置，也就是在this.maps中的位置
    this._way = {};
    // 邻接矩阵,sku算法的邻接矩阵
    this.light = [];
    // 已经被选择的规格的质数的数组
    this.selected = [];
    this.init();
  }

  /**
   * 初始化，格式需要对比数据，并进行初始化是否可选计算
   */
  init() {
    // copy this.maps,
    // this.light = cloneTwo(this.maps, true);
    // 复制类型
    this.light = cloneTwo(this.maps);
    const light = this.light;

    // 默认每个规则都可以选中，即赋值为1,重置为这种
    // [
    //   [1, 1],
    //   [1, 1],
    //   [1, 1],
    // ];
    for (let i = 0; i < light.length; i++) {
      const l = light[i];
      for (let j = 0; j < l.length; j++) {
        // this._way 指的是每个质数所在原来type中的位置
        this._way[l[j]] = [i, j];
        l[j] = 1;
      }
    }

    // 得到每个可操作的 SKU 质数的集合
    for (let i = 0; i < this.openWay.length; i++) {
      // eslint-disable-next-line no-eval
      this.openWay[i] = eval(this.openWay[i].join("*"));
    }
    // return 初始化得到规格位置，规格默认可选处理，可选 SKU 的规格对应的质数合集
    this._check();
  }

  /**
   * 选中结果处理
   * @param {Boolean} isAdd 是否新增状态，也就是是否又选择了一个规格
   * @returns
   */
  _check(isAdd) {
    const light = this.light;
    const maps = this.maps;

    for (let i = 0; i < light.length; i++) {
      const li = light[i];
      // 当前选中的规格对应的质数，i是当前的行数
      const selected = this._getSelected(i);
      for (let j = 0; j < li.length; j++) {
        // 为什么需要判断为2，2表示已经被选中了
        if (li[j] !== 2) {
          // 如果是加一个条件，只在是light值为1的点进行选择
          light[i][j] = this._checkItem(maps[i][j], selected);
          // if (isAdd) {
          //   if (li[j]) {
          //     light[i][j] = this._checkItem(maps[i][j], selected);
          //     // this.count++;
          //     // console.log(1223, this.count);
          //   }
          // } else {
          //   light[i][j] = this._checkItem(maps[i][j], selected);
          //   // this.count++;
          //   // console.log(1224, this.count);
          // }
        }
      }
    }
    return this.light;
  }
  /**
   * 检查是否可选内容
   * @param {Int} item 当前规格质数
   * @param {Array} selected 当前已经选择的规格的乘积
   * @returns
   */
  _checkItem(item, selected) {
    // 拿到可以选择的 SKU 内容集合
    const openWay = this.openWay;
    // 如果选择后的乘积
    const val = item * selected;
    // 拿到已经选中规格集合*此规格集合值
    // 可选 SKU 集合反除，查询是否可选
    for (let i = 0; i < openWay.length; i++) {
      // this.count++;
      // console.log(122, this.count);
      if (openWay[i] % val === 0) {
        return 1;
      }
    }
    return 0;
  }

  /**
   * 组合中已选内容，初始化后无内容，组合中已经选择的质数，xpath是指当前选择的类型的行数
   * @param {Index} xpath
   * @returns
   */
  _getSelected(xpath) {
    const selected = this.selected;
    const _way = this._way;
    const retArr = [];
    let ret = 1;

    if (selected.length) {
      // 已经选择的质数，也就是已经选择的规格
      for (let j = 0; j < selected.length; j++) {
        const s = selected[j];
        // xpath表示同一行，当已经被选择的和当前检测的项目再同一行的时候
        // 需要忽略。
        // 必须选择了 [1, 2],检测的项目是[1, 3]，不可能存在[1, 2]和[1, 3]
        // 的组合，他们在同一行
        if (_way[s][0] !== xpath) {
          ret *= s;
          retArr.push(s);
        }
      }
    }

    return ret;
  }

  /** 选择可选规格后处理
   * @param {array} point [x, y] 选择的质数
   */
  add(point) {
    // 选择的质数
    point = point instanceof Array ? point : this._way[point];
    const val = this.maps[point[0]][point[1]];
    // 检查是否可选中
    if (!this.light[point[0]][point[1]]) {
      throw new Error(
        "this point [" + point + "] is no availabe, place choose an other"
      );
    }

    if (val in this.selected) return;

    const isAdd = this._dealChange(point, val);
    this.selected.push(val);
    this.light[point[0]][point[1]] = 2;
    this._check(!isAdd);
  }

  /**
   * 判断是否同行选中
   * @param {Array} point 选中内容坐标
   * @returns
   */
  _dealChange(point) {
    const selected = this.selected;
    // 遍历处理选中内容
    // 如果有同行选中了，需要删除掉原来同行的选中的
    for (let i = 0; i < selected.length; i++) {
      // 获取刚刚选中内容的坐标，属于同一行内容
      const line = this._way[selected[i]];
      if (line[0] === point[0]) {
        this.light[line[0]][line[1]] = 1;
        selected.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * 移除已选规格
   * @param {Array} point
   */
  remove(point) {
    // 获取规格所在的位置，也就是在第几行和第几列里边
    point = point instanceof Array ? point : this._way[point];
    const val = this.maps[point[0]][point[1]];
    // 如果不存在规格，则返回
    if (!val) {
      return;
    }

    if (val) {
      for (let i = 0; i < this.selected.length; i++) {
        console.log(99, this.selected);
        if (this.selected[i] === val) {
          // line是获取选择的规格的位置
          const line = this._way[this.selected[i]];
          // 重置light为1，表示没有被选中
          this.light[line[0]][line[1]] = 1;
          this.selected.splice(i, 1);
        }
      }
      // 重新计算那些规格可以被选择
      this._check();
    }
  }
  /**
   * 获取当前可用数据
   * @returns []
   */
  getWay() {
    const light = this.light;
    const way = cloneTwo(light);
    for (let i = 0; i < light.length; i++) {
      const line = light[i];
      for (let j = 0; j < line.length; j++) {
        if (line[j]) {
          way[i][j] = this.maps[i][j];
        }
      }
    }
    return way;
  }
}

/**
 * 笛卡尔积组装
 * @param {Array} list
 * @returns []
 */
export function descartes(list) {
  // parent上一级索引;count指针计数
  const point = {}; // 准备移动指针
  const result = []; // 准备返回数据
  let pIndex = null; // 准备父级指针
  let tempCount = 0; // 每层指针坐标
  let temp = []; // 组装当个sku结果

  // 一：根据参数列生成指针对象
  for (const index in list) {
    if (typeof list[index] === "object") {
      point[index] = { parent: pIndex, count: 0 };
      pIndex = index;
    }
  }

  // 单维度数据结构直接返回
  if (pIndex === null) {
    return list;
  }

  // 动态生成笛卡尔积
  while (true) {
    // 二：生成结果
    let index;
    for (index in list) {
      tempCount = point[index].count;
      temp.push(list[index][tempCount]);
    }
    // 压入结果数组
    result.push(temp);
    temp = [];

    // 三：检查指针最大值问题，移动指针
    while (true) {
      if (point[index].count + 1 >= list[index].length) {
        point[index].count = 0;
        pIndex = point[index].parent;
        if (pIndex === null) {
          return result;
        }

        // 赋值parent进行再次检查
        index = pIndex;
      } else {
        point[index].count++;
        break;
      }
    }
  }
}
