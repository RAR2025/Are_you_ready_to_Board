import OrgSectionPage from '../components/OrgSectionPage'

export default function DocumentsPage() {
  return (
    <OrgSectionPage
      eyebrow="Documents"
      title="Upload and organize company documents"
      description="Store onboarding PDFs, architecture notes, process guides, and reference material in one dedicated area. The route is ready for upload flows and future indexing."
      statusLabel="Knowledge documents"
      statusValue="24 available"
      backLabel="Back to dashboard"
      backTo="/org"
    />
  )
}