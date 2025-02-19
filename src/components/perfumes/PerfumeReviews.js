import React, { useState, useEffect } from 'react';
import styles from '../../css/perfumes/PerfumeReviews.module.css';
import ReviewSlider from '../../components/perfumes/ReviewSlider';
import { useSelector, useDispatch } from 'react-redux';
import { selectPerfumes } from '../../module/PerfumeModule';
import { fetchReviews, selectReviews, createNewReview } from '../../module/ReviewModule';
import ReviewModal from './ReviewModal';

const PerfumeReviews = ({ perfumeId }) => {
    const dispatch = useDispatch();
    const [selectedReview, setSelectedReview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [sliderLeft, setSliderLeft] = useState(0);
    const [cardOffset, setCardOffset] = useState(0);
    const [reviewContent, setReviewContent] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const perfumes = useSelector(selectPerfumes);
    const perfume = perfumes?.find(p => p.id === perfumeId);
    // 리뷰 데이터를 Redux에서 가져오기
    const reviews = useSelector(selectReviews) || [];
    const auth = useSelector(state => state.auth.auth);

    // 리뷰 데이터 로드
    useEffect(() => {
        if (perfumeId && (!reviews || reviews.length === 0)) {
            dispatch(fetchReviews(perfumeId));
        }
    }, [perfumeId]);

    // 리뷰 데이터가 변경될 때마다 슬라이더 상태 초기화
    useEffect(() => {
        setCurrentPage(1);
        setSliderLeft(0);
        setCardOffset(0);
    }, [reviews.length]);

    // 슬라이더 마우스 이벤트 핸들링 추가
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (isDragging) {
                const sliderLine = document.querySelector(`.${styles.sliderLine}`);
                if (!sliderLine) return;

                const rect = sliderLine.getBoundingClientRect();
                const newPosition = e.clientX - rect.left;
                const maxPosition = rect.width - 100;

                const boundedPosition = Math.max(0, Math.min(newPosition, maxPosition));
                const percentage = (boundedPosition / maxPosition) * 100;

                const cardWidth = 196 + 37;
                const maxScroll = (reviews.length - CARDS_PER_PAGE) * cardWidth;
                const newOffset = Math.min((percentage / 100) * maxScroll, maxScroll);

                setSliderLeft(percentage);
                setCardOffset(newOffset);

                const approximatePage = Math.floor((newOffset / maxScroll) * totalPages) + 1;
                if (approximatePage !== currentPage && approximatePage > 0 && approximatePage <= totalPages) {
                    setCurrentPage(approximatePage);
                }
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, currentPage, reviews.length]);

    const CARDS_PER_PAGE = 5;
    const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
    const userTopReview = reviews?.[0] || { content: "사용자 리뷰가 없습니다.", reviewer: "" };

    // 리뷰 작성 처리 함수 추가
    const handleReviewSubmit = () => {
        if (!auth) {
            alert('리뷰를 작성하려면 로그인이 필요합니다.');
            return;
        }

        const reviewData = {
            productId: perfumeId,
            memberId: auth.user.oauthId,
            content: reviewContent
        };

        dispatch(createNewReview(reviewData));
        setReviewContent('');  // 입력 필드 초기화
    };

    const handleMouseDown = (e) => {
        if (e.target.className.includes(styles.sliderHandle)) {
            setIsDragging(true);
            setStartX(e.clientX);
        }
    };

    // 모달 닫힐 때 리뷰 목록 새로고침
    const handleModalClose = () => {
        setIsModalOpen(false);
        dispatch(fetchReviews(perfumeId));
    };


    return (
        <div className={styles.reviewsContainer}>
            <div className={styles.topReviewsSection}>
                <div className={styles.topReviewCard}>
                    <h4>사용자 리뷰 top1</h4>
                    <div className={styles.reviewContent}>
                        <p>{userTopReview.content}</p>
                    </div>
                </div>
            </div>

            <div className={styles.reviewListSection}>
                <div className={styles.reviewsHeader}>
                    <button
                        className={styles.writeReviewBtn}
                        onClick={() => setIsModalOpen(true)}
                    >
                        리뷰 작성하기
                    </button>
                </div>

                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        dispatch(fetchReviews(perfumeId)); // 모달 닫힐 때 리뷰 목록 새로고침
                    }}
                    perfume={perfume}
                    onSubmit={handleReviewSubmit}
                />

                {/* 리뷰 목록 표시 */}
                <div className={styles.reviewCardsContainer}>
                    {reviews && reviews.length > 0 ? (
                        <div
                            className={styles.reviewCards}
                            style={{ transform: `translateX(-${cardOffset}px)` }}
                        >
                            {reviews.map((review, index) => (
                                <div
                                    key={review.id}
                                    className={`${styles.reviewCard} ${selectedReview === index ? styles.selected : ''}`}
                                    onClick={() => setSelectedReview(index)}
                                >
                                    <img
                                        src={perfume?.imageUrlList?.[0]}
                                        alt="향수 이미지"
                                        className={styles.perfumeThumb}
                                    />
                                    <div className={styles.divider} />
                                    <p className={styles.reviewContent}>{review.content}</p>
                                    <p className={styles.reviewerName}>{review.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noReviews}>아직 작성된 리뷰가 없습니다.</div>
                    )}
                </div>


                <ReviewSlider
                    currentPage={currentPage}
                    totalPages={totalPages}
                    isDragging={isDragging}
                    sliderLeft={sliderLeft}
                    cardOffset={cardOffset}
                    allReviews={reviews}
                    CARDS_PER_PAGE={CARDS_PER_PAGE}
                    onMouseDown={handleMouseDown}
                    setCurrentPage={setCurrentPage}
                    setSliderLeft={setSliderLeft}
                    setCardOffset={setCardOffset}
                />
            </div>
        </div>
    );
};

export default PerfumeReviews;