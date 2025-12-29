
import React from "react";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated } from "react-spring";



export default function DraggableImage({ img, idx, style, layouts, setLayouts, activeLayout, toolMode }) {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  const bind = useDrag(
    ({ down, movement: [mx, my], cancel, event }) => {
      // Long press activation for mobile
      if (event.pointerType === "touch" && !down) return;

      if (down) {
        api.start({ x: mx, y: my, immediate: true });
      } else {
        api.start({ x: 0, y: 0 }); // Reset position after drop

        // Update layout positions
        if (toolMode === "frame") {
          setLayouts((prev) => {
            const newLayouts = { ...prev };
            const active = { ...newLayouts[activeLayout] };
            const newItems = [...active.items];
            const targetItem = { ...newItems[idx] };

            const rect = document.querySelector(".relative").getBoundingClientRect();
            const dxPct = (mx / rect.width) * 100;
            const dyPct = (my / rect.height) * 100;

            targetItem.left = `${parseFloat(targetItem.left) + dxPct}%`;
            targetItem.top = `${parseFloat(targetItem.top) + dyPct}%`;

            newItems[idx] = targetItem;
            active.items = newItems;
            newLayouts[activeLayout] = active;
            return newLayouts;
          });
        }
      }
    },
    {
      filterTaps: true,
      delay: 500, // ✅ Long press activation (500ms)
    }
  );

  return (
    <animate.div
      {...bind()}
      style={{
        ...style.container,
        x,
        y,
        touchAction: "none",
        position: "absolute",
        zIndex: 999,
      }}
      className="group"
    >
      <div className="w-full h-full overflow-hidden relative shadow-xl hover:shadow-indigo-500/20 transition-shadow">
        {img ? (
          <>
            <img
              src={img}
              draggable={false}
              className="w-full h-full object-cover pointer-events-none select-none"
              style={style.image}
            />
            {/* Quick Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {/* Buttons same as your existing code */}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center border-2 border-dashed border-zinc-700">
            <span className="text-[10px] text-zinc-500">Empty Frame</span>
          </div>
        )}
      </div>
    </animate.div>
  );
}
