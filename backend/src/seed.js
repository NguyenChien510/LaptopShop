import Brand from "./models/Brand.js";
import Series from "./models/Series.js";
import Category from "./models/Usage.js";

export async function seed() {
  // Brand
  const brands = await Brand.bulkCreate([
    { name: "Dell" },
    { name: "HP" },
    { name: "Lenovo" },
    { name: "ASUS" },
    { name: "Acer" },
    { name: "MSI" },
    { name: "Apple" },
  ]);

  // Series
  await Series.bulkCreate([
    // Dell
    { name: "Inspiron", brandId: brands[0].id },
    { name: "XPS", brandId: brands[0].id },
    { name: "Latitude", brandId: brands[0].id },
    { name: "Alienware", brandId: brands[0].id },
    { name: "Vostro", brandId: brands[0].id },

    // HP
    { name: "Pavilion", brandId: brands[1].id },
    { name: "Envy", brandId: brands[1].id },
    { name: "Spectre", brandId: brands[1].id },
    { name: "OMEN", brandId: brands[1].id },
    { name: "EliteBook", brandId: brands[1].id },

    // Lenovo
    { name: "ThinkPad", brandId: brands[2].id },
    { name: "IdeaPad", brandId: brands[2].id },
    { name: "Legion", brandId: brands[2].id },
    { name: "Yoga", brandId: brands[2].id },

    // ASUS
    { name: "VivoBook", brandId: brands[3].id },
    { name: "ZenBook", brandId: brands[3].id },
    { name: "ROG", brandId: brands[3].id },
    { name: "TUF", brandId: brands[3].id },
    { name: "ExpertBook", brandId: brands[3].id },

    // Acer
    { name: "Aspire", brandId: brands[4].id },
    { name: "Nitro", brandId: brands[4].id },
    { name: "Predator", brandId: brands[4].id },
    { name: "Swift", brandId: brands[4].id },

    // MSI
    { name: "Modern", brandId: brands[5].id },
    { name: "Prestige", brandId: brands[5].id },
    { name: "Creator", brandId: brands[5].id },
    { name: "Katana", brandId: brands[5].id },
    { name: "Raider", brandId: brands[5].id },

    // Apple
    { name: "MacBook Air", brandId: brands[6].id },
    { name: "MacBook Pro", brandId: brands[6].id },
  ]);

  // Category (Usage)
  await Category.bulkCreate([
    { name: "Study" },
    { name: "Office" },
    { name: "Design" },
    { name: "Development" },
    { name: "Gaming" },
  ]);

  console.log("✅ Seed thành công!");
  process.exit();
}
