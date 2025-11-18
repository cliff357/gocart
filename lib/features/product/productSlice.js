import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ApiService from '@/lib/services/ApiService'

// Async thunks for API calls
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
)

export const fetchProductById = createAsyncThunk(
    'product/fetchProductById',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ApiService.Product.getProduct(productId);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const searchProducts = createAsyncThunk(
    'product/searchProducts',
    async (query, { rejectWithValue }) => {
        try {
            const response = await ApiService.Product.searchProducts(query);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        currentProduct: null,
        searchResults: [],
        loading: false,
        error: null
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null
        },
        setSearchResults: (state, action) => {
            state.searchResults = action.payload
        },
        clearSearchResults: (state) => {
            state.searchResults = []
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch product by ID
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Search products
            .addCase(searchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export const { 
    setProduct, 
    clearProduct, 
    setCurrentProduct, 
    clearCurrentProduct,
    setSearchResults,
    clearSearchResults,
    clearError
} = productSlice.actions

export default productSlice.reducer