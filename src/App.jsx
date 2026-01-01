import { useEffect, useState } from "react";

export default function App() {
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("budgets");
    return saved
      ? JSON.parse(saved)
      : {
          Food: 8000,
          Rent: 15000,
          Transport: 3000,
          Entertainment: 2000,
          Misc: 2000,
        };
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  const addExpense = () => {
    if (!amount) return;
    setExpenses([...expenses, { amount: Number(amount), category }]);
    setAmount("");
  };

  const spentByCategory = (cat) =>
    expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ maxWidth: 420, margin: "auto", padding: 16 }}>
      <h2>Expense Tracker</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      >
        {Object.keys(budgets).map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>

      <button
        onClick={addExpense}
        style={{ width: "100%", padding: 10 }}
      >
        Add Expense
      </button>

      <h3 style={{ marginTop: 20 }}>Edit Budgets</h3>
      {Object.keys(budgets).map((cat) => (
        <div key={cat} style={{ display: "flex", marginBottom: 6 }}>
          <span style={{ width: 120 }}>{cat}</span>
          <input
            type="number"
            value={budgets[cat]}
            onChange={(e) =>
              setBudgets({ ...budgets, [cat]: Number(e.target.value) })
            }
          />
        </div>
      ))}

      <h3 style={{ marginTop: 20 }}>Status</h3>
      {Object.keys(budgets).map((cat) => {
        const spent = spentByCategory(cat);
        const remaining = budgets[cat] - spent;

        return (
          <div key={cat} style={{ marginBottom: 8 }}>
            <strong>{cat}</strong>: ₹{remaining} left
          </div>
        );
      })}
    </div>
  );
}
