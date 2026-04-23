import { IoPricetagsOutline, IoTimeOutline } from "react-icons/io5";


const CardMetaGrid = ({ description, todayHours, lunchTime, priceLevel, }: { description?: string; todayHours?: string; lunchTime?: string; priceLevel?: string }) => {

  // CardMetaGrid component is responsible for displaying additional information about a restaurant, such as its description, today's opening hours, lunch time, and price level. It organizes this information in a grid layout, making it easy for users to quickly access important details about the restaurant. The component also includes icons to visually represent the type of information being displayed, enhancing the overall user experience.
  return (
    <>
      {description && (
        <div className="bg-neutral rounded-xl p-3">
          <span className="text-sm leading-relaxed text-dark/90">{description}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {todayHours && (
          <div className="rounded-xl border border-dark/10 p-3 bg-white">
            <div className="flex items-center gap-2 text-secondary font-semibold text-sm mb-1">
              <IoTimeOutline />
              <span>Today</span>
            </div>
            <div className="text-sm text-dark/90">{todayHours}</div>
            {lunchTime && <div className="text-xs text-dark/70 mt-1">Lounas: {lunchTime}</div>}
          </div>
        )}

        {priceLevel && (
          <div className="rounded-xl border border-dark/10 p-3 bg-white">
            <div className="flex items-center gap-2 text-secondary font-semibold text-sm mb-1">
              <IoPricetagsOutline />
              <span>Hinta</span>
            </div>
            <div className="text-sm text-dark/90">{priceLevel}</div>
          </div>
        )}
      </div>
    </>
  );
}

export default CardMetaGrid;
