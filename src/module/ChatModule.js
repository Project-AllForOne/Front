import { createActions, handleActions } from "redux-actions";
import { requestRecommendations } from "../api/ChatAPICalls";

// 초기 상태
const initialState = {
    chatMode: "chat", // 현재 모드 ("chat" 또는 "recommendation")
    response: null,   // 서버에서 반환된 응답
    recommendedPerfumes: [], // 추천된 향수 목록
    commonFeeling: null, // 공통 감정
    imageProcessed: null, // 처리된 이미지 결과
    generatedImage: null,  // 생성된 이미지 경로
    loading: false, // 로딩 상태
    error: null,    // 에러 메시지
};

// 액션 생성
export const {
    chat: {
        fetchChatStart,
        fetchChatSuccess,
        fetchChatFail,
    },
} = createActions({
    CHAT: {
        FETCH_CHAT_START: () => {},
        FETCH_CHAT_SUCCESS: (response) => response,
        FETCH_CHAT_FAIL: (error) => error,
    },
});

// Redux Thunk
export const fetchChatResponse = (userInput, imageFile = null) => async (dispatch) => {
    try {
        dispatch(fetchChatStart()); // 로딩 상태 시작

        // 서버 요청
        const response = await requestRecommendations(userInput, imageFile);
        console.log("API 응답 데이터:", response);
        dispatch(fetchChatSuccess(response));
        return response; // 응답 데이터 반환

    } catch (error) {
        dispatch(fetchChatFail(error.response?.data?.message || "서버와 통신 중 오류 발생"));
    }
};

// 리듀서
const chatReducer = handleActions(
    {
        [fetchChatStart]: (state) => ({
            ...state,
            loading: true,
            error: null,
        }),
        [fetchChatSuccess]: (state, { payload }) => ({
            ...state,
            chatMode: payload.mode || payload.response?.mode || "chat",
            response: payload.response || null,
            recommendedPerfumes: Array.isArray(payload.recommendedPerfumes?.recommendations)
            ? payload.recommendedPerfumes.recommendations
            : [],
            commonFeeling: payload.commonFeeling || null,
            imageProcessed: payload.imageProcessed || null,
            generatedImage: payload.generatedImage || null,
            loading: false,
            error: null,
        }),
        [fetchChatFail]: (state, { payload }) => ({
            ...state,
            loading: false,
            error: payload,
        }),
    },
    initialState
);

// 셀렉터
export const selectChatMode = (state) => state.chat.chatMode;
export const selectResponse = (state) => state.chat.response;
export const selectRecommendedPerfumes = (state) => state.chat.recommendedPerfumes;
export const selectCommonFeeling = (state) => state.chat.commonFeeling;
export const selectImageProcessed = (state) => state.chat.imageProcessed;
export const selectGeneratedImage = (state) => state.chat.generatedImage;
export const selectLoading = (state) => state.chat.loading;
export const selectError = (state) => state.chat.error;

export default chatReducer;
