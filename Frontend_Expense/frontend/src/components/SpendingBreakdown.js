import React, { useMemo, useState, useEffect } from "react";

const UI_PALETTE = [
  "#4ade80", // lime green
  "#38bdf8", // light blue
  "#fbbf24", // amber/yellow
  "#f87171", // soft red
  "#a78bfa", // purple
  "#2dd4bf", // teal
  "#fb923c", // orange
  "#a3e635"  // bright lime
];

export const getCategoryColor = (catName, index = 0) => {
  return UI_PALETTE[index % UI_PALETTE.length];
};

export default function SpendingBreakdown({ expenses = [], income = 0, onIncomeUpdate }) {
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [draftIncome, setDraftIncome] = useState(income.toString());

  // Update draft when income changes
  useEffect(() => {
    setDraftIncome(income.toString());
  }, [income]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [expenses]);

  const savings = income - totalExpenses;

  const categoryTotals = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      const cat = e.category || "OTHER";
      totals[cat] = (totals[cat] || 0) + (parseFloat(e.amount) || 0);
    });
    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const saveIncome = () => {
    if (onIncomeUpdate) {
      onIncomeUpdate(draftIncome);
    }
    setIsEditingIncome(false);
  };

  const pieChartBackground = useMemo(() => {
    if (totalExpenses === 0) return "conic-gradient(#2e4a38 0deg, #2e4a38 360deg)";
    
    let currentAngle = 0;
    const segments = categoryTotals.map((cat, index) => {
      const percentage = cat.amount / totalExpenses;
      const degrees = percentage * 360;
      const color = getCategoryColor(cat.name, index);
      const segment = `${color} ${currentAngle}deg ${currentAngle + degrees}deg`;
      currentAngle += degrees;
      return segment;
    });
    
    return `conic-gradient(${segments.join(", ")})`;
  }, [categoryTotals, totalExpenses]);

  return (
    <div className="breakdown-panel">
      {/* Income Card */}
      <div className="income-card">
        <div className="income-card-header">
          <span className="income-label">Monthly Income</span>
          {!isEditingIncome && (
            <button className="income-edit-btn" onClick={() => setIsEditingIncome(true)}>
              EDIT
            </button>
          )}
        </div>
        {isEditingIncome ? (
          <div className="income-edit-row">
            <span className="income-currency">₹</span>
            <input
              type="number"
              className="income-input"
              value={draftIncome}
              onChange={(e) => setDraftIncome(e.target.value)}
            />
            <button className="income-save-btn" onClick={saveIncome}>SAVE</button>
            <button className="income-cancel-btn" onClick={() => {
              setDraftIncome(income.toString());
              setIsEditingIncome(false);
            }}>CANCEL</button>
          </div>
        ) : (
          <div className="income-amount">
            <span className="income-arrow">↓</span>
            ₹{parseFloat(income).toFixed(2)}
          </div>
        )}
      </div>

      {/* Savings Card */}
      <div className={`savings-card ${savings >= 0 ? 'savings-positive' : 'savings-negative'}`}>
        <span className="savings-label">Remaining / Savings</span>
        <span className="savings-amount">₹{savings.toFixed(2)}</span>
        {savings < 0 && (
          <div className="savings-warning">You are overspending!</div>
        )}
      </div>

      {/* Breakdown Card */}
      <div className="breakdown-card">
        <h3 className="breakdown-title">Spending Breakdown</h3>
        {totalExpenses === 0 ? (
          <div className="breakdown-empty">No expenses yet.</div>
        ) : (
          <>
            <div 
              className="breakdown-pie-chart"
              style={{ background: pieChartBackground }} 
            />
            <div className="breakdown-rows">
              {categoryTotals.map((cat, index) => {
                const percentage = ((cat.amount / totalExpenses) * 100).toFixed(1);
                const color = getCategoryColor(cat.name, index);
                return (
                  <div key={cat.name} className="breakdown-row">
                    <div className="breakdown-row-header">
                      <div className="breakdown-dot" style={{ backgroundColor: color }} />
                      <div className="breakdown-cat">{cat.name}</div>
                      <div className="breakdown-amt">₹{cat.amount.toFixed(2)}</div>
                    </div>
                    <div className="breakdown-track">
                      <div
                        className="breakdown-fill"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
