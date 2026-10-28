import { Page, PagePlaceholder } from '../../components'

/**
 * Offer Details screen.
 * Owner: Estifanos · Issues: #16
 * Wireframe: ux-design/prototype/offer-details.png · Pop-ups: offer-saved.png
 *
 * Get the id with useParams(), save with api.saveOffer(id, offer). Use OFFER_DECISIONS for Pending/Accepted/Declined.
 */
export default function OfferDetails() {
  return (
    <Page title="Offer Details" back>
      <PagePlaceholder owner="Estifanos" issues={[16]} wireframe="offer-details.png" />
    </Page>
  )
}
