export default function SearchBar({ query, setQuery, filter, setFilter }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        placeholder="Search products..."
        className="p-2 border rounded w-full md:w-1/2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded">
        <option value="">All Sizes</option>
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
      </select>
    </div>
  );
}
