import apis from "./Apis";

export const requestRecommendations = async (userInput, imageFile = null) => {
    try {
        const formData = new FormData();
        formData.append("user_input", userInput);
        if (imageFile) {
            formData.append("image", imageFile);
        }

        const response = await apis.post("/recommend", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
    }
};
