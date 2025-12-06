import { Helmet } from 'react-helmet-async';

export function SEOHead({ title, description }) {
    const siteTitle = "Vireo Player";
    const tagline = "Cinematic Local Video Player";
    const documentTitle = title || siteTitle;
    const metaDescription = description || tagline;
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet key={documentTitle}>
            <title>{documentTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content="video player, local player, react player, cinematic, web player, mp4, webm, subtitles" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />

            {/* Theme */}
            <meta name="theme-color" content="#09090b" />
        </Helmet>
    );
}
