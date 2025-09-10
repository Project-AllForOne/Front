import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShoppingTab from '../../components/shop/ShoppingTab';
import '../../css/shop/Shop.css';

// 향수 데이터 타입 정의
const Perfume = {
    id: '',
    name: '',
    price: 0,
    originalPrice: null,
    image: '',
    description: '',
    volume: '',
    notes: {
        top: [],
        middle: [],
        base: []
    },
    detailImages: {
        ingredients: '',
        process: '',
        brand: '',
        lifestyle: ''
    }
};

// 샘플 향수 데이터
const samplePerfumes = [
    {
        id: '1',
        name: '에테르 바이 방향 오 드 퍼퓸',
        price: 89000,
        originalPrice: null,
        image: '/images/ether.png',
        description: '에테르의 신비로운 향',
        volume: '75ml',
        notes: {
            top: ['베르가못', '핑크 페퍼'],
            middle: ['로즈', '자스민'],
            base: ['머스크', '샌달우드']
        },
        detailImages: {
            ingredients: '/images/1.png',
            process: '/images/2.png',
            brand: '/images/3.png',
            lifestyle: '/images/1.png'
        }
    },
    {
        id: '2',
        name: '누아쥬 바이 방향 오 드 퍼퓸',
        price: 72000,
        originalPrice: null,
        image: '/images/nuage.png',
        description: '구름처럼 부드러운 향',
        volume: '50ml',
        notes: {
            top: ['라벤더', '바닐라'],
            middle: ['일랑일랑', '피오니'],
            base: ['앰버', '화이트 머스크']
        },
        detailImages: {
            ingredients: '/images/1.png',
            process: '/images/2.png',
            brand: '/images/3.png',
            lifestyle: '/images/1.png'
        }
    },
    {
        id: '3',
        name: '루나 바이 방향 오 드 퍼퓸',
        price: 145000,
        originalPrice: null,
        image: '/images/luna.png',
        description: '달빛처럼 은은한 향',
        volume: '100ml',
        notes: {
            top: ['그레이프프루트', '네롤리'],
            middle: ['마그놀리아', '튜베로즈'],
            base: ['패출리', '오우드']
        },
        detailImages: {
            ingredients: '/images/1.png',
            process: '/images/2.png',
            brand: '/images/3.png',
            lifestyle: '/images/1.png'
        }
    }
];

function Shop() {
    const navigate = useNavigate();
    const [perfumes, setPerfumes] = useState(samplePerfumes);
    const [wishlist, setWishlist] = useState(new Set());

    // localStorage에서 찜 목록과 향수 데이터 불러오기
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlist(new Set(JSON.parse(savedWishlist)));
        }

        const savedPerfumes = localStorage.getItem('perfumes');
        if (savedPerfumes) {
            setPerfumes(JSON.parse(savedPerfumes));
        } else {
            // 처음 방문 시 샘플 데이터를 localStorage에 저장
            localStorage.setItem('perfumes', JSON.stringify(samplePerfumes));
        }
    }, []);

    const handleToggleWishlist = (id) => {
        setWishlist(prev => {
            const newWishlist = new Set(prev);
            if (newWishlist.has(id)) {
                newWishlist.delete(id);
            } else {
                newWishlist.add(id);
            }
            // localStorage에 저장
            localStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
            return newWishlist;
        });
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
    };

    const handleViewDetail = (perfume) => {
        console.log('상세보기:', perfume);
        // 상세보기 로직 구현
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
            <div className="shop-container">
                <div className="shop-content">
                    <ShoppingTab
                        perfumes={perfumes}
                        wishlist={wishlist}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onViewDetail={handleViewDetail}
                    />
                </div>
            </div>
        </>
    );
}


export default Shop;
