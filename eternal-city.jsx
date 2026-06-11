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
  EU: "Europe",
  EA: "East Asia",
  SA: "South & SE Asia",
  ME: "Middle East & N. Africa",
  AF: "Sub-Saharan Africa",
  AM: "The Americas",
};

const STAT_KEYS = ["scale", "wealth", "culture", "knowledge", "might"];
const STAT_LABELS = ["Scale", "Wealth", "Culture", "Knowledge", "Might"];
const STAT_SHORT = ["SCL", "WLT", "CUL", "KNW", "MGT"];

// ---------- city-era cards: [scale, wealth, culture, knowledge, might] ----------
// >>> CITY DATA START (managed by csv-to-data.mjs — edit eternal-city-cards.csv instead)
const CITIES = [
  { name: "Rome", ep: "Imperial", era: "ancient", region: "EU", s: [97, 90, 88, 80, 99], tag: "A million souls; all roads lead here." },
  { name: "Athens", ep: "Classical", era: "ancient", region: "EU", s: [60, 68, 96, 98, 72], tag: "Philosophy, drama, and democracy from one harbor town." },
  { name: "Syracuse", ep: "Greek Sicily", era: "ancient", region: "EU", s: [58, 72, 78, 84, 74], tag: "Archimedes' hometown — rich, brilliant, hard to besiege." },
  { name: "Chang'an", ep: "Han", era: "ancient", region: "EA", s: [88, 80, 76, 80, 92], tag: "Eastern terminus of the Silk Road." },
  { name: "Luoyang", ep: "Han", era: "ancient", region: "EA", s: [80, 72, 74, 80, 84], tag: "Nine dynasties called it capital." },
  { name: "Pataliputra", ep: "Mauryan", era: "ancient", region: "SA", s: [90, 80, 74, 84, 92], tag: "Ashoka's seat — among the largest cities on Earth." },
  { name: "Anuradhapura", ep: "Sinhalese", era: "ancient", region: "SA", s: [62, 64, 72, 76, 66], tag: "Sacred stupas and vast reservoir engineering." },
  { name: "Alexandria", ep: "Ptolemaic", era: "ancient", region: "ME", s: [86, 86, 88, 99, 74], tag: "The Library, the Lighthouse, the world's knowledge." },
  { name: "Babylon", ep: "Neo-Babylonian", era: "ancient", region: "ME", s: [84, 80, 84, 86, 86], tag: "Hanging gardens, astronomy, the first metropolis." },
  { name: "Carthage", ep: "Punic", era: "ancient", region: "ME", s: [76, 93, 72, 68, 86], tag: "Merchant empire that nearly broke Rome." },
  { name: "Persepolis", ep: "Achaemenid", era: "ancient", region: "ME", s: [55, 86, 82, 70, 93], tag: "Ceremonial heart of the first world empire." },
  { name: "Teotihuacan", ep: "Classic", era: "ancient", region: "AM", s: [82, 72, 82, 72, 86], tag: "The Avenue of the Dead, planned on a grand grid." },
  { name: "Monte Albán", ep: "Zapotec", era: "ancient", region: "AM", s: [55, 55, 70, 66, 70], tag: "Mountaintop capital of the Zapotec world." },
  { name: "Meroë", ep: "Kushite", era: "ancient", region: "AF", s: [52, 66, 62, 64, 70], tag: "Iron-smelting royal city of pyramids on the Nile." },
  { name: "Aksum", ep: "Aksumite", era: "ancient", region: "AF", s: [56, 80, 64, 66, 76], tag: "Trading empire minting its own gold coin." },
  { name: "Sparta", ep: "Lacedaemon", era: "ancient", region: "EU", s: [42, 40, 52, 48, 90], tag: "No walls. The men are the walls." },
  { name: "Corinth", ep: "Isthmian", era: "ancient", region: "EU", s: [52, 78, 68, 58, 64], tag: "Toll booth of two seas." },
  { name: "Linzi", ep: "Qi", era: "ancient", region: "EA", s: [70, 76, 62, 70, 68], tag: "Teeming capital of the Warring States' richest kingdom." },
  { name: "Chengdu", ep: "Shu", era: "ancient", region: "EA", s: [58, 66, 64, 62, 56], tag: "Brocade city behind the mountains." },
  { name: "Taxila", ep: "Gandharan", era: "ancient", region: "SA", s: [48, 60, 70, 86, 58], tag: "Crossroads university where Greek met Buddhist." },
  { name: "Madurai", ep: "Pandyan", era: "ancient", region: "SA", s: [52, 60, 74, 58, 56], tag: "Temple city of Tamil poets." },
  { name: "Memphis", ep: "Egyptian", era: "ancient", region: "ME", s: [62, 62, 76, 72, 66], tag: "Balance of the Two Lands." },
  { name: "Jerusalem", ep: "Second Temple", era: "ancient", region: "ME", s: [46, 46, 82, 74, 50], tag: "Small city, vast gravity." },
  { name: "Napata", ep: "Kushite", era: "ancient", region: "AF", s: [38, 48, 54, 50, 58], tag: "Holy mountain seat of the Black Pharaohs." },
  { name: "Adulis", ep: "Red Sea", era: "ancient", region: "AF", s: [36, 62, 44, 42, 46], tag: "Aksum's window on the sea." },
  { name: "El Mirador", ep: "Preclassic Maya", era: "ancient", region: "AM", s: [52, 46, 58, 56, 60], tag: "Pyramids bigger than anything the Maya built after." },
  { name: "Caral", ep: "Norte Chico", era: "ancient", region: "AM", s: [34, 38, 46, 44, 38], tag: "The Americas' first city — older than Giza." },
  { name: "Constantinople", ep: "Byzantine", era: "medieval", region: "EU", s: [92, 93, 90, 86, 93], tag: "The Queen of Cities behind triple walls." },
  { name: "Córdoba", ep: "Umayyad", era: "medieval", region: "EU", s: [82, 82, 90, 95, 78], tag: "Europe's greatest library while Paris was mud streets." },
  { name: "Venice", ep: "Maritime Republic", era: "medieval", region: "EU", s: [70, 93, 80, 74, 82], tag: "A republic of merchants rising from a lagoon." },
  { name: "Paris", ep: "Capetian", era: "medieval", region: "EU", s: [76, 72, 82, 90, 78], tag: "The Sorbonne makes it Christendom's classroom." },
  { name: "Chang'an", ep: "Tang", era: "medieval", region: "EA", s: [99, 90, 93, 88, 95], tag: "A million people, a grid of wards, the world's crossroads." },
  { name: "Kaifeng", ep: "Song", era: "medieval", region: "EA", s: [96, 95, 86, 91, 82], tag: "Gunpowder, paper money, restaurants open all night." },
  { name: "Hangzhou", ep: "Southern Song", era: "medieval", region: "EA", s: [95, 96, 91, 88, 76], tag: "Marco Polo called it the finest city in the world." },
  { name: "Kyoto", ep: "Heian", era: "medieval", region: "EA", s: [80, 70, 93, 82, 68], tag: "The Tale of Genji's refined court." },
  { name: "Angkor", ep: "Khmer", era: "medieval", region: "SA", s: [94, 80, 89, 76, 88], tag: "The largest preindustrial city ever built." },
  { name: "Delhi", ep: "Sultanate", era: "medieval", region: "SA", s: [82, 80, 76, 78, 88], tag: "Fortress capital astride the Indian plains." },
  { name: "Baghdad", ep: "Abbasid", era: "medieval", region: "ME", s: [95, 92, 91, 99, 90], tag: "The House of Wisdom; the round city of the caliphs." },
  { name: "Cairo", ep: "Fatimid", era: "medieval", region: "ME", s: [88, 90, 84, 90, 85], tag: "Al-Azhar and a thousand minarets." },
  { name: "Merv", ep: "Seljuk", era: "medieval", region: "ME", s: [90, 85, 76, 88, 78], tag: "Briefly the largest city on Earth — then the Mongols came." },
  { name: "Kilwa", ep: "Swahili Coast", era: "medieval", region: "AF", s: [56, 88, 70, 70, 62], tag: "Gold, ivory, and coral palaces on the Indian Ocean." },
  { name: "Great Zimbabwe", ep: "Shona", era: "medieval", region: "AF", s: [52, 74, 58, 52, 68], tag: "Stone walls without mortar; hub of the gold trade." },
  { name: "Cahokia", ep: "Mississippian", era: "medieval", region: "AM", s: [48, 52, 55, 50, 62], tag: "Mound city larger than the London of its day." },
  { name: "Tikal", ep: "Maya", era: "medieval", region: "AM", s: [62, 58, 72, 74, 70], tag: "Pyramids above the canopy; astronomy in stone." },
  { name: "Palermo", ep: "Norman", era: "medieval", region: "EU", s: [62, 74, 84, 82, 70], tag: "Three faiths, one dazzling court." },
  { name: "Novgorod", ep: "Republic", era: "medieval", region: "EU", s: [48, 76, 60, 58, 62], tag: "Merchant republic at the edge of the forest." },
  { name: "Nara", ep: "Imperial", era: "medieval", region: "EA", s: [54, 52, 80, 70, 48], tag: "The Great Buddha and Japan's first permanent capital." },
  { name: "Pagan", ep: "Bagan", era: "medieval", region: "SA", s: [62, 58, 82, 66, 62], tag: "Ten thousand temples on a dry plain." },
  { name: "Polonnaruwa", ep: "Sinhalese", era: "medieval", region: "SA", s: [50, 56, 66, 62, 58], tag: "Reservoirs like inland seas." },
  { name: "Damascus", ep: "Ayyubid", era: "medieval", region: "ME", s: [70, 78, 80, 82, 76], tag: "Oldest city still arguing about it." },
  { name: "Fez", ep: "Idrisid", era: "medieval", region: "ME", s: [58, 70, 78, 86, 60], tag: "Home of the world's oldest university." },
  { name: "Lalibela", ep: "Zagwe", era: "medieval", region: "AF", s: [34, 40, 76, 54, 46], tag: "Churches carved down into living rock." },
  { name: "Mogadishu", ep: "Sultanate", era: "medieval", region: "AF", s: [46, 72, 58, 54, 50], tag: "Ports, poets, and ocean trade." },
  { name: "Chichén Itzá", ep: "Maya-Toltec", era: "medieval", region: "AM", s: [58, 60, 76, 72, 68], tag: "The serpent descends the steps each equinox." },
  { name: "Chan Chan", ep: "Chimú", era: "medieval", region: "AM", s: [56, 58, 60, 50, 62], tag: "Largest adobe city ever raised." },
  { name: "Florence", ep: "Medici", era: "renaissance", region: "EU", s: [60, 92, 99, 93, 70], tag: "A banking fortune turned into the Renaissance." },
  { name: "Venice", ep: "La Serenissima", era: "renaissance", region: "EU", s: [78, 97, 93, 86, 86], tag: "Half empire, half art gallery, all merchant." },
  { name: "Lisbon", ep: "Age of Discovery", era: "renaissance", region: "EU", s: [72, 93, 76, 82, 86], tag: "Spice fleets redraw the map of the world." },
  { name: "Seville", ep: "Golden Age", era: "renaissance", region: "EU", s: [76, 94, 80, 72, 80], tag: "Every galleon of American silver lands here." },
  { name: "Beijing", ep: "Ming", era: "renaissance", region: "EA", s: [98, 88, 88, 86, 95], tag: "The Forbidden City at the heart of the largest state on Earth." },
  { name: "Nanjing", ep: "Early Ming", era: "renaissance", region: "EA", s: [92, 86, 82, 84, 90], tag: "Treasure fleets launched from its yards." },
  { name: "Vijayanagara", ep: "City of Victory", era: "renaissance", region: "SA", s: [93, 89, 86, 78, 90], tag: "Diamond markets and granite temples; travelers' jaws dropped." },
  { name: "Malacca", ep: "Sultanate", era: "renaissance", region: "SA", s: [60, 95, 72, 66, 70], tag: "The strait where every trade wind meets." },
  { name: "Istanbul", ep: "Ottoman", era: "renaissance", region: "ME", s: [95, 92, 91, 85, 97], tag: "The Conqueror's capital, bridging two continents." },
  { name: "Samarkand", ep: "Timurid", era: "renaissance", region: "ME", s: [70, 86, 87, 91, 85], tag: "Registan blue; Ulugh Beg's observatory." },
  { name: "Cairo", ep: "Mamluk", era: "renaissance", region: "ME", s: [88, 90, 85, 86, 82], tag: "Slave-soldiers ruling the richest crossroads on Earth." },
  { name: "Timbuktu", ep: "Songhai", era: "renaissance", region: "AF", s: [60, 86, 80, 91, 66], tag: "Books worth more than gold in the desert." },
  { name: "Benin City", ep: "Edo Kingdom", era: "renaissance", region: "AF", s: [62, 72, 84, 60, 76], tag: "Bronze masterworks and miles of earthen walls." },
  { name: "Tenochtitlan", ep: "Aztec", era: "renaissance", region: "AM", s: [92, 82, 86, 76, 93], tag: "A city on a lake that stunned the conquistadors." },
  { name: "Cusco", ep: "Inca", era: "renaissance", region: "AM", s: [70, 76, 80, 72, 90], tag: "Navel of the world, knot of ten thousand roads." },
  { name: "Antwerp", ep: "Golden Age", era: "renaissance", region: "EU", s: [62, 93, 74, 70, 58], tag: "Half of world trade through one harbor." },
  { name: "Nuremberg", ep: "Free City", era: "renaissance", region: "EU", s: [50, 76, 80, 82, 58], tag: "Dürer's workshop; the printing boom's machine shop." },
  { name: "Kyoto", ep: "Muromachi", era: "renaissance", region: "EA", s: [70, 62, 88, 72, 50], tag: "Zen gardens amid the warring states." },
  { name: "Hangzhou", ep: "Ming", era: "renaissance", region: "EA", s: [80, 82, 78, 72, 56], tag: "Still lovely, no longer the center." },
  { name: "Agra", ep: "Early Mughal", era: "renaissance", region: "SA", s: [70, 78, 80, 68, 84], tag: "A dynasty finding its grandeur." },
  { name: "Pegu", ep: "Burmese", era: "renaissance", region: "SA", s: [52, 70, 62, 52, 64], tag: "Gilded port the Portuguese marveled at." },
  { name: "Tabriz", ep: "Silk Road", era: "renaissance", region: "ME", s: [62, 80, 80, 76, 70], tag: "Carpet looms and caravanserais." },
  { name: "Aleppo", ep: "Crossroads", era: "renaissance", region: "ME", s: [60, 82, 70, 62, 64], tag: "Where the caravans changed hands." },
  { name: "Gao", ep: "Songhai", era: "renaissance", region: "AF", s: [56, 72, 58, 66, 72], tag: "Imperial capital on the Niger bend." },
  { name: "Mbanza Kongo", ep: "Kongo", era: "renaissance", region: "AF", s: [42, 48, 56, 46, 60], tag: "Seat of the manikongo." },
  { name: "Cholula", ep: "Sacred", era: "renaissance", region: "AM", s: [46, 50, 68, 56, 52], tag: "The widest pyramid on Earth." },
  { name: "Quito", ep: "Northern Inca", era: "renaissance", region: "AM", s: [44, 48, 54, 48, 62], tag: "The empire's second city, high in the clouds." },
  { name: "Amsterdam", ep: "Dutch Golden Age", era: "earlymodern", region: "EU", s: [70, 99, 86, 91, 80], tag: "The first stock exchange; Rembrandt upstairs." },
  { name: "London", ep: "Georgian", era: "earlymodern", region: "EU", s: [94, 96, 89, 92, 95], tag: "Coffeehouses, the Royal Society, an empire's ledger." },
  { name: "Paris", ep: "Enlightenment", era: "earlymodern", region: "EU", s: [92, 90, 97, 96, 92], tag: "Salons where the modern world got argued into being." },
  { name: "Vienna", ep: "Habsburg", era: "earlymodern", region: "EU", s: [72, 76, 93, 88, 86], tag: "Mozart and Haydn on retainer." },
  { name: "St. Petersburg", ep: "Imperial", era: "earlymodern", region: "EU", s: [72, 76, 86, 82, 88], tag: "A capital willed out of a swamp by a tsar." },
  { name: "Edo", ep: "Tokugawa", era: "earlymodern", region: "EA", s: [99, 86, 92, 80, 88], tag: "A million people in the world's largest city — at peace." },
  { name: "Beijing", ep: "Qing", era: "earlymodern", region: "EA", s: [97, 88, 85, 82, 94], tag: "The Qianlong zenith." },
  { name: "Kyoto", ep: "Edo-period", era: "earlymodern", region: "EA", s: [78, 72, 94, 82, 58], tag: "Old capital of temples, weavers, and tea." },
  { name: "Guangzhou", ep: "Canton Trade", era: "earlymodern", region: "EA", s: [82, 93, 72, 70, 70], tag: "The one door through which the West met China." },
  { name: "Delhi", ep: "Mughal", era: "earlymodern", region: "SA", s: [94, 92, 90, 82, 94], tag: "The Peacock Throne: 'if there is paradise on earth…'" },
  { name: "Ayutthaya", ep: "Siamese", era: "earlymodern", region: "SA", s: [72, 86, 80, 66, 76], tag: "Island capital that traders compared to Paris." },
  { name: "Istanbul", ep: "Tulip Era", era: "earlymodern", region: "ME", s: [92, 88, 86, 80, 90], tag: "Imperial confidence in full bloom." },
  { name: "Isfahan", ep: "Safavid", era: "earlymodern", region: "ME", s: [85, 86, 95, 85, 88], tag: "'Isfahan is half the world.'" },
  { name: "Potosí", ep: "Silver Mountain", era: "earlymodern", region: "AM", s: [80, 97, 55, 50, 58], tag: "The mine that bankrolled an empire." },
  { name: "Mexico City", ep: "Viceregal", era: "earlymodern", region: "AM", s: [76, 84, 80, 76, 78], tag: "Crossroads of two oceans' trade." },
  { name: "Philadelphia", ep: "Revolutionary", era: "earlymodern", region: "AM", s: [52, 70, 72, 82, 72], tag: "Franklin's town; a constitution drafted here." },
  { name: "Kano", ep: "Hausa", era: "earlymodern", region: "AF", s: [52, 72, 58, 60, 64], tag: "Walled emporium of the Saharan trade." },
  { name: "Gondar", ep: "Ethiopian", era: "earlymodern", region: "AF", s: [46, 56, 68, 62, 68], tag: "Castle city of the highlands." },
  { name: "Madrid", ep: "Siglo de Oro", era: "earlymodern", region: "EU", s: [70, 72, 86, 72, 86], tag: "Velázquez at court, Cervantes in print." },
  { name: "Naples", ep: "Bourbon", era: "earlymodern", region: "EU", s: [82, 66, 82, 68, 64], tag: "Italy's biggest, loudest, hungriest city." },
  { name: "Osaka", ep: "Merchant", era: "earlymodern", region: "EA", s: [80, 90, 78, 66, 52], tag: "The nation's kitchen — rice futures invented here." },
  { name: "Nagasaki", ep: "Dejima", era: "earlymodern", region: "EA", s: [40, 70, 56, 68, 40], tag: "Japan's one window on the world." },
  { name: "Madras", ep: "Company Port", era: "earlymodern", region: "SA", s: [48, 70, 56, 58, 62], tag: "Fort St. George and the trade winds." },
  { name: "Batavia", ep: "VOC", era: "earlymodern", region: "SA", s: [48, 82, 54, 58, 66], tag: "A spice empire's counting house." },
  { name: "Cairo", ep: "Ottoman", era: "earlymodern", region: "ME", s: [80, 78, 76, 72, 66], tag: "Past its peak, still the Nile's metropolis." },
  { name: "Marrakesh", ep: "Saadian", era: "earlymodern", region: "ME", s: [54, 66, 74, 62, 68], tag: "Red city of the western caravans." },
  { name: "Lima", ep: "City of Kings", era: "earlymodern", region: "AM", s: [58, 80, 72, 70, 72], tag: "Viceregal splendor on the Pacific." },
  { name: "Boston", ep: "Colonial", era: "earlymodern", region: "AM", s: [42, 64, 64, 78, 58], tag: "Sermons, smugglers, and a tea problem." },
  { name: "Mombasa", ep: "Swahili", era: "earlymodern", region: "AF", s: [40, 62, 52, 46, 56], tag: "Fort Jesus guards the harbor." },
  { name: "Antananarivo", ep: "Merina", era: "earlymodern", region: "AF", s: [40, 46, 54, 44, 60], tag: "Highland capital of the great red island." },
  { name: "London", ep: "Victorian", era: "industrial", region: "EU", s: [99, 99, 92, 95, 99], tag: "The metropolis: a quarter of humanity ruled from here." },
  { name: "Paris", ep: "Haussmann", era: "industrial", region: "EU", s: [95, 92, 99, 95, 92], tag: "Boulevards, salons, and the century's art capital." },
  { name: "Vienna", ep: "Fin-de-siècle", era: "industrial", region: "EU", s: [88, 85, 97, 96, 87], tag: "Klimt, Freud, Mahler — one coffeehouse apart." },
  { name: "Berlin", ep: "Gründerzeit", era: "industrial", region: "EU", s: [88, 88, 87, 95, 92], tag: "Electricity, chemistry, and a new empire's swagger." },
  { name: "Manchester", ep: "Cottonopolis", era: "industrial", region: "EU", s: [80, 91, 64, 84, 68], tag: "The first industrial city — soot, steam, the future." },
  { name: "St. Petersburg", ep: "Tsarist", era: "industrial", region: "EU", s: [85, 82, 93, 88, 89], tag: "Tolstoy's drawing rooms, Mendeleev's table." },
  { name: "Tokyo", ep: "Meiji", era: "industrial", region: "EA", s: [92, 86, 85, 89, 90], tag: "From shogunate to world power in one generation." },
  { name: "Shanghai", ep: "Treaty Port", era: "industrial", region: "EA", s: [85, 90, 78, 72, 66], tag: "The Bund rises where empires trade." },
  { name: "Calcutta", ep: "Raj", era: "industrial", region: "SA", s: [90, 90, 86, 84, 82], tag: "Second city of the Empire; the Bengal Renaissance." },
  { name: "Bombay", ep: "Gateway", era: "industrial", region: "SA", s: [85, 90, 78, 76, 74], tag: "Cotton, railways, and a harbor full of the world." },
  { name: "Cairo", ep: "Khedival", era: "industrial", region: "ME", s: [76, 78, 77, 72, 70], tag: "Paris on the Nile, built on cotton and debt." },
  { name: "Istanbul", ep: "Tanzimat", era: "industrial", region: "ME", s: [85, 80, 82, 74, 80], tag: "An old empire reinventing itself at the strait." },
  { name: "New York", ep: "Gilded Age", era: "industrial", region: "AM", s: [96, 98, 88, 88, 84], tag: "Bridges, skyscrapers, and money that never sleeps." },
  { name: "Chicago", ep: "World's Fair", era: "industrial", region: "AM", s: [88, 92, 82, 86, 72], tag: "Inventor of the skyline." },
  { name: "Buenos Aires", ep: "Belle Époque", era: "industrial", region: "AM", s: [80, 89, 84, 76, 70], tag: "Richer per head than Paris, and dressed like it." },
  { name: "Rio de Janeiro", ep: "Imperial", era: "industrial", region: "AM", s: [74, 80, 80, 70, 74], tag: "A tropical court between mountains and sea." },
  { name: "Zanzibar", ep: "Sultanate", era: "industrial", region: "AF", s: [55, 84, 66, 56, 64], tag: "Cloves, dhows, and the Indian Ocean's bazaar." },
  { name: "Cape Town", ep: "Colonial", era: "industrial", region: "AF", s: [56, 72, 62, 66, 68], tag: "Tavern of the seas at the foot of Table Mountain." },
  { name: "Osaka", ep: "Meiji", era: "industrial", region: "EA", s: [76, 86, 68, 72, 60], tag: "Smokestacks over the merchant city." },
  { name: "Hong Kong", ep: "Colonial", era: "industrial", region: "EA", s: [52, 80, 58, 58, 54], tag: "'A barren rock,' they said." },
  { name: "Madras", ep: "Presidency", era: "industrial", region: "SA", s: [62, 70, 62, 64, 58], tag: "Southern anchor of the Raj." },
  { name: "Rangoon", ep: "Colonial", era: "industrial", region: "SA", s: [56, 76, 60, 56, 54], tag: "Rice port of the East." },
  { name: "Beirut", ep: "Nahda", era: "industrial", region: "ME", s: [44, 66, 76, 72, 44], tag: "The Arab renaissance, in print." },
  { name: "Alexandria", ep: "Cosmopolitan", era: "industrial", region: "ME", s: [60, 80, 74, 66, 54], tag: "Cotton money and Mediterranean swagger." },
  { name: "Boston", ep: "Brahmin", era: "industrial", region: "AM", s: [62, 78, 80, 88, 58], tag: "Universities, abolitionists, and old money." },
  { name: "San Francisco", ep: "Gold Rush", era: "industrial", region: "AM", s: [50, 84, 68, 62, 50], tag: "Instant city of fortune-seekers." },
  { name: "Lagos", ep: "Colonial Port", era: "industrial", region: "AF", s: [40, 60, 50, 42, 44], tag: "A lagoon town starting to boom." },
  { name: "Freetown", ep: "Krio", era: "industrial", region: "AF", s: [32, 46, 54, 56, 42], tag: "Founded by the freed; a university before most colonies." },
  { name: "Paris", ep: "Années Folles", era: "early20", region: "EU", s: [90, 88, 99, 95, 72], tag: "Picasso, Stein, Josephine Baker — everyone came." },
  { name: "London", ep: "Imperial Twilight", era: "early20", region: "EU", s: [95, 95, 90, 92, 96], tag: "Still the world's banker, soon its survivor." },
  { name: "Berlin", ep: "Weimar", era: "early20", region: "EU", s: [90, 84, 97, 96, 58], tag: "Cabaret, cinema, and physics rewriting reality." },
  { name: "Vienna", ep: "1900", era: "early20", region: "EU", s: [85, 78, 96, 98, 60], tag: "Freud, Wittgenstein, Schiele — one ring road." },
  { name: "Moscow", ep: "Soviet", era: "early20", region: "EU", s: [88, 74, 86, 88, 95], tag: "Avant-garde in the morning, five-year plans by night." },
  { name: "Shanghai", ep: "Jazz Age", era: "early20", region: "EA", s: [85, 92, 90, 78, 52], tag: "Paris of the East, spy capital of Asia." },
  { name: "Tokyo", ep: "Imperial", era: "early20", region: "EA", s: [95, 87, 85, 87, 92], tag: "Rebuilt from earthquake into a world capital." },
  { name: "Bombay", ep: "Interwar", era: "early20", region: "SA", s: [86, 86, 84, 76, 72], tag: "Mills, movie studios, and the independence press." },
  { name: "Calcutta", ep: "Late Raj", era: "early20", region: "SA", s: [85, 82, 87, 82, 70], tag: "Tagore's Nobel and a ferment of ideas." },
  { name: "Cairo", ep: "Golden Age", era: "early20", region: "ME", s: [82, 78, 90, 76, 72], tag: "Umm Kulthum on the radio; cinema for the whole Arab world." },
  { name: "Istanbul", ep: "Republican", era: "early20", region: "ME", s: [72, 66, 78, 72, 66], tag: "An imperial capital learning to be a city." },
  { name: "New York", ep: "Jazz Age", era: "early20", region: "AM", s: [99, 99, 97, 94, 93], tag: "Skyline, swing, and the capital of the 20th century." },
  { name: "Chicago", ep: "Roaring", era: "early20", region: "AM", s: [90, 91, 88, 85, 74], tag: "Jazz, gangsters, and architecture worth the trouble." },
  { name: "Los Angeles", ep: "Hollywood", era: "early20", region: "AM", s: [80, 86, 95, 78, 68], tag: "The dream factory invents global celebrity." },
  { name: "Mexico City", ep: "Muralist", era: "early20", region: "AM", s: [82, 76, 91, 78, 74], tag: "Rivera and Kahlo paint a revolution." },
  { name: "Havana", ep: "Prewar", era: "early20", region: "AM", s: [58, 76, 86, 62, 55], tag: "Rum, rumba, and neon over the Malecón." },
  { name: "Buenos Aires", ep: "Tango", era: "early20", region: "AM", s: [85, 88, 90, 79, 74], tag: "Borges in the cafés, tango in the streets." },
  { name: "Johannesburg", ep: "Gold Rush", era: "early20", region: "AF", s: [64, 84, 60, 62, 60], tag: "Instant city atop the world's richest reef." },
  { name: "Addis Ababa", ep: "Imperial", era: "early20", region: "AF", s: [48, 52, 60, 54, 68], tag: "Highland capital that faced down empires." },
  { name: "Zurich", ep: "Neutral", era: "early20", region: "EU", s: [40, 80, 70, 84, 42], tag: "Dada in the café, Einstein in the patent office." },
  { name: "Madrid", ep: "Silver Age", era: "early20", region: "EU", s: [62, 60, 80, 72, 58], tag: "Lorca's generation, before the storm." },
  { name: "Osaka", ep: "Taishō", era: "early20", region: "EA", s: [80, 85, 72, 72, 60], tag: "Japan's Manchester — briefly its largest city." },
  { name: "Harbin", ep: "Railway", era: "early20", region: "EA", s: [50, 62, 66, 56, 48], tag: "Russian cupolas in Manchuria." },
  { name: "Singapore", ep: "Crown Colony", era: "early20", region: "SA", s: [50, 80, 58, 58, 62], tag: "Crossroads of the East." },
  { name: "Rangoon", ep: "Interwar", era: "early20", region: "SA", s: [55, 72, 62, 55, 52], tag: "Wealthiest city in Southeast Asia, for a moment." },
  { name: "Beirut", ep: "Mandate", era: "early20", region: "ME", s: [44, 64, 76, 72, 40], tag: "Presses, universities, and a sea breeze." },
  { name: "Tehran", ep: "Pahlavi", era: "early20", region: "ME", s: [54, 56, 62, 58, 64], tag: "An old capital paved in a hurry." },
  { name: "Dakar", ep: "Federal", era: "early20", region: "AF", s: [40, 54, 62, 58, 50], tag: "Capital of French West Africa." },
  { name: "Lagos", ep: "Boomtown", era: "early20", region: "AF", s: [46, 58, 56, 46, 46], tag: "The lagoon city gathers speed." },
  { name: "London", ep: "Swinging", era: "postwar", region: "EU", s: [92, 94, 97, 92, 90], tag: "Beatles next door, banks downstairs." },
  { name: "Paris", ep: "Trente Glorieuses", era: "postwar", region: "EU", s: [90, 90, 94, 92, 85], tag: "New Wave cinema and old-world primacy." },
  { name: "Berlin", ep: "Divided", era: "postwar", region: "EU", s: [74, 70, 92, 86, 68], tag: "A wall through the middle; Bowie on both sides." },
  { name: "Moscow", ep: "Superpower", era: "postwar", region: "EU", s: [92, 76, 85, 93, 97], tag: "Sputnik's hometown." },
  { name: "Tokyo", ep: "Bubble", era: "postwar", region: "EA", s: [99, 99, 93, 95, 84], tag: "The future, available at street level." },
  { name: "Hong Kong", ep: "Boomtown", era: "postwar", region: "EA", s: [86, 97, 92, 84, 66], tag: "Kung fu cinema and a skyline built on trade." },
  { name: "Seoul", ep: "Miracle", era: "postwar", region: "EA", s: [90, 90, 82, 86, 78], tag: "From rubble to chaebol in a generation." },
  { name: "Mumbai", ep: "Bollywood", era: "postwar", region: "SA", s: [95, 86, 93, 78, 74], tag: "A film industry bigger than Hollywood, by volume." },
  { name: "Singapore", ep: "Tiger", era: "postwar", region: "SA", s: [70, 95, 72, 86, 72], tag: "From swamp port to first world in one lifetime." },
  { name: "Cairo", ep: "Nasserist", era: "postwar", region: "ME", s: [90, 72, 86, 72, 76], tag: "Voice of the Arabs on every radio." },
  { name: "Beirut", ep: "Riviera", era: "postwar", region: "ME", s: [60, 82, 88, 76, 52], tag: "Banking by day, cabaret by night — until it wasn't." },
  { name: "New York", ep: "Capital of Culture", era: "postwar", region: "AM", s: [96, 98, 99, 94, 90], tag: "Hip-hop, punk, Wall Street, MoMA — pick any two." },
  { name: "Los Angeles", ep: "Entertainment", era: "postwar", region: "AM", s: [92, 93, 98, 87, 72], tag: "Hollywood, aerospace, the car-built dream." },
  { name: "San Francisco", ep: "Counterculture", era: "postwar", region: "AM", s: [70, 86, 93, 94, 64], tag: "Summer of Love to Silicon Valley." },
  { name: "Detroit", ep: "Motown", era: "postwar", region: "AM", s: [72, 86, 92, 80, 60], tag: "The sound of young America, built on the assembly line." },
  { name: "Mexico City", ep: "Mid-century", era: "postwar", region: "AM", s: [94, 80, 86, 78, 74], tag: "Olympics, muralists' heirs, a megacity rising." },
  { name: "São Paulo", ep: "Industrial", era: "postwar", region: "AM", s: [92, 86, 82, 74, 68], tag: "Brazil's engine room." },
  { name: "Lagos", ep: "Fela's", era: "postwar", region: "AF", s: [84, 74, 89, 64, 66], tag: "Afrobeat invented at the Shrine." },
  { name: "Kinshasa", ep: "Rumba", era: "postwar", region: "AF", s: [78, 58, 86, 54, 60], tag: "Rumble in the Jungle; soundtrack by Franco." },
  { name: "Milan", ep: "Design Capital", era: "postwar", region: "EU", s: [70, 88, 90, 78, 56], tag: "Fashion week, furniture fairs, La Scala." },
  { name: "Stockholm", ep: "Model", era: "postwar", region: "EU", s: [54, 82, 76, 86, 56], tag: "The middle way, well furnished." },
  { name: "Osaka", ep: "Expo '70", era: "postwar", region: "EA", s: [85, 88, 76, 78, 58], tag: "The future visited Kansai." },
  { name: "Taipei", ep: "Tiger", era: "postwar", region: "EA", s: [70, 84, 72, 80, 64], tag: "Night markets and microchips." },
  { name: "Bangkok", ep: "Boom", era: "postwar", region: "SA", s: [80, 76, 80, 62, 62], tag: "Canals to expressways in a generation." },
  { name: "Jakarta", ep: "Rising", era: "postwar", region: "SA", s: [85, 66, 70, 58, 66], tag: "Ten million stories at once." },
  { name: "Tehran", ep: "Pre-'79", era: "postwar", region: "ME", s: [74, 80, 72, 68, 72], tag: "Oil money and a restless boulevard." },
  { name: "Tel Aviv", ep: "Bauhaus", era: "postwar", region: "ME", s: [50, 72, 76, 82, 60], tag: "The white city by the sea." },
  { name: "Miami", ep: "Vice", era: "postwar", region: "AM", s: [58, 76, 80, 54, 46], tag: "Neon, cocaine cowboys, and Cuban coffee." },
  { name: "Abidjan", ep: "Miracle", era: "postwar", region: "AF", s: [56, 68, 62, 52, 50], tag: "Pearl of the lagoons." },
  { name: "Nairobi", ep: "Green City", era: "postwar", region: "AF", s: [54, 60, 58, 60, 52], tag: "Safari capital, conference town." },
  { name: "London", ep: "Global", era: "contemporary", region: "EU", s: [95, 98, 96, 94, 91], tag: "Finance, theatre, and two hundred languages." },
  { name: "Paris", ep: "21st-Century", era: "contemporary", region: "EU", s: [92, 92, 95, 92, 87], tag: "Still the world's idea of a city." },
  { name: "Berlin", ep: "Reunified", era: "contemporary", region: "EU", s: [82, 84, 93, 90, 76], tag: "Cheap rent (once), endless night, art everywhere." },
  { name: "Tokyo", ep: "Reiwa", era: "contemporary", region: "EA", s: [99, 95, 94, 95, 84], tag: "The biggest city ever built, running on time." },
  { name: "Shanghai", ep: "Boom", era: "contemporary", region: "EA", s: [98, 96, 86, 90, 84], tag: "A skyline that didn't exist in 1990." },
  { name: "Beijing", ep: "Rising", era: "contemporary", region: "EA", s: [97, 93, 87, 94, 96], tag: "Olympic host and superpower capital." },
  { name: "Seoul", ep: "Hallyu", era: "contemporary", region: "EA", s: [95, 93, 96, 93, 80], tag: "K-pop, K-drama, K-everything." },
  { name: "Shenzhen", ep: "Hardware", era: "contemporary", region: "EA", s: [95, 95, 72, 94, 74], tag: "Fishing village to tech megacity in 40 years." },
  { name: "Mumbai", ep: "Maximum City", era: "contemporary", region: "SA", s: [98, 90, 92, 80, 78], tag: "Bollywood, billionaires, and dabbawalas." },
  { name: "Singapore", ep: "Smart City", era: "contemporary", region: "SA", s: [76, 97, 78, 92, 74], tag: "The best-run square miles on Earth." },
  { name: "Dubai", ep: "Vertical", era: "contemporary", region: "ME", s: [72, 93, 72, 70, 70], tag: "A skyline conjured from sand and ambition." },
  { name: "Istanbul", ep: "Megacity", era: "contemporary", region: "ME", s: [95, 87, 89, 80, 82], tag: "Fifteen million people between two seas." },
  { name: "Cairo", ep: "Umm al-Dunya", era: "contemporary", region: "ME", s: [96, 74, 84, 72, 76], tag: "Mother of the World, twenty million strong." },
  { name: "New York", ep: "Unkillable", era: "contemporary", region: "AM", s: [96, 99, 96, 94, 90], tag: "Capital of everything; allegedly declining since 1970." },
  { name: "Los Angeles", ep: "Creator Economy", era: "contemporary", region: "AM", s: [93, 93, 97, 89, 74], tag: "Where the world's screens get filled." },
  { name: "San Francisco", ep: "Tech", era: "contemporary", region: "AM", s: [74, 96, 82, 99, 68], tag: "The internet's company town." },
  { name: "Mexico City", ep: "CDMX", era: "contemporary", region: "AM", s: [96, 85, 91, 80, 76], tag: "Art, food, and hemisphere-biggest-city energy." },
  { name: "São Paulo", ep: "Megalópole", era: "contemporary", region: "AM", s: [96, 88, 86, 78, 70], tag: "Latin America's business capital." },
  { name: "Lagos", ep: "Afrobeats", era: "contemporary", region: "AF", s: [96, 80, 92, 68, 68], tag: "Nollywood, and the sound the whole world dances to." },
  { name: "Nairobi", ep: "Silicon Savannah", era: "contemporary", region: "AF", s: [76, 74, 72, 76, 64], tag: "East Africa's hub; fintech pioneer." },
  { name: "New York", ep: "New Amsterdam", era: "earlymodern", region: "AM", s: [38, 60, 52, 56, 48], tag: "A Dutch trading post at the tip of an island." },
  { name: "London", ep: "Medieval", era: "medieval", region: "EU", s: [42, 56, 54, 60, 52], tag: "A muddy river town with a famous bridge." },
  { name: "London", ep: "Elizabethan", era: "renaissance", region: "EU", s: [58, 74, 92, 78, 72], tag: "Shakespeare at the Globe; sea dogs in the harbor." },
  { name: "Paris", ep: "Valois", era: "renaissance", region: "EU", s: [70, 68, 84, 80, 72], tag: "Brilliant, brawling, and frequently besieged." },
  { name: "Rome", ep: "Papal", era: "renaissance", region: "EU", s: [55, 72, 96, 82, 60], tag: "Michelangelo on the scaffolding of St. Peter's." },
  { name: "Rome", ep: "Dolce Vita", era: "postwar", region: "EU", s: [78, 72, 92, 72, 58], tag: "Cinecittà, Vespas, and Fellini." },
  { name: "Athens", ep: "Modern", era: "contemporary", region: "EU", s: [72, 66, 76, 72, 58], tag: "The old names live on modern street signs." },
  { name: "Venice", ep: "Carnival Decline", era: "earlymodern", region: "EU", s: [55, 68, 86, 66, 48], tag: "Masked, magnificent, and slowly sinking." },
  { name: "Vienna", ep: "Livable", era: "contemporary", region: "EU", s: [70, 76, 84, 84, 60], tag: "Perennially voted the world's most livable city." },
  { name: "Moscow", ep: "Rings", era: "contemporary", region: "EU", s: [92, 84, 82, 84, 88], tag: "A megacity of concentric rings." },
  { name: "Beijing", ep: "Warlord Era", era: "early20", region: "EA", s: [78, 62, 74, 70, 55], tag: "An imperial capital adrift." },
  { name: "Kyoto", ep: "Heritage", era: "contemporary", region: "EA", s: [70, 64, 90, 74, 40], tag: "Temples, tourists, and a thousand years of craft." },
  { name: "Baghdad", ep: "Ottoman Province", era: "earlymodern", region: "ME", s: [55, 56, 60, 58, 52], tag: "A faded round city remembering its caliphs." },
  { name: "Chicago", ep: "Second City", era: "contemporary", region: "AM", s: [85, 88, 84, 84, 66], tag: "Architecture capital; second city, allegedly." },
  { name: "Amsterdam", ep: "Canal Tech", era: "contemporary", region: "EU", s: [70, 88, 84, 86, 58], tag: "Bikes, fintech, and very narrow houses." },
  { name: "Madrid", ep: "Reborn", era: "contemporary", region: "EU", s: [82, 84, 88, 80, 66], tag: "Europe's best nightlife commute." },
  { name: "Stockholm", ep: "Unicorn Factory", era: "contemporary", region: "EU", s: [62, 86, 80, 90, 56], tag: "Per-capita champion of billion-dollar startups." },
  { name: "Bangalore", ep: "Tech Capital", era: "contemporary", region: "SA", s: [88, 86, 72, 92, 60], tag: "The back office that became the front office." },
  { name: "Delhi", ep: "NCR", era: "contemporary", region: "SA", s: [97, 84, 82, 78, 84], tag: "Imperial capitals stacked seven deep." },
  { name: "Bangkok", ep: "Street Food Capital", era: "contemporary", region: "SA", s: [90, 82, 88, 68, 62], tag: "Michelin stars on plastic stools." },
  { name: "Jakarta", ep: "Sinking Giant", era: "contemporary", region: "SA", s: [95, 78, 74, 62, 66], tag: "Thirty million people, one traffic jam." },
  { name: "Tel Aviv", ep: "Startup", era: "contemporary", region: "ME", s: [58, 88, 78, 92, 68], tag: "More startups than parking spots." },
  { name: "Riyadh", ep: "Vision", era: "contemporary", region: "ME", s: [78, 94, 58, 64, 78], tag: "A capital remaking itself at speed." },
  { name: "Miami", ep: "Capital of Latin America", era: "contemporary", region: "AM", s: [74, 86, 82, 62, 50], tag: "Finance fled south, culture flew north." },
  { name: "Toronto", ep: "Multicultural", era: "contemporary", region: "AM", s: [82, 86, 80, 84, 60], tag: "Half the city born somewhere else." },
  { name: "Buenos Aires", ep: "Resilient", era: "contemporary", region: "AM", s: [88, 68, 86, 74, 58], tag: "Crisis-proof culture, world-class theatre." },
  { name: "Johannesburg", ep: "Financial Capital", era: "contemporary", region: "AF", s: [72, 85, 70, 68, 62], tag: "Africa's money runs through here." },
  { name: "Accra", ep: "Rising", era: "contemporary", region: "AF", s: [66, 62, 72, 60, 56], tag: "Detty December headquarters." },
  { name: "Addis Ababa", ep: "Hub", era: "contemporary", region: "AF", s: [80, 58, 62, 56, 68], tag: "The AU's capital; an aviation crossroads." },
].map((c, i) => ({ ...c, id: i }));
// <<< CITY DATA END

