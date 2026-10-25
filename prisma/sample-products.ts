// Sample catalogue for testing before CJ products are imported.
// Prices use a made-up "CJ cost"; the selling price is cost × store markup.
// No sample reviews are added: the store only shows real customer reviews.

export const SAMPLE_CATEGORIES = [
  { slug: "skincare", name: "Skincare", description: "Cleansers, toners, serums and creams for every skin type.", imageUrl: "/samples/saffron-glow-serum-1.svg" },
  { slug: "makeup", name: "Makeup", description: "Skin tints, brows and liners for an effortless finish.", imageUrl: "/samples/skin-tint-foundation-1.svg" },
  { slug: "lips", name: "Lips", description: "Velvet mattes and glossy oils in wearable shades.", imageUrl: "/samples/velvet-matte-lipstick-1.svg" },
  { slug: "body-and-hair", name: "Body & Hair", description: "Rich butters and nourishing oils from head to toe.", imageUrl: "/samples/shea-oud-body-butter-1.svg" },
];

type SampleVariant = { options: Record<string, string>; cost: number; stock?: number; compareAt?: number; image?: string };
type SampleProduct = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  ingredients: string;
  howToUse: string;
  safetyInfo: string;
  variants: SampleVariant[];
};

const SAFETY_GENERAL =
  "For external use only. Avoid contact with eyes; if contact occurs, rinse well with water. Stop use if irritation develops. Do a patch test before first use. Keep out of reach of children.";

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    slug: "saffron-glow-serum", title: "Saffron Glow Face Serum", category: "skincare", tags: ["serum", "glow", "bestseller"],
    description: "A lightweight daily serum with saffron extract and niacinamide that helps skin look brighter and more even.\n\nAbsorbs in seconds, leaves no sticky feel, and layers easily under moisturiser and makeup.",
    ingredients: "Aqua, Glycerin, Niacinamide, Crocus Sativus (Saffron) Flower Extract, Sodium Hyaluronate, Panthenol, Phenoxyethanol, Ethylhexylglycerin.",
    howToUse: "After cleansing and toning, apply 3–4 drops to face and neck morning and evening. Follow with moisturiser. Use sunscreen during the day.",
    safetyInfo: SAFETY_GENERAL,
    variants: [{ options: { Size: "30 ml" }, cost: 520, compareAt: 2499 }, { options: { Size: "50 ml" }, cost: 760 }],
  },
  {
    slug: "juniper-calm-cleanser", title: "Juniper Calm Gel Cleanser", category: "skincare", tags: ["cleanser", "sensitive skin"],
    description: "A gentle, low-foam gel cleanser that removes sunscreen, makeup and daily grime without leaving skin tight.",
    ingredients: "Aqua, Coco-Glucoside, Glycerin, Juniperus Communis Fruit Extract, Aloe Barbadensis Leaf Juice, Allantoin, Citric Acid, Sodium Benzoate.",
    howToUse: "Massage one pump onto damp skin for 30 seconds, then rinse with lukewarm water. Use morning and evening.",
    safetyInfo: SAFETY_GENERAL,
    variants: [{ options: { Size: "150 ml" }, cost: 410 }],
  },
  {
    slug: "rosewater-toner", title: "Rosewater Hydrating Toner", category: "skincare", tags: ["toner", "hydrating"],
    description: "An alcohol-free toner with rose water and hyaluronic acid to refresh skin and prepare it for serum.",
    ingredients: "Rosa Damascena Flower Water, Glycerin, Sodium Hyaluronate, Betaine, Panthenol, Phenoxyethanol.",
    howToUse: "Sweep over clean skin with a cotton pad, or press in with your hands. Use morning and evening.",
    safetyInfo: SAFETY_GENERAL,
    variants: [{ options: { Size: "100 ml" }, cost: 330 }, { options: { Size: "200 ml" }, cost: 520 }],
  },
  {
    slug: "barrier-night-cream", title: "Barrier Repair Night Cream", category: "skincare", tags: ["moisturiser", "night"],
    description: "A rich but breathable overnight cream with ceramides and squalane that helps skin feel soft, calm and comfortable by morning.",
    ingredients: "Aqua, Squalane, Caprylic/Capric Triglyceride, Glycerin, Ceramide NP, Cholesterol, Butyrospermum Parkii (Shea) Butter, Tocopherol, Phenoxyethanol.",
    howToUse: "Warm a pea-sized amount between fingertips and press onto face and neck as the last step of your evening routine.",
    safetyInfo: SAFETY_GENERAL,
    variants: [{ options: { Size: "50 ml" }, cost: 690, compareAt: 2999 }],
  },
  {
    slug: "daily-defence-moisturiser", title: "Daily Defence Moisturiser", category: "skincare", tags: ["moisturiser", "day"],
    description: "A fast-absorbing day moisturiser with green tea and vitamin E. Light enough for oily skin, comforting enough for dry patches.",
    ingredients: "Aqua, Glycerin, Caprylic/Capric Triglyceride, Camellia Sinensis Leaf Extract, Tocopheryl Acetate, Xanthan Gum, Phenoxyethanol.",
    howToUse: "Smooth over face and neck each morning after serum. Follow with sunscreen.",
    safetyInfo: SAFETY_GENERAL,
    variants: [{ options: { Size: "75 ml" }, cost: 480 }],
  },
  {
    slug: "skin-tint-foundation", title: "Skin Tint Foundation", category: "makeup", tags: ["foundation", "base"],
    description: "Sheer-to-light coverage that evens tone while letting your skin show through. Natural, satin finish.",
    ingredients: "Aqua, Cyclopentasiloxane, Glycerin, Titanium Dioxide, Iron Oxides, Dimethicone, Sodium Chloride, Phenoxyethanol.",
    howToUse: "Shake well. Apply a few drops with fingertips or a damp sponge, blending outwards from the centre of the face. Build where needed.",
    safetyInfo: SAFETY_GENERAL,
    variants: ["Fair", "Light", "Medium", "Tan", "Deep"].map((shade) => ({ options: { Shade: shade }, cost: 560 })),
  },
  {
    slug: "brow-sculpt-pencil", title: "Brow Sculpt Pencil", category: "makeup", tags: ["brows"],
    description: "An ultra-fine retractable pencil with a spoolie for natural, hair-like strokes that last all day.",
    ingredients: "Hydrogenated Vegetable Oil, Synthetic Wax, Mica, Iron Oxides, Tocopherol.",
    howToUse: "Draw short, light strokes in the direction of hair growth, then brush through with the spoolie to soften.",
    safetyInfo: "Avoid direct contact with eyes. Stop use if irritation develops. Keep out of reach of children.",
    variants: ["Taupe", "Brown", "Dark Brown"].map((shade) => ({ options: { Shade: shade }, cost: 210 })),
  },
  {
    slug: "kohl-eyeliner", title: "Soft Kohl Eyeliner", category: "makeup", tags: ["eyes", "liner"],
    description: "A creamy, smudgeable kohl pencil for smoky or defined looks.",
    ingredients: "Synthetic Wax, Hydrogenated Castor Oil, Iron Oxides, Mica, Tocopherol.",
    howToUse: "Glide along the lash line. Smudge with a brush within 30 seconds for a softer look.",
    safetyInfo: "For use around the eyes. Do not share eye pencils. Stop use if irritation develops. Keep out of reach of children.",
    variants: ["Black", "Brown"].map((shade) => ({ options: { Shade: shade }, cost: 180 })),
  },
  {
    slug: "velvet-matte-lipstick", title: "Velvet Matte Lipstick", category: "lips", tags: ["lipstick", "matte", "bestseller"],
    description: "Rich, comfortable colour with a soft-blur matte finish that doesn't dry out lips.",
    ingredients: "Isododecane, Dimethicone, Kaolin, Synthetic Wax, Tocopheryl Acetate, Iron Oxides, Mica.",
    howToUse: "Apply from the centre of the lips outwards. For a softer look, dab on with a fingertip.",
    safetyInfo: "Stop use if irritation develops. Keep out of reach of children.",
    variants: ["Rose", "Brick", "Plum", "Nude"].map((shade) => ({
      options: { Shade: shade }, cost: 290, image: `/samples/velvet-matte-lipstick-${shade.toLowerCase()}.svg`,
    })),
  },
  {
    slug: "silk-tint-lip-oil", title: "Silk Tint Lip Oil", category: "lips", tags: ["lip oil", "gloss"],
    description: "A non-sticky, glossy lip oil with a sheer wash of colour and jojoba oil to keep lips soft.",
    ingredients: "Simmondsia Chinensis (Jojoba) Seed Oil, Polyisobutene, Ricinus Communis Seed Oil, Tocopherol, Flavour, Iron Oxides.",
    howToUse: "Swipe the applicator over bare lips or on top of lipstick. Reapply as often as you like.",
    safetyInfo: "Stop use if irritation develops. Keep out of reach of children.",
    variants: ["Clear", "Peach", "Berry"].map((shade) => ({
      options: { Shade: shade }, cost: 250, image: `/samples/silk-tint-lip-oil-${shade.toLowerCase()}.svg`,
    })),
  },
  {
    slug: "argan-shine-hair-oil", title: "Argan Shine Hair Oil", category: "body-and-hair", tags: ["hair", "oil"],
    description: "A lightweight argan oil blend that tames frizz and adds shine without weighing hair down.",
    ingredients: "Argania Spinosa Kernel Oil, Caprylic/Capric Triglyceride, Cyclopentasiloxane, Tocopherol, Parfum.",
    howToUse: "Warm 1–2 drops between palms and smooth through mid-lengths and ends of damp or dry hair.",
    safetyInfo: "For external use only. Avoid contact with eyes. Keep out of reach of children.",
    variants: [{ options: { Size: "50 ml" }, cost: 380 }, { options: { Size: "100 ml" }, cost: 590 }],
  },
  {
    slug: "shea-oud-body-butter", title: "Shea & Oud Body Butter", category: "body-and-hair", tags: ["body", "moisturiser"],
    description: "A whipped body butter with shea and a warm oud scent. Melts in for long-lasting softness.",
    ingredients: "Butyrospermum Parkii (Shea) Butter, Aqua, Glycerin, Cocos Nucifera Oil, Cetearyl Alcohol, Parfum, Tocopherol, Phenoxyethanol.",
    howToUse: "Massage into skin after a shower, paying extra attention to dry areas like elbows and knees.",
    safetyInfo: "For external use only. Contains fragrance. Stop use if irritation develops. Keep out of reach of children.",
    variants: [{ options: { Size: "100 ml" }, cost: 450 }, { options: { Size: "200 ml" }, cost: 690, stock: 0 }],
  },
];
