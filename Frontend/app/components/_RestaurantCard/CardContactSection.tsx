
import { p } from "framer-motion/client";
import { IoCallOutline, IoEarthOutline, IoLocationOutline } from "react-icons/io5";


const CardContactSection = ({ phone, website, tags = [], address }: { phone?: string; website?: string; tags?: string[]; address?: string }) => {
  return (
    <>
      {
        (phone || website || tags.length > 0 || address) && (
          <div className="rounded-xl bg-secondary/5 p-3 flex flex-col gap-2 border border-secondary/30">
            {phone && (
              <div className="flex items-center gap-2 text-sm text-dark/85">
                <IoCallOutline className="text-secondary" />
                <span>{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2 text-sm text-dark/85">
                <IoEarthOutline className="text-secondary" />
                <a href={website} target="_blank" rel="noreferrer" className="underline decoration-secondary/60 underline-offset-2">
                  {website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2 text-sm text-dark/85">
                <IoLocationOutline className="text-secondary" />
                <span>{address}</span>
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-secondary font-semibold rounded-full bg-white px-2 py-1 border border-dark/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
    </>
  );
}

export default CardContactSection;