// Same city across renames or the same site: drafting one form locks out the others.
const SAME_CITY = {
  edo: "tokyo", constantinople: "istanbul", bombay: "mumbai", batavia: "jakarta",
  tenochtitlan: "mexico city", calcutta: "kolkata", madras: "chennai", rangoon: "yangon",
  "chang'an": "xi'an",
};
CITIES.forEach((c) => {
  const k = c.name.toLowerCase();
  c.cityKey = SAME_CITY[k] || k;
});

// ---------- trials: keyed to stat indices ----------
const TRIALS = [
  { name: "The Plague", stats: [3, 0], pass: "{c}'s physicians and granaries hold the line.", fail: "Pestilence empties your streets, and no one knows why." },
  { name: "The Great Siege", stats: [4], pass: "{c}'s walls and warriors turn the host away.", fail: "The gates splinter. The host pours in." },
  { name: "The Famine", stats: [0, 1], pass: "{c}'s storehouses feed the realm through the lean years.", fail: "The harvests fail and the granaries stand empty." },
  { name: "The Trade Collapse", stats: [1], pass: "{c}'s merchants reroute the routes and reopen the ports.", fail: "The caravans stop coming. The harbors fall silent." },
  { name: "The Rival's Golden Age", stats: [2], pass: "Let them flourish — {c}'s poets and painters outshine them all.", fail: "The world's artists drift to a brighter court than yours." },
  { name: "The Schism", stats: [2, 4], pass: "{c} holds the faith — and the realm — together.", fail: "Your people split into factions, then into enemies." },
  { name: "The Brain Drain", stats: [3], pass: "{c}'s academies give the brilliant a reason to stay.", fail: "Your brightest minds leave, and take the future with them." },
  { name: "The Succession Crisis", stats: [4, 2], pass: "{c}'s institutions outlast the throne's empty chair.", fail: "Three claimants, two armies, no civilization." },
  { name: "The Currency Crisis", stats: [1, 3], pass: "{c}'s bankers steady the coin before the panic spreads.", fail: "The coin is debased, and trust debases with it." },
  { name: "The Great Fire", stats: [0, 1], pass: "{c} rebuilds in stone, grander than before.", fail: "What burns is never rebuilt." },
  { name: "Barbarians at the Gates", stats: [4, 0], pass: "{c} absorbs the newcomers and grows stronger for it.", fail: "The frontier folds, then the heartland." },
  { name: "The Age of Decadence", stats: [2, 3], pass: "{c} turns abundance into a renaissance, not a stupor.", fail: "Comfort curdles into complacency. Decline arrives quietly." },
  { name: "The Earthquake", stats: [0, 3], pass: "{c}'s engineers raise the city from the rubble.", fail: "The earth opens, and your capital does not recover." },
  { name: "The Long Drought", stats: [0, 4], pass: "{c}'s aqueducts and order carry the realm through dry years.", fail: "The rivers thin, the fields crack, the people scatter." },
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
  ["What is Eternal City?", "A daily draft game. History deals you five random era-and-region combinations. From each, you take a single attribute from a single city. The five attributes form one amalgam civilization, which then faces ten trials — one per century. Survive all ten and you've built an Eternal City."],
  ["How does drafting work?", "Each round shows you an era and region, and the cities that peaked there. You claim ONE attribute from ONE city — its Scale, Wealth, Culture, Knowledge, or Might. Each attribute slot can only be filled once, so by the end your civilization has exactly one city behind each stat."],
  ["Can I draft the same city twice?", "No. Each city may serve only once across all of history — drafting Ancient Rome locks out every other Rome. Renamed cities count as the same city: Edo is Tokyo, Constantinople is Istanbul, Bombay is Mumbai, and Tenochtitlan is Mexico City (same site)."],
  ["What are the rerolls?", "One era reroll and one region reroll per run. The era reroll swaps the current round's era for an unused one; the region reroll redraws the region within the same era. Once used, they're gone."],
  ["How are cities rated?", "Ratings (0–99) are editorial — call them Historian Ratings — and they are era-adjusted: a city is rated against its own world, not ours. Tang Chang'an's 99 Scale means it dominated the 8th century the way nothing dominates today. Disagree with a rating? That's half the fun."],
  ["How do the trials work?", "Your civilization faces 10 trials, each keyed to one or two attributes and each with a visible difficulty between 58 and 92. You pass if your relevant attribute score, plus a fortune roll between −10 and +10, meets the difficulty. The math is shown on every trial."],
  ["What is a Dark Age?", "Your first failed trial doesn't end you — a Dark Age descends, that century is lost, and your civilization rebuilds. A second failure is collapse. Rome got sacked and recovered; so can you, once."],
  ["What counts as winning?", "Every trial passed is a century survived. Pass all ten — flawless, no Dark Age — and you reach 1,000 years: an Eternal City. Anything less is measured in centuries endured."],
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
  const logEnd = useRef(null);

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
    setPhase("draft");
  }

  const usedKeys = picks.map((p) => p.cityKey);
  const openSlots = STAT_KEYS.map((_, i) => i).filter((i) => !picks.some((p) => p.slot === i));
  const cur = rounds[round];
  const pool = cur ? poolFor(cur.era, cur.region, usedKeys) : [];

  function doEraSkip() {
    if (!eraSkip) return;
    const rnd = rngRef.current;
    const used = rounds.map((r) => r.era);
    const remaining = ERAS.map((e) => e.key).filter((k) => !used.includes(k));
    if (!remaining.length) return;
    const newEra = remaining[Math.floor(rnd() * remaining.length)];
    const next = [...rounds];
    next[round] = { era: newEra, region: pickRegion(newEra, rnd, usedKeys, null) };
    setRounds(next);
    setEraSkip(false);
  }

  function doRegionSkip() {
    if (!regionSkip) return;
    const rnd = rngRef.current;
    const next = [...rounds];
    next[round] = { ...cur, region: pickRegion(cur.era, rnd, usedKeys, cur.region) };
    setRounds(next);
    setRegionSkip(false);
  }

  function pickCity(city, slot) {
    const newPicks = [...picks, { ...city, slot }];
    setPicks(newPicks);
    if (round < 4) setRound(round + 1);
    else runSim(newPicks);
  }

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
          text = t.fail + " A Dark Age descends — your civilization reels, but rebuilds.";
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
      ? "I built an ETERNAL CITY — 1,000 flawless years"
      : collapsed
        ? `My civilization endured ${years} years`
        : `My civilization endured ${years} years, scarred by a Dark Age`;
    const roster = [...picks].sort((a, b) => a.slot - b.slot).map((p) => `${eraName(p)} (${STAT_SHORT[p.slot]})`).join(" · ");
    return `ETERNAL CITY${daily ? ` — Daily No. ${dailyNumber()}` : ""}${historian ? " — Historian Mode" : ""}\n${head}\n${grid}\n${roster}`;
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
              city — its Scale, Wealth, Culture, Knowledge, or Might. Five picks fill five slots,
              one per era, and each city may serve only once across all of history. One era reroll,
              one region reroll.
            </p>
            <p style={{ fontFamily: DISPLAY, fontSize: 16, lineHeight: 1.6, color: C.dim, textAlign: "center" }}>
              Then your civilization faces ten trials of rising and falling difficulty — plague, siege,
              schism, collapse. Each trial endured is a century. One failure is a Dark Age you can
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
              Ratings are era-adjusted · Tang Chang'an is rated against its world, not ours
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
              <div style={{ ...CAPS, fontSize: 10, color: C.dim }}>History deals you</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.gold, marginTop: 4 }}>
                {ERAS.find((e) => e.key === cur.era).label}
                <span style={{ fontSize: 15, color: C.dim }}> · {ERAS.find((e) => e.key === cur.era).range}</span>
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 18, color: C.marble, marginTop: 2 }}>{REGIONS[cur.region]}</div>
              <div className="flex justify-center gap-3 mt-3">
                <Btn onClick={doEraSkip} disabled={!eraSkip}>↻ Reroll era {eraSkip ? "" : "· used"}</Btn>
                <Btn onClick={doRegionSkip} disabled={!regionSkip}>↻ Reroll region {regionSkip ? "" : "· used"}</Btn>
              </div>
            </Plaque>

            {/* city pool */}
            <div className="flex flex-col gap-2">
              {pool.map((city) => (
                <div
                  key={city.id}
                  className="rounded-lg text-left px-4 py-3 w-full"
                  style={{ background: C.slab, border: `1px solid ${C.line}` }}
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span style={{ fontFamily: DISPLAY, fontSize: 21, color: C.marble }}>{city.name}</span>
                  </div>
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
              <div style={{ ...CAPS, fontSize: 9, color: C.dim, marginBottom: 6 }}>Your amalgam civilization</div>
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
            <div className="flex flex-col gap-2">
              {trials.slice(0, revealed).map((t, i) => {
                const edge = t.kind === "pass" ? C.verdigris : t.kind === "darkage" ? C.goldSoft : C.blood;
                const verdict = t.kind === "pass" ? "Endured" : t.kind === "darkage" ? "Dark Age" : "Collapse";
                return (
                  <div key={i} className="rounded-lg px-4 py-3" style={{ background: C.slab, borderLeft: `3px solid ${edge}` }}>
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span style={{ fontFamily: DISPLAY, fontSize: 15, color: t.kind === "collapse" ? C.blood : C.marble }}>
                        Century {["I","II","III","IV","V","VI","VII","VIII","IX","X"][i]} · {t.name}
                      </span>
                      <span style={{ ...CAPS, fontSize: 9, color: C.dim }}>
                        {t.stats.map((s) => STAT_SHORT[s]).join("+")} {t.score} vs {t.difficulty} · fortune {t.roll >= 0 ? "+" : ""}{t.roll}
                      </span>
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 13, color: t.kind === "pass" ? C.dim : C.marble, marginTop: 3 }}>
                      {t.text} <span style={{ ...CAPS, fontStyle: "normal", fontSize: 9, color: edge }}>· {verdict}</span>
                    </div>
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
                            {eraName(p)} <span style={{ ...CAPS, fontSize: 9, color: C.verdigris }}>{p.ep}</span>
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
