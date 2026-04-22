export type Place = {
  id: number;
  type: "restaurant" | "pizza" | "vegan";
  position: [number, number];
  name: string;
  category: string;
  stars: number;
  reviews: number;
  address?: string;
  description?: string;
  todayHours?: string;
  lunchTime?: string;
  priceLevel?: string;
  phone?: string;
  website?: string;
  tags?: string[];
  todayMenu?: string[];
};

export const places: Place[] = [
  {
    id: 1,
    type: "restaurant",
    position: [61.05692, 28.19061],
    name: "Bistro",
    category: "Ravintola",
    stars: 4.9,
    reviews: 120,
    address: "Villimiehenkatu 1, 53100 Lappeenranta",
    description:
      "Kotoisa lounasravintola keskustassa. Tarjolla päivittäin salaattipöytä, lämmin pääruoka ja talon leipä.",
    todayHours: "10:30-15:00",
    lunchTime: "10:30-14:00",
    priceLevel: "Lounas 13,20 EUR",
    phone: "+358 40 123 4567",
    website: "https://bistro-example.fi",
    tags: ["Paikan päällä", "Takeaway", "Kasvisvaihtoehto"],
    todayMenu: [
      "Lohikeitto, saaristolaisleipä",
      "Paahdettu broileri, timjamikastike",
      "Punajuuririsotto (vege)",
      "Mustikkarahka",
    ],
  },
  {
    id: 2,
    type: "pizza",
    position: [61.0574, 28.192],
    name: "Pizza Spot",
    category: "Pizza ja kebab",
    stars: 4.5,
    reviews: 98,
    address: "Kauppakatu 10, 53100 Lappeenranta",
    description:
      "Nopea lounas ja runsaat annokset. Päivittäin vaihtuva pizzabuffet sekä kebab-annokset.",
    todayHours: "11:00-20:00",
    lunchTime: "11:00-14:30",
    priceLevel: "Lounas 12,50 EUR",
    phone: "+358 50 765 4321",
    website: "https://pizzaspot-example.fi",
    tags: ["Pizza buffet", "Kebab", "Kotiinkuljetus"],
    todayMenu: [
      "Pizzabuffet: Margherita, Pollo BBQ, Quattro Formaggi",
      "Kana-kebab riisillä ja valkosipulikastikkeella",
      "Falafel wrap ja chili-majoneesi",
      "Päivän salaattipöytä",
    ],
  },
  {
    id: 3,
    type: "vegan",
    position: [61.0558, 28.1892],
    name: "Green Bowl",
    category: "Kasvisruoka",
    stars: 4.7,
    reviews: 54,
    address: "Rauhankatu 5, 53100 Lappeenranta",
    description:
      "Kasvispainotteinen lounaskahvila, jossa painotetaan sesonkituotteita ja paikallisia raaka-aineita.",
    todayHours: "10:00-17:00",
    lunchTime: "10:30-14:00",
    priceLevel: "Lounas 12,90 EUR",
    phone: "+358 45 321 9090",
    website: "https://greenbowl-example.fi",
    tags: ["Vegaaninen", "Gluteeniton vaihtoehto", "Luomu"],
    todayMenu: [
      "Linssi-kookoscurry ja jasmiiniriisi",
      "Paahdettu kukkakaali-tahinikulho",
      "Täytetty bataatti ja chimichurri",
      "Sitruuna-chia vanukas",
    ],
  },
  {
    id: 4,
    type: "restaurant",
    position: [61.064, 28.09606],
    name: "Aalef Yolo",
    category: "Ravintola",
    stars: 5.0,
    reviews: 124,
    address: "Laserkatu 10, 53850 Lappeenranta",
    description: "Opiskelijaravintola.",
    todayHours: "10:00-16:00",
    lunchTime: "10:30-14:00",
    priceLevel: "Lounas 3,10 EUR",
    phone: "+358 45 321 9090",
    website: "https://www.aalef.fi/",
    tags: ["Vegaaninen", "Opiskelijaravintola"],
    todayMenu: [
      "Linssi-kookoscurry ja jasmiiniriisi",
      "Paahdettu kukkakaali-tahinikulho",
      "Täytetty bataatti ja chimichurri",
      "Sitruuna-chia vanukas",
    ],
  },
  {
    id: 5,
    type: "restaurant",
    position: [61.0547, 28.09413],
    name: "Grillikioski",
    category: "Ravintola",
    stars: 5.0,
    reviews: 124,
    address: "Orioninkatu 88, 53850 Lappeenranta",
    description: "Grilli.",
    todayHours: "10:00-16:00",
    lunchTime: "10:30-14:00",
    priceLevel: "Lounas 12,50 EUR",
    phone: "+358 45 321 9090",
    website: "https://www.grilli.example.fi/",
    tags: ["Ei-Vegaaninen", "Grilli", "Hampurilaisannokset", "Ranskalaiset"],
    todayMenu: [
      "Hampurilaisannos, ranskalaiset ja coleslaw",
      "Grillimakkara, leipä ja sinappi",
      "Kasvisburger, bataattiranskalaiset (vege)",
      "Päivän salaattipöytä",
    ],
  },
];
