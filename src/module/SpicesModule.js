import { createActions, handleActions } from "redux-actions";
import { getAllSpices, createSpice, modifySpice, deleteSpice } from "../api/SpicesAPICalls";

// 초기 상태
const initialState = {
    spices: [],
    loading: false,
    error: null,
};

// 액션 생성
export const {
    spices: { 
        fetchSpicesStart, fetchSpicesSuccess, fetchSpicesFail,
        createSpiceStart, createSpiceSuccess, createSpiceFail,
        modifySpiceStart, modifySpiceSuccess, modifySpiceFail,
        deleteSpiceStart, deleteSpiceSuccess, deleteSpiceFail
    },
} = createActions({
    SPICES: {
        FETCH_SPICES_START: () => {},
        FETCH_SPICES_SUCCESS: (spices) => spices,
        FETCH_SPICES_FAIL: (error) => error,
        
        CREATE_SPICE_START: () => {},
        CREATE_SPICE_SUCCESS: (spice) => spice,
        CREATE_SPICE_FAIL: (error) => error,
        
        MODIFY_SPICE_START: () => {},
        MODIFY_SPICE_SUCCESS: (spice) => spice,
        MODIFY_SPICE_FAIL: (error) => error,
        
        DELETE_SPICE_START: () => {},
        DELETE_SPICE_SUCCESS: (spiceId) => spiceId,
        DELETE_SPICE_FAIL: (error) => error,
    },
});

// Thunk 액션 생성자
export const fetchSpices = () => async (dispatch) => {
    try {
        dispatch(fetchSpicesStart());
        const spices = await getAllSpices();
        dispatch(fetchSpicesSuccess(spices));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "향료 목록 불러오기 실패";
        dispatch(fetchSpicesFail(errorMessage));
    }
};

export const addSpice = (spiceData) => async (dispatch) => {
    try {
        dispatch(createSpiceStart());
        await createSpice(spiceData);
        const updatedSpices = await getAllSpices();
        dispatch(createSpiceSuccess(updatedSpices));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "향료 생성 실패";
        dispatch(createSpiceFail(errorMessage));
    }
};

export const updateSpice = (spiceData) => async (dispatch) => {
    try {
        dispatch(modifySpiceStart());
        await modifySpice(spiceData);
        const updatedSpices = await getAllSpices();
        dispatch(modifySpiceSuccess(updatedSpices));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "향료 수정 실패";
        dispatch(modifySpiceFail(errorMessage));
    }
};

export const removeSpice = (spiceId) => async (dispatch) => {
    try {
        dispatch(deleteSpiceStart());
        await deleteSpice(spiceId);
        const updatedSpices = await getAllSpices();
        dispatch(deleteSpiceSuccess(updatedSpices));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "향료 삭제 실패";
        dispatch(deleteSpiceFail(errorMessage));
    }
};

// 리듀서
const spiceReducer = handleActions(
    {
        [fetchSpicesStart]: (state) => ({
            ...state,
            loading: true,
            error: null,
        }),
        [fetchSpicesSuccess]: (state, { payload }) => ({
            ...state,
            spices: payload,
            loading: false,
            error: null,
        }),
        [fetchSpicesFail]: (state, { payload }) => ({
            ...state,
            loading: false,
            error: payload,
        }),

        [createSpiceStart]: (state) => ({
            ...state,
            loading: true,
            error: null,
        }),
        [createSpiceSuccess]: (state, { payload }) => ({
            ...state,
            spices: payload,
            loading: false,
            error: null,
        }),
        [createSpiceFail]: (state, { payload }) => ({
            ...state,
            loading: false,
            error: payload,
        }),

        [modifySpiceStart]: (state) => ({
            ...state,
            loading: true,
            error: null,
        }),
        [modifySpiceSuccess]: (state, { payload }) => ({
            ...state,
            spices: payload,
            loading: false,
            error: null,
        }),
        [modifySpiceFail]: (state, { payload }) => ({
            ...state,
            loading: false,
            error: payload,
        }),

        [deleteSpiceStart]: (state) => ({
            ...state,
            loading: true,
            error: null,
        }),
        [deleteSpiceSuccess]: (state, { payload }) => ({
            ...state,
            spices: payload,
            loading: false,
            error: null,
        }),
        [deleteSpiceFail]: (state, { payload }) => ({
            ...state,
            loading: false,
            error: payload,
        }),
    },
    initialState
);

// Selector 함수
export const selectSpices = (state) => state.spices.spices;
export const selectLoading = (state) => state.spices.loading;
export const selectError = (state) => state.spices.error;

export default spiceReducer;