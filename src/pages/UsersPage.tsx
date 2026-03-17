import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: { action: "list" },
      });
      if (error) throw error;
      return data?.users || [];
    },
    enabled: isAdmin,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const action = editingUser ? "update" : "create";
      const body: any = { action, email, role };
      if (password) body.password = password;
      if (editingUser) body.userId = editingUser.id;

      const { error } = await supabase.functions.invoke("admin-create-user", { body });
      if (error) throw error;
      toast.success(editingUser ? "Utilisateur modifié" : "Utilisateur créé");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      const { error } = await supabase.functions.invoke("admin-create-user", {
        body: { action: "delete", userId },
      });
      if (error) throw error;
      toast.success("Utilisateur supprimé");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRole("user");
    setEditingUser(null);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setEmail(user.email || "");
    setPassword("");
    setRole(user.role || "user");
    setShowForm(true);
  };

  if (!isAdmin) {
    return <p className="text-muted-foreground text-center py-8">Accès réservé aux administrateurs.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-green-500" /> Utilisateurs
        </h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 text-primary-foreground" /> Nouveau
        </Button>
      </div>

      {isLoading ? <p>Chargement...</p> : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow
                    key={u.id}
                    className={`cursor-pointer transition-colors ${selectedRowId === u.id ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-muted/50"}`}
                    onClick={() => setSelectedRowId(selectedRowId === u.id ? null : u.id)}
                  >
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                        {u.role || "user"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(u); }}>
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe {editingUser && "(laisser vide pour ne pas changer)"}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUser} />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">{editingUser ? "Modifier" : "Créer"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
