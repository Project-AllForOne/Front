import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Heart, ShoppingBag } from 'lucide-react';
import PerfumeCard from './PerfumeCard';
import NotificationBadge from './NotificationBadge';
import styles from '../../css/shop/ShoppingTab.module.css';

function ShoppingTab({ perfumes, wishlist, onToggleWishlist, onAddToCart, onViewDetail }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('shopping');
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    // localStorage에서 찜과 장바구니 개수 불러오기
    useEffect(() => {
        const updateCounts = () => {
            const savedWishlist = localStorage.getItem('wishlist');
            const savedCart = localStorage.getItem('cart');
            
            if (savedWishlist) {
                setWishlistCount(JSON.parse(savedWishlist).length);
            }
            
            if (savedCart) {
                const cart = JSON.parse(savedCart);
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            }
        };

        updateCounts();
        
        // localStorage 변경 감지
        const handleStorageChange = () => {
            updateCounts();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // 주기적으로 업데이트 (다른 탭에서 변경된 경우)
        const interval = setInterval(updateCounts, 500);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // 찜 개수 업데이트
    useEffect(() => {
        setWishlistCount(wishlist.size);
    }, [wishlist]);

    const filteredPerfumes = perfumes.filter(perfume => {
        const matchesSearch = perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perfume.brand.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        // 부드러운 페이지 전환을 위한 애니메이션
        const container = document.querySelector(`.${styles.container}`);
        if (container) {
            container.style.opacity = '0.7';
            container.style.transform = 'translateY(10px)';
        }
        
        setTimeout(() => {
            if (tab === 'wishlist') {
                navigate('/wishlist');
            } else if (tab === 'cart') {
                navigate('/cart');
            }
        }, 150);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
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
                    
                    {/* Navigation Tabs */}
                    <div className={styles.navTabs}>
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'shopping' ? styles.tabButtonActive : ''}`}
                            onClick={() => handleTabClick('shopping')}
                        >
                            쇼핑
                        </button>
                        <div className={styles.tabSeparator}></div>
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
                <div className={styles.headerLine}></div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Results Header */}
                <div className={styles.resultsHeader}>
                    <div>
                        <h2 className={styles.resultsTitle}>향수 컬렉션</h2>
                        <p className={styles.resultsCount}>
                            {filteredPerfumes.length}개의 향수
                        </p>
                    </div>
                </div>

                {/* Perfume Grid */}
                {filteredPerfumes.length > 0 ? (
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

export default ShoppingTab;
