<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { sku } from '@/types/Sku';
import powerSet from '@/Sku/power-set';
import skuData1 from '@/data/sku1.json'; // 初始化就有无库存的规格
import skuData2 from '@/data/sku2.json'; // 更新之后有无库存项（蓝色-20cm-中国）


const goods = ref<sku>({ skus: [], specs: [] }) // 商品数据
let pathMap: Record<string, string[]> = {} // 路径字典

/**
 * 获取所有商品规格
 */
const getGoods = async () => {
    const res = skuData2
    goods.value = res.result
    // 获取有效路径字典
    pathMap = getPathMap(goods.value)
    initDisabledStatus(goods.value.specs, pathMap)
}

/**
 * 切换选中状态
 * @param {sku['specs'][number]} item 同一排的对象
 * @param {sku['specs'][number]['values'][number]} 当前项
 * @returns {void}
 */
const changeSelectedStatus = (item: sku['specs'][number], val: sku['specs'][number]['values'][number]) => {
    if (val.disabled) return
    if (val.selected) {
        val.selected = false
    } else {
        item.values.forEach(val => val.selected = false)
        val.selected = true
    }
    updateDisabledStatus(goods.value.specs, pathMap) // 点击按钮时更新
    const index = getSelectedValues(goods.value.specs).findIndex(item => item === undefined) // 产出有效的SKU对象数据
    if (index > -1) {
        console.log('选择信息不完整');
    } else {
        const key = getSelectedValues(goods.value.specs).join('-') // 获取sku对象
        const skuIds = pathMap[key]
        const skuObj = goods.value.skus.find(item => item.id === skuIds[0]) // 以skuId作为配置项去goods.value.skus数组中找
        console.log('sku对象为', skuObj);
    }
}

/**
 * 生成有效路径字典
 * @param goods 
 * @returns {Record<string, string[]>}
 */
const getPathMap = (goods: sku) => {
    const pathMap: Record<string, string[]> = {}
    const effectiveSkus = goods.skus.filter(sku => sku.inventory > 0) // 1.根据skus字段生成有效的sku数组
    effectiveSkus.forEach(sku => { // 2.根据有效的sku使用算法（子集算法）[1,2]=>[[1],[2],[1,2]]
        const selectedValArr = sku.specs.map(val => val.valueName)  // 2.1 获取匹配的valueName组成的数组
        const valueArrPowerSet = powerSet(selectedValArr) // 2.2 使用算法获取子集
        valueArrPowerSet.forEach(arr => { // 3.把得到的子集生成最终的路径字典对象
            const key = arr.join('-')  // 初始化key 数组join方法 -> 字符串 对象的key
            if (pathMap[key]) { // 如果已经存在当前key了 就往数组中直接添加skuId 如果不存在key 直接做赋值
                pathMap[key].push(sku.id)
            } else {
                pathMap[key] = [sku.id]
            }
        })
    })
    return pathMap
}

/**
 * 初始化禁用状态
 * @param {sku['specs']} specs 
 * @param {Record<string, string[]} pathMap 
 * @returns {void}
 */
const initDisabledStatus = (specs: sku['specs'], pathMap: Record<string, string[]>) => {
    specs.forEach(spec => {
        spec.values.forEach(val => {
            if (pathMap[val.name]) {
                val.disabled = false
            } else {
                val.disabled = true
            }
        })
    })
}

/**
 * 获取选中项的匹配数组
 * @param specs 
 * @returns {(string | undefined)[]} 
 */
const getSelectedValues = (specs: sku['specs']) => {
    const arr: (string | undefined)[] = []
    specs.forEach(spec => {
        // 目标：找到values中selected为true的项，然后把它的name字段添加到数组对应的位置
        const selectedVal = spec.values.find(item => item.selected)
        arr.push(selectedVal ? selectedVal.name : undefined)
    })
    return arr
}

/**
 * 切换时更新禁用状态
 * @param specs 
 * @param pathMap 
 * @returns {void}
 */
const updateDisabledStatus = (specs: sku['specs'], pathMap: Record<string, string[]>) => {
    // 切换时遍历每一行
    specs.forEach((spec, index) => {
        const selectedValues = getSelectedValues(specs)
        // 切换时遍历每一列
        spec.values.forEach(val => {
            selectedValues[index] = val.name
            // 拼接key到pathMap中寻找是否存在这个键值
            const key = selectedValues.filter(item => item).join('-')
            if (pathMap[key]) {
                val.disabled = false
            } else {
                val.disabled = true
            }
        })
    })
}

onMounted(() => getGoods()) // 初始页面渲染
</script>

<template>
    <div class="goods-sku">
        <dl v-for="item in goods.specs" :key="item.id">
            <dt>{{ item.name }}</dt>
            <dd>
                <template v-for="val in item.values" :key="val.name">
                    <!-- 图片类型规格 -->
                    <img :class="{ selected: val.selected, disabled: val.disabled }" v-if="val.picture"
                        @click="() => changeSelectedStatus(item, val)" :src="val.picture" :title="val.name">
                    <!-- 文字类型规格 -->
                    <span :class="{ selected: val.selected, disabled: val.disabled }" v-else
                        @click="() => changeSelectedStatus(item, val)">{{
                            val.name }}</span>
                </template>
            </dd>
        </dl>
    </div>
</template>

<style scoped lang="scss">
@mixin sku-state-mixin {
    border: 1px solid #e4e4e4;
    margin-right: 10px;
    cursor: pointer;

    &.selected {
        border-color: #27ba9b;
    }

    &.disabled {
        opacity: 0.6;
        border-style: dashed;
        cursor: not-allowed;
    }
}

.goods-sku {
    padding-left: 10px;
    padding-top: 20px;

    dl {
        display: flex;
        padding-bottom: 20px;
        align-items: center;

        dt {
            width: 50px;
            color: #999;
        }

        dd {
            flex: 1;
            color: #666;

            >img {
                width: 50px;
                height: 50px;
                margin-bottom: 4px;
                @include sku-state-mixin;
            }

            >span {
                display: inline-block;
                height: 30px;
                line-height: 28px;
                padding: 0 20px;
                margin-bottom: 4px;
                @include sku-state-mixin;
            }
        }
    }
}
</style>