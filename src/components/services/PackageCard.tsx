"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const PackageCard = ({ pkg }: any) => {
  console.log({ pkg });
  return (
    <div className="packageCardContainer flex items-center w-full p-2.5 cursor-pointer justify-between">
      <div className="info flex items-center gap-2.5">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="titleContainer flex-2 py-[5px]">
          <div
            className="title text-[15px] font-bold text-[rgba(37,37,37,0.89)] line-clamp-2 overflow-hidden text-ellipsis leading-snug max-h-[2.4em]"
            title={pkg.name}
          >
            {pkg.name}
          </div>
        </div>
      </div>

      <div className="pricing  items-end gap-1">
        {pkg.promoPrice ? (
          <>
            <span className="promoPrice font-bold">{pkg.promoPrice} $</span>
            <span className="price text-red-500 italic line-through text-[14px]">{`${pkg.price} $`}</span>
          </>
        ) : (
          <span className="promoPrice font-bold">{pkg.price} $</span>
        )}
      </div>
    </div>
  );
};

export default PackageCard;
