import { LegalPage } from "@/components/site/LegalPage";
import { site } from "@/config/site";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>What we collect</h2>
      <p>Your phone number and event date at checkout; the details, photos and music you add to your invitation; and the names and messages your guests submit through RSVP and wishes.</p>
      <h2>Payments</h2>
      <p>Card and bank details are entered on ABA PayWay&apos;s secure page. {site.name} never sees or stores them; we only receive the payment status and a transaction reference.</p>
      <h2>How we use it</h2>
      <p>To create and host your invitation, to let you sign in, and to contact you about your order. Invitation pages are not indexed by search engines, but anyone with the link can view them.</p>
      <h2>Deletion</h2>
      <p>
        Ask us on Telegram {site.telegramHandle} or at {site.supportEmail} to delete your invitation and its data.
      </p>
    </LegalPage>
  );
}
