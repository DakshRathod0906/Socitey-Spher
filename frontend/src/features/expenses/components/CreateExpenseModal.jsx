import { useState } from "react";
import { Modal, Button, Input, Select } from "../../../components/ui";

const CATEGORIES = [
  "MAINTENANCE", "UTILITIES", "SALARY", "SECURITY", 
  "EVENT", "ADMINISTRATION", "REPAIR", "OTHER"
];

export default function CreateExpenseModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("MAINTENANCE");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!amount || Number(amount) <= 0) return "Amount must be greater than zero.";
    if (!expenseDate) return "Expense Date is required.";
    
    const selectedDate = new Date(expenseDate);
    const today = new Date();
    // Allow today but not future
    if (selectedDate > today) return "Expense Date cannot be in the future.";

    if (receiptUrl && !receiptUrl.startsWith("http")) return "Receipt URL must be a valid http(s) link.";

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      amount: Number(amount),
      expenseDate,
      vendorName: vendorName.trim() || undefined,
      receiptUrl: receiptUrl.trim() || undefined,
    });
  };

  // Reset form when closed/opened could be done via key or useEffect, but usually we just reset on success.

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Record New Expense"
      description="Enter the details of the society expense. All fields marked with * are required."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4 animate-fade-in">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <Input 
          label="Title *" 
          placeholder="e.g., Monthly Lift Maintenance"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(""); }}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Category *</label>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>

          <Input 
            label="Amount (₹) *" 
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            label="Expense Date *" 
            type="date"
            value={expenseDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => { setExpenseDate(e.target.value); setError(""); }}
            required
          />

          <Input 
            label="Vendor Name" 
            placeholder="e.g., Otis Elevators"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
          />
        </div>

        <Input 
          label="Receipt URL" 
          placeholder="https://example.com/receipt.pdf"
          value={receiptUrl}
          onChange={(e) => { setReceiptUrl(e.target.value); setError(""); }}
        />
        <p className="text-xs text-muted -mt-2">Provide a link to the invoice or receipt document.</p>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Record Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
