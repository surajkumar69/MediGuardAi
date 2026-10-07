import { ExtractedMedicine } from "@/lib/ocr/extractor";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, Check, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MedicineReviewCardProps {
  medicine: ExtractedMedicine;
  onUpdate: (oldName: string, newName: string) => void;
  onRemove: (name: string) => void;
}

export function MedicineReviewCard({ medicine, onUpdate, onRemove }: MedicineReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(medicine.name);
  
  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate(medicine.name, editValue.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors", medicine.needsVerification ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-200")}>
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)} 
              className="h-9 px-3 border rounded-md text-sm w-full max-w-[200px]"
              autoFocus
            />
            <Button size="sm" onClick={handleSave} className="h-9">Save</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-slate-800 capitalize">{medicine.name}</span>
            {medicine.needsVerification && (
              <Badge variant="warning" className="text-[10px] uppercase tracking-wider py-0 px-2 h-5">
                <AlertTriangle className="h-3 w-3 mr-1" /> Needs Verification
              </Badge>
            )}
          </div>
        )}
          <div className="text-xs text-slate-500 mt-2 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span>OCR Match: <span className="italic">&quot;{medicine.originalText}&quot;</span></span>
              <div className="flex items-center gap-2">
                <span className={cn("font-medium", medicine.confidence < 80 ? "text-amber-600" : "text-emerald-600")}>
                  OCR Confidence: {medicine.confidence}%
                </span>
                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", medicine.confidence < 80 ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${medicine.confidence}%` }}
                  />
                </div>
              </div>
            </div>
            {!medicine.needsVerification && !isEditing && (
              <span className="inline-flex items-center text-emerald-600 font-medium text-[11px] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                <Check className="h-3 w-3 mr-1" /> Verified
              </span>
            )}
          </div>
        </div>
      <div className="flex items-center gap-2">
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8">
            <Edit2 className="h-4 w-4 mr-1" /> Edit
          </Button>
        )}
        {medicine.needsVerification && !isEditing && (
          <Button size="sm" onClick={() => onUpdate(medicine.name, medicine.name)} className="h-8 bg-emerald-600 hover:bg-emerald-700">
            <Check className="h-4 w-4 mr-1" /> Confirm
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onRemove(medicine.name)} className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
