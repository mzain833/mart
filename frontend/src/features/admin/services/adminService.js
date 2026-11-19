
import apiClient from "../../../lib/apiClient";

const adminService = {
  async getDashboard({ signal } = {}) {
    const response = await apiClient.get("/admin/dashboard", {
      signal,
    });

    return response.data.data;
  },
};

export default adminService;
