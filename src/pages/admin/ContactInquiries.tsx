import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Trash2,
  Eye,
  Send,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminContactInquiries = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error fetching messages",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (message: ContactMessage) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", message.id);

      if (error) throw error;

      toast({
        title: "Message marked as read",
      });

      fetchMessages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error updating message",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedMessage) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "resolved" })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      toast({
        title: "Message marked as resolved",
      });

      fetchMessages();
      setDetailsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error updating message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setProcessing(true);

    try {
      // Call the edge function to send reply email via Resend
      const { error: emailError } = await supabase.functions.invoke(
        "send-contact-reply",
        {
          body: {
            to: selectedMessage.email,
            subject: `Re: ${selectedMessage.subject}`,
            message: replyText,
            originalMessage: selectedMessage.message,
          },
        }
      );

      if (emailError) {
        throw new Error("Failed to send email");
      }

      // Update status to resolved
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "resolved" })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      toast({
        title: "Reply sent successfully",
        description: `Email sent to ${selectedMessage.email}`,
      });

      setReplyText("");
      setReplyOpen(false);
      fetchMessages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error sending reply",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageToDelete);

      if (error) throw error;

      toast({
        title: "Message deleted",
      });

      fetchMessages();
      setDetailsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error deleting message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "read":
        return <Badge className="bg-yellow-500">Read</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const newMessages = messages.filter((m) => m.status === "new");
  const readMessages = messages.filter((m) => m.status === "read");
  const resolvedMessages = messages.filter((m) => m.status === "resolved");

  const MessageTable = ({ data }: { data: ContactMessage[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No messages found
            </TableCell>
          </TableRow>
        ) : (
          data.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">{message.name}</TableCell>
              <TableCell>
                <a
                  href={`mailto:${message.email}`}
                  className="text-primary hover:underline"
                >
                  {message.email}
                </a>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {message.subject}
              </TableCell>
              <TableCell>
                {format(new Date(message.created_at), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>{getStatusBadge(message.status)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedMessage(message);
                      setDetailsOpen(true);
                      if (message.status === "new") {
                        handleMarkAsRead(message);
                      }
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Inquiries</h1>
          <p className="text-muted-foreground">
            Manage and respond to contact form submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <MessageSquare className="h-4 w-4 mr-1" />
            {messages.length} Total
          </Badge>
          {newMessages.length > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {newMessages.length} New
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
          <CardDescription>
            View and manage contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">New ({newMessages.length})</TabsTrigger>
              <TabsTrigger value="read">Read ({readMessages.length})</TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({resolvedMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-4">
              <MessageTable data={newMessages} />
            </TabsContent>

            <TabsContent value="read" className="mt-4">
              <MessageTable data={readMessages} />
            </TabsContent>

            <TabsContent value="resolved" className="mt-4">
              <MessageTable data={resolvedMessages} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              View and respond to the contact inquiry
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">From</Label>
                  <p className="font-medium">{selectedMessage.name}</p>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <Label className="text-muted-foreground">Received</Label>
                  <p className="font-medium">
                    {format(
                      new Date(selectedMessage.created_at),
                      "MMMM dd, yyyy 'at' HH:mm"
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-semibold text-lg">
                    {selectedMessage.subject}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Message</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                </div>
              </div>

              {selectedMessage.status !== "resolved" && (
                <div className="border-t pt-4 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setReplyOpen(true);
                      setDetailsOpen(false);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleMarkAsResolved}
                    disabled={processing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              Send an email response to {selectedMessage?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-muted-foreground text-xs">
                  Original Message
                </Label>
                <p className="text-sm mt-1">{selectedMessage.message}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setReplyOpen(false);
                    setDetailsOpen(true);
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSendReply}
                  disabled={processing || !replyText.trim()}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContactInquiries;
