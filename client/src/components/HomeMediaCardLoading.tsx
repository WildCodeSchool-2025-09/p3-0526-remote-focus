function HomeMediaCardLoading() {
  return (
    <div className="carousel-item flex w-40 shrink-0 flex-col gap-2">
      <div className="skeleton aspect-[2/3] w-full rounded-box" />
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-3 w-24" />
    </div>
  );
}

export default HomeMediaCardLoading;
