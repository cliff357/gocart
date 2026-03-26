/**
 * P2 Redux Slice 測試
 *
 * 測試所有 Redux reducers 的狀態管理邏輯
 * - productSlice: 商品列表、搜尋、async thunk 狀態
 *
 * 運行方式：
 *   npm run test:components    (包含在 components 測試中)
 */

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


