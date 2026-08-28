import React from "react";
import Select from "react-select";

// A react-select wrapper themed to match the app's dark + green look
// (translucent glass control, near-black dropdown menu, jade highlight).
// `options` can be an array of plain strings or { value, label } objects.
export default function SelectField({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  isClearable = false,
  isSearchable = true,
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  const selected = normalized.find((o) => o.value === value) || null;

  return (
    <Select
      options={normalized}
      value={selected}
      onChange={(opt) => onChange(opt ? opt.value : "")}
      placeholder={placeholder}
      isClearable={isClearable}
      isSearchable={isSearchable}
      classNamePrefix="rs"
      // Render the open menu into a portal on <body>, positioned with
      // fixed coordinates instead of being laid out inline. Without this,
      // the menu expands the form's own DOM flow on mobile — since it sits
      // inside containers with overflow-hidden / limited height, that shows
      // up as the field "overlapping" the page with blank space opening up
      // below it. Portaling avoids affecting any parent's layout entirely.
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      menuShouldScrollIntoView={false}
      styles={{
        control: (base, state) => ({
          ...base,
          background: "rgba(255,255,255,0.04)",
          borderColor: state.isFocused ? "#22c55e" : "rgba(255,255,255,0.12)",
          borderRadius: "0.5rem",
          minHeight: "42px",
          boxShadow: state.isFocused ? "0 0 0 3px rgba(34,197,94,0.15)" : "none",
          "&:hover": { borderColor: state.isFocused ? "#22c55e" : "rgba(255,255,255,0.2)" },
        }),
        valueContainer: (base) => ({ ...base, padding: "2px 12px" }),
        singleValue: (base) => ({ ...base, color: "#f1f5f9" }),
        input: (base) => ({ ...base, color: "#f1f5f9" }),
        placeholder: (base) => ({ ...base, color: "#64748b" }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? "#22c55e" : "#64748b",
          "&:hover": { color: "#22c55e" },
        }),
        clearIndicator: (base) => ({ ...base, color: "#64748b", "&:hover": { color: "#ef4444" } }),
        menu: (base) => ({
          ...base,
          background: "#0d100d",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.5rem",
          overflow: "hidden",
          zIndex: 30,
        }),
        // Must be high enough to clear fixed modals/headers now that the
        // menu is portaled straight onto <body>.
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menuList: (base) => ({ ...base, padding: "4px" }),
        option: (base, state) => ({
          ...base,
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          background: state.isSelected
            ? "#16a34a"
            : state.isFocused
            ? "rgba(34,197,94,0.12)"
            : "transparent",
          color: state.isSelected ? "#06170d" : "#e2e8f0",
          fontWeight: state.isSelected ? 600 : 400,
          cursor: "pointer",
        }),
        noOptionsMessage: (base) => ({ ...base, color: "#64748b" }),
      }}
    />
  );
}
