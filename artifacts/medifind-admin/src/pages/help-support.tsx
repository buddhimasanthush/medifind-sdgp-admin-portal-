import { useState } from "react";
import { HelpCircle, MessageCircle, Mail, Phone, BookOpen, ChevronDown, ChevronUp, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpSupportPage() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const faqs = [
    {
      q: "How do I upload a prescription?",
      a: "As an administrator, you view prescriptions uploaded by users. Users tap 'Upload Prescription' from their home screen, take a photo or upload from gallery, and an OTP from their doctor is required to finalize the process."
    },
    {
      q: "How does order tracking work?",
      a: "After a user pays, they see a 'Track Order' option. The platform provides a live map with the courier's location updating in real-time until delivery is complete."
    },
    {
      q: "Can I manage pharmacy approvals?",
      a: "Yes. Navigate to the Pharmacies page to see pending registrations. You can review their credentials and approve or reject them manually."
    },
    {
      q: "How is the 3% MediFind fee calculated?",
      a: "The system automatically adds 3% to the total order value during checkout. This fee covers platform operational costs and bank processing."
    },
    {
      q: "Is patient data secure?",
      a: "Absolutely. All prescription data and personal records are encrypted at rest and in transit. We strictly adhere to privacy standards for medical records."
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    toast({
      title: "Message Sent",
      description: "Our support team will get back to you within 24 hours.",
    });
    setMessage("");
  };

  const showSnack = (msg: string) => {
    toast({
      description: msg,
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary" />
          Help & Support
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Get assistance with using the Medifind Admin portal and find answers to common questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Contact Cards */}
        <div className="lg:col-span-1 space-y-4">
          <ContactCard 
            icon={<MessageCircle className="w-5 h-5" />} 
            title="Live Chat" 
            sub="Chat with experts" 
            color="bg-blue-500" 
            onClick={() => showSnack("Opening live support...")}
          />
          <ContactCard 
            icon={<Mail className="w-5 h-5" />} 
            title="Email Support" 
            sub="support@medifind.com" 
            color="bg-purple-500" 
            onClick={() => showSnack("Opening email client...")}
          />
          <ContactCard 
            icon={<Phone className="w-5 h-5" />} 
            title="Phone Support" 
            sub="+94 11 234 5678" 
            color="bg-emerald-500" 
            onClick={() => showSnack("Calling support line...")}
          />
          <ContactCard 
            icon={<BookOpen className="w-5 h-5" />} 
            title="Internal Guide" 
            sub="Browser documentation" 
            color="bg-amber-500" 
            onClick={() => showSnack("Opening documentation...")}
          />
        </div>

        {/* FAQ and Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ Section */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-border/40">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Send us a Message
              </CardTitle>
              <CardDescription>Need more help? Our team is always online to support your queries.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Describe your issue or question in detail..." 
                    className="min-h-[120px] bg-muted/5 border-border/60 focus:border-primary/50 text-sm p-4 rounded-xl resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-full font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
                  disabled={!message.trim()}
                >
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, sub, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-5 flex items-center gap-4 bg-background border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left group"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${color} shadow-lg shadow-black/5 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-black text-foreground mb-1 leading-none uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground truncate opacity-80">{sub}</p>
      </div>
    </button>
  );
}
