import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import styles from '../../css/shop/PerfumeCard.module.css';

function PerfumeCard({ perfume, isWishlisted, onToggleWishlist, onAddToCart, onViewDetail }) {
    const discount = perfume.originalPrice
        ? Math.round(((perfume.originalPrice - perfume.price) / perfume.originalPrice) * 100)
        : 0;

    return (
        <div className={styles.perfumeCard}>
            <div className={styles.cardImageContainer}>
                <img
                    src={perfume.image}
                    alt={perfume.name}
                    className={styles.cardImage}
                    onClick={() => onViewDetail(perfume)}
                />

                {/* Wishlist Button */}
                <button
                    className={styles.wishlistButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(perfume.id);
                    }}
                >
                    <Heart 
                        className={`${styles.heartIcon} ${isWishlisted ? styles.heartIconActive : ''}`} 
                    />
                </button>

            </div>

            <div className={styles.cardContent}>
                <div onClick={() => onViewDetail(perfume)}>
                    <h3 className={styles.perfumeName}>
                        {perfume.name}
                    </h3>
                    <p className={styles.volume}>{perfume.volume}</p>
                </div>

                {/* Price and Cart */}
                <div className={styles.priceCartContainer}>
                    <div className={styles.priceContainer}>
                        <div className={styles.priceRow}>
                            <span className={styles.price}>
                                ₩{perfume.price.toLocaleString()}
                            </span>
                            {perfume.originalPrice && (
                                <span className={styles.originalPrice}>
                                    ₩{perfume.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        className={styles.cartButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(perfume);
                        }}
                    >
                        <div className={styles.cartIcon}></div>
                        장바구니
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PerfumeCard;
