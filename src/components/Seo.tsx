import { Helmet } from "react-helmet-async";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_URL,
  type SeoSchema,
} from "./seoConfig";

function toAbsoluteUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  structuredData,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  structuredData?: SeoSchema | SeoSchema[];
}) {
  const canonical = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image);
  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default Seo;
