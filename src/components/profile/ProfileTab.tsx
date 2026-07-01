"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { userService } from "@/service/user.service";
import { Pencil, Check, X, Loader2 } from "lucide-react";

import { toast } from "sonner";

import countries from "world-countries";

export default function ProfileTab({ profile }: any) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(profile?.data || {});
  const [avatarLoading, setAvatarLoading] = useState(false);

  const user = userData;
  const countryList = countries.map((c) => c.name.common);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      address: "",
      country: "",
      nationality: "",
      gender: "",
      dateOfBirth: "",
      zipCode: "",
      nationalId: "",
      passportNumber: "",
    },

    onSubmit: async ({ value }) => {
      if (!editingKey) return;

      try {
        setLoading(true);
        const payload = {
          [editingKey]: value[editingKey as keyof typeof value],
        };

        const cleanPayload = Object.fromEntries(
          Object.entries(payload).filter(
            ([_, v]) => v !== "" && v !== null && v !== undefined,
          ),
        );

        await userService.updateMyProfile(cleanPayload);

        setUserData((prev: any) => ({
          ...prev,
          ...cleanPayload,
        }));

        toast.success("Profile updated successfully");
        setEditingKey(null);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Update failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setAvatarLoading(true);
      const res = await userService.uploadAvatar(formData);
      setUserData((prev: any) => ({
        ...prev,
        avatarUrl: res.data?.data?.avatarUrl,
      }));
      toast.success("Avatar updated");
    } catch (err: any) {
      console.log(err?.response?.data || err);
      toast.error("Avatar upload failed");
    } finally {
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.data) {
      setUserData(profile.data);
      form.reset({
        firstName: profile.data.firstName || "",
        lastName: profile.data.lastName || "",
        email: profile.data.email || "",
        phone: profile.data.phone || "",
        city: profile.data.city || "",
        address: profile.data.address || "",
        country: profile.data.country || "",
        nationality: profile.data.nationality || "",
        gender: profile.data.gender || "",
        zipCode: profile.data.zipCode || "",
        nationalId: profile.data.nationalId || "",
        passportNumber: profile.data.passportNumber || "",
        dateOfBirth: profile.data.dateOfBirth || "",
      });
    }
  }, [profile]);

  const sections = [
    { title: "Personal Info", fields: ["firstName", "lastName", "gender", "dateOfBirth"] },
    { title: "Contact Info", fields: ["email", "phone"] },
    { title: "Location", fields: ["city", "address", "country", "zipCode"] },
    { title: "Identity", fields: ["nationality", "nationalId", "passportNumber"] },
  ];

  const labels: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    city: "City",
    address: "Address",
    country: "Country",
    nationality: "Nationality",
    gender: "Gender",
    zipCode: "Zip Code",
    nationalId: "National ID",
    passportNumber: "Passport Number",
    dateOfBirth: "Date of Birth",
  };

  const genderOptions = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
  ];

  return (
    <div className="space-y-6 text-white">
      <Card className="bg-zinc-950 border border-zinc-800 p-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={user?.avatarUrl ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL}/${user.avatarUrl}`) : "https://ui-avatars.com/api/?name=User&background=18181b&color=fff"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
            />
            <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-black border border-zinc-700 flex items-center justify-center cursor-pointer">
              {avatarLoading ? <Loader2 className="h-3 w-3 animate-spin text-white" /> : <Pencil className="h-3 w-3 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.firstName || "User"} {user?.lastName || ""}</h2>
            <p className="text-sm text-zinc-400">{user?.email}</p>
          </div>
        </div>
      </Card>

      {sections.map((section) => (
        <Card key={section.title} className="bg-zinc-950 border border-zinc-800 p-5">
          <h3 className="text-xs uppercase text-zinc-400 mb-4">{section.title}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {section.fields.map((key) => (
              <div key={key} className="relative p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                <p className="text-xs text-zinc-400">{labels[key]}</p>
                {editingKey === key ? (
                  <form.Field
                    name={key as any}
                    children={(field) => (
                      <>
                        {key === "email" ? (
                          <Input disabled className="mt-3 bg-zinc-800 border-zinc-700 text-white opacity-60" value={field.state.value || ""} />
                        ) : key === "gender" ? (
                          <Select value={field.state.value || undefined} onValueChange={(value) => field.handleChange(value)}>
                            <SelectTrigger className="mt-3 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                            <SelectContent className="z-[9999] bg-zinc-900 border-zinc-700 text-white">
                              {genderOptions.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : key === "country" ? (
                          <Select value={field.state.value || ""} onValueChange={(value) => { field.handleChange(value); form.setFieldValue(key as any, value); }}>
                            <SelectTrigger className="mt-3 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select Country" /></SelectTrigger>
                            <SelectContent className="z-[9999] max-h-72 overflow-y-auto bg-zinc-900 border-zinc-700 text-white">
                              {countryList.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : key === "dateOfBirth" ? (
                          <Input
                            type="date"
                            disabled={loading}
                            className="mt-3 bg-zinc-800 border-zinc-700 text-white"
                            value={field.state.value ? String(field.state.value).split("T")[0] : ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.handleChange(value);
                              form.setFieldValue(key as any, value ? `${value}T00:00:00.000Z` : null);
                            }}
                          />
                        ) : (
                          <Input disabled={loading} className="mt-3 bg-zinc-800 border-zinc-700 text-white" value={field.state.value || ""} onChange={(e) => field.handleChange(e.target.value)} />
                        )}
                      </>
                    )}
                  />
                ) : (
                  <p className="mt-3 text-sm text-zinc-100">
                    {key === "dateOfBirth" && user?.[key] ? String(user[key]).split("T")[0] : user?.[key] || "Not provided"}
                  </p>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {editingKey === key ? (
                    <>
                      <button type="button" onClick={async () => await form.handleSubmit()} className="text-green-400">{loading ? <Loader2 className="animate-spin" /> : <Check size={16} />}</button>
                      <button type="button" onClick={() => setEditingKey(null)} className="text-red-400"><X size={16} /></button>
                    </>
                  ) : (
                    <button type="button" disabled={key === "email"} onClick={() => setEditingKey(key)} className="text-zinc-400 hover:text-white disabled:opacity-40"><Pencil size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}