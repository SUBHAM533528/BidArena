// Cloudinary serves user-uploaded logos/photos at their original upload
// resolution by default — a full-size photo shown as a 40px thumbnail
// wastes a lot of bytes. Cloudinary supports on-the-fly transforms via
// the URL itself (no re-upload needed), so this just inserts
// "f_auto,q_auto,w_<width>" right after "/upload/" in any Cloudinary URL:
//   f_auto  → serves WebP/AVIF to browsers that support it, falls back otherwise
//   q_auto  → automatic quality/compression tuning
//   w_<n>   → resizes to the width actually needed on screen
// Non-Cloudinary URLs (e.g. a relative /logo.png) are returned unchanged.
export function cldOptimize(url, width = 200) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/f_auto")) return url; // already transformed
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
