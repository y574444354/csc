/**
 * 快速排序函数
 * @param arr 待排序数组
 * @returns 排序后的新数组（不修改原数组）
 */
function quickSort<T>(arr: T[]): T[] {
  // 基线条件：数组长度小于等于1时直接返回
  if (arr.length <= 1) {
    return arr;
  }

  // 选择基准元素（选择中间位置）
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];

  // 分区：将数组分为小于基准和大于基准的两部分
  const left: T[] = [];
  const right: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    // 跳过基准元素本身
    if (i === pivotIndex) {
      continue;
    }
    // 小于等于基准放左边，大于基准放右边
    if (arr[i] <= pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  // 递归排序左右两部分，并合并结果
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// 测试用例
const nums = [64, 34, 25, 12, 22, 11, 90];
console.log('原始数组:', nums);
console.log('排序后:', quickSort(nums));

// 测试字符串数组
const strs = ['banana', 'apple', 'cherry', 'date'];
console.log('字符串数组:', quickSort(strs));
