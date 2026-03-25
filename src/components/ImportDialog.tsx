import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const FIELD_MAP: Record<string, string> = {
  "expediteur": "expediteur",
  "expéditeur": "expediteur",
  "emplacement": "emplacement",
  "quantite": "quantite",
  "quantité": "quantite",
  "receptionniste": "receptionniste",
  "réceptionniste": "receptionniste",
  "nombre_sacs": "nombre_sacs",
  "sacs": "nombre_sacs",
  "etat": "etat",
  "état": "etat",
};

const BATCH_SIZE = 500;

export default function ImportDialog({ open, onOpenChange }: Props) {
  const [preview, setPreview] = useState<any[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const reset = () => {
    setPreview([]);
    setAllRows([]);
    setHeaders([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
        if (json.length === 0) { toast.error("Fichier vide"); return; }

        const rawHeaders = Object.keys(json[0]);
        setHeaders(rawHeaders);
        setAllRows(json);
        setPreview(json.slice(0, 10));
      } catch {
        toast.error("Impossible de lire le fichier");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const mapRow = (row: Record<string, any>) => {
    const mapped: Record<string, any> = {};
    for (const [rawKey, value] of Object.entries(row)) {
      const normalizedKey = rawKey.toLowerCase().trim();
      const dbField = FIELD_MAP[normalizedKey];
      if (dbField) mapped[dbField] = value;
    }
    if (!mapped.expediteur || !mapped.emplacement || !mapped.quantite) return null;
    return {
      expediteur: String(mapped.expediteur),
      emplacement: String(mapped.emplacement),
      quantite: String(mapped.quantite),
      receptionniste: mapped.receptionniste ? String(mapped.receptionniste) : null,
      nombre_sacs: mapped.nombre_sacs ? Number(mapped.nombre_sacs) : 1,
      etat: mapped.etat ? String(mapped.etat) : "Disponible",
    };
  };

  const handleImport = async () => {
    const rows = allRows.map(mapRow).filter(Boolean);
    if (rows.length === 0) {
      toast.error("Aucune ligne valide trouvée. Colonnes requises : expediteur, emplacement, quantite");
      return;
    }

    setImporting(true);
    let inserted = 0;
    let errors = 0;

    try {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("retours_colis").insert(batch as any[]);
        if (error) {
          errors += batch.length;
          console.error("Batch error:", error);
        } else {
          inserted += batch.length;
        }
      }

      if (inserted > 0) {
        toast.success(`${inserted} retour(s) importé(s) avec succès`);
        qc.invalidateQueries({ queryKey: ["retours"] });
      }
      if (errors > 0) toast.error(`${errors} ligne(s) en erreur`);

      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erreur d'importation: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Importer depuis un fichier Excel</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
            />
          </div>

          {fileName && (
            <p className="text-sm text-muted-foreground">
              Fichier : <span className="font-medium text-foreground">{fileName}</span> · {allRows.length} ligne(s) détectée(s)
            </p>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Colonnes reconnues :</p>
            <p>expediteur (requis), emplacement (requis), quantite (requis), receptionniste, nombre_sacs, etat</p>
          </div>

          {preview.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <ScrollArea className="h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      {headers.map((h) => <TableHead key={h} className="text-xs">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {headers.map((h) => <TableCell key={h} className="text-xs">{String(row[h] ?? "")}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {allRows.length > 10 && (
                <p className="text-xs text-muted-foreground p-2 text-center border-t">
                  Aperçu des 10 premières lignes sur {allRows.length}
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Annuler</Button>
          <Button onClick={handleImport} disabled={allRows.length === 0 || importing}>
            <Upload className="h-4 w-4" />
            {importing ? "Importation..." : `Importer ${allRows.length} ligne(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
