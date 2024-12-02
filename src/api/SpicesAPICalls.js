import apis from "./Apis";

export const getAllSpices = async () => {
    try {
        const response = await apis.get("/spices");
        console.log("API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching spices:", error);
        throw error;
    }
};

export const createSpice = async (spiceData) => {
    try {
        const response = await apis.post("/spices", spiceData);
        console.log("Spice created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating spice:", error);
        throw error;
    }
};

export const modifySpice = async (spiceData) => {
    try {
        const response = await apis.put(`/spices/${spiceData.id}`, spiceData);
        console.log("Spice modified successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error modifying spice:", error);
        throw error;
    }
};

export const deleteSpice = async (spiceId) => {
    try {
        const response = await apis.delete(`/spices/${spiceId}`);
        console.log("Spice deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting spice:", error);
        throw error;
    }
};