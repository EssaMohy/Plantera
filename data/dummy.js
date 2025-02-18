import Category from "../models/category";
import Plant from "../models/plant";

export const CATEGORIES = [
  new Category("c1", "Abutilon"),
  new Category("c2", "Chlorophytum comosum"),
  new Category("c3", "Monstera deliciosa"),
  new Category("c4", "Hosta"),
  new Category("c5", "Zamioculcas"),
  new Category("c6", "Verbena"),
  new Category("c7", "Nephrolepis exaltata"),
];

export const PLANTS = [
  new Plant(
    "p1",
    "Indian mallow",
    "Abutilon",
    "../assets/images/Container.png"
  ),
  new Plant("p2", "Spider plant", "Chlorophytum comosum"),
  new Plant("p3", "Swiss chese plane", "Monstera deliciosa"),
  new Plant("p4", "Plantain lilies", "Hosta"),
  new Plant("p5", "Zanzibar Gem", "Zamioculcas"),
  new Plant("p6", "Vervain", "Verbena"),
  new Plant("p7", "Sword fern", "Nephrolepis exaltata"),
  new Plant("p8", "Sword fern", "Nephrolepis exaltata"),
];
