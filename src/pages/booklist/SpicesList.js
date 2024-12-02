import React, { useState, useEffect } from 'react';
import '../../css/SpicesList.css';
import { Search, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSpices,
    selectSpices,
    selectLoading,
    createSpiceAction,
    modifySpiceAction,
    deleteSpiceAction
} from '../../module/SpicesModule';
import LoadingScreen from '../../components/loading/LoadingScreen';

function SpicesList() {
    const dispatch = useDispatch();
    const spices = useSelector(selectSpices);
    const loading = useSelector(selectLoading);
    const navigate = useNavigate();

    const [activeFilters, setActiveFilters] = useState(new Set(['ALL']));
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredItemId, setHoveredItemId] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [role, setRole] = useState(null);
    const itemsPerPage = 12;
    const pageLimit = 10;

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('auth'));
        if (storedUser && storedUser.role) {
            setRole(storedUser.role);
        }
    }, []);

    useEffect(() => {
        dispatch(fetchSpices());
    }, [dispatch]);

    if (loading) {
        return <LoadingScreen message="항료를 불러오는 중..." />;
    }

    const filters = [
        { name: 'ALL', color: '#FFFFFF' },
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

    const getFilterColor = (lineName) => {
        const filter = filters.find((filter) => filter.name === lineName);
        return filter ? filter.color : '#EFEDED'; // 기본 색상은 회색
    };

    const toggleSelectMode = () => {
        setIsSelecting((prev) => {
            if (prev) {
                // 선택 모드를 종료할 때 선택 항목 초기화
                setSelectedItems(new Set());
            }
            return !prev; // 선택 모드 토글
        });
    };

    const handleCheckboxChange = (itemId) => {
        setSelectedItems((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(itemId)) {
                newSelected.delete(itemId); // 선택 해제
            } else {
                newSelected.add(itemId); // 선택
            }
            return newSelected;
        });
    };

    const handleAddClick = () => setIsAdding(true);
    const handleAddClose = () => setIsAdding(false);

    const handleSubmit = () => {
        if (isAdding) {
            // 새 항료 추가 로직
            const newSpiceData = {
                name: editingItem.name,
                nameKr: editingItem.nameKr,
                description: editingItem.description,
                lineName: editingItem.line,
                imageUrl: imagePreview
            };

            dispatch(createSpiceAction(newSpiceData))
                .then(() => {
                    setSuccessMessage('항료가 성공적으로 등록되었습니다!');
                    setIsAdding(false);
                    setImagePreview(null);
                })
                .catch((error) => {
                    setSuccessMessage('항료 등록에 실패했습니다.');
                });
        }

        if (isEditing) {
            // 항료 수정 로직
            const modifiedSpiceData = {
                id: editingItem.id,
                imageUrl: imagePreview || editingItem.imageUrl
            };

            dispatch(modifySpiceAction(modifiedSpiceData))
                .then(() => {
                    setSuccessMessage('항료가 성공적으로 수정되었습니다!');
                    setIsEditing(false);
                    setImagePreview(null);
                })
                .catch((error) => {
                    setSuccessMessage('항료 수정에 실패했습니다.');
                });
        }

        // 상태 초기화
        setEditingItem(null);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleting(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedItem) {
            dispatch(deleteSpiceAction(selectedItem.id))
                .then(() => {
                    setSuccessMessage(`${selectedItem.name} 항료 카드가 삭제되었습니다!`);
                    setIsDeleting(false);
                })
                .catch((error) => {
                    setSuccessMessage('항료 삭제에 실패했습니다.');
                });
        }
    };

    const handleDeleteClose = () => setIsDeleting(false);

    const handleEditClick = (item) => {
        setEditingItem(item);
        setIsEditing(true);
    };

    const handleEditClose = () => {
        setIsEditing(false);
        setEditingItem(null);
    };

    const handleSuccessClose = () => setSuccessMessage('');

    const filteredItems =
        activeFilters.has('ALL') || activeFilters.size === 0
            ? spices
            : spices.filter((item) => activeFilters.has(item.line));

    const searchedItems = filteredItems.filter((spice) =>
        spice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spice.nameKr.includes(searchTerm)
    );

    const totalPages = Math.ceil(searchedItems.length / itemsPerPage);
    const startPage = Math.max(1, Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1);
    const endPage = Math.min(totalPages, startPage + pageLimit - 1);
    const displayedItems = searchedItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleFilterClick = (filterName) => {
        const newFilters = new Set(activeFilters);

        if (filterName === 'ALL') {
            if (activeFilters.has('ALL')) {
                newFilters.clear();
            } else {
                newFilters.clear();
                newFilters.add('ALL');
            }
        } else {
            newFilters.delete('ALL');

            if (newFilters.has(filterName)) {
                newFilters.delete(filterName);
            } else {
                newFilters.add(filterName);
            }
        }

        setActiveFilters(newFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getTextColor = (backgroundColor) => {
        const brightness =
            parseInt(backgroundColor.slice(1, 3), 16) * 0.299 +
            parseInt(backgroundColor.slice(3, 5), 16) * 0.587 +
            parseInt(backgroundColor.slice(5, 7), 16) * 0.114;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    };

    const handleReset = () => {
        setImagePreview(null); // 파일 선택 영역 초기화
    };

    return (
        <>
            <img src="/images/logo.png" alt="1번 이미지" className="main-logo-image"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />
            <div className="spices-container">
                <div className="spices-header">
                    <div className="spices-title">향료</div>
                    <form className="spices-search-bar">
                        <input
                            type="text"
                            className="spices-search-input"
                            placeholder="향료명"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search
                            className="spices-list-search-icon"
                            size={20}
                            color="#333"
                        />
                    </form>
                </div>

                {/* 추가 모달 */}
                {isAdding && (
                    <div className="admin-spices-modal-backdrop">
                        <div className="admin-spices-modal-container">
                            <h2 className="admin-spices-modal-title">향료 카드 추가하기</h2>
                            <div className="admin-spices-modal-content">
                                <div className="admin-spices-modal-row">
                                    <label>향료명</label>
                                    <input className='admin-spices-modal-row-name' type="text" placeholder="ex) Blood Orange" />
                                </div>
                                <div className="admin-spices-modal-row">
                                    <label>한글명</label>
                                    <input className='admin-spices-modal-row-name-kor' type="text" placeholder="ex) 블러드 오렌지" />
                                </div>
                                <div className="admin-spices-modal-row">
                                    <label>계열</label>
                                    <input className='admin-spices-modal-row-spices' type="text" placeholder="ex) spicy" />
                                </div>
                                <div className="admin-spices-modal-row-description">
                                    <label>향료 설명</label>
                                    <textarea placeholder="ex) 달콤한 오렌지의..." />
                                </div>
                                <div className="admin-spices-modal-row">
                                    <label className='admin-spices-modal-row-image-label'>이미지</label>
                                    <div className="admin-spices-image-upload">
                                        {editingItem?.isEditingImage ? (
                                            <input
                                                type="text"
                                                className="admin-spices-url-input"
                                                placeholder="새로운 이미지 URL 입력"
                                                defaultValue={editingItem.imageUrl || ''}
                                                onBlur={(e) =>
                                                    setEditingItem((prev) => ({
                                                        ...prev,
                                                        imageUrl: e.target.value,
                                                        isEditingImage: false,
                                                    }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setEditingItem((prev) => ({
                                                            ...prev,
                                                            imageUrl: e.target.value,
                                                            isEditingImage: false,
                                                        }));
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div
                                                onClick={() =>
                                                    setEditingItem((prev) => ({ ...prev, isEditingImage: true }))
                                                }
                                            >
                                                {editingItem?.imageUrl || imagePreview ? (
                                                    <img
                                                        src={editingItem.imageUrl || imagePreview}
                                                        alt="미리보기"
                                                        className="admin-spices-image-preview"
                                                    />
                                                ) : (
                                                    <div className="admin-spices-placeholder">+</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="admin-spices-modal-actions">
                                <button onClick={() => { handleSubmit(); handleReset(); }} className="admin-spices-save-button">
                                    저장
                                </button>
                                <button onClick={() => { handleAddClose(); handleReset(); }} className="admin-spices-cancel-button">
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="admin-spices-modal-backdrop">
                        <div className="admin-spices-modal-container">
                            <h2 className="admin-spices-modal-title">향료 카드 수정하기</h2>
                            <div className="admin-spices-modal-content">
                                <div className="admin-spices-modal-row">
                                    <label>향료명</label>
                                    <input
                                        type="text"
                                        className='admin-spices-modal-row-name'
                                        value={editingItem?.name || ''}
                                        onChange={(e) =>
                                            setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="ex) Blood Orange"
                                    />
                                </div>
                                <div className="admin-spices-modal-row">
                                    <label>한글명</label>
                                    <input
                                        type="text"
                                        className='admin-spices-modal-row-name-kor'
                                        value={editingItem?.nameKor || ''}
                                        onChange={(e) =>
                                            setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="ex) 블러드 오렌지"
                                    />
                                </div>
                                <div className="admin-spices-modal-row">
                                    <label>계열</label>
                                    <input
                                        type="text"
                                        className='admin-spices-modal-row-spices'
                                        value={editingItem?.line || ''}
                                        onChange={(e) =>
                                            setEditingItem((prev) => ({ ...prev, line: e.target.value }))
                                        }
                                        placeholder="ex) Citrus 계열"
                                    />
                                </div>
                                <div className="admin-spices-modal-row-description">
                                    <label>향료 설명</label>
                                    <textarea
                                        value={editingItem?.description || ''}
                                        onChange={(e) =>
                                            setEditingItem((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        placeholder="ex) 상큼하고 톡 쏘는 블러드 오렌지의 향"
                                    />
                                </div>
                                <div className="admin-spices-modal-row">
                                    <label className="admin-spices-modal-row-image-label">이미지</label>
                                    <div className="admin-spices-image-upload">
                                        {/* URL 입력 필드 */}
                                        {editingItem?.isEditingImage ? (
                                            <input
                                                type="text"
                                                className="admin-spices-url-input"
                                                placeholder="새로운 이미지 URL 입력"
                                                defaultValue={editingItem.imageUrl || ''}
                                                onBlur={(e) =>
                                                    setEditingItem((prev) => ({
                                                        ...prev,
                                                        imageUrl: e.target.value,
                                                        isEditingImage: false,
                                                    }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setEditingItem((prev) => ({
                                                            ...prev,
                                                            imageUrl: e.target.value,
                                                            isEditingImage: false,
                                                        }));
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div
                                                onClick={() =>
                                                    setEditingItem((prev) => ({ ...prev, isEditingImage: true }))
                                                }
                                            >
                                                {editingItem?.imageUrl || imagePreview ? (
                                                    <img
                                                        src={editingItem.imageUrl || imagePreview}
                                                        alt="미리보기"
                                                        className="admin-spices-image-preview"
                                                    />
                                                ) : (
                                                    <div className="admin-spices-placeholder">+</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                            <div className="admin-spices-modal-actions">
                                <button onClick={() => { handleSubmit(); handleReset(); }} className="admin-spices-save-button">
                                    저장
                                </button>
                                <button onClick={handleEditClose} className="admin-spices-cancel-button">
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
                            <h2 className="admin-spices-modal-title-delete">- 향료 카드 삭제 -</h2>
                            <p>향료 카드를 삭제하시겠습니까?</p>
                            <div className="admin-spices-modal-actions-delete">
                                <button onClick={handleDeleteConfirm} className="admin-spices-confirm-button">확인</button>
                                <button onClick={handleDeleteClose} className="admin-spices-cancel-button-delete">취소</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 성공 메시지 모달 */}
                {successMessage && (
                    <div className="admin-spices-modal-backdrop">
                        <div className="admin-spices-modal-container-success">
                            <p className="admin-spices-success-message-success">{successMessage}</p>
                            <div className="admin-spices-modal-actions-success">
                                <button onClick={handleSuccessClose} className="admin-spices-cancel-button-success">확인</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="spices-filters">
                    {filters.map((filter, index) => (
                        <div
                            key={index}
                            className={`spices-filter-item ${activeFilters.has(filter.name) ? 'active' : ''}`}
                            style={{
                                backgroundColor: activeFilters.has(filter.name) || activeFilters.has('ALL') ? filter.color : '#EFEDED',
                                color: activeFilters.has(filter.name) || activeFilters.has('ALL') ? getTextColor(filter.color) : '#000000',
                                borderColor: 'black',
                            }}
                            onClick={() => handleFilterClick(filter.name)}
                        >
                            {filter.name}
                        </div>
                    ))}

                    {role === 'ADMIN' && (
                        <div className="admin-spices-controls">
                            <button onClick={handleAddClick} className="admin-spices-add-button">+</button>
                            <button className="admin-spices-select-button" onClick={toggleSelectMode}>
                                {isSelecting ? '✓' : '✓'}
                            </button>
                            <button onClick={handleDeleteClick} className="admin-spices-delete-button">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}

                </div>
                <div className="spices-items-container">
                    {displayedItems.map((item) => {
                        const isHovered = hoveredItemId === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`spices-item-card ${isHovered ? 'hover' : ''}`}
                                onMouseEnter={() => setHoveredItemId(item.id)}
                                onMouseLeave={() => setHoveredItemId(null)}
                                onClick={() => handleCheckboxChange(item.id)}
                            >

                                {/* 카드의 앞면 */}
                                <div className="spices-item-front">

                                    {isSelecting && (
                                        <>
                                            <input
                                                type="checkbox"
                                                id={`checkbox-${item.id}`} // 고유 ID 부여
                                                className="admin-spices-item-select-checkbox"
                                                checked={selectedItems.has(item.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    e.stopPropagation(); // 카드 클릭 이벤트 방지
                                                    handleCheckboxChange(item.id); // 체크박스 상태 변경
                                                }}
                                            />
                                            <label htmlFor={`checkbox-${item.id}`}></label>
                                        </>
                                    )}
                                    {role === 'ADMIN' && (
                                        <button
                                            className="admin-spices-edit-button"
                                            onClick={() => handleEditClick(item)}
                                        >
                                            <Edit size={16} color="#333" />
                                        </button>
                                    )}

                                    <img src={item.imageUrl} alt={item.nameKr} />
                                    <div className="spices-name">{item.name}</div>
                                    <div className="spices-nameKr">{item.nameKr}</div>
                                    <div className="spices-divider-small"></div>
                                    <div className="spices-category">{item.line}계열</div>
                                </div>

                                {/* 카드의 뒷면 */}
                                <div
                                    className="spices-item-back"
                                    style={{
                                        backgroundColor: getFilterColor(item.line),
                                        color: getTextColor(getFilterColor(item.line)),
                                    }}
                                >
                                    <div className="spices-description">{item.description}</div>

                                    {isSelecting && (
                                        <>
                                            <input
                                                type="checkbox"
                                                id={`checkbox-${item.id}`} // 고유 ID 부여
                                                className="admin-spices-item-select-checkbox"
                                                checked={selectedItems.has(item.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    e.stopPropagation(); // 카드 클릭 이벤트 방지
                                                    handleCheckboxChange(item.id); // 체크박스 상태 변경
                                                }}
                                            />
                                            <label htmlFor={`checkbox-${item.id}`}></label>
                                        </>
                                    )}
                                    {role === 'ADMIN' && (
                                        <button
                                            className="admin-spices-edit-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(item);
                                            }}
                                        >
                                            <Edit size={16} style={{ color: getTextColor(getFilterColor(item.line)), }} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>


                <div className="spices-pagination">
                    {/* 처음으로 이동 버튼 */}
                    <button
                        className={`spices-pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        {'<<'}
                    </button>

                    {/* 이전 페이지로 이동 버튼 */}
                    <button
                        className={`spices-pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => handlePageChange(1, currentPage - pageLimit)}
                        disabled={currentPage === 1}
                    >
                        {'<'}
                    </button>

                    {/* 페이지 번호 */}
                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`spices-pagination-button ${page === currentPage ? 'active' : ''}`}
                        >
                            {page}
                        </button>
                    ))}

                    {/* 다음 페이지로 이동 버튼 */}
                    <button
                        className={`spices-pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + pageLimit))}
                        disabled={currentPage === totalPages}
                    >
                        {'>'}
                    </button>

                    {/* 마지막으로 이동 버튼 */}
                    <button
                        className={`spices-pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        {'>>'}
                    </button>
                </div>

            </div>
        </>
    );
}

export default SpicesList;
