// Mock data for local development without Supabase credentials

export const mockRestaurants = [
  {
    id: "r1",
    name: "Bella Italia",
    description: "Culinária italiana autêntica no coração da cidade. Receitas de família passadas por gerações.",
    category: "Italiana",
    address: "Rua Augusta, 123 - São Paulo",
    instagram_handle: "@bellaitalia",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    created_at: new Date().toISOString(),
    user_id: null,
  },
  {
    id: "r2",
    name: "Sushi Master",
    description: "Sushi fresco e delícias japonesas. Ingredientes selecionados diariamente.",
    category: "Japonesa",
    address: "Av. Paulista, 456 - São Paulo",
    instagram_handle: "@sushimaster",
    image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
    created_at: new Date().toISOString(),
    user_id: null,
  },
  {
    id: "r3",
    name: "Burger House",
    description: "Hambúrgueres gourmets feitos com carne Wagyu e pão artesanal assado diariamente.",
    category: "Americana",
    address: "Rua Oscar Freire, 789 - São Paulo",
    instagram_handle: "@burgerhouse",
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    created_at: new Date().toISOString(),
    user_id: null,
  },
  {
    id: "r4",
    name: "Taco Loco",
    description: "Comida de rua mexicana no seu melhor. Carnes cozidas lentamente e tortilhas frescas feitas na hora.",
    category: "Mexicana",
    address: "Vila Madalena, 321 - São Paulo",
    instagram_handle: "@tacoloco",
    image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    created_at: new Date().toISOString(),
    user_id: null,
  },
];

const today = new Date().toISOString().split("T")[0];
const inThreeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

export const mockDeals = [
  {
    id: "d1",
    restaurant_id: "r1",
    title: "Noite da Pizza com 50% OFF",
    description: "Ganhe 50% de desconto em todas as pizzas às terças e quintas. Escolha entre mais de 20 sabores.",
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    discount_percentage: 50,
    max_people: 4,
    available_spots: 20,
    valid_from: today,
    valid_until: inThreeMonths,
    days_available: ["tuesday", "thursday"],
    active: true,
    created_at: new Date().toISOString(),
    restaurant: mockRestaurants[0],
  },
  {
    id: "d2",
    restaurant_id: "r2",
    title: "Combo de Sushi para 2",
    description: "Combo especial com 40 peças artesanais + 2 bebidas premium. Uma viagem gastronômica pelo Japão.",
    image_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
    discount_percentage: 30,
    max_people: 2,
    available_spots: 15,
    valid_from: today,
    valid_until: inThreeMonths,
    days_available: ["monday", "wednesday", "friday"],
    active: true,
    created_at: new Date().toISOString(),
    restaurant: mockRestaurants[1],
  },
  {
    id: "d3",
    restaurant_id: "r3",
    title: "Compre 1 e Leve 2 Hambúrgueres",
    description: "Compre um hambúrguer gourmet de Wagyu e ganhe outro totalmente grátis. Disponível durante a semana.",
    image_url: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800",
    discount_percentage: 50,
    max_people: 2,
    available_spots: 30,
    valid_from: today,
    valid_until: inThreeMonths,
    days_available: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    active: true,
    created_at: new Date().toISOString(),
    restaurant: mockRestaurants[2],
  },
  {
    id: "d4",
    restaurant_id: "r4",
    title: "Especial de Taco na Terça",
    description: "3 tacos da casa + cerveja artesanal ou água fresca por um preço incrível toda terça-feira.",
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800",
    discount_percentage: 40,
    max_people: 4,
    available_spots: 25,
    valid_from: today,
    valid_until: inThreeMonths,
    days_available: ["tuesday"],
    active: true,
    created_at: new Date().toISOString(),
    restaurant: mockRestaurants[3],
  },
  {
    id: "d5",
    restaurant_id: "r1",
    title: "Brunch de Fim de Semana",
    description: "Brunch à vontade com clássicos italianos, doces frescos e mimosas liberadas aos fins de semana.",
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
    discount_percentage: 35,
    max_people: 6,
    available_spots: 12,
    valid_from: today,
    valid_until: inThreeMonths,
    days_available: ["saturday", "sunday"],
    active: true,
    created_at: new Date().toISOString(),
    restaurant: mockRestaurants[0],
  },
];

// In-memory bookings store for mock mode
export const mockBookings: any[] = [];

export function getMockDeal(id: string) {
  return mockDeals.find((d) => d.id === id) ?? null;
}

export function getMockBooking(id: string) {
  return mockBookings.find((b) => b.id === id) ?? null;
}
