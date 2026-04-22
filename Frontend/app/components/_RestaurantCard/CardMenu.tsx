


const CardMenu = ({ todayMenu = [] }: { todayMenu?: string[] }) => {
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