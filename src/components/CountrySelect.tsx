"use client";

import { COUNTRIES, type Country } from "@/lib/validations";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Seleccionar país",
  className = "",
}: CountrySelectProps) {
  // Find the selected country
  const selectedCountry = COUNTRIES.find((c) => c.code === value || c.name === value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">{placeholder}</option>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.name}>
          {country.flag} {country.name}
        </option>
      ))}
    </select>
  );
}
