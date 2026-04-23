


const CardMenu = ({ todayMenu = [] }: { todayMenu?: string[] }) => {

  // CardMenu component is responsible for displaying the restaurant's menu for the current day. It takes an array of menu items as a prop and renders them in a visually appealing way. If there are no menu items available for today, it simply does not render anything, keeping the UI clean and focused on relevant information.
  return (
    <>
      {todayMenu.length > 0 && (
        <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-3">
          <div className="font-semibold text-sm text-secondary mb-2">Ruokalista tänään</div>
          <ul className="flex flex-col gap-2">
            {todayMenu.map((item) => (
              <li key={item} className="text-sm text-dark/90 leading-snug bg-white/70 rounded-lg px-2 py-1">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default CardMenu;