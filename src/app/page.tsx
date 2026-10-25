import Link from "next/link";

// Temporary home page. The real storefront arrives in Stage 2.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm tracking-[0.3em] text-saffron uppercase">Coming soon</p>
      <h1 className="mt-4 text-5xl text-juniper sm:text-6xl">Zarghoon Cosmetics</h1>
      <p className="mt-4 max-w-md text-stone-600">
        Thoughtfully chosen skincare and beauty, shipped worldwide.
      </p>
      <Link href="/admin" className="btn-primary mt-8">
        Go to admin
      </Link>
    </main>
  );
}
