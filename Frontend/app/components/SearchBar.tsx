import { IoSearchSharp } from "react-icons/io5";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/*
SearchBar
This component renders a search bar with an input field and a search icon. 
It accepts props for the current value of the input, a callback function to handle changes to the input value, an optional placeholder text, and an optional className for additional styling.
The input field is styled to be visually appealing and user-friendly, with a background color, rounded corners, and padding. 
The search icon is displayed on the left side of the input field, and the entire search bar is designed to be responsive and fit well within the layout of the application.
*/
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
