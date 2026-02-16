import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
        <main className="flex-1">
          {/* Hero Section  */}
          <section>
            <div>
              <h1 className="text-black">
                A better way to track your job hunt
              </h1>
              <p className="text-muted-foreground">
                capture, organize, and analyze your job applications in one place.
              </p>
            </div>
          </section>
        </main>
    </div>
  );
}
