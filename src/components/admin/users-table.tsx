import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, AlertCircle } from "lucide-react";
import { useBanUser, useToggleUserActive } from "@/hooks/use-admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UsersTableProps {
  users: any[];
  isLoading: boolean;
}

export const UsersTable = ({ users, isLoading }: UsersTableProps) => {
  const [search, setSearch] = useState("");
  const [userToBan, setUserToBan] = useState<any>(null);
  const banUser = useBanUser();
  const toggleUserActive = useToggleUserActive();

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.university?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBanUser = () => {
    if (userToBan) {
      banUser.mutate({
        userId: userToBan.user_id,
        reason: "Violation des règles de la plateforme",
        unban: !!userToBan.banned_at
      });
      setUserToBan(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Université</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || 'Sans nom'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.university || '-'}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      {user.banned_at && (
                        <Badge variant="destructive" className="text-xs">
                          Banni
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.admin_role ? (
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Utilisateur</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toggleUserActive.mutate({
                            userId: user.user_id,
                            isActive: !user.is_active,
                          })
                        }
                        disabled={toggleUserActive.isPending}
                      >
                        {user.is_active ? (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={user.banned_at ? "default" : "destructive"}
                        onClick={() => setUserToBan(user)}
                        disabled={banUser.isPending}
                      >
                        {user.banned_at ? "Débannir" : "Bannir"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmation de ban */}
      <AlertDialog open={!!userToBan} onOpenChange={() => setUserToBan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToBan?.banned_at ? "Débannir" : "Bannir"} l'utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToBan?.banned_at ? (
                <>
                  Êtes-vous sûr de vouloir débannir{" "}
                  <strong>{userToBan?.full_name}</strong> ?
                  <br />
                  L'utilisateur pourra à nouveau accéder à la plateforme.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir bannir{" "}
                  <strong>{userToBan?.full_name}</strong> ?
                  <br />
                  L'utilisateur ne pourra plus accéder à la plateforme.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
