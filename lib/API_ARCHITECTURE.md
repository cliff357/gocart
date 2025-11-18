# Mock Data & API Service Architecture

## 概述
我們已經重構了整個項目的數據架構，將所有假數據組織成結構化的 Mock Data 類別，並建立了 API Service 層，讓未來的真實 API 集成變得更簡單。

## 文件結構

```
lib/
  data/
    MockData.js          # 所有假數據的結構化類別
  services/
    ApiService.js        # API 服務層，目前使用 Mock 數據
  features/
    product/
      productSlice.js    # 更新後的 Redux slice，使用 async thunks
```

## Mock Data 類別

### 1. MockProductData
```javascript
import { MockProductData } from '@/lib/data/MockData';

// 獲取所有產品
const products = MockProductData.getAllProducts();

// 獲取特定產品
const product = MockProductData.getProduct('prod_1');

// 按類別篩選
const headphones = MockProductData.getProductsByCategory('Headphones');

// 搜索產品
const results = MockProductData.searchProducts('smart watch');
```

### 2. MockStoreData
```javascript
import { MockStoreData } from '@/lib/data/MockData';

// 獲取所有商店
const stores = MockStoreData.getAllStores();

// 按 username 獲取商店
const store = MockStoreData.getStoreByUsername('happyshop');
```

### 3. MockUserData
```javascript
import { MockUserData } from '@/lib/data/MockData';

// 獲取默認用戶
const user = MockUserData.getDefaultUser();
```

### 4. MockRatingData
```javascript
import { MockRatingData } from '@/lib/data/MockData';

// 獲取產品評價
const ratings = MockRatingData.getRatingsByProductId('prod_1');
```

### 5. MockOrderData
```javascript
import { MockOrderData } from '@/lib/data/MockData';

// 獲取用戶訂單
const orders = MockOrderData.getOrdersByUserId('user_123');
```

## API Service 層

### 基本使用方式
```javascript
import ApiService from '@/lib/services/ApiService';

// 產品 API
const response = await ApiService.Product.getAllProducts();
if (response.success) {
    console.log(response.data); // 產品列表
}

// 用戶 API
const userResponse = await ApiService.User.getUser('user_123');

// 商店 API
const storeResponse = await ApiService.Store.getStoreByUsername('happyshop');
```

### Redux 集成
```javascript
// 在 Redux slice 中使用
import { createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '@/lib/services/ApiService';

export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.Product.getAllProducts();
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
```

### 組件中使用
```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';

function ProductList() {
    const dispatch = useDispatch();
    const { list: products, loading, error } = useSelector(state => state.product);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {products.map(product => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    );
}
```

## 如何切換到真實 API

### 1. 更新 ApiService 方法
只需要修改 `/lib/services/ApiService.js` 中的方法實現：

```javascript
// 從這樣的 Mock 實現:
static async getAllProducts() {
    await this.simulateDelay(300);
    const products = MockProductData.getAllProducts();
    return this.createResponse(products);
}

// 改成真實 API 實現:
static async getAllProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        return this.createResponse(data);
    } catch (error) {
        return this.createResponse(null, false, error.message);
    }
}
```

### 2. 環境配置
可以使用環境變數來控制是否使用 Mock 數據：

```javascript
// 在 ApiService 中
static async getAllProducts() {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        // 使用 Mock 數據
        const products = MockProductData.getAllProducts();
        return this.createResponse(products);
    } else {
        // 使用真實 API
        const response = await fetch('/api/products');
        const data = await response.json();
        return this.createResponse(data);
    }
}
```

## 利用點

1. **結構化數據管理**: 所有假數據都組織在類別中，易於維護和查找
2. **統一 API 接口**: 所有數據訪問都通過 API Service，接口一致
3. **模擬真實 API**: 包含延遲和錯誤處理，更接近真實環境
4. **易於切換**: 未來只需修改 API Service 的實現，不影響組件代碼
5. **類型安全**: 所有數據結構清晰定義，易於理解和維護
6. **測試友好**: Mock 數據和 API Service 都易於單元測試

## 已更新的組件

- ✅ `ProductSlice.js` - 使用新的 async thunks
- ✅ `StoreProvider.js` - 自動初始化產品數據
- ✅ `CategoriesMarquee.jsx` - 使用 MockMiscData
- ✅ `OurSpec.jsx` - 使用 MockMiscData
- ⚠️ 其他組件還可以根據需要逐步更新

## 下一步建議

1. 逐步更新其他組件使用新的 API Service
2. 添加更多的 API 端點和錯誤處理
3. 實現真實的 API 端點
4. 添加數據驗證和類型檢查
5. 實現緩存機制