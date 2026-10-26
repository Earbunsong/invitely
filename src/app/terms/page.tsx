import { LegalPage } from "@/components/site/LegalPage";
import { site } from "@/config/site";

export const metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>By purchasing an e-invitation from {site.name} you agree to these terms.</p>
      <h2>Purchases</h2>
      <p>Each plan covers one invitation for one event. Payments are processed by ABA Bank PayWay. Because invitations are delivered digitally and immediately, all sales are final and non-refundable once payment is confirmed.</p>
      <h2>Your content</h2>
      <p>You are responsible for the names, photos, music and text you upload, and confirm you have the right to use them. Do not upload content that is unlawful or infringes others&apos; rights. We may remove content that violates these terms.</p>
      <h2>Availability</h2>
      <p>Invitation links stay online until at least 6 months after the event date. We aim for continuous availability but cannot guarantee uninterrupted service.</p>
      <h2>Contact</h2>
      <p>
        Questions? Message us on Telegram {site.telegramHandle} or email {site.supportEmail}.
      </p>
    </LegalPage>
  );
}
