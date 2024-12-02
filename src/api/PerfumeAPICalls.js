import apis from "./Apis";

// 향수 조회
export const getAllPerfumes = async () => {
    try {
        const response = await apis.get("/perfumes");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching perfumes:", error);
        throw error;
    }
};

// 향수 수정 
export const modifyPerfumes = async (perfumeData) => {
    try {
        const response = await apis.put(`/perfumes`, perfumeData);
        console.log("꒰ঌ૮ o̴̶̷ ࿁ o̴̶̷ ა໒꒱꒰ঌ૮ o̴̶̷ ࿁ o̴̶̷ ა໒꒱", perfumeData)
        return response.data;
    } catch (error) {
        console.error("Error modifying perfume:", error);
        throw error;
    }
};

// 향수 삭제
export const deletePerfumes = async (perfumeId) => {
    try {
        const response = await apis.delete(`/perfumes/${perfumeId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting perfume:", error);
        throw error;
    }
};

// 향수 추가
export const createPerfumes = async (perfumeData) => {
    try {
        const response = await apis.post('/perfumes', perfumeData); // POST 요청
        console.log("향수 추가 요청 데이터:", perfumeData);
        console.log("향수 추가 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating perfume:", error);
        throw error;
    }
}

