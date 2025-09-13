// React와 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Search, Heart } from 'lucide-react';
import NotificationBadge from '../../components/shop/NotificationBadge';
import '../../css/shop/Cart.css';

/**
 * Cart 컴포넌트
 * 장바구니 페이지를 담당하는 컴포넌트입니다.
 * 장바구니 아이템 관리, 수량 조절, 주문 내역 표시 기능을 제공합니다.
 */
function Cart() {
    // React Router의 네비게이션 훅
    const navigate = useNavigate();
    
    // 장바구니 아이템 목록 상태
    const [cart, setCart] = useState([]);
    
    // 찜 목록 개수 상태
    const [wishlistCount, setWishlistCount] = useState(0);
    
    // 장바구니 아이템 개수 상태
    const [cartCount, setCartCount] = useState(0);

    /**
     * 컴포넌트 마운트 시 localStorage에서 장바구니 데이터를 불러오는 useEffect
     */
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

    /**
     * 장바구니가 변경될 때마다 알림 개수를 업데이트하는 useEffect
     */
    useEffect(() => {
        // 장바구니 총 아이템 개수 계산 (수량 포함)
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
        
        // localStorage에서 찜 목록 개수 가져오기
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlistCount(JSON.parse(savedWishlist).length);
        }
    }, [cart]); // cart가 변경될 때마다 실행

    /**
     * 아이템 수량을 업데이트하는 함수
     * 수량이 0 이하가 되면 장바구니에서 제거합니다.
     * 
     * @param {string} perfumeId - 업데이트할 향수 ID
     * @param {number} newQuantity - 새로운 수량
     */
    const updateQuantity = (perfumeId, newQuantity) => {
        // 수량이 0 이하면 장바구니에서 제거
        if (newQuantity <= 0) {
            removeFromCart(perfumeId);
            return;
        }
        
        // 해당 아이템의 수량만 업데이트
        const updatedCart = cart.map(item => 
            item.id === perfumeId ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    /**
     * 장바구니에서 특정 아이템을 제거하는 함수
     * 
     * @param {string} perfumeId - 제거할 향수 ID
     */
    const removeFromCart = (perfumeId) => {
        const updatedCart = cart.filter(item => item.id !== perfumeId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    /**
     * 장바구니의 총 가격을 계산하는 함수
     * 각 아이템의 가격 × 수량을 모두 합산합니다.
     */
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    /**
     * 장바구니를 완전히 비우는 함수
     * 상태와 localStorage를 모두 초기화합니다.
     */
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    /**
     * 탭 클릭 시 실행되는 함수
     * 탭 전환 애니메이션을 적용하고 해당 페이지로 이동합니다.
     * 
     * @param {string} tab - 클릭된 탭 이름 ('shopping', 'wishlist')
     */
    const handleTabClick = (tab) => {
        // 부드러운 페이지 전환을 위한 페이드 아웃 애니메이션
        const container = document.querySelector('.cart-container');
        if (container) {
            container.style.opacity = '0.7';
            container.style.transform = 'translateY(10px)';
        }
        
        // 애니메이션 후 페이지 이동 (150ms 지연)
        setTimeout(() => {
            if (tab === 'shopping') {
                navigate('/shop'); // 쇼핑 페이지로 이동
            } else if (tab === 'wishlist') {
                navigate('/wishlist'); // 찜 페이지로 이동
            }
        }, 150);
    };

    return (
        <>
            {/* 상단 로고 (클릭 시 메인 페이지로 이동) */}
            <img
                src="/images/logo.png"
                alt="로고"
                className="main-logo-image"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />
            <div className="cart-container">
                <div className="cart-content">
                    {/* 페이지 헤더 영역 (제목과 네비게이션 탭) */}
                    <div className="cart-header">
                        <div className="header-content">
                            {/* 페이지 제목 영역 */}
                            <div className="title-section">
                                <h1 className="cart-title">장바구니</h1>
                                <p className="cart-subtitle">선택한 향수들을 확인하고 주문하세요. ({cart.length})</p>
                            </div>
                            
                            {/* 네비게이션 탭 영역 */}
                            <div className="nav-tabs">
                                {/* 쇼핑 탭 */}
                                <button 
                                    className="tab-button"
                                    onClick={() => handleTabClick('shopping')}
                                >
                                    쇼핑
                                </button>
                                <div className="tab-separator"></div>
                                
                                {/* 찜 탭 (하트 아이콘과 알림 배지 포함) */}
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
                                
                                {/* 장바구니 탭 (현재 활성화된 탭, 쇼핑백 아이콘과 알림 배지 포함) */}
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
                        {/* 헤더 하단 구분선 */}
                        <div className="header-line"></div>
                    </div>

                    {/* 장바구니에 아이템이 있을 때와 없을 때의 조건부 렌더링 */}
                    {cart.length > 0 ? (
                        // 장바구니에 아이템이 있을 때: 아이템 목록과 주문 내역 표시
                        <div className="cart-layout">
                            {/* 왼쪽 영역: 장바구니 아이템 목록 */}
                            <div className="cart-left">
                                {/* 아이템 목록 헤더 (전체 삭제 버튼 포함) */}
                                <div className="cart-items-header">
                                    <div></div>
                                    <button 
                                        className="clear-all-btn"
                                        onClick={clearCart}
                                    >
                                        전체 삭제
                                    </button>
                                </div>
                                
                                {/* 장바구니 아이템 목록 */}
                                <div className="cart-items">
                                    {cart.map((item) => (
                                        <div key={item.id} className="cart-item">
                                            {/* 아이템 이미지 */}
                                            <div className="item-image">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            
                                            {/* 아이템 상세 정보 */}
                                            <div className="item-details">
                                                <h3 className="item-name">{item.name}</h3>
                                                <p className="item-volume">{item.volume}</p>
                                                
                                                {/* 수량 조절 버튼 */}
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
                                            
                                            {/* 아이템 총 가격 (가격 × 수량) */}
                                            <div className="item-price">
                                                ₩{(item.price * item.quantity).toLocaleString()}
                                            </div>
                                            
                                            {/* 아이템 삭제 버튼 */}
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
                            
                            {/* 오른쪽 영역: 주문 내역 */}
                            <div className="cart-right">
                                <div className="order-summary">
                                    <h2 className="summary-title">주문 내역</h2>
                                    <div className="summary-content">
                                        {/* 상품 금액 */}
                                        <div className="summary-row">
                                            <span>상품 금액</span>
                                            <span>₩{totalPrice.toLocaleString()}</span>
                                        </div>
                                        
                                        {/* 배송비 (무료) */}
                                        <div className="summary-row">
                                            <span>배송비</span>
                                            <span>무료</span>
                                        </div>
                                        
                                        {/* 총 금액 */}
                                        <div className="summary-total">
                                            <span>총 금액</span>
                                            <span>₩{totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* 구매하기 버튼 */}
                                    <button 
                                        className="purchase-btn"
                                        onClick={() => alert('결제 기능은 준비 중입니다.')}
                                    >
                                        <img src="/images/card.png" alt="카드" className="purchase-icon" />
                                        구매하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // 장바구니가 비어있을 때: 빈 상태 메시지 표시
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

// Cart 컴포넌트를 기본 export로 내보내기
export default Cart;
