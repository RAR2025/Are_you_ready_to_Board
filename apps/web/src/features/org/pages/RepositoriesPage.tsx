import OrgSectionPage from '../components/OrgSectionPage'

export default function RepositoriesPage() {
  return (
    <OrgSectionPage
      eyebrow="Repositories"
      title="Manage the company repositories"
      description="Use this dedicated workspace to catalog source repositories, ownership, and access patterns. The first implementation keeps the page lightweight while the routing and shell are in place."
      statusLabel="Tracked repositories"
      statusValue="12 active"
      backLabel="Back to dashboard"
      backTo="/org"
    />
  )
}