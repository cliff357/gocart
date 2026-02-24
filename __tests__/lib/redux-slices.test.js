/**
 * P2 Redux Slice 測試
 *
 * 測試所有 Redux reducers 的狀態管理邏輯
 * - cartSlice: 購物車增刪改清
 * - productSlice: 商品列表、搜尋、async thunk 狀態
 * - addressSlice: 地址管理
 * - ratingSlice: 評分管理
 *
 * 運行方式：
 *   npm run test:components    (包含在 components 測試中)
 */

import cartReducer, {
    addToCart,
    removeFromCart,
    deleteItemFromCart,
    clearCart,
} from '@/lib/features/cart/cartSlice';

import productReducer, {
    setProduct,
    clearProduct,
    setCurrentProduct,
    clearCurrentProduct,
    setSearchResults,
    clearSearchResults,
    clearError,
    fetchProducts,
} from '@/lib/features/product/productSlice';

import addressReducer, {
    addAddress,
} from '@/lib/features/address/addressSlice';

import ratingReducer, {
    addRating,
} from '@/lib/features/rating/ratingSlice';

// ============================================
// Cart Slice Tests
// ============================================
describe('cartSlice', () => {
    const initialState = { total: 0, cartItems: {} };

    it('應該返回初始狀態', () => {
        const state = cartReducer(undefined, { type: 'unknown' });
        expect(state).toEqual(initialState);
    });

    it('addToCart: 添加新商品到購物車', () => {
        const state = cartReducer(initialState, addToCart({ productId: 'prod-1' }));
        expect(state.cartItems['prod-1']).toBe(1);
        expect(state.total).toBe(1);
    });

    it('addToCart: 已存在的商品數量 +1', () => {
        const prevState = { total: 1, cartItems: { 'prod-1': 1 } };
        const state = cartReducer(prevState, addToCart({ productId: 'prod-1' }));
        expect(state.cartItems['prod-1']).toBe(2);
        expect(state.total).toBe(2);
    });

    it('addToCart: 可以添加多種商品', () => {
        let state = cartReducer(initialState, addToCart({ productId: 'prod-1' }));
        state = cartReducer(state, addToCart({ productId: 'prod-2' }));
        state = cartReducer(state, addToCart({ productId: 'prod-1' }));
        expect(state.cartItems['prod-1']).toBe(2);
        expect(state.cartItems['prod-2']).toBe(1);
        expect(state.total).toBe(3);
    });

    it('removeFromCart: 減少商品數量', () => {
        const prevState = { total: 3, cartItems: { 'prod-1': 3 } };
        const state = cartReducer(prevState, removeFromCart({ productId: 'prod-1' }));
        expect(state.cartItems['prod-1']).toBe(2);
        expect(state.total).toBe(2);
    });

    it('removeFromCart: 數量為 0 時移除商品', () => {
        const prevState = { total: 1, cartItems: { 'prod-1': 1 } };
        const state = cartReducer(prevState, removeFromCart({ productId: 'prod-1' }));
        expect(state.cartItems['prod-1']).toBeUndefined();
        expect(state.total).toBe(0);
    });

    it('deleteItemFromCart: 完全移除商品', () => {
        const prevState = { total: 5, cartItems: { 'prod-1': 3, 'prod-2': 2 } };
        const state = cartReducer(prevState, deleteItemFromCart({ productId: 'prod-1' }));
        expect(state.cartItems['prod-1']).toBeUndefined();
        expect(state.cartItems['prod-2']).toBe(2);
        expect(state.total).toBe(2);
    });

    it('deleteItemFromCart: 刪除不存在的商品不影響 total', () => {
        const prevState = { total: 2, cartItems: { 'prod-1': 2 } };
        const state = cartReducer(prevState, deleteItemFromCart({ productId: 'prod-999' }));
        expect(state.total).toBe(2);
    });

    it('clearCart: 清空購物車', () => {
        const prevState = { total: 5, cartItems: { 'prod-1': 3, 'prod-2': 2 } };
        const state = cartReducer(prevState, clearCart());
        expect(state.cartItems).toEqual({});
        expect(state.total).toBe(0);
    });
});

