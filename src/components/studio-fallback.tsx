export function StudioFallback() {
  return (
    <div className="mx-auto w-full px-4 pt-6 pb-10 sm:pt-8">
      <div className="flip-scene">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl max-md:min-h-[26rem]">
          <div className="paper-sheet">
            <div className="paper-body animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
