import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { useApp } from "@/contexts/AppContext";
import { uid } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Pizzaverse" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser, logout } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [pwd, setPwd] = useState({ old: "", new: "", confirm: "" });
  const [addr, setAddr] = useState({ label: "", line1: "", city: "", zip: "" });

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Login required"
          action={
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          }
        />
      </div>
    );
  }

  function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatar: reader.result as string });
      toast.success("Avatar updated");
    };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    updateUser({ name, phone });
    toast.success("Profile updated");
  }
  function changePwd() {
    if (pwd.old !== user?.password) return toast.error("Current password incorrect");
    if (pwd.new.length < 6) return toast.error("Password too short");
    if (pwd.new !== pwd.confirm) return toast.error("Passwords don't match");
    updateUser({ password: pwd.new });
    setPwd({ old: "", new: "", confirm: "" });
    toast.success("Password changed");
  }
  function addAddress() {
    if (!addr.label || !addr.line1) return toast.error("Fill in address");
    updateUser({ addresses: [...(user!.addresses ?? []), { id: uid("a"), ...addr }] });
    setAddr({ label: "", line1: "", city: "", zip: "" });
    toast.success("Address added");
  }
  function delAddress(id: string) {
    updateUser({ addresses: user!.addresses?.filter((a) => a.id !== id) });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-4xl text-white shadow-xl">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <label className="absolute bottom-0 right-0 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white shadow-lg text-orange-500 hover:bg-muted">
            <Upload className="h-4 w-4" />
            <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </label>
        </div>
        <div>
          <h1 className="text-3xl font-black">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="outline"
          className="ml-auto"
          onClick={async () => {
            await logout();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="address">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>
            </div>
            <Button
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500"
              onClick={saveProfile}
            >
              Save changes
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Current</Label>
                <Input
                  type="password"
                  value={pwd.old}
                  onChange={(e) => setPwd((p) => ({ ...p, old: e.target.value }))}
                />
              </div>
              <div>
                <Label>New</Label>
                <Input
                  type="password"
                  value={pwd.new}
                  onChange={(e) => setPwd((p) => ({ ...p, new: e.target.value }))}
                />
              </div>
              <div>
                <Label>Confirm</Label>
                <Input
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
            </div>
            <Button
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500"
              onClick={changePwd}
            >
              Change password
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
            <div className="space-y-3">
              {(user.addresses ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No saved addresses.</p>
              )}
              {(user.addresses ?? []).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-muted/40 p-3"
                >
                  <div>
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {a.line1}, {a.city} {a.zip}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => delAddress(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <Input
                placeholder="Label (Home)"
                value={addr.label}
                onChange={(e) => setAddr((a) => ({ ...a, label: e.target.value }))}
              />
              <Input
                placeholder="Street"
                value={addr.line1}
                onChange={(e) => setAddr((a) => ({ ...a, line1: e.target.value }))}
              />
              <Input
                placeholder="City"
                value={addr.city}
                onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
              />
              <Input
                placeholder="ZIP"
                value={addr.zip}
                onChange={(e) => setAddr((a) => ({ ...a, zip: e.target.value }))}
              />
            </div>
            <Button
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500"
              onClick={addAddress}
            >
              <Plus className="mr-1 h-4 w-4" /> Add address
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
