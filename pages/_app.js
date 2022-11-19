import Link from "next/link";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-slate-900">
      <nav className="border-b p-6">
        <p className="text-4xl font-bold text-green-400">
          Metaverse Marketplace
        </p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 text-green-50">Home</a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-green-50">Sell Digital Asset</a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-green-50">My Digital Assets</a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-green-50">Creator Dashboard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />;
    </div>
  );
}

export default MyApp;
