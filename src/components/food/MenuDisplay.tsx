"use client";

import { useState } from "react";
import { foodService } from "@/service/food.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  discountedPrice: string | null;
  imageUrl: string | null;
  preparationTime: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  menuItems: MenuItem[];
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

const ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "ROOM_SERVICE"] as const;

const MenuDisplay = () => {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] =
    useState<(typeof ORDER_TYPES)[number]>("ROOM_SERVICE");
  const [tableNumber, setTableNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await foodService.getMenu();
      return response.data?.data ?? response.data;
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: (payload: {
      items: { menuItemId: string; quantity: number }[];
      type: string;
      tableNumber?: string;
      specialNotes?: string;
      checkInDate?: string;
      checkOutDate?: string;
    }) => foodService.createOrder(payload),
    onSuccess: () => {
      setCart([]);
      setTableNumber("");
      setSpecialNotes("");
      setCheckInDate("");
      setCheckOutDate("");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to place order");
    },
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      const price = Number(item.discountedPrice ?? item.price);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, price, quantity: 1 },
      ];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId
            ? { ...c, quantity: c.quantity + delta }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    if (orderType === "DINE_IN" && !tableNumber.trim()) {
      toast.error("Please enter table number");
      return;
    }

    if (orderType === "ROOM_SERVICE" && (!checkInDate || !checkOutDate)) {
      toast.error("Please enter your check-in and check-out dates");
      return;
    }

    placeOrderMutation.mutate({
      items: cart.map((c) => ({
        menuItemId: c.menuItemId,
        quantity: c.quantity,
      })),
      type: orderType,
      tableNumber: orderType === "DINE_IN" ? tableNumber.trim() : undefined,
      specialNotes: specialNotes.trim() || undefined,
      checkInDate: orderType === "ROOM_SERVICE" ? checkInDate : undefined,
      checkOutDate: orderType === "ROOM_SERVICE" ? checkOutDate : undefined,
    });
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <p className="text-white/40 font-sans text-sm">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <p className="text-[#C8102E] font-sans text-sm">Error loading menu.</p>
      </div>
    );
  }

  const categories: Category[] = Array.isArray(data) ? data : [];

  return (
    <div className="bg-[#0B0C10] min-h-screen pt-24">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1B21] to-[#0B0C10]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[#C8102E] text-[11px] font-sans tracking-[0.35em] uppercase mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-[#C8102E]" />Room Service & Dining
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-5">Our Menu</h1>
          <p className="text-white/50 font-sans max-w-xl leading-relaxed">
            Order fresh dishes prepared by our kitchen, delivered to your room or table.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-16 flex flex-col lg:flex-row gap-8">
        {/* Menu */}
        <div className="flex-1">
          {categories.length === 0 ? (
            <p className="text-white/40 font-sans text-sm">No menu categories available.</p>
          ) : (
            categories.map((category) => (
              <section key={category.id} className="mb-12">
                <div className="mb-6">
                  <p className="text-[#37EFD1] text-[10px] font-sans tracking-widest uppercase mb-1">Category</p>
                  <h2 className="font-display text-2xl text-white font-semibold border-b border-white/5 pb-3">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-white/40 font-sans text-sm mt-2">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {category.menuItems?.length > 0 ? (
                    category.menuItems
                      .filter((item) => item.isAvailable)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="group bg-[#1A1B21] border border-white/5 hover:border-[#37EFD1]/20 rounded-xl overflow-hidden transition-all"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-44 object-cover"
                            />
                          ) : (
                            <div className="w-full h-44 flex items-center justify-center bg-gradient-to-br from-[#0d1a2e] to-[#0B0C10] text-5xl">
                              <span className="opacity-20">🍽️</span>
                            </div>
                          )}

                          <div className="p-5">
                            <h3 className="font-display text-white text-lg font-semibold mb-1">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-white/40 font-sans text-sm mb-3 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                {item.discountedPrice ? (
                                  <>
                                    <span className="font-display font-semibold text-lg text-[#37EFD1]">
                                      RM {item.discountedPrice}
                                    </span>
                                    <span className="text-sm text-white/30 line-through font-sans">
                                      RM {item.price}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-display font-semibold text-lg text-[#37EFD1]">
                                    RM {item.price}
                                  </span>
                                )}
                              </div>
                              {item.preparationTime != null && (
                                <span className="text-xs text-white/35 font-sans">
                                  {item.preparationTime} mins
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.isVegetarian && (
                                <span className="text-[10px] font-sans bg-[#37EFD1]/8 text-[#37EFD1]/80 px-2.5 py-1 rounded-full border border-[#37EFD1]/20">
                                  Veg
                                </span>
                              )}
                              {item.isVegan && (
                                <span className="text-[10px] font-sans bg-[#37EFD1]/8 text-[#37EFD1]/80 px-2.5 py-1 rounded-full border border-[#37EFD1]/20">
                                  Vegan
                                </span>
                              )}
                              {item.isGlutenFree && (
                                <span className="text-[10px] font-sans bg-white/5 border border-white/8 text-white/50 px-2.5 py-1 rounded-full">
                                  GF
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => addToCart(item)}
                              className="w-full bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25"
                            >
                              Add to Order
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-white/30 font-sans italic text-sm">
                      No items available in this category.
                    </p>
                  )}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Cart / Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 sticky top-24 space-y-4">
            <h3 className="font-display text-white text-lg font-semibold">Your Order</h3>

            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-white/35 block mb-1.5">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                className="w-full bg-[#0B0C10] border border-white/8 rounded-lg px-3 py-2 text-sm font-sans text-white focus:outline-none focus:border-[#37EFD1]/40 transition-colors"
              >
                {ORDER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {orderType === "DINE_IN" && (
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest text-white/35 block mb-1.5">
                  Table Number
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T12"
                  className="w-full bg-[#0B0C10] border border-white/8 rounded-lg px-3 py-2 text-sm font-sans text-white placeholder:text-white/20 focus:outline-none focus:border-[#37EFD1]/40 transition-colors"
                />
              </div>
            )}

            {orderType === "ROOM_SERVICE" && (
              <>
                <div>
                  <label className="text-[10px] font-sans uppercase tracking-widest text-white/35 block mb-1.5">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-[#0B0C10] border border-white/8 rounded-lg px-3 py-2 text-sm font-sans text-white focus:outline-none focus:border-[#37EFD1]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-sans uppercase tracking-widest text-white/35 block mb-1.5">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-[#0B0C10] border border-white/8 rounded-lg px-3 py-2 text-sm font-sans text-white focus:outline-none focus:border-[#37EFD1]/40 transition-colors"
                  />
                </div>
                <p className="text-xs text-white/30 font-sans italic">
                  Room number will be auto-detected from your booking matching these dates.
                </p>
              </>
            )}

            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-white/35 block mb-1.5">
                Special Notes
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Any allergies or requests..."
                className="w-full bg-[#0B0C10] border border-white/8 rounded-lg px-3 py-2 text-sm font-sans text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#37EFD1]/40 transition-colors"
              />
            </div>

            {cart.length === 0 ? (
              <p className="text-white/30 font-sans text-sm italic">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cart.map((c) => (
                  <div
                    key={c.menuItemId}
                    className="flex items-center justify-between text-sm font-sans"
                  >
                    <div className="flex-1">
                      <p className="text-white">{c.name}</p>
                      <p className="text-white/35 text-xs">
                        RM {c.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(c.menuItemId, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-white/5 border border-white/8 rounded text-white hover:bg-white/10 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white w-4 text-center">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(c.menuItemId, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white/5 border border-white/8 rounded text-white hover:bg-white/10 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(c.menuItemId)}
                        className="text-[#C8102E] hover:text-[#a00d24] ml-1 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-white/5 pt-3 space-y-1.5 text-sm font-sans">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>RM {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Tax (10%)</span>
                  <span>RM {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-semibold pt-1">
                  <span>Total</span>
                  <span className="text-[#37EFD1] text-lg">RM {total.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || placeOrderMutation.isPending}
              className="w-full bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-40 disabled:cursor-not-allowed text-white font-sans font-medium py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25"
            >
              {placeOrderMutation.isPending ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDisplay;