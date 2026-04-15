import OrgSectionPage from '../components/OrgSectionPage'

export default function TechStackPage() {
  return (
    <OrgSectionPage
      eyebrow="Tech Stack"
      title="Manage approved technologies"
      description="Keep a clean inventory of languages, frameworks, deployment tools, and internal standards. This page is reserved for future editing and governance controls."
      statusLabel="Approved stack items"
      statusValue="8 tracked"
      backLabel="Back to dashboard"
      backTo="/org"
    />
  )
}