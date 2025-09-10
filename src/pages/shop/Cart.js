import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Search, Heart } from 'lucide-react';
import NotificationBadge from '../../components/shop/NotificationBadge';
import '../../css/shop/Cart.css';

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    // localStorage에서 장바구니 데이터 불러오기
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // 알림 개수 업데이트
    useEffect(() => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
        
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlistCount(JSON.parse(savedWishlist).length);
        }
    }, [cart]);

    // 수량 업데이트
    const updateQuantity = (perfumeId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(perfumeId);
            return;
        }
        
        const updatedCart = cart.map(item => 
            item.id === perfumeId ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // 장바구니에서 제거
    const removeFromCart = (perfumeId) => {
        const updatedCart = cart.filter(item => item.id !== perfumeId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // 총 가격 계산
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // 장바구니 비우기
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const handleTabClick = (tab) => {
        // 부드러운 페이지 전환을 위한 애니메이션
        const container = document.querySelector('.cart-container');
        if (container) {
            container.style.opacity = '0.7';
            container.style.transform = 'translateY(10px)';
        }
        
        setTimeout(() => {
            if (tab === 'shopping') {
                navigate('/shop');
            } else if (tab === 'wishlist') {
                navigate('/wishlist');
            }
        }, 150);
    };

    return (
        <>
            <img
                src="/images/logo.png"
                alt="로고"
                className="main-logo-image"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />
            <div className="cart-container">
                <div className="cart-content">
                    {/* Header with Tabs */}
                    <div className="cart-header">
                        <div className="header-content">
                            <div className="title-section">
                                <h1 className="cart-title">장바구니</h1>
                                <p className="cart-subtitle">선택한 향수들을 확인하고 주문하세요. ({cart.length})</p>
                            </div>
                            
                            {/* Navigation Tabs */}
                            <div className="nav-tabs">
                                <button 
                                    className="tab-button"
                                    onClick={() => handleTabClick('shopping')}
                                >
                                    쇼핑
                                </button>
                                <div className="tab-separator"></div>
                                <button 
                                    className="tab-button"
                                    onClick={() => handleTabClick('wishlist')}
                                >
                                    <div className="tab-icon-container">
                                        <Heart className="tab-icon" size={16} />
                                        <NotificationBadge count={wishlistCount} show={wishlistCount > 0} type="wishlist" />
                                    </div>
                                    찜
                                </button>
                                <div className="tab-separator"></div>
                                <button 
                                    className="tab-button tab-button-active"
                                >
                                    <div className="tab-icon-container">
                                        <div className="shopping-bag-icon"></div>
                                        <NotificationBadge count={cartCount} show={cartCount > 0} type="cart" />
                                    </div>
                                    장바구니
                                </button>
                            </div>
                        </div>
                        <div className="header-line"></div>
                    </div>

                    {cart.length > 0 ? (
                        <div className="cart-layout">
                            <div className="cart-left">
                                
                                <button 
                                    className="clear-all-btn"
                                    onClick={clearCart}
                                >
                                    전체 삭제
                                </button>
                                
                                <div className="cart-items">
                                    {cart.map((item) => (
                                        <div key={item.id} className="cart-item">
                                            <div className="item-image">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="item-details">
                                                <h3 className="item-name">{item.name}</h3>
                                                <p className="item-volume">{item.volume}</p>
                                                <div className="item-quantity">
                                                    <button 
                                                        className="quantity-btn"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="quantity">{item.quantity}</span>
                                                    <button 
                                                        className="quantity-btn"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="item-price">
                                                ₩{(item.price * item.quantity).toLocaleString()}
                                            </div>
                                            <button 
                                                className="remove-btn"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="cart-right">
                                <div className="order-summary">
                                    <h2 className="summary-title">주문 내역</h2>
                                    <div className="summary-content">
                                        <div className="summary-row">
                                            <span>상품 금액</span>
                                            <span>₩{totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>배송비</span>
                                            <span>무료</span>
                                        </div>
                                        <div className="summary-total">
                                            <span>총 금액</span>
                                            <span>₩{totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="purchase-btn"
                                        onClick={() => alert('결제 기능은 준비 중입니다.')}
                                    >
                                        <ShoppingBag size={20} />
                                        구매하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="cart-empty">
                            <ShoppingBag className="empty-icon" size={48} />
                            <h3>장바구니가 비어있습니다</h3>
                            <p>원하는 향수를 장바구니에 담아보세요!</p>
                            <button 
                                className="browse-button"
                                onClick={() => navigate('/shop')}
                            >
                                향수 둘러보기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Cart;
