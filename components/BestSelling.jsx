'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)

    // 安全地排序產品，支持兩種評分格式
    const sortedProducts = products.slice().sort((a, b) => {
        // 獲取評分數量（優先使用 totalRatings，其次是 rating 數組長度）
        const aRatingCount = a.totalRatings || (a.rating && Array.isArray(a.rating) ? a.rating.length : 0);
        const bRatingCount = b.totalRatings || (b.rating && Array.isArray(b.rating) ? b.rating.length : 0);
        return bRatingCount - aRatingCount;
    });

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {sortedProducts.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling