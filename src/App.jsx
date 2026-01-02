import { useEffect, useMemo, useState } from "react";

const theme = {
  bg: "#0f172a",
  card: "#1e293b",
  primary: "#38bdf8",
  warning: "#facc15",
  danger: "#f87171",
  text: "#e5e7eb",
  muted: "#94a3b8",
};

export default function App() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  /* ---------------- state ---------------- */
  const [month, setMonth] = useState(
    localStorage.getItem("month") || currentMonth
  );

  const [categories, setCategories] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("categories")) || {
        Food: 8000,
        Rent: 15000,
        Transport: 3000,
      }
    );
  });

  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem("expenses")) || [];
  });

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(Object.keys(categories)[0]);
  const [note, setNote] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("month", month);
  }, [expenses, categories, month]);

  /* ---------------- monthly reset ---------------- */
  const resetMonth = () => {
    if (!window.confirm("Start a new month? All expenses will be cleared.")) return;
    setExpenses([]);
    setMonth(currentMonth);
  };

  /* ---------------- expense ops ---------------- */
  const addExpense = () => {
    if (!amount) return;

    const now = new Date();

    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        amount: +amount,
        category,
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        note,
      },
    ]);

    setAmount("");
    setNote("");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  /* ---------------- category ops ---------------- */
  const addCategory = () => {
    if (!newCategory || !newBudget) return;
    setCategories({
      ...categories,
      [newCategory]: +newBudget,
    });
    setNewCategory("");
    setNewBudget("");
  };

  const removeCategory = (cat) => {
    if (!window.confirm(`Delete category \"${cat}\"? Related expenses will remain.`)) return;
    const updated = { ...categories };
    delete updated[cat];
    setCategories(updated);
  };

  /* ---------------- calculations ---------------- */
  const spentByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  /* ---------------- export ---------------- */
  const exportCSV = () => {
    let csv = "Date,Time,Amount,Category,Note\n";
    expenses.forEach((e) => {
      csv += `${e.date},${e.time},${e.amount},${e.category},${e.note || ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${month}.csv`;
    a.click();
  };

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: "100vh",
        color: theme.text,
        padding: 16,
        maxWidth: 420,
        margin: "auto",
      }}
    >
      <h2>Expense Tracker</h2>
      <p style={{ color: theme.muted }}>{month}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={resetMonth}>🔄 New Month</button>
        <button onClick={exportCSV}>⬇ Export</button>
      </div>

      {/* ADD EXPENSE */}
      <div style={{ background: theme.card, padding: 12, borderRadius: 8 }}>
        <h3>Add Expense</h3>

        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {Object.keys(categories).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button onClick={addExpense}>Add Expense</button>
      </div>

      {/* STATUS */}
      <h3 style={{ marginTop: 20 }}>Budgets</h3>
      {Object.keys(categories).map((c) => {
        const spent = spentByCategory[c] || 0;
        const budget = categories[c];
        const pct = spent / budget;

        let color = theme.primary;
        if (pct > 0.9) color = theme.danger;
        else if (pct > 0.75) color = theme.warning;

        return (
          <div key={c} style={{ marginBottom: 12 }}>
            <strong>{c}</strong> — ₹{budget - spent} left
            <input
              type="number"
              value={budget}
              onChange={(e) =>
                setCategories({
                  ...categories,
                  [c]: +e.target.value,
                })
              }
            />
            <div style={{ height: 6, background: "#334155", marginTop: 4 }}>
              <div
                style={{
                  width: `${Math.min(pct * 100, 100)}%`,
                  height: "100%",
                  background: color,
                }}
              />
            </div>
            <button onClick={() => removeCategory(c)}>🗑 Remove</button>
          </div>
        );
      })}

      {/* ADD CATEGORY */}
      <div style={{ background: theme.card, padding: 12, borderRadius: 8 }}>
        <h3>Add Category</h3>
        <input
          placeholder="Category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <input
          placeholder="Monthly budget"
          type="number"
          value={newBudget}
          onChange={(e) => setNewBudget(e.target.value)}
        />
        <button onClick={addCategory}>Add Category</button>
      </div>

      {/* EXPENSE LIST */}
      <h3 style={{ marginTop: 20 }}>Expenses</h3>
      {expenses.map((e) => (
        <div
          key={e.id}
          style={{
            background: theme.card,
            padding: 8,
            borderRadius: 6,
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>₹{e.amount}</strong> · {e.category}
            <div style={{ fontSize: 12, color: theme.muted }}>
              {e.date} at {e.time} — {e.note}
            </div>
          </div>
          <button onClick={() => deleteExpense(e.id)}>❌</button>
        </div>
      ))}
    </div>
  );
}