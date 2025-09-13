// React와 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Heart, ShoppingBag } from 'lucide-react';
import PerfumeCard from './PerfumeCard';
import NotificationBadge from './NotificationBadge';
import styles from '../../css/shop/ShoppingTab.module.css';

/**
 * ShoppingTab 컴포넌트
 * 쇼핑 페이지의 메인 탭 컴포넌트로, 향수 목록을 표시하고 검색, 찜, 장바구니 기능을 제공합니다.
 * 
 * @param {Array} perfumes - 표시할 향수 목록
 * @param {Set} wishlist - 찜한 향수 ID들의 Set
 * @param {Function} onToggleWishlist - 찜 추가/제거 함수
 * @param {Function} onAddToCart - 장바구니 추가 함수
 * @param {Function} onViewDetail - 향수 상세보기 함수
 */
function ShoppingTab({ perfumes, wishlist, onToggleWishlist, onAddToCart, onViewDetail }) {
    // React Router의 네비게이션 훅
    const navigate = useNavigate();
    
    // 검색어 상태 관리
    const [searchTerm, setSearchTerm] = useState('');
    
    // 현재 활성화된 탭 상태 (shopping, wishlist, cart)
    const [activeTab, setActiveTab] = useState('shopping');
    
    // 찜 목록 개수 상태
    const [wishlistCount, setWishlistCount] = useState(0);
    
    // 장바구니 아이템 개수 상태
    const [cartCount, setCartCount] = useState(0);

    /**
     * localStorage에서 찜과 장바구니 개수를 불러와서 상태를 업데이트하는 useEffect
     * 컴포넌트가 마운트될 때 실행되고, localStorage 변경을 감지합니다.
     */
    useEffect(() => {
        // 찜과 장바구니 개수를 업데이트하는 함수
        const updateCounts = () => {
            // localStorage에서 찜 목록 가져오기
            const savedWishlist = localStorage.getItem('wishlist');
            // localStorage에서 장바구니 목록 가져오기
            const savedCart = localStorage.getItem('cart');
            
            // 찜 목록이 있으면 개수 업데이트
            if (savedWishlist) {
                setWishlistCount(JSON.parse(savedWishlist).length);
            }
            
            // 장바구니가 있으면 총 아이템 개수 계산 (수량 포함)
            if (savedCart) {
                const cart = JSON.parse(savedCart);
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            }
        };

        // 초기 개수 업데이트
        updateCounts();
        
        // localStorage 변경을 감지하는 이벤트 리스너
        const handleStorageChange = () => {
            updateCounts();
        };
        
        // storage 이벤트 리스너 등록 (다른 탭에서 localStorage 변경 시)
        window.addEventListener('storage', handleStorageChange);
        
        // 주기적으로 업데이트 (다른 탭에서 변경된 경우를 대비)
        const interval = setInterval(updateCounts, 500);
        
        // 컴포넌트 언마운트 시 이벤트 리스너와 인터벌 정리
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

    /**
     * 찜 목록이 변경될 때마다 찜 개수를 업데이트하는 useEffect
     * props로 받은 wishlist Set의 크기를 찜 개수로 설정합니다.
     */
    useEffect(() => {
        setWishlistCount(wishlist.size);
    }, [wishlist]); // wishlist가 변경될 때마다 실행

    /**
     * 검색어에 따라 향수 목록을 필터링하는 함수
     * 향수 이름이나 브랜드명에 검색어가 포함된 항목만 반환합니다.
     */
    const filteredPerfumes = perfumes.filter(perfume => {
        // 검색어를 소문자로 변환하여 대소문자 구분 없이 검색
        const matchesSearch = perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perfume.brand.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    /**
     * 탭 클릭 시 실행되는 함수
     * 탭 전환 애니메이션을 적용하고 해당 페이지로 이동합니다.
     * 
     * @param {string} tab - 클릭된 탭 이름 ('shopping', 'wishlist', 'cart')
     */
    const handleTabClick = (tab) => {
        // 활성 탭 상태 업데이트
        setActiveTab(tab);
        
        // 부드러운 페이지 전환을 위한 페이드 아웃 애니메이션
        const container = document.querySelector(`.${styles.container}`);
        if (container) {
            container.style.opacity = '0.7';
            container.style.transform = 'translateY(10px)';
        }
        
        // 애니메이션 후 페이지 이동 (150ms 지연)
        setTimeout(() => {
            if (tab === 'wishlist') {
                navigate('/wishlist'); // 찜 페이지로 이동
            } else if (tab === 'cart') {
                navigate('/cart'); // 장바구니 페이지로 이동
            }
            // 'shopping' 탭은 현재 페이지이므로 이동하지 않음
        }, 150);
    };

    return (
        <div className={styles.container}>
            {/* 페이지 상단 헤더 영역 */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    {/* 검색 바 영역 */}
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="향수명"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Search
                            className={styles.searchIcon}
                            size={20}
                            color="#333"
                        />
                    </div>
                    
                    {/* 네비게이션 탭 영역 */}
                    <div className={styles.navTabs}>
                        {/* 쇼핑 탭 */}
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'shopping' ? styles.tabButtonActive : ''}`}
                            onClick={() => handleTabClick('shopping')}
                        >
                            쇼핑
                        </button>
                        <div className={styles.tabSeparator}></div>
                        
                        {/* 찜 탭 (하트 아이콘과 알림 배지 포함) */}
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'wishlist' ? styles.tabButtonActive : ''}`}
                            onClick={() => handleTabClick('wishlist')}
                        >
                            <div className={styles.tabIconContainer}>
                                <Heart className={styles.tabIcon} size={16} />
                                <NotificationBadge count={wishlistCount} show={wishlistCount > 0} type="wishlist" />
                            </div>
                            찜
                        </button>
                        <div className={styles.tabSeparator}></div>
                        
                        {/* 장바구니 탭 (쇼핑백 아이콘과 알림 배지 포함) */}
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'cart' ? styles.tabButtonActive : ''}`}
                            onClick={() => handleTabClick('cart')}
                        >
                            <div className={styles.tabIconContainer}>
                                <div className={styles.shoppingBagIcon}></div>
                                <NotificationBadge count={cartCount} show={cartCount > 0} type="cart" />
                            </div>
                            장바구니
                        </button>
                    </div>
                </div>
                {/* 헤더 하단 구분선 */}
                <div className={styles.headerLine}></div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className={styles.content}>
                {/* 검색 결과 헤더 */}
                <div className={styles.resultsHeader}>
                    <div>
                        <h2 className={styles.resultsTitle}>향수 컬렉션</h2>
                        <p className={styles.resultsCount}>
                            {filteredPerfumes.length}개의 향수
                        </p>
                    </div>
                </div>

                {/* 향수 목록 그리드 또는 검색 결과 없음 메시지 */}
                {filteredPerfumes.length > 0 ? (
                    // 검색 결과가 있을 때: 향수 카드들을 그리드로 표시
                    <div className={styles.perfumeGrid}>
                        {filteredPerfumes.map((perfume) => (
                            <PerfumeCard
                                key={perfume.id}
                                perfume={perfume}
                                isWishlisted={wishlist.has(perfume.id)}
                                onToggleWishlist={onToggleWishlist}
                                onAddToCart={onAddToCart}
                                onViewDetail={onViewDetail}
                            />
                        ))}
                    </div>
                ) : (
                    // 검색 결과가 없을 때: 안내 메시지 표시
                    <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>
                            <Filter className={styles.filterIconLarge} />
                        </div>
                        <h3 className={styles.noResultsTitle}>
                            검색 결과가 없습니다
                        </h3>
                        <p className={styles.noResultsText}>
                            다른 검색어를 시도해보세요
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ShoppingTab 컴포넌트를 기본 export로 내보내기
export default ShoppingTab;
