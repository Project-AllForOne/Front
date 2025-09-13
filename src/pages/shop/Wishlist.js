// React와 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Search, ShoppingBag } from 'lucide-react';
import PerfumeCard from '../../components/shop/PerfumeCard';
import NotificationBadge from '../../components/shop/NotificationBadge';
import '../../css/shop/Wishlist.css';

/**
 * 향수 데이터 타입 정의
 * 향수 객체의 구조를 명시하는 타입 정의입니다.
 * 실제 데이터는 이 구조를 따릅니다.
 */
const Perfume = {
    id: String,                    // 향수 고유 ID
    name: String,                  // 향수 이름
    brand: String,                 // 브랜드명
    price: Number,                 // 현재 가격
    originalPrice: Number,         // 원가 (할인이 있는 경우)
    image: String,                 // 메인 이미지 경로
    rating: Number,                // 평점
    category: String,              // 카테고리
    description: String,           // 향수 설명
    volume: String,                // 용량 (예: '50ml', '100ml')
    notes: {                       // 향수 노트 정보
        top: Array,               // 탑 노트 (처음 느껴지는 향)
        middle: Array,            // 미들 노트 (중간에 느껴지는 향)
        base: Array               // 베이스 노트 (마지막에 남는 향)
    },
    detailImages: {                // 상세 페이지용 이미지들
        ingredients: String,       // 재료 이미지
        process: String,           // 제조 과정 이미지
        brand: String,             // 브랜드 이미지
        lifestyle: String          // 라이프스타일 이미지
    }
};

/**
 * Wishlist 컴포넌트
 * 찜 목록 페이지를 담당하는 컴포넌트입니다.
 * 찜한 향수들을 표시하고, 전체 삭제, 전체 장바구니 추가 기능을 제공합니다.
 */
