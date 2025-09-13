// React와 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ShoppingTab from '../../components/shop/ShoppingTab';
import { fetchShopPerfumes, selectShopPerfumes, selectShopLoading, selectShopError } from '../../module/ShopModule';
import '../../css/shop/Shop.css';


/**
 * Shop 컴포넌트
 * 쇼핑 페이지의 메인 컴포넌트입니다.
 * 백엔드 API에서 자체제작 향수 목록을 가져와서 표시하고 찜하기, 장바구니 추가 기능을 제공합니다.
 */
function Shop() {
    // React Router의 네비게이션 훅
    const navigate = useNavigate();
    
    // Redux hooks
    const dispatch = useDispatch();
    
    // Redux 상태에서 데이터 가져오기
    const perfumes = useSelector(selectShopPerfumes);
    const loading = useSelector(selectShopLoading);
    const error = useSelector(selectShopError);
    
    // 찜 목록 상태 (Set을 사용하여 중복 방지)
    const [wishlist, setWishlist] = useState(new Set());

    /**
     * 컴포넌트 마운트 시 실행되는 useEffect
     * localStorage에서 찜 목록을 불러오고, 백엔드에서 자체제작 향수 목록을 가져옵니다.
     */
    useEffect(() => {
        // localStorage에서 찜 목록 불러오기
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlist(new Set(JSON.parse(savedWishlist)));
        }

        // 백엔드에서 자체제작 향수 목록 가져오기
        dispatch(fetchShopPerfumes());
    }, [dispatch]); // dispatch가 변경될 때마다 실행

    /**
     * 찜 목록에 향수를 추가하거나 제거하는 함수
     * 
     * @param {string} id - 찜할/제거할 향수의 ID
     */
    const handleToggleWishlist = (id) => {
        setWishlist(prev => {
            const newWishlist = new Set(prev);
            if (newWishlist.has(id)) {
                // 이미 찜한 항목이면 제거
                newWishlist.delete(id);
            } else {
                // 찜하지 않은 항목이면 추가
                newWishlist.add(id);
            }
            // localStorage에 저장 (Set을 배열로 변환하여 저장)
            localStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
            return newWishlist;
        });
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
    };

    /**
     * 향수 상세보기 함수
     * 향수 카드 클릭 시 실행되는 함수입니다.
     * 현재는 콘솔에 로그만 출력하며, 향후 상세 페이지로 이동하는 로직이 구현될 예정입니다.
     * 
     * @param {Object} perfume - 상세보기할 향수 객체
     */
    const handleViewDetail = (perfume) => {
        console.log('상세보기:', perfume);
        // 향후 상세보기 로직 구현 예정
    };

    // 로딩 상태일 때 표시할 컴포넌트
    if (loading) {
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
                
                {/* 로딩 상태 표시 */}
                <div className="shop-container">
                    <div className="shop-content">
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>자체제작 향수 목록을 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // 에러 상태일 때 표시할 컴포넌트
    if (error) {
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
                
                {/* 에러 상태 표시 */}
                <div className="shop-container">
                    <div className="shop-content">
                        <div className="error-container">
                            <h3>오류가 발생했습니다</h3>
                            <p>{error}</p>
                            <button 
                                className="retry-button"
                                onClick={() => dispatch(fetchShopPerfumes())}
                            >
                                다시 시도
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

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
            
            {/* 쇼핑 페이지 메인 컨테이너 */}
            <div className="shop-container">
                <div className="shop-content">
                    {/* ShoppingTab 컴포넌트에 필요한 props 전달 */}
                    <ShoppingTab
                        perfumes={perfumes}                    // Redux에서 가져온 자체제작 향수 목록
                        wishlist={wishlist}                   // 찜 목록 데이터
                        onToggleWishlist={handleToggleWishlist} // 찜하기 토글 함수
                        onAddToCart={handleAddToCart}          // 장바구니 추가 함수
                        onViewDetail={handleViewDetail}        // 상세보기 함수
                    />
                </div>
            </div>
        </>
    );
}


// Shop 컴포넌트를 기본 export로 내보내기
export default Shop;
