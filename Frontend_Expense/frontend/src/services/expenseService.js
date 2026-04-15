import apiService from "./apiService";


const normalizeExpense = (expense) => {
  if (!expense) return null;


  const id = expense.Expense_id || expense.Expense_ID || expense.expense_id || expense.expenseId || expense.Id || expense.id || null;
  const title = expense.Title || expense.title || "";
  const amount = expense.Amount || expense.amount || 0;
  const category = expense.Category || expense.category || "";

  return {
   
    id,

    title: String(title).trim(),
    amount: parseFloat(amount) || 0,
    category: String(category).trim()
  };
};


const normalizeExpenses = (expensesArray) => {
  if (!Array.isArray(expensesArray)) {
    console.warn("[ExpenseService] Expected array, got:", typeof expensesArray);
    return [];
  }

  return expensesArray
    .map(normalizeExpense)
    .filter(expense => expense !== null);
};

const ExpenseService = {
  
  fetchExpenses: async () => {
    try {
      console.log("[ExpenseService] Fetching expenses from backend...");

      const rawData = await apiService._get("/expenses");

      console.log("[ExpenseService] Raw data from backend:", rawData);

      const normalizedExpenses = Array.isArray(rawData) 
        ? normalizeExpenses(rawData)
        : [];

      console.log(
        "[ExpenseService] Normalized expenses:",
        normalizedExpenses.length,
        "items"
      );

      return normalizedExpenses;
    } catch (error) {
      console.error("[ExpenseService] Failed to fetch expenses:", error.message);
      throw error;
    }
  },


  createExpense: async (data) => {
    try {
      console.log("[ExpenseService] Creating expense:", data);

    
      if (!data.title?.trim()) {
        throw new Error("Title is required");
      }
      if (!data.amount || isNaN(parseFloat(data.amount))) {
        throw new Error("Valid amount is required");
      }
      if (!data.category?.trim()) {
        throw new Error("Category is required");
      }

      
      const payload = {
        title: data.title.trim(),
        amount: parseFloat(data.amount),
        category: data.category.trim()
      };

      console.log("[ExpenseService] Sending payload to backend:", payload);

      const response = await apiService._post("/expenses", payload);

      console.log("[ExpenseService] Created expense response:", response);

      const normalized = normalizeExpense(response);

      return normalized;
    } catch (error) {
      console.error("[ExpenseService] Failed to create expense:", error.message);
      throw error;
    }
  },

  
  updateExpense: async (data) => {
    try {
      console.log("[ExpenseService] Updating expense:", data);

      if (!data.id) {
        throw new Error("Expense ID is required for update");
      }
      if (!data.title?.trim()) {
        throw new Error("Title is required");
      }
      if (!data.amount || isNaN(parseFloat(data.amount))) {
        throw new Error("Valid amount is required");
      }
      if (!data.category?.trim()) {
        throw new Error("Category is required");
      }

    
      const payload = {
        title: data.title.trim(),
        amount: parseFloat(data.amount),
        category: data.category.trim()
      };

      console.log("[ExpenseService] Sending update payload:", payload);
      console.log("[ExpenseService] Update URL: /expenses/" + data.id);

      
      const response = await apiService._put(`/expenses/${data.id}`, payload);

      console.log("[ExpenseService] Updated expense response:", response);

      
      const normalized = normalizeExpense(response);

      return normalized;
    } catch (error) {
      console.error("[ExpenseService] Failed to update expense:", error.message);
      throw error;
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      console.log("[ExpenseService] Deleting expense with id:", expenseId);

      if (!expenseId) {
        throw new Error("Expense ID is required for deletion");
      }

      const response = await apiService._delete(`/expenses/${expenseId}`);

      console.log("[ExpenseService] Delete response:", response);

      return response;
    } catch (error) {
      console.error("[ExpenseService] Failed to delete expense:", error.message);
      throw error;
    }
  },

  getIncome: async () => {
    try {
      console.log("[ExpenseService] Fetching income...");
      const response = await apiService._get("/user/income");
      console.log("[ExpenseService] Income response:", response);
      return parseFloat(response.income) || 0;
    } catch (error) {
      console.error("[ExpenseService] Failed to fetch income:", error.message);
      throw error;
    }
  },

  updateIncome: async (income) => {
    try {
      console.log("[ExpenseService] Updating income to:", income);
      const response = await apiService._put("/user/income", { income: parseFloat(income) });
      console.log("[ExpenseService] Update income response:", response);
      return parseFloat(response.income) || 0;
    } catch (error) {
      console.error("[ExpenseService] Failed to update income:", error.message);
      throw error;
    }
  }
};

export default ExpenseService;