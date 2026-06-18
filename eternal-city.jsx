import { useState, useEffect, useRef } from "react";

/* ============================================================
   ETERNAL CITY — prototype
   Draft 5 city-eras. Survive 10 trials. Last 1,000 years.
   ============================================================ */

// ---------- palette ----------
const C = {
  ink: "#14181F",        // night sky over the old city
  raised: "#1D232E",     // raised slab
  slab: "#242B38",       // card slab
  line: "#39424F",       // hairline
  marble: "#EAE5D8",     // marble white
  dim: "#9BA3AE",        // weathered text
  gold: "#C9A554",       // aged gold
  goldSoft: "#8A7440",
  verdigris: "#6FA08C",  // bronze patina
  blood: "#A8523F",      // collapse
};

const DISPLAY = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const CAPS = { fontFamily: DISPLAY, textTransform: "uppercase", letterSpacing: "0.18em" };

// ---------- eras & regions ----------
const ERAS = [
  { key: "ancient", label: "Ancient", range: "before 500" },
  { key: "medieval", label: "Medieval", range: "500–1300" },
  { key: "renaissance", label: "Renaissance", range: "1300–1600" },
  { key: "earlymodern", label: "Early Modern", range: "1600–1800" },
  { key: "industrial", label: "Industrial", range: "1800–1900" },
  { key: "early20", label: "Early 20th C.", range: "1900–1950" },
  { key: "postwar", label: "Postwar", range: "1950–2000" },
  { key: "contemporary", label: "Contemporary", range: "2000–today" },
];
const REGIONS = {
  WE: "Western Europe",
  SEU: "Southern Europe",
  CEE: "Central & Eastern Europe",
  CN: "China & Taiwan",
  JK: "Japan & Korea",
  SAS: "South Asia",
  SEA: "Southeast Asia",
  MEC: "Middle East & Central Asia",
  NAF: "North Africa",
  WAF: "West & Central Africa",
  EAF: "East & Southern Africa",
  NAM: "North America",
  LAM: "Latin America",
};

const STAT_KEYS = ["scale", "wealth", "culture", "knowledge", "might"];
const STAT_LABELS = ["Scale", "Wealth", "Culture", "Knowledge", "Might"];
const STAT_SHORT = ["SCL", "WLT", "CUL", "KNW", "MGT"];

