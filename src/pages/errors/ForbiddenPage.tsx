import { useNavigate } from "react-router-dom";
import error403 from "../../assets/errors/403.png";
import ErrorPageShell from "./ErrorPageShell";

function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <ErrorPageShell
      code="403"
      eyebrow="Access Control"
      badge="Members only"
      title="Access Denied"
      description="This sweet corner is protected, and your current account does not have permission to open it."
      detail="If you expected to see this page, try signing in with the right account or contact support so we can help you get back on track."
      footerNote="Some treats need a special key before the door opens."
      imageSrc={error403}
      imageAlt="Sweet Charm 403 illustration"
      accent="pink"
      actions={[
        { label: "Go Back", onClick: () => navigate(-1), variant: "primary" },
        { label: "Contact Support", to: "mailto:support@sweetcharm.com", variant: "secondary" },
      ]}
    />
  );
}

export default ForbiddenPage;
