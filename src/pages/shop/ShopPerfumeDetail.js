// React와 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, CreditCard, Menu, ArrowLeft } from 'lucide-react';
import NotificationBadge from '../../components/shop/NotificationBadge';
import Sidebar from '../../components/sidebar/Sidebar';
import { 
    addToWishlistThunk,
    removeFromWishlistThunk,
    selectWishlistIds,
    fetchWishlist
} from '../../module/WishlistModule';
import { addToCartThunk, selectCartCount, fetchCart } from '../../module/CartModule';
import { getPerfumeById } from '../../api/ShopAPICalls';
import '../../css/shop/PerfumeDetail.css';
import styles from '../../css/shop/ShoppingTab.module.css';

/**
 * 향수 상세페이지 컴포넌트
 * 향수의 상세 정보를 표시하고 찜하기, 장바구니 추가, 구매하기 기능을 제공합니다.
 */
function ShopPerfumeDetail() {
    // React Router hooks
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Redux hooks
    const dispatch = useDispatch();
    const wishlistIds = useSelector(selectWishlistIds);
    const cartCount = useSelector(selectCartCount);
    
    // 임시 회원 ID (실제로는 로그인된 사용자 ID를 사용해야 함)
    const [memberId] = useState(1);
    
    // 향수 상세 정보 상태
    const [perfume, setPerfume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showActions, setShowActions] = useState(true);

    /**
     * 향수 상세 정보를 가져오는 함수
     */
    useEffect(() => {
        // 찜 목록과 장바구니 상태 초기화
        dispatch(fetchWishlist(memberId));
        dispatch(fetchCart(memberId));
        
        const fetchPerfumeDetail = async () => {
            try {
                setLoading(true);
                
                console.log('요청된 향수 ID:', id, '타입:', typeof id);
                
                // 백엔드 API를 통해 향수 상세 데이터 가져오기
                const perfumeDataArray = await getPerfumeById(parseInt(id));
                
                console.log('백엔드에서 가져온 향수 데이터:', perfumeDataArray);
                
                // 배열에서 해당 ID의 향수를 찾기
                const perfumeData = perfumeDataArray.find(p => p.id === parseInt(id)) || perfumeDataArray[0];
                
                console.log('선택된 향수 데이터:', perfumeData);
                
                // 테마 설정 (향수 이름에 따라)
                let theme = 'luna'; // 기본 테마
                const nameToCheck = perfumeData.nameEn || perfumeData.name || '';
                if (nameToCheck.toLowerCase().includes('ether')) {
                    theme = 'ether';
                } else if (nameToCheck.toLowerCase().includes('nuage')) {
                    theme = 'nuage';
                } else if (nameToCheck.toLowerCase().includes('luna')) {
                    theme = 'luna';
                }
                
                // 백엔드 데이터를 직접 사용
                const transformedPerfume = {
                    id: perfumeData.id, // 1576
                    name: perfumeData.nameEn, // "Nuage by Banghyang Eau de Parfum"
                    koreanName: perfumeData.nameKr, // "누아쥬 바이 방향 오 드 퍼퓸"
                    brand: perfumeData.brand, // "방향"
                    mainAccord: perfumeData.mainAccord, // "프루티 / 플로럴"
                    mainNote: perfumeData.middleNote || 'Unknown', // 모든 미들 노트
                    volume: perfumeData.sizeOption, // "75ml"
                    price: perfumeData.price, // 72000
                    image: (perfumeData.imageUrls && perfumeData.imageUrls[0]) || (perfumeData.imageUrlList && perfumeData.imageUrlList[0]) || '/images/default-perfume.png',
                    description: perfumeData.content, // "프랑스어로 구름, 포근하고 부드러운 이미지"
                    notes: {
                        top: perfumeData.topNote ? perfumeData.topNote.split(', ').filter(note => note.trim()) : [],
                        middle: perfumeData.middleNote ? perfumeData.middleNote.split(', ').filter(note => note.trim()) : [],
                        base: perfumeData.baseNote ? perfumeData.baseNote.split(', ').filter(note => note.trim()) : []
                    },
                    theme: theme
                };
                
                setPerfume(transformedPerfume);
            } catch (err) {
                console.error('향수 상세 정보 조회 실패:', err);
                setError('향수 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPerfumeDetail();
    }, [id]);

    /**
     * 스크롤 이벤트 핸들러
     */
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateScrollDirection = () => {
            const scrollY = window.scrollY;
            const direction = scrollY > lastScrollY ? 'down' : 'up';
            
            // 푸터 요소 찾기
            const footer = document.querySelector('footer') || document.querySelector('.footer');
            let opacity = 1;
            let pointerEvents = 'auto';
            let shouldHideTransform = false;
            
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const footerDistance = footerRect.top - windowHeight;
                
                // 푸터가 화면에 보이기 시작하는 100px 전부터 투명도 조절
                if (footerDistance < 100) {
                    opacity = Math.max(0, Math.min(1, footerDistance / 100));
                    if (opacity === 0) {
                        pointerEvents = 'none';
                    }
                }
                
                // 푸터가 하단 액션과 겹칠 정도로 가까워지면 transform으로 숨김
                // 하단 액션의 대략적인 높이를 80px로 가정
                if (footerRect.top < windowHeight - 40) {
                    shouldHideTransform = true;
                }
            } else {
                // 푸터를 찾을 수 없으면 문서 하단 기준으로 계산
                const documentHeight = document.documentElement.scrollHeight;
                const windowHeight = window.innerHeight;
                const scrollBottom = documentHeight - windowHeight;
                const footerDistanceFallback = scrollBottom - scrollY;
                
                if (footerDistanceFallback < 100) {
                    opacity = Math.max(0, Math.min(1, footerDistanceFallback / 100));
                    if (opacity === 0) {
                        pointerEvents = 'none';
                    }
                }
                
                if (scrollY > scrollBottom - 60) {
                    shouldHideTransform = true;
                }
            }
            
            const scrollingDown = direction === 'down' && scrollY > 100;
            
            // 기본적으로는 스크롤 방향에 따라 숨김/표시
            // 하지만 푸터와 겹칠 것 같으면 무조건 숨김
            if (scrollingDown || shouldHideTransform) {
                setShowActions(false);
            } else {
                setShowActions(true);
            }
            
            // 하단 액션 요소에 직접 opacity와 pointerEvents 적용
            const actionsElement = document.querySelector('.perfume-detail-actions');
            if (actionsElement) {
                actionsElement.style.opacity = opacity;
                actionsElement.style.pointerEvents = pointerEvents;
            }
            
            lastScrollY = scrollY > 0 ? scrollY : 0;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollDirection);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /**
     * 찜하기 토글 함수
     */
    const handleToggleWishlist = () => {
        if (wishlistIds.has(perfume.id)) {
            dispatch(removeFromWishlistThunk(memberId, perfume.id));
        } else {
            dispatch(addToWishlistThunk(memberId, perfume.id));
        }
    };

    /**
     * 장바구니 추가 함수
     */
    const handleAddToCart = () => {
        dispatch(addToCartThunk(memberId, perfume.id, 1));
        
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
    };

    /**
     * 구매하기 함수
     */
    const handleBuyNow = () => {
        // 구매 페이지로 이동 (구현 예정)
        console.log('구매하기:', perfume.name);
    };

    /**
     * 탭 클릭 함수
     */
    const handleTabClick = (tab) => {
        if (tab === 'shopping') {
            navigate('/shop');
        } else if (tab === 'wishlist') {
            navigate('/wishlist');
        } else if (tab === 'cart') {
            navigate('/cart');
        }
    };

    // 로딩 중일 때
    if (loading) {
        return (
            <div className="perfume-detail-loading">
                <div className="loading-spinner"></div>
                <p>향수 정보를 불러오는 중...</p>
            </div>
        );
    }

    // 에러가 있을 때
    if (error || !perfume) {
        return (
            <div className="perfume-detail-error">
                <h2>향수를 찾을 수 없습니다</h2>
                <p>{error || '요청하신 향수 정보가 존재하지 않습니다.'}</p>
                <button onClick={() => navigate('/shop')} className="back-to-shop-btn">
                    쇼핑 계속하기
                </button>
            </div>
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
            <div className={`perfume-detail-container ${perfume.theme}`}>
                <div className="perfume-detail-content">
                    {/* 디테일 컨테이너 영역 */}
                    <div className="detail-container">
                        {/* 페이지 상단 헤더 영역 - ShoppingTab과 동일한 구조 */}
                        <div className={styles.header}>
                            <div className={styles.headerContent}>
                                {/* 뒤로가기 버튼 */}
                                <button 
                                    className="back-button"
                                    onClick={() => navigate(-1)}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                
                                {/* 네비게이션 탭 영역 */}
                                <div className={styles.navTabs}>
                                    {/* 쇼핑 탭 */}
                                    <button 
                                        className={`${styles.tabButton} ${styles.tabButtonActive}`}
                                        onClick={() => handleTabClick('shopping')}
                                    >
                                        쇼핑
                                    </button>
                                    <div className={styles.tabSeparator}></div>
                                    
                                    {/* 찜 탭 (하트 아이콘과 알림 배지 포함) */}
                                    <button 
                                        className={styles.tabButton}
                                        onClick={() => handleTabClick('wishlist')}
                                        data-tab="wishlist"
                                    >
                                        <div className={styles.tabIconContainer}>
                                            <Heart className={styles.tabIcon} size={16} />
                                            <NotificationBadge count={wishlistIds.size} show={wishlistIds.size > 0} type="wishlist" />
                                        </div>
                                        찜
                                    </button>
                                    <div className={styles.tabSeparator}></div>
                                    
                                    {/* 장바구니 탭 (쇼핑백 아이콘과 알림 배지 포함) */}
                                    <button 
                                        className={styles.tabButton}
                                        onClick={() => handleTabClick('cart')}
                                        data-tab="cart"
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

                        {/* 메인 콘텐츠 */}
                        <main className="perfume-detail-main">
                            <div className="perfume-detail-card">
                                {/* 향수 이미지 */}
                                <div className="perfume-image-container">
                                    <img 
                                        src={perfume.image} 
                                        alt={perfume.name}
                                        className="perfume-image"
                                    />
                                </div>

                                {/* 향수 정보 */}
                                <div className="perfume-info-container">
                                    <h1 className="perfume-name">{perfume.name || '향수 이름'}</h1>
                                    <h2 className="perfume-korean-name">{perfume.koreanName || '향수 한글명'}</h2>
                                    
                                    <div className="perfume-attributes">
                                        <div className="attribute-item">
                                            <span className="attribute-label">Main Accord</span>
                                            <span className="attribute-value accord-tag">{perfume.mainAccord || 'Unknown'}</span>
                                        </div>
                                        <div className="attribute-item">
                                            <span className="attribute-label">Main Note</span>
                                            <span className="attribute-value">{perfume.mainNote || 'Unknown'}</span>
                                        </div>
                                        <div className="attribute-item">
                                            <span className="attribute-label">용량</span>
                                            <span className="attribute-value">{perfume.volume || '50ml'}</span>
                                        </div>
                                        <div className="attribute-item">
                                            <span className="attribute-label">가격</span>
                                            <span className="attribute-value price">₩{(perfume.price || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* 향수 노트 이미지 */}
                                    <div className="fragrance-notes-image">
                                        <img 
                                            src={`/images/${perfume.theme}-note.png`} 
                                            alt={`${perfume.theme} 노트`}
                                            className="notes-image"
                                        />
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* 하단 액션 버튼들 */}
                        <div className={`perfume-detail-actions ${showActions ? 'show' : 'hide'}`}>
                            <button 
                                className={`wishlist-btn ${wishlistIds.has(perfume.id) ? 'active' : ''}`}
                                onClick={handleToggleWishlist}
                            >
                                <Heart className="action-icon" size={20} />
                            </button>
                            <button className="add-to-cart-btn" onClick={handleAddToCart}>
                                <ShoppingBag className="action-icon" size={20} />
                                장바구니
                            </button>
                            <button className="buy-now-btn" onClick={handleBuyNow}>
                                <CreditCard className="action-icon" size={20} />
                                구매하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 사이드바 */}
            <Sidebar />
        </>
    );
}

export default ShopPerfumeDetail;
