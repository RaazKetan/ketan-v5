import { useRef} from "react";
import { useLoaderEffects } from "../../Hooks";

export const Loader = () => {
  const loaderRef = useRef(null);
  const textRef = useRef(null);
  const count = useLoaderEffects({ loaderRef, textRef });
  return (
    <div ref={loaderRef} className="fixed top-0 left-0 z-10 text-center">
      {/* Your other content goes here */}{" "}
      <div
        className="fixed top-0 left-0 pointer-events-none text-sm translate-x-[-50%] translate-y-[-50%] text-[#333]"
        ref={textRef}
      >
        Loading {count}%
      </div>{" "}
    </div>
  );
};
