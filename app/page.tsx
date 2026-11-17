import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { SignupForm } from "@/components/signup-form";
import { copy } from "@/lib/copy";

export default function HomePage() {
  return (
    <PageContainer>
      <h1 className="text-display font-semibold">{copy.home.title}</h1>
      <p className="mt-5 text-lg">{copy.home.intro}</p>
      <p className="mt-4">
        <Link href="/newsletter" className="font-medium underline">
          {copy.home.newsletterLink}
        </Link>
      </p>

      <section aria-labelledby="home-list" className="mt-16">
        <h2 id="home-list" className="text-xl font-semibold tracking-tight">
          {copy.home.listHeading}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {copy.home.listItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-signup" className="mt-16 rounded-control bg-surface p-5 sm:p-6">
        <h2 id="home-signup" className="mb-4 text-xl font-semibold tracking-tight">
          {copy.home.signupHeading}
        </h2>
        <SignupForm />
      </section>
    </PageContainer>
  );
}
