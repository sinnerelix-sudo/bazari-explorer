export default function BrandMark({ className = "w-8 h-8 rounded-xl" }) {
  return (
    <div className={`${className} overflow-hidden shrink-0`}>
      <img src="/bazari-logo.jpg" alt="Bazari logo" className="h-full w-full object-cover" />
    </div>
  );
}
