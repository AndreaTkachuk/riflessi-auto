export default async function Home() {
  const res = await fetch(`${process.env.API_URL}/api`, { cache: "no-store" });
  const text = await res.text();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold bg-blue-500 text-white p-4">
        Riflessi d&apos;Auto
      </h1>
      <p className="mt-4">Risposta dal backend: {text}</p>
    </main>
  );
}
