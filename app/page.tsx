import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Withdraw</h1>
      <p>
        <Link href="/withdraw">Перейти к выводу средств</Link>
      </p>
    </main>
  );
}
