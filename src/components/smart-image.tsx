import Image, { type ImageProps } from "next/image";

/**
 * next/image that also accepts SVGs and images from any website.
 * Local photos are resized and compressed automatically; SVGs and outside
 * links are shown as they are.
 */
export function SmartImage(props: ImageProps & { src: string }) {
  const unoptimized = props.src.endsWith(".svg") || /^https?:\/\//.test(props.src);
  return <Image {...props} alt={props.alt} unoptimized={unoptimized} />;
}
