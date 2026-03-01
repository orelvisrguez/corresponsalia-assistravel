"use client";

import { COUNTRIES, type Country } from "@/lib/validations";
import { useState, useRef, useEffect } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customCountry, setCustomCountry] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find selected country
  const selectedCountry = COUNTRIES.find(
    (c) => c.name === value || c.code === value
  );

  // Get country code for flagcdn
  const getCountryCode = (countryNameOrCode: string): string => {
    const country = COUNTRIES.find(
      (c) => c.name === countryNameOrCode || c.code === countryNameOrCode
    );
    return country?.code?.toLowerCase() || "";
  };

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  // Check if current value is a custom country (not in predefined list)
  const isCustomValue = value && !COUNTRIES.some(
    (c) => c.name === value || c.code === value
  );

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
        setCustomMode(false);
      }
    }
    // Use capture phase to ensure proper handling
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current && !customMode) {
      inputRef.current.focus();
    }
  }, [isOpen, customMode]);

  const handleSelect = (countryName: string) => {
    onChange(countryName);
    setIsOpen(false);
    setSearch("");
    setCustomMode(false);
  };

  const handleAddCustom = () => {
    if (customCountry.trim()) {
      onChange(customCountry.trim());
      setIsOpen(false);
      setSearch("");
      setCustomCountry("");
      setCustomMode(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearch("");
      setCustomMode(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
      >
        <span className="flex items-center gap-2">
          {value ? (
            <>
              {isCustomValue ? (
                <span className="w-5 h-4 flex items-center justify-center bg-slate-200 rounded text-xs font-medium">
                  ?
                </span>
              ) : (
                <img
                  src={`https://flagcdn.com/w20/${getCountryCode(value)}.png`}
                  alt=""
                  className="w-5 h-4 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <span>{value}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          {!customMode && (
            <div className="p-2 border-b border-slate-100" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearch(e.target.value);
                  }}
                  placeholder="Buscar país..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Custom country input */}
          {customMode && (
            <div className="p-2 border-b border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="Nombre del país"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          {/* Country list */}
          <div className="max-h-60 overflow-y-auto">
            {!customMode && filteredCountries.length > 0 && (
              <div className="py-1">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors ${
                      value === country.name ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    }`}
                  >
                    <img
                      src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                      alt={country.name}
                      className="w-5 h-4 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span>{country.name}</span>
                  </button>
                ))}
              </div>
            )}

            {!customMode && filteredCountries.length === 0 && search && (
              <div className="py-4 text-center text-slate-500 text-sm">
                No se encontraron países
              </div>
            )}
          </div>

          {/* Add custom country button */}
          {!customMode && (
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar país no listed</span>
              </button>
            </div>
          )}

          {/* Back to list button */}
          {customMode && (
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setCustomMode(false);
                  setCustomCountry("");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver a la lista</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
