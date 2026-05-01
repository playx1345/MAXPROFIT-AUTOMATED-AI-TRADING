import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";

interface Props {
  open: boolean;
  onDismiss: () => void;
}

export const SessionTimeoutWarning = ({ open, onDismiss }: Props) => (
  <AlertDialog open={open}>
    <AlertDialogContent className="border-destructive/50">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
          <Clock className="h-5 w-5" />
          Session Timeout Warning
        </AlertDialogTitle>
        <AlertDialogDescription>
          You will be logged out soon due to inactivity. Move your mouse or press any key to stay logged in.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={onDismiss}>I'm still here</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