// ============================================
// Product Slice Tests
// ============================================
describe('productSlice', () => {
    const initialState = {
        list: [],
        currentProduct: null,
        searchResults: [],
        loading: false,
        error: null,
    };

    const mockProducts = [
        { id: 'p1', name: 'Product 1', price: 100 },
        { id: 'p2', name: 'Product 2', price: 200 },
    ];

    it('應該返回初始狀態', () => {
        const state = productReducer(undefined, { type: 'unknown' });
        expect(state).toEqual(initialState);
    });

    it('setProduct: 設置商品列表', () => {
        const state = productReducer(initialState, setProduct(mockProducts));
        expect(state.list).toEqual(mockProducts);
        expect(state.list.length).toBe(2);
    });

    it('clearProduct: 清空商品列表', () => {
        const prevState = { ...initialState, list: mockProducts };
        const state = productReducer(prevState, clearProduct());
        expect(state.list).toEqual([]);
    });

    it('setCurrentProduct: 設置當前商品', () => {
        const product = mockProducts[0];
        const state = productReducer(initialState, setCurrentProduct(product));
        expect(state.currentProduct).toEqual(product);
    });

    it('clearCurrentProduct: 清除當前商品', () => {
        const prevState = { ...initialState, currentProduct: mockProducts[0] };
        const state = productReducer(prevState, clearCurrentProduct());
        expect(state.currentProduct).toBeNull();
    });

    it('setSearchResults: 設置搜尋結果', () => {
        const state = productReducer(initialState, setSearchResults(mockProducts));
        expect(state.searchResults).toEqual(mockProducts);
    });

    it('clearSearchResults: 清除搜尋結果', () => {
        const prevState = { ...initialState, searchResults: mockProducts };
        const state = productReducer(prevState, clearSearchResults());
        expect(state.searchResults).toEqual([]);
    });

    it('clearError: 清除錯誤', () => {
        const prevState = { ...initialState, error: 'Something went wrong' };
        const state = productReducer(prevState, clearError());
        expect(state.error).toBeNull();
    });

    // Async Thunk 狀態測試
    it('fetchProducts.pending: 設置 loading 狀態', () => {
        const state = productReducer(initialState, fetchProducts.pending());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('fetchProducts.fulfilled: 設置商品並清除 loading', () => {
        const prevState = { ...initialState, loading: true };
        const state = productReducer(prevState, fetchProducts.fulfilled(mockProducts));
        expect(state.loading).toBe(false);
        expect(state.list).toEqual(mockProducts);
    });

    it('fetchProducts.rejected: 設置錯誤並清除 loading', () => {
        const prevState = { ...initialState, loading: true };
        const state = productReducer(prevState, fetchProducts.rejected(null, '', null, 'Network error'));
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Network error');
    });
});

// ============================================
// Address Slice Tests
// ============================================
describe('addressSlice', () => {
    it('應該有初始地址', () => {
        const state = addressReducer(undefined, { type: 'unknown' });
        expect(state.list).toBeDefined();
        expect(state.list.length).toBeGreaterThanOrEqual(1);
    });

    it('addAddress: 可以添加新地址', () => {
        const newAddress = {
            id: 'addr-new',
            name: 'New Address',
            street: '456 New St',
            city: 'Test City',
        };
        const prevState = { list: [] };
        const state = addressReducer(prevState, addAddress(newAddress));
        expect(state.list.length).toBe(1);
        expect(state.list[0].name).toBe('New Address');
    });

    it('addAddress: 可以添加多個地址', () => {
        const prevState = { list: [{ id: 'addr-1', name: 'Addr 1' }] };
        const state = addressReducer(prevState, addAddress({ id: 'addr-2', name: 'Addr 2' }));
        expect(state.list.length).toBe(2);
    });
});

// ============================================
// Rating Slice Tests
// ============================================
describe('ratingSlice', () => {
    const initialState = { ratings: [] };

    it('應該返回初始狀態', () => {
        const state = ratingReducer(undefined, { type: 'unknown' });
        expect(state).toEqual(initialState);
    });

    it('addRating: 可以添加評分', () => {
        const rating = { orderId: 'order-1', productId: 'prod-1', rating: 5 };
        const state = ratingReducer(initialState, addRating(rating));
        expect(state.ratings.length).toBe(1);
        expect(state.ratings[0].rating).toBe(5);
    });

    it('addRating: 可以添加多個評分', () => {
        let state = ratingReducer(initialState, addRating({ orderId: 'o1', productId: 'p1', rating: 5 }));
        state = ratingReducer(state, addRating({ orderId: 'o2', productId: 'p2', rating: 3 }));
        state = ratingReducer(state, addRating({ orderId: 'o3', productId: 'p3', rating: 4 }));
        expect(state.ratings.length).toBe(3);
    });

    it('addRating: 保留完整的評分資料', () => {
        const rating = {
            orderId: 'order-1',
            productId: 'prod-1',
            rating: 4,
            review: 'Great product!',
        };
        const state = ratingReducer(initialState, addRating(rating));
        expect(state.ratings[0]).toEqual(rating);
    });
});
