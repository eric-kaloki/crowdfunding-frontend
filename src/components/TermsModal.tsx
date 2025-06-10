import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { TermsContent } from "./TermsContent";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (accepted: boolean) => void;
}

export const TermsModal = ({ open, onOpenChange, onAccept }: TermsModalProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAcceptChange = (checked: boolean) => {
    setAccepted(checked);
    onAccept(checked);
    console.log("Terms accepted:", checked);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
        <h1 className="text-3xl font-bold mb-4">Terms and Conditions for Trancends Corp</h1>

        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4">
          <TermsContent />
        </ScrollArea>

        <div className="mt-6 px-4 pb-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={handleAcceptChange}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              By using Trancends Corp’s platform, you acknowledge that you have read, understood, and agreed to these Terms and Conditions, and Privacy Policy.
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};