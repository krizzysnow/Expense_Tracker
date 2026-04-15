import React from "react";

function ExpenseList({ expenses, onEditExpense, onDeleteExpense, deletingId }) {
  console.log("[ExpenseList] Rendering with expenses:", expenses);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {expenses && expenses.length > 0 ? (
            expenses.map((expense) => {
              const expenseId = expense.id;

              console.log(
                `[ExpenseList] Row: id=${expenseId}, title=${expense.title}`
              );

              return (
                <tr
                  key={expenseId || `${expense.title}-${expense.amount}-${expense.category}`}
                  className={`expense-row ${
                    deletingId === expenseId ? "deleting" : ""
                  }`}
                >
                  <td>{expense.title}</td>
                  <td>₹{parseFloat(expense.amount).toFixed(2)}</td>
                  <td>{expense.category}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => onEditExpense(expense)}
                        disabled={deletingId === expenseId}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => onDeleteExpense(expenseId)}
                        disabled={deletingId === expenseId}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{
                  textAlign: "center",
                  fontStyle: "italic",
                  color: "var(--text-secondary)",
                  padding: "20px"
                }}
              >
                No expenses found. Add your first expense!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseList;