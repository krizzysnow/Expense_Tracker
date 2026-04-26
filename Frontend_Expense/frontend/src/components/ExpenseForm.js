import React, { useEffect, useState } from "react";

function ExpenseForm({
  onAddExpense,
  onUpdateExpense,
  editingExpense,
  onCancelEdit
}) {

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: ""
  });

  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (editingExpense) {
      console.log("[ExpenseForm] Edit mode activated:", editingExpense);

      setFormData({
        title: editingExpense.title || "",
        amount: editingExpense.amount || "",
        category: editingExpense.category || ""
      });
      setValidationError(null);
    } else {
      console.log("[ExpenseForm] Add mode activated");

      setFormData({
        title: "",
        amount: "",
        category: ""
      });
      setValidationError(null);
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationError) {
      setValidationError(null);
    }
  };


  const validateForm = () => {

    if (!formData.title?.trim()) {
      setValidationError("Please enter a title");
      return false;
    }


    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      setValidationError("Please enter a valid amount greater than 0");
      return false;
    }


    if (!formData.category?.trim()) {
      setValidationError("Please select a category");
      return false;
    }

    return true;
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("[ExpenseForm] Form submitted, formData:", formData);

    if (!validateForm()) {
      console.log("[ExpenseForm] Validation failed");
      return;
    }
   const payload = {
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category.trim()
    };

    console.log("[ExpenseForm] Payload ready:", payload);

  
    if (editingExpense) {
      console.log("[ExpenseForm] Calling onUpdateExpense");
      onUpdateExpense(payload);
    } else {
      console.log("[ExpenseForm] Calling onAddExpense");
      onAddExpense(payload);
    }

  
    setFormData({
      title: "",
      amount: "",
      category: ""
    });

    setValidationError(null);
  };

  const handleCancel = () => {
    console.log("[ExpenseForm] Cancel clicked");
    setFormData({
      title: "",
      amount: "",
      category: ""
    });
    setValidationError(null);
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>
        {editingExpense ? "Edit Expense" : "Add New Expense"}
      </h2>

       {}
      {validationError && (
        <div className="validation-error">
           {validationError}
        </div>
      )}

      {}
      <input
        type="text"
        name="title"
        placeholder="Expense title (e.g., Groceries, Gas, Movie)"
        value={formData.title}
        onChange={handleChange}
        required
      />

      {}
      <input
        type="number"
        name="amount"
        placeholder="Amount (₹)"
        value={formData.amount}
        onChange={handleChange}
        step="0.01"
        min="0.01"
        required
      />

      {}
      <input
        type="text"
        name="category"
        placeholder="Category (e.g., Food, Travel, Shopping, Health, Entertainment)"
        value={formData.category}
        onChange={handleChange}
        required
      />

      {}
      <button type="submit">
        {editingExpense ? "✓ UPDATE EXPENSE" : " ADD EXPENSE"}
      </button>

      {}
      {editingExpense && (
        <button type="button" onClick={handleCancel} className="cancel-btn">
           CANCEL
        </button>
      )}
    </form>
  );
}

export default ExpenseForm;
