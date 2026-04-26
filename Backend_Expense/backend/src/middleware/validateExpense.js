const validateExpense = (req, res, next) => {
  console.log("[validateExpense] Validating request body", { body: req.body });

  let title = (req.body.title ?? req.body.Title ?? "").toString().trim();
  let category = (req.body.category ?? req.body.Category ?? "").toString().trim();
  let rawAmount = req.body.amount ?? req.body.Amount;


  if (!title) {
    console.warn("[validateExpense]  Title missing or empty");
    return res.status(400).json({
      error: "Title is required and must be a non-empty string.",
    });
  }

  if (title.length < 2) {
    console.warn("[validateExpense]  Title too short", {
      length: title.length,
    });
    return res.status(400).json({
      error: "Title must be at least 2 characters.",
    });
  }

  if (title.length > 255) {
    console.warn("[validateExpense]  Title too long", { length: title.length });
    return res.status(400).json({
      error: "Title must not exceed 255 characters.",
    });
  }

  if (!category) {
    console.warn("[validateExpense]  Category missing or empty");
    return res.status(400).json({
      error: "Category is required and must be a non-empty string.",
    });
  }

  if (category.length < 2) {
    console.warn("[validateExpense]  Category too short", {
      length: category.length,
    });
    return res.status(400).json({
      error: "Category must be at least 2 characters.",
    });
  }

  if (category.length > 100) {
    console.warn("[validateExpense]  Category too long", {
      length: category.length,
    });
    return res.status(400).json({
      error: "Category must not exceed 100 characters.",
    });
  }

  
  if (rawAmount === undefined || rawAmount === null || rawAmount === "") {
    console.warn("[validateExpense]  Amount missing or empty");
    return res.status(400).json({
      error: "Amount is required.",
    });
  }

  const amount = Number(rawAmount);

  if (!Number.isFinite(amount)) {
    console.warn("[validateExpense]  Amount is not a finite number", {
      amount,
    });
    return res.status(400).json({
      error: "Amount must be a valid number.",
    });
  }

  if (amount <= 0) {
    console.warn("[validateExpense]  Amount is not positive", { amount });
    return res.status(400).json({
      error: "Amount must be greater than 0.",
    });
  }

  if (amount > 999999.99) {
    console.warn("[validateExpense] Amount exceeds maximum", { amount });
    return res.status(400).json({
      error: "Amount must not exceed 999999.99.",
    });
  }


  const normalizedAmount = parseFloat(amount.toFixed(2));


  req.body = {
    title: title,
    amount: normalizedAmount,
    category: category,
  };

  console.log("[validateExpense] (Validation passed)", req.body);
  next();
};

module.exports = validateExpense;