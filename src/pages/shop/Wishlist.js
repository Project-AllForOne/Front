import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Search, ShoppingBag } from 'lucide-react';
import PerfumeCard from '../../components/shop/PerfumeCard';
import NotificationBadge from '../../components/shop/NotificationBadge';
import '../../css/shop/Wishlist.css';

// Perfume interface
const Perfume = {
    id: String,
    name: String,
    brand: String,
    price: Number,
    originalPrice: Number,
    image: String,
    rating: Number,
    category: String,
    description: String,
    volume: String,
    notes: {
        top: Array,
        middle: Array,
        base: Array
    },
    detailImages: {
        ingredients: String,
        process: String,
        brand: String,
        lifestyle: String
    }
};

function Wishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(new Set());
    const [perfumes, setPerfumes] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    // localStorage에서 찜 목록 불러오기
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlist(new Set(JSON.parse(savedWishlist)));
        }
    }, []);

    // localStorage에서 향수 데이터 불러오기
    useEffect(() => {
        const savedPerfumes = localStorage.getItem('perfumes');
        if (savedPerfumes) {
            setPerfumes(JSON.parse(savedPerfumes));
        }
    }, []);

    // 알림 개수 업데이트
    useEffect(() => {
        setWishlistCount(wishlist.size);
        
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const cart = JSON.parse(savedCart);
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
        }
    }, [wishlist]);

    // 찜 목록에 있는 향수만 필터링
    const wishlistPerfumes = perfumes.filter(perfume => wishlist.has(perfume.id));

    const handleToggleWishlist = (perfumeId) => {
        const newWishlist = new Set(wishlist);
        if (newWishlist.has(perfumeId)) {
            newWishlist.delete(perfumeId);
        } else {
            newWishlist.add(perfumeId);
        }
        setWishlist(newWishlist);
        localStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
    };

    const handleAddToCart = (perfume) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === perfume.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...perfume, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 장바구니 아이콘에 애니메이션 효과 추가
        const cartIcons = document.querySelectorAll('.shopping-bag-icon');
        cartIcons.forEach(icon => {
            icon.style.transform = 'scale(1.3)';
            icon.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        });
        
        // 장바구니 배지에 애니메이션 효과 추가
        const cartBadges = document.querySelectorAll('[data-badge="cart"]');
        cartBadges.forEach(badge => {
            badge.style.transform = 'scale(1.2)';
            badge.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 200);
        });
        
        // 장바구니 개수 업데이트
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
    };

    const handleViewDetail = (perfume) => {
        // 향수 상세 페이지로 이동
        navigate(`/perfume/${perfume.id}`);
    };

    const handleClearAll = () => {
        setWishlist(new Set());
        localStorage.setItem('wishlist', JSON.stringify([]));
        setWishlistCount(0);
    };

    const handleAddAllToCart = () => {
        if (wishlist.size === 0) {
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const wishlistPerfumes = perfumes.filter(perfume => wishlist.has(perfume.id));
        
        wishlistPerfumes.forEach(perfume => {
            const existingItem = cart.find(item => item.id === perfume.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...perfume, quantity: 1 });
            }
        });
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 장바구니 아이콘에 애니메이션 효과 추가
        const cartIcons = document.querySelectorAll('.shopping-bag-icon');
        cartIcons.forEach(icon => {
            icon.style.transform = 'scale(1.3)';
            icon.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        });
        
        // 장바구니 배지에 애니메이션 효과 추가
        const cartBadges = document.querySelectorAll('[data-badge="cart"]');
        cartBadges.forEach(badge => {
            badge.style.transform = 'scale(1.2)';
            badge.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 200);
        });
        
        // 장바구니 개수 업데이트
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
    };

    const handleTabClick = (tab) => {
        // 부드러운 페이지 전환을 위한 애니메이션
        const container = document.querySelector('.wishlist-container');
        if (container) {
            container.style.opacity = '0.7';
            container.style.transform = 'translateY(10px)';
        }
        
        setTimeout(() => {
            if (tab === 'shopping') {
                navigate('/shop');
            } else if (tab === 'cart') {
                navigate('/cart');
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
            <div className="wishlist-container">
                <div className="wishlist-content">
                    {/* Header with Tabs */}
                    <div className="wishlist-header">
                        <div className="header-content">
                            <div className="title-section">
                                <h1 className="wishlist-title">찜 목록</h1>
                                <p className="wishlist-subtitle">마음에 드는 향수를 모아보세요. ({wishlistPerfumes.length})</p>
                            </div>
                            
                            {/* Action Buttons */}
                            {wishlistPerfumes.length > 0 && (
                                <div className="action-buttons">
                                    <button 
                                        className="clear-all-btn"
                                        onClick={handleClearAll}
                                    >
                                        전체 삭제
                                    </button>
                                    <button 
                                        className="add-all-cart-btn"
                                        onClick={handleAddAllToCart}
                                    >
                                        <div className="cart-icon-with-plus">
                                            <ShoppingBag size={16} />
                                            <div className="plus-icon">+</div>
                                        </div>
                                        전체 장바구니 추가
                                    </button>
                                </div>
                            )}
                            
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
                                    className="tab-button tab-button-active"
                                >
                                    <div className="tab-icon-container">
                                        <Heart className="tab-icon" size={16} />
                                        <NotificationBadge count={wishlistCount} show={wishlistCount > 0} type="wishlist" />
                                    </div>
                                    찜
                                </button>
                                <div className="tab-separator"></div>
                                <button 
                                    className="tab-button"
                                    onClick={() => handleTabClick('cart')}
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

                    {wishlistPerfumes.length > 0 ? (
                        <div className="wishlist-grid">
                            {wishlistPerfumes.map((perfume) => (
                                <PerfumeCard
                                    key={perfume.id}
                                    perfume={perfume}
                                    isWishlisted={true}
                                    onToggleWishlist={handleToggleWishlist}
                                    onAddToCart={handleAddToCart}
                                    onViewDetail={handleViewDetail}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="wishlist-empty">
                            <Heart className="empty-icon" size={48} />
                            <h3>찜한 향수가 없습니다</h3>
                            <p>마음에 드는 향수를 찜해보세요!</p>
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

export default Wishlist;
