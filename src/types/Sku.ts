// 定义sku数据类型
export type sku = {
    skus: {
        id: string,
        inventory: number,
        oldPrice: string,
        picture: string,
        skuCode: string,
        price: string,
        specs: {
            name: string,
            valueName: string
        }[]
    }[],
    specs:{
        id: string,
        name: string,
        values: {
            desc: string | null
            name: string,
            picture: string | null
            selected?: boolean
            disabled?:boolean
        }[]
    }[]
}