function Wishlist() {
    // React Router의 네비게이션 훅
    const navigate = useNavigate();
    
    // 찜 목록 상태 (Set을 사용하여 중복 방지)
    const [wishlist, setWishlist] = useState(new Set());
    
    // 향수 목록 상태
    const [perfumes, setPerfumes] = useState([]);
    
    // 찜 목록 개수 상태
    const [wishlistCount, setWishlistCount] = useState(0);
    
    // 장바구니 아이템 개수 상태
    const [cartCount, setCartCount] = useState(0);

    /**
     * 컴포넌트 마운트 시 localStorage에서 찜 목록을 불러오는 useEffect
     */
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlist(new Set(JSON.parse(savedWishlist)));
        }
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

    /**
     * 컴포넌트 마운트 시 localStorage에서 향수 데이터를 불러오는 useEffect
     */
    useEffect(() => {
        const savedPerfumes = localStorage.getItem('perfumes');
        if (savedPerfumes) {
            setPerfumes(JSON.parse(savedPerfumes));
        }
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

    /**
     * 찜 목록이 변경될 때마다 알림 개수를 업데이트하는 useEffect
     */
    useEffect(() => {
        // 찜 목록 개수 업데이트
        setWishlistCount(wishlist.size);
        
        // localStorage에서 장바구니 총 아이템 개수 계산
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const cart = JSON.parse(savedCart);
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
        }
    }, [wishlist]); // wishlist가 변경될 때마다 실행

    /**
     * 찜 목록에 있는 향수만 필터링하는 변수
     * 전체 향수 목록에서 찜한 향수 ID가 포함된 항목들만 추출합니다.
     */
    const wishlistPerfumes = perfumes.filter(perfume => wishlist.has(perfume.id));

    /**
     * 찜 목록에 향수를 추가하거나 제거하는 함수
     * 
     * @param {string} perfumeId - 찜할/제거할 향수의 ID
     */
    const handleToggleWishlist = (perfumeId) => {
        const newWishlist = new Set(wishlist);
        if (newWishlist.has(perfumeId)) {
            // 이미 찜한 항목이면 제거
            newWishlist.delete(perfumeId);
        } else {
            // 찜하지 않은 항목이면 추가
            newWishlist.add(perfumeId);
        }
        setWishlist(newWishlist);
        // localStorage에 저장 (Set을 배열로 변환하여 저장)
        localStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
    };

    /**
     * 장바구니에 향수를 추가하는 함수
     * 이미 장바구니에 있는 향수면 수량을 증가시키고, 없으면 새로 추가합니다.
     * 추가 후 시각적 피드백을 위한 애니메이션을 적용합니다.
     * 
     * @param {Object} perfume - 장바구니에 추가할 향수 객체
     */
    const handleAddToCart = (perfume) => {
        // localStorage에서 기존 장바구니 데이터 불러오기
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === perfume.id);
        
        if (existingItem) {
            // 이미 장바구니에 있는 향수면 수량 증가
            existingItem.quantity += 1;
        } else {
            // 새로운 향수면 수량 1로 추가
            cart.push({ ...perfume, quantity: 1 });
        }
        
        // 업데이트된 장바구니를 localStorage에 저장
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 장바구니 아이콘에 애니메이션 효과 추가 (확대 후 원래 크기로)
        const cartIcons = document.querySelectorAll('.shopping-bag-icon');
        cartIcons.forEach(icon => {
            icon.style.transform = 'scale(1.3)';
            icon.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        });
        
        // 장바구니 배지에 애니메이션 효과 추가 (확대 후 원래 크기로)
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

    /**
     * 향수 상세보기 함수
     * 향수 카드 클릭 시 상세 페이지로 이동합니다.
     * 
     * @param {Object} perfume - 상세보기할 향수 객체
     */
    const handleViewDetail = (perfume) => {
        // 향수 상세 페이지로 이동
        navigate(`/perfume/${perfume.id}`);
    };

    /**
     * 찜 목록을 모두 비우는 함수
     * 상태와 localStorage를 모두 초기화합니다.
     */
    const handleClearAll = () => {
        setWishlist(new Set());
        localStorage.setItem('wishlist', JSON.stringify([]));
        setWishlistCount(0);
    };

    /**
     * 찜 목록의 모든 향수를 장바구니에 추가하는 함수
     * 찜 목록이 비어있으면 실행하지 않습니다.
     * 추가 후 시각적 피드백을 위한 애니메이션을 적용합니다.
     */
    const handleAddAllToCart = () => {
        // 찜 목록이 비어있으면 함수 종료
        if (wishlist.size === 0) {
            return;
        }

        // localStorage에서 기존 장바구니 데이터 불러오기
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        // 찜 목록에 있는 향수들만 필터링
        const wishlistPerfumes = perfumes.filter(perfume => wishlist.has(perfume.id));
        
        // 각 찜한 향수를 장바구니에 추가
        wishlistPerfumes.forEach(perfume => {
            const existingItem = cart.find(item => item.id === perfume.id);
            if (existingItem) {
                // 이미 장바구니에 있으면 수량 증가
                existingItem.quantity += 1;
            } else {
                // 없으면 새로 추가
                cart.push({ ...perfume, quantity: 1 });
            }
        });
        
        // 업데이트된 장바구니를 localStorage에 저장
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 장바구니 아이콘에 애니메이션 효과 추가 (확대 후 원래 크기로)
        const cartIcons = document.querySelectorAll('.shopping-bag-icon');
        cartIcons.forEach(icon => {
            icon.style.transform = 'scale(1.3)';
            icon.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        });
        
        // 장바구니 배지에 애니메이션 효과 추가 (확대 후 원래 크기로)
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

    /**
     * 탭 클릭 시 실행되는 함수
     * 탭 전환 애니메이션을 적용하고 해당 페이지로 이동합니다.
     * 
     * @param {string} tab - 클릭된 탭 이름 ('shopping', 'cart')
     */
    const handleTabClick = (tab) => {
        // 부드러운 페이지 전환을 위한 페이드 아웃 애니메이션
        const container = document.querySelector('.wishlist-container');
        if (container) {
            container.style.opacity = '0.7';
            container.style.transform = 'translateY(10px)';
        }
        
        // 애니메이션 후 페이지 이동 (150ms 지연)
        setTimeout(() => {
            if (tab === 'shopping') {
                navigate('/shop'); // 쇼핑 페이지로 이동
            } else if (tab === 'cart') {
                navigate('/cart'); // 장바구니 페이지로 이동
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
            <div className="wishlist-container">
                <div className="wishlist-content">
                    {/* 페이지 헤더 영역 (제목, 액션 버튼, 네비게이션 탭) */}
                    <div className="wishlist-header">
                        <div className="header-content">
                            {/* 페이지 제목 영역 */}
                            <div className="title-section">
                                <h1 className="wishlist-title">찜 목록</h1>
                                <p className="wishlist-subtitle">마음에 드는 향수를 모아보세요. ({wishlistPerfumes.length})</p>
                            </div>
                            
                            {/* 액션 버튼들 (찜 목록이 있을 때만 표시) */}
                            {wishlistPerfumes.length > 0 && (
                                <div className="action-buttons">
                                    {/* 전체 삭제 버튼 */}
                                    <button 
                                        className="clear-all-btn"
                                        onClick={handleClearAll}
                                    >
                                        전체 삭제
                                    </button>
                                    {/* 전체 장바구니 추가 버튼 */}
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
                                
                                {/* 찜 탭 (현재 활성화된 탭, 하트 아이콘과 알림 배지 포함) */}
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
                                
                                {/* 장바구니 탭 (쇼핑백 아이콘과 알림 배지 포함) */}
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
                        {/* 헤더 하단 구분선 */}
                        <div className="header-line"></div>
                    </div>

                    {/* 찜 목록에 아이템이 있을 때와 없을 때의 조건부 렌더링 */}
                    {wishlistPerfumes.length > 0 ? (
                        // 찜 목록에 아이템이 있을 때: 향수 카드들을 그리드로 표시
                        <div className="wishlist-grid">
                            {wishlistPerfumes.map((perfume) => (
                                <PerfumeCard
                                    key={perfume.id}
                                    perfume={perfume}
                                    isWishlisted={true} // 찜 목록에 있으므로 항상 true
                                    onToggleWishlist={handleToggleWishlist}
                                    onAddToCart={handleAddToCart}
                                    onViewDetail={handleViewDetail}
                                />
                            ))}
                        </div>
                    ) : (
                        // 찜 목록이 비어있을 때: 빈 상태 메시지 표시
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

// Wishlist 컴포넌트를 기본 export로 내보내기
export default Wishlist;
