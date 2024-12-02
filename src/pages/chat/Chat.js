import '../../css/Chat.css';
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { fetchChatResponse, selectChatMode, selectRecommendedPerfumes, selectResponse, selectLoading, selectError } from "../../module/ChatModule";

function Chat() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const chatMode = useSelector(selectChatMode);
    const [recommendedPerfumes, setRecommendedPerfumes] = useState([]);
    const response = useSelector(selectResponse);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const [messages, setMessages] = useState([
        { sender: 'bot', text: '안녕하세요. 센티크입니다. 당신에게 어울리는 향을 찾아드리겠습니다.' }
    ]);

    const [input, setInput] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const messageEndRef = useRef(null);
    const [searchInput, setSearchInput] = useState('');
    const [color, setColor] = useState('#D9D9D9');
    const [highlightedMessageIndexes, setHighlightedMessageIndexes] = useState([]);
    const [currentHighlightedIndex, setCurrentHighlightedIndex] = useState(null);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const filters = [
        { name: 'Spicy', color: '#FF5757' },
        { name: 'Fruity', color: '#FFBD43' },
        { name: 'Citrus', color: '#FFE043' },
        { name: 'Green', color: '#62D66A' },
        { name: 'Floral', color: '#FF80C1' },
        { name: 'Oriental', color: '#C061FF' },
        { name: 'Musk', color: '#F8E4FF' },
        { name: 'Powdery', color: '#FFFFFF' },
        { name: 'Tobacco Leather', color: '#000000' },
        { name: 'Fougere', color: '#7ED3BB' },
        { name: 'Gourmand', color: '#A1522C' },
        { name: 'Woody', color: '#86390F' },
        { name: 'Aldehyde', color: '#98D1FF' },
        { name: 'Aquatic', color: '#56D2FF' },
        { name: 'Amber', color: '#FFE8D3' },
    ];

    // 특정 계열에 대한 색상 반환
    const getColorForCategory = (lineOrFeeling) => {
        const categories = lineOrFeeling.split(/[-/]/).map(c => c.trim());
        const colors = categories
            .map(c => {
                const filter = filters.find(f => f.name.toLowerCase() === c.toLowerCase());
                return filter ? filter.color : null;
            })
            .filter(Boolean);

        if (colors.length === 1) return colors[0]; // 단일 계열
        if (colors.length > 1) return `linear-gradient(90deg, ${colors.join(', ')})`; // 다중 계열
        return '#D9D9D9'; // 기본 색상
    };

    // 향수 추천 데이터 처리
    useEffect(() => {
        if (chatMode === "recommendation") {
            if (response?.commonFeeling) {
                const newColor = getColorForCategory(response.commonFeeling);
                setColor(newColor);
            }

            if (response?.recommendedPerfumes) {
                // recommendedPerfumes가 배열인지 확인하고 변환
                const recommendations = Array.isArray(response.recommendedPerfumes)
                    ? response.recommendedPerfumes
                    : response.recommendedPerfumes.recommendations || [];
                setRecommendedPerfumes(recommendations);
            }
        } else if (chatMode === "chat") {
            setColor('#D9D9D9'); // 일반 대화 기본 색상
        }
    }, [chatMode, recommendedPerfumes, response]);

    const isDarkColor = (color) => {
        const hex = color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    };

    const handleSendMessage = () => {
        if (!input.trim() && selectedImages.length === 0) return;

        const newMessage = {
            sender: 'user',
            text: input.trim() || '',
            images: selectedImages.map(img => img.url)
        };

        setMessages([...messages, newMessage]);
        setInput('');
        setSelectedImages([]);
        setIsLoading(true); // 로딩 시작

        const imageFile = selectedImages.length > 0 ? selectedImages[0].file : null;

        dispatch(fetchChatResponse(input, imageFile))
            .then((response) => {
                console.log("API 응답 데이터:", response);
                if (response.mode === "recommendation") {
                    // 추천 메시지 처리
                    const botMessage = {
                        sender: 'bot',
                        recommendations: response.payload.recommendedPerfumes,
                    };
                    setMessages((prevMessages) => [...prevMessages, botMessage]);
                } else if (response.mode === "chat") {
                    // 일반 메시지 처리
                    const botMessage = {
                        sender: 'bot',
                        text: response.response,
                    };
                    setMessages((prevMessages) => [...prevMessages, botMessage]);
                }
            })
            .catch((error) => {
                console.error("Error handling chat response:", error);
            })
            .finally(() => {
                setIsLoading(false); // 로딩 종료
            });
    };

    const handlePaste = (event) => {
        const items = event.clipboardData.items;
        const images = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image")) {
                const file = items[i].getAsFile();
                const url = URL.createObjectURL(file);
                images.push({ url, file });
            }
        }

        if (images.length > 0) {
            setSelectedImages(prevImages => [...prevImages, ...images]);
        }
    };

    useEffect(() => {
        window.addEventListener("paste", handlePaste);
        return () => {
            window.removeEventListener("paste", handlePaste);
        };
    }, []);

    const handleInputChange = (e) => setInput(e.target.value);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
            handleSearch();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0]; // 첫 번째 파일만 가져옴
        if (file) {
            const newImage = {
                url: URL.createObjectURL(file),
                file: file
            };
            setSelectedImages([newImage]); // 새 이미지를 기존 이미지 대신 대체
        }
        e.target.value = ''; // 파일 입력 초기화
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const openModal = (imageSrc) => {
        setModalImage(imageSrc);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImage(null);
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);

        if (e.target.value === '') {
            clearSearch();
        }
    };

    const highlightSearch = (text, query) => {
        if (typeof text !== 'string') return '';

        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    const handleSearch = () => {
        if (!searchInput.trim()) return;

        const regex = new RegExp(searchInput, 'i');
        const indexes = messages
            .map((msg, idx) => (msg.text && regex.test(msg.text) ? idx : null))
            .filter(idx => idx !== null);

        if (indexes.length > 0) {
            setHighlightedMessageIndexes(indexes);
            const latestIndex = indexes.length - 1;
            setCurrentHighlightedIndex(latestIndex);
            scrollToMessage(indexes[latestIndex]);
        } else {
            setHighlightedMessageIndexes([]);
            setCurrentHighlightedIndex(null);
        }
    };

    const clearSearch = () => {
        setSearchInput('');
        setHighlightedMessageIndexes([]);
        setCurrentHighlightedIndex(null);
        setIsSearchMode(false);
        setTimeout(() => {
            if (messageEndRef.current) {
                messageEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    const scrollToMessage = (index) => {
        const messageElement = document.getElementById(`message-${index}`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const goToPreviousHighlight = () => {
        if (highlightedMessageIndexes.length > 0 && currentHighlightedIndex > 0) {
            const prevIndex = currentHighlightedIndex - 1;
            setCurrentHighlightedIndex(prevIndex);
            scrollToMessage(highlightedMessageIndexes[prevIndex]);
        }
    };

    const goToNextHighlight = () => {
        if (highlightedMessageIndexes.length > 0 && currentHighlightedIndex < highlightedMessageIndexes.length - 1) {
            const nextIndex = currentHighlightedIndex + 1;
            setCurrentHighlightedIndex(nextIndex);
            scrollToMessage(highlightedMessageIndexes[nextIndex]);
        }
    };

    useEffect(() => {
        const handleArrowKeyPress = (e) => {
            if (e.key === 'ArrowUp') {
                goToPreviousHighlight();
            } else if (e.key === 'ArrowDown') {
                goToNextHighlight();
            }
        };

        document.addEventListener('keydown', handleArrowKeyPress);
        return () => {
            document.removeEventListener('keydown', handleArrowKeyPress);
        };
    }, [currentHighlightedIndex, highlightedMessageIndexes]);

    useEffect(() => {
        console.log("Chat Mode has changed:", chatMode);
    }, [chatMode]);

    const toggleSearchMode = () => {
        setIsSearchMode((prevMode) => !prevMode);
    };

    const handleGoBack = () => {
        navigate(-1); // 이전 페이지로 이동
    };

    const RecommendationCard = ({ perfume }) => (
        <div className="chat-recommendation-card">
            <img src={perfume.imageUrl || '/images/default-perfume.png'} alt={perfume.name} className="chat-recommendation-image" />
            <div className="chat-recommendation-content">
                <p className="chat-recommendation-name"><strong>이름:</strong> {perfume.name}</p>
                <p className="chat-recommendation-line"><strong>계열:</strong> {perfume.line}</p>
                <p className="chat-recommendation-brand"><strong>브랜드:</strong> {perfume.brand}</p>
                <p className="chat-recommendation-reason"><strong>추천 이유:</strong> {perfume.reason}</p>
                <p className="chat-recommendation-situation"><strong>추천 상황:</strong> {perfume.situation}</p>
            </div>
        </div>
    );

    return (
        <div className="chat-container-wrapper">
            <div className="chat-container">
                <div className="chat-header">
                    {/* 뒤로가기 버튼 */}
                    <button className="chat-back-button" onClick={handleGoBack}>
                        <img src="/images/back.png" alt="back" className="chat-back-image" />
                    </button>

                    <NavLink to="/">
                        <img src="/images/logo.png" alt="방향" className="chat-title-image" />
                    </NavLink>
                    <p className="chat-subtitle">
                        일상의 순간을 향으로 기록해보세요. <br />
                        원하는 향의 느낌을 이미지 또는 텍스트로 작성하면, 센티크가 향을 추천해 줄거예요 :)
                    </p>
                </div>

                <div className={`chat-search-bar ${searchInput ? 'search-active' : 'search-inactive'}`}>
                    <input
                        type="text"
                        placeholder="검색할 단어를 입력해주세요"
                        className="chat-search-input"
                        value={searchInput}
                        onChange={handleSearchChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="chat-search-button" onClick={handleSearch}>
                        <img src="/images/search.png" alt="Search" />
                    </button>
                    {searchInput && (
                        <>
                            <button className="chat-arrow-button" onClick={goToPreviousHighlight} disabled={currentHighlightedIndex === 0}>▲</button>
                            <button className="chat-arrow-button" onClick={goToNextHighlight} disabled={currentHighlightedIndex === highlightedMessageIndexes.length - 1}>▼</button>
                            <button className="chat-clear-search-button" onClick={clearSearch}>X</button>
                            <button className="chat-open-search-mode" onClick={toggleSearchMode}>통합검색</button>
                        </>
                    )}
                </div>

                <div className="chat-message-box" style={{ '--scroll-color': color }}>
                    <div className="chat-messages-container">
                        {/* 검색 모드일 경우 */}
                        {isSearchMode && highlightedMessageIndexes.length > 0 ? (
                            highlightedMessageIndexes.map((index) => (
                                <div key={index} className="chat-search-result">
                                    <p
                                        className="chat-search-result-text"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightSearch(messages[index].text, searchInput),
                                        }}
                                    ></p>
                                </div>
                            ))
                        ) : (
                            // 추천 모드 또는 일반 채팅 모드 렌더링
                            <>
                                {chatMode === "recommendation" ? (
                                    // 추천 리스트를 표시
                                    recommendedPerfumes.map((perfume, index) => (
                                        <RecommendationCard key={index} perfume={perfume} />
                                    ))
                                ) : (
                                    // 일반 메시지 렌더링
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            id={`message-${index}`}
                                            className={`chat-message ${msg.sender === 'bot' ? 'chat-bot-message' : 'chat-user-message'
                                                } ${highlightedMessageIndexes.includes(index) &&
                                                    index === currentHighlightedIndex
                                                    ? 'highlighted'
                                                    : ''
                                                }`}
                                        >
                                            {msg.sender === 'bot' ? (
                                                Array.isArray(msg.recommendations) && msg.recommendations.length > 0 ? (
                                                    // 추천 리스트가 있을 경우 카드 형식으로 렌더링
                                                    <div className="chat-recommendations-container">
                                                        <img src="/images/logo-bot.png" alt="Bot Avatar" className="chat-avatar" />
                                                        <div className="chat-recommendations-wrapper">
                                                            {msg.recommendations.map((item, idx) => (
                                                                <RecommendationCard key={idx} perfume={item} />
                                                            ))}
                                                        </div>
                                                        <div className={`chat-color-bar ${color === '#FFFFFF' ? 'highlighted-border' : ''}`} style={{ backgroundColor: color }}></div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img src="/images/logo-bot.png" alt="Bot Avatar" className="chat-avatar" />
                                                        <div className="chat-message-text-wrapper">
                                                            <p
                                                                className="chat-message-text"
                                                                dangerouslySetInnerHTML={{ __html: highlightSearch(msg.text, searchInput) }}
                                                            ></p>
                                                            <div className={`chat-color-bar ${color === '#FFFFFF' ? 'highlighted-border' : ''}`} style={{ backgroundColor: color }}></div>
                                                        </div>
                                                    </>
                                                )
                                            ) : (
                                                // 사용자 메시지 렌더링
                                                <div className="chat-message-text-wrapper chat-user-message-wrapper">
                                                    {msg.text && (
                                                        <p
                                                            className="chat-message-text"
                                                            dangerouslySetInnerHTML={{ __html: highlightSearch(msg.text, searchInput) }}
                                                        ></p>
                                                    )}
                                                    {msg.images && msg.images.map((image, idx) => (
                                                        <img key={idx} src={image} alt="Uploaded" className="chat-uploaded-image" onClick={() => openModal(image)} />
                                                    ))}
                                                    <div className={`chat-color-circle ${color === '#FFFFFF' ? 'highlighted-border' : ''}`} style={{ backgroundColor: color }}></div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                        {/* 로딩 중일 때 로딩 메시지 표시 */}
                        {loading && (
                            <div className="chat-message chat-bot-message">
                                <img src="/images/logo-bot.png" alt="Bot Avatar" className="chat-avatar" />
                                <div className="chat-message-text-wrapper">
                                    <div className="chat-loading-enhanced-loader">
                                        <div className="chat-loading-floating-smoke chat-loading-smoke-1"></div>
                                        <div className="chat-loading-floating-smoke chat-loading-smoke-2"></div>
                                        <div className="chat-loading-floating-smoke chat-loading-smoke-3"></div>
                                        <div className="chat-loading-floating-smoke chat-loading-smoke-4"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messageEndRef}></div>
                    </div>
                </div>

                <div className="chat-input-area-wrapper">
                    {selectedImages.length > 0 && (
                        <div className="chat-image-preview-container">
                            {selectedImages.map((image, index) => (
                                <div key={index} className="chat-image-preview-card">
                                    <img src={image.url} alt="Selected" className="chat-image-preview" onClick={() => openModal(image.url)} />
                                    <button className="chat-remove-image-button" onClick={() => handleRemoveImage(index)}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`chat-input-area ${isDarkColor(color) ? 'chat-dark-theme' : 'chat-light-theme'} ${color === '#FFFFFF' ? 'highlighted-border' : ''}`} style={{ backgroundColor: color }}>
                        <label htmlFor="file-upload" className="chat-file-upload">
                            <img src="/images/image.png" alt="Upload" className="upload-icon" />
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <input
                            id='text'
                            type="text"
                            placeholder="메시지를 입력하세요"
                            className={`chat-input ${isDarkColor(color) ? 'chat-dark-theme' : 'chat-light-theme'}`}
                            style={{ backgroundColor: color }}
                            value={input}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="chat-send-button" onClick={handleSendMessage}>➤</button>
                    </div>
                </div>

            </div>
            {isModalOpen && (
                <div className="chat-modal-overlay" onClick={closeModal}>
                    <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={modalImage} alt="원본 이미지" className="chat-modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chat;
