import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const DINING = [
{ name: "Seahorse", type: "Seafood", loc: "Deck" },
{ name: "Hibiscus", type: "Asian", loc: "Garden" },
{ name: "Nautilus", type: "Fine Dining", loc: "Tower" },
{ name: "Reef Bar", type: "Cocktails", loc: "Water" },
];

export default function DiningSection() {
return (
<section className="py-20">
<div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6">

{DINING.map((d) => (
<Card key={d.name} className="bg-[#111] border-white/10">
<CardContent className="p-6">

<h3 className="text-white font-semibold">
{d.name}
</h3>

<p className="text-white/50 text-sm">
{d.type}
</p>

<div className="flex gap-1 mt-2 text-cyan-400 text-sm">
<MapPin size={14} />
{d.loc}
</div>

</CardContent>
</Card>
))}

</div>
</section>
);
}