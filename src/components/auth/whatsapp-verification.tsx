import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface WhatsAppVerificationProps {
  phone: string;
  onVerified: () => void;
  onSkip?: () => void;
}

export const WhatsAppVerification = ({ phone, onVerified, onSkip }: WhatsAppVerificationProps) => {
  const [step, setStep] = useState<"send" | "verify">("send");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour vérifier votre numéro",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        "https://zdvemexeuorsbcermvqr.supabase.co/functions/v1/send-whatsapp-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ phone }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }

      if (result.method === "click_to_send" && result.whatsappUrl) {
        setWhatsappUrl(result.whatsappUrl);
        setExpiresAt(result.expiresAt);
        // Open WhatsApp in new tab
        window.open(result.whatsappUrl, "_blank");
        toast({
          title: "Code généré",
          description: "Envoyez le message WhatsApp qui s'est ouvert, puis entrez le code reçu",
        });
      } else {
        toast({
          title: "Code envoyé",
          description: "Vérifiez votre WhatsApp pour le code de vérification",
        });
      }
      
      setStep("verify");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Le code doit contenir 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erreur",
          description: "Session expirée, veuillez vous reconnecter",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        "https://zdvemexeuorsbcermvqr.supabase.co/functions/v1/verify-whatsapp-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur de vérification");
      }

      if (result.verified) {
        toast({
          title: "Vérifié!",
          description: "Votre numéro WhatsApp a été vérifié avec succès",
        });
        onVerified();
      } else {
        toast({
          title: "Code incorrect",
          description: result.message || "Veuillez réessayer",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de vérifier le code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Vérification WhatsApp</CardTitle>
        <CardDescription>
          {step === "send" 
            ? "Nous allons vous envoyer un code de vérification par WhatsApp"
            : "Entrez le code à 6 chiffres reçu sur WhatsApp"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "send" ? (
          <>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Numéro à vérifier</p>
              <p className="font-medium">{phone}</p>
            </div>
            <Button 
              onClick={handleSendCode} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 mr-2" />
              )}
              Envoyer le code par WhatsApp
            </Button>
          </>
        ) : (
          <>
            {whatsappUrl && (
              <div className="p-3 bg-accent border border-border rounded-lg text-center space-y-2">
                <p className="text-sm text-foreground">
                  Cliquez sur le lien ci-dessous pour envoyer le code via WhatsApp
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(whatsappUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ouvrir WhatsApp
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {expiresAt && (
              <p className="text-xs text-muted-foreground text-center">
                Code valide jusqu'à {new Date(expiresAt).toLocaleTimeString("fr-FR")}
              </p>
            )}

            <Button 
              onClick={handleVerifyCode} 
              disabled={isLoading || code.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Vérifier le code
            </Button>

            <Button 
              variant="ghost" 
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full"
            >
              Renvoyer le code
            </Button>
          </>
        )}

        {onSkip && (
          <Button 
            variant="link" 
            onClick={onSkip}
            className="w-full text-muted-foreground"
          >
            Passer cette étape
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
