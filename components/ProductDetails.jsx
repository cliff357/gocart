'use client'

import { TagIcon, EarthIcon, UserIcon, CalendarCheck } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ReservationModal from "./ReservationModal";
import { productService } from "@/lib/services/FirestoreService";
// Temporarily disabled cart functionality
// import { addToCart } from "@/lib/features/cart/cartSlice";
// import { useRouter } from "next/navigation";
// import Counter from "./Counter";
// import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    // Temporarily disabled cart functionality
    // const cart = useSelector(state => state.cart.cartItems);
    // const dispatch = useDispatch();
    // const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);
    const [showReservation, setShowReservation] = useState(false);
    
    // Related products (other variants)
    const [relatedProductsData, setRelatedProductsData] = useState([]);
    
    // Product options selection (e.g., Size)
    const [selectedOptions, setSelectedOptions] = useState(() => {
        const initial = {};
        if (product.options && product.options.length > 0) {
            product.options.forEach(opt => {
                if (opt.values && opt.values.length > 0) {
                    initial[opt.name] = opt.values[0];
                }
            });
        }
        return initial;
    });
    
    // Load related products
    useEffect(() => {
        const loadRelatedProducts = async () => {
            if (product.relatedProducts && product.relatedProducts.length > 0) {
                try {
                    const products = await Promise.all(
                        product.relatedProducts.map(id => productService.getById(id))
                    );
                    setRelatedProductsData(products.filter(p => p !== null));
                } catch (error) {
                    console.error('Failed to load related products:', error);
                }
            }
        };
        loadRelatedProducts();
    }, [product.relatedProducts]);

    // const addToCartHandler = () => {
    //     dispatch(addToCart({ productId }))
    // }

    // 檢查原價和賣價是否相同
    const hasDiscount = product.mrp && product.mrp > product.price;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <Image src={mainImage} alt="" width={250} height={250} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    {hasDiscount && (
                        <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                    )}
                </div>
                {hasDiscount && (
                    <div className="flex items-center gap-2 text-slate-500">
                        <TagIcon size={14} />
                        <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                    </div>
                )}

                {/* Related Products - Other Variants */}
                {relatedProductsData.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm font-medium text-slate-700 mb-3">其他款式</p>
                        <div className="flex flex-wrap gap-3">
                            {relatedProductsData.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct.id}
                                    href={`/product/${relatedProduct.id}`}
                                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
                                >
                                    {relatedProduct.images?.[0] && (
                                        <img 
                                            src={relatedProduct.images[0]} 
                                            alt={relatedProduct.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    )}
                                    <span className="text-sm text-slate-700 group-hover:text-green-700">
                                        {relatedProduct.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Options Selection (e.g., Size) */}
                {product.options && product.options.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {product.options.map((option, idx) => (
                            <div key={idx}>
                                <p className="text-sm font-medium text-slate-700 mb-2">{option.name}</p>
                                <div className="flex flex-wrap gap-2">
                                    {option.values.map((value, vIdx) => (
                                        <button
                                            key={vIdx}
                                            type="button"
                                            onClick={() => setSelectedOptions(prev => ({
                                                ...prev,
                                                [option.name]: value
                                            }))}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                                                selectedOptions[option.name] === value
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cart functionality temporarily hidden */}
                {/* <div className="flex items-end gap-5 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition">
                        {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                    </button>
                </div> */}
                
                {/* Reservation Button */}
                <button 
                    onClick={() => setShowReservation(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 text-sm font-medium rounded-lg hover:bg-green-700 active:scale-95 transition mt-6"
                >
                    <CalendarCheck size={18} />
                    預訂
                </button>

                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free shipping on orders over $300 </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>

            {/* Reservation Modal */}
            <ReservationModal 
                isOpen={showReservation} 
                onClose={() => setShowReservation(false)} 
                product={product}
                selectedOptions={selectedOptions}
            />
        </div>
    )
}

export default ProductDetails