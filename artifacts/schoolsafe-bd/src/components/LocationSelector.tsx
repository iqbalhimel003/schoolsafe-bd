/* =========================================================
 * SchoolSafe BD — Location Selector
 *
 * Searchable district and upazila dropdowns.
 * Phase 2 will populate with full translations.
 * Phase 3 will trigger data fetching on upazila selection.
 * ========================================================= */

import { useState } from "react";
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
    setSelectedUpazila(null);
    setUpazilaSearch("");
    onUpazilaSelect(null);
  }

  function handleUpazilaSelect(upazila: Upazila) {
    setSelectedUpazila(upazila);
    onUpazilaSelect(upazila);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* District Selector */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            {t("districtLabel")}
          </label>
          <div className="relative border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <input
              type="search"
              placeholder={t("searchDistrict")}
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border-b border-border bg-muted/40 outline-none placeholder:text-muted-foreground"
            />
            <ul className="max-h-44 overflow-y-auto divide-y divide-border/60">
              {filteredDistricts.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-muted-foreground">{t("noResults")}</li>
              ) : (
                filteredDistricts.map((d) => (
                  <li key={d.id}>
                    <button
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
        </div>

        {/* Upazila Selector */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            {t("upazilaLabel")}
          </label>
          <div
            className={`relative border border-border rounded-lg bg-card shadow-sm overflow-hidden ${
              !selectedDistrict ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              type="search"
              placeholder={t("searchUpazila")}
              value={upazilaSearch}
              onChange={(e) => setUpazilaSearch(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full px-3 py-2.5 text-sm border-b border-border bg-muted/40 outline-none placeholder:text-muted-foreground"
            />
            <ul className="max-h-44 overflow-y-auto divide-y divide-border/60">
              {!selectedDistrict ? (
                <li className="px-3 py-2.5 text-sm text-muted-foreground">{t("selectDistrict")}</li>
              ) : filteredUpazilas.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-muted-foreground">{t("noResults")}</li>
              ) : (
                filteredUpazilas.map((u) => (
                  <li key={u.id}>
                    <button
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
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
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
