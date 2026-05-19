/* English isotope captions for ?lang=en (loaded instead of isotopes.js). */
const ISOTOPE_DATA_EN = {
  H: {
    protons: 1,
    isotopes: [
      { A: 1, name: "Protium", neutrons: 0, mass: 1.00783, halfLife: "Stable", stability: "stable", abundance: "99.985%", decay: null, decayEq: null, uses: ["Ordinary water", "Organic molecules", "Stellar fuel"], details: "The simplest nuclide and abundant isotope in the universe — one proton, zero neutrons." },
      { A: 2, name: "Deuterium", neutrons: 1, mass: 2.01410, halfLife: "Stable", stability: "stable", abundance: "0.015%", decay: null, decayEq: null, uses: ["Heavy water (D₂O) in CANDU reactors", "NMR spectroscopy", "Fusion energy (research)"], details: "Stable isotope with one neutron. Heavy water is used as a neutron moderator in some nuclear reactors." },
      { A: 3, name: "Tritium", neutrons: 2, mass: 3.01605, halfLife: "12.32 years", stability: "radioactive", abundance: "trace", decay: "β⁻", decayEq: "³H → ³He + e⁻ + ν̄ₑ", uses: ["Fusion (D-T)", "Glow devices (exit signs)", "Biological tracers"], details: "Radioactive hydrogen produced in reactors; emits low-energy beta radiation — key nuclide for deuterium–tritium fusion." },
    ],
  },
  He: {
    protons: 2,
    isotopes: [
      { A: 3, name: "Helium-3", neutrons: 1, mass: 3.01603, halfLife: "Stable", stability: "stable", abundance: "~0.0001%", decay: null, decayEq: null, uses: ["Neutron detectors", "Sub‑1 K cryogenics", "Hypothetical aneutronic fusion"], details: "Rare on Earth; relatively abundant from solar wind deposits on the Moon — candidate fusion fuel concept." },
      { A: 4, name: "Helium-4", neutrons: 2, mass: 4.00260, halfLife: "Stable", stability: "stable", abundance: ">99.99%", decay: null, decayEq: null, uses: ["Balloons/airships", "Cryogenics (MRI, particle accelerators)", "Superfluidity"], details: "Alpha particle nucleus; dominant fusion product of stars; becomes a superfluid below 2.17 K." },
    ],
  },
  C: {
    protons: 6,
    isotopes: [
      { A: 12, name: "Carbon-12", neutrons: 6, mass: 12.000, halfLife: "Stable", stability: "stable", abundance: "~98.9%", decay: null, decayEq: null, uses: ["Atomic mass reference (one dalton = 1/12 mass of ¹²C)", "Organic chemistry backbone"], details: "Defines the mole and dalton convention; all relative atomic masses are referenced to one twelfth of ¹²C." },
      { A: 13, name: "Carbon-13", neutrons: 7, mass: 13.00335, halfLife: "Stable", stability: "stable", abundance: "~1.1%", decay: null, decayEq: null, uses: ["¹³C NMR", "Biochemical tracing", "Metabolic studies"], details: "The only stable carbon isotope with non-zero nuclear spin (I = 1/2); essential for structural NMR in organic chemistry." },
      { A: 14, name: "Carbon-14", neutrons: 8, mass: 14.00324, halfLife: "5,730 years", stability: "radioactive", decay: "β⁻", decayEq: "¹⁴C → ¹⁴N + e⁻ + ν̄ₑ", uses: ["Radiocarbon dating", "Archaeology", "Paleoclimatology"], details: "Produced cosmogenically via cosmic‑ray neutron capture on atmospheric ¹⁴N; usable for ages up to tens of thousands of years." },
    ],
  },
  N: {
    protons: 7,
    isotopes: [
      { A: 14, name: "Nitrogen-14", neutrons: 7, mass: 14.00307, halfLife: "Stable", stability: "stable", abundance: "99.64%", decay: null, decayEq: null, uses: ["~78% of the atmosphere by volume", "Fertilizers (NH₃)", "DNA, amino acids"], details: "The dominant terrestrial nitrogen nuclide; nuclear spin I = 1 permits ¹⁴N‑NMR (less common)." },
      { A: 15, name: "Nitrogen-15", neutrons: 8, mass: 15.00011, halfLife: "Stable", stability: "stable", abundance: "0.36%", decay: null, decayEq: null, uses: ["Isotope ecology", "Nutrient-cycle studies", "Advanced NMR techniques"], details: "Rare stable tracer for following nitrogen transformations in soils, ecosystems, and the atmosphere." },
    ],
  },
  O: {
    protons: 8,
    isotopes: [
      { A: 16, name: "Oxygen-16", neutrons: 8, mass: 15.99491, halfLife: "Stable", stability: "stable", abundance: "~99.76%", decay: null, decayEq: null, uses: ["Respiration", "Combustion", "Water"], details: "Dominant oxygen nuclide; produced plentifully via helium fusion pathways in stellar interiors." },
      { A: 17, name: "Oxygen-17", neutrons: 9, mass: 16.99913, halfLife: "Stable", stability: "stable", abundance: "0.04%", decay: null, decayEq: null, uses: ["¹⁷O NMR", "Geochemical tracers"], details: "The only stable oxygen isotope with non-zero nuclear spin (I = 5/2)." },
      { A: 18, name: "Oxygen-18", neutrons: 10, mass: 17.99916, halfLife: "Stable", stability: "stable", abundance: "0.20%", decay: null, decayEq: null, uses: ["Paleoclimate proxies (¹⁸O/¹⁶O)", "¹⁸F production for PET via ¹⁸O targets", "Hydrology"], details: "Elevated ratios in carbonate shells record colder glacial periods — a classic geological thermometer." },
    ],
  },
  F: {
    protons: 9,
    isotopes: [
      { A: 19, name: "Fluorine-19", neutrons: 10, mass: 18.99840, halfLife: "Stable", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["PTFE plastics", "Toothpastes (fluoride)", "Anesthetics (organofluorine)"], details: "Monoisotopic fluorine element — indispensable in modern polymers and pharmaceuticals." },
      { A: 18, name: "Fluorine-18", neutrons: 9, mass: 18.00094, halfLife: "109.77 min", stability: "radioactive", decay: "β⁺", decayEq: "¹⁸F → ¹⁸O + e⁺ + νₑ", uses: ["PET imaging (¹⁸F‑FDG)", "Tumour detection", "Brain imaging"], details: "Dominant tracer for positron emission tomography via glucose analogue fluorodeoxyglucose (FDG)." },
    ],
  },
  P: {
    protons: 15,
    isotopes: [
      { A: 31, name: "Phosphorus-31", neutrons: 16, mass: 30.97376, halfLife: "Stable", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["DNA & RNA backbone", "ATP biology", "Fertilisers"], details: "The lone stable phosphorus nuclide — central to life's energy bookkeeping." },
      { A: 32, name: "Phosphorus-32", neutrons: 17, mass: 31.97391, halfLife: "14.27 days", stability: "radioactive", decay: "β⁻", decayEq: "³²P → ³²S + e⁻ + ν̄ₑ", uses: ["Nucleotide labelling", "Medical therapy (classic)", "Gene expression studies"], details: "High-energy β⁻ emitter prized in molecular‑biology radiosynthesis." },
    ],
  },
  K: {
    protons: 19,
    isotopes: [
      { A: 39, name: "Potassium-39", neutrons: 20, mass: 38.96371, halfLife: "Stable", stability: "stable", abundance: "~93.3%", decay: null, decayEq: null, uses: ["Essential electrolyte", "Nerve impulses", "Fertilisers (KCl)"], details: "The main stable isotope of potassium." },
      { A: 40, name: "Potassium-40", neutrons: 21, mass: 39.96400, halfLife: "1.248 × 10⁹ years", stability: "weakly-radioactive", decay: "β⁻ / EC", decayEq: "⁴⁰K → ⁴⁰Ca + e⁻ + ν̄ₑ (89%)\n⁴⁰K + e⁻ → ⁴⁰Ar + νₑ (11%)", uses: ["K–Ar geological dating", "Natural background radiation", "Geothermal tracers"], details: "Naturally present in food and body tissues; dominates long-lived internal dose from primordial ⁴⁰K decay." },
      { A: 41, name: "Potassium-41", neutrons: 22, mass: 40.96183, halfLife: "Stable", stability: "stable", abundance: "~6.7%", decay: null, decayEq: null, uses: ["NMR probes", "Geochemistry"], details: "Minor stable isotopic partner alongside ³⁹K." },
    ],
  },
  Fe: {
    protons: 26,
    isotopes: [
      { A: 54, name: "Iron-54", neutrons: 28, mass: 53.93961, halfLife: "Stable", stability: "stable", abundance: "~5.8%", decay: null, decayEq: null, uses: ["Special alloys", "Nuclear-structure research"], details: "Minor-but-stable constituent of terrestrial iron reservoirs." },
      { A: 56, name: "Iron-56", neutrons: 30, mass: 55.93494, halfLife: "Stable", stability: "stable", abundance: ">90%", decay: null, decayEq: null, uses: ["Steel industry", "Oxygen carriers (haemoglobin)", "Fusion endpoint in stars"], details: "Ties for one of nature's most tightly bound nuclei per nucleon; massive stars forge an iron core before core-collapse explosions." },
      { A: 57, name: "Iron-57", neutrons: 31, mass: 56.93540, halfLife: "Stable", stability: "stable", abundance: "~2.1%", decay: null, decayEq: null, uses: ["Mössbauer spectroscopy", "Solid-state probes"], details: "Key nuclide for recoil-free gamma resonance spectroscopy experiments." },
      { A: 59, name: "Iron-59", neutrons: 33, mass: 58.93488, halfLife: "44.5 days", stability: "radioactive", decay: "β⁻", decayEq: "⁵⁹Fe → ⁵⁹Co + e⁻ + ν̄ₑ", uses: ["Metallurgical tagging", "Iron‑uptake physiology"], details: "Short-lived tracer for studying iron uptake and redistribution kinetics." },
    ],
  },
  Co: {
    protons: 27,
    isotopes: [
      { A: 59, name: "Cobalt-59", neutrons: 32, mass: 58.93320, halfLife: "Stable", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["Vitamin B₁₂", "High-temperature superalloys", "Cobalt blue pigments"], details: "Stable odd-proton cobalt nuclide; biologically leveraged by corrin enzymes." },
      { A: 60, name: "Cobalt-60", neutrons: 33, mass: 59.93382, halfLife: "5.271 years", stability: "radioactive", decay: "β⁻, γ", decayEq: "⁶⁰Co → ⁶⁰Ni + e⁻ + ν̄ₑ + 2γ", uses: ["Radiation therapy gamma knives", "Food & instrument sterilisation", "Industrial radiography"], details: "Intense paired γ-lines at 1.17 & 1.33 MeV make it ubiquitous in external‑beam irradiation setups." },
    ],
  },
  Sr: {
    protons: 38,
    isotopes: [
      { A: 88, name: "Strontium-88", neutrons: 50, mass: 87.90561, halfLife: "Stable", stability: "stable", abundance: "~83%", decay: null, decayEq: null, uses: ["Red flame pyrotechnics", "Permanent magnets (ceramic)"], details: "Major stable Sr isotopic component." },
      { A: 90, name: "Strontium-90", neutrons: 52, mass: 89.90773, halfLife: "28.8 years", stability: "radioactive", decay: "β⁻", decayEq: "⁹⁰Sr → ⁹⁰Y + e⁻ + ν̄ₑ", uses: ["RTG thermoelectric heat (legacy themes)", "Nuclear fallout signature"], details: "Bone-seeking alkaline-earth fission fragment that bioaccumulates in skeleton after atmospheric tests." },
    ],
  },
  Tc: {
    protons: 43,
    isotopes: [
      { A: 99, name: "Technetium‑99m", neutrons: 56, mass: 98.90625, halfLife: "6.01 hours", stability: "radioactive", decay: "IT (γ)", decayEq: "⁹⁹ᵐTc → ⁹⁹Tc + γ (≈140 keV)", uses: ["Dominant clinic radioisotope", "Bone/cardiac/renal scintigraphy", "Tens of millions of procedures/year"], details: "Metastable emitter with near-ideal gamma energy for sodium-iodide camera detection; favourable dosimetry from short halflife." },
      { A: 99, name: "Technetium‑99", neutrons: 56, mass: 98.90625, halfLife: "2.11 × 10⁵ years", stability: "radioactive", decay: "β⁻", decayEq: "⁹⁹Tc → ⁹⁹Ru + e⁻ + ν̄ₑ", uses: ["Fission inventories", "Detector calibration chores"], details: "Ground state of element 43 — famously the first artificially isolated element without any stable neighbours." },
    ],
  },
  I: {
    protons: 53,
    isotopes: [
      { A: 127, name: "Iodine-127", neutrons: 74, mass: 126.90447, halfLife: "Stable", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["Iodised salt", "Thyroid hormone synthesis", "Tincture disinfectant legacy"], details: "The single stable terrestrial iodine isotope underpinning mammalian iodothyronines." },
      { A: 131, name: "Iodine-131", neutrons: 78, mass: 130.90613, halfLife: "8.02 days", stability: "radioactive", decay: "β⁻, γ", decayEq: "¹³¹I → ¹³¹Xe + e⁻ + ν̄ₑ + γ", uses: ["Hyperthyroid ablation therapy", "Thyroid cancer treatment", "Thyroid diagnosis"], details: "Concentrates chemically in glandular iodine physiology; hallmark fission iodine monitored after reactor accidents." },
      { A: 123, name: "Iodine-123", neutrons: 70, mass: 122.90560, halfLife: "13.22 hours", stability: "radioactive", decay: "EC (γ)", decayEq: "¹²³I + e⁻ → ¹²³Te + νₑ + γ", uses: ["Thyroid SPECT", "Cerebral perfusion scans", "Lower β‑dose diagnostics"], details: "Photon-rich diagnostic alternative to ¹³¹I minimizing β‑strand dose when imaging suffices." },
    ],
  },
  Cs: {
    protons: 55,
    isotopes: [
      { A: 133, name: "Caesium‑133", neutrons: 78, mass: 132.90545, halfLife: "Stable", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["SI second definition backbone", "Global navigation satellites", "Communications clocks"], details: "Hyperfine transition frequency of¹³³Cs anchors the SI second through atomic fountain standards." },
      { A: 137, name: "Caesium‑137", neutrons: 82, mass: 136.90709, halfLife: "30.17 years", stability: "radioactive", decay: "β⁻, γ", decayEq: "¹³⁷Cs → ¹³⁷Ba + e⁻ + ν̄ₑ + γ", uses: ["Gauge calibration sealed sources", "Industrial radiometry", "Contamination fallout marker"], details: "Long-lived fallout vector after Chernobyl/Fukushima; infamous Goiania orphan-source incident illustration." },
    ],
  },
  Ra: {
    protons: 88,
    isotopes: [
      { A: 226, name: "Radium‑226", neutrons: 138, mass: 226.02541, halfLife: "1,600 years", stability: "radioactive", decay: "α", decayEq: "²²⁶Ra → ²²²Rn + ⁴He", uses: ["Historic luminous-paint pigments", "Brachytherapy (historical)", "Radon precursor chains"], details: "Curie's celebrated discovery emblem; industrially scaled before rad‑industrial hygiene existed." },
      { A: 228, name: "Radium‑228", neutrons: 140, mass: 228.03107, halfLife: "5.75 years", stability: "radioactive", decay: "β⁻", decayEq: "²²⁸Ra → ²²⁸Ac + e⁻ + ν̄ₑ", uses: ["Research geochemistry"], details: "Link nuclide in the²³²Th decay cascade." },
    ],
  },
  U: {
    protons: 92,
    isotopes: [
      { A: 234, name: "Uranium‑234", neutrons: 142, mass: 234.04095, halfLife: "2.45 × 10⁵ years", stability: "radioactive", decay: "α", decayEq: "²³⁴U → ²³⁰Th + ⁴He", uses: ["U–Th carbonate dating", "Marine geology"], details: "High specific activity descendant member still proportionally significant despite low mass fraction." },
      { A: 235, name: "Uranium‑235", neutrons: 143, mass: 235.04393, halfLife: "7.04 × 10⁸ years", stability: "radioactive", decay: "α", decayEq: "²³⁵U + n → fission + ~200 MeV", uses: ["Enriched reactor fuel", "Gun-type fission device (historic)", "Research reactors"], details: "The only naturally occurring nucleus readily sustaining thermal-neutron chain reactions without breeding." },
      { A: 238, name: "Uranium‑238", neutrons: 146, mass: 238.05079, halfLife: "4.47 × 10⁹ years", stability: "radioactive", decay: "α", decayEq: "²³⁸U → ²³⁴Th + ⁴He", uses: ["U–Pb geological dating", "Plutonium breeding in reactors", "Depleted uranium ballast/shielding"], details: "Dominant uranium isotope in nature; neutron capture cascades breed plutonium isotopes in irradiated reactors." },
    ],
  },
  Pu: {
    protons: 94,
    isotopes: [
      { A: 238, name: "Plutonium‑238", neutrons: 144, mass: 238.04956, halfLife: "87.7 years", stability: "radioactive", decay: "α", decayEq: "²³⁸Pu → ²³⁴U + ⁴He", uses: ["Spacecraft RTGs", "Lunar rover heat sources", "(Historic) cardiac pacemakers"], details: "Steady α-decay thermal power empowers deep-space voyager-class missions lacking sunlight." },
      { A: 239, name: "Plutonium‑239", neutrons: 145, mass: 239.05216, halfLife: "2.41 × 10⁴ years", stability: "radioactive", decay: "α", decayEq: "²³⁹Pu + n → fission + ~210 MeV", uses: ["MOX fuel recycling", "(Historic) Fat Man explosive core", "Fast reactors"], details: "Weapons‑grade concern once separated from spent fuel owing to neutron multiplication cross sections." },
      { A: 241, name: "Plutonium‑241", neutrons: 147, mass: 241.05685, halfLife: "14.3 years", stability: "radioactive", decay: "β⁻", decayEq: "²⁴¹Pu → ²⁴¹Am + e⁻ + ν̄ₑ", uses: ["Americium precursor for detectors", "Reactor neutron budgets"], details: "Feeds continuous growth of ambient ²⁴¹Am inventories used in ubiquitous smoke-detector capsules." },
    ],
  },
  Th: {
    protons: 90,
    isotopes: [
      { A: 232, name: "Thorium‑232", neutrons: 142, mass: 232.03806, halfLife: "1.40 × 10¹⁰ years", stability: "radioactive", decay: "α", decayEq: "²³²Th → ²²⁸Ra + ⁴He", uses: ["Thorium fuel-cycle studies", "(Historic) gas mantle carriers", "Molten‑salt breeder concepts"], details: "Roughly triple crustal prevalence vs uranium ore mass; breeder vision transmutes fertile²³²Th → fisile²³³U." },
      { A: 230, name: "Thorium‑230", neutrons: 140, mass: 230.03313, halfLife: "7.54 × 10⁴ years", stability: "radioactive", decay: "α", decayEq: "²³⁰Th → ²²⁶Ra + ⁴He", uses: ["U–Th carbonate geochronology"], details: "U-series dating nuclide for speleothems stretching back half‑million‑year horizons." },
    ],
  },
  Am: {
    protons: 95,
    isotopes: [
      { A: 241, name: "Americium‑241", neutrons: 146, mass: 241.05682, halfLife: "432 years", stability: "radioactive", decay: "α", decayEq: "²⁴¹Am → ²³⁷Np + ⁴He + γ", uses: ["Ionisation smoke detectors", "Moisture / density gauges", "Portable spectral sources"], details: "Tiny sealed α pellets ionise airflow for residential smoke alarms economically." },
    ],
  },
  Pb: {
    protons: 82,
    isotopes: [
      { A: 206, name: "Lead‑206", neutrons: 124, mass: 205.97447, halfLife: "Stable", stability: "stable", abundance: "~24%", decay: null, decayEq: null, uses: ["Geochronology (zircon U–Pb)", "Shielding", "Industrial alloys"], details: "Stable terminating branch of²³⁸U chains; Pb/U ratios date Earth formation eras." },
      { A: 207, name: "Lead‑207", neutrons: 125, mass: 206.97590, halfLife: "Stable", stability: "stable", abundance: "~22%", decay: null, decayEq: null, uses: ["Isochron Pb–Pb planetary dating"], details: "End member of²³⁵U decay scaffolding." },
      { A: 208, name: "Lead‑208", neutrons: 126, mass: 207.97665, halfLife: "Stable", stability: "stable", abundance: ">50%", decay: null, decayEq: null, uses: ["Radiation shields", "(Lead‑acid batteries)"], details: "Heavy doubly‑magic terrestrial endpoint (82p, 126n) from²³²Th decay chain ancestry." },
      { A: 210, name: "Lead‑210", neutrons: 128, mass: 209.98419, halfLife: "22.3 years", stability: "radioactive", decay: "β⁻", decayEq: "²¹⁰Pb → ²¹⁰Bi + e⁻ + ν̄ₑ", uses: ["Sedimentary geochronology", "Environmental monitoring"], details: "Atmospheric fallout proxy over human historical lake cores." },
    ],
  },
  Rn: {
    protons: 86,
    isotopes: [
      { A: 222, name: "Radon‑222", neutrons: 136, mass: 222.01758, halfLife: "3.82 days", stability: "radioactive", decay: "α", decayEq: "²²²Rn → ²¹⁸Po + ⁴He", uses: ["Geological fracture tracing hazard", "(Contested) spas"], details: "Colourless odourless α noble gas accumulating in inadequately ventilated basements; second-largest lung carcinoma risk factor after cigarettes." },
    ],
  },
  Po: {
    protons: 84,
    isotopes: [
      { A: 210, name: "Polonium‑210", neutrons: 126, mass: 209.98287, halfLife: "138 days", stability: "radioactive", decay: "α", decayEq: "²¹⁰Po → ²⁰⁶Pb + ⁴He", uses: ["Static eliminator brushes", "(Historic) lunar heat bricks", "(Infamous poisoning case study)"], details: "Ultra-high α toxicity per microgram ingestion; chemically traces tobacco smoke aerosols." },
    ],
  },
  Li: {
    protons: 3,
    isotopes: [
      { A: 6, name: "Lithium‑6", neutrons: 3, mass: 6.01512, halfLife: "Stable", stability: "stable", abundance: "~7.6%", decay: null, decayEq: null, uses: ["Tritium breeder targets", "(Thermonuclear arsenals)", "(Special) naval batteries legacy"], details: "Captures neutrons spawning tritium: ⁶Li + n → ⁴He + ³H." },
      { A: 7, name: "Lithium‑7", neutrons: 4, mass: 7.01601, halfLife: "Stable", stability: "stable", abundance: ">92%", decay: null, decayEq: null, uses: ["Li‑ion rechargeable cells", "(Psychiatric carbonate)", "Technical ceramics blends"], details: "Primordial Big Bang nuclideo alongside elemental H & He inventory." },
    ],
  },
  Ca: {
    protons: 20,
    isotopes: [
      { A: 40, name: "Calcium‑40", neutrons: 20, mass: 39.96259, halfLife: "Stable", stability: "stable", abundance: ">97%", decay: null, decayEq: null, uses: ["Bones/teeth scaffolding", "Muscle signalling", "Cement geology"], details: "Doubly magic (20p,20n) crustal scaffolding element." },
      { A: 48, name: "Calcium‑48", neutrons: 28, mass: 47.95253, halfLife: "6.4 × 10¹⁹ years", stability: "weakly-radioactive", abundance: "~0.19%", decay: "ββ⁻", decayEq: "⁴⁸Ca → ⁴⁸Ti + 2e⁻ + 2ν̄ₑ", uses: ["Superheavy element projectile beams", "(Rare) accelerator targets"], details: "Expensive neutron-rich doubly‑magic slug that enabled synthesis campaigns up to Og." },
    ],
  },
};
if (typeof window !== "undefined") window.ISOTOPE_DATA = ISOTOPE_DATA_EN;
