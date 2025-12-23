'use client'

import { TagIcon, EarthIcon, UserIcon, CalendarCheck } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import ReservationModal from "./ReservationModal";
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
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free shipping worldwide </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>

            {/* Reservation Modal */}
            <ReservationModal 
                isOpen={showReservation} 
                onClose={() => setShowReservation(false)} 
                product={product} 
            />
        </div>
    )
}

export default ProductDetails