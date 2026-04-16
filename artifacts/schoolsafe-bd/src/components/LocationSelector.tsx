/* =========================================================
 * SchoolSafe BD — Location Selector
 *
 * Searchable district and upazila dropdowns.
 * Shows names in English or Bangla based on the current lang.
 * Calls onUpazilaSelect with the chosen Upazila object, which
 * triggers data fetching in the parent (Home.tsx).
 * ========================================================= */

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DISTRICTS } from "@/data/locations";
import type { District, Upazila, Language } from "@/types";

interface Props {
  onUpazilaSelect: (upazila: Upazila | null) => void;
}

function getDistrictName(d: District, lang: Language) {
  return lang === "bn" ? d.nameBn : d.nameEn;
}

function getUpazilaName(u: Upazila, lang: Language) {
  return lang === "bn" ? u.nameBn : u.nameEn;
}

export default function LocationSelector({ onUpazilaSelect }: Props) {
  const { lang, t } = useLanguage();
  const [districtSearch, setDistrictSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [upazilaSearch, setUpazilaSearch] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState<Upazila | null>(null);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [upazilaOpen, setUpazilaOpen] = useState(false);

  const districtRef = useRef<HTMLDivElement>(null);
  const upazilaRef = useRef<HTMLDivElement>(null);

  /* Update displayed names when language changes */
  useEffect(() => {
    if (selectedDistrict) setDistrictSearch(getDistrictName(selectedDistrict, lang));
    if (selectedUpazila) setUpazilaSearch(getUpazilaName(selectedUpazila, lang));
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setDistrictOpen(false);
        if (selectedDistrict) setDistrictSearch(getDistrictName(selectedDistrict, lang));
      }
      if (upazilaRef.current && !upazilaRef.current.contains(e.target as Node)) {
        setUpazilaOpen(false);
        if (selectedUpazila) setUpazilaSearch(getUpazilaName(selectedUpazila, lang));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedDistrict, selectedUpazila, lang]);

  function handleDistrictFocus() {
    if (selectedDistrict) setDistrictSearch("");
    setDistrictOpen(true);
  }

  function handleDistrictBlur() {
    setTimeout(() => {
      if (districtRef.current && !districtRef.current.contains(document.activeElement)) {
        setDistrictOpen(false);
        if (selectedDistrict) setDistrictSearch(getDistrictName(selectedDistrict, lang));
      }
    }, 150);
  }

  function handleUpazilaFocus() {
    if (selectedUpazila) setUpazilaSearch("");
    setUpazilaOpen(true);
  }

  function handleUpazilaBlur() {
    setTimeout(() => {
      if (upazilaRef.current && !upazilaRef.current.contains(document.activeElement)) {
        setUpazilaOpen(false);
        if (selectedUpazila) setUpazilaSearch(getUpazilaName(selectedUpazila, lang));
      }
    }, 150);
  }

  /* Filter districts by search */
  const filteredDistricts = DISTRICTS.filter((d) =>
    getDistrictName(d, lang).toLowerCase().includes(districtSearch.toLowerCase())
  );

  /* Filter upazilas of selected district */
  const upazilas = selectedDistrict?.upazilas ?? [];
  const filteredUpazilas = upazilas.filter((u) =>
    getUpazilaName(u, lang).toLowerCase().includes(upazilaSearch.toLowerCase())
  );

  function handleDistrictSelect(district: District) {
    setSelectedDistrict(district);
    setDistrictSearch(getDistrictName(district, lang));
    setDistrictOpen(false);
    setSelectedUpazila(null);
    setUpazilaSearch("");
    onUpazilaSelect(null);
  }

  function handleUpazilaSelect(upazila: Upazila) {
    setSelectedUpazila(upazila);
    setUpazilaSearch(getUpazilaName(upazila, lang));
    setUpazilaOpen(false);
    onUpazilaSelect(upazila);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* District Selector */}
        <div ref={districtRef} className="relative">
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            {t("districtLabel")}
          </label>
          <input
            type="search"
            placeholder={t("searchDistrict")}
            value={districtSearch}
            onChange={(e) => setDistrictSearch(e.target.value)}
            onFocus={handleDistrictFocus}
            onBlur={handleDistrictBlur}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-card shadow-sm outline-none placeholder:text-muted-foreground"
          />
          {districtOpen && (
            <div className="absolute z-20 top-full mt-1 w-full border border-border rounded-lg bg-card shadow-md overflow-hidden">
              <ul className="max-h-44 overflow-y-auto divide-y divide-border/60">
                {filteredDistricts.length === 0 ? (
                  <li className="px-3 py-2.5 text-sm text-muted-foreground">{t("noResults")}</li>
                ) : (
                  filteredDistricts.map((d) => (
                    <li key={d.id}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleDistrictSelect(d)}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors ${
                          selectedDistrict?.id === d.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {getDistrictName(d, lang)}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Upazila Selector */}
        <div
          ref={upazilaRef}
          className={`relative ${!selectedDistrict ? "opacity-50 pointer-events-none" : ""}`}
        >
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            {t("upazilaLabel")}
          </label>
          <input
            type="search"
            placeholder={t("searchUpazila")}
            value={upazilaSearch}
            onChange={(e) => setUpazilaSearch(e.target.value)}
            onFocus={handleUpazilaFocus}
            onBlur={handleUpazilaBlur}
            disabled={!selectedDistrict}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-card shadow-sm outline-none placeholder:text-muted-foreground"
          />
          {upazilaOpen && selectedDistrict && (
            <div className="absolute z-20 top-full mt-1 w-full border border-border rounded-lg bg-card shadow-md overflow-hidden">
              <ul className="max-h-44 overflow-y-auto divide-y divide-border/60">
                {filteredUpazilas.length === 0 ? (
                  <li className="px-3 py-2.5 text-sm text-muted-foreground">{t("noResults")}</li>
                ) : (
                  filteredUpazilas.map((u) => (
                    <li key={u.id}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleUpazilaSelect(u)}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between gap-2 ${
                          selectedUpazila?.id === u.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        <span>{getUpazilaName(u, lang)}</span>
                        {u.isPilot && (
                          <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                            {t("pilotBadge")}
                          </span>
                        )}
                        {u.hotspotLabel && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                            {t("hotspotBadge")}
                          </span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Selection summary */}
      {selectedUpazila && (
        <p className="mt-3 text-sm text-muted-foreground">
          {t("districtLabel")}: <strong className="text-foreground">{getDistrictName(selectedDistrict!, lang)}</strong>
          {" · "}
          {t("upazilaLabel")}: <strong className="text-foreground">{getUpazilaName(selectedUpazila, lang)}</strong>
        </p>
      )}
    </section>
  );
}
