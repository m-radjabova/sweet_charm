import error500 from "../../assets/errors/500.png";
import ErrorPageShell from "./ErrorPageShell";

function ServerErrorPage() {
  return (
    <ErrorPageShell
      code="500"
      eyebrow="Kitchen Alert"
      badge="We are fixing it"
      title="Oops! Something went wrong"
      description="Our kitchen ran into a little accident, and the page could not be served the way it should."
      detail="Please try again in a moment. If the issue keeps happening, refreshing the page or heading back home should help while we finish the fix."
      footerNote="Great things take time, even when the oven gets a little dramatic."
      imageSrc={error500}
      imageAlt="Sweet Charm 500 illustration"
      accent="peach"
      actions={[
        { label: "Back to Home", to: "/", variant: "primary" },
        { label: "Try Again", onClick: () => window.location.reload(), variant: "secondary" },
      ]}
    />
  );
}

export default ServerErrorPage;
