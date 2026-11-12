
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function CategoryCard({
  category,
}) {
  const { name, image, itemCount, href = "/products" } = category;

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-card border border-outline bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-panel"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-50">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            {name}
          </h3>

          {typeof itemCount === "number" && (
            <p className="mt-1 text-sm text-slate-500">
              {itemCount} Products
            </p>
          )}
        </div>

        <ArrowUpRight
          size={20}
          className="shrink-0 text-slate-400 transition-colors group-hover:text-brand"
        />
      </div>
    </Link>
  );
}

export default CategoryCard;
