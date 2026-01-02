import { useEffect, useMemo, useState } from "react";

const theme = {
  bg: "#0b1220",
  card: "#121a2b",
  cardSoft: "#16213a",
  primary: "#4cc9f0",
  warning: "#facc15",
  danger: "#f87171",
  text: "#e5e7eb",
  muted: "#9ca3af",
  border: "#24324d",
};

const styles = {
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  h2: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
  label: { fontSize: 12, color: theme.muted, marginBottom: 4 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.card,
    color: theme.text,
    fontSize: 14,
  },
  buttonPrimary: {
    width: "100%",
    padding: "12px",
    borderRadius: 12,
    background: theme.primary,
    color: "#020617",
    fontSize: 15,
    fontWeight: 600,
  },
  buttonSecondary: {
    padding: "8px 10px",
    borderRadius: 10,
    background: theme.card,
    color: theme.text,
    fontSize: 12,
  },
};

export default function App() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [month, setMonth] = useState(localStorage.getItem("month") || currentMonth);

  const [categories, setCategories] = useState(() => (
    JSON.parse(localStorage.getItem("categories")) || {
      Food: 8000,
      Rent: 15000,
      Transport: 3000,
    }
  ));

  const [expenses, setExpenses] = useState(() => (
    JSON.parse(localStorage.getItem("expenses")) || []
  ));

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(Object.keys(categories)[0]);
  const [note, setNote] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("month", month);
  }, [expenses, categories, month]);

  const resetMonth = () => {
    if (!window.confirm("Start a new month? All expenses will be cleared.")) return;
    setExpenses([]);
    setMonth(currentMonth);
  };

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

  const deleteExpense = (id) => setExpenses(expenses.filter((e) => e.id !== id));

  const addCategory = () => {
    if (!newCategory || !newBudget) return;
    setCategories({ ...categories, [newCategory]: +newBudget });
    setNewCategory("");
    setNewBudget("");
  };

  const removeCategory = (cat) => {
    if (!window.confirm(`Delete category "${cat}"?`)) return;
    const updated = { ...categories };
    delete updated[cat];
    setCategories(updated);
  };

  const spentByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

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
    <div style={{ background: theme.bg, minHeight: "100vh", padding: 16, color: theme.text }}>
      <div style={{ maxWidth: 420, margin: "auto" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={styles.h1}>Expense Tracker</div>
          <div style={{ fontSize: 12, color: theme.muted }}>{month}</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button style={styles.buttonSecondary} onClick={resetMonth}>New Month</button>
          <button style={styles.buttonSecondary} onClick={exportCSV}>Export</button>
        </div>

        {/* ADD EXPENSE */}
        <div style={{ background: theme.cardSoft, padding: 16, borderRadius: 16, marginBottom: 24 }}>
          <div style={styles.h2}>Add Expense</div>

          <div style={styles.label}>Amount</div>
          <input style={styles.input} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={styles.label}>Category</div>
              <select style={styles.input} value={category} onChange={(e) => setCategory(e.target.value)}>
                {Object.keys(categories).map((c) => (<option key={c}>{c}</option>))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={styles.label}>Note</div>
            <input style={styles.input} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <button style={{ ...styles.buttonPrimary, marginTop: 16 }} onClick={addExpense}>Add Expense</button>
        </div>

        {/* BUDGETS */}
        <div style={{ marginBottom: 24 }}>
          <div style={styles.h2}>Budgets</div>
          {Object.keys(categories).map((c) => {
            const spent = spentByCategory[c] || 0;
            const budget = categories[c];
            const pct = spent / budget;
            let color = theme.primary;
            if (pct > 0.9) color = theme.danger;
            else if (pct > 0.75) color = theme.warning;

            return (
              <div key={c} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <strong>{c}</strong>
                  <span>₹{budget - spent}</span>
                </div>
                <input style={{ ...styles.input, marginTop: 6 }} type="number" value={budget} onChange={(e) => setCategories({ ...categories, [c]: +e.target.value })} />
                <div style={{ height: 6, background: theme.border, marginTop: 6, borderRadius: 6 }}>
                  <div style={{ width: `${Math.min(pct * 100, 100)}%`, height: "100%", background: color, borderRadius: 6 }} />
                </div>
                <button style={{ ...styles.buttonSecondary, marginTop: 6 }} onClick={() => removeCategory(c)}>Remove</button>
              </div>
            );
          })}
        </div>

        {/* ADD CATEGORY */}
        <div style={{ background: theme.card, padding: 14, borderRadius: 14, marginBottom: 24 }}>
          <div style={styles.h2}>Add Category</div>
          <input style={styles.input} placeholder="Category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
          <input style={{ ...styles.input, marginTop: 8 }} type="number" placeholder="Monthly budget" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
          <button style={{ ...styles.buttonPrimary, marginTop: 12 }} onClick={addCategory}>Add Category</button>
        </div>

        {/* EXPENSE LIST */}
        <div>
          <div style={styles.h2}>Expenses</div>
          {expenses.map((e) => (
            <div key={e.id} style={{ background: theme.card, padding: 12, borderRadius: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>₹{e.amount} · {e.category}</div>
              <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{e.date} at {e.time}{e.note ? ` · ${e.note}` : ""}</div>
              <button style={{ ...styles.buttonSecondary, marginTop: 6 }} onClick={() => deleteExpense(e.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}