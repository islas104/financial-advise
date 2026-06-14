import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Questionnaire } from "@/components/Questionnaire";

export default function StartPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 md:py-20">
        <Link href="/" className="text-sm text-muted underline-offset-4 hover:underline">
          &larr; Home
        </Link>
        <div className="mt-6">
          <Questionnaire />
        </div>
        <p className="mt-8 text-center text-xs text-muted">
          This takes about 30 seconds. No sign-up, no data stored.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
