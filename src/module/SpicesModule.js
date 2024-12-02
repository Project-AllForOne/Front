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
        fetchSpicesStart, 
        fetchSpicesSuccess, 
        fetchSpicesFail,
        createSpiceStart,
        createSpiceSuccess,
        createSpiceFail,
        modifySpiceStart,
        modifySpiceSuccess,
        modifySpiceFail,
        deleteSpiceStart,
        deleteSpiceSuccess,
        deleteSpiceFail
    },
} = createActions({
    SPICES: {
        FETCH_SPICES_START: () => {}, // 데이터 요청 시작
        FETCH_SPICES_SUCCESS: (spices) => spices, // 요청 성공
        FETCH_SPICES_FAIL: (error) => error, // 요청 실패
        CREATE_SPICE_START: () => {},
        CREATE_SPICE_SUCCESS: (spice) => spice,
        CREATE_SPICE_FAIL: (error) => error,
        MODIFY_SPICE_START: () => {},
        MODIFY_SPICE_SUCCESS: (spice) => spice,
        MODIFY_SPICE_FAIL: (error) => error,
        DELETE_SPICE_START: () => {},
        DELETE_SPICE_SUCCESS: (spiceId) => spiceId,
        DELETE_SPICE_FAIL: (error) => error
    },
});

// 액션 크리에이터
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

export const createSpiceAction = (spiceData) => async (dispatch) => {
    try {
        dispatch(createSpiceStart());
        const newSpice = await createSpice(spiceData);
        dispatch(createSpiceSuccess(newSpice));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "향료 생성 실패";
        dispatch(createSpiceFail(errorMessage));
    }
};

export const modifySpiceAction = (spiceData) => async (dispatch) => {
    try {
        dispatch(modifySpiceStart());
        const updatedSpice = await modifySpice(spiceData);
        dispatch(modifySpiceSuccess(updatedSpice));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "향료 수정 실패";
        dispatch(modifySpiceFail(errorMessage));
    }
};

export const deleteSpiceAction = (spiceId) => async (dispatch) => {
    try {
        dispatch(deleteSpiceStart());
        await deleteSpice(spiceId);
        dispatch(deleteSpiceSuccess(spiceId));
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
            spices: [...state.spices, payload],
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
            spices: state.spices.map(spice => 
                spice.id === payload.id ? payload : spice
            ),
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
            spices: state.spices.filter(spice => spice.id !== payload),
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