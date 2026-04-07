import { IoSearchSharp } from "react-icons/io5";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ value, onChange, placeholder = "Haku...", className = "" }: SearchBarProps) => {
  return (
    <div className={`flex items-center gap-2 bg-primary rounded-4xl px-4 py-3 border shadow-lg ${className}`}>
      <span className="text-neutral text-xl shrink-0">
        <IoSearchSharp />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 100))}
        placeholder={placeholder}
        maxLength={100}
        autoComplete="off"
        spellCheck={false}
        className="flex-1 bg-transparent text-neutral placeholder:text-foreground/40 font-medium text-base outline-none"
      />
    </div>
  );
};

export default SearchBar;
