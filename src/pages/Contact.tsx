import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const handleUniversityChange = () => {};
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual form submission
    toast.success("Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={handleUniversityChange} />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <MessageCircle className="w-3 h-3 mr-1" />
            Nous contacter
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Une question ?{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Contactez-nous
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question,
            suggestion ou réclamation.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email */}
            <Card className="shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Envoyez-nous un email
                    </p>
                    <a
                      href="mailto:contact@sencampuslink.com"
                      className="text-sm text-primary hover:underline"
                    >
                      contact@sencampuslink.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Téléphone</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Appelez-nous directement
                    </p>
                    <a
                      href="tel:+221771234567"
                      className="text-sm text-primary hover:underline"
                    >
                      +221 77 123 45 67
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Adresse</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Visitez notre bureau
                    </p>
                    <p className="text-sm text-primary">
                      Dakar, Sénégal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Horaires</h3>
                    <p className="text-sm text-muted-foreground">
                      Lundi - Vendredi: 8h - 18h
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Samedi: 9h - 14h
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Suivez-nous</h3>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Sujet de votre message"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Écrivez votre message ici..."
                      rows={8}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-primary"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <Card className="shadow-card">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Questions fréquentes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Livraison</h3>
                <p className="text-sm text-muted-foreground">
                  Livraison gratuite sur le campus pour toute commande supérieure à 50 000 CFA
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Paiement</h3>
                <p className="text-sm text-muted-foreground">
                  Paiements sécurisés via mobile money, carte bancaire ou à la livraison
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Support</h3>
                <p className="text-sm text-muted-foreground">
                  Notre équipe répond sous 24h à toutes vos questions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
