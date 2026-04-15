import OrgSectionPage from '../components/OrgSectionPage'

export default function HRManagersPage() {
  return (
    <OrgSectionPage
      eyebrow="HR Managers"
      title="Manage HR access and ownership"
      description="Use this page to review which HR managers can monitor onboarding, review statuses, and coordinate completion. It is intentionally minimal until data management is added."
      statusLabel="Assigned HR managers"
      statusValue="4 active"
      backLabel="Back to dashboard"
      backTo="/org"
    />
  )
}