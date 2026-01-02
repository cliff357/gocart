'use client'

import { TagIcon, EarthIcon, CalendarCheck, ChevronLeft } from "lucide-react";
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
    
    // 檢查是否只有一張圖
    const isSingleImage = product.images.length === 1;
    
    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Side - Image Gallery */}
            <div className={`w-full ${isSingleImage ? 'lg:w-1/2' : 'lg:w-3/5 xl:w-2/3'}`}>
                {/* Mobile: Horizontal scroll thumbnails + Main image */}
                <div className="lg:hidden">
                    {/* Main Image */}
                    <div className={`flex justify-center items-center bg-slate-100 rounded-xl mb-4 ${isSingleImage ? 'aspect-[4/3]' : 'aspect-square'}`}>
                        <Image 
                            src={mainImage} 
                            alt={product.name} 
                            width={500} 
                            height={500} 
                            className="object-contain max-h-full"
                        />
                    </div>
                    {/* Thumbnail Strip - only show if more than 1 image */}
                    {product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images.map((image, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => setMainImage(product.images[index])} 
                                    className={`flex-shrink-0 bg-slate-100 flex items-center justify-center w-20 h-20 rounded-lg cursor-pointer border-2 transition ${
                                        mainImage === image ? 'border-green-500' : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <Image src={image} className="object-contain" alt="" width={60} height={60} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop: 2x2 Grid gallery like untouchedunited */}
                <div className="hidden lg:block">
                    {isSingleImage ? (
                        /* Single image - centered */
                        <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center aspect-[4/3] max-h-[70vh]">
                            <Image 
                                src={product.images[0]} 
                                alt={product.name} 
                                width={800} 
                                height={800} 
                                className="object-contain w-full h-full"
                            />
                        </div>
                    ) : (
                        /* Multiple images - 2 column grid */
                        <div className="grid grid-cols-2 gap-2">
                            {product.images.map((image, index) => (
                                <div 
                                    key={index} 
                                    className="w-full bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center aspect-square"
                                >
                                    <Image 
                                        src={image} 
                                        alt={`${product.name} - ${index + 1}`} 
                                        width={600} 
                                        height={600} 
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Product Info (Sticky on desktop) */}
            <div className={`w-full ${isSingleImage ? 'lg:w-1/2' : 'lg:w-2/5 xl:w-1/3'}`}>
                <div className="lg:sticky lg:top-24">
                    {/* Back Link */}
                    <Link 
                        href="/shop" 
                        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition"
                    >
                        <ChevronLeft size={16} />
                        Back to Shop
                    </Link>

                    {/* Product Title */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">{product.name}</h1>
                    
                    {/* Price */}
                    <div className="flex items-center gap-3 mb-4">
                        <p className="text-2xl font-bold text-slate-800">{currency}{product.price}</p>
                        {hasDiscount && (
                            <p className="text-lg text-slate-400 line-through">{currency}{product.mrp}</p>
                        )}
                    </div>

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                            <TagIcon size={14} />
                            <span>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}%</span>
                        </div>
                    )}

                    {/* Product Options Selection (e.g., Size) */}
                    {product.options && product.options.length > 0 && (
                        <div className="space-y-4 mb-6">
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

                    {/* Related Products - Other Variants */}
                    {relatedProductsData.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm font-medium text-slate-700 mb-3">Other Styles</p>
                            <div className="flex flex-wrap gap-2">
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

                    {/* Reservation Button */}
                    <button 
                        onClick={() => setShowReservation(true)}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 text-base font-semibold rounded-xl hover:bg-green-700 active:scale-[0.98] transition"
                    >
                        <CalendarCheck size={20} />
                        Reserve
                    </button>

                    {/* Product Description */}
                    {product.description && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Description</h3>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Shipping Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Shipping</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <EarthIcon size={18} className="text-green-600" />
                            <span>Free shipping on orders over $300</span>
                        </div>
                    </div>
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