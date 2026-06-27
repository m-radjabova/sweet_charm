import error404 from "../../assets/errors/404.png";
import Seo from "../../components/Seo";
import ErrorPageShell from "../errors/ErrorPageShell";

function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found | SweetCharm"
        description="This SweetCharm page could not be found."
        path="/404"
        noindex
      />
      <ErrorPageShell
        code="404"
        eyebrow="Page Lost"
        badge="Freshly missing"
        title="Oops! This page is missing"
        description="Looks like this sweet treat got lost on the way out of the oven and never made it to your screen."
        detail="The page may have been moved, renamed, or simply does not exist anymore. Let us guide you back to something a little more delicious."
        footerNote="Sweet things are always worth finding again."
        imageSrc={error404}
        imageAlt="Sweet Charm 404 illustration"
        accent="rose"
        actions={[
          { label: "Back to Home", to: "/", variant: "primary" },
          { label: "Browse Desserts", to: "/desserts", variant: "secondary" },
        ]}
      />
    </>
  );
}

export default NotFound;
