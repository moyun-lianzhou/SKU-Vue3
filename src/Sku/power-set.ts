/*
  例如，集合 {A, B, C}：
  000 → []（空集）
  001 → [C]
  010 → [B]
  011 → [B, C]
  100 → [A]
  101 → [A, C]
  110 → [A, B]
  111 → [A, B, C]
*/

// 获得一个数组的幂集
export default function bwPowerSet<T>(originalSet: T[]): T[][] {
  const subSets = []
  // 有2^n个可能的组合（其中n是原始集合的长度）。
  const numberOfCombinations = 2 ** originalSet.length
  // 在0到2^n范围内的二进制表示中的每个数字都恰好满足需求：
  for (let combinationIndex = 0; combinationIndex < numberOfCombinations; combinationIndex += 1) {
    const subSet = []
    for (let setElementIndex = 0; setElementIndex < originalSet.length; setElementIndex += 1) {
      // 决定是否需要将当前元素包含到子集中。
      if (combinationIndex & (1 << setElementIndex)) {
        subSet.push(originalSet[setElementIndex])
      }
    }
    // 将当前子集添加到所有子集的列表中。
    subSets.push(subSet)
  }
  return subSets
}