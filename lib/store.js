import { configureStore } from '@reduxjs/toolkit'
import productReducer from './features/product/productSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            product: productReducer,
        },
    })
}