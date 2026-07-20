import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, theme, toggleTheme, updateUser } = useApp();
  const [s, setS] = useState(storage.getSettings());
  const [name, setName] = useState(user?.name ?? "");

  function saveSettings() {
    storage.setSettings(s);
    toast.success("Settings saved");
  }
  function saveProfile() {
    updateUser({ name });
    toast.success("Profile updated");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-muted-foreground">Manage your admin preferences</p>
      </div>
      <Tabs defaultValue="app">
        <TabsList>
          <TabsTrigger value="app">App</TabsTrigger>
          <TabsTrigger value="notif">Notifications</TabsTrigger>
          <TabsTrigger value="inv">Inventory</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="app">
          <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Theme</div>
                <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notif">
          <Card className="border-border/40 bg-card/60 p-6 backdrop-blur space-y-4">
            <Row label="Email notifications" desc="Receive updates over email">
              <Switch
                checked={s.emailNotif}
                onCheckedChange={(v) => setS((st) => ({ ...st, emailNotif: v }))}
              />
            </Row>
            <Row label="Push notifications" desc="Push alerts in browser">
              <Switch
                checked={s.pushNotif}
                onCheckedChange={(v) => setS((st) => ({ ...st, pushNotif: v }))}
              />
            </Row>
            <Button onClick={saveSettings} className="bg-gradient-to-r from-orange-500 to-red-500">
              Save
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="inv">
          <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
            <div>
              <Label>Low-stock threshold (units)</Label>
              <Input
                type="number"
                value={s.threshold}
                onChange={(e) => setS((st) => ({ ...st, threshold: +e.target.value }))}
                className="mt-1 max-w-xs"
              />
            </div>
            <Button
              onClick={saveSettings}
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500"
            >
              Save
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
            </div>
            <Button
              onClick={saveProfile}
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500"
            >
              Save
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({
  label,
  desc,
  children,
}: {
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-semibold">{label}</div>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}
