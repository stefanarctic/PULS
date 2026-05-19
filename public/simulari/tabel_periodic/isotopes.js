const ISOTOPE_DATA = {
  H: {
    protons: 1,
    isotopes: [
      { A: 1, name: "Protiu", neutrons: 0, mass: 1.00783, halfLife: "Stabil", stability: "stable", abundance: "99,985%", decay: null, decayEq: null, uses: ["Apa obișnuită", "Compuși organici", "Combustibil stelar"], details: "Cel mai simplu și abundent izotop din univers. Nucleul conține un singur proton, fără neutroni." },
      { A: 2, name: "Deuteriu", neutrons: 1, mass: 2.01410, halfLife: "Stabil", stability: "stable", abundance: "0,015%", decay: null, decayEq: null, uses: ["Apă grea (D₂O) în reactoare CANDU", "Spectroscopie RMN", "Fuziune nucleară (viitor)"], details: "Izotop stabil cu un neutron. Apa grea (D₂O) este folosită ca moderator de neutroni în reactoarele nucleare." },
      { A: 3, name: "Tritiu", neutrons: 2, mass: 3.01605, halfLife: "12,32 ani", stability: "radioactive", abundance: "urme", decay: "β⁻", decayEq: "³H → ³He + e⁻ + ν̄ₑ", uses: ["Fuziune nucleară (D-T)", "Semne luminoase (exit)", "Trasori biologici"], details: "Izotop radioactiv produs în reactoare. Emite radiație beta de energie joasă. Esențial pentru reacția de fuziune deuteriu-tritiu." }
    ]
  },
  He: {
    protons: 2,
    isotopes: [
      { A: 3, name: "Heliu-3", neutrons: 1, mass: 3.01603, halfLife: "Stabil", stability: "stable", abundance: "0,0001%", decay: null, decayEq: null, uses: ["Detectori de neutroni", "Criogenie sub 1 K", "Fuziune anetrică (teoretic)"], details: "Izotop extrem de rar pe Pământ, dar abundent pe Lună (vânt solar). Candidat pentru fuziune nucleară curată." },
      { A: 4, name: "Heliu-4", neutrons: 2, mass: 4.00260, halfLife: "Stabil", stability: "stable", abundance: "99,9999%", decay: null, decayEq: null, uses: ["Baloane și dirijabile", "Criogenie (RMN, LHC)", "Superfluiditate"], details: "Particulă alfa. Produs principal al fuziunii în stele. La 2,17 K devine superfluid — curgere fără fricțiune." }
    ]
  },
  C: {
    protons: 6,
    isotopes: [
      { A: 12, name: "Carbon-12", neutrons: 6, mass: 12.000, halfLife: "Stabil", stability: "stable", abundance: "98,93%", decay: null, decayEq: null, uses: ["Standard de masă atomică (1 u = 1/12 din ¹²C)", "Baza chimiei organice"], details: "Izotopul de referință pentru unitatea de masă atomică. Toate masele atomice sunt raportate la 1/12 din masa lui ¹²C." },
      { A: 13, name: "Carbon-13", neutrons: 7, mass: 13.00335, halfLife: "Stabil", stability: "stable", abundance: "1,07%", decay: null, decayEq: null, uses: ["Spectroscopie ¹³C-RMN", "Trasori în biochimie", "Studii metabolice"], details: "Singurul izotop stabil al carbonului cu spin nuclear nenul (I = 1/2), esențial pentru RMN în chimia organică." },
      { A: 14, name: "Carbon-14", neutrons: 8, mass: 14.00324, halfLife: "5730 ani", stability: "radioactive", decay: "β⁻", decayEq: "¹⁴C → ¹⁴N + e⁻ + ν̄ₑ", uses: ["Datare cu radiocarbon", "Arheologie", "Paleoclimatologie"], details: "Produs continuu în atmosferă prin ciocnirea neutronilor cosmici cu ¹⁴N. Metoda de datare (Willard Libby, 1949) funcționează până la ~50 000 ani." }
    ]
  },
  N: {
    protons: 7,
    isotopes: [
      { A: 14, name: "Azot-14", neutrons: 7, mass: 14.00307, halfLife: "Stabil", stability: "stable", abundance: "99,636%", decay: null, decayEq: null, uses: ["78% din atmosferă", "Îngrășăminte (NH₃)", "Aminoacizi, ADN"], details: "Izotopul dominant al azotului. Are spin nuclear I = 1, folosit în ¹⁴N-RMN." },
      { A: 15, name: "Azot-15", neutrons: 8, mass: 15.00011, halfLife: "Stabil", stability: "stable", abundance: "0,364%", decay: null, decayEq: null, uses: ["Trasori isotopici în ecologie", "Studii de ciclul azotului", "Spectroscopie RMN avansată"], details: "Izotop stabil rar, folosit ca trasor pentru a urmări transformările azotului în sol, plante și atmosferă." }
    ]
  },
  O: {
    protons: 8,
    isotopes: [
      { A: 16, name: "Oxigen-16", neutrons: 8, mass: 15.99491, halfLife: "Stabil", stability: "stable", abundance: "99,757%", decay: null, decayEq: null, uses: ["Respirație", "Ardere", "Apă"], details: "Izotopul dominant al oxigenului, produs în stele prin fuziunea heliului (procesul alfa triplu + faza de ardere a carbonului)." },
      { A: 17, name: "Oxigen-17", neutrons: 9, mass: 16.99913, halfLife: "Stabil", stability: "stable", abundance: "0,038%", decay: null, decayEq: null, uses: ["¹⁷O-RMN", "Trasori în geochimie"], details: "Singurul izotop stabil al oxigenului cu spin nuclear nenul (I = 5/2)." },
      { A: 18, name: "Oxigen-18", neutrons: 10, mass: 17.99916, halfLife: "Stabil", stability: "stable", abundance: "0,205%", decay: null, decayEq: null, uses: ["Paleoclimatologie (raport ¹⁸O/¹⁶O)", "PET scan (¹⁸F din ¹⁸O)", "Studii hidrologice"], details: "Raportul ¹⁸O/¹⁶O din fosile marine este un termometru al climei antice — mai mult ¹⁸O indică epoci glaciare." }
    ]
  },
  F: {
    protons: 9,
    isotopes: [
      { A: 19, name: "Fluor-19", neutrons: 10, mass: 18.99840, halfLife: "Stabil", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["Teflon (PTFE)", "Pasta de dinți (fluorură)", "Anestezice"], details: "Singurul izotop stabil al fluorului. Element monoisotopic." },
      { A: 18, name: "Fluor-18", neutrons: 9, mass: 18.00094, halfLife: "109,77 min", stability: "radioactive", decay: "β⁺", decayEq: "¹⁸F → ¹⁸O + e⁺ + νₑ", uses: ["PET scan (FDG)", "Detectarea cancerului", "Imagistică cerebrală"], details: "Cel mai important radioizotop pentru tomografia cu emisie de pozitroni (PET). Fluorodeoxiglucoza (FDG) marcată cu ¹⁸F arată metabolismul glucozei în tumori." }
    ]
  },
  P: {
    protons: 15,
    isotopes: [
      { A: 31, name: "Fosfor-31", neutrons: 16, mass: 30.97376, halfLife: "Stabil", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["ADN și ARN", "ATP (energie celulară)", "Îngrășăminte"], details: "Singurul izotop stabil. Element esențial pentru viață — prezent în oase, ADN, ATP." },
      { A: 32, name: "Fosfor-32", neutrons: 17, mass: 31.97391, halfLife: "14,27 zile", stability: "radioactive", decay: "β⁻", decayEq: "³²P → ³²S + e⁻ + ν̄ₑ", uses: ["Marcaj ADN în biologie moleculară", "Tratament policitemie vera", "Cercetare genetică"], details: "Emitent beta puternic folosit în laboratoarele de biologie moleculară pentru marcarea acizilor nucleici." }
    ]
  },
  K: {
    protons: 19,
    isotopes: [
      { A: 39, name: "Potasiu-39", neutrons: 20, mass: 38.96371, halfLife: "Stabil", stability: "stable", abundance: "93,258%", decay: null, decayEq: null, uses: ["Nutrient esențial", "Funcția nervoasă", "Îngrășăminte (KCl)"], details: "Izotopul dominant al potasiului." },
      { A: 40, name: "Potasiu-40", neutrons: 21, mass: 39.96400, halfLife: "1,248 × 10⁹ ani", stability: "weakly-radioactive", decay: "β⁻ / EC", decayEq: "⁴⁰K → ⁴⁰Ca + e⁻ + ν̄ₑ (89%)\n⁴⁰K + e⁻ → ⁴⁰Ar + νₑ (11%)", uses: ["Datare K-Ar (geologie)", "Sursă naturală de radiație", "Geotermometru"], details: "Prezent în banane, cartofi, corpul uman. Responsabil pentru ~0,01% din radiația naturală la care suntem expuși. Metoda de datare K-Ar este esențială în geologie." },
      { A: 41, name: "Potasiu-41", neutrons: 22, mass: 40.96183, halfLife: "Stabil", stability: "stable", abundance: "6,730%", decay: null, decayEq: null, uses: ["RMN în cercetare", "Geochimie"], details: "Al doilea izotop stabil al potasiului." }
    ]
  },
  Fe: {
    protons: 26,
    isotopes: [
      { A: 54, name: "Fier-54", neutrons: 28, mass: 53.93961, halfLife: "Stabil", stability: "stable", abundance: "5,845%", decay: null, decayEq: null, uses: ["Aliaje speciale", "Cercetare nucleară"], details: "Izotop stabil minor al fierului." },
      { A: 56, name: "Fier-56", neutrons: 30, mass: 55.93494, halfLife: "Stabil", stability: "stable", abundance: "91,754%", decay: null, decayEq: null, uses: ["Oțel și construcții", "Hemoglobina (transport O₂)", "Miezul stelelor masive"], details: "Nucleul cu cea mai mare energie de legătură pe nucleon. Stelele masive formează un miez de ⁵⁶Fe înainte de colaps (supernovă). Este punctul final al fuziunii stelare." },
      { A: 57, name: "Fier-57", neutrons: 31, mass: 56.93540, halfLife: "Stabil", stability: "stable", abundance: "2,119%", decay: null, decayEq: null, uses: ["Spectroscopie Mössbauer", "Studii de stare solidă"], details: "Izotopul-cheie pentru efectul Mössbauer — absorbția rezonantă de raze gamma fără pierdere de energie prin recul." },
      { A: 59, name: "Fier-59", neutrons: 33, mass: 58.93488, halfLife: "44,5 zile", stability: "radioactive", decay: "β⁻", decayEq: "⁵⁹Fe → ⁵⁹Co + e⁻ + ν̄ₑ", uses: ["Trasori în metalurgie", "Studii de absorbție a fierului"], details: "Radioizotop folosit pentru a studia metabolismul fierului în corp și uzura pieselor metalice." }
    ]
  },
  Co: {
    protons: 27,
    isotopes: [
      { A: 59, name: "Cobalt-59", neutrons: 32, mass: 58.93320, halfLife: "Stabil", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["Vitamina B₁₂", "Aliaje rezistente la temperatură", "Pigmenți (albastru cobalt)"], details: "Singurul izotop stabil al cobaltului." },
      { A: 60, name: "Cobalt-60", neutrons: 33, mass: 59.93382, halfLife: "5,271 ani", stability: "radioactive", decay: "β⁻, γ", decayEq: "⁶⁰Co → ⁶⁰Ni + e⁻ + ν̄ₑ + 2γ", uses: ["Radioterapie (cancer)", "Sterilizare alimente/instrumente", "Gamagrafie industrială"], details: "Unul dintre cele mai importante radioizotopi. Emite doi fotoni gamma (1,17 și 1,33 MeV). Folosit intens în tratamentul cancerului prin iradiere externă." }
    ]
  },
  Sr: {
    protons: 38,
    isotopes: [
      { A: 88, name: "Stronțiu-88", neutrons: 50, mass: 87.90561, halfLife: "Stabil", stability: "stable", abundance: "82,58%", decay: null, decayEq: null, uses: ["Fejeroacuri (flacără roșie)", "Magneți ceramici"], details: "Izotopul dominant al stronțiului." },
      { A: 90, name: "Stronțiu-90", neutrons: 52, mass: 89.90773, halfLife: "28,8 ani", stability: "radioactive", decay: "β⁻", decayEq: "⁹⁰Sr → ⁹⁰Y + e⁻ + ν̄ₑ", uses: ["Generator termoelectric (RTG)", "Indicador de testele nucleare"], details: "Produs de fisiune nucleară. Periculos deoarece se acumulează în oase (înlocuiește calciul). Marker al testelor nucleare atmosferice." }
    ]
  },
  Tc: {
    protons: 43,
    isotopes: [
      { A: 99, name: "Technețiu-99m", neutrons: 56, mass: 98.90625, halfLife: "6,01 ore", stability: "radioactive", decay: "IT (γ)", decayEq: "⁹⁹ᵐTc → ⁹⁹Tc + γ (140 keV)", uses: ["Cel mai utilizat radioizotop medical", "Scintigrafie osoasă/cardiacă/renală", "~30 milioane proceduri/an"], details: "Starea metastabilă (m) a ⁹⁹Tc. Energia gamma de 140 keV este ideală pentru detectare cu gamma camera. Timp de înjumătățire scurt = doză mică pentru pacient." },
      { A: 99, name: "Technețiu-99", neutrons: 56, mass: 98.90625, halfLife: "2,11 × 10⁵ ani", stability: "radioactive", decay: "β⁻", decayEq: "⁹⁹Tc → ⁹⁹Ru + e⁻ + ν̄ₑ", uses: ["Produs de fisiune nucleară", "Calibrare detectori"], details: "Starea fundamentală. Primul element artificial produs (1937, Segrè și Perrier). Technețiul nu are niciun izotop stabil." }
    ]
  },
  I: {
    protons: 53,
    isotopes: [
      { A: 127, name: "Iod-127", neutrons: 74, mass: 126.90447, halfLife: "Stabil", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["Sare iodată", "Funcția tiroidiană", "Dezinfectant (tinctură de iod)"], details: "Singurul izotop stabil al iodului. Esențial pentru producerea hormonilor tiroidieni (T₃ și T₄)." },
      { A: 131, name: "Iod-131", neutrons: 78, mass: 130.90613, halfLife: "8,02 zile", stability: "radioactive", decay: "β⁻, γ", decayEq: "¹³¹I → ¹³¹Xe + e⁻ + ν̄ₑ + γ", uses: ["Tratament hipertiroidism", "Tratament cancer tiroidian", "Diagnostic tiroidian"], details: "Se concentrează natural în tiroidă. Folosit atât diagnostic (doză mică) cât și terapeutic (doză mare) pentru afecțiunile tiroidiene. Produs de fisiune — risc după accidente nucleare." },
      { A: 123, name: "Iod-123", neutrons: 70, mass: 122.90560, halfLife: "13,22 ore", stability: "radioactive", decay: "EC (γ)", decayEq: "¹²³I + e⁻ → ¹²³Te + νₑ + γ", uses: ["SPECT tiroidian", "Imagistică cerebrală", "Diagnostic fără radiație β"], details: "Preferabil față de ¹³¹I pentru diagnostic deoarece emite doar gamma (159 keV), fără radiație beta — doză mai mică pentru pacient." }
    ]
  },
  Cs: {
    protons: 55,
    isotopes: [
      { A: 133, name: "Cesiu-133", neutrons: 78, mass: 132.90545, halfLife: "Stabil", stability: "stable", abundance: "100%", decay: null, decayEq: null, uses: ["Definiția secundei (ceas atomic)", "GPS", "Telecomunicații"], details: "Definiția SI a secundei: 9 192 631 770 oscilații ale tranziției hiperfine a ¹³³Cs. Baza ceasurilor atomice care fac GPS-ul posibil." },
      { A: 137, name: "Cesiu-137", neutrons: 82, mass: 136.90709, halfLife: "30,17 ani", stability: "radioactive", decay: "β⁻, γ", decayEq: "¹³⁷Cs → ¹³⁷Ba + e⁻ + ν̄ₑ + γ", uses: ["Calibrare instrumente nucleare", "Gamagrafie industrială", "Indicator contaminare nucleară"], details: "Produs major de fisiune. Responsabil pentru contaminarea de lungă durată după Cernobîl și Fukushima. Accidentul de la Goiânia (1987) — sursă de ¹³⁷Cs abandonată." }
    ]
  },
  Ra: {
    protons: 88,
    isotopes: [
      { A: 226, name: "Radiu-226", neutrons: 138, mass: 226.02541, halfLife: "1600 ani", stability: "radioactive", decay: "α", decayEq: "²²⁶Ra → ²²²Rn + ⁴He", uses: ["Istoric: cadrane luminoase", "Brahiterapie (istoric)", "Sursă de radon"], details: "Descoperit de Marie și Pierre Curie (1898). Primul izotop studiat intens. Fetele cu radiu (Radium Girls) — tragedia muncitoarelor care pictau cadranele." },
      { A: 228, name: "Radiu-228", neutrons: 140, mass: 228.03107, halfLife: "5,75 ani", stability: "radioactive", decay: "β⁻", decayEq: "²²⁸Ra → ²²⁸Ac + e⁻ + ν̄ₑ", uses: ["Cercetare științifică", "Geochimie"], details: "Parte din seria de dezintegrare a toriului-232." }
    ]
  },
  U: {
    protons: 92,
    isotopes: [
      { A: 234, name: "Uraniu-234", neutrons: 142, mass: 234.04095, halfLife: "2,45 × 10⁵ ani", stability: "radioactive", decay: "α", decayEq: "²³⁴U → ²³⁰Th + ⁴He", uses: ["Datare U-Th (corali, stalactite)", "Oceanografie"], details: "Deși e un produs de dezintegrare, contribuie semnificativ la radioactivitatea uraniului natural datorită activității specifice ridicate." },
      { A: 235, name: "Uraniu-235", neutrons: 143, mass: 235.04393, halfLife: "7,04 × 10⁸ ani", stability: "radioactive", decay: "α", decayEq: "²³⁵U + n → fisiune → ~200 MeV", uses: ["Combustibil nuclear (îmbogățit)", "Bomba atomică (Little Boy)", "Reactoare de cercetare"], details: "Singurul izotop fisil natural — poate susține o reacție în lanț. Concentrație naturală: 0,72%. Trebuie îmbogățit la 3-5% pentru centrale, >90% pentru arme." },
      { A: 238, name: "Uraniu-238", neutrons: 146, mass: 238.05079, halfLife: "4,47 × 10⁹ ani", stability: "radioactive", decay: "α", decayEq: "²³⁸U → ²³⁴Th + ⁴He", uses: ["Datare U-Pb (vârsta Pământului)", "Sursa de Pu-239 în reactoare", "Blindaje și contragreutăți (DU)"], details: "Izotopul dominant (99,27%). Fertil, nu fisil: captează un neutron și devine ²³⁹Pu prin dezintegrare beta. Seria sa de dezintegrare produce radon (²²²Rn)." }
    ]
  },
  Pu: {
    protons: 94,
    isotopes: [
      { A: 238, name: "Plutoniu-238", neutrons: 144, mass: 238.04956, halfLife: "87,7 ani", stability: "radioactive", decay: "α", decayEq: "²³⁸Pu → ²³⁴U + ⁴He", uses: ["Generatoare termoelectrice (RTG)", "Sonde spațiale (Voyager, Curiosity)", "Stimulatoare cardiace (istoric)"], details: "Sursă ideală de energie pentru misiuni spațiale. Căldura din dezintegrare alfa este convertită în electricitate. Voyager 1 și 2 funcționează cu ²³⁸Pu din 1977." },
      { A: 239, name: "Plutoniu-239", neutrons: 145, mass: 239.05216, halfLife: "2,41 × 10⁴ ani", stability: "radioactive", decay: "α", decayEq: "²³⁹Pu + n → fisiune → ~210 MeV", uses: ["Combustibil nuclear (MOX)", "Arme nucleare (Fat Man)", "Reactoare rapide"], details: "Produs în reactoare din ²³⁸U. Fisil — masa critică ~10 kg. Bomba de la Nagasaki (Fat Man) a folosit ²³⁹Pu. Unul dintre cele mai toxice materiale (inhalare)." },
      { A: 241, name: "Plutoniu-241", neutrons: 147, mass: 241.05685, halfLife: "14,3 ani", stability: "radioactive", decay: "β⁻", decayEq: "²⁴¹Pu → ²⁴¹Am + e⁻ + ν̄ₑ", uses: ["Sursă de americiu-241", "Combustibil nuclear"], details: "Se dezintegrează în ²⁴¹Am, care este folosit în detectoarele de fum." }
    ]
  },
  Th: {
    protons: 90,
    isotopes: [
      { A: 232, name: "Toriu-232", neutrons: 142, mass: 232.03806, halfLife: "1,40 × 10¹⁰ ani", stability: "radioactive", decay: "α", decayEq: "²³²Th → ²²⁸Ra + ⁴He", uses: ["Combustibil nuclear (viitor)", "Mantale de lampă cu gaz (istoric)", "Reactoare cu săruri topite"], details: "De 3-4 ori mai abundent decât uraniul. Fertil: poate fi transformat în ²³³U (fisil). Ciclul toriului produce mai puține deșeuri transuraniene." },
      { A: 230, name: "Toriu-230", neutrons: 140, mass: 230.03313, halfLife: "7,54 × 10⁴ ani", stability: "radioactive", decay: "α", decayEq: "²³⁰Th → ²²⁶Ra + ⁴He", uses: ["Datare U-Th (corali)", "Geochimie"], details: "Produs de dezintegrare a ²³⁴U. Important pentru datarea formațiunilor carbonatice (corali, speoteme) până la ~500 000 ani." }
    ]
  },
  Am: {
    protons: 95,
    isotopes: [
      { A: 241, name: "Americiu-241", neutrons: 146, mass: 241.05682, halfLife: "432,2 ani", stability: "radioactive", decay: "α", decayEq: "²⁴¹Am → ²³⁷Np + ⁴He + γ", uses: ["Detectoare de fum (ionizare)", "Sonde de umiditate/densitate", "Surse portabile gamma"], details: "Prezent în aproape toate detectoarele de fum ionice. Cantitatea (~0,3 μg) este inofensivă dar suficientă pentru a ioniza aerul și detecta fumul." }
    ]
  },
  Pb: {
    protons: 82,
    isotopes: [
      { A: 206, name: "Plumb-206", neutrons: 124, mass: 205.97447, halfLife: "Stabil", stability: "stable", abundance: "24,1%", decay: null, decayEq: null, uses: ["Datare U-Pb (zircon)", "Geologie", "Protecție radiații"], details: "Produsul final stabil al seriei de dezintegrare a ²³⁸U. Raportul ²⁰⁶Pb/²³⁸U din cristale de zircon a dat vârsta Pământului: 4,54 × 10⁹ ani." },
      { A: 207, name: "Plumb-207", neutrons: 125, mass: 206.97590, halfLife: "Stabil", stability: "stable", abundance: "22,1%", decay: null, decayEq: null, uses: ["Datare Pb-Pb", "Spectroscopie RMN (²⁰⁷Pb)"], details: "Produsul final stabil al seriei de dezintegrare a ²³⁵U." },
      { A: 208, name: "Plumb-208", neutrons: 126, mass: 207.97665, halfLife: "Stabil", stability: "stable", abundance: "52,4%", decay: null, decayEq: null, uses: ["Protecție împotriva radiațiilor", "Baterii auto"], details: "Produsul final stabil al seriei de dezintegrare a ²³²Th. Cel mai greu nucleu dublu magic stabil (Z=82, N=126)." },
      { A: 210, name: "Plumb-210", neutrons: 128, mass: 209.98419, halfLife: "22,2 ani", stability: "radioactive", decay: "β⁻", decayEq: "²¹⁰Pb → ²¹⁰Bi + e⁻ + ν̄ₑ", uses: ["Datare sedimente recente", "Oceanografie", "Studii de poluare"], details: "Folosit pentru datarea sedimentelor depuse în ultimii ~150 ani (lacuri, mări). Se depune din atmosferă (provine din radon)." }
    ]
  },
  Rn: {
    protons: 86,
    isotopes: [
      { A: 222, name: "Radon-222", neutrons: 136, mass: 222.01758, halfLife: "3,82 zile", stability: "radioactive", decay: "α", decayEq: "²²²Rn → ²¹⁸Po + ⁴He", uses: ["Indicator de falii geologice", "Risc sănătate (cancer pulmonar)", "Terapie balneară (controversat)"], details: "Gaz nobil radioactiv, incolor și inodor. A doua cauză de cancer pulmonar (după fumat). Se acumulează în subsoluri și clădiri. Provine din dezintegrarea radiului din sol." }
    ]
  },
  Po: {
    protons: 84,
    isotopes: [
      { A: 210, name: "Poloniu-210", neutrons: 126, mass: 209.98287, halfLife: "138,4 zile", stability: "radioactive", decay: "α", decayEq: "²¹⁰Po → ²⁰⁶Pb + ⁴He", uses: ["Eliminare electricitate statică", "Sursă de căldură (sonde lunare)", "Otrăvire (Alexander Litvinenko, 2006)"], details: "Descoperit de Marie Curie (1898), numit după Polonia. Extrem de toxic — 1 μg poate fi letal. Emite doar alfa (greu de detectat). Prezent în fumul de țigară." }
    ]
  },
  Li: {
    protons: 3,
    isotopes: [
      { A: 6, name: "Litiu-6", neutrons: 3, mass: 6.01512, halfLife: "Stabil", stability: "stable", abundance: "7,59%", decay: null, decayEq: null, uses: ["Producere de tritiu (reactoare)", "Bomba cu hidrogen", "Baterii nucleare"], details: "Absorbe neutroni pentru a produce tritiu: ⁶Li + n → ⁴He + ³H. Esențial pentru armele termonucleare." },
      { A: 7, name: "Litiu-7", neutrons: 4, mass: 7.01601, halfLife: "Stabil", stability: "stable", abundance: "92,41%", decay: null, decayEq: null, uses: ["Baterii Li-ion", "Tratament bipolar (carbonat de litiu)", "Ceramice"], details: "Izotopul dominant. Litiul este cel mai ușor metal, produs în Big Bang alături de hidrogen și heliu." }
    ]
  },
  Ca: {
    protons: 20,
    isotopes: [
      { A: 40, name: "Calciu-40", neutrons: 20, mass: 39.96259, halfLife: "Stabil", stability: "stable", abundance: "96,941%", decay: null, decayEq: null, uses: ["Oase și dinți", "Contracție musculară", "Materiale de construcție"], details: "Nucleu dublu magic (Z=20, N=20). Al 5-lea element ca abundență în scoarța terestră." },
      { A: 48, name: "Calciu-48", neutrons: 28, mass: 47.95253, halfLife: "6,4 × 10¹⁹ ani", stability: "weakly-radioactive", abundance: "0,187%", decay: "ββ⁻", decayEq: "⁴⁸Ca → ⁴⁸Ti + 2e⁻ + 2ν̄ₑ", uses: ["Sinteză elemente supragrele", "Fizică nucleară", "Fascicule de ioni"], details: "Dublu magic (Z=20, N=28). Folosit ca proiectil pentru sintetizarea elementelor 113–118 (nihonium → oganesson). Extrem de scump (~$200 000/g)." }
    ]
  }
};

const ISOTOPE_ELEMENT_ORDER = [
  "H", "He", "Li", "C", "N", "O", "F", "P", "K", "Ca",
  "Fe", "Co", "Sr", "Tc", "I", "Cs", "Pb", "Rn", "Po", "Ra", "Th", "U", "Pu", "Am"
];

if (typeof window !== "undefined") window.ISOTOPE_DATA = ISOTOPE_DATA;
