import apiService from "./apiService";

const IncomeService = {
  getIncome: async () => {
    const res = await apiService._get("/finance/income");
    return res.income || 0;
  },
  setIncome: async (income) => {
    const res = await apiService._put("/finance/income", { income });
    return res.income || 0;
  }
};

export default IncomeService;
