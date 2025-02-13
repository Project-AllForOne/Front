import React from 'react';
import { Edit } from 'lucide-react';
import line_ from '../../data/line_.json';
import styles from '../../css/spices/SpicesCard.module.css';

/**
 * 설명에서 첫 문장만 추출하는 함수
 * @param {string} description - 전체 설명 텍스트
 * @returns {string} - 첫 문장 (마침표 포함)
 */
const getMainDescription = (description) => {
    return description.split('.')[0] + '.';
};

/**
 * 설명에서 주요 키워드를 추출하는 함수
 * @param {string} contentKr - 한글 설명 텍스트
 * @returns {array} - 추출된 키워드 배열 (최대 5개)
 */
const getKeywords = (contentKr) => {
    // 향의 특성을 나타내는 단어들 추출
    const flavorPatterns = [
        // 기본 맛/향 특성
        /(달콤|상큼|쌉쌀|부드러|시원|따뜻|강렬|은은)한/g,
        // 구체적인 향 계열
        /(우디|플로럴|과일|허브|스파이시|시트러스)/g,
        // ~향이 나는 (단, '조향' 제외)
        /(?<!조)([가-힣a-zA-Z]+)향/g,
        // ~와 비슷한
        /([가-힣a-zA-Z]+)와 비슷/g,
        // ~을 연상시키는
        /([가-힣a-zA-Z]+)[을를] 연상/g
    ];

    // 각 패턴으로 키워드 추출 및 정제
    const keywords = flavorPatterns
        .flatMap(pattern => contentKr.match(pattern) || [])
        .map(keyword => keyword.replace(/한$/, ''))  // "~한" 제거
        .filter(keyword =>
            !keyword.includes('조향') &&
            !keyword.includes('향료') &&
            !keyword.includes('향수')
        );  // 기술적 용어 제외

    // 중복 제거 후 최대 5개까지 반환
    return [...new Set(keywords)].slice(0, 5);
};

/**
 * 향료 카드 컴포넌트
 * @param {object} spice - 향료 데이터
 * @param {boolean} showCheckboxes - 체크박스 표시 여부
 * @param {string} selectedCard - 선택된 카드 ID
 * @param {string} role - 사용자 역할
 * @param {function} onCheckboxChange - 체크박스 변경 핸들러
 * @param {function} onEditClick - 수정 버튼 클릭 핸들러
 */
const SpicesCard = ({
    spice,
    showCheckboxes,
    selectedCard,
    role,
    onCheckboxChange,
    onEditClick
}) => {

    // 계열별 색상을 가져오는 함수
    const getLineColor = (lineName) => {
        const line = line_.find(l => l.name === lineName);
        return line ? `#${line.color}` : '#EFEDED';
    };

    // 배경색에 따른 텍스트 색상 계산
    const getTextColor = (backgroundColor) => {
        const hex = backgroundColor.replace('#', '');
        const brightness =
            parseInt(hex.slice(0, 2), 16) * 0.299 +
            parseInt(hex.slice(2, 4), 16) * 0.587 +
            parseInt(hex.slice(4, 6), 16) * 0.114;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    };

    const lineColor = getLineColor(spice.lineName);
    const textColor = getTextColor(lineColor);

    return (
        <div className={styles.cardWrapper}>
            {/* 체크박스 */}
            {showCheckboxes && (
                <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedCard === spice.id}
                    onChange={() => onCheckboxChange(spice.id)}
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            {/* 관리자 수정 버튼 */}
            {role === 'ADMIN' && (
                <button
                    className={styles.editButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(spice);
                    }}
                >
                    <Edit size={16} color="#333" />
                </button>
            )}

            <div className={styles.card}>
                {/* 카드 앞면 */}
                <div className={styles.front}>
                    <img
                        src={spice.imageUrlList?.[0] || 'https://mblogthumb-phinf.pstatic.net/MjAyMDA1MDZfMTk3/MDAxNTg4Nzc1MjcwMTQ2.l8lHrUz8ZfSDCShKbMs8RzQj37B3jxpwRnQK7byS9k4g.OORSv5IlMThMSNj20nz7_OYBzSTkxwnV9QGGV8a3tVkg.JPEG.herbsecret/essential-oils-2738555_1920.jpg?type=w800'}
                        alt={spice.nameEn}
                        className={styles.image}
                    />
                    <h3 className={styles.nameEn}>{spice.nameEn}</h3>
                    <h3 className={styles.nameKr}>{spice.nameKr}</h3>
                    <div className={styles.divider}></div>
                    <p className={styles.category}>{spice.lineName} 계열</p>
                </div>

                {/* 카드 뒷면 */}
                <div className={styles.back} style={{ backgroundColor: lineColor, color: textColor }}>
                    <h3 className={styles.nameKr}>{spice.nameKr}</h3>
                    <div className={styles.divider}></div>
                    <div className={styles.description}>
                        <p className={styles.mainDescription}>
                            {getMainDescription(spice.contentKr)}
                        </p>
                        <div className={styles.keyPoints}>
                            {getKeywords(spice.contentKr).map((keyword, i) => (
                                <span key={i} className={styles.keyword}>
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpicesCard;