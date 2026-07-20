// Vult per goedgekeurd product de redactionele velden (nl + en):
//   description / description_en          wat is het + toepassing
//   why_sustainable / why_sustainable_en  waarom duurzamer dan het gangbare
//   co2_note / co2_note_en                indicatieve CO2-besparing (bandbreedte)
//
// Idempotent en respecteert handwerk: vult ALLEEN velden die nu leeg (null)
// zijn. Draai opnieuw zo vaak je wilt; admin-bewerkingen blijven staan.
// De CO2-regels zijn bewust bandbreedtes ("naar schatting X-Y"), afgeleid van
// openbare levenscyclusstudies; de site toont er altijd een disclaimer bij.
//
// Gebruik:  node --env-file=.env.local scripts/seed-product-info.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Waarom-teksten per duurzaamheidsmechanisme.
const WHY = {
  wegwerp: [
    "Vervangt een wegwerpproduct door een herbruikbaar alternatief: de productie-impact wordt uitgesmeerd over honderden gebruiksbeurten in plaats van na één keer in de prullenbak te belanden.",
    "Replaces a disposable product with a reusable one: the production impact is spread over hundreds of uses instead of ending up in the bin after a single one.",
  ],
  navulbaar: [
    "Alleen de vulling wordt opnieuw gekocht; houder en verpakking gaan jaren mee. Dat scheelt verpakkingsmateriaal en transportgewicht bij elke aankoop erna.",
    "Only the refill is repurchased; the container lasts for years. That saves packaging material and transport weight with every subsequent purchase.",
  ],
  vast: [
    "Geconcentreerd en zonder water: er wordt geen plastic fles met vooral water door het land gereden, en één blok of tablet gaat langer mee dan een flacon.",
    "Concentrated and water-free: no plastic bottle of mostly water gets trucked around, and one bar or tablet outlasts a bottle.",
  ],
  hernieuwbaar: [
    "Gemaakt van een snelgroeiende, hernieuwbare grondstof die tijdens de groei CO2 opneemt en fossiel plastic of traag groeiend hout vervangt.",
    "Made from a fast-growing, renewable raw material that absorbs CO2 while growing and replaces fossil plastic or slow-growing wood.",
  ],
  gerecycled: [
    "Gemaakt van bestaand materiaal: nieuwe grondstofwinning — vaak het meest belastende deel van de keten — wordt overgeslagen.",
    "Made from existing material: new raw-material extraction — often the most polluting part of the chain — is skipped entirely.",
  ],
  biologisch: [
    "Geteeld zonder synthetische bestrijdingsmiddelen en met minder fossiele inputs zoals kunstmest; dat verlaagt de impact op bodem, water en klimaat in de teeltfase.",
    "Grown without synthetic pesticides and with fewer fossil inputs such as artificial fertiliser, lowering the impact on soil, water and climate in the farming stage.",
  ],
  energie: [
    "Bespaart stroom of warm water bij elk gebruik; de winst loopt elk jaar dat het in huis hangt verder op — zonder dat je gedrag hoeft te veranderen.",
    "Saves electricity or hot water with every use; the gain keeps compounding every year it stays in the house — no behaviour change required.",
  ],
  zon: [
    "Laadt op zonlicht in plaats van netstroom of wegwerpbatterijen; na de fabricage is elk gebruik vrijwel uitstootvrij.",
    "Charges on sunlight instead of grid power or disposable batteries; after manufacturing, every use is virtually emission-free.",
  ],
  refurbished: [
    "Het apparaat bestaat al: 70-85% van de klimaatimpact van elektronica zit in de fabricage, en precies dat deel wordt hier hergebruikt in plaats van opnieuw gemaakt.",
    "The device already exists: 70-85% of electronics' climate impact sits in manufacturing, and exactly that part is reused here instead of produced again.",
  ],
  repareerbaar: [
    "Onderdelen zijn los te vervangen, waardoor het apparaat jaren langer meegaat en de fabricage-impact per gebruiksjaar flink daalt.",
    "Parts can be replaced individually, so the device lasts years longer and the manufacturing impact per year of use drops sharply.",
  ],
  batterijvrij: [
    "Werkt zonder batterijen of netstroom; er is geen doorlopende stroom wegwerpbatterijen met bijbehorende productie en chemisch afval.",
    "Works without batteries or grid power; there is no ongoing stream of disposable batteries with their production and chemical waste.",
  ],
  oplaadbaar: [
    "Eén oplaadbare cel vervangt in zijn leven honderden wegwerpbatterijen, inclusief hun productie, verpakking en transport.",
    "One rechargeable cell replaces hundreds of disposable batteries over its life, including their production, packaging and transport.",
  ],
  tweedehands: [
    "Het product bestaat al: er komt geen nieuwe productie aan te pas, terwijl juist die productie vrijwel de hele voetafdruk bepaalt.",
    "The product already exists: no new production is involved, while production is what makes up almost the entire footprint.",
  ],
  plantaardig: [
    "Plantaardige eiwitten kosten per portie een fractie van de uitstoot, het landgebruik en het water van dierlijke eiwitten.",
    "Plant-based proteins cost a fraction of the emissions, land use and water of animal proteins per serving.",
  ],
  verspilling: [
    "Voorkomt verspilling: voedsel of materiaal dat anders werd weggegooid, wordt alsnog gebruikt — de uitstoot van de productie was toch al gemaakt.",
    "Prevents waste: food or material that would otherwise be thrown away still gets used — the production emissions had already been spent.",
  ],
  eerlijk: [
    "Gecertificeerd eerlijke handel betekent een traceerbare keten met eisen aan arbeidsomstandigheden én milieupraktijken bij de teelt.",
    "Certified fair trade means a traceable chain with requirements on working conditions as well as environmental practices at the farm.",
  ],
};

// co2([nl-range, en-range], [nl-alternatief, en-alternatief]) -> [nl, en]
function co2(range, vs) {
  return [
    `Naar schatting ${range[0]} minder CO2 dan ${vs[0]}, inclusief productie en transport.`,
    `An estimated ${range[1]} less CO2 than ${vs[1]}, including production and transport.`,
  ];
}

// Per product: d = beschrijving [nl, en], m = mechanisme,
// co2 = [range nl/en, alternatief nl/en] of een volledige eigen tekst [nl, en].
const P = {
  // ---------- home ----------
  "beeswax-food-wraps": {
    d: ["Herbruikbare doeken met bijenwas om voedsel en schalen mee af te dekken, als vervanger van vershoudfolie.", "Reusable beeswax-coated wraps for covering food and bowls, replacing cling film."],
    m: "wegwerp", co2: [["2 tot 5 kg per jaar", "2 to 5 kg per year"], ["vershoudfolie en boterhamzakjes", "cling film and sandwich bags"]],
  },
  "compostable-trash-bags": {
    d: ["Composteerbare vuilniszakken voor gft- en restafval, gemaakt van plantaardig zetmeel.", "Compostable bin liners for organic and general waste, made from plant starch."],
    m: "hernieuwbaar", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["zakken van nieuw fossiel plastic", "bags made from virgin fossil plastic"]],
  },
  "bamboo-cutting-board": {
    d: ["Snijplank van bamboe voor dagelijks gebruik in de keuken; hard, mesvriendelijk en vaatwasbestendig af te nemen.", "Bamboo cutting board for everyday kitchen use; hard, knife-friendly and easy to wipe clean."],
    m: "hernieuwbaar", co2: [["2 tot 6 kg per plank", "2 to 6 kg per board"], ["een plank van nieuw plastic of tropisch hardhout", "a board made of virgin plastic or tropical hardwood"]],
  },
  "wool-dryer-balls": {
    d: ["Wollen ballen die je in de droger meedraait: ze verkorten de droogtijd en maken wasverzachter overbodig.", "Wool balls that tumble along in the dryer, shortening drying time and replacing fabric softener."],
    m: "energie", co2: [["10 tot 25 kg per jaar", "10 to 25 kg per year"], ["drogen zonder ballen plus wasverzachter", "drying without them plus fabric softener"]],
  },
  "refillable-cleaning-spray": {
    d: ["Schoonmaakspray waarvan je alleen het navulconcentraat koopt; de fles vul je thuis aan met kraanwater.", "Cleaning spray where you only buy the refill concentrate; the bottle is topped up at home with tap water."],
    m: "navulbaar", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["telkens een nieuwe kant-en-klare sprayfles", "buying a new ready-mixed spray bottle each time"]],
  },
  "solid-dish-soap-bar": {
    d: ["Vast afwasblok waar je de borstel of spons langs haalt, in plaats van vloeibaar afwasmiddel uit een plastic fles.", "Solid dish-soap bar you rub your brush or sponge across, instead of liquid soap from a plastic bottle."],
    m: "vast", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["vloeibaar afwasmiddel in plastic flessen", "liquid dish soap in plastic bottles"]],
  },
  "silicone-food-storage-bags": {
    d: ["Afsluitbare siliconen zakken voor bewaren, invriezen en meenemen van eten; honderden keren te hergebruiken.", "Sealable silicone bags for storing, freezing and carrying food; reusable hundreds of times."],
    m: "wegwerp", co2: [["2 tot 4 kg per jaar", "2 to 4 kg per year"], ["wegwerp-diepvrieszakjes", "single-use freezer bags"]],
  },
  "recycled-toilet-paper": {
    d: ["Toiletpapier van gerecycled papier, ongebleekt of chloorvrij gebleekt.", "Toilet paper made from recycled paper, unbleached or chlorine-free."],
    m: "gerecycled", co2: [["5 tot 10 kg per jaar", "5 to 10 kg per year"], ["papier van nieuwe houtvezels", "paper from virgin wood fibre"]],
  },
  "bamboo-paper-towels": {
    d: ["Wasbare keukendoekjes van bamboevezel die tientallen keren meegaan als vervanger van keukenpapier.", "Washable bamboo-fibre kitchen towels that last dozens of uses, replacing paper towels."],
    m: "wegwerp", co2: [["3 tot 8 kg per jaar", "3 to 8 kg per year"], ["wegwerp-keukenpapier", "disposable paper towels"]],
  },
  "glass-food-containers": {
    d: ["Glazen vershoudbakken met deksel voor restjes, meal prep en de vriezer; gaan decennia mee.", "Glass food containers with lids for leftovers, meal prep and the freezer; they last for decades."],
    m: "wegwerp", co2: [["2 tot 5 kg per jaar", "2 to 5 kg per year"], ["wegwerpbakjes en folie", "disposable containers and foil"]],
  },
  "natural-loofah-sponge": {
    d: ["Schuurspons gegroeid uit de loofahplant; na gebruik composteerbaar in plaats van plastic microvezels.", "Scrubbing sponge grown from the loofah plant; compostable after use instead of shedding plastic microfibres."],
    m: "hernieuwbaar", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["plastic sponsjes", "plastic sponges"]],
  },
  "swedish-dishcloth": {
    d: ["Absorberend doekje van cellulose en katoen dat tot honderden wasbeurten meegaat en dan het gft in kan.", "Absorbent cellulose-cotton cloth that survives hundreds of washes and then goes in the compost."],
    m: "wegwerp", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["keukenpapier en wegwerpdoekjes", "paper towels and disposable wipes"]],
  },
  "countertop-compost-bin": {
    d: ["Afsluitbaar bakje op het aanrecht om groente- en fruitresten in te verzamelen voor de gft-bak of composthoop.", "Sealable countertop caddy for collecting fruit and vegetable scraps for the organic bin or compost heap."],
    m: "verspilling", co2: [["20 tot 60 kg per jaar", "20 to 60 kg per year"], ["gft bij het restafval laten verdwijnen (methaan op de stort)", "sending food scraps to general waste (methane in landfill)"]],
  },
  "energy-efficient-led-bulbs": {
    d: ["Ledlampen die 80-90% minder stroom gebruiken dan halogeen en vele jaren meegaan.", "LED bulbs that use 80-90% less power than halogen and last for many years."],
    m: "energie", co2: [["10 tot 40 kg per jaar per vervangen lamp", "10 to 40 kg per year per bulb replaced"], ["halogeen- of gloeilampen", "halogen or incandescent bulbs"]],
  },
  "smart-thermostat": {
    d: ["Thermostaat die zichzelf programmeert op je ritme en de verwarming laag zet wanneer niemand thuis is.", "Thermostat that programs itself around your routine and turns the heating down when nobody is home."],
    m: "energie", co2: [["100 tot 300 kg per jaar", "100 to 300 kg per year"], ["stoken op een vaste handmatige stand", "heating on a fixed manual setting"]],
  },
  "water-saving-shower-head": {
    d: ["Douchekop die lucht bijmengt en zo met 6-7 liter per minuut hetzelfde comfort geeft als een gewone kop met 10-12.", "Shower head that blends in air, delivering the comfort of a 10-12 litre head at 6-7 litres per minute."],
    m: "energie", co2: [["100 tot 250 kg per jaar", "100 to 250 kg per year"], ["douchen met een standaard douchekop", "showering with a standard head"]],
  },
  "linen-bedding-organic": {
    d: ["Beddengoed van linnen uit biologische vlasteelt; ademend, sterk en decennia te gebruiken.", "Bed linen made of flax from organic farming; breathable, strong and usable for decades."],
    m: "biologisch", co2: [["10 tot 30 kg per set", "10 to 30 kg per set"], ["conventioneel katoenen beddengoed", "conventional cotton bedding"]],
  },
  "recycled-plastic-rug": {
    d: ["Vloerkleed geweven van gerecyclede petflessen; slijtvast en geschikt voor binnen en buiten.", "Rug woven from recycled PET bottles; hard-wearing and suitable indoors and out."],
    m: "gerecycled", co2: [["5 tot 15 kg per kleed", "5 to 15 kg per rug"], ["een kleed van nieuwe synthetische vezels", "a rug made from virgin synthetic fibre"]],
  },
  "cork-yoga-mat": {
    d: ["Yogamat met een toplaag van kurk — geoogst van de kurkeik zonder de boom te kappen — op een natuurrubberen basis.", "Yoga mat topped with cork — harvested from the cork oak without felling the tree — on a natural rubber base."],
    m: "hernieuwbaar", co2: [["3 tot 8 kg per mat", "3 to 8 kg per mat"], ["een pvc-yogamat", "a PVC yoga mat"]],
  },
  "upcycled-furniture": {
    d: ["Meubels gemaakt van bestaand hout of bestaande meubels die een tweede leven krijgen.", "Furniture made from existing wood or existing pieces given a second life."],
    m: "verspilling", co2: [["30 tot 100 kg per meubelstuk", "30 to 100 kg per piece"], ["een vergelijkbaar nieuw meubel", "a comparable new piece of furniture"]],
  },
  // ---------- personal care ----------
  "bamboo-toothbrush": {
    d: ["Tandenborstel met een steel van bamboe; alleen de borstelharen zijn nog kunststof.", "Toothbrush with a bamboo handle; only the bristles remain plastic."],
    m: "hernieuwbaar", co2: [["0,5 tot 1 kg per jaar", "0.5 to 1 kg per year"], ["plastic wegwerptandenborstels", "disposable plastic toothbrushes"]],
  },
  "toothpaste-tablets": {
    d: ["Kauwbare tandpastatabletten in een navulbaar potje, als vervanger van tubes.", "Chewable toothpaste tablets in a refillable jar, replacing tubes."],
    m: "vast", co2: [["0,5 tot 1,5 kg per jaar", "0.5 to 1.5 kg per year"], ["tandpasta in niet-recyclebare tubes", "toothpaste in non-recyclable tubes"]],
  },
  "refillable-deodorant": {
    d: ["Deodorantstick in een houder die je blijft gebruiken; alleen de vulling wordt vervangen.", "Deodorant stick in a keeper case; only the refill gets replaced."],
    m: "navulbaar", co2: [["0,5 tot 1,5 kg per jaar", "0.5 to 1.5 kg per year"], ["telkens een complete nieuwe stick of spuitbus", "a complete new stick or aerosol each time"]],
  },
  "shampoo-bar": {
    d: ["Shampoo in vaste vorm: één blok vervangt twee tot drie flessen vloeibare shampoo.", "Shampoo in solid form: one bar replaces two to three bottles of liquid shampoo."],
    m: "vast", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["vloeibare shampoo in plastic flessen", "liquid shampoo in plastic bottles"]],
  },
  "conditioner-bar": {
    d: ["Conditioner in vaste vorm, zuiniger in gebruik en zonder plastic fles.", "Conditioner in solid form, more economical in use and without a plastic bottle."],
    m: "vast", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["vloeibare conditioner in plastic flessen", "liquid conditioner in plastic bottles"]],
  },
  "safety-razor": {
    d: ["Metalen scheermes waarvan je alleen het (recyclebare) mesje vervangt; het handvat gaat een leven lang mee.", "Metal razor where only the (recyclable) blade is replaced; the handle lasts a lifetime."],
    m: "wegwerp", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["wegwerpmesjes met plastic houders", "disposable razors with plastic handles"]],
  },
  "reusable-makeup-remover-pads": {
    d: ["Wasbare pads om make-up mee te verwijderen; honderden keren te gebruiken.", "Washable pads for removing make-up; usable hundreds of times."],
    m: "wegwerp", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["wegwerp-wattenschijfjes", "single-use cotton pads"]],
  },
  "menstrual-cup": {
    d: ["Medische siliconen cup die jarenlang meegaat als alternatief voor tampons en maandverband.", "Medical-grade silicone cup that lasts for years as an alternative to tampons and pads."],
    m: "wegwerp", co2: [["3 tot 6 kg per jaar", "3 to 6 kg per year"], ["wegwerptampons en maandverband", "disposable tampons and pads"]],
  },
  "period-underwear": {
    d: ["Absorberend, wasbaar menstruatieondergoed dat wegwerpproducten grotendeels vervangt.", "Absorbent, washable period underwear that largely replaces disposables."],
    m: "wegwerp", co2: [["2 tot 5 kg per jaar", "2 to 5 kg per year"], ["wegwerptampons en maandverband", "disposable tampons and pads"]],
  },
  "solid-perfume": {
    d: ["Parfum in vaste vorm in een klein blikje: geen alcohol, geen glazen flacon met spuitmechaniek.", "Perfume in solid form in a small tin: no alcohol, no glass bottle with atomiser."],
    m: "vast", co2: [["0,5 tot 1 kg per jaar", "0.5 to 1 kg per year"], ["parfum in glazen spuitflacons", "perfume in glass spray bottles"]],
  },
  "zero-waste-floss": {
    d: ["Flosdraad van composteerbaar materiaal in een navulbaar glazen doosje.", "Dental floss made of compostable material in a refillable glass dispenser."],
    m: "navulbaar", co2: [["0,2 tot 0,5 kg per jaar", "0.2 to 0.5 kg per year"], ["nylon floss in plastic wegwerpdoosjes", "nylon floss in disposable plastic cases"]],
  },
  "refillable-lip-balm": {
    d: ["Lippenbalsem in een navulbare huls; alleen de vulling wordt opnieuw gekocht.", "Lip balm in a refillable case; only the refill is repurchased."],
    m: "navulbaar", co2: [["0,2 tot 0,5 kg per jaar", "0.2 to 0.5 kg per year"], ["telkens een nieuwe plastic stick", "a new plastic stick each time"]],
  },
  "konjac-sponge": {
    d: ["Zachte gezichtsspons van de konjacwortel; na enkele maanden gebruik composteerbaar.", "Soft facial sponge made from konjac root; compostable after a few months of use."],
    m: "hernieuwbaar", co2: [["0,3 tot 0,8 kg per jaar", "0.3 to 0.8 kg per year"], ["synthetische sponsjes en wattenschijfjes", "synthetic sponges and cotton pads"]],
  },
  "reusable-cotton-swab": {
    d: ["Herbruikbaar siliconen wattenstaafje in een reisdoosje, afspoelbaar na gebruik.", "Reusable silicone swab in a travel case, rinsed clean after use."],
    m: "wegwerp", co2: [["0,3 tot 0,8 kg per jaar", "0.3 to 0.8 kg per year"], ["wegwerpwattenstaafjes", "single-use cotton buds"]],
  },
  "plastic-free-soap": {
    d: ["Blok zeep zonder plastic verpakking voor handen en lichaam.", "Bar of soap without plastic packaging, for hands and body."],
    m: "vast", co2: [["0,5 tot 1,5 kg per jaar", "0.5 to 1.5 kg per year"], ["vloeibare zeep in plastic pompflessen", "liquid soap in plastic pump bottles"]],
  },
  "organic-cotton-towels": {
    d: ["Handdoeken van biologisch katoen, geweven voor jarenlang dagelijks gebruik.", "Towels made of organic cotton, woven for years of daily use."],
    m: "biologisch", co2: [["3 tot 8 kg per set", "3 to 8 kg per set"], ["handdoeken van conventioneel katoen", "conventional cotton towels"]],
  },
  "refillable-body-wash": {
    d: ["Douchegel waarvan je concentraat of navulzakken koopt en de fles blijft gebruiken.", "Body wash where you buy concentrate or refill pouches and keep using the bottle."],
    m: "navulbaar", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["telkens een nieuwe plastic fles douchegel", "a new plastic bottle of body wash each time"]],
  },
  // ---------- fashion ----------
  "organic-cotton-t-shirt": {
    d: ["T-shirt van biologisch geteeld katoen voor dagelijks gebruik.", "T-shirt made of organically grown cotton for everyday wear."],
    m: "biologisch", co2: [["1 tot 3 kg per shirt", "1 to 3 kg per shirt"], ["een shirt van conventioneel katoen", "a conventional cotton shirt"]],
  },
  "recycled-polyester-jacket": {
    d: ["Jas waarvan de stof is gesponnen uit gerecyclede petflessen of oud textiel.", "Jacket with fabric spun from recycled PET bottles or textile waste."],
    m: "gerecycled", co2: [["5 tot 15 kg per jas", "5 to 15 kg per jacket"], ["een jas van nieuw polyester", "a jacket made of virgin polyester"]],
  },
  "hemp-clothing": {
    d: ["Kleding van hennepvezel: sterk, ademend en geteeld met weinig water en zonder bestrijdingsmiddelen.", "Clothing made of hemp fibre: strong, breathable and grown with little water and no pesticides."],
    m: "hernieuwbaar", co2: [["2 tot 6 kg per kledingstuk", "2 to 6 kg per garment"], ["vergelijkbare kleding van conventioneel katoen", "comparable conventional cotton clothing"]],
  },
  "cork-wallet": {
    d: ["Portemonnee van kurkleer, geoogst van de schors van de kurkeik zonder de boom te beschadigen.", "Wallet made of cork leather, harvested from the cork oak's bark without harming the tree."],
    m: "hernieuwbaar", co2: [["2 tot 5 kg per portemonnee", "2 to 5 kg per wallet"], ["een leren of kunststof portemonnee", "a leather or synthetic wallet"]],
  },
  "recycled-sneakers": {
    d: ["Sneakers met zolen en stoffen uit gerecyclede materialen zoals oceaanplastic en oude schoenen.", "Sneakers with soles and fabrics made from recycled materials such as ocean plastic and old shoes."],
    m: "gerecycled", co2: [["3 tot 8 kg per paar", "3 to 8 kg per pair"], ["sneakers van nieuwe materialen", "sneakers made from virgin materials"]],
  },
  "merino-wool-socks": {
    d: ["Sokken van merinowol: temperatuurregulerend, geurwerend en daardoor minder vaak te wassen.", "Merino wool socks: temperature-regulating, odour-resistant and therefore washed less often."],
    m: "hernieuwbaar", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["vaker gewassen synthetische sokken", "synthetic socks that need washing more often"]],
  },
  "upcycled-denim": {
    d: ["Jeans en jasjes gemaakt van bestaand denim dat opnieuw is versneden en gestikt.", "Jeans and jackets made from existing denim, re-cut and re-sewn."],
    m: "verspilling", co2: [["15 tot 25 kg per spijkerbroek", "15 to 25 kg per pair of jeans"], ["een nieuwe spijkerbroek", "a newly produced pair of jeans"]],
  },
  "tencel-dress": {
    d: ["Jurk van Tencel (lyocell): houtvezel uit beheerde bossen, verwerkt in een vrijwel gesloten kringloop van water en oplosmiddel.", "Dress made of Tencel (lyocell): wood fibre from managed forests, processed in a nearly closed loop of water and solvent."],
    m: "hernieuwbaar", co2: [["2 tot 5 kg per jurk", "2 to 5 kg per dress"], ["een jurk van viscose of polyester", "a viscose or polyester dress"]],
  },
  "fair-trade-jeans": {
    d: ["Spijkerbroek geproduceerd onder eerlijke-handelsvoorwaarden met traceerbare keten.", "Jeans produced under fair-trade conditions with a traceable supply chain."],
    m: "eerlijk", co2: [["5 tot 15 kg per broek", "5 to 15 kg per pair"], ["een fast-fashion spijkerbroek die korter meegaat", "a fast-fashion pair with a shorter life"]],
  },
  "recycled-swimwear": {
    d: ["Badkleding van gerecycled nylon, vaak uit oude visnetten (Econyl).", "Swimwear made of recycled nylon, often from old fishing nets (Econyl)."],
    m: "gerecycled", co2: [["1 tot 3 kg per stuk", "1 to 3 kg per item"], ["badkleding van nieuw nylon", "swimwear made of virgin nylon"]],
  },
  "pinatex-shoes": {
    d: ["Schoenen met Piñatex: leerachtig materiaal gemaakt van ananasbladeren, een restproduct van de oogst.", "Shoes made with Piñatex: a leather-like material from pineapple leaves, a harvest by-product."],
    m: "verspilling", co2: [["5 tot 10 kg per paar", "5 to 10 kg per pair"], ["schoenen van dierlijk leer", "shoes made of animal leather"]],
  },
  "secondhand-designer-bags": {
    d: ["Designertassen uit de hergebruikmarkt: gecontroleerd op echtheid en klaar voor een tweede leven.", "Designer bags from the resale market: authenticated and ready for a second life."],
    m: "tweedehands", co2: [["10 tot 30 kg per tas", "10 to 30 kg per bag"], ["een nieuwe designertas", "a newly produced designer bag"]],
  },
  "repairable-shoes": {
    d: ["Schoenen die zo zijn ontworpen dat zool en onderdelen vervangbaar zijn in plaats van weggooien.", "Shoes designed so the sole and parts can be replaced instead of thrown away."],
    m: "repareerbaar", co2: [["5 tot 15 kg per verlengd paar", "5 to 15 kg per pair kept alive"], ["een extra nieuw paar kopen", "buying an additional new pair"]],
  },
  "organic-linen-shirt": {
    d: ["Overhemd van biologisch linnen; vlas heeft weinig water en bestrijdingsmiddelen nodig.", "Shirt made of organic linen; flax needs little water and few pesticides."],
    m: "biologisch", co2: [["1 tot 3 kg per overhemd", "1 to 3 kg per shirt"], ["een overhemd van conventioneel katoen", "a conventional cotton shirt"]],
  },
  "recycled-cashmere": {
    d: ["Truien van kasjmier dat is teruggewonnen uit bestaande kledingstukken en opnieuw gesponnen.", "Sweaters made of cashmere recovered from existing garments and re-spun."],
    m: "gerecycled", co2: [["20 tot 50 kg per trui", "20 to 50 kg per sweater"], ["een trui van nieuwe kasjmier", "a virgin cashmere sweater"]],
  },
  "mushroom-leather": {
    d: ["Tassen en accessoires van 'leer' gekweekt uit zwamdraden (mycelium).", "Bags and accessories made of 'leather' grown from fungal mycelium."],
    m: "hernieuwbaar", co2: [["5 tot 15 kg per product", "5 to 15 kg per item"], ["dierlijk leer", "animal leather"]],
  },
  "deadstock-fabric-clothing": {
    d: ["Kleding genaaid van reststoffen die modehuizen anders zouden vernietigen.", "Clothing sewn from surplus fabrics that fashion houses would otherwise destroy."],
    m: "verspilling", co2: [["3 tot 8 kg per kledingstuk", "3 to 8 kg per garment"], ["hetzelfde kledingstuk van nieuwe stof", "the same garment made from new fabric"]],
  },
  // ---------- tech ----------
  "solar-power-bank": {
    d: ["Powerbank met zonnepaneel die telefoons en kleine apparaten oplaadt op zonlicht.", "Power bank with a solar panel that charges phones and small devices on sunlight."],
    m: "zon", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["laden op grijze netstroom", "charging on fossil grid power"]],
  },
  "solar-phone-charger": {
    d: ["Opvouwbaar zonnepaneel dat je telefoon direct oplaadt, ideaal voor onderweg en kamperen.", "Foldable solar panel that charges your phone directly, ideal for travel and camping."],
    m: "zon", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["laden op grijze netstroom", "charging on fossil grid power"]],
  },
  "refurbished-smartphone": {
    d: ["Professioneel opgeknapte smartphone met garantie: getest, schoongemaakt en waar nodig van nieuwe onderdelen voorzien.", "Professionally refurbished smartphone with warranty: tested, cleaned and fitted with new parts where needed."],
    m: "refurbished", co2: [["50 tot 80 kg per toestel", "50 to 80 kg per device"], ["een nieuw geproduceerde smartphone", "a newly manufactured smartphone"]],
  },
  "fairphone": {
    d: ["Modulaire smartphone, ontworpen om zelf te repareren, met eerlijker gewonnen materialen.", "Modular smartphone designed for self-repair, using more fairly sourced materials."],
    m: "repareerbaar", co2: [["30 tot 60 kg over de levensduur", "30 to 60 kg over its lifetime"], ["elke twee jaar een nieuw toestel", "replacing a phone every two years"]],
  },
  "solar-garden-lights": {
    d: ["Tuinverlichting met eigen zonnepaneeltje en accu; geen bekabeling of netstroom nodig.", "Garden lights with their own small solar panel and battery; no wiring or grid power needed."],
    m: "zon", co2: [["2 tot 5 kg per jaar", "2 to 5 kg per year"], ["bedrade tuinverlichting op netstroom", "wired garden lighting on grid power"]],
  },
  "rechargeable-batteries-usb": {
    d: ["Oplaadbare AA/AAA-batterijen die je rechtstreeks via USB oplaadt.", "Rechargeable AA/AAA batteries charged directly via USB."],
    m: "oplaadbaar", co2: [["2 tot 5 kg per jaar", "2 to 5 kg per year"], ["wegwerpbatterijen", "disposable batteries"]],
  },
  "e-ink-tablet": {
    d: ["Lees- en schrijftablet met e-inkscherm dat alleen stroom gebruikt bij het omslaan van een pagina.", "Reading and writing tablet with an e-ink screen that only draws power when the page changes."],
    m: "energie", co2: [["5 tot 15 kg per jaar", "5 to 15 kg per year"], ["lezen en notuleren op een lcd-tablet", "reading and note-taking on an LCD tablet"]],
  },
  "energy-monitor-plug": {
    d: ["Stekker die het stroomverbruik van elk apparaat meet en sluipverbruik zichtbaar maakt.", "Plug that measures any appliance's power use and reveals phantom load."],
    m: "energie", co2: [["30 tot 70 kg per jaar", "30 to 70 kg per year"], ["sluipverbruik ongemoeid laten", "leaving phantom load untouched"]],
  },
  "hand-crank-radio": {
    d: ["Radio (vaak met zaklamp en noodlader) die je opwindt met een slinger; ook op zonnecel.", "Radio (often with torch and emergency charger) powered by a hand crank; usually with a solar cell too."],
    m: "batterijvrij", co2: [["0,5 tot 2 kg per jaar", "0.5 to 2 kg per year"], ["een radio op wegwerpbatterijen", "a radio on disposable batteries"]],
  },
  "solar-security-camera": {
    d: ["Draadloze beveiligingscamera met eigen zonnepaneel; geen bekabeling of batterijwissels.", "Wireless security camera with its own solar panel; no wiring or battery swaps."],
    m: "zon", co2: [["2 tot 5 kg per jaar", "2 to 5 kg per year"], ["een camera op netstroom of wegwerpbatterijen", "a camera on grid power or disposable batteries"]],
  },
  "refurbished-laptop": {
    d: ["Professioneel opgeknapte laptop met garantie, vaak uit zakelijke leasevloten met licht gebruik.", "Professionally refurbished laptop with warranty, often from lightly used business lease fleets."],
    m: "refurbished", co2: [["150 tot 300 kg per laptop", "150 to 300 kg per laptop"], ["een nieuw geproduceerde laptop", "a newly manufactured laptop"]],
  },
  "modular-headphones": {
    d: ["Koptelefoon opgebouwd uit los vervangbare onderdelen: kussens, kabels, drivers en batterij.", "Headphones built from individually replaceable parts: pads, cables, drivers and battery."],
    m: "repareerbaar", co2: [["5 tot 15 kg over de levensduur", "5 to 15 kg over the lifetime"], ["elke paar jaar een nieuwe koptelefoon", "a new pair of headphones every few years"]],
  },
  "wind-up-flashlight": {
    d: ["Zaklamp die je oplaadt door te draaien of knijpen; altijd werkend, ook zonder batterijen in huis.", "Torch charged by cranking or squeezing; always works, even with no batteries in the house."],
    m: "batterijvrij", co2: [["0,5 tot 1,5 kg per jaar", "0.5 to 1.5 kg per year"], ["een zaklamp op wegwerpbatterijen", "a torch on disposable batteries"]],
  },
  "smart-power-strip": {
    d: ["Stekkerdoos die randapparatuur automatisch écht uitschakelt zodra het hoofdapparaat uitgaat.", "Power strip that fully switches off peripherals as soon as the main device powers down."],
    m: "energie", co2: [["20 tot 60 kg per jaar", "20 to 60 kg per year"], ["apparaten die dag en nacht stand-by staan", "devices left on standby day and night"]],
  },
  "solar-backpack": {
    d: ["Rugzak met ingebouwd zonnepaneel dat onderweg je telefoon of powerbank bijlaadt.", "Backpack with a built-in solar panel that tops up your phone or power bank on the go."],
    m: "zon", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["laden op grijze netstroom", "charging on fossil grid power"]],
  },
  "repairable-earbuds": {
    d: ["Draadloze oordopjes met vervangbare batterijen en onderdelen in plaats van verlijmde wegwerpdopjes.", "Wireless earbuds with replaceable batteries and parts instead of glued-shut disposables."],
    m: "repareerbaar", co2: [["2 tot 5 kg over de levensduur", "2 to 5 kg over the lifetime"], ["elke twee jaar nieuwe oordopjes", "new earbuds every two years"]],
  },
  "e-bike-conversion-kit": {
    d: ["Ombouwset die je bestaande fiets elektrisch maakt met een motorwiel en accu.", "Conversion kit that electrifies your existing bike with a motor wheel and battery."],
    m: "verspilling", co2: [["300 tot 800 kg per jaar bij vervangen autoritten", "300 to 800 kg per year when replacing car trips"], ["dezelfde ritten met de auto", "making the same trips by car"]],
  },
  "water-powered-clock": {
    d: ["Klok die loopt op een cel met water en een snufje zout in plaats van batterijen.", "Clock that runs on a cell filled with water and a pinch of salt instead of batteries."],
    m: "batterijvrij", co2: [["0,2 tot 0,5 kg per jaar", "0.2 to 0.5 kg per year"], ["een klok op wegwerpbatterijen", "a clock on disposable batteries"]],
  },
  "low-energy-mini-pc": {
    d: ["Compacte computer die met 10-25 watt hetzelfde kantoorwerk doet als een desktop van 100+ watt.", "Compact computer doing the same office work at 10-25 watts as a 100+ watt desktop."],
    m: "energie", co2: [["20 tot 60 kg per jaar", "20 to 60 kg per year"], ["een klassieke desktop-pc", "a traditional desktop PC"]],
  },
  // ---------- food ----------
  "oat-milk-powder": {
    d: ["Havermelk in poedervorm: thuis aanmaken met water, zonder pakken vloeistof te vervoeren.", "Oat milk in powder form: mixed with water at home, without shipping cartons of liquid."],
    m: "plantaardig", co2: [["30 tot 60 kg per jaar", "30 to 60 kg per year"], ["dagelijks koemelk", "daily dairy milk"]],
  },
  "reusable-coffee-filter": {
    d: ["Herbruikbaar koffiefilter van rvs of doek dat duizenden zetbeurten meegaat.", "Reusable stainless-steel or cloth coffee filter that lasts thousands of brews."],
    m: "wegwerp", co2: [["1 tot 2 kg per jaar", "1 to 2 kg per year"], ["papieren wegwerpfilters", "disposable paper filters"]],
  },
  "loose-leaf-tea-plastic-free": {
    d: ["Losse thee zonder zakjes; gezet met een herbruikbaar theezeefje.", "Loose-leaf tea without bags; brewed with a reusable strainer."],
    m: "wegwerp", co2: [["0,5 tot 1,5 kg per jaar", "0.5 to 1.5 kg per year"], ["thee in (vaak plastic-houdende) zakjes met envelopjes", "tea in (often plastic-containing) bags with envelopes"]],
  },
  "beeswax-honey-local": {
    d: ["Honing van imkers uit de regio, met korte keten van kast naar keukenkast.", "Honey from regional beekeepers, with a short chain from hive to cupboard."],
    m: "verspilling", co2: [["0,5 tot 1 kg per pot", "0.5 to 1 kg per jar"], ["honing die per schip en vrachtwagen van een ander continent komt", "honey shipped and trucked from another continent"]],
  },
  "plant-based-protein-powder": {
    d: ["Eiwitpoeder op basis van erwt, rijst of soja voor sport en keuken.", "Protein powder based on pea, rice or soy for sports and cooking."],
    m: "plantaardig", co2: [["10 tot 30 kg per jaar", "10 to 30 kg per year"], ["wei-eiwit uit zuivel", "dairy whey protein"]],
  },
  "fair-trade-chocolate": {
    d: ["Chocolade van gecertificeerd eerlijke cacao met traceerbare keten.", "Chocolate made from certified fair cacao with a traceable chain."],
    m: "eerlijk", co2: [["enkele kilo's per jaar", "a few kilos per year"], ["chocolade uit ketens met ontbossingsrisico", "chocolate from chains with deforestation risk"]],
  },
  "bulk-food-containers": {
    d: ["Voorraadpotten om onverpakt of grootverpakt eten in te bewaren.", "Storage jars for keeping unpackaged or bulk-bought food."],
    m: "wegwerp", co2: [["2 tot 5 kg per jaar", "2 to 5 kg per year"], ["kleinverpakkingen met wegwerpplastic", "small portions in single-use plastic"]],
  },
  "reusable-produce-bags": {
    d: ["Lichte, wasbare zakjes voor groente en fruit in de supermarkt.", "Light, washable bags for fruit and veg at the supermarket."],
    m: "wegwerp", co2: [["0,5 tot 1,5 kg per jaar", "0.5 to 1.5 kg per year"], ["plastic hemdtasjes", "single-use plastic produce bags"]],
  },
  "upcycled-snacks": {
    d: ["Snacks gemaakt van reststromen, zoals bierbostel of 'lelijke' groenten.", "Snacks made from side-streams such as brewers' grain or 'ugly' vegetables."],
    m: "verspilling", co2: [["enkele kilo's per jaar", "a few kilos per year"], ["snacks uit reguliere nieuwe grondstoffen", "snacks from regular virgin ingredients"]],
  },
  "plastic-free-tea-bags": {
    d: ["Theezakjes zonder plastic sealranden, volledig composteerbaar bij het gft.", "Tea bags without plastic sealing, fully compostable with organic waste."],
    m: "hernieuwbaar", co2: [["0,3 tot 0,8 kg per jaar", "0.3 to 0.8 kg per year"], ["zakjes met plastic (die bovendien microplastics lekken)", "bags containing plastic (which also shed microplastics)"]],
  },
  "fermentation-kit": {
    d: ["Set met potten en waterslot om zelf groente te fermenteren, zoals zuurkool en kimchi.", "Set of jars and airlock for fermenting vegetables at home, such as sauerkraut and kimchi."],
    m: "verspilling", co2: [["enkele kilo's per jaar", "a few kilos per year"], ["kant-en-klare geconserveerde producten en weggegooide groente", "ready-made preserves and vegetables thrown away"]],
  },
  "sprouting-jar": {
    d: ["Kiempot om zaden en peulvruchten in enkele dagen tot verse kiemgroente te laten groeien.", "Sprouting jar for growing seeds and pulses into fresh sprouts in days."],
    m: "plantaardig", co2: [["1 tot 3 kg per jaar", "1 to 3 kg per year"], ["voorverpakte, gekoelde en getransporteerde kiemgroente", "pre-packed, chilled and transported sprouts"]],
  },
  "seaweed-snacks-sustainable": {
    d: ["Snacks van gekweekt zeewier; de teelt vraagt geen land, zoet water of kunstmest.", "Snacks made of farmed seaweed; cultivation needs no land, fresh water or fertiliser."],
    m: "plantaardig", co2: [["enkele kilo's per jaar", "a few kilos per year"], ["snacks van landbouwgewassen met kunstmest", "snacks from fertilised field crops"]],
  },
  "refillable-spice-jars": {
    d: ["Kruidenpotjes die je bijvult uit grootverpakking of de onverpakt-winkel.", "Spice jars refilled from bulk packs or zero-waste shops."],
    m: "navulbaar", co2: [["0,3 tot 0,8 kg per jaar", "0.3 to 0.8 kg per year"], ["telkens nieuwe gevulde potjes kopen", "buying new filled jars each time"]],
  },
  "imperfect-produce-box": {
    d: ["Groente- en fruitpakket met 'lelijke' maar prima producten die anders werden doorgedraaid.", "Fruit and veg box with 'ugly' but perfectly fine produce that would otherwise be discarded."],
    m: "verspilling", co2: [["20 tot 50 kg per jaar", "20 to 50 kg per year"], ["die producten laten vernietigen en nieuwe telen", "destroying that produce and growing replacements"]],
  },
  "vegan-jerky": {
    d: ["Hartige jerky op basis van soja, jackfruit of paddenstoelen in plaats van rundvlees.", "Savoury jerky based on soy, jackfruit or mushrooms instead of beef."],
    m: "plantaardig", co2: [["3 tot 8 kg per kilo snack", "3 to 8 kg per kilo of snack"], ["jerky van rundvlees", "beef jerky"]],
  },
};

const { data: products, error } = await supabase
  .from("products")
  .select("id, slug, status, description, why_sustainable, co2_note, description_en, why_sustainable_en, co2_note_en")
  .eq("status", "approved");
if (error) throw new Error(error.message);

let updated = 0;
let skippedNoEntry = [];
let skippedFilled = 0;

for (const p of products ?? []) {
  const entry = P[p.slug];
  if (!entry) {
    skippedNoEntry.push(p.slug);
    continue;
  }
  const why = WHY[entry.m];
  const [co2Nl, co2En] = co2(entry.co2[0], entry.co2[1]);

  // Alleen lege velden vullen; admin-bewerkingen blijven staan.
  const patch = {};
  if (p.description == null) patch.description = entry.d[0];
  if (p.description_en == null) patch.description_en = entry.d[1];
  if (p.why_sustainable == null) patch.why_sustainable = why[0];
  if (p.why_sustainable_en == null) patch.why_sustainable_en = why[1];
  if (p.co2_note == null) patch.co2_note = co2Nl;
  if (p.co2_note_en == null) patch.co2_note_en = co2En;

  if (Object.keys(patch).length === 0) {
    skippedFilled++;
    continue;
  }

  const { error: e } = await supabase.from("products").update(patch).eq("id", p.id);
  if (e) throw new Error(`${p.slug}: ${e.message}`);
  updated++;
}

console.log(`Bijgewerkt: ${updated} producten`);
console.log(`Al volledig ingevuld (overgeslagen): ${skippedFilled}`);
if (skippedNoEntry.length > 0) {
  console.log(`Geen teksten beschikbaar voor: ${skippedNoEntry.join(", ")}`);
}
