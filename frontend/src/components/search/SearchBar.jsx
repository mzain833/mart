
import { Search, X } from "lucide-react";

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search products...",
  className = "",
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(value.trim());
  }

  function handleClear() {
    onChange?.("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex w-full items-center gap-2 rounded-full border border-outline bg-white px-4 py-2 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 ${className}`}
    >
      <Search size={20} className="shrink-0 text-slate-400" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={17} />
        </button>
      )}

      <button
        type="submit"
        className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
