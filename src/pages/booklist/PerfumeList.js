import '../../css/PerfumeList.css';
import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { fetchPerfumes, selectPerfumes, modifyPerfume, deletePerfume, createPerfume } from '../../module/PerfumeModule';
import LoadingScreen from '../../components/loading/LoadingScreen';

const PerfumeList = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const perfumes = useSelector(selectPerfumes) || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState('');
    const [showCheckboxes, setShowCheckboxes] = useState(false); // 체크박스 표시 여부
    const [role, setRole] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null); // 선택된 단일 카드
    console.log("현재 선택된 카드 ID:", selectedCard);

    const [showAddModal, setShowAddModal] = useState(false); // 추가 모달 표시
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedPerfume, setSelectedPerfume] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [successMessage, setSuccessMessage] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [paginationGroup, setPaginationGroup] = useState(0); // 페이지네이션 그룹 관리
    const [currentPage, setCurrentPage] = useState(1);
    const [editingImage, setEditingImage] = useState(false); 

    const filteredPerfumes = perfumes.filter((perfume) => {
        // 안전하게 perfume.name을 처리
        const name = perfume?.name || '';
        const brand = perfume?.brand || '';
        const description = perfume?.description || '';

        // 검색 조건 (searchTerm)
        const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());

        // 필터 조건 (activeFilters)
        const matchesFilter =
        activeFilters.length === 0 || // 필터가 없으면 true
        activeFilters.some((filter) => name.includes(filter) || brand.includes(filter) || description.includes(filter)); // 이름 또는 브랜드와 일치

        return matchesSearch && matchesFilter;
    });

    const itemsPerPage = 12;

    const totalPages = filteredPerfumes.length
        ? Math.ceil(filteredPerfumes.length / itemsPerPage)
        : 1;

    const pageStart = paginationGroup * 10 + 1;
    const pageEnd = Math.min((paginationGroup + 1) * 10, totalPages);

    useEffect(() => {
        // 향수 목록 가져오기
        dispatch(fetchPerfumes());
    }, [dispatch]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('auth'));
        if (storedUser && storedUser.role) {
            setRole(storedUser.role); // 사용자 역할 저장
        }
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleEditButtonClick = (perfume) => {

        setSelectedPerfume(perfume);
        setShowEditModal(true);
        setIsEditing(true); // 수정 모드 활성화
        setIsAdding(false); // 추가 모드 비활성화
    };

    const handleSuccessClose = () => {
        setSuccessMessage(''); // 메시지 초기화
        dispatch(fetchPerfumes()); // 최신 데이터 가져오기
    };

    const handleFilterClick = (filterId) => {
        setActiveFilters(prev => {
            if (prev.includes(filterId)) {
                return prev.filter(id => id !== filterId);
            } else {
                return [...prev, filterId];
            }
        });
        setCurrentPage(1);
    };

    const handleReset = () => {
        setImagePreview(null); // 파일 선택 영역 초기화
    };

    const filterButtons = [
        { id: '오 드 퍼퓸', label: 'Eau de Perfume' },
        { id: '오 드 뚜왈렛', label: 'Eau de Toilette' },
        { id: '오 드 코롱', label: 'Eau de Cologne' },
        { id: '퍼퓸', label: 'Perfume' },
        { id: '솔리드 퍼퓸', label: 'Solid Perfume'}

    ];

    const handleCheckboxToggle = () => setShowCheckboxes(!showCheckboxes);

    const handleCardCheckboxChange = (id) => {
        if (selectedCard === id) {
            setSelectedCard(null); // 같은 항목 클릭 시 선택 해제
        } else {
            setSelectedCard(id); // 새로운 항목 선택
        }
        console.log("현재 선택된 카드 ID:", id); // 디버깅 메시지
    };

    const handleAddButtonClick = () => {
        setSelectedPerfume({
            name: null,
            description: null,
            brand: null,
            grade: "오 드 퍼퓸",
            singleNote: null,
            topNote: null,
            middleNote: null,
            baseNote: null,
            imageUrl: null,
        }); 
    
        setShowAddModal(true); // 모달 열기
        setIsAdding(true); // 추가 모드 활성화
        setIsEditing(false);   // 수정 모드 비활성화
    };

    const handleDeleteButtonClick = () => {
        if (!selectedCard) {
            alert("삭제할 카드를 선택하세요.");
            return;
        }

        const perfumeToDelete = perfumes.find((perfume) => perfume.id === selectedCard);
        setSelectedPerfume(perfumeToDelete); // 삭제할 카드 설정
        setIsDeleting(true); // 삭제 모달 활성화
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPerfume) {
            console.error("선택된 향수 카드가 없습니다.");
            alert("삭제할 카드를 선택하세요.");
            return;
        }
        console.log("삭제 요청 ID:", selectedCard);

        try {
            // Redux를 통해 삭제 API 호출
            await dispatch(deletePerfume(selectedCard));
            setSuccessMessage(`${selectedPerfume.name} 향수 카드가 삭제되었습니다!`);
    
            // 삭제 모달 닫기
            setIsDeleting(false);
            setSelectedPerfume(null);
        } catch (error) {
            console.error("향수 삭제 실패:", error);
            alert("향수 삭제에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleDeleteClose = () => {
        setIsDeleting(false); // 삭제 모달 닫기
        setSelectedPerfume(null); 
        setSelectedCard(null); // 선택 초기화
    };

    const handleSubmit = async () => {
        // console.log("추가할 향수 데이터:", selectedPerfume);
        if (!selectedPerfume.grade) {
            alert("부향률을 선택하세요."); // 부향률 값 확인
            return;
        }

        if (isAdding && selectedPerfume) {
            
            // 싱글 노트 또는 탑/미들/베이스 노트 중 하나만 포함
            const newPerfumeData = {
                name: selectedPerfume?.name || "",
                description: selectedPerfume?.description || "",
                brand: selectedPerfume?.brand || "",
                grade: selectedPerfume?.grade || "오 드 퍼퓸", 
                singleNote: selectedPerfume?.singleNote || null, 
                topNote: selectedPerfume?.topNote || "" || null,
                middleNote: selectedPerfume?.middleNote || "" || null, 
                baseNote: selectedPerfume?.baseNote || "" || null, 
                imageUrl: selectedPerfume?.imageUrl || "", // 이미지 URL
            };
            // console.log("grade 값:", selectedPerfume?.grade);
    
            // 유효성 검사: 싱글 노트 또는 탑/미들/베이스 노트 중 하나는 반드시 있어야 함
            if (
                (!newPerfumeData.singleNote && !newPerfumeData.topNote && !newPerfumeData.middleNote && !newPerfumeData.baseNote) ||
                (newPerfumeData.singleNote && (newPerfumeData.topNote || newPerfumeData.middleNote || newPerfumeData.baseNote))
            ) {
                alert("잘못 입력했습니다.");
                return;
            }
    
            try {
                await dispatch(createPerfume(newPerfumeData)); // Redux 액션 호출
                setSuccessMessage('향수가 성공적으로 추가되었습니다!');
                setShowAddModal(false); // 추가 모달 닫기
                setIsAdding(false);     // 추가 모드 비활성화
                handleReset();          // 입력 값 초기화
            } catch (error) {
                console.error("향수 추가 실패:", error);
                alert("향수 추가에 실패했습니다. 다시 시도해주세요.");
            }
        }
    
        // 수정 모드 처리
        if (isEditing && selectedPerfume) {
            // console.log("수정하려는 향수 ID:", selectedPerfume.id);
            try {
                await dispatch(modifyPerfume(selectedPerfume));
                setSuccessMessage('향수가 성공적으로 수정되었습니다!');
                setShowEditModal(false); // 수정 모달 닫기
            } catch (error) {
                console.error("향수 수정 실패:", error);
                alert("향수 수정에 실패했습니다. 다시 시도해주세요.");
            }
        }
    
        // 공통 처리
        setIsEditing(false);
        setIsAdding(false);
        setSelectedPerfume(null);
    };

    const closeModal = () => {
        setShowAddModal(false); // 추가 모달 닫기
        setShowEditModal(false); // 수정 모달 닫기
        setIsAdding(false);      // 추가 모드 비활성화
        setIsEditing(false);     // 수정 모드 비활성화
        setSelectedPerfume(null); // 선택된 데이터 초기화
        setImagePreview(null);   // 이미지 미리보기 초기화
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    
        // 페이지 그룹 변경 로직
        const groupStart = paginationGroup * 10 + 1;
        const groupEnd = groupStart + 9;
        if (page < groupStart) {
            setPaginationGroup(paginationGroup - 1);
        } else if (page > groupEnd) {
            setPaginationGroup(paginationGroup + 1);
        }
    };

    const handleNextGroup = () => {
        if ((paginationGroup + 1) * 10 < totalPages) {
            setPaginationGroup(paginationGroup + 1);
        }
    };
    
    const handlePreviousGroup = () => {
        if (paginationGroup > 0) {
            setPaginationGroup(paginationGroup - 1);
        }
    };

    // 데이터가 비어 있는 경우 처리
    if (!perfumes || perfumes.length === 0) {
        return <LoadingScreen message="항수를 불러오는 중..." />;
    }

    return (
        <>
            <img src="/images/logo.png" alt="로고 이미지" className="main-logo-image"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />
            <div className="perfume-list-container">
                <div className="perfume-header">
                    <div className="perfume-title">향수</div>
                    <form className="perfume-list-search-container">
                        <input
                            type="text"
                            className="perfume-list-search"
                            placeholder="브랜드명, 향수 이름 검색"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search
                            className="perfume-list-search-icon"
                            size={20}
                            color="#333"
                        />
                    </form>
                </div>

                <div className="perfume-list-divider-line" />

                <div className="perfume-list-filters">
                    {filterButtons.map(button => (
                        <button
                            key={button.id}
                            className={`perfume-list-filter-btn ${activeFilters.includes(button.id) ? 'active' : ''}`}
                            onClick={() => handleFilterClick(button.id)}
                        >
                            {button.label}
                        </button>
                    ))}
                    {role === 'ADMIN' && (
                        <div className="admin-perfume-controls">
                            <button className="admin-perfume-add-button" onClick={handleAddButtonClick}>+</button>
                            <button className="admin-perfume-checkbox-button" onClick={handleCheckboxToggle}>✓</button>
                            <button onClick={handleDeleteButtonClick} className="admin-perfume-delete-button">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}

                </div>

                <div className="perfume-items-container">
                    {filteredPerfumes
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((perfume) => (
                            <div key={perfume.id} className="perfume-item-card">
                                {showCheckboxes && (
                                    <input
                                        type="checkbox"
                                        className="admin-perfume-card-select-circle"
                                        name={`perfume-select-${perfume.id}`}
                                        checked={selectedCard === perfume.id}
                                        onChange={() => handleCardCheckboxChange(perfume.id)}
                                        
                                    />
                                )}

                                {/* Edit 아이콘 버튼 */}
                                {role === 'ADMIN' && (
                                    <>
                                        <button
                                            className="admin-perfume-edit-button"
                                            onClick={() => handleEditButtonClick(perfume)} // 수정 버튼 클릭 시 실행
                                        >
                                            <Edit size={16} color="#333" /> {/* Edit 아이콘 사용 */}
                                        </button>
                                    </>
                                )}

                                <img
                                    src={perfume.imageUrl}
                                    alt={perfume.name}
                                    className="perfume-item-image"
                                />
                                <div className="perfume-item-name"><strong>{perfume.name}</strong></div>
                                <div className="perfume-divider-small"></div>
                                <div className="perfume-category">{perfume.brand}</div>
                                <div className="perfume-grade">{perfume.grade}</div>
                                <div className="perfume-description">
                                <p>"{perfume.description}"</p>
                                <br/>
                                <div className='perfume-description-singleNote'>
                                    {perfume.singleNote && <p><strong>싱글 노트 | </strong> {perfume.singleNote}</p>}
                                </div>
                                <div className='perfume-description-multiNote'>
                                    {perfume.topNote && <p><strong>탑 노트 | </strong> {perfume.topNote}</p>}
                                    {perfume.middleNote && <p><strong>미들 노트 | </strong> {perfume.middleNote}</p>}
                                    {perfume.baseNote && <p><strong>베이스 노트 | </strong> {perfume.baseNote}</p>}
                                </div>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="perfume-pagination">
                    <button
                        className={`perfume-pagination-button ${paginationGroup === 1 ? 'disabled' : ''}`}
                        onClick={handlePreviousGroup}
                        disabled={paginationGroup === 0}
                    >
                        {'<<'}
                    </button>

                    <button
                        className={`perfume-pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        {'<'}
                    </button>

                    {Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => (
                        <button
                            key={index + pageStart}
                            className={`perfume-pagination-button ${currentPage === index + pageStart ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + pageStart)}
                        >
                            {index + pageStart}
                        </button>
                    ))}

                    <button
                        className={`perfume-pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        {'>'}
                    </button>

                    <button
                        className={`perfume-pagination-button ${pageEnd === totalPages ? 'disabled' : ''}`}
                        onClick={handleNextGroup}
                        disabled={pageEnd === totalPages}
                    >
                        {'>>'}
                    </button>
                </div>

                {showAddModal && (
                    <div className="admin-perfume-modal-backdrop">
                        <div className="admin-perfume-modal-container">
                            <h2 className="admin-perfume-modal-title">향수 카드 추가하기</h2>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">향수명</label>
                                    <input
                                        className="admin-perfume-modal-row-name"
                                        type="text"
                                        value={selectedPerfume?.name || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="향수 이름을 입력하세요"
                                        required
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">브랜드명</label>
                                    <input
                                        className="admin-perfume-modal-row-brand"
                                        type="text"
                                        value={selectedPerfume?.brand || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, brand: e.target.value }))
                                        }
                                        placeholder="브랜드명을 입력하세요"
                                        required
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">부향률</label>
                                    <select
                                        className="admin-perfume-modal-row-concentration"
                                        value={selectedPerfume?.grade || ""} // 상태에서 grade 값을 가져옴
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({
                                                ...prev,
                                                grade: e.target.value, // 선택한 값을 상태에 업데이트
                                            }))
                                        }
                                        required
                                    >
                                        <option value="오 드 퍼퓸">Eau de perfume</option>
                                        <option value="오 드 뚜왈렛">Eau de Toilette</option>
                                        <option value="오 드 코롱">Eau de Cologne</option>
                                        <option value="퍼퓸">Perfume</option>
                                        <option value="솔리드 퍼퓸">Solid Perfume</option>
                                    </select>
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">향수 설명</label>
                                    <textarea
                                        className="admin-perfume-modal-row-description"
                                        value={selectedPerfume?.description || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        placeholder="향수 설명을 입력하세요"
                                        required
                                    ></textarea>
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">싱글노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-singleNote"
                                        value={selectedPerfume?.singleNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, singleNote: e.target.value }))
                                        }
                                        placeholder="싱글노트를 입력하세요"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">탑노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-topNote"
                                        value={selectedPerfume?.topNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, topNote: e.target.value }))
                                        }
                                        placeholder="탑노트를 입력하세요"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">미들노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-middleNote"
                                        value={selectedPerfume?.middleNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, middleNote: e.target.value }))
                                        }
                                        placeholder="미들노트를 입력하세요"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">베이스노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-baseNote"
                                        value={selectedPerfume?.baseNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, baseNote: e.target.value }))
                                        }
                                        placeholder="베이스노트를 입력하세요"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row2">
                                    <label className="admin-perfume-modal-row-image-label">이미지</label>
                                    <div
                                        className="admin-perfume-image-upload"
                                        onClick={() => {
                                            if (!editingImage) setEditingImage(true);
                                        }}
                                    >
                                        {editingImage ? (
                                            <input
                                            type="text"
                                            className="admin-perfume-image-url-input"
                                            placeholder="이미지 URL을 입력하세요"
                                            value={selectedPerfume?.imageUrl || ""}
                                            onChange={(e) => {
                                                const newUrl = e.target.value;
                                                setSelectedPerfume((prev) => ({
                                                    ...prev,
                                                    imageUrl: newUrl, // URL 입력값으로 imageUrl 수정
                                                }));
                                            }}
                                            onBlur={() => setEditingImage(false)} // 입력 필드 외 클릭 시 수정 모드 해제
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") setEditingImage(false); // Enter 키로 수정 모드 해제
                                            }}
                                        />
                                    ) : (
                                        <>
                                            {imagePreview || selectedPerfume?.imageUrl ? (
                                                <img
                                                    src={imagePreview || selectedPerfume?.imageUrl}
                                                    alt="미리보기"
                                                    className="admin-perfume-image-preview"
                                                />
                                            ) : (
                                                <div className="admin-perfume-placeholder">+</div>
                                            )}
                                        </>
                                    )}
                                    <input
                                        id="admin-perfume-file-input"
                                        type="file"
                                        className="admin-perfume-file-input"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImagePreview(reader.result); // 미리보기 이미지 설정
                                                    setSelectedPerfume((prev) => ({
                                                        ...prev,
                                                        imageUrl: reader.result, // 이미지 URL 업데이트
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                                <div className="admin-perfume-modal-actions">
                                <button
                                    onClick={() => {
                                        handleSubmit(); handleReset();
                                    }}
                                    className="admin-perfume-save-button"
                                >
                                    저장
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="admin-perfume-cancel-button"
                                >
                                    취소
                                </button>
                            </div>
                            </div>
                        </div>
                )}


                {showEditModal && selectedPerfume && (
                    <div className="admin-perfume-modal-backdrop">
                        <div className="admin-perfume-modal-container">
                            <h2 className="admin-perfume-modal-title">향수 카드 수정하기</h2>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">향수명</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-name"
                                        value={selectedPerfume?.name || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="향수 이름 수정"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">브랜드명</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-brand"
                                        value={selectedPerfume?.brand || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, brand: e.target.value }))
                                        }
                                        placeholder="브랜드명 수정"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">부향률</label>
                                    <select
                                        className="admin-perfume-modal-row-concentration"
                                        value={selectedPerfume?.grade || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({
                                                ...prev,
                                                grade: e.target.value,
                                            }))
                                        }
                                        required
                                    >
                                        <option value="오 드 퍼퓸">Eau de perfume</option>
                                        <option value="오 드 뚜왈렛">Eau de Toilette</option>
                                        <option value="오 드 코롱">Eau de Cologne</option>
                                        <option value="퍼퓸">perfume</option>
                                        <option value="솔리드 퍼퓸">solid Perfume</option>
                                    </select>
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">향수 설명</label>
                                    <textarea
                                        className="admin-perfume-modal-row-description"
                                        value={selectedPerfume?.description || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        placeholder="향수 설명 수정"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">싱글노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-singleNote"
                                        value={selectedPerfume?.singleNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, singleNote: e.target.value }))
                                        }
                                        placeholder="싱글노트 수정"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">탑노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-topNote"
                                        value={selectedPerfume?.topNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, topNote: e.target.value }))
                                        }
                                        placeholder="탑노트 수정"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">미들노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-middleNote"
                                        value={selectedPerfume?.middleNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, middleNote: e.target.value }))
                                        }
                                        placeholder="미들노트 수정"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row">
                                    <label className="perfume-form-label">베이스노트</label>
                                    <input
                                        type="text"
                                        className="admin-perfume-modal-row-baseNote"
                                        value={selectedPerfume?.baseNote || ""}
                                        onChange={(e) =>
                                            setSelectedPerfume((prev) => ({ ...prev, baseNote: e.target.value }))
                                        }
                                        placeholder="베이스노트 수정"
                                    />
                                </div>
                                <div className="admin-perfume-modal-row2">
                                    <label className="admin-perfume-modal-row-image-label">이미지</label>
                                    <div
                                        className="admin-perfume-image-upload"
                                        onClick={() => {
                                            if (!editingImage) setEditingImage(true);
                                        }}
                                    >
                                        {editingImage ? (
                                        <input
                                        type="text"
                                        className="admin-perfume-image-url-input"
                                        placeholder="이미지 URL을 입력하세요"
                                        value={selectedPerfume?.imageUrl || ""}
                                        onChange={(e) => {
                                            const newUrl = e.target.value;
                                            setSelectedPerfume((prev) => ({
                                                ...prev,
                                                imageUrl: newUrl, // URL 입력값으로 imageUrl 수정
                                            }));
                                        }}
                                        onBlur={() => setEditingImage(false)} // 입력 필드 외 클릭 시 수정 모드 해제
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") setEditingImage(false); // Enter 키로 수정 모드 해제
                                        }}
                                    />
                                ) : (
                                    // 이미지 미리보기 또는 기본 플러스 버튼
                                    <>
                                        {imagePreview || selectedPerfume?.imageUrl ? (
                                            <img
                                                src={imagePreview || selectedPerfume?.imageUrl}
                                                alt="미리보기"
                                                className="admin-perfume-image-preview"
                                            />
                                        ) : (
                                            <div className="admin-perfume-placeholder">+</div>
                                        )}
                                    </>
                                )}
                                {/* 파일 업로드 input */}
                                <input
                                    id="admin-perfume-file-input-edit"
                                    type="file"
                                    className="admin-perfume-file-input"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImagePreview(reader.result); // 미리보기 이미지 설정
                                                setSelectedPerfume((prev) => ({
                                                    ...prev,
                                                    imageUrl: reader.result, // 이미지 URL 업데이트
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                                <div className="admin-perfume-modal-actions">
                                <button
                                    onClick={() => {
                                        handleSubmit(); handleReset();
                                    }}
                                    className="admin-perfume-save-button"
                                >
                                    저장
                                </button>
                                <button onClick={closeModal} className="admin-perfume-cancel-button">
                                    취소
                                </button>
                            </div>
                            </div>
                        </div>
                )}

                {/* 삭제 모달 */}
                {isDeleting && (
                    <div className="admin-spices-modal-backdrop">
                        <div className="admin-spices-modal-container-delete">
                            <h2 className="admin-spices-modal-title-delete">- 향수카드 삭제 -</h2>
                            <p>향수카드를 삭제하시겠습니까?</p>
                            <div className="admin-spices-modal-actions-delete">
                                <button onClick={handleDeleteConfirm} className="admin-spices-confirm-button">확인</button>
                                <button onClick={handleDeleteClose} className="admin-spices-cancel-button-delete">취소</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 성공 메시지 모달 */}
                {successMessage && (
                    <div className="admin-perfume-modal-backdrop">
                        <div className="admin-perfume-modal-container-success">
                            <p className="admin-perfume-success-message-success">{successMessage}</p>
                            <div className="admin-perfume-modal-actions-success">
                                <button onClick={handleSuccessClose} className="admin-perfume-cancel-button-success">
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default PerfumeList;