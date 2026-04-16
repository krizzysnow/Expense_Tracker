import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import SpendingBreakdown from "../components/SpendingBreakdown";
import ExpenseService from "../services/expenseService";
import IncomeService from "../services/incomeService";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user =
    userString && userString !== "undefined"
      ? JSON.parse(userString)
      : null;

  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + (parseFloat(expense.amount) || 0);
  }, 0);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const normalizedExpenses = await ExpenseService.fetchExpenses();
      setExpenses(normalizedExpenses || []);
    } catch (err) {
      setError(err.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
    // Fetch income from backend
    IncomeService.getIncome().then(setIncome);
  }, [loadExpenses]);

  const handleIncomeUpdate = async (newIncome) => {
    try {
      const saved = await IncomeService.setIncome(newIncome);
      setIncome(saved);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to update income");
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      await ExpenseService.createExpense(expense);
      await loadExpenses();
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to add expense");
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = async (expense) => {
    if (!editingExpense) return;
    try {
      const updatePayload = {
        id: editingExpense.id,
        title: expense.title?.trim(),
        amount: parseFloat(expense.amount),
        category: expense.category?.trim()
      };
      await ExpenseService.updateExpense(updatePayload);
      setEditingExpense(null);
      await loadExpenses();
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to update expense");
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setError(null);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      setDeletingId(expenseId);
      await ExpenseService.deleteExpense(expenseId);
      await loadExpenses();
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      {/* ── LEFT COLUMN ── */}
      <div className="app-container">
        <header className="top-bar">
          <div>
            <h1>Expense Tracker</h1>
            {user && <p className="welcome-msg">Welcome back, HI {user.name}!</p>}
          </div>
          <button className="logoutbutton" onClick={handleLogout}>
            LOGOUT
          </button>
        </header>

        <main>
          {error && (
            <div className="error-alert">
              <strong> Error: {error}</strong>
              <button className="error-alert-close" onClick={() => setError(null)}>
                
              </button>
            </div>
          )}

          <div className="summary-card">
            <h2>Total Expenses</h2>
            <p className="total-amount">₹{totalExpenses.toFixed(2)}</p>
          </div>

          <div className="expense-form-container">
            <ExpenseForm
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              editingExpense={editingExpense}
              onCancelEdit={handleCancelEdit}
            />
          </div>

          {loading ? (
            <div className="state-container">
              <p className="state-message"> Loading expenses...</p>
            </div>
          ) : expenses.length === 0 && !error ? (
            <div className="state-container">
              <p className="state-message">
                No expenses yet. Add your first expense above!
              </p>
            </div>
          ) : (
            <div className="table-container">
              <ExpenseList
                expenses={expenses}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                deletingId={deletingId}
              />
            </div>
          )}
        </main>
      </div>
      {}
      
      <div className="right-panel">
        <SpendingBreakdown
          expenses={expenses}
          income={income}
          onIncomeUpdate={handleIncomeUpdate}
        />
      </div>
    </div>
  );
}

export default Dashboard;