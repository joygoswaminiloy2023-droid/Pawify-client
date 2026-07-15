import { Suspense } from "react";
import ShopContent from "./ShopContent";
import PawLoader from "../components/PawLoader";
import Navbar from "../components/Navbar";

function ShopFallback() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <PawLoader />
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent />
    </Suspense>
  );
}