// ---------- city-era cards: [scale, wealth, culture, knowledge, might] ----------
// >>> CITY DATA START (managed by csv-to-data.mjs — edit eternal-city-cards.csv instead)
const CITIES = [
  { name: "Rome", ep: "Imperial", era: "ancient", region: "SEU", s: [97, 90, 88, 80, 99], tag: "A million souls; all roads lead here." },
  { name: "Athens", ep: "Classical", era: "ancient", region: "SEU", s: [60, 68, 96, 98, 72], tag: "Philosophy, drama, and democracy from one harbor town." },
  { name: "Syracuse", ep: "Greek Sicily", era: "ancient", region: "SEU", s: [58, 72, 78, 84, 74], tag: "Archimedes' hometown — rich, brilliant, hard to besiege." },
  { name: "Chang'an", ep: "Han", era: "ancient", region: "CN", s: [88, 80, 76, 80, 92], tag: "Eastern terminus of the Silk Road." },
  { name: "Luoyang", ep: "Han", era: "ancient", region: "CN", s: [80, 72, 74, 80, 84], tag: "Nine dynasties called it capital." },
  { name: "Pataliputra", ep: "Mauryan", era: "ancient", region: "SAS", s: [90, 80, 74, 84, 92], tag: "Ashoka's seat — among the largest cities on Earth." },
  { name: "Anuradhapura", ep: "Sinhalese", era: "ancient", region: "SAS", s: [62, 64, 72, 76, 66], tag: "Sacred stupas and vast reservoir engineering." },
  { name: "Alexandria", ep: "Ptolemaic", era: "ancient", region: "NAF", s: [86, 86, 88, 99, 74], tag: "The Library, the Lighthouse, the world's knowledge." },
  { name: "Babylon", ep: "Neo-Babylonian", era: "ancient", region: "MEC", s: [84, 80, 84, 86, 86], tag: "Hanging gardens, astronomy, the first metropolis." },
  { name: "Carthage", ep: "Punic", era: "ancient", region: "NAF", s: [76, 93, 72, 68, 86], tag: "Merchant empire that nearly broke Rome." },
  { name: "Persepolis", ep: "Achaemenid", era: "ancient", region: "MEC", s: [55, 86, 82, 70, 93], tag: "Ceremonial heart of the first world empire." },
  { name: "Teotihuacan", ep: "Classic", era: "ancient", region: "LAM", s: [82, 72, 82, 72, 86], tag: "The Avenue of the Dead, planned on a grand grid." },
  { name: "Monte Albán", ep: "Zapotec", era: "ancient", region: "LAM", s: [55, 55, 70, 66, 70], tag: "Mountaintop capital of the Zapotec world." },
  { name: "Meroë", ep: "Kushite", era: "ancient", region: "EAF", s: [52, 66, 62, 64, 70], tag: "Iron-smelting royal city of pyramids on the Nile." },
  { name: "Aksum", ep: "Aksumite", era: "ancient", region: "EAF", s: [56, 80, 64, 66, 76], tag: "Trading empire minting its own gold coin." },
  { name: "Sparta", ep: "Lacedaemon", era: "ancient", region: "SEU", s: [42, 40, 52, 48, 90], tag: "No walls. The men are the walls." },
  { name: "Corinth", ep: "Isthmian", era: "ancient", region: "SEU", s: [52, 78, 68, 58, 64], tag: "Toll booth of two seas." },
  { name: "Linzi", ep: "Qi", era: "ancient", region: "CN", s: [70, 76, 62, 70, 68], tag: "Teeming capital of the Warring States' richest kingdom." },
  { name: "Chengdu", ep: "Shu", era: "ancient", region: "CN", s: [58, 66, 64, 62, 56], tag: "Brocade city behind the mountains." },
  { name: "Taxila", ep: "Gandharan", era: "ancient", region: "SAS", s: [48, 60, 70, 86, 58], tag: "Crossroads university where Greek met Buddhist." },
  { name: "Madurai", ep: "Pandyan", era: "ancient", region: "SAS", s: [52, 60, 74, 58, 56], tag: "Temple city of Tamil poets." },
  { name: "Memphis", ep: "Egyptian", era: "ancient", region: "NAF", s: [62, 62, 76, 72, 66], tag: "Balance of the Two Lands." },
  { name: "Jerusalem", ep: "Second Temple", era: "ancient", region: "MEC", s: [46, 46, 82, 74, 50], tag: "Small city, vast gravity." },
  { name: "Napata", ep: "Kushite", era: "ancient", region: "EAF", s: [38, 48, 54, 50, 58], tag: "Holy mountain seat of the Black Pharaohs." },
  { name: "Adulis", ep: "Red Sea", era: "ancient", region: "EAF", s: [36, 62, 44, 42, 46], tag: "Aksum's window on the sea." },
  { name: "El Mirador", ep: "Preclassic Maya", era: "ancient", region: "LAM", s: [52, 46, 58, 56, 60], tag: "Pyramids bigger than anything the Maya built after." },
  { name: "Caral", ep: "Norte Chico", era: "ancient", region: "LAM", s: [34, 38, 46, 44, 38], tag: "The Americas' first city — older than Giza." },
  { name: "Constantinople", ep: "Byzantine", era: "medieval", region: "SEU", s: [92, 93, 90, 86, 93], tag: "The Queen of Cities behind triple walls." },
  { name: "Córdoba", ep: "Umayyad", era: "medieval", region: "SEU", s: [82, 82, 90, 95, 78], tag: "Europe's greatest library while Paris was mud streets." },
  { name: "Venice", ep: "Maritime Republic", era: "medieval", region: "SEU", s: [70, 93, 80, 74, 82], tag: "A republic of merchants rising from a lagoon." },
  { name: "Paris", ep: "Capetian", era: "medieval", region: "WE", s: [76, 72, 82, 90, 78], tag: "The Sorbonne makes it Christendom's classroom." },
  { name: "Chang'an", ep: "Tang", era: "medieval", region: "CN", s: [99, 90, 93, 88, 95], tag: "A million people, a grid of wards, the world's crossroads." },
  { name: "Kaifeng", ep: "Song", era: "medieval", region: "CN", s: [96, 95, 86, 91, 82], tag: "Gunpowder, paper money, restaurants open all night." },
  { name: "Hangzhou", ep: "Southern Song", era: "medieval", region: "CN", s: [95, 96, 91, 88, 76], tag: "Marco Polo called it the finest city in the world." },
  { name: "Kyoto", ep: "Heian", era: "medieval", region: "JK", s: [80, 70, 93, 82, 68], tag: "The Tale of Genji's refined court." },
  { name: "Angkor", ep: "Khmer", era: "medieval", region: "SEA", s: [94, 80, 89, 76, 88], tag: "The largest preindustrial city ever built." },
  { name: "Delhi", ep: "Sultanate", era: "medieval", region: "SAS", s: [82, 80, 76, 78, 88], tag: "Fortress capital astride the Indian plains." },
  { name: "Baghdad", ep: "Abbasid", era: "medieval", region: "MEC", s: [95, 92, 91, 99, 90], tag: "The House of Wisdom; the round city of the caliphs." },
  { name: "Cairo", ep: "Fatimid", era: "medieval", region: "NAF", s: [88, 90, 84, 90, 85], tag: "Al-Azhar and a thousand minarets." },
  { name: "Merv", ep: "Seljuk", era: "medieval", region: "MEC", s: [90, 85, 76, 88, 78], tag: "Briefly the largest city on Earth — then the Mongols came." },
  { name: "Kilwa", ep: "Swahili Coast", era: "medieval", region: "EAF", s: [56, 88, 70, 70, 62], tag: "Gold, ivory, and coral palaces on the Indian Ocean." },
  { name: "Great Zimbabwe", ep: "Shona", era: "medieval", region: "EAF", s: [52, 74, 58, 52, 68], tag: "Stone walls without mortar; hub of the gold trade." },
  { name: "Cahokia", ep: "Mississippian", era: "medieval", region: "NAM", s: [48, 52, 55, 50, 62], tag: "Mound city larger than the London of its day." },
  { name: "Tikal", ep: "Maya", era: "medieval", region: "LAM", s: [62, 58, 72, 74, 70], tag: "Pyramids above the canopy; astronomy in stone." },
  { name: "Palermo", ep: "Norman", era: "medieval", region: "SEU", s: [62, 74, 84, 82, 70], tag: "Three faiths, one dazzling court." },
  { name: "Novgorod", ep: "Republic", era: "medieval", region: "CEE", s: [48, 76, 60, 58, 62], tag: "Merchant republic at the edge of the forest." },
  { name: "Nara", ep: "Imperial", era: "medieval", region: "JK", s: [54, 52, 80, 70, 48], tag: "The Great Buddha and Japan's first permanent capital." },
  { name: "Pagan", ep: "Bagan", era: "medieval", region: "SEA", s: [62, 58, 82, 66, 62], tag: "Ten thousand temples on a dry plain." },
  { name: "Polonnaruwa", ep: "Sinhalese", era: "medieval", region: "SAS", s: [50, 56, 66, 62, 58], tag: "Reservoirs like inland seas." },
  { name: "Damascus", ep: "Ayyubid", era: "medieval", region: "MEC", s: [70, 78, 80, 82, 76], tag: "Oldest city still arguing about it." },
  { name: "Fez", ep: "Idrisid", era: "medieval", region: "NAF", s: [58, 70, 78, 86, 60], tag: "Home of the world's oldest university." },
  { name: "Lalibela", ep: "Zagwe", era: "medieval", region: "EAF", s: [34, 40, 76, 54, 46], tag: "Churches carved down into living rock." },
  { name: "Mogadishu", ep: "Sultanate", era: "medieval", region: "EAF", s: [46, 72, 58, 54, 50], tag: "Ports, poets, and ocean trade." },
  { name: "Chichén Itzá", ep: "Maya-Toltec", era: "medieval", region: "LAM", s: [58, 60, 76, 72, 68], tag: "The serpent descends the steps each equinox." },
  { name: "Chan Chan", ep: "Chimú", era: "medieval", region: "LAM", s: [56, 58, 60, 50, 62], tag: "Largest adobe city ever raised." },
  { name: "Florence", ep: "Medici", era: "renaissance", region: "SEU", s: [60, 92, 99, 93, 70], tag: "A banking fortune turned into the Renaissance." },
  { name: "Venice", ep: "La Serenissima", era: "renaissance", region: "SEU", s: [78, 97, 93, 86, 86], tag: "Half empire, half art gallery, all merchant." },
  { name: "Lisbon", ep: "Age of Discovery", era: "renaissance", region: "SEU", s: [72, 93, 76, 82, 86], tag: "Spice fleets redraw the map of the world." },
  { name: "Seville", ep: "Golden Age", era: "renaissance", region: "SEU", s: [76, 94, 80, 72, 80], tag: "Every galleon of American silver lands here." },
  { name: "Beijing", ep: "Ming", era: "renaissance", region: "CN", s: [98, 88, 88, 86, 95], tag: "The Forbidden City at the heart of the largest state on Earth." },
  { name: "Nanjing", ep: "Early Ming", era: "renaissance", region: "CN", s: [92, 86, 82, 84, 90], tag: "Treasure fleets launched from its yards." },
  { name: "Vijayanagara", ep: "City of Victory", era: "renaissance", region: "SAS", s: [93, 89, 86, 78, 90], tag: "Diamond markets and granite temples; travelers' jaws dropped." },
  { name: "Malacca", ep: "Sultanate", era: "renaissance", region: "SEA", s: [60, 95, 72, 66, 70], tag: "The strait where every trade wind meets." },
  { name: "Istanbul", ep: "Ottoman", era: "renaissance", region: "MEC", s: [95, 92, 91, 85, 97], tag: "The Conqueror's capital, bridging two continents." },
  { name: "Samarkand", ep: "Timurid", era: "renaissance", region: "MEC", s: [70, 86, 87, 91, 85], tag: "Registan blue; Ulugh Beg's observatory." },
  { name: "Cairo", ep: "Mamluk", era: "renaissance", region: "NAF", s: [88, 90, 85, 86, 82], tag: "Slave-soldiers ruling the richest crossroads on Earth." },
  { name: "Timbuktu", ep: "Songhai", era: "renaissance", region: "WAF", s: [60, 86, 80, 91, 66], tag: "Books worth more than gold in the desert." },
  { name: "Benin City", ep: "Edo Kingdom", era: "renaissance", region: "WAF", s: [62, 72, 84, 60, 76], tag: "Bronze masterworks and miles of earthen walls." },
  { name: "Tenochtitlan", ep: "Aztec", era: "renaissance", region: "LAM", s: [92, 82, 86, 76, 93], tag: "A city on a lake that stunned the conquistadors." },
  { name: "Cusco", ep: "Inca", era: "renaissance", region: "LAM", s: [70, 76, 80, 72, 90], tag: "Navel of the world, knot of ten thousand roads." },
  { name: "Antwerp", ep: "Golden Age", era: "renaissance", region: "WE", s: [62, 93, 74, 70, 58], tag: "Half of world trade through one harbor." },
  { name: "Nuremberg", ep: "Free City", era: "renaissance", region: "CEE", s: [50, 76, 80, 82, 58], tag: "Dürer's workshop; the printing boom's machine shop." },
  { name: "Kyoto", ep: "Muromachi", era: "renaissance", region: "JK", s: [70, 62, 88, 72, 50], tag: "Zen gardens amid the warring states." },
  { name: "Hangzhou", ep: "Ming", era: "renaissance", region: "CN", s: [80, 82, 78, 72, 56], tag: "Still lovely, no longer the center." },
  { name: "Agra", ep: "Early Mughal", era: "renaissance", region: "SAS", s: [70, 78, 80, 68, 84], tag: "A dynasty finding its grandeur." },
  { name: "Pegu", ep: "Burmese", era: "renaissance", region: "SEA", s: [52, 70, 62, 52, 64], tag: "Gilded port the Portuguese marveled at." },
  { name: "Tabriz", ep: "Silk Road", era: "renaissance", region: "MEC", s: [62, 80, 80, 76, 70], tag: "Carpet looms and caravanserais." },
  { name: "Aleppo", ep: "Crossroads", era: "renaissance", region: "MEC", s: [60, 82, 70, 62, 64], tag: "Where the caravans changed hands." },
  { name: "Gao", ep: "Songhai", era: "renaissance", region: "WAF", s: [56, 72, 58, 66, 72], tag: "Imperial capital on the Niger bend." },
  { name: "Mbanza Kongo", ep: "Kongo", era: "renaissance", region: "WAF", s: [42, 48, 56, 46, 60], tag: "Seat of the manikongo." },
  { name: "Cholula", ep: "Sacred", era: "renaissance", region: "LAM", s: [46, 50, 68, 56, 52], tag: "The widest pyramid on Earth." },
  { name: "Quito", ep: "Northern Inca", era: "renaissance", region: "LAM", s: [44, 48, 54, 48, 62], tag: "The empire's second city, high in the clouds." },
  { name: "Amsterdam", ep: "Dutch Golden Age", era: "earlymodern", region: "WE", s: [70, 99, 86, 91, 80], tag: "The first stock exchange; Rembrandt upstairs." },
  { name: "London", ep: "Georgian", era: "earlymodern", region: "WE", s: [94, 96, 89, 92, 95], tag: "Coffeehouses, the Royal Society, an empire's ledger." },
  { name: "Paris", ep: "Enlightenment", era: "earlymodern", region: "WE", s: [92, 90, 97, 96, 92], tag: "Salons where the modern world got argued into being." },
  { name: "Vienna", ep: "Habsburg", era: "earlymodern", region: "CEE", s: [72, 76, 93, 88, 86], tag: "Mozart and Haydn on retainer." },
  { name: "St. Petersburg", ep: "Imperial", era: "earlymodern", region: "CEE", s: [72, 76, 86, 82, 88], tag: "A capital willed out of a swamp by a tsar." },
  { name: "Edo", ep: "Tokugawa", era: "earlymodern", region: "JK", s: [99, 86, 92, 80, 88], tag: "A million people in the world's largest city — at peace." },
  { name: "Beijing", ep: "Qing", era: "earlymodern", region: "CN", s: [97, 88, 85, 82, 94], tag: "The Qianlong zenith." },
  { name: "Kyoto", ep: "Edo-period", era: "earlymodern", region: "JK", s: [78, 72, 94, 82, 58], tag: "Old capital of temples, weavers, and tea." },
  { name: "Guangzhou", ep: "Canton Trade", era: "earlymodern", region: "CN", s: [82, 93, 72, 70, 70], tag: "The one door through which the West met China." },
  { name: "Delhi", ep: "Mughal", era: "earlymodern", region: "SAS", s: [94, 92, 90, 82, 94], tag: "The Peacock Throne: 'if there is paradise on earth…'" },
  { name: "Ayutthaya", ep: "Siamese", era: "earlymodern", region: "SEA", s: [72, 86, 80, 66, 76], tag: "Island capital that traders compared to Paris." },
  { name: "Istanbul", ep: "Tulip Era", era: "earlymodern", region: "MEC", s: [92, 88, 86, 80, 90], tag: "Imperial confidence in full bloom." },
  { name: "Isfahan", ep: "Safavid", era: "earlymodern", region: "MEC", s: [85, 86, 95, 85, 88], tag: "'Isfahan is half the world.'" },
  { name: "Potosí", ep: "Silver Mountain", era: "earlymodern", region: "LAM", s: [80, 97, 55, 50, 58], tag: "The mine that bankrolled an empire." },
  { name: "Mexico City", ep: "Viceregal", era: "earlymodern", region: "LAM", s: [76, 84, 80, 76, 78], tag: "Crossroads of two oceans' trade." },
  { name: "Philadelphia", ep: "Revolutionary", era: "earlymodern", region: "NAM", s: [52, 70, 72, 82, 72], tag: "Franklin's town; a constitution drafted here." },
  { name: "Kano", ep: "Hausa", era: "earlymodern", region: "WAF", s: [52, 72, 58, 60, 64], tag: "Walled emporium of the Saharan trade." },
  { name: "Gondar", ep: "Ethiopian", era: "earlymodern", region: "EAF", s: [46, 56, 68, 62, 68], tag: "Castle city of the highlands." },
  { name: "Madrid", ep: "Siglo de Oro", era: "earlymodern", region: "SEU", s: [70, 72, 86, 72, 86], tag: "Velázquez at court, Cervantes in print." },
  { name: "Naples", ep: "Bourbon", era: "earlymodern", region: "SEU", s: [82, 66, 82, 68, 64], tag: "Italy's biggest, loudest, hungriest city." },
  { name: "Osaka", ep: "Merchant", era: "earlymodern", region: "JK", s: [80, 90, 78, 66, 52], tag: "The nation's kitchen — rice futures invented here." },
  { name: "Nagasaki", ep: "Dejima", era: "earlymodern", region: "JK", s: [40, 70, 56, 68, 40], tag: "Japan's one window on the world." },
  { name: "Madras", ep: "Company Port", era: "earlymodern", region: "SAS", s: [48, 70, 56, 58, 62], tag: "Fort St. George and the trade winds." },
  { name: "Batavia", ep: "VOC", era: "earlymodern", region: "SEA", s: [48, 82, 54, 58, 66], tag: "A spice empire's counting house." },
  { name: "Cairo", ep: "Ottoman", era: "earlymodern", region: "NAF", s: [80, 78, 76, 72, 66], tag: "Past its peak, still the Nile's metropolis." },
  { name: "Marrakesh", ep: "Saadian", era: "earlymodern", region: "NAF", s: [54, 66, 74, 62, 68], tag: "Red city of the western caravans." },
  { name: "Lima", ep: "City of Kings", era: "earlymodern", region: "LAM", s: [58, 80, 72, 70, 72], tag: "Viceregal splendor on the Pacific." },
  { name: "Boston", ep: "Colonial", era: "earlymodern", region: "NAM", s: [42, 64, 64, 78, 58], tag: "Sermons, smugglers, and a tea problem." },
  { name: "Mombasa", ep: "Swahili", era: "earlymodern", region: "EAF", s: [40, 62, 52, 46, 56], tag: "Fort Jesus guards the harbor." },
  { name: "Antananarivo", ep: "Merina", era: "earlymodern", region: "EAF", s: [40, 46, 54, 44, 60], tag: "Highland capital of the great red island." },
  { name: "London", ep: "Victorian", era: "industrial", region: "WE", s: [99, 99, 92, 95, 99], tag: "The metropolis: a quarter of humanity ruled from here." },
  { name: "Paris", ep: "Haussmann", era: "industrial", region: "WE", s: [95, 92, 99, 95, 92], tag: "Boulevards, salons, and the century's art capital." },
  { name: "Vienna", ep: "Fin-de-siècle", era: "industrial", region: "CEE", s: [88, 85, 97, 96, 87], tag: "Klimt, Freud, Mahler — one coffeehouse apart." },
  { name: "Berlin", ep: "Gründerzeit", era: "industrial", region: "CEE", s: [88, 88, 87, 95, 92], tag: "Electricity, chemistry, and a new empire's swagger." },
  { name: "Manchester", ep: "Cottonopolis", era: "industrial", region: "WE", s: [80, 91, 64, 84, 68], tag: "The first industrial city — soot, steam, the future." },
  { name: "St. Petersburg", ep: "Tsarist", era: "industrial", region: "CEE", s: [85, 82, 93, 88, 89], tag: "Tolstoy's drawing rooms, Mendeleev's table." },
  { name: "Tokyo", ep: "Meiji", era: "industrial", region: "JK", s: [92, 86, 85, 89, 90], tag: "From shogunate to world power in one generation." },
  { name: "Shanghai", ep: "Treaty Port", era: "industrial", region: "CN", s: [85, 90, 78, 72, 66], tag: "The Bund rises where empires trade." },
  { name: "Calcutta", ep: "Raj", era: "industrial", region: "SAS", s: [90, 90, 86, 84, 82], tag: "Second city of the Empire; the Bengal Renaissance." },
  { name: "Bombay", ep: "Gateway", era: "industrial", region: "SAS", s: [85, 90, 78, 76, 74], tag: "Cotton, railways, and a harbor full of the world." },
  { name: "Cairo", ep: "Khedival", era: "industrial", region: "NAF", s: [76, 78, 77, 72, 70], tag: "Paris on the Nile, built on cotton and debt." },
  { name: "Istanbul", ep: "Tanzimat", era: "industrial", region: "MEC", s: [85, 80, 82, 74, 80], tag: "An old empire reinventing itself at the strait." },
  { name: "New York", ep: "Gilded Age", era: "industrial", region: "NAM", s: [96, 98, 88, 88, 84], tag: "Bridges, skyscrapers, and money that never sleeps." },
  { name: "Chicago", ep: "World's Fair", era: "industrial", region: "NAM", s: [88, 92, 82, 86, 72], tag: "Inventor of the skyline." },
  { name: "Buenos Aires", ep: "Belle Époque", era: "industrial", region: "LAM", s: [80, 89, 84, 76, 70], tag: "Richer per head than Paris, and dressed like it." },
  { name: "Rio de Janeiro", ep: "Imperial", era: "industrial", region: "LAM", s: [74, 80, 80, 70, 74], tag: "A tropical court between mountains and sea." },
  { name: "Zanzibar", ep: "Sultanate", era: "industrial", region: "EAF", s: [55, 84, 66, 56, 64], tag: "Cloves, dhows, and the Indian Ocean's bazaar." },
  { name: "Cape Town", ep: "Colonial", era: "industrial", region: "EAF", s: [56, 72, 62, 66, 68], tag: "Tavern of the seas at the foot of Table Mountain." },
  { name: "Osaka", ep: "Meiji", era: "industrial", region: "JK", s: [76, 86, 68, 72, 60], tag: "Smokestacks over the merchant city." },
  { name: "Hong Kong", ep: "Colonial", era: "industrial", region: "CN", s: [52, 80, 58, 58, 54], tag: "'A barren rock,' they said." },
  { name: "Madras", ep: "Presidency", era: "industrial", region: "SAS", s: [62, 70, 62, 64, 58], tag: "Southern anchor of the Raj." },
  { name: "Rangoon", ep: "Colonial", era: "industrial", region: "SEA", s: [56, 76, 60, 56, 54], tag: "Rice port of the East." },
  { name: "Beirut", ep: "Nahda", era: "industrial", region: "MEC", s: [44, 66, 76, 72, 44], tag: "The Arab renaissance, in print." },
  { name: "Alexandria", ep: "Cosmopolitan", era: "industrial", region: "NAF", s: [60, 80, 74, 66, 54], tag: "Cotton money and Mediterranean swagger." },
  { name: "Boston", ep: "Brahmin", era: "industrial", region: "NAM", s: [62, 78, 80, 88, 58], tag: "Universities, abolitionists, and old money." },
  { name: "San Francisco", ep: "Gold Rush", era: "industrial", region: "NAM", s: [50, 84, 68, 62, 50], tag: "Instant city of fortune-seekers." },
  { name: "Lagos", ep: "Colonial Port", era: "industrial", region: "WAF", s: [40, 60, 50, 42, 44], tag: "A lagoon town starting to boom." },
  { name: "Freetown", ep: "Krio", era: "industrial", region: "WAF", s: [32, 46, 54, 56, 42], tag: "Founded by the freed; a university before most colonies." },
  { name: "Paris", ep: "Années Folles", era: "early20", region: "WE", s: [90, 88, 99, 95, 72], tag: "Picasso, Stein, Josephine Baker — everyone came." },
  { name: "London", ep: "Imperial Twilight", era: "early20", region: "WE", s: [95, 95, 90, 92, 96], tag: "Still the world's banker, soon its survivor." },
  { name: "Berlin", ep: "Weimar", era: "early20", region: "CEE", s: [90, 84, 97, 96, 58], tag: "Cabaret, cinema, and physics rewriting reality." },
  { name: "Vienna", ep: "1900", era: "early20", region: "CEE", s: [85, 78, 96, 98, 60], tag: "Freud, Wittgenstein, Schiele — one ring road." },
  { name: "Moscow", ep: "Soviet", era: "early20", region: "CEE", s: [88, 74, 86, 88, 95], tag: "Avant-garde in the morning, five-year plans by night." },
  { name: "Shanghai", ep: "Jazz Age", era: "early20", region: "CN", s: [85, 92, 90, 78, 52], tag: "Paris of the East, spy capital of Asia." },
  { name: "Tokyo", ep: "Imperial", era: "early20", region: "JK", s: [95, 87, 85, 87, 92], tag: "Rebuilt from earthquake into a world capital." },
  { name: "Bombay", ep: "Interwar", era: "early20", region: "SAS", s: [86, 86, 84, 76, 72], tag: "Mills, movie studios, and the independence press." },
  { name: "Calcutta", ep: "Late Raj", era: "early20", region: "SAS", s: [85, 82, 87, 82, 70], tag: "Tagore's Nobel and a ferment of ideas." },
  { name: "Cairo", ep: "Golden Age", era: "early20", region: "NAF", s: [82, 78, 90, 76, 72], tag: "Umm Kulthum on the radio; cinema for the whole Arab world." },
  { name: "Istanbul", ep: "Republican", era: "early20", region: "MEC", s: [72, 66, 78, 72, 66], tag: "An imperial capital learning to be a city." },
  { name: "New York", ep: "Jazz Age", era: "early20", region: "NAM", s: [99, 99, 97, 94, 93], tag: "Skyline, swing, and the capital of the 20th century." },
  { name: "Chicago", ep: "Roaring", era: "early20", region: "NAM", s: [90, 91, 88, 85, 74], tag: "Jazz, gangsters, and architecture worth the trouble." },
  { name: "Los Angeles", ep: "Hollywood", era: "early20", region: "NAM", s: [80, 86, 95, 78, 68], tag: "The dream factory invents global celebrity." },
  { name: "Mexico City", ep: "Muralist", era: "early20", region: "LAM", s: [82, 76, 91, 78, 74], tag: "Rivera and Kahlo paint a revolution." },
  { name: "Havana", ep: "Prewar", era: "early20", region: "LAM", s: [58, 76, 86, 62, 55], tag: "Rum, rumba, and neon over the Malecón." },
  { name: "Buenos Aires", ep: "Tango", era: "early20", region: "LAM", s: [85, 88, 90, 79, 74], tag: "Borges in the cafés, tango in the streets." },
  { name: "Johannesburg", ep: "Gold Rush", era: "early20", region: "EAF", s: [64, 84, 60, 62, 60], tag: "Instant city atop the world's richest reef." },
  { name: "Addis Ababa", ep: "Imperial", era: "early20", region: "EAF", s: [48, 52, 60, 54, 68], tag: "Highland capital that faced down empires." },
  { name: "Zurich", ep: "Neutral", era: "early20", region: "CEE", s: [40, 80, 70, 84, 42], tag: "Dada in the café, Einstein in the patent office." },
  { name: "Madrid", ep: "Silver Age", era: "early20", region: "SEU", s: [62, 60, 80, 72, 58], tag: "Lorca's generation, before the storm." },
  { name: "Osaka", ep: "Taishō", era: "early20", region: "JK", s: [80, 85, 72, 72, 60], tag: "Japan's Manchester — briefly its largest city." },
  { name: "Harbin", ep: "Railway", era: "early20", region: "CN", s: [50, 62, 66, 56, 48], tag: "Russian cupolas in Manchuria." },
  { name: "Singapore", ep: "Crown Colony", era: "early20", region: "SEA", s: [50, 80, 58, 58, 62], tag: "Crossroads of the East." },
  { name: "Rangoon", ep: "Interwar", era: "early20", region: "SEA", s: [55, 72, 62, 55, 52], tag: "Wealthiest city in Southeast Asia, for a moment." },
  { name: "Beirut", ep: "Mandate", era: "early20", region: "MEC", s: [44, 64, 76, 72, 40], tag: "Presses, universities, and a sea breeze." },
  { name: "Tehran", ep: "Pahlavi", era: "early20", region: "MEC", s: [54, 56, 62, 58, 64], tag: "An old capital paved in a hurry." },
  { name: "Dakar", ep: "Federal", era: "early20", region: "WAF", s: [40, 54, 62, 58, 50], tag: "Capital of French West Africa." },
  { name: "Lagos", ep: "Boomtown", era: "early20", region: "WAF", s: [46, 58, 56, 46, 46], tag: "The lagoon city gathers speed." },
  { name: "London", ep: "Swinging", era: "postwar", region: "WE", s: [92, 94, 97, 92, 90], tag: "Beatles next door, banks downstairs." },
  { name: "Paris", ep: "Trente Glorieuses", era: "postwar", region: "WE", s: [90, 90, 94, 92, 85], tag: "New Wave cinema and old-world primacy." },
  { name: "Berlin", ep: "Divided", era: "postwar", region: "CEE", s: [74, 70, 92, 86, 68], tag: "A wall through the middle; Bowie on both sides." },
  { name: "Moscow", ep: "Superpower", era: "postwar", region: "CEE", s: [92, 76, 85, 93, 97], tag: "Sputnik's hometown." },
  { name: "Tokyo", ep: "Bubble", era: "postwar", region: "JK", s: [99, 99, 93, 95, 84], tag: "The future, available at street level." },
  { name: "Hong Kong", ep: "Boomtown", era: "postwar", region: "CN", s: [86, 97, 92, 84, 66], tag: "Kung fu cinema and a skyline built on trade." },
  { name: "Seoul", ep: "Miracle", era: "postwar", region: "JK", s: [90, 90, 82, 86, 78], tag: "From rubble to chaebol in a generation." },
  { name: "Mumbai", ep: "Bollywood", era: "postwar", region: "SAS", s: [95, 86, 93, 78, 74], tag: "A film industry bigger than Hollywood, by volume." },
  { name: "Singapore", ep: "Tiger", era: "postwar", region: "SEA", s: [70, 95, 72, 86, 72], tag: "From swamp port to first world in one lifetime." },
  { name: "Cairo", ep: "Nasserist", era: "postwar", region: "NAF", s: [90, 72, 86, 72, 76], tag: "Voice of the Arabs on every radio." },
  { name: "Beirut", ep: "Riviera", era: "postwar", region: "MEC", s: [60, 82, 88, 76, 52], tag: "Banking by day, cabaret by night — until it wasn't." },
  { name: "New York", ep: "Capital of Culture", era: "postwar", region: "NAM", s: [96, 98, 99, 94, 90], tag: "Hip-hop, punk, Wall Street, MoMA — pick any two." },
  { name: "Los Angeles", ep: "Entertainment", era: "postwar", region: "NAM", s: [92, 93, 98, 87, 72], tag: "Hollywood, aerospace, the car-built dream." },
  { name: "San Francisco", ep: "Counterculture", era: "postwar", region: "NAM", s: [70, 86, 93, 94, 64], tag: "Summer of Love to Silicon Valley." },
  { name: "Detroit", ep: "Motown", era: "postwar", region: "NAM", s: [72, 86, 92, 80, 60], tag: "The sound of young America, built on the assembly line." },
  { name: "Mexico City", ep: "Mid-century", era: "postwar", region: "LAM", s: [94, 80, 86, 78, 74], tag: "Olympics, muralists' heirs, a megacity rising." },
  { name: "São Paulo", ep: "Industrial", era: "postwar", region: "LAM", s: [92, 86, 82, 74, 68], tag: "Brazil's engine room." },
  { name: "Lagos", ep: "Fela's", era: "postwar", region: "WAF", s: [84, 74, 89, 64, 66], tag: "Afrobeat invented at the Shrine." },
  { name: "Kinshasa", ep: "Rumba", era: "postwar", region: "WAF", s: [78, 58, 86, 54, 60], tag: "Rumble in the Jungle; soundtrack by Franco." },
  { name: "Milan", ep: "Design Capital", era: "postwar", region: "SEU", s: [70, 88, 90, 78, 56], tag: "Fashion week, furniture fairs, La Scala." },
  { name: "Stockholm", ep: "Model", era: "postwar", region: "CEE", s: [54, 82, 76, 86, 56], tag: "The middle way, well furnished." },
  { name: "Osaka", ep: "Expo '70", era: "postwar", region: "JK", s: [85, 88, 76, 78, 58], tag: "The future visited Kansai." },
  { name: "Taipei", ep: "Tiger", era: "postwar", region: "CN", s: [70, 84, 72, 80, 64], tag: "Night markets and microchips." },
  { name: "Bangkok", ep: "Boom", era: "postwar", region: "SEA", s: [80, 76, 80, 62, 62], tag: "Canals to expressways in a generation." },
  { name: "Jakarta", ep: "Rising", era: "postwar", region: "SEA", s: [85, 66, 70, 58, 66], tag: "Ten million stories at once." },
  { name: "Tehran", ep: "Pre-'79", era: "postwar", region: "MEC", s: [74, 80, 72, 68, 72], tag: "Oil money and a restless boulevard." },
  { name: "Tel Aviv", ep: "Bauhaus", era: "postwar", region: "MEC", s: [50, 72, 76, 82, 60], tag: "The white city by the sea." },
  { name: "Miami", ep: "Vice", era: "postwar", region: "NAM", s: [58, 76, 80, 54, 46], tag: "Neon, cocaine cowboys, and Cuban coffee." },
  { name: "Abidjan", ep: "Miracle", era: "postwar", region: "WAF", s: [56, 68, 62, 52, 50], tag: "Pearl of the lagoons." },
  { name: "Nairobi", ep: "Green City", era: "postwar", region: "EAF", s: [54, 60, 58, 60, 52], tag: "Safari capital, conference town." },
  { name: "London", ep: "Global", era: "contemporary", region: "WE", s: [95, 98, 96, 94, 91], tag: "Finance, theatre, and two hundred languages." },
  { name: "Paris", ep: "21st-Century", era: "contemporary", region: "WE", s: [92, 92, 95, 92, 87], tag: "Still the world's idea of a city." },
  { name: "Berlin", ep: "Reunified", era: "contemporary", region: "CEE", s: [82, 84, 93, 90, 76], tag: "Cheap rent (once), endless night, art everywhere." },
  { name: "Tokyo", ep: "Reiwa", era: "contemporary", region: "JK", s: [99, 95, 94, 95, 84], tag: "The biggest city ever built, running on time." },
  { name: "Shanghai", ep: "Boom", era: "contemporary", region: "CN", s: [98, 96, 86, 90, 84], tag: "A skyline that didn't exist in 1990." },
  { name: "Beijing", ep: "Rising", era: "contemporary", region: "CN", s: [97, 93, 87, 94, 96], tag: "Olympic host and superpower capital." },
  { name: "Seoul", ep: "Hallyu", era: "contemporary", region: "JK", s: [95, 93, 96, 93, 80], tag: "K-pop, K-drama, K-everything." },
  { name: "Shenzhen", ep: "Hardware", era: "contemporary", region: "CN", s: [95, 95, 72, 94, 74], tag: "Fishing village to tech megacity in 40 years." },
  { name: "Mumbai", ep: "Maximum City", era: "contemporary", region: "SAS", s: [98, 90, 92, 80, 78], tag: "Bollywood, billionaires, and dabbawalas." },
  { name: "Singapore", ep: "Smart City", era: "contemporary", region: "SEA", s: [76, 97, 78, 92, 74], tag: "The best-run square miles on Earth." },
  { name: "Dubai", ep: "Vertical", era: "contemporary", region: "MEC", s: [72, 93, 72, 70, 70], tag: "A skyline conjured from sand and ambition." },
  { name: "Istanbul", ep: "Megacity", era: "contemporary", region: "MEC", s: [95, 87, 89, 80, 82], tag: "Fifteen million people between two seas." },
  { name: "Cairo", ep: "Umm al-Dunya", era: "contemporary", region: "NAF", s: [96, 74, 84, 72, 76], tag: "Mother of the World, twenty million strong." },
  { name: "New York", ep: "Unkillable", era: "contemporary", region: "NAM", s: [96, 99, 96, 94, 90], tag: "Capital of everything; allegedly declining since 1970." },
  { name: "Los Angeles", ep: "Creator Economy", era: "contemporary", region: "NAM", s: [93, 93, 97, 89, 74], tag: "Where the world's screens get filled." },
  { name: "San Francisco", ep: "Tech", era: "contemporary", region: "NAM", s: [74, 96, 82, 99, 68], tag: "The internet's company town." },
  { name: "Mexico City", ep: "CDMX", era: "contemporary", region: "LAM", s: [96, 85, 91, 80, 76], tag: "Art, food, and hemisphere-biggest-city energy." },
  { name: "São Paulo", ep: "Megalópole", era: "contemporary", region: "LAM", s: [96, 88, 86, 78, 70], tag: "Latin America's business capital." },
  { name: "Lagos", ep: "Afrobeats", era: "contemporary", region: "WAF", s: [96, 80, 92, 68, 68], tag: "Nollywood, and the sound the whole world dances to." },
  { name: "Nairobi", ep: "Silicon Savannah", era: "contemporary", region: "EAF", s: [76, 74, 72, 76, 64], tag: "East Africa's hub; fintech pioneer." },
  { name: "New York", ep: "New Amsterdam", era: "earlymodern", region: "NAM", s: [38, 60, 52, 56, 48], tag: "A Dutch trading post at the tip of an island." },
  { name: "London", ep: "Medieval", era: "medieval", region: "WE", s: [42, 56, 54, 60, 52], tag: "A muddy river town with a famous bridge." },
  { name: "London", ep: "Elizabethan", era: "renaissance", region: "WE", s: [58, 74, 92, 78, 72], tag: "Shakespeare at the Globe; sea dogs in the harbor." },
  { name: "Paris", ep: "Valois", era: "renaissance", region: "WE", s: [70, 68, 84, 80, 72], tag: "Brilliant, brawling, and frequently besieged." },
  { name: "Rome", ep: "Papal", era: "renaissance", region: "SEU", s: [55, 72, 96, 82, 60], tag: "Michelangelo on the scaffolding of St. Peter's." },
  { name: "Rome", ep: "Dolce Vita", era: "postwar", region: "SEU", s: [78, 72, 92, 72, 58], tag: "Cinecittà, Vespas, and Fellini." },
  { name: "Athens", ep: "Modern", era: "contemporary", region: "SEU", s: [72, 66, 76, 72, 58], tag: "The old names live on modern street signs." },
  { name: "Venice", ep: "Carnival Decline", era: "earlymodern", region: "SEU", s: [55, 68, 86, 66, 48], tag: "Masked, magnificent, and slowly sinking." },
  { name: "Vienna", ep: "Livable", era: "contemporary", region: "CEE", s: [70, 76, 84, 84, 60], tag: "Perennially voted the world's most livable city." },
  { name: "Moscow", ep: "Rings", era: "contemporary", region: "CEE", s: [92, 84, 82, 84, 88], tag: "A megacity of concentric rings." },
  { name: "Beijing", ep: "Warlord Era", era: "early20", region: "CN", s: [78, 62, 74, 70, 55], tag: "An imperial capital adrift." },
  { name: "Kyoto", ep: "Heritage", era: "contemporary", region: "JK", s: [70, 64, 90, 74, 40], tag: "Temples, tourists, and a thousand years of craft." },
  { name: "Baghdad", ep: "Ottoman Province", era: "earlymodern", region: "MEC", s: [55, 56, 60, 58, 52], tag: "A faded round city remembering its caliphs." },
  { name: "Chicago", ep: "Second City", era: "contemporary", region: "NAM", s: [85, 88, 84, 84, 66], tag: "Architecture capital; second city, allegedly." },
  { name: "Amsterdam", ep: "Canal Tech", era: "contemporary", region: "WE", s: [70, 88, 84, 86, 58], tag: "Bikes, fintech, and very narrow houses." },
  { name: "Madrid", ep: "Reborn", era: "contemporary", region: "SEU", s: [82, 84, 88, 80, 66], tag: "Europe's best nightlife commute." },
  { name: "Stockholm", ep: "Unicorn Factory", era: "contemporary", region: "CEE", s: [62, 86, 80, 90, 56], tag: "Per-capita champion of billion-dollar startups." },
  { name: "Bangalore", ep: "Tech Capital", era: "contemporary", region: "SAS", s: [88, 86, 72, 92, 60], tag: "The back office that became the front office." },
  { name: "Delhi", ep: "NCR", era: "contemporary", region: "SAS", s: [97, 84, 82, 78, 84], tag: "Imperial capitals stacked seven deep." },
  { name: "Bangkok", ep: "Street Food Capital", era: "contemporary", region: "SEA", s: [90, 82, 88, 68, 62], tag: "Michelin stars on plastic stools." },
  { name: "Jakarta", ep: "Sinking Giant", era: "contemporary", region: "SEA", s: [95, 78, 74, 62, 66], tag: "Thirty million people, one traffic jam." },
  { name: "Tel Aviv", ep: "Startup", era: "contemporary", region: "MEC", s: [58, 88, 78, 92, 68], tag: "More startups than parking spots." },
  { name: "Riyadh", ep: "Vision", era: "contemporary", region: "MEC", s: [78, 94, 58, 64, 78], tag: "A capital remaking itself at speed." },
  { name: "Miami", ep: "Capital of Latin America", era: "contemporary", region: "NAM", s: [74, 86, 82, 62, 50], tag: "Finance fled south, culture flew north." },
  { name: "Toronto", ep: "Multicultural", era: "contemporary", region: "NAM", s: [82, 86, 80, 84, 60], tag: "Half the city born somewhere else." },
  { name: "Buenos Aires", ep: "Resilient", era: "contemporary", region: "LAM", s: [88, 68, 86, 74, 58], tag: "Crisis-proof culture, world-class theatre." },
  { name: "Johannesburg", ep: "Financial Capital", era: "contemporary", region: "EAF", s: [72, 85, 70, 68, 62], tag: "Africa's money runs through here." },
  { name: "Accra", ep: "Rising", era: "contemporary", region: "WAF", s: [66, 62, 72, 60, 56], tag: "Detty December headquarters." },
  { name: "Addis Ababa", ep: "Hub", era: "contemporary", region: "EAF", s: [80, 58, 62, 56, 68], tag: "The AU's capital; an aviation crossroads." },
  { name: "Massalia", ep: "Greek Colony", era: "ancient", region: "WE", s: [40, 64, 56, 62, 44], tag: "Greek sailors planted a harbor and taught Gaul to drink wine." },
  { name: "Xianyang", ep: "Qin", era: "ancient", region: "CN", s: [64, 56, 42, 54, 90], tag: "One script, one measure, one ruthless empire." },
  { name: "Nanjing", ep: "Six Dynasties", era: "ancient", region: "CN", s: [58, 56, 66, 62, 56], tag: "Refuge of the Han world south of the river." },
  { name: "Ujjain", ep: "Avanti", era: "ancient", region: "SAS", s: [46, 56, 64, 80, 50], tag: "Indian astronomers ran their prime meridian through here." },
  { name: "Vaishali", ep: "Licchavi", era: "ancient", region: "SAS", s: [42, 46, 60, 64, 44], tag: "Ran itself by vote before Athens made it famous." },
  { name: "Jenné-jeno", ep: "Niger Delta", era: "ancient", region: "WAF", s: [38, 52, 40, 36, 30], tag: "A city on the Niger with no palace and no king." },
  { name: "Kerma", ep: "Nubian", era: "ancient", region: "EAF", s: [42, 50, 46, 34, 58], tag: "Nubia's first kingdom, trading ivory and gold upriver." },
  { name: "Cuicuilco", ep: "Preclassic", era: "ancient", region: "LAM", s: [40, 36, 46, 42, 38], tag: "The valley's first great town, buried under lava." },
  { name: "Kaminaljuyu", ep: "Highland Maya", era: "ancient", region: "LAM", s: [42, 46, 52, 56, 46], tag: "Obsidian lords of the highland Maya." },
  { name: "Kamakura", ep: "Shogunate", era: "medieval", region: "JK", s: [56, 50, 62, 54, 82], tag: "The shogun's seat, where the sword outranked the court." },
  { name: "Thanjavur", ep: "Chola", era: "medieval", region: "SAS", s: [60, 70, 82, 64, 76], tag: "Chola kings ruled the sea lanes from a temple's shadow." },
  { name: "Palembang", ep: "Srivijaya", era: "medieval", region: "SEA", s: [50, 80, 56, 68, 58], tag: "Every monk and merchant on the strait paid its tolls." },
  { name: "Bukhara", ep: "Samanid", era: "medieval", region: "MEC", s: [56, 70, 74, 88, 58], tag: "Avicenna learned his medicine in its libraries." },
  { name: "Djenné", ep: "Mali", era: "medieval", region: "WAF", s: [44, 64, 60, 58, 40], tag: "A mosque of mud brick, replastered by the whole town each year." },
  { name: "Mapungubwe", ep: "Golden Hill", era: "medieval", region: "EAF", s: [34, 58, 44, 34, 48], tag: "Golden rhinos on a hilltop before Great Zimbabwe rose." },
  { name: "Tiwanaku", ep: "Altiplano", era: "medieval", region: "LAM", s: [54, 50, 64, 60, 58], tag: "Stone gateways aligned to the sun at twelve thousand feet." },
  { name: "Copán", ep: "Classic Maya", era: "medieval", region: "LAM", s: [44, 46, 70, 74, 50], tag: "The Maya carved their history deepest here." },
  { name: "Suzhou", ep: "Ming", era: "renaissance", region: "CN", s: [72, 86, 84, 70, 46], tag: "Silk fortunes spent on gardens built like poems." },
  { name: "Sakai", ep: "Free Port", era: "renaissance", region: "JK", s: [44, 74, 68, 52, 40], tag: "Merchant city where the tea masters set the fashion." },
  { name: "Gaur", ep: "Bengal Sultanate", era: "renaissance", region: "SAS", s: [70, 74, 58, 54, 62], tag: "Brick capital fed by the richest delta on Earth." },
  { name: "Bijapur", ep: "Adil Shahi", era: "renaissance", region: "SAS", s: [56, 62, 76, 60, 68], tag: "Persian poets and painters at a Deccan court." },
  { name: "Herat", ep: "Timurid", era: "renaissance", region: "MEC", s: [54, 62, 84, 76, 58], tag: "Miniaturists made its court the envy of Persia." },
  { name: "Ife", ep: "Yoruba", era: "renaissance", region: "WAF", s: [44, 52, 84, 56, 46], tag: "Bronze faces so lifelike that Europeans cried forgery." },
  { name: "Sofala", ep: "Gold Port", era: "renaissance", region: "EAF", s: [32, 68, 40, 36, 42], tag: "Where Zimbabwe's gold met the monsoon winds." },
  { name: "Texcoco", ep: "Acolhua", era: "renaissance", region: "LAM", s: [54, 54, 78, 82, 56], tag: "The poet-king Nezahualcoyotl's court of engineers." },
  { name: "Mayapan", ep: "League", era: "renaissance", region: "LAM", s: [42, 44, 54, 50, 52], tag: "Last walled capital of the Maya league." },
  { name: "Dhaka", ep: "Mughal Bengal", era: "earlymodern", region: "SAS", s: [66, 84, 60, 54, 58], tag: "Muslin so fine it sold for its weight in silver." },
  { name: "Jaipur", ep: "Rajput", era: "earlymodern", region: "SAS", s: [48, 62, 70, 80, 56], tag: "A planned pink city around the world's largest sundial." },
  { name: "Algiers", ep: "Corsair", era: "earlymodern", region: "NAF", s: [44, 68, 46, 40, 74], tag: "Corsair captains ran the western Mediterranean from here." },
  { name: "Segou", ep: "Bamana", era: "earlymodern", region: "WAF", s: [40, 46, 44, 34, 64], tag: "Warrior kingdom of the middle Niger." },
  { name: "Lamu", ep: "Swahili", era: "earlymodern", region: "EAF", s: [28, 50, 64, 50, 34], tag: "Carved doors and quiet poetry on the Swahili coast." },
  { name: "Guangzhou", ep: "Thirteen Factories", era: "industrial", region: "CN", s: [78, 82, 62, 58, 52], tag: "All the West's China trade squeezed through one waterfront." },
  { name: "Tianjin", ep: "Treaty Port", era: "industrial", region: "CN", s: [62, 68, 52, 56, 58], tag: "Beijing's harbor, garrisoned by everyone." },
  { name: "Singapore", ep: "Raffles' Port", era: "industrial", region: "SEA", s: [44, 76, 48, 50, 56], tag: "A free port at the hinge of two oceans." },
  { name: "Colombo", ep: "Crown Colony", era: "industrial", region: "SAS", s: [42, 62, 48, 46, 48], tag: "Coaling station turned tea capital." },
  { name: "Tehran", ep: "Qajar", era: "industrial", region: "MEC", s: [52, 50, 54, 48, 60], tag: "A peacock throne in a dusty new capital." },
  { name: "Smyrna", ep: "Levantine", era: "industrial", region: "MEC", s: [54, 76, 66, 56, 44], tag: "The Levant's busiest quay, bargaining in a dozen tongues." },
  { name: "Khartoum", ep: "Nile Junction", era: "industrial", region: "EAF", s: [42, 48, 38, 42, 60], tag: "Where the two Niles meet and Gordon fell." },
  { name: "Sokoto", ep: "Caliphate", era: "industrial", region: "WAF", s: [44, 46, 54, 62, 58], tag: "Seat of the caliphate that ruled the savanna." },
  { name: "Nanjing", ep: "Republican", era: "early20", region: "CN", s: [64, 58, 64, 68, 58], tag: "The republic's decade of hope on the Yangtze." },
  { name: "Delhi", ep: "New Delhi", era: "early20", region: "SAS", s: [62, 58, 62, 58, 74], tag: "An empire built its grandest capital just in time to lose it." },
  { name: "Lahore", ep: "Punjab", era: "early20", region: "SAS", s: [56, 56, 70, 64, 52], tag: "Mughal gardens, Victorian colleges, Kipling's first beat." },
  { name: "Baghdad", ep: "Hashemite", era: "early20", region: "MEC", s: [50, 54, 56, 54, 54], tag: "A new kingdom seated in the old round city." },
  { name: "Jerusalem", ep: "Mandate", era: "early20", region: "MEC", s: [40, 44, 74, 66, 44], tag: "Three faiths under one tired mandate." },
  { name: "Casablanca", ep: "Protectorate", era: "early20", region: "NAF", s: [54, 64, 52, 44, 48], tag: "France built the port; the movies built the myth." },
  { name: "Ibadan", ep: "Seven Hills", era: "early20", region: "WAF", s: [58, 46, 48, 52, 46], tag: "Brown roofs over seven hills, and West Africa's biggest city." },
  { name: "Beijing", ep: "Red Capital", era: "postwar", region: "CN", s: [86, 60, 72, 78, 92], tag: "A sea of bicycles around the Forbidden City." },
  { name: "Delhi", ep: "Partition", era: "postwar", region: "SAS", s: [84, 64, 70, 68, 76], tag: "A refugee influx doubled it; ambition did the rest." },
  { name: "Manila", ep: "Pearl of the Orient", era: "postwar", region: "SEA", s: [76, 62, 70, 58, 52], tag: "Jeepneys and karaoke at full volume." },
  { name: "Istanbul", ep: "Gecekondu", era: "postwar", region: "MEC", s: [82, 68, 74, 64, 68], tag: "Anatolia moved in, a million roofs at a time." },
  { name: "Kuwait City", ep: "Oil Boom", era: "postwar", region: "MEC", s: [42, 88, 44, 52, 42], tag: "Oil turned a pearling port into a welfare state." },
  { name: "Accra", ep: "Independence", era: "postwar", region: "WAF", s: [52, 52, 66, 58, 52], tag: "The first colony free; the whole continent watched." },
  { name: "Dar es Salaam", ep: "Haven of Peace", era: "postwar", region: "EAF", s: [50, 46, 58, 52, 48], tag: "Haven of peace, host of liberation movements." },
  { name: "Doha", ep: "Gas Boom", era: "contemporary", region: "MEC", s: [50, 92, 58, 64, 52], tag: "Gas wealth buying a seat at every table." },
  { name: "Kigali", ep: "Renewal", era: "contemporary", region: "EAF", s: [44, 48, 52, 56, 58], tag: "The tidiest streets and boldest plans on the continent." },
  { name: "London", ep: "Londinium", era: "ancient", region: "WE", s: [38, 46, 40, 38, 52], tag: "A bridge, a fort, and a forum at the empire's edge." },
  { name: "Trier", ep: "Augusta Treverorum", era: "ancient", region: "WE", s: [44, 50, 52, 48, 64], tag: "Rome's capital north of the Alps." },
  { name: "Dhar Tichitt", ep: "Saharan", era: "ancient", region: "WAF", s: [28, 32, 34, 30, 34], tag: "Stone villages at the Sahara's green edge, before the desert won." },
  { name: "Kyiv", ep: "Kievan Rus", era: "medieval", region: "CEE", s: [58, 64, 68, 60, 68], tag: "Golden domes above the Dnipro; mother of Rus cities." },
  { name: "Koumbi Saleh", ep: "Ghana Empire", era: "medieval", region: "WAF", s: [44, 62, 46, 44, 56], tag: "Gold traded for salt, weight for weight." },
  { name: "Chaco Canyon", ep: "Ancestral Pueblo", era: "medieval", region: "NAM", s: [38, 40, 52, 58, 40], tag: "Great houses aligned to sun and moon in a desert canyon." },
  { name: "Prague", ep: "Charles IV", era: "renaissance", region: "CEE", s: [52, 58, 72, 76, 58], tag: "An emperor's university on the Vltava." },
  { name: "Kraków", ep: "Jagiellonian", era: "renaissance", region: "CEE", s: [48, 58, 70, 74, 56], tag: "Copernicus took notes in its lecture halls." },
  { name: "Fez", ep: "Marinid", era: "renaissance", region: "NAF", s: [54, 64, 74, 80, 56], tag: "Madrasas tiled like jewel boxes." },
  { name: "Khami", ep: "Torwa", era: "renaissance", region: "EAF", s: [34, 50, 42, 36, 46], tag: "Heir to Great Zimbabwe's stonecraft." },
  { name: "Barcelona", ep: "Modernisme", era: "early20", region: "SEU", s: [62, 66, 82, 64, 50], tag: "Gaudí's scaffolding over a restless port." },
  { name: "Algiers", ep: "Independence", era: "postwar", region: "NAF", s: [56, 52, 62, 50, 60], tag: "The casbah outlasted an empire." },
  { name: "Casablanca", ep: "Financial Hub", era: "contemporary", region: "NAF", s: [62, 72, 58, 56, 52], tag: "North Africa's boardroom." },
  { name: "Lyon", ep: "Lugdunum", era: "ancient", region: "WE", s: [44, 52, 48, 46, 58], tag: "Capital of Roman Gaul, where rivers and roads met." },
  { name: "Cádiz", ep: "Gadir", era: "ancient", region: "WE", s: [30, 58, 40, 42, 40], tag: "Phoenician traders built it while Rome was still a village." },
  { name: "Nineveh", ep: "Assyrian", era: "ancient", region: "MEC", s: [70, 66, 62, 72, 88], tag: "Sennacherib's monstrous capital, library and all." },
  { name: "Petra", ep: "Nabataean", era: "ancient", region: "MEC", s: [38, 72, 60, 52, 46], tag: "Carved from rose rock, rich on the incense road." },
  { name: "Thebes", ep: "Egyptian", era: "ancient", region: "NAF", s: [58, 62, 80, 70, 62], tag: "Hundred-gated city of Amun and the Valley of the Kings." },
  { name: "Cyrene", ep: "Greek Libya", era: "ancient", region: "NAF", s: [40, 56, 62, 72, 42], tag: "Philosophers, fine horses, and a miracle herb." },
  { name: "Nok", ep: "Terracotta", era: "ancient", region: "WAF", s: [24, 30, 50, 38, 26], tag: "Faces in terracotta, two thousand years before the bronzes." },
  { name: "Garama", ep: "Garamantes", era: "ancient", region: "WAF", s: [30, 44, 36, 40, 44], tag: "Underground canals turned the desert green." },
  { name: "Kukiya", ep: "Proto-Songhai", era: "ancient", region: "WAF", s: [26, 34, 30, 26, 36], tag: "The river town the Songhai called their oldest home." },
  { name: "Ghent", ep: "Cloth Towns", era: "medieval", region: "WE", s: [40, 72, 56, 46, 46], tag: "Cloth halls taller than the count's castle." },
  { name: "Aachen", ep: "Carolingian", era: "medieval", region: "WE", s: [36, 46, 64, 66, 58], tag: "Charlemagne crowned a new West from his palace chapel." },
  { name: "Dublin", ep: "Viking", era: "medieval", region: "WE", s: [30, 48, 42, 40, 44], tag: "A longphort of raiders turned river market." },
  { name: "Toledo", ep: "Three Cultures", era: "medieval", region: "SEU", s: [44, 56, 76, 82, 54], tag: "Translators turned Arabic libraries into Europe's curriculum." },
  { name: "Prague", ep: "Přemyslid", era: "medieval", region: "CEE", s: [44, 56, 58, 54, 52], tag: "Castle town rising over the Vltava ford." },
  { name: "Vladimir", ep: "Golden Gate", era: "medieval", region: "CEE", s: [40, 46, 58, 50, 56], tag: "White stone churches of the northern princes." },
  { name: "Cologne", ep: "Holy Roman", era: "medieval", region: "CEE", s: [52, 68, 64, 60, 56], tag: "Rhine tolls and the relics of the Magi." },
  { name: "Luoyang", ep: "Tang", era: "medieval", region: "CN", s: [76, 68, 78, 76, 70], tag: "The eastern capital, Buddhist grottoes at its gates." },
  { name: "Quanzhou", ep: "Zayton", era: "medieval", region: "CN", s: [56, 84, 58, 60, 48], tag: "Marco Polo swore no harbor was busier." },
  { name: "Gyeongju", ep: "Silla", era: "medieval", region: "JK", s: [60, 62, 82, 72, 58], tag: "Tiled roofs to the horizon in the Silla capital." },
  { name: "Kaesong", ep: "Goryeo", era: "medieval", region: "JK", s: [50, 60, 64, 62, 52], tag: "Goryeo's capital gave Korea its name abroad." },
  { name: "Kannauj", ep: "Imperial Prize", era: "medieval", region: "SAS", s: [56, 58, 62, 64, 60], tag: "Three dynasties fought a century for it." },
  { name: "Lahore", ep: "Ghaznavid", era: "medieval", region: "SAS", s: [48, 54, 58, 56, 60], tag: "Frontier capital where Persian verse took Indian root." },
  { name: "Hanoi", ep: "Thang Long", era: "medieval", region: "SEA", s: [52, 54, 60, 62, 58], tag: "The rising dragon city of the Viet kings." },
  { name: "Sri Ksetra", ep: "Pyu", era: "medieval", region: "SEA", s: [36, 42, 56, 48, 38], tag: "Walled Pyu city of stupas and silver coins." },
  { name: "Nishapur", ep: "Khorasan", era: "medieval", region: "MEC", s: [54, 66, 70, 78, 52], tag: "Turquoise, verse, and Omar Khayyam." },
  { name: "Kairouan", ep: "Aghlabid", era: "medieval", region: "NAF", s: [42, 54, 70, 74, 52], tag: "North Africa's first great mosque city." },
  { name: "Marrakesh", ep: "Almoravid", era: "medieval", region: "NAF", s: [54, 62, 68, 62, 72], tag: "Desert warriors founded it; an empire answered to it." },
  { name: "Sijilmasa", ep: "Gateway of the Sahara", era: "medieval", region: "NAF", s: [38, 74, 44, 42, 40], tag: "Where the gold caravans surfaced from the sands." },
  { name: "Niani", ep: "Mali", era: "medieval", region: "WAF", s: [42, 60, 48, 42, 58], tag: "Sundiata's seat among the gold fields." },
  { name: "Gao", ep: "River Kingdom", era: "medieval", region: "WAF", s: [38, 56, 42, 40, 48], tag: "Gold moved downstream, salt moved up." },
  { name: "Igbo-Ukwu", ep: "Bronzes", era: "medieval", region: "WAF", s: [26, 52, 68, 44, 28], tag: "Bronze vessels of a sophistication no one expected." },
  { name: "Moundville", ep: "Mississippian", era: "medieval", region: "NAM", s: [30, 36, 42, 38, 42], tag: "Second only to Cahokia among the mound towns." },
  { name: "Mesa Verde", ep: "Cliff Palace", era: "medieval", region: "NAM", s: [26, 30, 46, 44, 38], tag: "Stone villages tucked beneath the canyon rim." },
  { name: "Spiro", ep: "Caddoan", era: "medieval", region: "NAM", s: [24, 34, 44, 36, 34], tag: "A riverside center rich in engraved shell." },
  { name: "Bruges", ep: "Burgundian", era: "renaissance", region: "WE", s: [46, 84, 76, 58, 44], tag: "Van Eyck painted for its bankers." },
  { name: "Lyon", ep: "Banking Fair", era: "renaissance", region: "WE", s: [48, 76, 68, 70, 48], tag: "Fairs, presses, and Italian bankers north of the Alps." },
  { name: "Vienna", ep: "Habsburg Seat", era: "renaissance", region: "CEE", s: [48, 60, 66, 62, 68], tag: "The dynasty's seat at Europe's eastern gate." },
  { name: "Augsburg", ep: "Fugger", era: "renaissance", region: "CEE", s: [44, 86, 70, 66, 48], tag: "The Fuggers lent to emperors and collected kingdoms." },
  { name: "Macau", ep: "Portuguese Enclave", era: "renaissance", region: "CN", s: [30, 68, 50, 46, 38], tag: "A sliver of Portugal on the China coast." },
  { name: "Osaka", ep: "Castle Town", era: "renaissance", region: "JK", s: [56, 70, 58, 48, 72], tag: "Hideyoshi's castle anchored a merchant boom." },
  { name: "Seoul", ep: "Hanyang", era: "renaissance", region: "JK", s: [62, 58, 70, 76, 62], tag: "King Sejong's scholars invented an alphabet here." },
  { name: "Hakata", ep: "Port", era: "renaissance", region: "JK", s: [38, 66, 48, 44, 40], tag: "Japan's door to the continent." },
  { name: "Goa", ep: "Estado da Índia", era: "renaissance", region: "SAS", s: [44, 80, 58, 52, 64], tag: "Golden Goa, Lisbon's eastern Rome." },
  { name: "Ayutthaya", ep: "Early", era: "renaissance", region: "SEA", s: [58, 72, 64, 54, 66], tag: "An island court rising between three rivers." },
  { name: "Trowulan", ep: "Majapahit", era: "renaissance", region: "SEA", s: [60, 68, 66, 58, 70], tag: "Majapahit's brick capital claimed the whole archipelago." },
  { name: "Hoi An", ep: "Faifo", era: "renaissance", region: "SEA", s: [32, 64, 48, 40, 34], tag: "A Japanese bridge, a Chinese quarter, Cham silk." },
  { name: "Tlemcen", ep: "Zayyanid", era: "renaissance", region: "NAF", s: [42, 62, 64, 66, 48], tag: "Scholars and Saharan gold at the Maghreb's hinge." },
  { name: "Tunis", ep: "Hafsid", era: "renaissance", region: "NAF", s: [50, 66, 62, 60, 56], tag: "Corsair harbors and Ibn Khaldun's hometown." },
  { name: "Alexandria", ep: "Mamluk Port", era: "renaissance", region: "NAF", s: [44, 62, 48, 46, 40], tag: "Still the spice gate to Venice." },
  { name: "Kilwa", ep: "Portuguese Era", era: "renaissance", region: "EAF", s: [38, 60, 52, 48, 42], tag: "The gold trade slipped through Portuguese fingers here." },
  { name: "Mombasa", ep: "Swahili Wars", era: "renaissance", region: "EAF", s: [36, 54, 46, 40, 52], tag: "Burned three times, rebuilt three times." },
  { name: "Harar", ep: "Walled City", era: "renaissance", region: "EAF", s: [34, 52, 62, 58, 50], tag: "A hundred shrines inside one wall." },
  { name: "Edinburgh", ep: "Enlightenment", era: "earlymodern", region: "WE", s: [40, 56, 74, 88, 44], tag: "Hume and Smith argued in its taverns." },
  { name: "Bordeaux", ep: "Atlantic", era: "earlymodern", region: "WE", s: [40, 74, 56, 52, 40], tag: "Wine out, sugar in, fortunes either way." },
  { name: "Rome", ep: "Baroque", era: "earlymodern", region: "SEU", s: [58, 62, 90, 72, 52], tag: "Bernini's colonnade embraced the pilgrim world." },
  { name: "Lisbon", ep: "Pombaline", era: "earlymodern", region: "SEU", s: [56, 72, 64, 66, 58], tag: "Rebuilt on a grid after the quake that shook philosophy." },
  { name: "Moscow", ep: "Tsardom", era: "earlymodern", region: "CEE", s: [62, 58, 62, 54, 76], tag: "Kremlin walls and domes like fire." },
  { name: "Dresden", ep: "Augustan", era: "earlymodern", region: "CEE", s: [42, 58, 76, 62, 46], tag: "Porcelain and a prince who collected everything." },
  { name: "Warsaw", ep: "Commonwealth", era: "earlymodern", region: "CEE", s: [48, 54, 60, 58, 56], tag: "An elective monarchy's unruly capital." },
  { name: "Suzhou", ep: "Qing", era: "earlymodern", region: "CN", s: [70, 82, 78, 64, 42], tag: "Gardens and silk under the long Qing peace." },
  { name: "Yangzhou", ep: "Salt Trade", era: "earlymodern", region: "CN", s: [58, 84, 68, 60, 40], tag: "Salt merchants bankrolled poets and pleasure boats." },
  { name: "Jingdezhen", ep: "Porcelain Capital", era: "earlymodern", region: "CN", s: [50, 76, 72, 68, 30], tag: "A million kilns firing the world's china." },
  { name: "Kanazawa", ep: "Maeda", era: "earlymodern", region: "JK", s: [44, 58, 66, 54, 46], tag: "The Maedas spent their rice on crafts, not wars." },
  { name: "Lucknow", ep: "Nawabi", era: "earlymodern", region: "SAS", s: [54, 68, 76, 60, 52], tag: "Courtly Urdu and a refinement all its own." },
  { name: "Manila", ep: "Galleon Trade", era: "earlymodern", region: "SEA", s: [48, 78, 56, 52, 58], tag: "Acapulco silver met Chinese silk twice a year." },
  { name: "Makassar", ep: "Spice Entrepôt", era: "earlymodern", region: "SEA", s: [40, 70, 46, 44, 52], tag: "The free port the Dutch could not abide." },
  { name: "Bangkok", ep: "Rattanakosin", era: "earlymodern", region: "SEA", s: [46, 56, 54, 46, 58], tag: "A new capital across the river from the ruins." },
  { name: "Aleppo", ep: "Caravan City", era: "earlymodern", region: "MEC", s: [52, 76, 58, 54, 48], tag: "The Levant's warehouse between desert and sea." },
  { name: "Shiraz", ep: "Zand", era: "earlymodern", region: "MEC", s: [44, 52, 76, 62, 46], tag: "Hafez's tomb and Karim Khan's gardens." },
  { name: "Tunis", ep: "Corsair Regency", era: "earlymodern", region: "NAF", s: [44, 66, 54, 50, 64], tag: "Barbary cruisers paid the city's bills." },
  { name: "Meknes", ep: "Ismail's Capital", era: "earlymodern", region: "NAF", s: [46, 52, 56, 44, 74], tag: "A sultan's megaproject of walls and stables." },
  { name: "Ouidah", ep: "Atlantic Port", era: "earlymodern", region: "WAF", s: [36, 62, 42, 34, 46], tag: "Dahomey's port on the bitter Atlantic trade." },
  { name: "Abomey", ep: "Dahomey", era: "earlymodern", region: "WAF", s: [40, 52, 54, 40, 70], tag: "Red clay palaces and an army of women." },
  { name: "Katsina", ep: "Hausa Learning", era: "earlymodern", region: "WAF", s: [42, 56, 52, 62, 52], tag: "Kano's scholarly rival across the savanna." },
  { name: "Zanzibar", ep: "Omani", era: "earlymodern", region: "EAF", s: [42, 70, 52, 44, 54], tag: "Cloves planted, dhows ascendant." },
  { name: "Quebec", ep: "New France", era: "earlymodern", region: "NAM", s: [34, 48, 52, 50, 58], tag: "A fortress rock commanding the St. Lawrence." },
  { name: "Charleston", ep: "Colonial", era: "earlymodern", region: "NAM", s: [36, 66, 56, 44, 46], tag: "Rice wealth and a harbor full of sails." },
  { name: "Havana", ep: "Fleet Harbor", era: "earlymodern", region: "LAM", s: [42, 68, 52, 42, 66], tag: "The treasure fleets gathered under its guns." },
  { name: "Salvador", ep: "Bahia", era: "earlymodern", region: "LAM", s: [52, 70, 62, 46, 52], tag: "Sugar capital of the Portuguese Atlantic." },
  { name: "Glasgow", ep: "Second City", era: "industrial", region: "WE", s: [60, 80, 56, 72, 58], tag: "Clyde-built ships carried the century." },
  { name: "Liverpool", ep: "Gateway", era: "industrial", region: "WE", s: [54, 78, 54, 52, 50], tag: "Gateway port of the Atlantic age." },
  { name: "Milan", ep: "Industrial Triangle", era: "industrial", region: "SEU", s: [62, 76, 72, 68, 54], tag: "Italy's workshop behind La Scala's curtain." },
  { name: "Naples", ep: "Risorgimento", era: "industrial", region: "SEU", s: [70, 56, 68, 56, 48], tag: "Europe's densest streets, singing through hardship." },
  { name: "Barcelona", ep: "Eixample", era: "industrial", region: "SEU", s: [56, 70, 68, 62, 46], tag: "A gridiron expansion full of anarchist arguments." },
  { name: "Rome", ep: "Capitale", era: "industrial", region: "SEU", s: [56, 52, 72, 60, 52], tag: "A new kingdom moved into very old rooms." },
  { name: "Turin", ep: "Savoy", era: "industrial", region: "SEU", s: [48, 66, 58, 64, 56], tag: "The kingdom's engine room under the Alps." },
  { name: "Budapest", ep: "Dual Monarchy", era: "industrial", region: "CEE", s: [66, 72, 76, 70, 58], tag: "Twin cities wed by bridges, booming on grain and rail." },
  { name: "Warsaw", ep: "Congress", era: "industrial", region: "CEE", s: [52, 60, 62, 58, 46], tag: "Mills and martyrs under the tsar's eye." },
  { name: "Hankou", ep: "Treaty Port", era: "industrial", region: "CN", s: [62, 74, 52, 54, 44], tag: "Tea bricks for Russia, steamers on the Yangtze." },
  { name: "Yokohama", ep: "Treaty Port", era: "industrial", region: "JK", s: [48, 72, 56, 60, 44], tag: "A fishing village became Japan's front door." },
  { name: "Nagasaki", ep: "Meiji", era: "industrial", region: "JK", s: [42, 60, 50, 64, 52], tag: "Shipyards where Dutch learning had lived." },
  { name: "Kobe", ep: "Foreign Settlement", era: "industrial", region: "JK", s: [40, 62, 46, 50, 40], tag: "A trading post under Mount Rokkō." },
  { name: "Hyderabad", ep: "Nizam", era: "industrial", region: "SAS", s: [58, 72, 66, 58, 54], tag: "The Nizam's diamonds were proverbial." },
  { name: "Saigon", ep: "Cochinchina", era: "industrial", region: "SEA", s: [44, 62, 52, 46, 48], tag: "Boulevards and rubber money in the delta." },
  { name: "Bangkok", ep: "Chulalongkorn", era: "industrial", region: "SEA", s: [52, 58, 60, 62, 54], tag: "A reforming king kept the empires offshore." },
  { name: "Surabaya", ep: "Sugar Port", era: "industrial", region: "SEA", s: [48, 66, 44, 42, 46], tag: "The Indies' busiest harbor, sweet on sugar." },
  { name: "Baku", ep: "Oil Boom", era: "industrial", region: "MEC", s: [50, 82, 56, 58, 46], tag: "Half the world's oil from one windy peninsula." },
  { name: "Oran", ep: "Pied-Noir Port", era: "industrial", region: "NAF", s: [40, 52, 44, 40, 44], tag: "Wine and wheat through a contested harbor." },
  { name: "Algiers", ep: "French Algeria", era: "industrial", region: "NAF", s: [50, 58, 48, 46, 56], tag: "A casbah above, a European city below." },
  { name: "Tangier", ep: "Diplomatic", era: "industrial", region: "NAF", s: [32, 50, 46, 40, 36], tag: "Every consul kept a window on the strait." },
  { name: "Saint-Louis", ep: "Signares", era: "industrial", region: "WAF", s: [34, 52, 48, 50, 40], tag: "Merchant queens and steamers at the river's mouth." },
  { name: "Kumasi", ep: "Asante", era: "industrial", region: "WAF", s: [44, 58, 56, 48, 68], tag: "The Golden Stool's capital defied an empire." },
  { name: "Addis Ababa", ep: "Menelik", era: "industrial", region: "EAF", s: [40, 44, 50, 42, 66], tag: "Menelik's new flower, armed and unconquered." },
  { name: "Durban", ep: "Natal", era: "industrial", region: "EAF", s: [38, 56, 42, 44, 46], tag: "Sugar port of the Indian Ocean colony." },
  { name: "Philadelphia", ep: "Workshop", era: "industrial", region: "NAM", s: [72, 80, 64, 74, 58], tag: "Locomotives, looms, and a centennial fair." },
  { name: "Mexico City", ep: "Porfiriato", era: "industrial", region: "LAM", s: [64, 62, 66, 58, 60], tag: "Order, progress, and a boulevard dressed in French." },
  { name: "Valparaíso", ep: "Pacific Entrepôt", era: "industrial", region: "LAM", s: [40, 68, 50, 48, 42], tag: "Every ship rounding the Horn called here." },
  { name: "Montevideo", ep: "Beef Boom", era: "industrial", region: "LAM", s: [38, 62, 48, 46, 40], tag: "Hides, beef, and a harbor of immigrants." },
  { name: "Amsterdam", ep: "Interwar", era: "early20", region: "WE", s: [50, 68, 62, 66, 40], tag: "Diamond cutters and a quiet empire of trade." },
  { name: "Glasgow", ep: "Red Clydeside", era: "early20", region: "WE", s: [56, 68, 52, 62, 56], tag: "Built the liners, argued the politics." },
  { name: "Dublin", ep: "Rising", era: "early20", region: "WE", s: [36, 42, 68, 56, 40], tag: "Joyce wrote it; Easter 1916 remade it." },
  { name: "Milan", ep: "Futurist", era: "early20", region: "SEU", s: [54, 66, 68, 62, 52], tag: "Marinetti declared war on the past here." },
  { name: "Lisbon", ep: "Neutral Harbor", era: "early20", region: "SEU", s: [48, 52, 58, 52, 42], tag: "Every spy in Europe changed trains here." },
  { name: "Athens", ep: "Refugee City", era: "early20", region: "SEU", s: [52, 44, 60, 54, 46], tag: "Doubled overnight by Smyrna's survivors." },
  { name: "Prague", ep: "First Republic", era: "early20", region: "CEE", s: [52, 60, 72, 70, 50], tag: "Čapek coined robots; Kafka clerked nearby." },
  { name: "Guangzhou", ep: "Republican Cradle", era: "early20", region: "CN", s: [58, 60, 56, 54, 56], tag: "Sun Yat-sen's base for a new China." },
  { name: "Kyoto", ep: "Taishō", era: "early20", region: "JK", s: [56, 52, 78, 64, 38], tag: "The old capital kept its looms and its calm." },
  { name: "Seoul", ep: "Colonial", era: "early20", region: "JK", s: [50, 46, 52, 50, 40], tag: "A proud capital under another's flag." },
  { name: "Nagoya", ep: "Aircraft Works", era: "early20", region: "JK", s: [50, 60, 44, 54, 52], tag: "Castle town turned arsenal." },
  { name: "Karachi", ep: "Port City", era: "early20", region: "SAS", s: [46, 56, 46, 48, 42], tag: "The Raj's newest great port." },
  { name: "Batavia", ep: "Late Colonial", era: "early20", region: "SEA", s: [54, 62, 52, 56, 50], tag: "Oil and rubber paid for the white verandas." },
  { name: "Manila", ep: "Commonwealth", era: "early20", region: "SEA", s: [52, 58, 62, 60, 48], tag: "America's showcase in Asia, jazz included." },
  { name: "Hanoi", ep: "French Indochina", era: "early20", region: "SEA", s: [44, 48, 58, 56, 42], tag: "An opera house in the tropics." },
  { name: "Alexandria", ep: "Cavafy's", era: "early20", region: "NAF", s: [54, 68, 76, 60, 42], tag: "Cavafy's poems and cotton fortunes by the sea." },
  { name: "Tangier", ep: "International Zone", era: "early20", region: "NAF", s: [34, 56, 58, 44, 32], tag: "A free-for-all of currencies, spies, and writers." },
  { name: "Tripoli", ep: "Italian Libya", era: "early20", region: "NAF", s: [38, 42, 40, 38, 48], tag: "A colonial showcase on the fourth shore." },
  { name: "Accra", ep: "Gold Coast", era: "early20", region: "WAF", s: [42, 52, 54, 52, 42], tag: "Cocoa money built the schools that built independence." },
  { name: "Bamako", ep: "Rail Terminus", era: "early20", region: "WAF", s: [34, 42, 44, 40, 38], tag: "Railhead on the Niger." },
  { name: "Nairobi", ep: "Settler Railway", era: "early20", region: "EAF", s: [38, 50, 44, 46, 44], tag: "A rail depot at mile 327 became a capital." },
  { name: "Mombasa", ep: "Port Colony", era: "early20", region: "EAF", s: [40, 54, 46, 42, 44], tag: "The Uganda Railway started here." },
  { name: "Khartoum", ep: "Condominium", era: "early20", region: "EAF", s: [42, 46, 44, 48, 52], tag: "Two flags flew over Gordon's old ground." },
  { name: "Detroit", ep: "Motor City", era: "early20", region: "NAM", s: [68, 84, 58, 72, 60], tag: "The assembly line started here and remade the world." },
  { name: "Pittsburgh", ep: "Steel", era: "early20", region: "NAM", s: [56, 80, 48, 64, 56], tag: "Carnegie's furnaces lit the night sky." },
  { name: "Rio de Janeiro", ep: "Republic Capital", era: "early20", region: "LAM", s: [62, 64, 76, 56, 52], tag: "Samba on the hills, a capital dressed for carnival." },
  { name: "São Paulo", ep: "Coffee Boom", era: "early20", region: "LAM", s: [58, 76, 58, 56, 44], tag: "Coffee money industrialized it almost overnight." },
  { name: "Amsterdam", ep: "Provo", era: "postwar", region: "WE", s: [52, 68, 72, 66, 42], tag: "Bicycles, canals, and cheerful anarchy." },
  { name: "Liverpool", ep: "Merseybeat", era: "postwar", region: "WE", s: [48, 52, 78, 46, 40], tag: "Four lads who shook the world." },
  { name: "Manchester", ep: "Madchester", era: "postwar", region: "WE", s: [46, 52, 72, 50, 38], tag: "Factory Records and two cathedrals of football." },
  { name: "Barcelona", ep: "Olympic", era: "postwar", region: "SEU", s: [58, 66, 78, 62, 46], tag: "The Games turned its face back to the sea." },
  { name: "Madrid", ep: "Movida", era: "postwar", region: "SEU", s: [62, 60, 76, 58, 48], tag: "All-night freedom after a long gray sleep." },
  { name: "Athens", ep: "Concrete Boom", era: "postwar", region: "SEU", s: [58, 50, 58, 50, 42], tag: "Apartment blocks ate the orange groves." },
  { name: "Prague", ep: "Spring", era: "postwar", region: "CEE", s: [50, 48, 68, 60, 42], tag: "Tanks answered the question of 1968." },
  { name: "Warsaw", ep: "Rebuilt", era: "postwar", region: "CEE", s: [54, 46, 58, 54, 48], tag: "Raised from rubble brick by numbered brick." },
  { name: "Shanghai", ep: "State Industry", era: "postwar", region: "CN", s: [78, 62, 58, 62, 58], tag: "Heavy industry behind a quiet Bund." },
  { name: "Guangzhou", ep: "Canton Fair", era: "postwar", region: "CN", s: [62, 68, 52, 52, 50], tag: "One trade fair kept the door ajar." },
  { name: "Nagoya", ep: "Toyota", era: "postwar", region: "JK", s: [62, 76, 46, 62, 46], tag: "Just-in-time was invented in its suburbs." },
  { name: "Busan", ep: "Miracle Port", era: "postwar", region: "JK", s: [56, 64, 48, 52, 50], tag: "War refuge turned container giant." },
  { name: "Karachi", ep: "New Nation", era: "postwar", region: "SAS", s: [70, 62, 54, 52, 56], tag: "A new country's first capital, outgrowing every plan." },
  { name: "Calcutta", ep: "Resilient", era: "postwar", region: "SAS", s: [80, 56, 74, 64, 50], tag: "Crisis after crisis, and still the poets published." },
  { name: "Dhaka", ep: "Liberation", era: "postwar", region: "SAS", s: [64, 42, 52, 46, 44], tag: "A language movement became a nation." },
  { name: "Kuala Lumpur", ep: "Merdeka", era: "postwar", region: "SEA", s: [52, 62, 50, 52, 48], tag: "Tin and rubber paid for independence." },
  { name: "Casablanca", ep: "Boom City", era: "postwar", region: "NAF", s: [58, 64, 50, 46, 44], tag: "The port outgrew everything around it." },
  { name: "Tunis", ep: "Bourguiba", era: "postwar", region: "NAF", s: [46, 50, 56, 56, 44], tag: "A schoolteacher's republic." },
  { name: "Tripoli", ep: "Oil Kingdom", era: "postwar", region: "NAF", s: [44, 58, 42, 40, 46], tag: "A quiet capital, suddenly rich." },
  { name: "Dakar", ep: "Senghor", era: "postwar", region: "WAF", s: [48, 46, 62, 56, 44], tag: "A poet ran the country from here." },
  { name: "Addis Ababa", ep: "OAU", era: "postwar", region: "EAF", s: [52, 42, 54, 48, 56], tag: "Africa's diplomatic capital from day one." },
  { name: "Kampala", ep: "Makerere", era: "postwar", region: "EAF", s: [42, 40, 48, 52, 42], tag: "Its university taught half the continent's first cabinets." },
  { name: "Mogadishu", ep: "Ocean Modern", era: "postwar", region: "EAF", s: [40, 40, 46, 42, 44], tag: "A white city on the ocean, before the storm." },
  { name: "Buenos Aires", ep: "Peronist", era: "postwar", region: "LAM", s: [80, 62, 76, 64, 56], tag: "Evita on the balcony, tango on the radio." },
  { name: "Havana", ep: "Revolutionary", era: "postwar", region: "LAM", s: [52, 42, 68, 58, 54], tag: "1959 echoed across three continents." },
  { name: "Brasília", ep: "Planned Capital", era: "postwar", region: "LAM", s: [50, 52, 66, 60, 48], tag: "A capital invented on an empty plateau in four years." },
  { name: "Dublin", ep: "Tech Docklands", era: "contemporary", region: "WE", s: [48, 82, 62, 70, 36], tag: "Half the internet's European headquarters." },
  { name: "Brussels", ep: "EU Capital", era: "contemporary", region: "WE", s: [50, 64, 58, 62, 40], tag: "An acronym empire's reluctant capital." },
  { name: "Barcelona", ep: "Global Destination", era: "contemporary", region: "SEU", s: [62, 70, 82, 68, 44], tag: "The city that became too popular for itself." },
  { name: "Rome", ep: "Eterna", era: "contemporary", region: "SEU", s: [66, 60, 78, 62, 50], tag: "Twenty-eight centuries and counting." },
  { name: "Lisbon", ep: "Atlantic Revival", era: "contemporary", region: "SEU", s: [52, 62, 70, 62, 38], tag: "Tiles, hills, and half the world's laptops." },
  { name: "Warsaw", ep: "EU Boom", era: "contemporary", region: "CEE", s: [58, 72, 58, 64, 52], tag: "The fastest-growing skyline between Berlin and Moscow." },
  { name: "Hong Kong", ep: "Handover", era: "contemporary", region: "CN", s: [70, 88, 76, 74, 52], tag: "One country, two systems, seven million stories." },
  { name: "Hangzhou", ep: "E-Commerce", era: "contemporary", region: "CN", s: [72, 84, 62, 74, 50], tag: "Alibaba's hometown by the West Lake." },
  { name: "Fukuoka", ep: "Startup Coast", era: "contemporary", region: "JK", s: [56, 60, 58, 60, 42], tag: "Ramen, startups, and an open harbor." },
  { name: "Busan", ep: "Film Port", era: "contemporary", region: "JK", s: [58, 62, 66, 56, 46], tag: "Asia's film festival above container cranes." },
  { name: "Hyderabad", ep: "Cyberabad", era: "contemporary", region: "SAS", s: [74, 76, 60, 80, 52], tag: "Biryani and biotech in the Nizam's old city." },
  { name: "Dhaka", ep: "Garment Giant", era: "contemporary", region: "SAS", s: [88, 62, 54, 48, 50], tag: "Twenty million people sewing the world's wardrobe." },
  { name: "Ho Chi Minh City", ep: "Đổi Mới", era: "contemporary", region: "SEA", s: [80, 72, 62, 58, 54], tag: "Motorbike rivers and a startup hum." },
  { name: "Kuala Lumpur", ep: "Twin Towers", era: "contemporary", region: "SEA", s: [62, 74, 56, 60, 48], tag: "Twin towers announced a tiger's arrival." },
  { name: "Marrakesh", ep: "Tourism Jewel", era: "contemporary", region: "NAF", s: [48, 62, 68, 46, 40], tag: "Riads, souks, and seven million visitors a year." },
  { name: "Tunis", ep: "Arab Spring", era: "contemporary", region: "NAF", s: [50, 48, 58, 56, 46], tag: "Where the spring began." },
  { name: "Algiers", ep: "Hydrocarbon", era: "contemporary", region: "NAF", s: [56, 62, 48, 50, 56], tag: "Gas money and a long memory." },
  { name: "Abidjan", ep: "Returned", era: "contemporary", region: "WAF", s: [60, 62, 60, 52, 48], tag: "The francophone boomtown, back on its feet." },
  { name: "Dakar", ep: "Culture Hub", era: "contemporary", region: "WAF", s: [54, 52, 68, 58, 48], tag: "Biennales and breakbeats at the continent's western tip." },
  { name: "Kinshasa", ep: "Megacity", era: "contemporary", region: "WAF", s: [88, 48, 72, 42, 46], tag: "Fifteen million people inventing genres weekly." },
  { name: "Cape Town", ep: "Design Capital", era: "contemporary", region: "EAF", s: [62, 68, 76, 64, 46], tag: "Table Mountain over a creative boom." },
  { name: "Medellín", ep: "Transformed", era: "contemporary", region: "LAM", s: [58, 60, 64, 58, 44], tag: "Cable cars up the hillsides changed the story." },
  { name: "Lima", ep: "Gastronomy", era: "contemporary", region: "LAM", s: [74, 62, 72, 54, 46], tag: "The world flies in for dinner." },
].map((c, i) => ({ ...c, id: i }));
// <<< CITY DATA END

