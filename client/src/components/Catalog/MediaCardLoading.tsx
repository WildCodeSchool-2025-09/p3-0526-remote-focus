function MediaCardLoading() {
  return (
    <>
      <div className="carousel-item flex flex-col">
        <div className="skeleton h-60 w-[152px] mt-12 ml-2 mr-8" />
        <div className="skeleton h-4 w-32 mt-1 ml-4 mr-8" />
        <div className="skeleton h-2 w-32 mt-1 ml-4 mr-8" />
      </div>
    </>
  );
}

export default MediaCardLoading;
