"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { userService } from "@/service/user.service";
import { toast } from "sonner";
import { Loader2, Mail, Moon, Gift } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const preferences = [
  {
    name: "emailNotifications" as const,
    label: "Email Notifications",
    description: "Receive updates about your account activity",
    icon: Mail,
    iconBg: "bg-indigo-950/60",
    iconColor: "text-indigo-400",
  },
  {
    name: "darkMode" as const,
    label: "Dark Mode",
    description: "Toggle between light and dark themes",
    icon: Moon,
    iconBg: "bg-violet-950/60",
    iconColor: "text-violet-400",
  },
  {
    name: "receivePromotions" as const,
    label: "Promotional Emails",
    description: "Get notified about offers and new features",
    icon: Gift,
    iconBg: "bg-emerald-950/60",
    iconColor: "text-emerald-400",
  },
];

export default function PreferencesTab({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      darkMode: user?.preferences?.darkMode ?? false,
      receivePromotions: user?.preferences?.receivePromotions ?? false,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await userService.updatePreferences(value);
        queryClient.invalidateQueries({ queryKey: ["me"] });
        toast.success("Preferences updated successfully");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to update preferences");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (user?.preferences) {
      form.reset({
        emailNotifications: user.preferences.emailNotifications,
        darkMode: user.preferences.darkMode,
        receivePromotions: user.preferences.receivePromotions,
      });
    }
  }, [user]);

  return (
    <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white tracking-tight">App Preferences</h3>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your notification and display settings.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col flex-grow gap-3"
      >
        {preferences.map(({ name, label, description, icon: Icon, iconBg, iconColor }) => (
          <div
            key={name}
            className="flex items-center justify-between px-4 py-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/50 hover:border-zinc-700/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
              </div>
            </div>
            <form.Field
              name={name}
              children={(field) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  className="data-[state=checked]:bg-zinc-200 data-[state=unchecked]:bg-zinc-700"
                />
              )}
            />
          </div>
        ))}

        <div className="mt-auto pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm rounded-xl transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}