// Same city across renames or the same site: drafting one form locks out the others.
const SAME_CITY = {
  edo: "tokyo", constantinople: "istanbul", bombay: "mumbai", batavia: "jakarta",
  tenochtitlan: "mexico city", calcutta: "kolkata", madras: "chennai", rangoon: "yangon",
  "chang'an": "xi'an", saigon: "ho chi minh city",
};
CITIES.forEach((c) => {
  const k = c.name.toLowerCase();
  c.cityKey = SAME_CITY[k] || k;
});

// ---------- trials: keyed to stat indices ----------
const TRIALS = [
  { name: "The Plague", stats: [3, 0], pass: "{c}'s physicians and granaries hold the line.", fail: "Pestilence empties your streets, and no one knows why.",
    lore: "Disease was the great killer of cities. The Plague of Justinian emptied Constantinople in 541, and the Black Death took perhaps half of Europe's city dwellers. Cities with physicians, quarantine, and the sheer scale to absorb losses endured. The rest never recovered their place." },
  { name: "The Great Siege", stats: [4], pass: "{c}'s walls and warriors turn the host away.", fail: "The gates splinter. The host pours in.",
    lore: "Every great city was eventually a target. Constantinople's triple walls turned away besiegers for a thousand years until cannon arrived in 1453. Baghdad, Tenochtitlan, and Vijayanagara never recovered from the day their walls failed." },
  { name: "The Famine", stats: [0, 1], pass: "{c}'s storehouses feed the realm through the lean years.", fail: "The harvests fail and the granaries stand empty.",
    lore: "A city is a promise that food will arrive tomorrow. Rome shipped grain from Egypt to feed a million mouths; Edo stockpiled rice against the lean years. When harvests failed, storehouses and buying power decided who ate." },
  { name: "The Trade Collapse", stats: [1], pass: "{c}'s merchants reroute the routes and reopen the ports.", fail: "The caravans stop coming. The harbors fall silent.",
    lore: "Trade routes move; cities cannot. Palmyra withered when the caravans chose other roads, and when Portuguese ships rounded Africa, Venice's spice monopoly died at sea. Rich cities with nimble merchants found new routes. The rest kept docks for ships that never came." },
  { name: "The Rival's Golden Age", stats: [2], pass: "Let them flourish — {c}'s poets and painters outshine them all.", fail: "The world's artists drift to a brighter court than yours.",
    lore: "Prestige is a contest, and talent goes where the light is. Florence pulled the Renaissance into its orbit while rival cities watched. Paris took the art world from Rome, held it for two centuries, then lost it to New York in a single generation." },
  { name: "The Schism", stats: [2, 4], pass: "{c} holds the faith — and the realm — together.", fail: "Your people split into factions, then into enemies.",
    lore: "Faiths split, and cities split with them. The Reformation tore towns in half street by street; rival capitals hardened against each other for centuries. Holding a divided people together takes a culture worth sharing and force worth respecting." },
  { name: "The Brain Drain", stats: [3], pass: "{c}'s academies give the brilliant a reason to stay.", fail: "Your brightest minds leave, and take the future with them.",
    lore: "Minds are the most portable wealth. Spain expelled its scholars and financiers in 1492, and Istanbul welcomed them. Berlin's physicists fled in 1933 and built the American century instead. Cities keep talent with academies, patrons, and freedom; they lose it overnight." },
  { name: "The Succession Crisis", stats: [4, 2], pass: "{c}'s institutions outlast the throne's empty chair.", fail: "Three claimants, two armies, no civilization.",
    lore: "The ruler dies, and everything trembles. Alexander's empire shattered within a generation of his death. Rome survived mad emperors because the legions and the law outlasted them. The test is whether your institutions are stronger than any one throne." },
  { name: "The Currency Crisis", stats: [1, 3], pass: "{c}'s bankers steady the coin before the panic spreads.", fail: "The coin is debased, and trust debases with it.",
    lore: "Debase the coin and you debase trust itself. Rome's silver denarius fell to a twentieth of its old purity and prices ran wild for a century. Song China invented paper money and promptly invented paper inflation. Sound money takes wealth to back it and wisdom to manage it." },
  { name: "The Great Fire", stats: [0, 1], pass: "{c} rebuilds in stone, grander than before.", fail: "What burns is never rebuilt.",
    lore: "Wooden cities burned on schedule. Edo's people joked that fires were the flowers of their city; London lost four fifths of itself in 1666. The rich and populous rebuilt in brick and stone and came back grander. Smaller cities just burned." },
  { name: "Barbarians at the Gates", stats: [4, 0], pass: "{c} absorbs the newcomers and grows stronger for it.", fail: "The frontier folds, then the heartland.",
    lore: "Every settled city faced peoples on the move. Rome recruited Goths into its legions for two centuries before the arrangement collapsed. China walled, fought, traded, and intermarried by turns. Strength buys time, and scale absorbs the shock." },
  { name: "The Age of Decadence", stats: [2, 3], pass: "{c} turns abundance into a renaissance, not a stupor.", fail: "Comfort curdles into complacency. Decline arrives quietly.",
    lore: "Success is its own trial. Abundance can fund a renaissance or a long nap. Abbasid Baghdad spent its fortune translating the world's knowledge; Dutch merchants bought Rembrandts. Other rich courts gilded their palaces and quietly stopped mattering." },
  { name: "The Earthquake", stats: [0, 3], pass: "{c}'s engineers raise the city from the rubble.", fail: "The earth opens, and your capital does not recover.",
    lore: "The earth keeps its own calendar. Lisbon's 1755 quake shook Europe's philosophy as hard as its buildings. Tokyo burned in a day in 1923 and was rebuilt within a decade. Engineering knowledge and raw civic capacity decide whether a city rebuilds or scatters." },
  { name: "The Long Drought", stats: [0, 4], pass: "{c}'s aqueducts and order carry the realm through dry years.", fail: "The rivers thin, the fields crack, the people scatter.",
    lore: "Water is the first infrastructure. Rome's aqueducts and Angkor's reservoirs were empires written in stone and the discipline to maintain them. When the rains failed the Maya lowlands for decades, the cities emptied and the forest closed over the temples." },
];

// ---------- rng ----------
function hashStr(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const poolFor = (era, region, usedKeys) =>
  CITIES.filter((c) => c.era === era && c.region === region && !usedKeys.includes(c.cityKey));

function pickRegion(era, rnd, pickedIds, exclude) {
  const order = shuffle(Object.keys(REGIONS), rnd);
  for (const r of order) {
    if (r === exclude) continue;
    if (poolFor(era, r, pickedIds).length >= 2) return r;
  }
  return order.find((r) => poolFor(era, r, pickedIds).length >= 1) || order[0];
}

function teamStats(picks) {
  // One city per attribute: the team's rating in each stat IS that city's rating.
  return STAT_KEYS.map((_, i) => {
    const owner = picks.find((p) => p.slot === i);
    return owner ? owner.s[i] : 0;
  });
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const eraName = (c) => `${ERAS.find((e) => e.key === c.era).label} ${c.name}`;
const dailyNumber = () =>
  Math.floor((Date.parse(todayISO()) - Date.parse("2026-06-01")) / 86400000) + 1;

// ============================================================
// UI atoms
// ============================================================
function StatBar({ label, value, accent }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ ...CAPS, fontSize: 10, color: C.dim, width: 78, flexShrink: 0 }}>{label}</span>
      <div className="flex-1 rounded-full" style={{ background: C.ink, height: 6 }}>
        <div
          className="rounded-full"
          style={{
            height: 6,
            width: `${value}%`,
            background: accent || C.gold,
            transition: "width 600ms ease",
          }}
        />
      </div>
      <span style={{ fontFamily: DISPLAY, fontSize: 13, color: C.marble, width: 24, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

function MiniStats({ s }) {
  return (
    <div className="flex gap-2 mt-2">
      {s.map((v, i) => (
        <div key={i} className="flex flex-col items-center" style={{ width: 36 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 14, color: v >= 90 ? C.gold : C.marble, fontVariantNumeric: "tabular-nums" }}>{v}</span>
          <span style={{ ...CAPS, fontSize: 8, color: C.dim }}>{STAT_SHORT[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Plaque({ children, style }) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{ background: C.raised, border: `1px solid ${C.line}`, ...style }}
    >
      {children}
    </div>
  );
}

const Btn = ({ onClick, disabled, children, kind = "ghost", style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded-lg px-4 py-2"
    style={{
      ...CAPS,
      fontSize: 11,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.35 : 1,
      background: kind === "gold" ? C.gold : "transparent",
      color: kind === "gold" ? C.ink : C.gold,
      border: `1px solid ${kind === "gold" ? C.gold : C.goldSoft}`,
      ...style,
    }}
  >
    {children}
  </button>
);

const ROMAN = ["I", "II", "III", "IV", "V"];


const FAQ = [
  ["What is Eternal City?", "A daily draft game. History deals you five random era-and-region combinations. From each, you take a single attribute from a single city. The five attributes form one amalgam civilization, which then faces ten trials, one per century. Survive all ten and you've built an Eternal City."],
  ["How does drafting work?", "Each round shows you an era and region, and the cities that peaked there. You claim ONE attribute from ONE city — its Scale, Wealth, Culture, Knowledge, or Might. Each attribute slot can only be filled once, so by the end your civilization has exactly one city behind each stat."],
  ["Can I draft the same city twice?", "No. Each city may serve only once across all of history — drafting Ancient Rome locks out every other Rome. Renamed cities count as the same city: Edo is Tokyo, Constantinople is Istanbul, Bombay is Mumbai, etc."],
  ["What are the rerolls?", "One era reroll and one region reroll per run. The era reroll swaps the current round's era for an unused one; the region reroll redraws the region within the same era. Once used, they're gone."],
  ["How are cities rated?", "Ratings (0–99) are editorial and era-adjusted: a city is rated against its own world, not ours. Tang Chang'an's 99 Scale means it dominated the 8th century the way nothing dominates today. Disagree with a rating? That's half the fun."],
  ["How do the trials work?", "Your civilization faces 10 trials, each keyed to one or two attributes and each with a visible difficulty between 58 and 92. You pass if your relevant attribute score, plus a fortune roll between −10 and +10, meets the difficulty."],
  ["What is a Dark Age?", "Your first failed trial doesn't end you — a Dark Age descends, that century is lost, and your civilization rebuilds. A second failure is collapse. Rome got sacked and recovered; so can you, once."],
  ["What counts as winning?", "Every trial passed is a century survived. Pass all ten with no Dark Age and you've built an Eternal City. Anything less is measured in centuries endured."],
  ["What's the difference between Daily and Free Play?", "The Daily deals every player the identical eras, regions, trials, difficulties, and fortune rolls — the only variable is what you draft, so identical rosters always produce identical results. Free Play is fully random every run."],
  ["What is Historian Mode?", "All ratings are hidden until the trials begin. You draft on the strength of names alone — was Kaifeng a Wealth city or a Might city? — and find out what you knew when the trials judge you."],
];

function FaqSection() {
  const [open, setOpen] = useState(-1);
  return (
    <div className="mt-4">
      <div style={{ ...CAPS, fontSize: 10, color: C.goldSoft, textAlign: "center", marginBottom: 8 }}>— Rules & FAQ —</div>
      <div className="flex flex-col gap-1">
        {FAQ.map(([q, a], i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}`, background: C.raised }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-left px-4 py-2 flex items-center justify-between gap-2"
              style={{ cursor: "pointer" }}
            >
              <span style={{ fontFamily: DISPLAY, fontSize: 14, color: open === i ? C.gold : C.marble }}>{q}</span>
              <span style={{ color: C.goldSoft, fontSize: 12 }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="px-4 py-2" style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.55, color: C.dim, borderTop: `1px solid ${C.line}` }}>
                {a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// App
// ============================================================
export default function EternalCity() {
  const [phase, setPhase] = useState("title"); // title | draft | sim
  const [daily, setDaily] = useState(false);
  const [historian, setHistorian] = useState(false);
  const rngRef = useRef(Math.random);
  const seedRef = useRef(0);
  const [rounds, setRounds] = useState([]);
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState([]);
  const [eraSkip, setEraSkip] = useState(true);
  const [regionSkip, setRegionSkip] = useState(true);
  const [trials, setTrials] = useState([]); // resolved results
  const [revealed, setRevealed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [landed, setLanded] = useState(false); // current round's combo revealed?
  const [reel, setReel] = useState(null); // { era, region, dispEra, dispRegion } while spinning
  const [openTrial, setOpenTrial] = useState(-1); // expanded century in the trial log
  const spinTimer = useRef(null);
  const logEnd = useRef(null);

  useEffect(() => () => clearTimeout(spinTimer.current), []);

  // The reels are theater: the result is already decided, the spin just lands on it.
  // Cosmetic cycling uses Math.random so the seeded daily stream is untouched.
  function spinReels(which) {
    clearTimeout(spinTimer.current);
    const eraKeys = ERAS.map((e) => e.key);
    const regionKeys = Object.keys(REGIONS);
    const spinEra = which !== "region";
    const spinRegion = which !== "era";
    let ei = Math.floor(Math.random() * eraKeys.length);
    let ri = Math.floor(Math.random() * regionKeys.length);
    const start = Date.now();
    let delay = 65;
    setLanded(false);
    const tick = () => {
      if (Date.now() - start >= 3000 - delay) {
        // Settle on the result, hold a beat, then reveal the rest.
        setReel((r) => ({ ...r, settled: true }));
        spinTimer.current = setTimeout(() => {
          setReel(null);
          setLanded(true);
        }, 650);
        return;
      }
      ei = (ei + 1) % eraKeys.length;
      ri = (ri + 1) % regionKeys.length;
      setReel({
        era: spinEra,
        region: spinRegion,
        dispEra: eraKeys[ei],
        dispRegion: regionKeys[ri],
      });
      delay = Math.min(delay * 1.14, 360); // decelerate like a tiring wheel
      spinTimer.current = setTimeout(tick, delay);
    };
    tick();
  }

  function startRun(isDaily) {
    const seed = isDaily ? hashStr("ETERNAL-" + todayISO()) : Math.floor(Math.random() * 2 ** 31);
    seedRef.current = seed;
    const rnd = mulberry32(seed);
    rngRef.current = rnd;
    const eras = shuffle(ERAS.map((e) => e.key), rnd).slice(0, 5);
    const rs = eras.map((era) => ({ era, region: pickRegion(era, rnd, [], null) }));
    setDaily(isDaily);
    setRounds(rs);
    setRound(0);
    setPicks([]);
    setEraSkip(true);
    setRegionSkip(true);
    setTrials([]);
    setRevealed(0);
    setCopied(false);
    setOpenTrial(-1);
    clearTimeout(spinTimer.current);
    setReel(null);
    setLanded(false);
    setPhase("draft");
  }

  const usedKeys = picks.map((p) => p.cityKey);
  const openSlots = STAT_KEYS.map((_, i) => i).filter((i) => !picks.some((p) => p.slot === i));
  const cur = rounds[round];
  const pool = cur ? poolFor(cur.era, cur.region, usedKeys) : [];

  function doEraSkip() {
    if (!eraSkip || reel || !landed) return;
    const rnd = rngRef.current;
    const used = rounds.map((r) => r.era);
    const remaining = ERAS.map((e) => e.key).filter((k) => !used.includes(k));
    if (!remaining.length) return;
    const newEra = remaining[Math.floor(rnd() * remaining.length)];
    // Keep the current region when it still has cities in the new era,
    // so only the era reel spins; otherwise both reels go.
    const keepRegion = poolFor(newEra, cur.region, usedKeys).length >= 2;
    const next = [...rounds];
    next[round] = {
      era: newEra,
      region: keepRegion ? cur.region : pickRegion(newEra, rnd, usedKeys, null),
    };
    setRounds(next);
    setEraSkip(false);
    spinReels(keepRegion ? "era" : "both");
  }

  function doRegionSkip() {
    if (!regionSkip || reel || !landed) return;
    const rnd = rngRef.current;
    const next = [...rounds];
    next[round] = { ...cur, region: pickRegion(cur.era, rnd, usedKeys, cur.region) };
    setRounds(next);
    setRegionSkip(false);
    spinReels("region");
  }

  function pickCity(city, slot) {
    const newPicks = [...picks, { ...city, slot }];
    setPicks(newPicks);
    if (round < 4) {
      setRound(round + 1);
      setLanded(false); // next round waits for its spin
    } else runSim(newPicks);
  }

  // With 13 regions, same-city locks can empty a dealt pool by the time the
  // round comes up. Redraw the region for free (the player keeps their rerolls).
  useEffect(() => {
    if (phase !== "draft" || !cur || !landed || reel) return;
    if (poolFor(cur.era, cur.region, usedKeys).length > 0) return;
    const rnd = rngRef.current;
    const next = [...rounds];
    next[round] = { ...cur, region: pickRegion(cur.era, rnd, usedKeys, cur.region) };
    setRounds(next);
    spinReels("region");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, landed, reel, round, picks]);

  function runSim(finalPicks) {
    // Independent stream seeded from the run seed only: on a Daily, every player faces
    // the same trials, same difficulties, same fortune — regardless of skips used.
    const rnd = mulberry32(hashStr(String(seedRef.current) + "::trials"));
    const ts = teamStats(finalPicks);
    const deck = shuffle(TRIALS, rnd).slice(0, 10);
    // Fixed difficulty ladder, shuffled: every run has easy centuries and brutal ones.
    const ladder = shuffle([58, 62, 66, 70, 74, 78, 82, 85, 88, 92], rnd);
    const results = [];
    let wounds = 0;
    for (let i = 0; i < deck.length; i++) {
      const t = deck[i];
      const score = Math.round(t.stats.reduce((a, s) => a + ts[s], 0) / t.stats.length);
      const difficulty = ladder[i];
      const roll = Math.floor(rnd() * 21) - 10; // fortune: −10 … +10
      const pass = score + roll >= difficulty;
      // The city holding the trial's primary attribute is your specialist — it narrates.
      const hero = finalPicks.find((p) => p.slot === t.stats[0]);
      let kind = "pass";
      let text = t.pass.replace("{c}", hero.name);
      if (!pass) {
        wounds += 1;
        if (wounds === 1) {
          kind = "darkage";
          text = t.fail + " A Dark Age descends. Your civilization reels, but rebuilds.";
        } else {
          kind = "collapse";
          text = t.fail;
        }
      }
      results.push({ ...t, score, difficulty, roll, kind, text });
      if (kind === "collapse") break;
    }
    setTrials(results);
    setRevealed(0);
    setPhase("sim");
  }

  // sequential reveal
  useEffect(() => {
    if (phase !== "sim" || revealed >= trials.length) return;
    const id = setTimeout(() => setRevealed(revealed + 1), revealed === 0 ? 700 : 1050);
    return () => clearTimeout(id);
  }, [phase, revealed, trials]);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revealed]);

  const done = phase === "sim" && revealed >= trials.length;
  const survived = trials.filter((t) => t.kind === "pass").length;
  const collapsed = trials.some((t) => t.kind === "collapse");
  const scarred = trials.some((t) => t.kind === "darkage");
  const eternal = survived === 10;
  const years = survived * 100;

  const ICONS = { pass: "🏛️", darkage: "🌑", collapse: "💀" };

  function shareText() {
    const grid = trials.map((t) => ICONS[t.kind]).join("") + (eternal ? "✨" : "");
    const head = eternal
      ? "I built an ETERNAL CITY: 1,000 flawless years"
      : collapsed
        ? `My civilization endured ${years} years`
        : `My civilization endured ${years} years, scarred by a Dark Age`;
    return `ETERNAL CITY${daily ? ` · Daily No. ${dailyNumber()}` : ""}${historian ? " · Historian Mode" : ""}\n${head}\n${grid}`;
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied("manual");
    }
  }

  // ---------------- render ----------------
  return (
    <div className="min-h-screen w-full" style={{ background: C.ink, color: C.marble }}>
      <div className="mx-auto px-4 py-8" style={{ maxWidth: 560 }}>
        {/* masthead */}
        <div className="text-center mb-6">
          <div style={{ ...CAPS, fontSize: 10, color: C.goldSoft }}>· DRAFT FIVE CITIES · SURVIVE TEN TRIALS ·</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 40, letterSpacing: "0.06em", margin: "4px 0 0", color: C.gold, fontWeight: 400 }}>
            ETERNAL CITY
          </h1>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.goldSoft}, transparent)`, marginTop: 10 }} />
        </div>

        {/* ============ TITLE ============ */}
        {phase === "title" && (
          <div className="flex flex-col gap-5">
            <p style={{ fontFamily: DISPLAY, fontSize: 16, lineHeight: 1.6, color: C.marble, textAlign: "center" }}>
              History deals you a random <span style={{ color: C.gold }}>era</span> and{" "}
              <span style={{ color: C.gold }}>region</span>. Take a single attribute from a single
              city: Scale, Wealth, Culture, Knowledge, or Might. Five picks fill five slots,
              one per era, and each city may serve only once across all of history. One era reroll,
              one region reroll.
            </p>
            <p style={{ fontFamily: DISPLAY, fontSize: 16, lineHeight: 1.6, color: C.dim, textAlign: "center" }}>
              Then your civilization faces ten trials of rising and falling difficulty: plague, siege,
              schism, collapse, etc. Each trial endured is a century. One failure is a Dark Age you can
              rebuild from. A second is the end. Can you last 1,000 years?
            </p>
            <div className="flex flex-col items-center gap-3 mt-2">
              <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
                {[
                  { v: false, label: "Open Ledger", sub: "stats visible" },
                  { v: true, label: "Historian", sub: "stats hidden" },
                ].map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setHistorian(m.v)}
                    className="px-4 py-2"
                    style={{
                      cursor: "pointer",
                      background: historian === m.v ? C.raised : "transparent",
                      borderBottom: `2px solid ${historian === m.v ? C.gold : "transparent"}`,
                    }}
                  >
                    <div style={{ ...CAPS, fontSize: 11, color: historian === m.v ? C.gold : C.dim }}>{m.label}</div>
                    <div style={{ ...CAPS, fontSize: 8, color: C.dim }}>{m.sub}</div>
                  </button>
                ))}
              </div>
              <Btn kind="gold" onClick={() => startRun(true)} style={{ width: 260, padding: "12px 0", fontSize: 13 }}>
                Daily Run · No. {dailyNumber()}
              </Btn>
              <Btn onClick={() => startRun(false)} style={{ width: 260, padding: "12px 0", fontSize: 13 }}>
                Free Play
              </Btn>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-4">
              {STAT_LABELS.map((l, i) => (
                <div key={l} className="text-center rounded p-2" style={{ background: C.raised, border: `1px solid ${C.line}` }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 13, color: C.gold }}>{["⚖","🪙","🎭","📜","⚔"][i]}</div>
                  <div style={{ ...CAPS, fontSize: 8, color: C.dim, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <p style={{ ...CAPS, fontSize: 9, color: C.dim, textAlign: "center" }}>
              Ratings are era-adjusted
            </p>
            <FaqSection />
          </div>
        )}

        {/* ============ DRAFT ============ */}
        {phase === "draft" && cur && (
          <div className="flex flex-col gap-4">
            {/* progress */}
            <div className="flex items-center justify-center gap-2">
              {ROMAN.map((r, i) => (
                <div
                  key={r}
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 30, height: 30, fontFamily: DISPLAY, fontSize: 12,
                    border: `1px solid ${i === round ? C.gold : C.line}`,
                    color: i < round ? C.ink : i === round ? C.gold : C.dim,
                    background: i < round ? C.gold : "transparent",
                  }}
                >
                  {r}
                </div>
              ))}
            </div>

            {/* the spin plaque */}
            <Plaque style={{ textAlign: "center", padding: "18px 16px" }}>
              <div style={{ ...CAPS, fontSize: 10, color: C.dim }}>
                {landed || reel?.settled ? "History deals you" : reel ? "The wheel turns…" : "Spin for your era and region"}
              </div>
              {landed ? (
                <>
                  <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.gold, marginTop: 4 }}>
                    {ERAS.find((e) => e.key === cur.era).label}
                    <span style={{ fontSize: 15, color: C.dim }}> · {ERAS.find((e) => e.key === cur.era).range}</span>
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, color: C.marble, marginTop: 2 }}>{REGIONS[cur.region]}</div>
                  <div className="flex justify-center gap-3 mt-3">
                    <Btn onClick={doEraSkip} disabled={!eraSkip}>↻ Reroll era {eraSkip ? "" : "· used"}</Btn>
                    <Btn onClick={doRegionSkip} disabled={!regionSkip}>↻ Reroll region {regionSkip ? "" : "· used"}</Btn>
                  </div>
                </>
              ) : reel ? (
                <>
                  <div style={{ fontFamily: DISPLAY, fontSize: 26, marginTop: 4, color: C.gold }}>
                    {ERAS.find((e) => e.key === (reel.era && !reel.settled ? reel.dispEra : cur.era)).label}
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, marginTop: 2, color: C.marble }}>
                    {REGIONS[reel.region && !reel.settled ? reel.dispRegion : cur.region]}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.line, marginTop: 4, letterSpacing: "0.3em" }}>· · ·</div>
                  <div className="flex justify-center mt-3">
                    <Btn kind="gold" onClick={() => spinReels("both")} style={{ width: 180, padding: "10px 0", fontSize: 12 }}>
                      Spin
                    </Btn>
                  </div>
                </>
              )}
            </Plaque>

            {/* city pool — revealed once the reels land */}
            <div className="flex flex-col gap-2">
              {landed && pool.map((city) => (
                <div
                  key={city.id}
                  className="rounded-lg text-left px-4 py-3 w-full"
                  style={{ background: C.slab, border: `1px solid ${C.line}` }}
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span style={{ fontFamily: DISPLAY, fontSize: 21, color: C.marble }}>{city.name}</span>
                  </div>
                  {!historian && (
                    <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 12, color: C.dim, marginTop: 2 }}>
                      {city.tag}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {STAT_KEYS.map((_, i) =>
                      openSlots.includes(i) ? (
                        <button
                          key={i}
                          onClick={() => pickCity(city, i)}
                          className="rounded px-2 py-1"
                          style={{ ...CAPS, fontSize: 10, cursor: "pointer", color: C.gold, border: `1px solid ${C.goldSoft}`, background: C.raised }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.goldSoft)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = C.raised)}
                        >
                          {STAT_LABELS[i]}{historian ? "" : ` ${city.s[i]}`}
                        </button>
                      ) : (
                        <span key={i} className="rounded px-2 py-1" style={{ ...CAPS, fontSize: 10, color: C.line, border: `1px solid ${C.line}` }}>
                          {STAT_LABELS[i]}
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* roster so far */}
            <div>
              <div style={{ ...CAPS, fontSize: 9, color: C.dim, marginBottom: 6 }}>Your Eternal City</div>
              <div className="flex flex-col gap-1">
                {STAT_KEYS.map((_, i) => {
                  const owner = picks.find((p) => p.slot === i);
                  return (
                    <div key={i} className="flex items-center gap-2 rounded px-2 py-1" style={{ background: C.raised, border: `1px solid ${owner ? C.goldSoft : C.line}` }}>
                      <span style={{ ...CAPS, fontSize: 9, color: owner ? C.gold : C.dim, width: 84, flexShrink: 0 }}>{STAT_LABELS[i]}</span>
                      <span style={{ fontFamily: DISPLAY, fontSize: 13, color: owner ? C.marble : C.line }}>
                        {owner ? `${eraName(owner)}${historian ? "" : ` · ${owner.s[i]}`}` : "— unclaimed —"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============ SIM / RESULT ============ */}
        {phase === "sim" && (
          <div className="flex flex-col gap-4">
            {/* roster */}
            <div className="flex flex-wrap justify-center gap-2">
              {[...picks].sort((a, b) => a.slot - b.slot).map((p) => (
                <span key={p.id} className="rounded px-2 py-1" style={{ background: C.raised, border: `1px solid ${C.line}`, fontFamily: DISPLAY, fontSize: 12, color: C.marble }}>
                  {eraName(p)} <span style={{ ...CAPS, fontSize: 9, color: C.verdigris }}>{STAT_SHORT[p.slot]}</span>
                </span>
              ))}
            </div>

            {/* team stats */}
            <Plaque>
              <div style={{ ...CAPS, fontSize: 9, color: C.dim, marginBottom: 8 }}>Civilization rating</div>
              <div className="flex flex-col gap-2">
                {teamStats(picks).map((v, i) => (
                  <StatBar key={i} label={STAT_LABELS[i]} value={v} />
                ))}
              </div>
            </Plaque>

            {/* frieze */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => {
                const t = trials[i];
                const shown = i < revealed;
                const border = !shown ? C.line : t?.kind === "pass" ? C.goldSoft : t?.kind === "darkage" ? C.dim : C.blood;
                const bg = !shown ? C.ink : t?.kind === "collapse" ? "#2A1B17" : C.raised;
                return (
                  <div
                    key={i}
                    className="rounded flex items-center justify-center"
                    style={{
                      width: 38, height: 44, fontSize: 18,
                      background: bg,
                      border: `1px solid ${border}`,
                      transition: "all 300ms ease",
                    }}
                  >
                    {shown ? ICONS[t?.kind] : ""}
                  </div>
                );
              })}
            </div>

            {/* trial log */}
            {revealed > 0 && (
              <div style={{ ...CAPS, fontSize: 8, color: C.goldSoft, textAlign: "center" }}>
                tap any century to see how it was decided
              </div>
            )}
            <div className="flex flex-col gap-2">
              {trials.slice(0, revealed).map((t, i) => {
                const edge = t.kind === "pass" ? C.verdigris : t.kind === "darkage" ? C.goldSoft : C.blood;
                const verdict = t.kind === "pass" ? "Endured" : t.kind === "darkage" ? "Dark Age" : "Collapse";
                const isOpen = openTrial === i;
                const margin = t.score + t.roll - t.difficulty;
                return (
                  <div
                    key={i}
                    className="rounded-lg px-4 py-3"
                    style={{ background: C.slab, borderLeft: `3px solid ${edge}`, cursor: "pointer" }}
                    onClick={() => setOpenTrial(isOpen ? -1 : i)}
                  >
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span style={{ fontFamily: DISPLAY, fontSize: 15, color: t.kind === "collapse" ? C.blood : C.marble }}>
                        Century {["I","II","III","IV","V","VI","VII","VIII","IX","X"][i]} · {t.name}
                      </span>
                      <span style={{ ...CAPS, fontSize: 9, color: C.dim }}>
                        {t.stats.map((s) => STAT_SHORT[s]).join("+")} {t.score} vs {t.difficulty} · fortune {t.roll >= 0 ? "+" : ""}{t.roll}
                        <span style={{ color: C.goldSoft, marginLeft: 6 }}>{isOpen ? "−" : "+"}</span>
                      </span>
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 13, color: t.kind === "pass" ? C.dim : C.marble, marginTop: 3 }}>
                      {t.text} <span style={{ ...CAPS, fontStyle: "normal", fontSize: 9, color: edge }}>· {verdict}</span>
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                        <div style={{ ...CAPS, fontSize: 9, color: C.goldSoft, marginBottom: 6 }}>How the century was decided</div>
                        <div className="flex flex-col gap-1" style={{ fontFamily: DISPLAY, fontSize: 13, color: C.marble }}>
                          {t.stats.map((s) => {
                            const owner = picks.find((p) => p.slot === s);
                            return (
                              <div key={s} className="flex justify-between gap-2">
                                <span style={{ color: C.dim }}>{STAT_LABELS[s]} · {owner ? eraName(owner) : "unclaimed"}</span>
                                <span style={{ fontVariantNumeric: "tabular-nums" }}>{owner ? owner.s[s] : 0}</span>
                              </div>
                            );
                          })}
                          {t.stats.length > 1 && (
                            <div className="flex justify-between gap-2">
                              <span style={{ color: C.dim }}>Averaged together</span>
                              <span style={{ fontVariantNumeric: "tabular-nums" }}>{t.score}</span>
                            </div>
                          )}
                          <div className="flex justify-between gap-2">
                            <span style={{ color: C.dim }}>Fortune of the century (−10 to +10)</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{t.roll >= 0 ? "+" : ""}{t.roll}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span style={{ color: C.dim }}>Needed to endure</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{t.difficulty}</span>
                          </div>
                          <div className="flex justify-between gap-2" style={{ color: edge }}>
                            <span>{t.kind === "pass" ? "Endured by" : "Fell short by"}</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.abs(margin)}</span>
                          </div>
                        </div>
                        <div style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: C.dim, marginTop: 8 }}>
                          {t.lore}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={logEnd} />
            </div>

            {/* verdict */}
            {done && (
              <div className="text-center flex flex-col gap-4 mt-2">
                <div>
                  {eternal ? (
                    <>
                      <div style={{ fontFamily: DISPLAY, fontSize: 32, color: C.gold, letterSpacing: "0.08em" }}>ETERNAL CITY</div>
                      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 15, color: C.marble }}>
                        One thousand flawless years.
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: DISPLAY, fontSize: 28, color: C.marble }}>
                        Endured <span style={{ color: C.gold }}>{years} years</span>
                      </div>
                      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 14, color: C.dim }}>
                        {collapsed
                          ? `${trials[trials.length - 1].name} brought the end.`
                          : "Scarred by a Dark Age, but still standing."}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 20, letterSpacing: 2 }}>
                  {trials.map((t) => ICONS[t.kind]).join("")}{eternal ? "✨" : ""}
                </div>
                <div className="flex justify-center gap-3">
                  <Btn kind="gold" onClick={copyShare}>{copied === true ? "Copied" : "Copy result"}</Btn>
                  <Btn onClick={() => startRun(false)}>Run it back</Btn>
                </div>
                {copied === "manual" && (
                  <textarea
                    readOnly
                    value={shareText()}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded p-3"
                    style={{ background: C.raised, color: C.marble, border: `1px solid ${C.line}`, fontFamily: DISPLAY, fontSize: 12, height: 110 }}
                  />
                )}
                <div className="text-left mt-2">
                  <div style={{ ...CAPS, fontSize: 9, color: C.dim, marginBottom: 8, textAlign: "center" }}>The cities you drafted</div>
                  <div className="flex flex-col gap-2">
                    {[...picks].sort((a, b) => a.slot - b.slot).map((p) => (
                      <div key={p.id} className="rounded-lg px-4 py-3" style={{ background: C.slab, border: `1px solid ${C.line}` }}>
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span style={{ fontFamily: DISPLAY, fontSize: 16, color: C.marble }}>
                            {eraName(p)}
                          </span>
                          <span style={{ ...CAPS, fontSize: 10, color: C.gold }}>{STAT_LABELS[p.slot]} {p.s[p.slot]}</span>
                        </div>
                        <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 13, color: C.dim, marginTop: 3 }}>{p.tag}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ ...CAPS, fontSize: 9, color: C.dim }}>
                  {daily ? `Daily No. ${dailyNumber()} · same draft for everyone today` : "Free play"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
